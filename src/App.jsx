import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TutorChatListener from "./components/TutorChatListener";
import NavBar from './components/NavBar'
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProfileTabs from "./pages/ProfileTabs";
import AvailabilityCalendar from "./pages/AvailabilityCalendar";
import Banks from "./pages/Banks";
import Addresses from "./pages/Addresses";
import Documents from "./pages/Documents";
import PersonalInfo from "./pages/PersonalInfo";
import Fees from "./pages/Fees";

export default function App() {
  const tutorId = localStorage.getItem("tutorId");
  console.log(tutorId);
  return (
      <>
        <TutorChatListener tutorId={tutorId} />
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
              <Route path="/addresses" element={<Addresses />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/availability" element={<AvailabilityCalendar />} />
              <Route path="/fees" element={<Fees />} />
              <Route path="/personal" element={<PersonalInfo />} />
            </Routes>
          </div>
        </div>
      </>
  );
}
