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
    const serverPrefix = Deno.env.get("MAILCHIMP_SERVER_PREFIX");

    if (!apiKey || !serverPrefix) {
      console.error("Missing Mailchimp configuration");
      return new Response(JSON.stringify({ error: "Server configuration error." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const auth = `apikey ${apiKey}`;
    const base = `https://${serverPrefix}.api.mailchimp.com/3.0`;

    const res = await fetch(
      `${base}/campaigns?count=5&sort_field=create_time&sort_dir=DESC`,
      { headers: { Authorization: auth } },
    );
    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("Mailchimp campaigns error:", res.status, json);
      return new Response(
        JSON.stringify({ error: json?.detail || "Failed to fetch campaigns." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const campaigns = (json?.campaigns ?? []).map((c: {
      id: string;
      web_id?: number;
      status: string;
      create_time?: string;
      send_time?: string;
      emails_sent?: number;
      settings?: { subject_line?: string; title?: string };
    }) => ({
      id: c.id,
      webId: c.web_id ?? null,
      subject: c.settings?.subject_line || c.settings?.title || "(no subject)",
      status: c.status,
      createTime: c.create_time || "",
      sendTime: c.send_time || "",
      emailsSent: c.emails_sent ?? 0,
    }));

    return new Response(JSON.stringify({ campaigns }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("get-mailchimp-campaigns error:", err);
    return new Response(JSON.stringify({ error: "Unexpected error." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
