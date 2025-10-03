import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../services/authService'
import {
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null)
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(form);
    localStorage.setItem("access_token", res.accessToken);
    navigate("/dashboard");
  };

  const commonBtn =
      "flex items-center justify-center space-x-2 px-3 py-2 rounded-md font-semibold transition-colors";

    return (
      <div className="max-w-md mx-auto mt-12 card">
        <h3 className="text-xl font-semibold mb-4">Tutor Portal Login</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input className="input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="mb-4">
            <input type="password" className="input" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          {error && <div className="text-red-600 mb-2">{error}</div>}
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