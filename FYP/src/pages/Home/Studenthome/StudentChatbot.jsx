import { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Loader2 } from "lucide-react";
import Navbar from "../../../components/Navbar"; // Import Navbar
import Sidebar from "../../../components/Sidebar"; // Import Sidebar
import "../../../styles/StudentChatbotPage.css"; // Import styles
import axios from "axios";
import { chatbot } from "../../../services/student";
import { useNavigate } from "react-router-dom";

// Chatbot Component
const Chatbot = () => {
  const [messages, setMessages] = useState([
    { 
      sender: "bot", 
      text: "Hello! How can I assist you today?", 
      timestamp: new Date(),
      status: "delivered"
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const chatBoxRef = useRef(null);
  const navigate = useNavigate();

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem("studentToken");
    if (!token) {
      navigate("/studentlogin");
    }
  }, [navigate]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === "") return;
  
    const newMessage = {
      sender: "user",
      text: input,
      timestamp: new Date(),
      status: "sending"
    };

    setMessages(prev => [...prev, newMessage]);
    setInput("");
    setError(null);
  
    try {
      setIsTyping(true);
      const botResponse = await chatbot(input);
      
      // Update user message status
      setMessages(prev => prev.map(msg => 
        msg === newMessage ? { ...msg, status: "delivered" } : msg
      ));

      // Add bot response
      setMessages(prev => [...prev, {
        sender: "bot",
        text: botResponse,
        timestamp: new Date(),
        status: "delivered"
      }]);
    } catch (err) {
      console.error("Error sending message to chatbot:", err);
      
      // Handle authentication error
      if (err.message === "Please log in to continue") {
        localStorage.removeItem("studentToken");
        navigate("/studentlogin");
        return;
      }
      
      setError(err.message || "Failed to send message. Please try again.");
      // Update user message status to error
      setMessages(prev => prev.map(msg => 
        msg === newMessage ? { ...msg, status: "error" } : msg
      ));
    } finally {
      setIsTyping(false);
    }
  };

  const formatTimestamp = (date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="chat-container">
      <h2 className="chat-header">AI Chatbot</h2>
      <div className="chat-box" ref={chatBoxRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message-container ${msg.sender}`}>
            <div className={`chat-message ${msg.sender}`}>
              <div className="message-content">{msg.text}</div>
              <div className="message-meta">
                <span className="timestamp">{formatTimestamp(msg.timestamp)}</span>
                {msg.sender === "user" && (
                  <span className={`status ${msg.status}`}>
                    {msg.status === "sending" && <Loader2 size={12} />}
                    {msg.status === "error" && "❌"}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="chat-message-container bot">
            <div className="chat-message bot typing">
              <Loader2 size={16} className="typing-indicator" />
            </div>
          </div>
        )}
      </div>
      {error && <div className="error-message">{error}</div>}
      <div className="chat-input-container">
        <button className="attachment-button">
          <Paperclip size={20} />
        </button>
        <input
          type="text"
          className="chat-input"
          placeholder="Ask me anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          disabled={isTyping}
        />
        <button 
          onClick={handleSend} 
          className="chat-send-button"
          disabled={isTyping || !input.trim()}
        >
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
