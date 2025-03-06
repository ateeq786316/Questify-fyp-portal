import React, { useState } from "react";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";
import "../../../styles/StudentTrackProgress.css";
import { ProgressBar, Table, Form } from "react-bootstrap";
import bgImage from "../../../assets/lgubgimg.jpg"; // Background Image Import

const StudentTrackProgress = () => {
  const [progress, setProgress] = useState(60); // Dynamic Progress
  const milestones = [
    { step: "Proposal Submission", status: "Completed", date: "Jan 10, 2025" },
    { step: "Supervisor Assignment", status: "Completed", date: "Jan 15, 2025" },
    { step: "Project Approval", status: "Pending", date: "Feb 5, 2025" },
    { step: "Mid-Term Evaluation", status: "Upcoming", date: "April 10, 2025" },
    { step: "Final Submission", status: "Upcoming", date: "June 10, 2025" },
  ];

  return (
    <div 
      className="student-track-progress" 
      style={{ backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <Navbar />
      <div className="dashboard-container d-flex">
        <Sidebar />
        <div className="dashboard-content p-4 w-100">
          <h1 className="dashboard-title text-center">📌 Student Progress Tracker</h1>
          
          {/* Progress Bar */}
          <div className="progress-section mb-4">
            <h2>🚀 Current Progress</h2>
            <ProgressBar now={progress} label={`${progress}% Completed`} className="progress-bar" />
          </div>
          
          {/* Milestones Table */}
          <div className="milestones-section mb-4">
            <h2>📅 FYP Milestones</h2>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Step</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {milestones.map((milestone, index) => (
                  <tr key={index} className={milestone.status === "Completed" ? "completed" : "pending"}>
                    <td>{milestone.step}</td>
                    <td>{milestone.status}</td>
                    <td>{milestone.date}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          
          {/* Feedback Section */}
          <div className="feedback-section mb-4">
            <h2>📝 Supervisor Feedback</h2>
            <p className="feedback-text">"Great progress so far! Keep refining the project scope."</p>
          </div>
          
          {/* Document Submission */}
          <div className="submission-section mb-4">
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
