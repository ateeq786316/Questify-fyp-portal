import React, { useState, useRef, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";
import "../../../styles/StudentCommunication.css";
import { Card, Form, Button, Spinner } from "react-bootstrap";
import { FaPaperPlane, FaVideo } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import io from "socket.io-client";

const StudentCommunication = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [supervisors, setSupervisors] = useState([]);
  const chatBoxRef = useRef(null);
  const bottomRef = useRef(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const { user } = useAuth();
  const socket = io.connect('http://localhost:5000');

  // Fetch supervisors
  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/student/supervisors', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('studentToken')}`
          }
        });
        
        if (response.data.success) {
          setSupervisors(response.data.supervisors);
          if (response.data.supervisors.length > 0) {
            setSelectedSupervisor(response.data.supervisors[0]);
          } else {
            setError("No supervisor has been assigned to you yet.");
          }
        }
      } catch (err) {
        console.error('Error fetching supervisors:', err);
        setError('Failed to load supervisors. Please try again.');
      }
    };

    if (user?._id) {
      fetchSupervisors();
    }
  }, [user]);

  // Fetch messages when a supervisor is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedSupervisor?._id) return;

      try {
        const response = await axios.get(`http://localhost:5000/api/auth/chat/${selectedSupervisor._id}`, {
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

    fetchMessages();
  }, [selectedSupervisor]);

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
    if (!selectedSupervisor) {
      setError("Please select a supervisor first");
      return;
    }

    const supervisorEmail = selectedSupervisor.email;
    const studentEmail = user?.email;

    if (!supervisorEmail || !studentEmail) {
      setError("Unable to create meeting: Missing email information");
      return;
    }

    const meetLink = `https://meet.google.com/new?authuser=${studentEmail}&participants=${supervisorEmail}`;
    window.open(meetLink, '_blank');
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading || !selectedSupervisor?._id) return;

    setIsLoading(true);
    setError(null);
    setShouldScrollToBottom(true);

    try {
      const response = await axios.post(
        `http://localhost:5000/api/auth/chat/${user._id}/send`,
        { 
          text: message,
          receiverId: selectedSupervisor._id
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('studentToken')}`
          }
        }
      );

      if (response.data.success) {
        const newMessage = response.data.message;
        setMessages(prev => [...prev, newMessage]);
        setMessage("");

        socket.emit('send_message', {
          ...newMessage,
          senderId: user._id,
          receiverId: selectedSupervisor._id
        });
      } else {
        setError(response.data.msg || "Failed to send message");
      }
    } catch (err) {
      console.error("Error sending message:", err);
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
              disabled={!selectedSupervisor}
            >
              <FaVideo className="me-2" />
              Create Google Meet
            </Button>
          </div>

          <div className="row mb-4">
            <div className="col-md-4">
              <Card>
                <Card.Header>Supervisors</Card.Header>
                <Card.Body className="p-0">
                  {supervisors.length > 0 ? (
                    <div className="student-list">
                      {supervisors.map((supervisor) => (
                        <div
                          key={supervisor._id}
                          className={`student-item ${selectedSupervisor?._id === supervisor._id ? 'active' : ''}`}
                          onClick={() => setSelectedSupervisor(supervisor)}
                        >
                          <div className="student-info">
                            <h6>{supervisor.name}</h6>
                            <small>{supervisor.department}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 text-center text-muted">
                      No supervisor assigned yet
                    </div>
                  )}
                </Card.Body>
              </Card>
            </div>
            <div className="col-md-8">
              <Card className="chat-section">
                <Card.Body className="p-0 d-flex flex-column">
                  {selectedSupervisor ? (
                    <>
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
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
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
                          >
                            <FaPaperPlane />
                          </Button>
                        </div>
                      </Form>
                    </>
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100">
                      <div className="text-center text-muted">
                        <h5>No Supervisor Selected</h5>
                        <p>Please wait for a supervisor to be assigned to you.</p>
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCommunication; 