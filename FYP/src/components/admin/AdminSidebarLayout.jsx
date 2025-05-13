import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaBars, FaHome, FaUsers, FaCalendarAlt, FaCog, FaGraduationCap, FaChartPie } from 'react-icons/fa';
import Navbar from '../Navbar';
import './AdminSidebarLayout.css';

const AdminSidebarLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div>
      <Navbar />
      <div className={`admin-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
        {/* Mobile Sidebar Toggle */}
        <button className="mobile-sidebar-toggle" onClick={toggleMobileSidebar}>
          <FaBars />
        </button>

        {/* Sidebar */}
        <div className={`sidebar ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
          <div className="sidebar-header">
            <h3>FYP Dashboard</h3>
            <button className="sidebar-toggle" onClick={toggleSidebar}>
              {sidebarOpen ? '◀' : '▶'}
            </button>
          </div>
          
          <ul className="sidebar-menu">
            <li 
              className={isActive('/admindashboard') ? 'active' : ''} 
              onClick={() => navigate('/admindashboard')}
            >
              <FaHome className="sidebar-icon" />
              {sidebarOpen && <span>Dashboard</span>}
            </li>
            <li 
              className={isActive('/admin/upload-students') ? 'active' : ''} 
              onClick={() => navigate('/admin/upload-students')}
            >
              <FaGraduationCap className="sidebar-icon" />
              {sidebarOpen && <span>Students</span>}
            </li>
            <li 
              className={isActive('/admin/upload-supervisors') ? 'active' : ''} 
              onClick={() => navigate('/admin/upload-supervisors')}
            >
              <FaUsers className="sidebar-icon" />
              {sidebarOpen && <span>Supervisors</span>}
            </li>
            <li 
              className={isActive('/usermanagement') ? 'active' : ''} 
              onClick={() => navigate('/usermanagement')}
            >
              <FaUsers className="sidebar-icon" />
              {sidebarOpen && <span>User Management</span>}
            </li>
            <li>
              <FaCalendarAlt className="sidebar-icon" />
              {sidebarOpen && <span>Milestones</span>}
            </li>
            <li>
              <FaChartPie className="sidebar-icon" />
              {sidebarOpen && <span>Reports</span>}
            </li>
            <li>
              <FaCog className="sidebar-icon" />
              {sidebarOpen && <span>Settings</span>}
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminSidebarLayout; 