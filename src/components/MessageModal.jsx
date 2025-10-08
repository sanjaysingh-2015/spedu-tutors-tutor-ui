import React from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";

export default function MessageModal({ messages, onClose }) {
  if (!messages || messages.length === 0) return null;
  // ✅ Determine header based on first message type
  const firstType = messages[0].type;
  const headerTitle =
    firstType === "error"
      ? "Error"
      : firstType === "success"
      ? "Success"
      : "Information";

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 max-w-full p-4">
        <div className="flex justify-between items-center border-b pb-2 mb-2">
          <h3 className="text-lg font-semibold">{headerTitle}</h3>
          <button onClick={onClose}>
            <XMarkIcon className="w-5 h-5 text-gray-600 hover:text-black" />
          </button>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-2 rounded text-sm ${
                msg.type === "error"
                  ? "bg-red-100 text-red-700"
                  : msg.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

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
