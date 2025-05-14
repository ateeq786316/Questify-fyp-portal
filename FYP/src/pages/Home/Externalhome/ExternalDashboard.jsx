import React, { useState, useEffect } from 'react';
import '../../../styles/ExternalDashboard.css';
import Navbar from '../../../components/Navbar';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ExternalDashboard = () => {
  const [external, setExternal] = useState(null);
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('externalToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get('http://localhost:5000/api/external/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setExternal(response.data.external);
          setAssignedStudents(response.data.assignedStudents || []);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.msg || 'Failed to fetch dashboard data');
        toast.error(err.response?.data?.msg || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="external-dashboard">
        <Navbar />
        <div className="dashboard-container">
          <div className="sidebar">
            <Link to="/externaldashboard" className="active">Home</Link>
            <Link to="/external/evaluate">Evaluate</Link>
            <Link to="#about">About</Link>
          </div>
          <div className="main-content">
            <div className="loading">Loading dashboard data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="external-dashboard">
      <Navbar />
      <div className="dashboard-container">
        <div className="sidebar">
          <Link to="/externaldashboard" className="active">Home</Link>
          <Link to="/external/evaluate">Evaluate</Link>
          <Link to="#about">About</Link>
        </div>
        <div className="main-content">
          {error && <div className="error">{error}</div>}

          {/* External Examiner Profile */}
          {external && (
            <div className="profile-section">
              <h2>External Examiner Profile</h2>
              <div className="profile-card">
                <div className="profile-info">
                  <p><strong>Name:</strong> {external.name}</p>
                  <p><strong>ID:</strong> {external.externalId}</p>
                  <p><strong>Organization:</strong> {external.externalOrganization}</p>
                  <p><strong>Position:</strong> {external.externalPosition}</p>
                  <p><strong>Expertise:</strong></p>
                  <ul>
                    {external.externalExpertise?.map((expertise, index) => (
                      <li key={index}>{expertise}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Assigned Students */}
          <div className="students-section">
            <h2>Assigned Students</h2>
            {assignedStudents.length === 0 ? (
              <p>No students assigned for evaluation yet.</p>
            ) : (
              <div className="students-grid">
                {assignedStudents.map(student => (
                  <div key={student._id} className="student-card">
                    <h3>{student.name}</h3>
                    <p><strong>Student ID:</strong> {student.studentId}</p>
                    <p><strong>Department:</strong> {student.department}</p>
                    <p><strong>Project:</strong> {student.projectTitle}</p>
                    <p><strong>Status:</strong> {student.evaluation?.status || 'Not Evaluated'}</p>
                    <Link 
                      to="/external/evaluate" 
                      className="evaluate-btn"
                    >
                      Evaluate Student
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExternalDashboard; 