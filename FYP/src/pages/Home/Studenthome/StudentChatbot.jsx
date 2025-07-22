import { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Loader2 } from "lucide-react";
import Navbar from "../../../components/Navbar"; // Import Navbar
import Sidebar from "../../../components/Sidebar"; // Import Sidebar
import "../../../styles/StudentChatbotPage.css"; // Import styles
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Chatbot Component
const Chatbot = () => {
  const [messages, setMessages] = useState([
    { 
      sender: "bot", 
      text: "Hello! I'm your Questify FYP Portal assistant. How can I help you with your project today?", 
      timestamp: new Date(),
      status: "delivered"
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const chatBoxRef = useRef(null);
  const navigate = useNavigate();

  // System prompt for the chatbot
  const systemPrompt = `You are an AI assistant for the "Questify FYP Portal" at Lahore Garrison University.
You help students with ALL questions related to their Final Year Project (FYP), including:
- Suggesting FYP project ideas (with brief descriptions and possible technologies)
- Providing helpful links and resources for FYP (such as research, documentation, tools, and tutorials)
- Explaining FYP processes (proposal, documentation, evaluation, etc.)
- Answering questions about the Questify FYP Portal features and usage
- Introducing yourself if asked

If a student asks for FYP ideas, provide 3-5 creative, relevant project ideas with a short description and suggested technologies.
If a student asks for resources, provide helpful links (official docs, tutorials, research papers, etc.).
If a student asks about you, introduce yourself as Questify, the FYP Portal AI assistant.
Always be professional, helpful, and supportive. Reply to all questions related to Final Year Projects (FYP).`;

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem("studentToken");
    if (!token) {
      navigate("/login");
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
      
      // Get the last 5 messages for context
      const recentMessages = messages.slice(-5);
      const contextPrompt = recentMessages
        .map(msg => `${msg.sender === "user" ? "User" : "Assistant"}: ${msg.text}`)
        .join("\n");

      // Make request to Gemini API with system prompt
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAiLOVFF-L8FblJ9NFglOqvHQM6emwEJV8`,
        {
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nContext:\n${contextPrompt}\n\nUser: ${input}\n\nAssistant:`
            }]
          }]
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      if (!response.data || !response.data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error("Invalid response from Gemini API");
      }

      // Format the response
      let botResponse = response.data.candidates[0].content.parts[0].text
        .split("\n")
        .slice(0, 15)
        .join("\n")
        .trim();

      // Allow markdown links and basic formatting, but clean up excessive whitespace
      botResponse = botResponse
        // Convert plain URLs to markdown links if not already
        .replace(/(https?:\/\/[^\s]+)/g, url => `[${url}](${url})`)
        // Add proper spacing
        .replace(/\n/g, '\n\n')
        // Remove extra spaces
        .replace(/ +/g, ' ')
        .trim();

      // Self-introduction fallback
      if (/who are you|your name|about you|introduce yourself/i.test(input)) {
        botResponse = "I'm Questify, your AI assistant for FYP help and guidance at Lahore Garrison University. " + botResponse;
      }
      
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
        navigate("/login");
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
    <div className="student-chatbot">
      <h2 className="student-chatbot__header">AI Chatbot</h2>
      <div className="student-chatbot__chat-box" ref={chatBoxRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`student-chatbot__message-container student-chatbot__message-container--${msg.sender}`}>
            <div className={`student-chatbot__message student-chatbot__message--${msg.sender}`}>
              <div className="student-chatbot__message-content">{msg.text}</div>
              <div className="student-chatbot__message-meta">
                <span className="student-chatbot__timestamp">{formatTimestamp(msg.timestamp)}</span>
                {msg.sender === "user" && (
                  <span className={`student-chatbot__status student-chatbot__status--${msg.status}`}>
                    {msg.status === "sending" && <Loader2 size={12} />}
                    {msg.status === "error" && "❌"}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="student-chatbot__message-container student-chatbot__message-container--bot">
            <div className="student-chatbot__message student-chatbot__message--bot student-chatbot__message--typing">
              <Loader2 size={16} className="student-chatbot__typing-indicator" />
            </div>
          </div>
        )}
      </div>
      {error && <div className="student-chatbot__error">{error}</div>}
      <div className="student-chatbot__input-container">
        <button className="student-chatbot__attachment-button">
          <Paperclip size={20} />
        </button>
        <input
          type="text"
          className="student-chatbot__input"
          placeholder="Ask me anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          disabled={isTyping}
        />
        <button 
          onClick={handleSend} 
          className="student-chatbot__send-button"
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
    <div className="student-chatbot-page">
      <Navbar />
      <div className="student-chatbot__layout">
        <Sidebar />
        <div className="student-chatbot__content">
          <Chatbot />
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
