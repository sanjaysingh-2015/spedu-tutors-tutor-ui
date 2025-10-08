import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import {
    createProfile,
    updateProfile,
    uploadResume,
    addBank,
    updateBank,
    getSteps,
    getProfile,
    getResume,
    getBank,
    getPrimaryBank,
    getAddress,
    createAddress,
    updateAddress,
    getProfDocuments,
    createDocument,
} from "../services/tutorService";

import {
    getCountries,

    getTutorAddresses,
    createTutorAddress,
    updateTutorAddress,

    getTutorDocuments,
    createTutorDocument,
    updateTutorDocument,

    getDocuments,
    getDocumentCategories,
    getDocumentByCategory
} from "../services/otherService";

import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { useMessages } from "../context/MessageContext";

export default function ProfileTabs() {
  const { addMessage } = useMessages();
  const steps = [
    { id: "personal", label: "Personal Info" },
    { id: "address", label: "Address Info" },
    { id: "document", label: "Uploaded Documents" },
    { id: "resume", label: "Resume" },
    { id: "bank", label: "Bank Details" },
  ];

  const [tab, setTab] = useState("personal");
  const [stepsStatus, setStepsStatus] = useState([]); // fetched from API
  const [form, setForm] = useState({ firstName: "", middleName: "", lastName: "", bio: "", skills: "" });
  const [resumeForm, setResumeForm] = useState({resumeUrl: ""});
  const [bankForm, setBankForm] = useState({ accountHolderName: "", bankName: "", accountNumber: "", ifscCode: "", upiId: "", primaryAccount: false });
  const [addressForm, setAddressForm] = useState({ tutorCode: "", addressType: "", addressLine1: "", addressLine2: "", addressLine3: "", city: "", state: "", countryCode: "", zipCode: "", correspondingAddress: false });
  const [documentForm, setDocumentForm] = useState({ documentCategoryCode: "", documentCode: "", tutorCode: "", documentNumber: "", documentFileUrl: ""});
  const [countries, setCountries] = useState([]);
  const [documentCategories, setDocumentCategories] = useState([]);
  const [documentsByCategory, setDocumentsByCategory] = useState({});
  const [documents, setDocuments] = useState([]);
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

        // fetch countries
        const countryRes = await getCountries();
        setCountries(countryRes.data);

        // preload data for first tab
        const profileData = await getProfile();
        setForm(profileData.data || {});

        // fetch categories
        const catRes = await getDocumentCategories();
        setDocumentCategories(catRes.data);

        // fetch documents
        const docRes = await getDocuments();
        setDocuments(docRes.data);

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
          setResumeForm(resumeData.data || {});
          // you may store resumeData if needed
        } else if (tab === "bank") {
          const bankData = await getPrimaryBank();
          setBankForm(bankData.data || {});
        } else if (tab === "address") {
          const addressData = await getAddress();
          if(addressData.data)
          setAddressForm(addressData.data || {});
        } else if(tab === "document") {
          const documentData = await getProfDocuments();
          setDocumentForm(documentData.data || {});
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

  const fetchDocumentsForCategory = async (categoryCode) => {
    console.log(categoryCode);
    if (!documentsByCategory[categoryCode]) {
      const res = await getDocumentByCategory(categoryCode);
      setDocumentsByCategory((prev) => ({
        ...prev,
        [categoryCode]: res.data,
      }));
    }
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
      setTab("address");
      updateStepStatus("address", "INPROGRESS");
    } catch (err) {
      addMessage("Failed to save personal info", "error");
    }
  };

  const handleAddressNext = async () => {
    try {
      if (getStepStatus("address") === "COMPLETED") {
        await updateAddress(addressForm.id, addressForm);
      } else {
        await createAddress(addressForm);
      }
      updateStepStatus("address", "COMPLETED");
      setTab("document");
      updateStepStatus("document", "INPROGRESS");
    } catch (err) {
      addMessage("Failed to save address info", "error");
    }
  };

  const handleDocumentNext = async () => {
    try {
      preparePayload();
      updateStepStatus("document", "COMPLETED");
      setTab("resume");
      updateStepStatus("resume", "INPROGRESS");
    } catch (err) {
      addMessage("Failed to save document info", "error");
    }
  };

  const preparePayload = async () => {
    // Filter out empty optional categories (like "OTHERS")
    const payload = Object.values(documentForm)
      .filter((item) => item.documentCategoryCode)
      .map((item) => ({
        documentCategoryCode: item.documentCategoryCode,
        documentNumber: item.documentNumber || "",
        documentCode: item.documentCode || "",
        documentFileUrl: item.documentFileUrl || "",
      }));

    if (payload.length === 0) {
      addMessage("Please upload at least one document before proceeding.", "error");
      return;
    }
    await createDocument(payload);
    addMessage("Documents saved successfully!", "success");
  }

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

  const handleFileUpload = (e, categoryCode) => {
      const file = e.target.files[0];
      if (file) {
        const fakeUrl = URL.createObjectURL(file); // in real use, replace with backend upload response
        setDocumentForm((prev) => ({
          ...prev,
          [categoryCode]: {
            ...(prev[categoryCode] || {}),
            documentFileUrl: fakeUrl,
          },
        }));
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

      {tab === "address" && (
        <div>
          <select
            className="border rounded p-2 mb-2 block w-full"
            value={addressForm.addressType}
            onChange={e => setAddressForm({ ...addressForm, addressType: e.target.value })}
          >
            <option value="">All Address Types</option>
            <option key="HOME" value="HOME">Home</option>
            <option key="OFFICE" value="OFFICE">Office</option>
            <option key="OTHERS" value="OTHERS">Others</option>
          </select>
          <input type="text" placeholder="Address Line#1" value={addressForm.addressLine1}
            onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
            className="border rounded p-2 mb-2 block w-full" />
          <input type="text" placeholder="Address Line#2" value={addressForm.addressLine2}
            onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
            className="border rounded p-2 mb-2 block w-full" />
          <input type="text" placeholder="Address Line#3" value={addressForm.addressLine3}
            onChange={(e) => setAddressForm({ ...addressForm, addressLine3: e.target.value })}
            className="border rounded p-2 mb-2 block w-full" />
          <input type="text" placeholder="City" value={addressForm.city}
            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
            className="border rounded p-2 mb-2 block w-full" />
          <input type="text" placeholder="State" value={addressForm.state}
            onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
            className="border rounded p-2 mb-2 block w-full" />
          <select
            className="border rounded p-2 mb-2 block w-full"
            value={addressForm.countryCode}
            onChange={e => setAddressForm({ ...addressForm, countryCode: e.target.value })}
          >
            <option value="">All Countries</option>
            {countries.map(l => (
              <option key={l.code} value={l.code}>{l.name}</option>
            ))}
          </select>
          <input type="text" placeholder="Zip Code" value={addressForm.zipCode}
            onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
            className="border rounded p-2 mb-2 block w-full" />
          <label className="flex items-center space-x-2 mb-2">
            <input type="checkbox" checked={addressForm.correspondingAddress}
              onChange={(e) => setAddressForm({ ...addressForm, correspondingAddress: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
            <span className="text-sm text-gray-700">Primary Account</span>
          </label>
          <button onClick={handleAddressNext} className="bg-blue-600 text-white px-6 py-2 rounded-md shadow hover:bg-blue-700 transition">Next →</button>
        </div>
      )}

      {tab === "document" && (
        <div>
          {documentCategories.map((category) => (
            <div key={category.code} className="mb-6 border p-4 rounded">
              {/* Category label */}
              <h3 className="font-semibold text-gray-700 mb-2">
                {category.name}
                {category.isOptional && (
                  <span className="text-sm text-gray-500 ml-2">(Optional)</span>
                )}
              </h3>

              {/* Document dropdown */}
              <select
                className="border rounded p-2 mb-2 block w-full"
                value={documentForm[category.code]?.documentCode || ""}
                onFocus={() => fetchDocumentsForCategory(category.code)}
                onChange={(e) =>
                  setDocumentForm({
                    ...documentForm,
                    [category.code]: {
                      ...(documentForm[category.code] || {}),
                      documentCategoryCode: category.code,
                      documentCode: e.target.value,
                    },
                  })
                }
              >
                <option value="">Select Document</option>
                {(documentsByCategory[category.code] || []).map((doc) => (
                  <option key={doc.code} value={doc.code}>
                    {doc.name}
                  </option>
                ))}
              </select>
              <input type="text" placeholder="Document Number" value={documentForm.documentNumber}
                onChange={(e) => setDocumentForm({
                   ...documentForm,
                   [category.code]: {
                     ...(documentForm[category.code] || {}),
                     documentCategoryCode: category.code,
                     documentNumber: e.target.value,
                   },
                 })
                }
                className="border rounded p-2 mb-2 block w-full" />
              {/* File upload */}
              <input
                type="file"
                onChange={(e) => handleFileUpload(e, category.code)}
                className="mb-2"
              />

              {/* Uploaded file display */}
              {documentForm[category.code]?.documentFileUrl && (
                <p className="text-sm text-green-600">
                  Uploaded: {documentForm[category.code].documentFileUrl}
                </p>
              )}
            </div>
          ))}

          <button onClick={handleDocumentNext} className="bg-blue-600 text-white px-6 py-2 rounded-md shadow hover:bg-blue-700 transition">Next →</button>
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
