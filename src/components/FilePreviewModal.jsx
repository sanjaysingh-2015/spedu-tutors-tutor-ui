import React from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";

export default function FilePreviewModal({ show, fileUrl, fileType, onClose }) {
  if (!show) return null;

  const handleBackgroundClick = (e) => {
    // Close when clicking outside the content area
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
      onClick={handleBackgroundClick}
    >
      <div className="relative bg-white rounded-lg shadow-xl p-4 max-w-4xl w-full mx-2">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h3 className="text-lg font-semibold">
            {fileType === "image" ? "Image Preview" :
             fileType === "pdf" ? "PDF Preview" : "File Preview"}
          </h3>
          <button onClick={onClose}>
            <XMarkIcon className="w-6 h-6 text-gray-600 hover:text-black" />
          </button>
        </div>

        {/* File Content */}
        <div className="flex justify-center items-center">
          {fileType === "image" && (
            <img
              src={fileUrl}
              alt="Preview"
              className="max-h-[80vh] rounded-lg object-contain"
            />
          )}

          {fileType === "pdf" && (
            <iframe
              src={fileUrl}
              title="PDF Preview"
              className="w-full h-[80vh] border rounded-lg"
            ></iframe>
          )}

          {fileType === "unknown" && (
            <p className="text-gray-700">Unsupported file format</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
