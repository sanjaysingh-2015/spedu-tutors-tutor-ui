import React, { useState } from "react";
import { register } from "../services/authService";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ name: "", password: "", email: "", phoneNo: "", role: "TUTOR" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await register(form);
    navigate("/login");
  };

  return (
    <div className="flex flex-col justify-center h-screen">
      <h2 className="text-xl mb-4">Tutor Register</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow rounded w-96">
        <input type="text" placeholder="User Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border p-2 mb-2 w-full" />
        <input type="email" placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border p-2 mb-2 w-full" />
        <input type="text" placeholder="Phone Number"
          value={form.phoneNo}
          onChange={(e) => setForm({ ...form, phoneNo: e.target.value })}
          className="border p-2 mb-2 w-full" />
        <input type="password" placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="border p-2 mb-4 w-full" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Register
        </button>
      </form>
    </div>
  );
}
