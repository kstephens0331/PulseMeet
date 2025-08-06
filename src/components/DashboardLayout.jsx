import { useEffect, useState } from "react";
import { useNavigate, Outlet, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function DashboardLayout() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate("/login");
      else setUser(data.session.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
        navigate("/login");
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6 space-y-6 hidden md:block">
        <h2 className="text-xl font-bold text-indigo-600">PulseMeet</h2>
        <nav className="space-y-4">
          <Link to="/dashboard" className="block text-gray-700 hover:text-indigo-600">Home</Link>
          <Link to="/dashboard/settings" className="block text-gray-700 hover:text-indigo-600">Settings</Link>
        </nav>
        <button
          onClick={handleLogout}
          className="mt-10 bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200"
        >
          Logout
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
