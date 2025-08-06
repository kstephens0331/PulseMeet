import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const { code, redirect_uri, user_id } = await req.json();

    if (!code || !redirect_uri || !user_id) {
      return new Response(JSON.stringify({ success: false, message: "Missing parameters" }), { status: 400 });
    }

    const client_id = Deno.env.get("GOOGLE_CLIENT_ID")!;
    const client_secret = Deno.env.get("GOOGLE_CLIENT_SECRET")!;
    const supabase_url = Deno.env.get("SUPABASE_URL")!;
    const supabase_key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabase_url, supabase_key);

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id,
        client_secret,
        redirect_uri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      console.error("Token exchange failed:", tokenData);
      return new Response(JSON.stringify({ success: false, message: "OAuth exchange failed" }), { status: 500 });
    }

    const { access_token, refresh_token, expires_in } = tokenData;

    const { error } = await supabase
      .from("linked_calendars")
      .upsert({
        client_id: user_id,
        platform: "google",
        access_token,
        refresh_token,
        token_expires_in: expires_in,
      });

    if (error) {
      console.error("Supabase error:", error);
      return new Response(JSON.stringify({ success: false, message: "Database error" }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ success: false, message: "Unexpected server error" }), { status: 500 });
  }
});