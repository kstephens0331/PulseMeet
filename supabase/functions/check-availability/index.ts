import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  // 🔒 Handle CORS preflight request
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
    const { client_id, date, service_minutes } = body;

    if (!client_id || !date || !service_minutes) {
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

    // Step 1: Get working hours + buffer
    const { data: client } = await supabase
      .from("clients")
      .select("working_hours, buffer_minutes")
      .eq("id", client_id)
      .single();

    const buffer = client?.buffer_minutes || 15;
    const workingHours = client?.working_hours || {
      mon: ["09:00", "17:00"],
      tue: ["09:00", "17:00"],
      wed: ["09:00", "17:00"],
      thu: ["09:00", "17:00"],
      fri: ["09:00", "17:00"]
    };

    const weekday = new Date(date).toLocaleDateString("en-US", { weekday: "short" }).toLowerCase();
    const hours = workingHours[weekday];
    if (!hours) {
      return new Response(JSON.stringify({ success: true, slots: [] }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const [startStr, endStr] = hours;
    const startDate = new Date(`${date}T${startStr}:00`);
    const endDate = new Date(`${date}T${endStr}:00`);

    // Step 2: Get existing bookings
    const { data: existing } = await supabase
      .from("bookings")
      .select("start_time, end_time")
      .eq("client_id", client_id)
      .gte("start_time", startDate.toISOString())
      .lte("end_time", endDate.toISOString());

    const bookings = existing || [];

    // Step 3: Generate slots
    const slots = [];
    let current = new Date(startDate);

    while (current.getTime() + service_minutes * 60000 <= endDate.getTime()) {
      const slotStart = new Date(current);
      const slotEnd = new Date(current.getTime() + service_minutes * 60000);

      const overlap = bookings.some(
        (b) =>
          new Date(b.start_time) < slotEnd &&
          new Date(b.end_time) > slotStart
      );

      if (!overlap) {
        slots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
        });
      }

      current = new Date(current.getTime() + (service_minutes + buffer) * 60000);
    }

    return new Response(JSON.stringify({ success: true, slots }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
