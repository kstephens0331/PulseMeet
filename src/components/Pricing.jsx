export default function Pricing() {
  return (
    <section className="py-20 px-6 bg-white text-center" id="pricing" data-aos="fade-up">
      <h2 className="text-3xl font-bold mb-10">Simple Pricing</h2>
      <div className="flex flex-col md:flex-row gap-8 justify-center max-w-4xl mx-auto">
        <div className="border rounded-xl p-8 w-full md:w-1/2 shadow">
          <h3 className="text-2xl font-semibold mb-4">Free Plan</h3>
          <p className="text-gray-600 mb-6">Perfect for small businesses getting started.</p>
          <ul className="text-left mb-6 space-y-2">
            <li>✅ 3 Services</li>
            <li>✅ Google Calendar Sync</li>
            <li>✅ Custom Branding</li>
            <li>❌ Analytics & Logs</li>
          </ul>
          <p className="text-xl font-bold mb-4">$0/mo</p>
          <a href="/signup" className="inline-block bg-accent text-white px-6 py-3 rounded hover:bg-orange-500">Start Free</a>
        </div>

        <div className="border-2 border-accent rounded-xl p-8 w-full md:w-1/2 shadow-lg">
          <h3 className="text-2xl font-semibold mb-4 text-accent">Pro Plan</h3>
          <p className="text-gray-600 mb-6">Everything you need — unlimited.</p>
          <ul className="text-left mb-6 space-y-2">
            <li>✅ Unlimited Services</li>
            <li>✅ Team Calendar Sync</li>
            <li>✅ Booking Logs & Analytics</li>
            <li>✅ Priority Support</li>
          </ul>
          <p className="text-xl font-bold mb-4">$5/mo</p>
          <a href="/signup" className="inline-block bg-accent text-white px-6 py-3 rounded hover:bg-orange-500">Upgrade Now</a>
        </div>
      </div>
    </section>
  )
}