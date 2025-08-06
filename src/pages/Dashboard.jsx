import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Dashboard() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const loadAppointments = async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      const { data: client } = await supabase
        .from("clients")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!client) return;

      const { data: bookings } = await supabase
        .from("bookings")
        .select("*")
        .eq("client_id", client.id)
        .gte("start_time", new Date().toISOString())
        .order("start_time", { ascending: true });

      setAppointments(bookings || []);
    };

    loadAppointments();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-indigo-700">📅 Upcoming Appointments</h1>

      {appointments.length === 0 ? (
        <p className="text-gray-500">No upcoming bookings.</p>
      ) : (
        <div className="bg-white rounded shadow divide-y">
          {appointments.map((a) => (
            <div key={a.id} className="p-4">
              <p className="font-semibold">{a.customer_name}</p>
              <p>{a.service_name}</p>
              <p className="text-sm text-gray-600">
                {new Date(a.start_time).toLocaleString()} –{" "}
                {new Date(a.end_time).toLocaleTimeString()}
              </p>
              <p className="text-sm text-gray-500">{a.customer_email}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
