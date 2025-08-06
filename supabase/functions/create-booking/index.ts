// supabase/functions/create-booking/index.ts

import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { GoogleApis } from "https://esm.sh/googleapis@118";

serve(async (req) => {
  // Handle CORS
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
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Insert into bookings
    const { error } = await supabase.from("bookings").insert({
      client_id,
      customer_name,
      customer_email,
      service_name,
      start_time,
      end_time,
    });

    if (error) throw error;

    // Fetch business owner email
    const { data: client } = await supabase
      .from("clients")
      .select("business_name, email")
      .eq("id", client_id)
      .single();

    // Gmail API setup
    const key = JSON.parse(Deno.env.get("GOOGLE_SERVICE_ACCOUNT_KEY")!);
    const jwt = new GoogleApis().auth.JWT({
      email: key.client_email,
      key: key.private_key,
      scopes: ["https://www.googleapis.com/auth/gmail.send"],
    });
    await jwt.authorize();

    const gmail = new GoogleApis({ auth: jwt }).gmail("v1");

    // Build email message (RFC 2822 format base64)
    const encodeMessage = (to: string, subject: string, body: string) =>
      btoa([
        `To: ${to}`,
        `Subject: ${subject}`,
        `Content-Type: text/plain; charset=utf-8`,
        "",
        body,
      ].join("\n")).replace(/\+/g, "-").replace(/\//g, "_");

    // Send email to customer
    await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodeMessage(
          customer_email,
          `Booking Confirmation with ${client.business_name}`,
          `Hi ${customer_name},\n\nYour appointment for "${service_name}" is confirmed:\n\nDate: ${new Date(start_time).toLocaleString()}\n\nThank you!`
        ),
      },
    });

    // Send email to business owner
    await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodeMessage(
          client.email,
          `New Booking: ${service_name}`,
          `A new booking has been made:\n\nName: ${customer_name}\nEmail: ${customer_email}\nService: ${service_name}\nTime: ${new Date(start_time).toLocaleString()}`
        ),
      },
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });

  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
