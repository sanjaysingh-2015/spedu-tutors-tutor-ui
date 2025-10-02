import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getProfile } from "../services/tutorService";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getProfile().then((res) => {
      if (!res.data || res.data.profileStatus === "INITIATE") {
        navigate("/profile");
      } else {
        setProfile(res.data);
      }
    });
  }, []);

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      {profile && (
        <div className="space-y-4">
          <div>Welcome {profile.firstName}</div>
          <div className="bg-white p-4 shadow rounded">Today's Classes</div>
          <div className="bg-white p-4 shadow rounded">Students</div>
          <div className="bg-white p-4 shadow rounded">Fees</div>
        </div>
      )}
    </Layout>
  );
}
