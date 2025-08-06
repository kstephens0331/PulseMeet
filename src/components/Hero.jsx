import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="bg-primary text-white px-6 py-20 text-center" data-aos="fade-up">
      <h1 className="text-4xl md:text-5xl font-bold mb-6">
        Your Booking System, <br /> Your Brand.
      </h1>
      <p className="text-lg md:text-xl mb-8">
        Launch your own customizable scheduling platform in minutes.
      </p>
      <div className="flex justify-center gap-4">
        <Link to="/signup">
          <button className="bg-accent px-6 py-3 rounded-lg text-white font-semibold shadow-lg hover:bg-orange-500">
            Start Free
          </button>
        </Link>
        <a href="#features" className="text-white underline mt-3 inline-block">
          See Features
        </a>
      </div>
    </section>
  )
}