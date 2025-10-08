import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import {
  getLevels,
  getPersonalInfo,
  updatePersonalInfo,
  uploadResumeFile
} from "../services/otherService";
import { CheckCircleIcon, ArrowDownOnSquareIcon } from "@heroicons/react/24/solid";
import { useMessages } from "../context/MessageContext";

export default function PersonalInfo() {
  const { addMessage } = useMessages();
  const [form, setForm] = useState({ firstName: "", middleName: "", lastName: "", bio: "", skills: "" });
  const [file, setFile] = useState(null);
  const [userName, setUserName] = useState("");

  // ✅ Added for modal preview
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    setUserName(localStorage.getItem("loggedInUser"));

    const init = async () => {
      try {
        const personalData = await getPersonalInfo();
        setForm(personalData.data || {});
      } catch (err) {
        addMessage("Error fetching steps or profile", "error");
      }
    };
    init();
  }, []);

  const save = async () => {
    try {
      await updatePersonalInfo(form);
      addMessage("Your personal information has been update successfully", "success");
    } catch (err) {
      addMessage("Failed to save personal info", "error");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const res = await uploadResumeFile(file);
    setForm((f) => ({ ...f, resumeUrl: res }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Personal Info</h2>
      </div>

      <div>
        <input
          type="text"
          placeholder="First Name"
          value={form.firstName}
          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          className="border rounded p-2 mb-2 block w-full"
        />
      </div>
      <div>
        <input
          type="text"
          placeholder="Middle Name"
          value={form.middleName}
          onChange={(e) => setForm({ ...form, middleName: e.target.value })}
          className="border rounded p-2 mb-2 block w-full"
        />
      </div>
      <div>
        <input
          type="text"
          placeholder="Last Name"
          value={form.lastName}
          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          className="border rounded p-2 mb-2 block w-full"
        />
      </div>
      <div>
        <textarea
          placeholder="Bio"
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          className="border rounded p-2 mb-2 block w-full"
        />
      </div>

      {/* Resume file upload */}
      <div>
        <input type="file" onChange={handleFileUpload} />
        {form.resumeUrl && (
          <div className="flex items-center gap-3 mt-2">
            <p className="text-sm text-green-600 truncate w-64">
              Uploaded: {form.resumeUrl}
            </p>
            <button
              onClick={() => {
                setPreviewUrl(form.resumeUrl);
                setIsModalOpen(true);
              }}
              className="text-blue-600 underline hover:text-blue-800"
            >
              Show
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={save}
          className="p-2 bg-blue-600 hover:bg-blue-400 text-blue-1200"
          title="Save Tutor Data"
        >
          <ArrowDownOnSquareIcon className="w-8 h-8" />
        </button>
      </div>

      {/* ✅ Modal Preview (added) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg max-w-4xl w-full relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              ✕
            </button>

            {previewUrl?.endsWith(".pdf") ? (
              <iframe
                src={previewUrl}
                title="Document Preview"
                className="w-full h-[80vh] rounded"
              />
            ) : (
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-[80vh] w-auto mx-auto rounded"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
