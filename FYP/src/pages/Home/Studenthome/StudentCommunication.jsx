import React, { useState, useRef, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";
import "../../../styles/StudentCommunication.css";
import { Card, Form, Button, Spinner } from "react-bootstrap";
import { FaPaperPlane, FaVideo } from "react-icons/fa";

const StudentCommunication = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatBoxRef = useRef(null);
  const bottomRef = useRef(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  // Simulated messages for demo
  useEffect(() => {
    const demoMessages = [
      { 
        sender: "Supervisor", 
        text: "Hello! How can I help you with your project today?", 
        timestamp: "16:41",
        date: "24 march 2024"
      },
      { 
        sender: "Student", 
        text: "Hi! I have some questions about the proposal.", 
        timestamp: "16:59",
        date: "24 march 2024"
      },
      {
        sender: "Supervisor",
        text: "I confirm the meeting for Friday at 4 PM in our office.",
        timestamp: "9:12",
        date: "24 march 2024"
      },
      {
        sender: "Student",
        text: "Perfect! Have a great day!",
        timestamp: "9:20",
        date: "24 march 2024"
      }
    ];
    setMessages(demoMessages);
  }, []);

  // Handle scroll events
  const handleScroll = (e) => {
    if (!chatBoxRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = chatBoxRef.current;
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 50;
    setShouldScrollToBottom(isAtBottom);
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (shouldScrollToBottom && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, shouldScrollToBottom]);

  const createGoogleMeet = () => {
    window.open('https://meet.google.com/new', '_blank');
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setShouldScrollToBottom(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newMessage = {
        sender: "Student",
        text: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: "Aujourd'hui"
      };

      setMessages(prev => [...prev, newMessage]);
      setMessage("");
    } catch (err) {
      setError("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = message.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="student-communication">
      <Navbar />
      <div className="dashboard-container d-flex">
        <Sidebar />
        <div className="dashboard-content">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="dashboard-title">💬 Chat with Supervisor</h1>
            <Button 
              variant="primary" 
              className="meet-button"
              onClick={createGoogleMeet}
            >
              <FaVideo className="me-2" />
              Create Google Meet
            </Button>
          </div>

          <Card className="chat-section">
            <Card.Body className="p-0 d-flex flex-column">
              <div 
                className="chat-box" 
                ref={chatBoxRef}
                onScroll={handleScroll}
              >
                <div className="messages-container">
                  {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                    <React.Fragment key={date}>
                      <div className="message-date">{date}</div>
                      {dateMessages.map((msg, index) => (
                        <div 
                          key={index} 
                          className={`chat-message ${msg.sender === "Student" ? "student" : "supervisor"}`}
                        >
                          <div className="message-content">
                            <div className="message-text">{msg.text}</div>
                            <div className="message-timestamp">{msg.timestamp}</div>
                          </div>
                        </div>
                      ))}
                    </React.Fragment>
                  ))}
                  {isLoading && (
                    <div className="message-status">
                      <Spinner animation="border" size="sm" />
                      <span>Sending...</span>
                    </div>
                  )}
                  {error && (
                    <div className="message-error">
                      {error}
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>
              </div>

              <Form onSubmit={sendMessage} className="chat-input">
                <div className="input-group">
                  <Form.Control
                    type="text"
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isLoading}
                    className="message-input"
                  />
                  <Button 
                    type="submit" 
                    variant="primary"
                    disabled={isLoading || !message.trim()}
                    className="send-button"
                  >
                    <FaPaperPlane />
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentCommunication;
