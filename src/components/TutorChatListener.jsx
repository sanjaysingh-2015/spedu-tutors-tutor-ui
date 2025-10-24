// src/components/TutorChatListener.jsx
import React, { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import * as Stomp from "@stomp/stompjs";
import ChatModal from "./ChatModal";

const API_BASE = import.meta.env.VITE_CHAT_API_BASE_URL || "http://localhost:8084/chat-api";

export default function TutorChatListener({ tutorId }) {
  const [stompClient, setStompClient] = useState(null);
  const [incomingChat, setIncomingChat] = useState(null);

  useEffect(() => {
    if (!tutorId) return;

    const socket = new SockJS(`${API_BASE}/ws`);
    const client = Stomp.Stomp.over(socket);
    client.debug = () => {}; // silence console logs

    client.connect(
      {},
      () => {
        console.log("✅ Connected to chat notifications for tutor", tutorId);
        setStompClient(client);

        // Subscribe to tutor-specific notification topic
        client.subscribe(`/topic/notify/tutor/${tutorId}`, (msg) => {
          if (msg.body) {
            const payload = JSON.parse(msg.body);
            console.log("📩 Incoming message from student:", payload);
            setIncomingChat(payload);
          }
        });
      },
      (error) => {
        console.error("❌ WebSocket connection error:", error);
      }
    );

    return () => {
      client.disconnect(() => console.log("Tutor disconnected from chat socket"));
    };
  }, [tutorId]);

  // Handle state changes in a separate useEffect
  useEffect(() => {
    if (incomingChat) {
      console.log("✅ State updated with:", incomingChat);
      // 🔔 Auto-open chat modal or notification here
    }
  }, [incomingChat]);

  return (
    <>
      {incomingChat && (
        <ChatModal
          tutor={{ code: tutorId, name: "Student Chat" }}
          studentId={incomingChat.senderId}
          userId={tutorId}
          apiBase={API_BASE}
          chatRoomId={incomingChat.room.roomCode}
          onClose={() => setIncomingChat(null)}
        />
      )}
    </>
  );
}
