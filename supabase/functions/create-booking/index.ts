import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  // CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Invalid method" }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  try {
    const body = await req.json();
    const { client_id, customer_name, customer_email, service_name, start_time, end_time } = body;

    if (!client_id || !customer_name || !customer_email || !service_name || !start_time || !end_time) {
      return new Response(JSON.stringify({ success: false, error: "Missing fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Insert booking
    const { error } = await supabase.from("bookings").insert({
      client_id,
      customer_name,
      customer_email,
      service_name,
      start_time,
      end_time,
    });
    if (error) throw error;

    // Get client email
    const { data: client } = await supabase
      .from("clients")
      .select("business_name, email")
      .eq("id", client_id)
      .single();
    if (!client) throw new Error("Client not found");

    // ---- Manual Gmail Send (via service account access token) ---- //
    const serviceKey = JSON.parse(Deno.env.get("GOOGLE_SERVICE_ACCOUNT_KEY")!);

    const jwtHeader = {
      alg: "RS256",
      typ: "JWT",
    };

    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 3600;

    const jwtClaimSet = {
      iss: serviceKey.client_email,
      scope: "https://www.googleapis.com/auth/gmail.send",
      aud: "https://oauth2.googleapis.com/token",
      exp,
      iat,
    };

    function base64url(str: string) {
      return btoa(str).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    }

    const encoder = new TextEncoder();
    const encodedHeader = base64url(JSON.stringify(jwtHeader));
    const encodedClaim = base64url(JSON.stringify(jwtClaimSet));
    const signatureInput = `${encodedHeader}.${encodedClaim}`;

    const keyData = await crypto.subtle.importKey(
      "pkcs8",
      new TextEncoder().encode(serviceKey.private_key),
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", keyData, encoder.encode(signatureInput));
    const signedJwt = `${signatureInput}.${base64url(String.fromCharCode(...new Uint8Array(signature)))}`;

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: signedJwt,
      }),
    });

    const tokenJson = await tokenRes.json();
    const accessToken = tokenJson.access_token;
    if (!accessToken) throw new Error("Failed to get access token");

    const encodeEmail = (to: string, subject: string, message: string) => {
      const raw = [
        `To: ${to}`,
        "Subject: " + subject,
        "Content-Type: text/plain; charset=utf-8",
        "",
        message,
      ].join("\n");

      return btoa(raw).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    };

    const sendEmail = async (to: string, subject: string, message: string) => {
      const raw = encodeEmail(to, subject, message);
      return await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw }),
      });
    };

    // Send both emails
    await sendEmail(
      customer_email,
      `Booking Confirmation with ${client.business_name}`,
      `Hi ${customer_name},\n\nYour appointment for "${service_name}" is confirmed:\n\nDate: ${new Date(start_time).toLocaleString()}\n\nThank you!`
    );

    await sendEmail(
      client.email,
      `New Booking: ${service_name}`,
      `A new booking has been made:\n\nName: ${customer_name}\nEmail: ${customer_email}\nService: ${service_name}\nTime: ${new Date(start_time).toLocaleString()}`
    );

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
