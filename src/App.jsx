import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Signup from './pages/Signup'
import Login from './pages/Login'
import DashboardLayout from "./components/DashboardLayout"
import Dashboard from "./pages/Dashboard"
import Settings from './pages/Settings'
import BookingPage from "./pages/BookingPage"
import CalendarCallback from "./pages/CalendarCallback";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/calendar-callback" element={<CalendarCallback />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* ✅ Public Booking Route */}
        <Route path="/:slug" element={<BookingPage />} />
      </Routes>
    </Router>
  )
}

export default App
