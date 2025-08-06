import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function CalendarCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Connecting to Google Calendar...");

  useEffect(() => {
    const code = params.get("code");
    if (!code) {
      setStatus("❌ No authorization code found.");
      return;
    }

    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calendar-oauth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus("✅ Google Calendar connected!");
        } else {
          setStatus("❌ Failed to connect Google Calendar.");
        }

        // Redirect after 2 seconds
        setTimeout(() => navigate("/dashboard/settings"), 2000);
      })
      .catch((err) => {
        console.error("OAuth Error:", err);
        setStatus("❌ An error occurred during connection.");
        setTimeout(() => navigate("/dashboard/settings"), 2000);
      });
  }, [params, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 text-lg font-medium">
      <p>{status}</p>
    </div>
  );
}
