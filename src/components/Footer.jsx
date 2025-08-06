export default function Footer() {
  return (
    <footer className="bg-gray-100 text-center py-6 text-sm text-gray-600 mt-auto">
      <div className="space-y-2">
        <p>&copy; {new Date().getFullYear()} PulseMeet by StephensCode LLC</p>
        <div className="space-x-4">
          <a href="#features" className="hover:underline">Features</a>
          <a href="#pricing" className="hover:underline">Pricing</a>
          <a href="/signup" className="hover:underline">Get Started</a>
        </div>
      </div>
    </footer>
  );
}
