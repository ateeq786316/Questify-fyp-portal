import React, { useState, useEffect } from 'react';
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar.jsx";
import bell from "../../../assets/bell_icon.svg";
import "../../../styles/StudentDashboard.css";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "chart.js/auto";
import { Line } from "react-chartjs-2";
// import { fetchStudentDetails } from "../../../services/student"; // Import API
import { FaUserGraduate, FaProjectDiagram, FaChalkboardTeacher, FaCalendarAlt } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

const StudentDashboard = () => {
  const [date, setDate] = useState(new Date());
  const [studentDetails, setStudentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const progressData = {
    labels: ["Proposal", "Proposal defense","SRS", "system diagrams", "Mid development", "Final Report"],
    datasets: [
      {
        label: "FYP Progress",
        data: [0, 20, 10, 40,0 ,0 ],
        backgroundColor: "rgba(75,192,192,0.2)",
        borderColor: "rgba(75,192,192,1)",
        borderWidth: 2,
      },
    ],
  };

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const token = localStorage.getItem("studentToken");
        if (!token) {
          setError("No token found");
          setLoading(false);
          return;
        }

        const response = await axios.get("http://localhost:5000/api/auth/student/details", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setStudentDetails(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching student details:", err);
        setError(err.response?.data?.msg || "Failed to fetch student details");
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, []);

  if (loading) return <div className="text-center p-5">Loading...</div>;
  if (error) return <div className="text-center p-5 text-danger">Error: {error}</div>;
  if (!studentDetails) return <div className="text-center p-5">No student details found</div>;

  return (
    <div className="student-dashboard">
      <Navbar />
      <div className="dashboard-container d-flex">
        <Sidebar />
        <div className="dashboard-content p-4 w-100">
          <h1 className="dashboard-title text-center">🎓 Student Dashboard</h1>
          
          {/* Banner Component */}
          <div className="banner-container">
            <div className="banner-content">
              <div className="banner-text">
                <div className="banner-date">
                  <p>Date: {new Date().toLocaleDateString()}</p>
                </div>
                <div className="banner-welcome">
                  Welcome back, {studentDetails.name}!
                </div>
                <div className="banner-message">
                  Always stay updated in your student portal
                </div>
              </div>
              <div className="banner-image">
                <div className="icon-wrapper" data-number="1">
                  <img src={bell} alt="" className="bell-icon" />
                </div>
              </div>
            </div>
          </div>

          {/* Top 4 Cards */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="card text-center p-3">
                <FaUserGraduate className="icon" />
                <h3>Group ID: {studentDetails.groupID}</h3>
                <div className="team-members">
                  <h4>Team Members:</h4>
                  {studentDetails.teamMembers?.map((member, index) => (
                    <div key={index} className="member-details">
                      <p><strong>Name:</strong> {member.name}</p>
                      <p><strong>ID:</strong> {member.studentId}</p>
                      <p><strong>Program:</strong> {member.program}</p>
                      <p><strong>CGPA:</strong> {member.cgpa}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center p-3">
                <FaProjectDiagram className="icon" />
                <h3>Project: {studentDetails.projectTitle}</h3>
                <p>Category: {studentDetails.projectCategory}</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center p-3">
                <FaChalkboardTeacher className="icon" />
                <h3>Supervisor: {studentDetails.supervisor?.name}</h3>
                <p>Department: {studentDetails.supervisor?.department}</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center p-3">
                <FaCalendarAlt className="icon" />
                <h3>Deadline: {studentDetails.endDate ? new Date(studentDetails.endDate).toLocaleDateString() : "Not set"}</h3>
                <p>Final Presentation Date</p>
              </div>
            </div>
          </div>

          {/* Progress Tracking */}
          {/* FYP Sections in Cards */}
          <div className="row g-3">
            {/* Progress Tracking Card */}
            <div className="col-md-6">
              <div className="card p-3">
                <h2>📊 FYP Progress Tracking</h2>
                {/* // <div className="progress" style={{ height: "25px" }}> */}
                {/* <div className="progress-bar bg-success" style={{ width: "50%" }}>50% Completed</div> */}
                {/*     <Line data={progressData} /> */}
                {/* </div>  */}
                
                <div className="progress-section card">
                  <h3>Progress Overview</h3>
                  <Line data={progressData} />
                </div>
              </div>
            </div>

            {/* Calendar Integration Card */}
            <div className="col-md-6">
              <div className="card p-3">
                <h2>📅 Calendar Integration</h2>
                {/* <input type="date" className="form-control" /> */}
                <Calendar />
              </div>
            </div>

            {/* FYP Labs Mapping Card */}
            <div className="col-md-6">
              <div className="card p-3">
                <h2>📍 FYP Labs Map</h2>
                <p>Lab 1: 79 LAB</p>
                <p>Lab 2: AI LAB</p>
                <p>Lab 3: GAMING LAB</p>
              </div>
            </div>

            {/* FYP Roadmap Card */}
            <div className="col-md-6">
              <div className="card p-3">
                <h2>🚀 FYP Roadmap</h2>
                <ul className="list-group">
                  <li className="list-group-item">✔ Proposal Submission</li>
                  <li className="list-group-item">📌 Supervisor Assignment</li>
                  <li className="list-group-item">📝 Mid-Term Evaluation</li>
                  <li className="list-group-item">📢 Final Presentation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;