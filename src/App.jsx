import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from './components/NavBar'
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProfileTabs from "./pages/ProfileTabs";
import AvailabilityCalendar from "./pages/AvailabilityCalendar";
import Banks from "./pages/Banks";

export default function App() {
  return (
      <div>
        <NavBar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<ProfileTabs />} />
            <Route path="/banks" element={<Banks />} />
            <Route path="/availability" element={<AvailabilityCalendar />} />
          </Routes>
        </div>
      </div>
  );
}
