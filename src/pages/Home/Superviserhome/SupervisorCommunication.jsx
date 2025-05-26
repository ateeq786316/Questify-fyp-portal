import React, { useState, useRef, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import SupervisorSidebar from "./SupervisorSidebar";
import "../../../styles/StudentCommunication.css";
import { Card, Form, Button, Spinner } from "react-bootstrap";
import { FaPaperPlane, FaVideo } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import io from "socket.io-client";

const SupervisorCommunication = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const chatBoxRef = useRef(null);
  const bottomRef = useRef(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const { user } = useAuth();
  const socket = io.connect('http://localhost:5000');

  // Fetch supervisor's assigned students
  useEffect(() => {
    const fetchAssignedStudents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/supervisor/assigned-students', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('supervisorToken')}`
          }
        });
        
        if (response.data.success) {
          setStudents(response.data.students);
          if (response.data.students.length > 0) {
            setSelectedStudent(response.data.students[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching assigned students:', err);
        setError('Failed to load assigned students. Please try again.');
      }
    };

    if (user?._id) {
      fetchAssignedStudents();
    }
  }, [user]);

  // Fetch messages when a student is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedStudent?._id) return;

      try {
        const response = await axios.get(`http://localhost:5000/api/auth/chat/${selectedStudent._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('supervisorToken')}`
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
  }, [selectedStudent]);

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
    if (!selectedStudent) {
      setError("Please select a student first");
      return;
    }

    const studentEmail = selectedStudent.email;
    const supervisorEmail = user?.email;

    if (!studentEmail || !supervisorEmail) {
      setError("Unable to create meeting: Missing email information");
      return;
    }

    const meetLink = `https://meet.google.com/new?authuser=${supervisorEmail}&participants=${studentEmail}`;
    window.open(meetLink, '_blank');
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading || !selectedStudent?._id) return;

    setIsLoading(true);
    setError(null);
    setShouldScrollToBottom(true);

    try {
      const response = await axios.post(
        `http://localhost:5000/api/auth/chat/${selectedStudent._id}/send`,
        { 
          text: message,
          receiverId: user._id
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('supervisorToken')}`
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
          receiverId: selectedStudent._id
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
        <SupervisorSidebar />
        <div className="student-communication__content">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="dashboard-title">💬 Chat with Students</h1>
            <Button 
              variant="primary" 
              className="meet-button"
              onClick={createGoogleMeet}
              disabled={!selectedStudent}
            >
              <FaVideo className="me-2" />
              Create Google Meet
            </Button>
          </div>

          <div className="row mb-4">
            <div className="col-md-4">
              <Card>
                <Card.Header>Assigned Students</Card.Header>
                <Card.Body className="p-0">
                  <div className="student-list">
                    {students.map((student) => (
                      <div
                        key={student._id}
                        className={`student-item ${selectedStudent?._id === student._id ? 'active' : ''}`}
                        onClick={() => setSelectedStudent(student)}
                      >
                        <div className="student-info">
                          <h6>{student.name}</h6>
                          <small>{student.studentId}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </div>
            <div className="col-md-8">
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
                              className={`chat-message ${msg.sender === "Supervisor" ? "supervisor" : "student"}`}
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
                        disabled={isLoading || !selectedStudent}
                        className="message-input"
                      />
                      <Button 
                        type="submit" 
                        variant="primary"
                        disabled={isLoading || !message.trim() || !selectedStudent}
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
      </div>
    </div>
  );
};

export default SupervisorCommunication; 