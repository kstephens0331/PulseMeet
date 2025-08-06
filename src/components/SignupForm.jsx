import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      navigate("/login"); // Or confirmation screen
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSignup}
      className="max-w-md mx-auto bg-white p-6 rounded shadow-md space-y-4"
    >
      <h2 className="text-2xl font-bold text-center text-indigo-600">Sign Up</h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded text-sm">{error}</div>
      )}

      <div>
        <label className="block text-gray-700 mb-1">Email</label>
        <input
          type="email"
          className="w-full px-4 py-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-gray-700 mb-1">Password</label>
        <input
          type="password"
          className="w-full px-4 py-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
      >
        {loading ? "Creating..." : "Create Account"}
      </button>
    </form>
  );
}
