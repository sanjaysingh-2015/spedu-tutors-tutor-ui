import React, { createContext, useContext, useState } from "react";
import MessageModal from "../components/MessageModal";

const MessageContext = createContext();

export const useMessages = () => useContext(MessageContext);

export const MessageProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);

  const addMessage = (text, type = "info") => {
    setMessages(prev => [...prev, { text, type }]);
  };

  const clearMessages = () => setMessages([]);

  return (
    <MessageContext.Provider value={{ addMessage, clearMessages }}>
      {children}
      <MessageModal messages={messages} onClose={clearMessages} />
    </MessageContext.Provider>
  );
};
