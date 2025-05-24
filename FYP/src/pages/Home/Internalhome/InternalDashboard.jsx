import React, { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "../../../styles/InternalDashboard.css";
import InternalSidebar from './InternalSidebar';

const InternalDashboard = () => {
  const [internal, setInternal] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [evaluations, setEvaluations] = useState({});
  const [feedback, setFeedback] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("internalToken");
        if (!token) {
          throw new Error("No authentication token found");
        }

        // Fetch internal examiner details
        const internalResponse = await axios.get(
          "http://localhost:5000/api/internal/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Fetch students for evaluation
        const studentsResponse = await axios.get(
          "http://localhost:5000/api/internal/students",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setInternal(internalResponse.data.internal);
        setStudents(studentsResponse.data.students);

        // Initialize evaluations and feedback
        const initialEvaluations = {};
        const initialFeedback = {};
        studentsResponse.data.students.forEach((student) => {
          initialEvaluations[student._id] = student.evaluation?.internalMarks?.marks || 0;
          initialFeedback[student._id] = student.evaluation?.internalMarks?.feedback || "";
        });
        setEvaluations(initialEvaluations);
        setFeedback(initialFeedback);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.response?.data?.msg || "Failed to fetch data");
        toast.error(err.response?.data?.msg || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEvaluationChange = (studentId, value) => {
    // Ensure value is between 0 and 50
    const marks = Math.min(Math.max(0, value), 50);
    setEvaluations((prev) => ({
      ...prev,
      [studentId]: marks,
    }));
  };

  const handleFeedbackChange = (studentId, value) => {
    setFeedback((prev) => ({
      ...prev,
      [studentId]: value,
    }));
  };

  const handleSubmitEvaluation = async (studentId) => {
    try {
      const token = localStorage.getItem("internalToken");
      const response = await axios.post(
        "http://localhost:5000/api/internal/evaluate",
        {
          studentId,
          marks: evaluations[studentId],
          feedback: feedback[studentId],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success("Evaluation submitted successfully");
      } else {
        throw new Error(response.data.msg || "Failed to submit evaluation");
      }
    } catch (err) {
      console.error("Error submitting evaluation:", err);
      toast.error(err.response?.data?.msg || "Failed to submit evaluation");
    }
  };

  if (loading) {
  return (
    <div className="internal-dashboard">
        <Navbar />
        <div className="dashboard-container">
          <div className="sidebar">
            <Link to="/internaldashboard" className="active">Home</Link>
            <Link to="#about">About</Link>
          </div>
          <div className="main-content">
            <div className="loading">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

          return (
    <div className="internal-dashboard">
      <Navbar />
      <div className="internal-dashboard-container">
        <InternalSidebar />
        <div className="internal-dashboard-content">
          {/* Internal Examiner Details */}
          {internal && (
            <div className="internal-details">
              <div className="detail-item">
                <h3>Internal Examiner ID</h3>
                <p>{internal.internalId || "Not Available"}</p>
              </div>
              <div className="detail-item">
                <h3>Name</h3>
                <p>{internal.name || "Not Available"}</p>
              </div>
              <div className="detail-item">
                <h3>Email</h3>
                <p>{internal.email || "Not Available"}</p>
              </div>
              <div className="detail-item">
                <h3>Department</h3>
                <p>{internal.department || "Not Available"}</p>
              </div>
              <div className="detail-item">
                <h3>Expertise</h3>
                <p>{internal.internalExpertise?.join(", ") || "Not Available"}</p>
              </div>
            </div>
          )}

          {/* Students List */}
          <div className="students-section">
            <h2>Students for Evaluation</h2>
            {error && <div className="error-message">{error}</div>}
            <div className="students-table-container">
              <table className="students-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Student ID</th>
                    <th>Project</th>
                    <th>Department</th>
                    <th>Final Report</th>
                    <th>Marks</th>
                    <th>Feedback</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id}>
                      <td>{student.name}</td>
                      <td>{student.studentId}</td>
                      <td>{student.projectTitle}</td>
                      <td>{student.department}</td>
                      <td>
                        {student.finalReport ? (
                          <a
                            href={`http://localhost:5000/${student.finalReport.filePath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="view-report-btn"
                          >
                            View Report
                          </a>
                        ) : (
                          <span className="no-report">No Report</span>
                        )}
                      </td>
                      <td>
              <input
                type="number"
                          min="0"
                          max="50"
                          value={evaluations[student._id] || 0}
                          onChange={(e) =>
                            handleEvaluationChange(student._id, parseInt(e.target.value))
                          }
                className="marks-input"
                        />
                      </td>
                      <td>
                        <textarea
                          value={feedback[student._id] || ""}
                          onChange={(e) =>
                            handleFeedbackChange(student._id, e.target.value)
                          }
                          placeholder="Enter feedback..."
                          className="feedback-input"
                        />
                      </td>
                      <td>
              <button
                          className="submit-evaluation"
                          onClick={() => handleSubmitEvaluation(student._id)}
              >
                          Submit
              </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternalDashboard;
