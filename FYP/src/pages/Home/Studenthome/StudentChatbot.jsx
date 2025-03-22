import { useState } from "react";
import { Send } from "lucide-react";
import Navbar from "../../../components/Navbar"; // Import Navbar
import Sidebar from "../../../components/Sidebar"; // Import Sidebar
import "../../../styles/StudentChatbotPage.css"; // Import styles
import axios from "axios";
import { chatbot } from "../../../services/student";

// Chatbot Component
const Chatbot = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (input.trim() === "") return;
  
    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");
  
    try {
      const botResponse = await chatbot(input); // ✅ Use only one API call
      setMessages([...newMessages, { sender: "bot", text: botResponse }]);
    } catch (err) {
      console.error("Error sending message to chatbot:", err);
      setMessages([...newMessages, { sender: "bot", text: "Sorry, something went wrong." }]);
    }
  };
  
  

  return (
    <div className="chat-container">
      <h2 className="chat-header">AI Chatbot</h2>
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message-container ${msg.sender}`}>
            <div className={`chat-message ${msg.sender}`}>{msg.text}</div>
          </div>
        ))}
      </div>
      <div className="chat-input-container">
        <input
          type="text"
          className="chat-input"
          placeholder="Ask me anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend} className="chat-send-button">
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

const ChatbotPage = () => {
  return (
    <div className="chatbot-page">
      <Navbar />
      <div className="content">
        <Sidebar />
        <Chatbot />
      </div>
    </div>
  );
};

export default ChatbotPage;
