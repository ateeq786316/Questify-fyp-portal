import React, { useState } from 'react';
import logo from "./assets/logo.png";
import admin from './assets/admin-icon.avif';
import student from './assets/students-icon.jpg'
import internal from './assets/internal-icon.png'
import external from './assets/external-icon.png'
import supervisor from './assets/supervisor-icon.png'
import Navbar from './components/Navbar.jsx';
import './styles/PortalPage.css';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import { useNavigate } from 'react-router-dom';



function PortalPage() {
  const navigate = useNavigate();

    return (

      <div> <Navbar /> {/* ✅ Navbar at the top */}
      <div className="portal-page">
        
        <div className="content">
          <div className="left-section">
            <img
              src={logo} // Replace with your logo path
              alt="University Logo"
              className="university-logo"
            />
            <div className="university-info">
              <strong>LAHORE GARRISON UNIVERSITY,</strong>
              <br />
              LAHORE, PAKISTAN
            </div>
          </div>
  
          <div className="right-section">
            <h2>Select Portal</h2>
            <p className="portal-description">
              Select the portal you would like to visit.
            </p>
            <div className="portal-buttons">
              <button className="portal-button"
              onClick={() => navigate('/adminlogin')} // Inline anonymous function
              >
                <img src={admin} alt="admin" />
                <br />
                ADMIN
              </button>
              <button className="portal-button"
              onClick={() => navigate('/studentlogin')} // Inline anonymous function
              >
                
                <img src={student} alt="Students" />
                <br />
                STUDENT
              </button>
              <button className="portal-button"
              onClick={() => navigate('/supervisorlogin')} // Inline anonymous function
              >
                <img src={supervisor} alt="supervisor" />
                <br />
                SUPERVISOR
              </button>
              <button className="portal-button"
              onClick={() => navigate('/internallogin')} // Inline anonymous function
              >
                <img src={internal} alt="internal" />
                <br />
                INTERNAL
              </button>
              <button className="portal-button"
              onClick={() => navigate('/externallogin')} // Inline anonymous function
              >
                <img src={external} alt="external" /> 
                <br />
                EXTERNAL
              </button>
            </div>
            <div className='rights'>
              2025 Questify FYP portal design (<a href="https://github.com/ateeq786316" target="_blank" rel="noopener noreferrer">ateeq786316</a>) All right reserved
            </div>
          </div>
        </div>     
      </div>
      </div>
      
    );
}

export default PortalPage;
