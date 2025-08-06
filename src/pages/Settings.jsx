import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Settings() {
  const [business, setBusiness] = useState("");
  const [timezone, setTimezone] = useState("America/Chicago");
  const [status, setStatus] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      setUserId(user.id);

      const { data } = await supabase
        .from("clients")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setBusiness(data.business_name || "");
        setTimezone(data.timezone || "America/Chicago");
      }
    };

    loadSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase
      .from("clients")
      .update({ business_name: business, timezone })
      .eq("id", userId);

    if (error) setStatus("❌ Failed to save settings.");
    else setStatus("✅ Settings saved.");
  };

  // Handle Google OAuth redirect
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (code) {
      exchangeCode(code);
    }
  }, []);

  const exchangeCode = async (code) => {
    setStatus("🔄 Connecting Google Calendar...");

    try {
      const res = await fetch("https://icbeoeeiruyglkmbmggt.supabase.co/functions/v1/google-oauth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          redirect_uri: `${window.location.origin}/dashboard/settings`,
          user_id: userId,
        }),
      });

      const result = await res.json();
      if (result.success) {
        setStatus("✅ Google Calendar connected!");
      } else {
        setStatus("❌ Google Calendar connection failed.");
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Server error during calendar sync.");
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <h2 className="text-2xl font-bold text-indigo-700">Account Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block text-sm font-semibold mb-1">Business Name</label>
          <input
            type="text"
            value={business}
            onChange={(e) => setBusiness(e.target.value)}
            className="w-full border px-4 py-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Timezone</label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full border px-4 py-2 rounded"
          >
            {Intl.supportedValuesOf("timeZone").map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>

        {/* Optional: Logo upload UI placeholder */}
        <div>
          <label className="block text-sm font-semibold mb-1">Logo (coming soon)</label>
          <input type="file" disabled className="w-full border px-4 py-2 rounded bg-gray-100 cursor-not-allowed" />
        </div>

        <button
          type="submit"
          className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
        >
          Save Settings
        </button>
      </form>

<div className="pt-4 border-t mt-4">
  <h3 className="font-semibold text-sm mb-2">Calendar Integration</h3>
  <a
    href={`https://accounts.google.com/o/oauth2/v2/auth?client_id=${
      import.meta.env.VITE_GOOGLE_CLIENT_ID
    }&redirect_uri=${encodeURIComponent(
      import.meta.env.VITE_OAUTH_REDIRECT_URI || "http://localhost:5173/calendar-callback"
    )}&response_type=code&scope=${encodeURIComponent(
      "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly"
    )}&access_type=offline&prompt=consent`}
    className="inline-block bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm"
  >
    Connect Google Calendar
  </a>
</div>
    </div>
  );
}
