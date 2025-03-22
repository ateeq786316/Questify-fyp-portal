import React from "react";
import { Line } from "react-chartjs-2";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../../../styles/Test.css";
import "chart.js/auto";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";

const StudentDashboard = () => {
  const progressData = {
    labels: ["Proposal", "Proposal defense","SRS", "system diagrams", "Mid development", "Final Report"],
    datasets: [
      {
        label: "FYP Progress",
        data: [0, 20, 10, 40,45 ,100 ],
        backgroundColor: "rgba(75,192,192,0.2)",
        borderColor: "rgba(75,192,192,1)",
        borderWidth: 2,
      },
    ],
  };

  return (
    <div>
      {/* <Navbar /> */}
      <Sidebar />
    <div className="dashboard-container">
      {/* Project Summary */}
      <div className="project-summary card">
        <h2>FYP Dashboard</h2>
        <p><strong>Project Title:</strong> AI-Powered Chatbot</p>
        <p><strong>Status:</strong> In Progress</p>
        <p><strong>Supervisor:</strong> Dr. John Doe</p>
        <p><strong>Start Date:</strong> Jan 15, 2025</p>
        <p><strong>Deadline:</strong> Dec 10, 2025</p>
      </div>
      
      {/* Progress Visualization */}
      <div className="progress-section card">
        <h3>Progress Overview</h3>
        <Line data={progressData} />
      </div>

      

      {/* Recent Activity */}
      <div className="recent-activity card">
        <h3>Recent Feedback</h3>
        <p><strong>Last Feedback:</strong> "Great progress! Improve your methodology section."</p>
        <p><strong>Recent Submission:</strong> Methodology Report (Submitted: Feb 25, 2025)</p>
      </div>

      {/* Reminders & Alerts */}
      <div className="reminders card">
        <h3>Upcoming Deadlines</h3>
        <p>Data Collection Phase - Due: March 15, 2025</p>
      </div>

      {/* Calendar */}
      <div className="calendar-section card">
        <h3>Project Timeline</h3>
        <Calendar />
      </div>
    </div>
    </div>
  );
};

export default StudentDashboard;