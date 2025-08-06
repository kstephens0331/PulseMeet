import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; 

export default function BookingPage() {
  const { slug } = useParams();
  const [client, setClient] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  // Fetch branding + services
  useEffect(() => {
    const load = async () => {
      const { data: clientData } = await supabase
        .from("clients")
        .select("*")
        .eq("slug", slug)
        .single();

      if (clientData) {
        setClient(clientData);

        const { data: serviceList } = await supabase
          .from("services")
          .select("*")
          .eq("client_id", clientData.id);

        setServices(serviceList || []);
      }
    };
    load();
  }, [slug]);

  const fetchSlots = async () => {
  if (!selectedService || !selectedDate) return;

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-availability`,
    {
      method: "POST", // ✅ Make sure this is POST
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: client.id,
        date: selectedDate,
        service_minutes: selectedService.duration_minutes,
      }),
    }
  );

  const result = await res.json();
  if (result.success) setSlots(result.slots);
  else setSlots([]);
};

  const handleBooking = async () => {
    if (!selectedSlot || !selectedService || !name || !email) return;

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-booking`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: client.id,
          customer_name: name,
          customer_email: email,
          service_name: selectedService.name,
          start_time: selectedSlot.start,
          end_time: selectedSlot.end,
        }),
      }
    );

    const result = await res.json();
    if (result.success) setStatus("✅ Booking confirmed!");
    else setStatus("❌ Error booking appointment.");
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50 text-center">
      {client && (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-bold mb-2 text-primary">
            Book with {client.business_name}
          </h1>

          <div className="space-y-4 mt-4 text-left">
            {/* Service Selection */}
            <div>
              <label className="block font-semibold mb-1">Choose a service</label>
              <select
                value={selectedService?.id || ""}
                onChange={(e) =>
                  setSelectedService(
                    services.find((s) => s.id === parseInt(e.target.value))
                  )
                }
                className="w-full border rounded px-4 py-2"
              >
                <option value="">-- Select --</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.duration_minutes} mins)
                  </option>
                ))}
              </select>
            </div>

            {/* Date Selection */}
            <div>
  <label className="block font-semibold mb-1">Select a date</label>
  <Calendar
    onChange={(date) => {
      const iso = new Date(date).toISOString().split("T")[0];
      setSelectedDate(iso);
    }}
    value={new Date(selectedDate || Date.now())}
    className="border rounded-md w-full"
  />
  <button
    className="mt-2 text-sm text-blue-600 underline"
    onClick={fetchSlots}
  >
    Check availability
  </button>
</div>

            {/* Time Slot Selection */}
            {slots.length > 0 && (
              <div>
                <label className="block font-semibold mb-1">Available times</label>
                <div className="flex flex-wrap gap-2">
                  {slots.map((slot, i) => (
                    <button
                      key={i}
                      className={`px-3 py-1 rounded border ${
                        selectedSlot?.start === slot.start
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100"
                      }`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {new Date(slot.start).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Name/Email Input */}
            <div>
              <label className="block font-semibold mb-1">Your Name</label>
              <input
                className="w-full border px-4 py-2 rounded"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Email</label>
              <input
                className="w-full border px-4 py-2 rounded"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Book Button */}
            <button
              onClick={handleBooking}
              className="w-full mt-4 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
            >
              Book Appointment
            </button>

            {/* Booking Status */}
            {status && <p className="text-center mt-2">{status}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
