import React from "react";
import { Link } from "react-router-dom";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 p-4 text-white flex justify-between">
        <h1 className="font-bold">Tutor Portal</h1>
        <div className="space-x-4">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/availability">Availability</Link>
          <Link to="/fees">Fees</Link>
          <Link to="/bank">Bank</Link>
        </div>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}