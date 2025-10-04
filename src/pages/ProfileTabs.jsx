import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { createProfile, updateProfile, uploadResume, addBank, updateBank, getSteps, getProfile, getResume, getBank, getPrimaryBank } from "../services/tutorService";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { useMessages } from "../context/MessageContext";

export default function ProfileTabs() {
  const { addMessage } = useMessages();
  const steps = [
    { id: "personal", label: "Personal Info" },
    { id: "resume", label: "Resume" },
    { id: "bank", label: "Bank Details" },
  ];

  const [tab, setTab] = useState("personal");
  const [stepsStatus, setStepsStatus] = useState([]); // fetched from API
  const [form, setForm] = useState({ firstName: "", middleName: "", lastName: "", bio: "", skills: "" });
  const [resumeForm, setResumeForm] = useState({resumeUrl: ""});
  const [bankForm, setBankForm] = useState({ accountHolderName: "", bankName: "", accountNumber: "", ifscCode: "", upiId: "", primaryAccount: false });
  const [file, setFile] = useState(null);
  const [userName, setUserName] = useState("");

  const currentIndex = steps.findIndex((s) => s.id === tab);

  // Fetch steps and preload profile data
  useEffect(() => {
    setUserName(localStorage.getItem("loggedInUser"));

    const init = async () => {
      try {
        // fetch onboarding steps
        const stepsRes = await getSteps();
        setStepsStatus(stepsRes.data);
        // preload data for first tab
        const profileData = await getProfile();
        setForm(profileData.data);

      } catch (err) {
        addMessage("Error fetching steps or profile", "error");
      }
    };
    init();
  }, []);

  // When switching tabs, preload data
  useEffect(() => {
    const fetchTabData = async () => {
      try {
        if (tab === "resume") {
          const resumeData = await getResume();
          setResumeForm(resumeData.data);
          // you may store resumeData if needed
        } else if (tab === "bank") {
          const bankData = await getPrimaryBank();
          setBankForm(bankData.data);
        }
      } catch (err) {
        addMessage("Failed to fetch data for tab "+ tab, "error");
      }
    };
    fetchTabData();
  }, [tab]);

  // Helpers
  const updateStepStatus = (stepId, status) => {
    setStepsStatus((prev) =>
      prev.map((s) =>
        s.onboardingStepCode === stepId ? { ...s, status } : s
      )
    );
  };

  const getStepStatus = (id) =>
      stepsStatus.find((s) => s.onboardingStepCode === id)?.status || "PENDING";

  const handlePersonalNext = async () => {
    try {
      if (getStepStatus("personal") === "COMPLETED") {
        await updateProfile(form);
      } else {
        await createProfile(form);
      }
      updateStepStatus("personal", "COMPLETED");
      setTab("resume");
      updateStepStatus("resume", "INPROGRESS");
    } catch (err) {
      addMessage("Failed to save personal info", "error");
    }
  };

  const handleResumeNext = async () => {
    try {
      if (file) await uploadResume(file);
      updateStepStatus("resume", "COMPLETED");
      setTab("bank");
      updateStepStatus("bank", "INPROGRESS");
    } catch (err) {
      addMessage("Failed to upload resume", "error");
    }
  };

  const handleBankNext = async () => {
    try {
      console.log("Bank Status");
      if (getStepStatus("bank") === "COMPLETED") {
        await updateBank(bankForm);
      } else {
        await addBank(bankForm);
      }
      updateStepStatus("bank", "COMPLETED");
      addMessage("Profile completed 🎉", "success");
    } catch (err) {
      addMessage("Failed to save bank details", "error");
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setTab(steps[currentIndex - 1].id);
    }
  };

  return (
    <Layout>
      <h2 className="text-xl font-bold mb-6">{userName}'s Profile</h2>

      {/* Stepper */}
      <div className="flex justify-between items-center mb-8">
        {steps.map((step, idx) => {
          const stepStatus = Array.isArray(stepsStatus)
              ? stepsStatus.find((s) => s.onboardingStepCode === step.id)?.status
              : null;
          const isCompleted = stepStatus === "COMPLETED";
          const isActive = tab === step.id;

          return (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <button
                onClick={() => setTab(step.id)}
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-200 ${
                  isCompleted
                    ? "bg-green-500 text-white border-green-500"
                    : isActive
                    ? "border-blue-600 text-blue-600"
                    : "border-gray-300 text-gray-400"
                }`}
              >
                {isCompleted ? <CheckCircleIcon className="w-6 h-6" /> : idx + 1}
              </button>
              <span
                className={`mt-2 text-sm ${
                  isActive
                    ? "text-blue-600 font-semibold"
                    : isCompleted
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                {step.label} <span className="block text-xs">({stepStatus || "PENDING"})</span>
              </span>
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      {tab === "personal" && (
        <div>
          <input type="text" placeholder="First Name" value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            className="border rounded p-2 mb-2 block w-full" />
          <input type="text" placeholder="Middle Name" value={form.middleName}
            onChange={(e) => setForm({ ...form, middleName: e.target.value })}
            className="border rounded p-2 mb-2 block w-full" />
          <input type="text" placeholder="Last Name" value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            className="border rounded p-2 mb-2 block w-full" />
          <textarea placeholder="Bio" value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="border rounded p-2 mb-2 block w-full" />
          <input type="text" placeholder="Skills" value={form.skills}
            onChange={(e) => setForm({ ...form, skills: e.target.value })}
            className="border rounded p-2 mb-2 block w-full" />
          <button onClick={handlePersonalNext} className="bg-blue-600 text-white px-6 py-2 rounded-md shadow hover:bg-blue-700 transition">Next →</button>
        </div>
      )}

      {tab === "resume" && (
        <div>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} className="border rounded p-2 mb-2 block w-full" />
          <p>
          Resume Url: {resumeForm.resumeUrl}
          </p>
          <button onClick={handleResumeNext} className="bg-blue-600 text-white px-6 py-2 rounded-md shadow hover:bg-blue-700 transition">Next →</button>
        </div>
      )}

      {tab === "bank" && (
        <div>
          <input type="text" placeholder="Account Holder Name" value={bankForm.accountHolderName}
            onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
            className="border rounded p-2 mb-2 block w-full" />
          <input type="text" placeholder="Bank Name" value={bankForm.bankName}
            onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
            className="border rounded p-2 mb-2 block w-full" />
          <input type="text" placeholder="Account Number" value={bankForm.accountNumber}
            onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
            className="border rounded p-2 mb-2 block w-full" />
          <input type="text" placeholder="IFSC Code" value={bankForm.ifscCode}
            onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value })}
            className="border rounded p-2 mb-2 block w-full" />
          <input type="text" placeholder="UPI Id" value={bankForm.upiId}
            onChange={(e) => setBankForm({ ...bankForm, upiId: e.target.value })}
            className="border rounded p-2 mb-2 block w-full" />
          <label className="flex items-center space-x-2 mb-2">
            <input type="checkbox" checked={bankForm.primaryAccount}
              onChange={(e) => setBankForm({ ...bankForm, primaryAccount: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
            <span className="text-sm text-gray-700">Primary Account</span>
          </label>
          <button onClick={handleBankNext} className="bg-blue-600 text-white px-6 py-2 rounded-md shadow hover:bg-blue-700 transition">Finish 🎉</button>
        </div>
      )}
    </Layout>
  );
}
