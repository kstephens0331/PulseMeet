import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "../assets/logo.jpg"; // Place your SVG/logo in assets

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <img src={logo} alt="PulseMeet Logo" className="h-12 w-auto" />
        <h1 className="text-xl font-bold text-indigo-600">PulseMeet</h1>
      </div>

      {/* Desktop Nav */}
      <nav className="hidden md:flex space-x-6">
        <a href="#features" className="text-gray-700 hover:text-indigo-600">Features</a>
        <a href="#pricing" className="text-gray-700 hover:text-indigo-600">Pricing</a>
        <Link to="/login" className="text-gray-700 hover:text-indigo-600">Login</Link>
        <Link to="/signup" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
          Start Free
        </Link>
      </nav>

      {/* Mobile Menu Icon */}
      <button onClick={() => setOpen(!open)} className="md:hidden text-gray-700">
        {open ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Mobile Nav Dropdown */}
      {open && (
        <div className="absolute top-full left-0 w-full bg-white border-t shadow-md flex flex-col py-4 px-6 md:hidden animate-slide-down">
          <a href="#features" onClick={() => setOpen(false)} className="py-2 text-gray-700 hover:text-indigo-600">Features</a>
          <a href="#pricing" onClick={() => setOpen(false)} className="py-2 text-gray-700 hover:text-indigo-600">Pricing</a>
            <Link to="/login" onClick={() => setOpen(false)} className="py-2 text-gray-700 hover:text-indigo-600">Login</Link>
          <Link to="/signup" onClick={() => setOpen(false)} className="mt-3 bg-indigo-600 text-white px-4 py-2 rounded text-center hover:bg-indigo-700">
            Start Free
          </Link>
        </div>
      )}
    </header>
  );
}
