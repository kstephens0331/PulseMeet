import { CalendarClock, Brush, Layers, ShieldCheck, Code } from 'lucide-react'

const features = [
  { icon: <CalendarClock />, title: 'Google Calendar Sync', desc: 'Real-time availability across all devices.' },
  { icon: <Brush />, title: 'Branded Experience', desc: 'Logo, colors, and public link match your business.' },
  { icon: <Layers />, title: 'Embed Anywhere', desc: 'Drop a single iframe into any website.' },
  { icon: <ShieldCheck />, title: 'No Double-Booking', desc: 'Smart rules + buffer protection.' },
  { icon: <Code />, title: 'Fully Developer Friendly', desc: 'Built to scale with Supabase + Edge Functions.' },
]

export default function Features() {
  return (
    <section id="features" className="py-20 px-6 bg-gray-50">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10" data-aos="fade-up">
        <h2 className="text-3xl font-bold mb-12">Everything You Need</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((f, idx) => (
            <div key={idx} className="bg-white p-6 rounded-lg shadow text-left">
              <div className="text-accent mb-3">{f.icon}</div>
              <h3 className="font-semibold text-xl mb-2">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}