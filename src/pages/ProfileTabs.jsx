import React, { useState } from "react";
import Layout from "../components/Layout";
import { createProfile, uploadResume } from "../services/tutorService";

export default function ProfileTabs() {
  const [tab, setTab] = useState("personal");
  const [form, setForm] = useState({ firstName: "", bio: "", skills: "" });
  const [file, setFile] = useState(null);

  const handleSubmit = async () => {
    await createProfile(form);
    if (file) await uploadResume(file);
    alert("Profile created");
  };

  return (
    <Layout>
      <h2 className="text-xl font-bold mb-4">Complete Your Profile</h2>
      <div className="flex space-x-4 mb-4">
        <button onClick={() => setTab("personal")} className={tab === "personal" ? "font-bold" : ""}>Personal Info</button>
        <button onClick={() => setTab("resume")} className={tab === "resume" ? "font-bold" : ""}>Resume</button>
        <button onClick={() => setTab("bank")} className={tab === "bank" ? "font-bold" : ""}>Bank Details</button>
      </div>
      {tab === "personal" && (
        <div>
          <input type="text" placeholder="First Name"
            value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            className="border p-2 mb-2 block" />
          <textarea placeholder="Bio"
            value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="border p-2 mb-2 block" />
          <input type="text" placeholder="Skills"
            value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })}
            className="border p-2 mb-2 block" />
        </div>
      )}
      {tab === "resume" && (
        <div>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} className="border p-2 mb-2 block" />
        </div>
      )}
      {tab === "bank" && (
        <div>
          (Bank details UI can be added here)
        </div>
      )}
      <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded mt-4">
        Save
      </button>
    </Layout>
  );
}
