import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/images/SpEduTutorLogo.png";
import {
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  Bars3BottomLeftIcon,
  BanknotesIcon,
  TrophyIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  UserIcon,
  Squares2X2Icon,
  ChartBarIcon
} from "@heroicons/react/24/outline";

export default function NavBar() {
  const token = localStorage.getItem("spedu_token");
  const userRole = localStorage.getItem("userRole");
  const loginAt = localStorage.getItem("loginAt");
  const loggedInUser = localStorage.getItem("loggedInUser");
  const initials = loggedInUser
          .split(" ")
          .map(word => word[0].toUpperCase())
          .slice(0, 2)
          .join("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("spedu_token");
    navigate("/login");
  };

  const commonBtn =
    "flex items-center justify-center space-x-2 px-3 py-2 rounded-md font-semibold transition-colors";

  const isLoginPage = location.pathname === "/login";

  return (
    <div className="card flex justify-between items-center">
      {/* Logo */}
      <div className="flex items-center space-x-4">
        <Link to={token ? "/dashboard" : "/login"} className="font-bold text-lg">
          <img src={logo} alt="spEdu Tutors" className="h-16 mb-2 mr-4" />
        </Link>

        {/* Hide navigation links on login page */}
        {!isLoginPage && (
          <>
          <div className="px-4 py-4 bg-white border-l border-b border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-100 shadow-[-4px_4px_6px_rgba(0,0,0,0.1)]">
            <div className="flex space-x-6 justify-center">
              <Link
                to="/roles"
                className="flex flex-col items-center justify-center px-2 text-sm text-gray-600"
              >
                <ShieldCheckIcon className="w-5 h-5" />
                <span>Roles</span>
              </Link>
              <Link
                to="/users"
                className="flex flex-col items-center justify-center px-2 text-sm text-gray-600"
              >
                <UserGroupIcon className="w-5 h-5" />
                <span>Users</span>
              </Link>
            </div>
          </div>
          <div className="px-4 py-4 bg-white border-l border-b border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-100 shadow-[-4px_4px_6px_rgba(0,0,0,0.1)]">
            <div className="flex space-x-6 justify-center">
            <Link to="/levels" className="flex flex-col items-center justify-center px-2 text-sm text-gray-600">
              <Bars3BottomLeftIcon className="w-5 h-5" />
              <span>Levels</span>
            </Link>
            <Link to="/fees" className="flex flex-col items-center justify-center px-2 text-sm text-gray-600">
              <BanknotesIcon className="w-5 h-5" />
              <span>Fees</span>
            </Link>
            </div>
          </div>
          <div className="px-4 py-4 bg-white border-l border-b border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-100 shadow-[-4px_4px_6px_rgba(0,0,0,0.1)]">
            <div className="flex space-x-6 justify-center">
            <Link to="/metric-categories" className="flex flex-col items-center justify-center px-2 text-sm text-gray-600">
              <Squares2X2Icon className="w-5 h-5" />
              <span>Matric Category</span>
            </Link>
            <Link to="/metrics" className="flex flex-col items-center justify-center px-2 text-sm text-gray-600">
              <ChartBarIcon className="w-5 h-5" />
              <span>Matric</span>
            </Link>
            <Link to="/gamification" className="flex flex-col items-center justify-center px-2 text-sm text-gray-600">
              <TrophyIcon className="w-5 h-5" />
              <span>Gamification</span>
            </Link>
            </div>
          </div>
          <div className="px-4 py-4 bg-white border-l border-b border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-100 shadow-[-4px_4px_6px_rgba(0,0,0,0.1)]">
            <div className="flex space-x-6 justify-center">
            <Link to="/tutors" className="flex flex-col items-center justify-center px-2 text-sm text-gray-600">
              <AcademicCapIcon className="w-5 h-5" />
              <span>Tutors</span>
            </Link>
            <Link to="/tutor-fees" className="flex flex-col items-center justify-center px-2 text-sm text-gray-600">
              <CurrencyDollarIcon className="w-5 h-5" />
              <span>Tutor Fees</span>
            </Link>
            </div>
          </div>
          <div className="px-4 py-4 bg-white border-l border-b border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-100 shadow-[-4px_4px_6px_rgba(0,0,0,0.1)]">
            <div className="flex space-x-6 justify-center">
            <Link to="/students" className="flex flex-col items-center justify-center px-2 text-sm text-gray-600">
              <UserIcon className="w-5 h-5" />
              <span>Students</span>
            </Link>
            </div>
          </div>
          <div className="px-4 py-4 bg-white border-l border-b border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-100 shadow-[-4px_4px_6px_rgba(0,0,0,0.1)]">
            <div className="flex space-x-6 justify-center">
                <button onClick={handleLogout }className="flex flex-col items-center justify-center px-2 text-sm text-red-600 hover:text-red-800">
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span>Logout</span>
                </button>
            </div>
          </div>
          </>
        )}
      </div>

      {/* Right side buttons */}
      <div>
        {!isLoginPage && token ? (
          <div className="flex flex-col items-center space-y-1">
            <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
              {initials}
            </span>
            <span className="text-[0.9rem] text-blue-700 text-center">{loggedInUser}</span>
            <span className="text-[0.7rem] text-orange-800 text-center"> As {userRole}</span>
            <span className="text-[0.5rem] text-green-800 text-center">Logged in at: {loginAt}</span>
          </div>
        ) : !isLoginPage && (
          <Link
            to="/login"
            className={`${commonBtn} text-blue-600 hover:text-blue-800`}
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            <span>Login</span>
          </Link>
        )}
      </div>
    </div>
  );
}
