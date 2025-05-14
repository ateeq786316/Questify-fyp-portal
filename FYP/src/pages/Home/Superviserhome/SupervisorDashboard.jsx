import React, { useState, useEffect } from 'react';
import '../../../styles/SupervisorDashboard.css'; // Custom CSS file for styling
import Navbar from "../../../components/Navbar.jsx";
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const SupervisorDashboard = () => {
  const [supervisor, setSupervisor] = useState(null);
  const [approvedStudents, setApprovedStudents] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('supervisorToken');
    if (!token) {
      navigate('/supervisorlogin');
      return;
    }

    const fetchSupervisorData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/supervisor/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSupervisor(response.data.supervisor);
        setApprovedStudents(response.data.approvedStudents || []);
        setPendingRequests(response.data.pendingRequests || []);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.msg || 'Error fetching supervisor data');
        setLoading(false);
      }
    };

    fetchSupervisorData();
  }, [navigate]);

  const handleRequest = async (studentId, action) => {
    try {
      const token = localStorage.getItem('supervisorToken');
      await axios.post(
        `http://localhost:5000/api/supervisor/requests/${studentId}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setPendingRequests(prev => prev.filter(req => req._id !== studentId));
      if (action === 'approve') {
        const approvedStudent = pendingRequests.find(req => req._id === studentId);
        if (approvedStudent) {
          setApprovedStudents(prev => [...prev, approvedStudent]);
        }
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Error processing request');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard-container">
      {/* Navbar */}
      <Navbar />
      {/* Sidebar */}
      
      <div className="sidebar">
        <Link to="/supervisordashboard" className="active">Home</Link>
        <Link to="/supervisor/reviewdocument">Review Document</Link>
        <Link to="/supervisor/evaluate">Evaluate</Link>
        <Link to="#about">About</Link>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Supervisor Details */}
        {supervisor && (
          <div className="supervisor-details">
            <h2>Supervisor ID: {supervisor.supervisorId || 'N/A'}</h2>
            <h2>Name: {supervisor.name || 'N/A'}</h2>
            <p>Expertise</p>
            <ul>
              {Array.isArray(supervisor.supervisorExpertise) && supervisor.supervisorExpertise.map((expertise, index) => (
                <li key={index}>{expertise || 'N/A'}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Approved Students and Requests */}
        <div className="grid-container">
          {/* Approved Students */}
          <div className="approved-students">
            <div className="section-header">Approved Students</div>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Project</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(approvedStudents) && approvedStudents.map(student => (
                  <tr key={student._id || Math.random()}>
                    <td>{student?.studentId || 'N/A'}</td>
                    <td>{student?.name || 'N/A'}</td>
                    <td>{student?.projectTitle || 'N/A'}</td>
                    <td>{student?.projectStatus || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Requests */}
          <div className="requests">
            <div className="section-header">Pending Requests</div>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Project</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(pendingRequests) && pendingRequests.map(request => {
                  const student = request.studentId; // The populated student object
                  return (
                    <tr key={request._id || Math.random()}>
                      <td>{student?.studentId || 'N/A'}</td>
                      <td>{student?.name || 'N/A'}</td>
                      <td>{student?.projectTitle || 'N/A'}</td>
                      <td className="action-buttons">
                        <button 
                          className="approve"
                          onClick={() => handleRequest(request._id, 'approve')}
                        >
                          Approve
                        </button>
                        <button 
                          className="reject"
                          onClick={() => handleRequest(request._id, 'reject')}
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;