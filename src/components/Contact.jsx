import { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";

export default function Contact() {
  const [captcha, setCaptcha] = useState(null);
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");

    if (!captcha) {
      setStatus("⚠️ Please complete the reCAPTCHA.");
      return;
    }

    const formData = new FormData(e.target);
    const endpoint = "https://formspree.io/f/meokzgrj"; // <-- replace this

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      if (res.ok) {
        setStatus("✅ Message sent! We'll be in touch.");
        e.target.reset();
        setCaptcha(null);
      } else {
        setStatus("❌ Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Network error. Please try again.");
    }
  };

  return (
    <section className="py-20 px-6 bg-white" id="contact">
      <h2 className="text-3xl font-bold text-center mb-10">Contact Us</h2>
      <form
        className="max-w-xl mx-auto bg-gray-50 p-8 rounded-lg shadow space-y-6"
        onSubmit={handleSubmit}
        data-aos="fade-up"
      >
        <input
          type="text"
          name="name"
          placeholder="Name"
          required
          className="w-full p-3 border rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          className="w-full p-3 border rounded"
        />
        <textarea
          name="message"
          placeholder="Message"
          required
          className="w-full p-3 border rounded h-32 resize-none"
        ></textarea>

        <ReCAPTCHA
          sitekey="YOUR_SITE_KEY" // <-- replace this
          onChange={(token) => setCaptcha(token)}
        />

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-3 rounded hover:bg-indigo-700"
        >
          Send Message
        </button>

        {status && <p className="text-center text-sm pt-2">{status}</p>}
      </form>
    </section>
  );
}
