import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
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

    const [listRes, membersRes] = await Promise.all([
      fetch(`${base}/lists/${audienceId}`, { headers: { Authorization: auth } }),
      fetch(
        `${base}/lists/${audienceId}/members?count=10&sort_field=timestamp_opt&sort_dir=DESC`,
        { headers: { Authorization: auth } },
      ),
    ]);

    const listJson = await listRes.json().catch(() => ({}));
    const membersJson = await membersRes.json().catch(() => ({}));

    if (!listRes.ok || !membersRes.ok) {
      console.error("Mailchimp error:", listRes.status, membersRes.status, listJson, membersJson);
      return new Response(
        JSON.stringify({
          error:
            (listJson as { detail?: string })?.detail ||
            (membersJson as { detail?: string })?.detail ||
            "Failed to fetch subscribers.",
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const total: number = listJson?.stats?.member_count ?? 0;
    const members = (membersJson?.members ?? []).map((m: {
      email_address: string;
      timestamp_opt?: string;
      timestamp_signup?: string;
    }) => ({
      email: m.email_address,
      subscribed_at: m.timestamp_opt || m.timestamp_signup || "",
    }));

    return new Response(JSON.stringify({ total, members }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("get-mailchimp-subscribers error:", err);
    return new Response(JSON.stringify({ error: "Unexpected error." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
