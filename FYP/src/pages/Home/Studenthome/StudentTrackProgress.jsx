import React, { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";
import "../../../styles/StudentTrackProgress.css";
import { ProgressBar, Table, Form } from "react-bootstrap";
import { fetchMilestonesAndFeedback } from "../../../services/student";
import { toast } from "react-toastify";
// import bgImage from "../../../assets/lgubgimg.jpg"; // Background Image Import

const StudentTrackProgress = () => {
  const [progress, setProgress] = useState(0);
  const [milestones, setMilestones] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchMilestonesAndFeedback();
        setMilestones(response.milestones);
        setFeedback(response.feedback);
        
        // Calculate progress based on completed milestones
        const completedCount = response.milestones.filter(
          m => m.status === "completed"
        ).length;
        const totalCount = response.milestones.length;
        const progressPercentage = Math.round((completedCount / totalCount) * 100);
        setProgress(progressPercentage);
      } catch (error) {
        toast.error("Failed to fetch progress data");
        console.error("Error fetching progress:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "completed";
      case "pending":
        return "pending";
      case "upcoming":
        return "upcoming";
      default:
        return "";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="student-track-progress">
        <Navbar />
        <div className="student-track-progress__layout">
          <div className="student-track-progress__sidebar">
            <Sidebar />
          </div>
          <div className="student-track-progress__content">
            <div className="student-track-progress__loading">Loading progress data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="student-track-progress">
      <Navbar />
      <div className="student-track-progress__layout">
        <div className="student-track-progress__sidebar">
          <Sidebar />
        </div>
        <div className="student-track-progress__content">
          <h1 className="dashboard-title text-center">📌 Student Progress Tracker</h1>
          
          {/* Progress Bar */}
          <div className="student-track-progress__section mb-4">
            <h2>🚀 Current Progress</h2>
            <ProgressBar now={progress} label={`${progress}% Completed`} className="student-track-progress__bar" />
          </div>
          
          {/* Milestones Table */}
          <div className="student-track-progress__section mb-4">
            <h2>📅 FYP Milestones</h2>
            <Table striped bordered hover className="student-track-progress__table">
              <thead>
                <tr>
                  <th>Step</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {milestones.map((milestone, index) => (
                  <tr key={index}>
                    <td className="student-track-progress__step">{milestone.name}</td>
                    <td className={`student-track-progress__status--${milestone.status.toLowerCase()}`}>{milestone.status}</td>
                    <td>{formatDate(milestone.deadline)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          
          {/* Feedback Section */}
          <div className="student-track-progress__section mb-4">
            <h2>📝 Supervisor Feedback</h2>
            <p className="student-track-progress__feedback">
              {feedback || "No feedback available yet."}
            </p>
          </div>
          
          {/* Document Submission */}
          <div className="student-track-progress__section mb-4">
            <h2>📤 Document Submission</h2>
            <Form>
              <Form.Group controlId="formFile" className="mb-3">
                <Form.Label>Upload Your Progress Document</Form.Label>
                <Form.Control type="file" />
              </Form.Group>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentTrackProgress;
