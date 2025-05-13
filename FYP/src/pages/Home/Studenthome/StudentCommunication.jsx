import React, { useState, useRef, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";
import "../../../styles/StudentCommunication.css";
import { Card, Form, Button, Spinner } from "react-bootstrap";
import { FaPaperPlane, FaVideo } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext"; // Make sure this path is correct

const StudentCommunication = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatBoxRef = useRef(null);
  const bottomRef = useRef(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const { user } = useAuth(); // Get current user from auth context

  // Fetch messages on component mount
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/auth/chat/${user._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('studentToken')}`
          }
        });
        
        if (response.data.success) {
          setMessages(response.data.messages);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages. Please try again.');
      }
    };

    if (user?._id) {
      fetchMessages();
    }
  }, [user]);

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
    console.log("\n=== Creating Google Meet Session ===");
    console.log("Student Details:", {
      name: user?.name,
      email: user?.email,
      studentId: user?.studentId
    });
    console.log("Supervisor Details:", {
      name: user?.supervisor?.name,
      email: user?.supervisor?.email,
      department: user?.supervisor?.department
    });

    // Get student and supervisor emails
    const studentEmail = user?.email;
    const supervisorEmail = user?.supervisor?.email;

    if (!studentEmail || !supervisorEmail) {
      console.error("Meeting creation failed:", {
        missingStudentEmail: !studentEmail,
        missingSupervisorEmail: !supervisorEmail
      });
      setError("Unable to create meeting: Missing email information");
      return;
    }

    // Create a pre-populated Google Meet link with both emails
    const meetLink = `https://meet.google.com/new?authuser=${studentEmail}&participants=${supervisorEmail}`;
    
    console.log("Meeting Link Created:", {
      timestamp: new Date().toISOString(),
      link: meetLink,
      participants: {
        student: studentEmail,
        supervisor: supervisorEmail
      }
    });

    // Open the meeting link in a new tab
    window.open(meetLink, '_blank');
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    console.log("\n=== Attempting to send message ===");
    console.log("Message:", message);
    console.log("Is Loading:", isLoading);
    console.log("User:", user);

    if (!message.trim() || isLoading || !user?._id) {
      console.log("Message sending blocked:", {
        isEmpty: !message.trim(),
        isLoading,
        noUserId: !user?._id
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setShouldScrollToBottom(true);

    try {
      console.log("Making API call to send message...");
      const response = await axios.post(
        `http://localhost:5000/api/auth/chat/${user._id}/send`,
        { text: message },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('studentToken')}`
          }
        }
      );

      console.log("API Response:", response.data);

      if (response.data.success) {
        console.log("Message sent successfully");
        setMessages(prev => [...prev, response.data.message]);
        setMessage("");
      } else {
        console.log("Message sending failed:", response.data);
        setError(response.data.msg || "Failed to send message");
      }
    } catch (err) {
      console.error("\n=== Error Sending Message ===");
      console.error("Error details:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });
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
      <div className="student-communication__layout">
        <Sidebar />
        <div className="student-communication__content">
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
                    onChange={(e) => {
                      console.log("Message input changed:", e.target.value);
                      setMessage(e.target.value);
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        console.log("Enter key pressed");
                        sendMessage(e);
                      }
                    }}
                    disabled={isLoading}
                    className="message-input"
                  />
                  <Button 
                    type="submit" 
                    variant="primary"
                    disabled={isLoading || !message.trim()}
                    className="send-button"
                    onClick={(e) => {
                      console.log("Send button clicked");
                      sendMessage(e);
                    }}
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
