import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../services/authService'
import {
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const commonBtn =
    "flex items-center justify-center space-x-2 px-3 py-2 rounded-md font-semibold transition-colors";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(form);
    localStorage.setItem("access_token", res.accessToken);
    navigate("/dashboard");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-xl mb-4">Tutor Login</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow rounded w-96">
        <input
          type="text"
          placeholder="Username"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border p-2 mb-2 w-full"
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="border p-2 mb-4 w-full"
        />

        <button className={`${commonBtn} text-blue-600 hover:text-blue-800`}>
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <span>Login</span>
        </button>
      </form>
      <p className="mt-4">
        Don’t have an account? <Link to="/register" className="text-blue-600">Register</Link>
      </p>
    </div>
  );
}
