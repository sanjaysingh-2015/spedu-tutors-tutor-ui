import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/images/SpEduTutorLogo.png";
import {
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  UserIcon,
  BuildingLibraryIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ClockIcon,
  DocumentTextIcon,
  ClipboardDocumentIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'

export default function NavBar() {
  const token = localStorage.getItem("spedu_token");
  const userRole = localStorage.getItem("userRole");
  const loginAt = localStorage.getItem("loginAt");
  const loggedInUser = localStorage.getItem("loggedInUser");
  const profileCompleted = localStorage.getItem('profileCompleted')
  const initials = loggedInUser
    ? loggedInUser
        .split(" ")
        .map(word => word[0].toUpperCase())
        .slice(0, 2)
        .join("")
    : "";
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("spedu_token");
    navigate("/login");
  };

  const commonCircle =
    "w-14 h-14 rounded-full flex flex-col items-center justify-center text-xs font-medium shadow-md transition-colors";

  const isLoginPage = location.pathname === "/login";

  return (
    <div className="card flex justify-between items-center px-4 py-2">
      {/* Logo + Navigation */}
      <div className="flex items-center space-x-4">
        <Link to={token ? "/dashboard" : "/login"}>
          <img src={logo} alt="spEdu Tutors" className="h-16 mr-4" />
        </Link>

        {/* Hide navigation links on login page */}
        {!isLoginPage && (
          <div className="flex space-x-4">
            {profileCompleted === "false" ? (
              <>
                <Link to="/profile" className={`${commonCircle} bg-blue-100 text-blue-700 hover:bg-blue-200`}>
                  <UserIcon className="w-6 h-6" />
                  <span>Profile</span>
                </Link>
              </>
            ): <></>}
            {profileCompleted === "true" ? (
              <>
                <Link to="/personal" className={`${commonCircle} bg-blue-100 text-blue-700 hover:bg-blue-200`}>
                  <UserIcon className="w-6 h-6" />
                  <span>Me</span>
                </Link>
                <Link to="/addresses" className={`${commonCircle} bg-orange-100 text-orange-700 hover:bg-orange-200`}>
                  <MapPinIcon className="w-6 h-6" />
                  <span>Add</span>
                </Link>

                <Link to="/documents" className={`${commonCircle} bg-zinc-100 text-zinc-700 hover:bg-zinc-200`}>
                  <DocumentTextIcon className="w-6 h-6" />
                  <span>Docs</span>
                </Link>

                <Link to="/banks" className={`${commonCircle} bg-yellow-100 text-yellow-700 hover:bg-yellow-200`}>
                  <BuildingLibraryIcon className="w-6 h-6" />
                  <span>Banks</span>
                </Link>

                <Link to="/fees" className={`${commonCircle} bg-green-100 text-green-700 hover:bg-green-200`}>
                  <CurrencyDollarIcon className="w-6 h-6" />
                  <span>Fees</span>
                </Link>

                <Link to="/availability" className={`${commonCircle} bg-purple-100 text-purple-700 hover:bg-purple-200`}>
                  <CalendarDaysIcon className="w-6 h-6" />
                  <span>Slot</span>
                </Link>

                <Link to="/metrics" className={`${commonCircle} bg-pink-100 text-pink-700 hover:bg-pink-200`}>
                  <ClockIcon className="w-6 h-6" />
                  <span>Sessions</span>
                </Link>
              </>) : <></>}
          </div>
        )}
      </div>

      {/* Right side buttons (Logout + Profile Info) */}
      <div className="flex items-center space-x-4">
        {!isLoginPage && token && (
          <>
            <button
              onClick={handleLogout}
              className="flex flex-col items-center space-y-1 focus:outline-none hover:opacity-80 transition"
            >
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                {initials}
              </span>
              <span className="text-[0.9rem] text-blue-700 text-center">{loggedInUser}</span>
              <span className="text-[0.5rem] text-green-800 text-center">
                Logged in at: {loginAt}
              </span>
            </button>
          </>
        )}

        {!isLoginPage && !token && (
          <Link
            to="/login"
            className={`${commonCircle} bg-blue-100 text-blue-700 hover:bg-blue-200`}
          >
            <ArrowLeftOnRectangleIcon className="w-6 h-6" />
            <span>Login</span>
          </Link>
        )}
      </div>
    </div>
  );
}
