import React, { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";
import "../../../styles/StudentRequestSupervisor.css";
import { Table, Form, Button, Alert, Spinner } from "react-bootstrap";
import bgImage from "../../../assets/lgubgimg.jpg"; // Background Image Import
import API from "../../../services/api";
import { toast } from 'react-toastify';

const StudentRequestSupervisor = () => {
  const [supervisors, setSupervisors] = useState([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState("");
  const [requestStatus, setRequestStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previousRequests, setPreviousRequests] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Derived state: check if student has a pending or approved request
  const hasPendingOrApproved = previousRequests.some(
    (req) => req.status === "pending" || req.status === "approved"
  );
  const latestRequest = previousRequests.length > 0 ? previousRequests[0] : null;

  // Fetch supervisors and previous requests
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch supervisors
        const supervisorsResponse = await API.get("/auth/supervisors");
        if (supervisorsResponse.data.success) {
          setSupervisors(supervisorsResponse.data.supervisors);
        }

        // Fetch previous requests
        const requestsResponse = await API.get("/auth/supervisor-request");
        if (requestsResponse.data.success) {
          setPreviousRequests(requestsResponse.data.requests);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.response?.data?.msg || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSupervisor) return;

    try {
      setSubmitting(true);
      setError(null);

      const response = await API.post("/auth/supervisor-request", {
        supervisorId: selectedSupervisor
      });

      if (response.data.success) {
        setRequestStatus("pending");
        toast.success("Supervisor request sent successfully!");
        // Refresh previous requests
        const requestsResponse = await API.get("/auth/supervisor-request");
        if (requestsResponse.data.success) {
          setPreviousRequests(requestsResponse.data.requests);
        }
      }
    } catch (err) {
      console.error("Error submitting request:", err);
      setError(err.response?.data?.msg || "Failed to submit request");
      toast.error(err.response?.data?.msg || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="supervisor-request-page" style={{ backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <Navbar />
        <div className="supervisor-request-container d-flex">
          <Sidebar />
          <div className="supervisor-request-content p-4 w-100 text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-3">Loading supervisors...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="supervisor-request-page">
      <Navbar />
      <div className="student-request__layout">
        <Sidebar />
        <div className="student-request__content">
          <h1 className="supervisor-request-title text-center">📩 Request Supervisor</h1>

          {error && (
            <Alert variant="danger" className="supervisor-request-alert mb-4">
              {error}
            </Alert>
          )}

          {/* Status Banner */}
          {hasPendingOrApproved && (
            <Alert variant={latestRequest.status === "approved" ? "success" : "info"} className="supervisor-request-alert mb-4">
              {latestRequest.status === "approved"
                ? "Your supervisor request has been approved! You can now proceed to upload your proposal."
                : "You have a pending supervisor request. Please wait for approval."}
            </Alert>
          )}

          {/* Available Supervisors Table */}
          <div className="supervisor-list-section mb-4">
            <h2>👨‍🏫 Available Supervisors</h2>
            <Table striped bordered hover className="supervisor-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Expertise</th>
                </tr>
              </thead>
              <tbody>
                {supervisors.map((supervisor) => (
                  <tr key={supervisor._id}>
                    <td>{supervisor.name}</td>
                    <td>{supervisor.department}</td>
                    <td>{supervisor.supervisorExpertise}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {/* Request Form */}
          <div className="supervisor-request-form-section mb-4">
            <h2>📝 Submit Request</h2>
            <Form onSubmit={handleSubmit} className="supervisor-request-form">
              <Form.Group controlId="supervisorSelect" className="mb-3">
                <Form.Label>Select Supervisor</Form.Label>
                <Form.Select
                  value={selectedSupervisor}
                  onChange={(e) => setSelectedSupervisor(e.target.value)}
                  required
                  disabled={submitting || hasPendingOrApproved}
                  className="supervisor-select"
                >
                  <option value="">-- Choose a Supervisor --</option>
                  {supervisors.map((supervisor) => (
                    <option key={supervisor._id} value={supervisor._id}>
                      {supervisor.name} ({supervisor.department})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Button 
                variant="primary" 
                type="submit" 
                disabled={!selectedSupervisor || submitting || hasPendingOrApproved}
                className="supervisor-submit-btn"
              >
                {submitting ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
              {/* Inline guidance for disabled state */}
              {hasPendingOrApproved && (
                <div className="mt-2 text-muted">
                  You cannot submit another request while you have a pending or approved supervisor request.
                </div>
              )}
              {!selectedSupervisor && !hasPendingOrApproved && (
                <div className="mt-2 text-muted">
                  Please select a supervisor to enable the submit button.
                </div>
              )}
            </Form>
          </div>

          {/* Previous Requests */}
          <div className="supervisor-request-history mb-4">
            <h2>📋 Previous Requests</h2>
            <Table striped bordered hover className="request-history-table">
              <thead>
                <tr>
                  <th>Supervisor</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {previousRequests.map((request) => (
                  <tr key={request._id}>
                    <td>{request.supervisorId.name}</td>
                    <td>{request.supervisorId.department}</td>
                    <td>
                      <span className={`supervisor-status-badge status-${request.status}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </td>
                    <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {previousRequests.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center">No previous requests</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentRequestSupervisor;
