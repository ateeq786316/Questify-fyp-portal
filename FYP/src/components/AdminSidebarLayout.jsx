import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaBars, FaHome, FaUsers, FaCalendarAlt, FaCog, FaGraduationCap, FaChartPie } from 'react-icons/fa';
import Navbar from './Navbar';
import '../styles/shared.css';
import './AdminSidebarLayout.css';

const AdminSidebarLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      isCollapsed ? "80px" : "250px"
    );
    return () => {
      document.documentElement.style.removeProperty("--sidebar-width");
    };
  }, [isCollapsed]);

  // Check authentication on mount and when location changes
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/adminlogin');
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate, location]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      <Navbar />
      <div className="admin-dashboard">
        {/* Mobile Sidebar Toggle */}
        <button className="mobile-sidebar-toggle" onClick={() => setIsCollapsed(!isCollapsed)}>
          <FaBars />
        </button>

        {/* Sidebar */}
        <div className={`admin-sidebar ${isCollapsed ? "admin-sidebar--collapsed" : ""}`}
             onMouseEnter={() => setIsCollapsed(false)}
             onMouseLeave={() => setIsCollapsed(true)}>
          
          {/* Sidebar Title */}
          <h2 className={`admin-sidebar__title ${isCollapsed ? "admin-sidebar__title--hidden" : ""}`}>
            Admin Dashboard
          </h2>

          {/* Sidebar Menu */}
          <ul className="admin-sidebar__menu">
            <li className={`admin-sidebar__item ${location.pathname === "/admindashboard" ? "admin-sidebar__item--active" : ""}`}>
              <div onClick={() => navigate('/admindashboard')} className="admin-sidebar__link">
                <FaHome className="admin-sidebar__icon" />
                {!isCollapsed && <span className="admin-sidebar__text">Dashboard</span>}
              </div>
            </li>
            <li className={`admin-sidebar__item ${location.pathname === "/usermanagement" ? "admin-sidebar__item--active" : ""}`}>
              <div onClick={() => navigate('/usermanagement')} className="admin-sidebar__link">
                <FaUsers className="admin-sidebar__icon" />
                {!isCollapsed && <span className="admin-sidebar__text">User Management</span>}
              </div>
            </li>
            <li className={`admin-sidebar__item ${location.pathname === "/admin/upload-students" ? "admin-sidebar__item--active" : ""}`}>
              <div onClick={() => navigate('/admin/upload-students')} className="admin-sidebar__link">
                <FaGraduationCap className="admin-sidebar__icon" />
                {!isCollapsed && <span className="admin-sidebar__text">Upload Students</span>}
              </div>
            </li>
            <li className={`admin-sidebar__item ${location.pathname === "/admin/upload-supervisors" ? "admin-sidebar__item--active" : ""}`}>
              <div onClick={() => navigate('/admin/upload-supervisors')} className="admin-sidebar__link">
                <FaUsers className="admin-sidebar__icon" />
                {!isCollapsed && <span className="admin-sidebar__text">Upload Supervisors</span>}
              </div>
            </li>
            <li className={`admin-sidebar__item ${location.pathname === "/admin/milestones" ? "admin-sidebar__item--active" : ""}`}>
              <div onClick={() => navigate('/admin/milestones')} className="admin-sidebar__link">
                <FaCalendarAlt className="admin-sidebar__icon" />
                {!isCollapsed && <span className="admin-sidebar__text">Milestones</span>}
              </div>
            </li>
            <li className={`admin-sidebar__item ${location.pathname === "/admin/settings" ? "admin-sidebar__item--active" : ""}`}>
              <div onClick={() => navigate('/admin/settings')} className="admin-sidebar__link">
                <FaCog className="admin-sidebar__icon" />
                {!isCollapsed && <span className="admin-sidebar__text">Settings</span>}
              </div>
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