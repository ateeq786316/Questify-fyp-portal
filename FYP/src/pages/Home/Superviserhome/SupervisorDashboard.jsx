import React from 'react';
import '../../../styles/SupervisorDashboard.css'; // Custom CSS file for styling
import Navbar from "../../../components/Navbar.jsx";

const SupervisorDashboard = () => {
  return (
    <div className="dashboard-container">
      {/* Navbar */}
      <Navbar />
      {/* Sidebar */}
      
      <div className="sidebar">
        <a className="active" href="#home">Home</a>
        <a href="#review">Review Document</a>
        <a href="#evaluate">Evaluate</a>
        <a href="#about">About</a>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Supervisor Details */}
        <div className="supervisor-details">
          <h2>Supervisor ID: 12345</h2>
          <h2>Name: Rabia Khan</h2>
          <p>Expertise</p>
          <ul>
            <li>Expertise 1</li>
            <li>Expertise 2</li>
            <li>Expertise 3</li>
          </ul>
        </div>

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
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>Ali</td>
                  <td>AI Model</td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>Sarah</td>
                  <td>Web Development</td>
                </tr>
                <tr>
                  <td>3</td>
                  <td>John</td>
                  <td>Data Analysis</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Requests */}
          <div className="requests">
            <div className="section-header">Requests</div>
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
                <tr>
                  <td>1</td>
                  <td>Ali</td>
                  <td>AI Model</td>
                  <td className="action-buttons">
                    <button className="approve">Approve</button>
                    <button className="reject">Reject</button>
                  </td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>Sarah</td>
                  <td>Web Development</td>
                  <td className="action-buttons">
                    <button className="approve">Approve</button>
                    <button className="reject">Reject</button>
                  </td>
                </tr>
                <tr>
                  <td>3</td>
                  <td>John</td>
                  <td>Data Analysis</td>
                  <td className="action-buttons">
                    <button className="approve">Approve</button>
                    <button className="reject">Reject</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;