import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import FilePreviewModal from "../components/FilePreviewModal"
import {
  getLevels,
  getPersonalInfo,
  updatePersonalInfo,
  uploadResumeFile,
  getFileResource
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
  const [fileUrl, setFileUrl] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [showModal, setShowModal] = useState(false);

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

  const handleShowFile = async (fileId) => {
    try {
      const response = await getFileResource();

      const contentType = response.headers["content-type"] || "";
      const blob = new Blob([response.data], { type: contentType });
      const url = URL.createObjectURL(blob);

      setFileUrl(url);
      if (contentType.includes("image")) setFileType("image");
      else if (contentType.includes("pdf")) setFileType("pdf");
      else setFileType("unknown");

      setShowModal(true);
    } catch (error) {
      console.error("Error fetching file:", error);
    }
  };

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
      <div className="mb-2">
        <input
          type="text"
          placeholder="Skills"
          value={form.skills}
          onChange={(e) => setForm({ ...form, skills: e.target.value })}
          className="border rounded p-2 mb-2 block w-full"
        />
      </div>
      {/* Resume file upload */}
      <div className="mb-2">
        <input type="file" onChange={handleFileUpload} />
        {form.resumeUrl && (
          <div className="flex items-center gap-3 mt-2">
            <p className="text-sm text-green-600 truncate w-64">
              Uploaded: {form.resumeUrl}
            </p>
            <button
              onClick={handleShowFile}
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
      <FilePreviewModal
        show={showModal}
        fileUrl={fileUrl}
        fileType={fileType}
        onClose={() => {
          setShowModal(false);
          setFileUrl(null);
          setFileType(null);
        }}
      />
    </div>
  );
}
