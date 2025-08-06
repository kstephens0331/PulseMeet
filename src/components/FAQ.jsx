export default function FAQ() {
  const faqs = [
    {
      question: "Can I customize my booking page?",
      answer: "Yes, PulseMeet allows you to upload your logo, set colors, and configure services.",
    },
    {
      question: "Does it integrate with Google Calendar?",
      answer: "Yes. Once connected, all bookings will sync automatically in real-time.",
    },
    {
      question: "Is there a free plan?",
      answer: "Yes, you can use up to 3 services on the free tier and upgrade anytime.",
    },
  ];

  return (
    <section className="py-20 px-6 bg-gray-50" id="faq">
      <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
      <div className="max-w-4xl mx-auto space-y-6">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white p-6 rounded shadow" data-aos="fade-up">
            <h4 className="text-lg font-semibold mb-2 text-indigo-600">{faq.question}</h4>
            <p className="text-gray-700">{faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
