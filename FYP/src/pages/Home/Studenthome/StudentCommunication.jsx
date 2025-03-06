import React, { useState } from "react";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";
import "../../../styles/StudentCommunication.css";
import { Card, Form, Button, ListGroup, Badge } from "react-bootstrap";
import { FaPaperPlane, FaCalendarAlt, FaBullhorn } from "react-icons/fa";

const StudentCommunication = () => {
  // State for messages, announcements, and meeting scheduling
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { sender: "Supervisor", text: "Let's schedule a meeting for your project discussion.", timestamp: "10:00 AM" },
    { sender: "Student", text: "Sure! What time works best?", timestamp: "10:05 AM" },
  ]);

  const [announcements, setAnnouncements] = useState([
    { title: "📢 Mid-Term Evaluations", details: "Mid-Term evaluations will be held on April 15th." },
    { title: "📢 Project Submission Deadline", details: "Final project reports due by June 10th." },
  ]);

  const [meetings, setMeetings] = useState([
    { date: "Feb 20, 2025", time: "3:00 PM", status: "Scheduled" },
  ]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() !== "") {
      setMessages([...messages, { sender: "Student", text: message, timestamp: "Now" }]);
      setMessage("");
    }
  };

  return (
    <div className="student-communication">
      <Navbar />
      <div className="dashboard-container d-flex">
        <Sidebar />
        <div className="dashboard-content p-4 w-100">
          <h1 className="dashboard-title text-center">📢 Student-Supervisor Communication</h1>

          {/* Chat Section */}
          <Card className="chat-section mb-4">
            <Card.Body>
              <h2>💬 Chat with Supervisor</h2>
              <div className="chat-box">
                {messages.map((msg, index) => (
                  <div key={index} className={`chat-message ${msg.sender === "Student" ? "student" : "supervisor"}`}>
                    <strong>{msg.sender}: </strong> {msg.text}
                    <span className="timestamp">{msg.timestamp}</span>
                  </div>
                ))}
              </div>
              <Form onSubmit={sendMessage} className="chat-input mt-3">
                <Form.Control
                  type="text"
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <Button type="submit" variant="primary">
                  <FaPaperPlane /> Send
                </Button>
              </Form>
            </Card.Body>
          </Card>

          {/* Announcements Section */}
          <Card className="announcements-section mb-4">
            <Card.Body>
              <h2>📣 Announcements</h2>
              <ListGroup>
                {announcements.map((announcement, index) => (
                  <ListGroup.Item key={index}>
                    <FaBullhorn className="announcement-icon" />
                    <strong>{announcement.title}</strong> - {announcement.details}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>

          {/* Meeting Scheduling Section */}
          <Card className="meeting-section mb-4">
            <Card.Body>
              <h2>📅 Meeting Schedule</h2>
              <ListGroup>
                {meetings.map((meeting, index) => (
                  <ListGroup.Item key={index}>
                    <FaCalendarAlt className="meeting-icon" />
                    <strong>{meeting.date}</strong> at {meeting.time}
                    <Badge bg="success" className="meeting-status">{meeting.status}</Badge>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <Button variant="primary" className="mt-3">Schedule a Meeting</Button>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentCommunication;
