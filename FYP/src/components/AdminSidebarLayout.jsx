import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaBars, FaHome, FaUsers, FaCalendarAlt, FaCog, FaGraduationCap, FaChartPie } from 'react-icons/fa';
import Navbar from './Navbar';
import '../styles/shared.css';
import './AdminSidebarLayout.css';

const AdminSidebarLayout = ({ children }) => {
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication on mount and when location changes
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/adminlogin');
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate, location]);

  // Sidebar toggle functions
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      <Navbar />
      <div className={`admin-dashboard ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
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
            <li className={location.pathname === '/admindashboard' ? 'active' : ''} onClick={() => navigate('/admindashboard')} style={{cursor: 'pointer'}}>
              <FaHome className="sidebar-icon" />
              {sidebarOpen && <span>Dashboard</span>}
            </li>
            <li className={location.pathname === '/admin/upload-students' ? 'active' : ''} onClick={() => navigate('/admin/upload-students')} style={{cursor: 'pointer'}}>
              <FaGraduationCap className="sidebar-icon" />
              {sidebarOpen && <span>Students</span>}
            </li>
            <li className={location.pathname === '/admin/upload-supervisors' ? 'active' : ''} onClick={() => navigate('/admin/upload-supervisors')} style={{cursor: 'pointer'}}>
              <FaUsers className="sidebar-icon" />
              {sidebarOpen && <span>Supervisors</span>}
            </li>
            <li className={location.pathname === '/admin/milestones' ? 'active' : ''} onClick={() => navigate('/admin/milestones')} style={{cursor: 'pointer'}}>
              <FaCalendarAlt className="sidebar-icon" />
              {sidebarOpen && <span>Milestones</span>}
            </li>
            <li className={location.pathname === '/admin/reports' ? 'active' : ''} onClick={() => navigate('/admin/reports')} style={{cursor: 'pointer'}}>
              <FaChartPie className="sidebar-icon" />
              {sidebarOpen && <span>Reports</span>}
            </li>
            <li className={location.pathname === '/usermanagement' ? 'active' : ''} onClick={() => navigate('/usermanagement')} style={{cursor: 'pointer'}}>
              <FaCog className="sidebar-icon" />
              {sidebarOpen && <span>User Management</span>}
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="main-content">
          <div className="dashboard-content">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebarLayout; 