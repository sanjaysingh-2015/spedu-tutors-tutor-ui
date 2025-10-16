import React from "react";
import ChatBox from "./ChatBox";

export default function ChatModal({ tutor, studentId, userId, apiBase, chatRoomId ,onClose }) {
  if (!tutor) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-4 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-lg"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold text-blue-700 mb-3">
          Chat with {tutor.name}
        </h2>

        <ChatBox
          userId={studentId}
          tutorId={tutor.code}
          studentId={studentId}
          apiBase={apiBase}
          chatRoomId={chatRoomId}
        />
      </div>
    </div>
  );
}
