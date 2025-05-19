import React, { useState, useEffect } from 'react';
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar.jsx";
import bell from "../../../assets/bell_icon_new1.png";
import "../../../styles/StudentDashboard.css";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "chart.js/auto";
import { Line } from "react-chartjs-2";
import { FaUserGraduate, FaProjectDiagram, FaChalkboardTeacher, FaCalendarAlt } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from 'react-toastify';
import API from '../../../services/api';

const StudentDashboard = () => {
  const [date, setDate] = useState(new Date());
  const [studentDetails, setStudentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progressData, setProgressData] = useState({
    labels: ["Proposal", "Proposal defense", "SRS", "System diagrams", "Mid development", "Final Report"],
    datasets: [
      {
        label: "FYP Progress",
        data: [0, 0, 0, 0, 0, 0],
        backgroundColor: "rgba(75,192,192,0.2)",
        borderColor: "rgba(75,192,192,1)",
        borderWidth: 2,
      },
    ],
  });

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const token = localStorage.getItem("studentToken");
        if (!token) {
          setError("No token found");
          setLoading(false);
          return;
        }

        const response = await API.get("/auth/student/details");

        if (!response.data) {
          throw new Error("No data received from server");
        }

        setStudentDetails(response.data);
        
        // Update progress data based on student details
        if (response.data.progress) {
          setProgressData(prevData => ({
            ...prevData,
            datasets: [{
              ...prevData.datasets[0],
              data: [
                response.data.progress.proposal || 0,
                response.data.progress.proposalDefense || 0,
                response.data.progress.srs || 0,
                response.data.progress.systemDiagrams || 0,
                response.data.progress.midDevelopment || 0,
                response.data.progress.finalReport || 0
              ]
            }]
          }));
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching student details:", err);
        const errorMessage = err.response?.data?.msg || "Failed to fetch student details";
        setError(errorMessage);
        toast.error(errorMessage);
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, []);

  if (loading) {
    return (
      <div className="student-dashboard">
        <Navbar />
        <div className="student-dashboard__layout">
          <Sidebar />
          <div className="student-dashboard__content">
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-dashboard">
        <Navbar />
        <div className="student-dashboard__layout">
          <Sidebar />
          <div className="student-dashboard__content">
            <div className="alert alert-danger text-center" role="alert">
              <h4 className="alert-heading">Error!</h4>
              <p>{error}</p>
              <hr />
              <p className="mb-0">Please try refreshing the page or contact support if the problem persists.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!studentDetails) {
    return (
      <div className="student-dashboard">
        <Navbar />
        <div className="student-dashboard__layout">
          <Sidebar />
          <div className="student-dashboard__content">
            <div className="alert alert-warning text-center" role="alert">
              <h4 className="alert-heading">No Data Available</h4>
              <p>No student details found. Please contact your administrator.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <Navbar />
      <div className="student-dashboard__layout">
        <Sidebar />
        <div className="student-dashboard__content">
          <h1 className="dashboard-title text-center">🎓 Student Dashboard</h1>

          {/* Banner Component */}
          <div className="banner-container">
            <div className="banner-content">
              <div className="banner-text">
                <div className="banner-date">
                  <p>Date: {new Date().toLocaleDateString()}</p>
                </div>
                <div className="banner-welcome">
                  Welcome back, {studentDetails?.studentInfo?.name}!
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
          
          {/* Top Cards - 3 per row */}
          <div className="row g-3 mb-4">
            {/* Student Info Card */}
            <div className="col-md-4">
              <div className="card text-center p-3">
                <FaUserGraduate className="icon" />
                <h3>Student Info</h3>
                <div className="student-details">
                  <p><strong>ID:</strong> {studentDetails?.studentInfo?.studentId}</p>
                  <p><strong>Program:</strong> {studentDetails?.studentInfo?.program}</p>
                  <p><strong>CGPA:</strong> {studentDetails?.studentInfo?.cgpa}</p>
                  <p><strong>Department:</strong> {studentDetails?.studentInfo?.department}</p>
                  <p><strong>Contact:</strong> {studentDetails?.studentInfo?.contact}</p>
                </div>
              </div>
            </div>

            {/* Project Info Card */}
            <div className="col-md-4">
              <div className="card text-center p-3">
                <FaProjectDiagram className="icon" />
                <h3>Project Details</h3>
                <p><strong>Title:</strong> {studentDetails?.projectInfo?.title}</p>
                <p><strong>Category:</strong> {studentDetails?.projectInfo?.category}</p>
                <p><strong>Status:</strong> {studentDetails?.projectInfo?.status}</p>
                <p><strong>Proposal:</strong> {studentDetails?.projectInfo?.proposalStatus}</p>
                <p><strong>Submitted:</strong> {studentDetails?.projectInfo?.submissionDate ? new Date(studentDetails.projectInfo.submissionDate).toLocaleDateString() : "Not submitted"}</p>
                {studentDetails?.projectInfo?.proposalFile && (
                  <p><strong>Proposal File:</strong> <a href={studentDetails.projectInfo.proposalFile} target="_blank" rel="noopener noreferrer">View</a></p>
                )}
                {studentDetails?.projectInfo?.plagiarismReport && (
                  <p><strong>Plagiarism Report:</strong> <a href={studentDetails.projectInfo.plagiarismReport} target="_blank" rel="noopener noreferrer">View</a></p>
                )}
              </div>
            </div>

            {/* Evaluation Card */}
            <div className="col-md-12">
              <div className="card">
                <h3>Evaluation</h3>
                {studentDetails?.evaluation ? (
                  <div className="evaluation-marks">
                    <div className="evaluator-mark">
                      <h5>Supervisor Evaluation</h5>
                      <div className="mark">
                        {studentDetails.evaluation.supervisorMarks?.marks ? (
                          <>
                            <span>{studentDetails.evaluation.supervisorMarks.marks}</span>
                            <span>/ 50</span>
                          </>
                        ) : (
                          <span>Not evaluated</span>
                        )}
                      </div>
                      <div className="feedback">
                        {studentDetails.evaluation.supervisorMarks?.feedback || "No feedback provided"}
                      </div>
                      {studentDetails.evaluation.supervisorMarks?.evaluatedAt && (
                        <small>Evaluated on: {new Date(studentDetails.evaluation.supervisorMarks.evaluatedAt).toLocaleDateString()}</small>
                      )}
                    </div>

                    <div className="evaluator-mark">
                      <h5>Internal Evaluation</h5>
                      <div className="mark">
                        {studentDetails.evaluation.internalMarks?.marks ? (
                          <>
                            <span>{studentDetails.evaluation.internalMarks.marks}</span>
                            <span>/ 50</span>
                          </>
                        ) : (
                          <span>Not evaluated</span>
                        )}
                      </div>
                      <div className="feedback">
                        {studentDetails.evaluation.internalMarks?.feedback || "No feedback provided"}
                      </div>
                      {studentDetails.evaluation.internalMarks?.evaluatedAt && (
                        <small>Evaluated on: {new Date(studentDetails.evaluation.internalMarks.evaluatedAt).toLocaleDateString()}</small>
                      )}
                    </div>

                    <div className="evaluator-mark">
                      <h5>External Evaluation</h5>
                      <div className="mark">
                        {studentDetails.evaluation.externalMarks?.marks ? (
                          <>
                            <span>{studentDetails.evaluation.externalMarks.marks}</span>
                            <span>/ 50</span>
                          </>
                        ) : (
                          <span>Not evaluated</span>
                        )}
                      </div>
                      <div className="feedback">
                        {studentDetails.evaluation.externalMarks?.feedback || "No feedback provided"}
                      </div>
                      {studentDetails.evaluation.externalMarks?.evaluatedAt && (
                        <small>Evaluated on: {new Date(studentDetails.evaluation.externalMarks.evaluatedAt).toLocaleDateString()}</small>
                      )}
                    </div>

                    <div className="total-mark">
                      <h5>Total Marks</h5>
                      <div className="mark">
                        {(() => {
                          const total = [
                            studentDetails.evaluation.supervisorMarks?.marks || 0,
                            studentDetails.evaluation.internalMarks?.marks || 0,
                            studentDetails.evaluation.externalMarks?.marks || 0
                          ].reduce((sum, mark) => sum + mark, 0);
                          return (
                            <>
                              <span>{total}</span>
                              <span>/ 150</span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p>No evaluation available</p>
                )}
              </div>
            </div>

            {/* Supervisor Info Card */}
            <div className="col-md-4">
              <div className="card text-center p-3">
                <FaChalkboardTeacher className="icon" />
                <h3>Supervisor</h3>
                <p><strong>Name:</strong> {studentDetails?.supervisor?.name}</p>
                <p><strong>ID:</strong> {studentDetails?.supervisor?.supervisorId}</p>
                <p><strong>Department:</strong> {studentDetails?.supervisor?.department}</p>
                <p><strong>Email:</strong> {studentDetails?.supervisor?.email}</p>
                <p><strong>Contact:</strong> {studentDetails?.supervisor?.contact}</p>
                <p><strong>Expertise:</strong> {studentDetails?.supervisor?.expertise || "Not specified"}</p>
              </div>
            </div>

            {/* Timeline Card */}
            <div className="col-md-4">
              <div className="card text-center p-3">
                <FaCalendarAlt className="icon" />
                <h3>Timeline</h3>
                {studentDetails?.upcomingMilestone ? (
                  <>
                    <p className="text-primary mb-2">
                      <strong>Next Deadline:</strong>
                    </p>
                    <p className="mb-1">
                      <strong>{studentDetails.upcomingMilestone.name}</strong>
                    </p>
                    <p className="text-danger">
                      {new Date(studentDetails.upcomingMilestone.deadline).toLocaleDateString()}
                    </p>
                  </>
                ) : (
                  <p>No upcoming deadlines</p>
                )}
                <hr />
                <p><strong>Start Date:</strong> {studentDetails?.dates?.startDate ? new Date(studentDetails.dates.startDate).toLocaleDateString() : "Not set"}</p>
                <p><strong>End Date:</strong> {studentDetails?.dates?.endDate ? new Date(studentDetails.dates.endDate).toLocaleDateString() : "Not set"}</p>
                <p><strong>Group ID:</strong> {studentDetails?.groupID}</p>
            </div>
          </div>

            {/* Team Members Card */}
            <div className="col-md-4">
              <div className="card text-center p-3">
                <FaUserGraduate className="icon" />
                <h3>Team Members</h3>
                  {studentDetails?.teamMembers?.length > 0 ? (
                    studentDetails.teamMembers.map((member, index) => (
                    <div key={index} className="team-member">
                      <p><strong>{member.name}</strong></p>
                      <p>ID: {member.studentId}</p>
                      <p>Program: {member.program}</p>
                      </div>
                    ))
                  ) : (
                  <p>No team members assigned</p>
                  )}
              </div>
            </div>
          </div>

          {/* Progress Tracking */}
          <div className="row g-3">
            {/* Progress Tracking Card */}
            <div className="col-md-6">
              <div className="card p-3">
                <h2>📊 FYP Progress Tracking</h2>
                <div className="progress-section card">
                  <h3>Progress Overview</h3>
                  <Line 
                    data={progressData}
                    options={{
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                          ticks: {
                            callback: function(value) {
                              return value + '%';
                            }
                          }
                        }
                      },
                      plugins: {
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return context.dataset.label + ': ' + context.parsed.y + '%';
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Calendar Integration Card */}
            <div className="col-md-6">
              <div className="card p-3">
                <h2>📅 Calendar Integration</h2>
                <Calendar 
                  onChange={setDate}
                  value={date}
                  className="w-100"
                />
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