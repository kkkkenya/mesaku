import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// The body may already include simple HTML tags inserted via the toolbar
// (<strong>, <em>, <h2>, <ul><li>, <blockquote>, <a>). We preserve those
// by replacing newlines with <br /> without escaping.
const renderBody = (body: string) => body.replace(/\r?\n/g, "<br />");

const buildHtml = (subject: string, body: string, imageUrl?: string) => {
  const safeSubject = escapeHtml(subject);
  const safeBody = renderBody(body);
  const imageBlock = imageUrl
    ? `<tr>
            <td style="padding:0;text-align:center;background:#ffffff;">
              <img src="${escapeHtml(imageUrl)}" alt="Newsletter image" style="display:block;width:100%;max-width:600px;height:auto;border:0;outline:none;text-decoration:none;" />
            </td>
          </tr>`
    : "";

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f4f7;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:24px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;">
            <tr>
              <td style="background:#1E3A8A;padding:24px;text-align:center;">
                <h1 style="margin:0;color:#ffffff;font-size:22px;font-family:Georgia,serif;">MESA KU Newsletter</h1>
                <p style="margin:6px 0 0;color:#D4A017;font-size:13px;letter-spacing:1px;text-transform:uppercase;">${safeSubject}</p>
              </td>
            </tr>
            ${imageBlock}
            <tr>
              <td style="padding:32px 28px;line-height:1.6;font-size:15px;color:#1f2937;">
                ${safeBody}
              </td>
            </tr>
            <tr>
              <td style="background:#f9fafb;padding:18px 28px;text-align:center;font-size:12px;color:#6b7280;border-top:1px solid #e5e7eb;">
                You are receiving this because you subscribed to MESA KU updates at
                <a href="https://mesaku.lovable.app" style="color:#1E3A8A;text-decoration:none;">mesaku.lovable.app</a>.
                <br /><br />
                <a href="*|UNSUB|*" style="color:#6b7280;text-decoration:underline;">Unsubscribe</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Auth: require a logged-in admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdminData, error: isAdminErr } = await supabase.rpc("is_admin");
    if (isAdminErr || !isAdminData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = await req.json().catch(() => ({}));
    const campaignName = String(payload?.campaignName ?? "").trim();
    const subject = String(payload?.subject ?? "").trim();
    const previewText = String(payload?.previewText ?? "").trim();
    const body = String(payload?.body ?? "").trim();
    const draft = Boolean(payload?.draft);
    const testEmail = Boolean(payload?.testEmail);
    const testEmailAddress = String(payload?.testEmailAddress ?? "").trim();
    const imageUrl = String(payload?.imageUrl ?? "").trim();

    if (!campaignName || campaignName.length > 200) {
      return new Response(JSON.stringify({ error: "Campaign name is required (max 200 chars)." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!subject || subject.length > 200) {
      return new Response(JSON.stringify({ error: "Subject line is required (max 200 chars)." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!body || body.length < 5) {
      return new Response(JSON.stringify({ error: "Message body is required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (body.length > 50000) {
      return new Response(JSON.stringify({ error: "Message body is too long." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (imageUrl && imageUrl.length > 1000) {
      return new Response(JSON.stringify({ error: "Image URL is too long." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (testEmail) {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!testEmailAddress || !emailRe.test(testEmailAddress)) {
        return new Response(JSON.stringify({ error: "Valid test email address is required." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const apiKey = Deno.env.get("MAILCHIMP_API_KEY");
    const audienceId = Deno.env.get("MAILCHIMP_AUDIENCE_ID");
    const serverPrefix = Deno.env.get("MAILCHIMP_SERVER_PREFIX");

    if (!apiKey || !audienceId || !serverPrefix) {
      console.error("Missing Mailchimp configuration");
      return new Response(JSON.stringify({ error: "Server configuration error." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const auth = `apikey ${apiKey}`;
    const base = `https://${serverPrefix}.api.mailchimp.com/3.0`;

    // Step 1: Create campaign
    const createRes = await fetch(`${base}/campaigns`, {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "regular",
        recipients: { list_id: audienceId },
        settings: {
          subject_line: subject,
          preview_text: previewText,
          title: testEmail ? `[TEST] ${campaignName}` : campaignName,
          from_name: "MESA KU",
          reply_to: "gregorykimemiah@gmail.com",
        },
      }),
    });
    const createJson = await createRes.json().catch(() => ({}));
    if (!createRes.ok || !createJson?.id) {
      console.error("Create campaign failed:", createRes.status, createJson);
      return new Response(
        JSON.stringify({ error: createJson?.detail || "Failed to create campaign." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const campaignId = createJson.id as string;

    // Step 2: Set content
    const html = buildHtml(subject, body, imageUrl || undefined);
    const contentRes = await fetch(`${base}/campaigns/${campaignId}/content`, {
      method: "PUT",
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: JSON.stringify({ html }),
    });
    if (!contentRes.ok) {
      const contentJson = await contentRes.json().catch(() => ({}));
      console.error("Set content failed:", contentRes.status, contentJson);
      return new Response(
        JSON.stringify({ error: contentJson?.detail || "Failed to set campaign content." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Step 3: Test send OR full send (or draft = do nothing else)
    if (testEmail) {
      const testRes = await fetch(`${base}/campaigns/${campaignId}/actions/test`, {
        method: "POST",
        headers: { Authorization: auth, "Content-Type": "application/json" },
        body: JSON.stringify({
          test_emails: [testEmailAddress],
          send_type: "html",
        }),
      });
      if (!testRes.ok) {
        const testJson = await testRes.json().catch(() => ({}));
        console.error("Test send failed:", testRes.status, testJson);
        return new Response(
          JSON.stringify({
            error: testJson?.detail || "Campaign created but failed to send test email.",
            campaignId,
          }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      return new Response(
        JSON.stringify({ success: true, campaignId, testEmail: true, sentTo: testEmailAddress }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!draft) {
      const sendRes = await fetch(`${base}/campaigns/${campaignId}/actions/send`, {
        method: "POST",
        headers: { Authorization: auth },
      });
      if (!sendRes.ok) {
        const sendJson = await sendRes.json().catch(() => ({}));
        console.error("Send campaign failed:", sendRes.status, sendJson);
        return new Response(
          JSON.stringify({
            error: sendJson?.detail || "Campaign created but failed to send.",
            campaignId,
          }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    return new Response(JSON.stringify({ success: true, campaignId, draft }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-mailchimp-campaign error:", err);
    return new Response(JSON.stringify({ error: "Unexpected error." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
