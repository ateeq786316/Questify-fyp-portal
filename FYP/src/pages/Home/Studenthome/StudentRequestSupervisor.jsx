import React, { useState } from "react";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";
import "../../../styles/StudentRequestSupervisor.css";
import { Table, Form, Button, Alert } from "react-bootstrap";
import bgImage from "../../../assets/lgubgimg.jpg"; // Background Image Import

const StudentRequestSupervisor = () => {
  const [selectedSupervisor, setSelectedSupervisor] = useState("");
  const [requestStatus, setRequestStatus] = useState(null);

  // Dummy data (Replace with API call later)
  const supervisors = [
    { id: 1, name: "Dr. Ayesha Khan", department: "AI & Data Science" },
    { id: 2, name: "Mr. Bilal Ahmed", department: "Software Engineering" },
    { id: 3, name: "Ms. Rabia Hassan", department: "Cybersecurity" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedSupervisor) {
      setRequestStatus("pending");
      setTimeout(() => {
        setRequestStatus("approved"); // Simulating an approval process
      }, 3000);
    }
  };

  return (
    <div
      className="student-request-supervisor"
      style={{ backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <Navbar />
      <div className="dashboard-container d-flex">
        <Sidebar />
        <div className="dashboard-content p-4 w-100">
          <h1 className="dashboard-title text-center">📩 Request Supervisor</h1>

          {/* Available Supervisors Table */}
          <div className="supervisor-list mb-4">
            <h2>👨‍🏫 Available Supervisors</h2>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Department</th>
                </tr>
              </thead>
              <tbody>
                {supervisors.map((supervisor) => (
                  <tr key={supervisor.id}>
                    <td>{supervisor.name}</td>
                    <td>{supervisor.department}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {/* Request Form */}
          <div className="request-form mb-4">
            <h2>📝 Submit Request</h2>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="supervisorSelect" className="mb-3">
                <Form.Label>Select Supervisor</Form.Label>
                <Form.Select
                  value={selectedSupervisor}
                  onChange={(e) => setSelectedSupervisor(e.target.value)}
                  required
                >
                  <option value="">-- Choose a Supervisor --</option>
                  {supervisors.map((supervisor) => (
                    <option key={supervisor.id} value={supervisor.id}>
                      {supervisor.name} ({supervisor.department})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Button variant="primary" type="submit" disabled={!selectedSupervisor}>
                Submit Request
              </Button>
            </Form>
          </div>

          {/* Request Status */}
          {requestStatus && (
            <Alert
              variant={requestStatus === "approved" ? "success" : "warning"}
              className="text-center"
            >
              {requestStatus === "pending"
                ? "⏳ Your request is being processed..."
                : "✅ Your supervisor request has been approved!"}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentRequestSupervisor;
