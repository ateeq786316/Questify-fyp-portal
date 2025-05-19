import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../../components/Sidebar.css';

const SupervisorSidebar = () => {
  const location = useLocation();
  const isCollapsed = true; // Always start collapsed, can add state if you want expand/collapse
  return (
    <div className={`student-sidebar ${isCollapsed ? 'student-sidebar--collapsed' : ''}`}
         onMouseEnter={e => e.currentTarget.classList.remove('student-sidebar--collapsed')}
         onMouseLeave={e => e.currentTarget.classList.add('student-sidebar--collapsed')}
    >
      {/* Sidebar Title */}
      <h2 className={`student-sidebar__title ${isCollapsed ? 'student-sidebar__title--hidden' : ''}`}>
        Supervisor Dashboard
      </h2>
      <ul className="student-sidebar__menu">
        <li className={`student-sidebar__item ${location.pathname === "/supervisordashboard" ? "student-sidebar__item--active" : ""}`}>
          <Link to="/supervisordashboard" className="student-sidebar__link">
            <span className="student-sidebar__icon">🏠</span>
            {!isCollapsed && <span className="student-sidebar__text">Home</span>}
          </Link>
        </li>
        <li className={`student-sidebar__item ${location.pathname === "/supervisor/reviewdocument" ? "student-sidebar__item--active" : ""}`}>
          <Link to="/supervisor/reviewdocument" className="student-sidebar__link">
            <span className="student-sidebar__icon">📄</span>
            {!isCollapsed && <span className="student-sidebar__text">Review Document</span>}
          </Link>
        </li>
        <li className={`student-sidebar__item ${location.pathname === "/supervisor/evaluate" ? "student-sidebar__item--active" : ""}`}>
          <Link to="/supervisor/evaluate" className="student-sidebar__link">
            <span className="student-sidebar__icon">✅</span>
            {!isCollapsed && <span className="student-sidebar__text">Evaluate</span>}
          </Link>
        </li>
        <li className={`student-sidebar__item ${location.hash === "#about" ? "student-sidebar__item--active" : ""}`}>
          <Link to="#about" className="student-sidebar__link">
            <span className="student-sidebar__icon">ℹ️</span>
            {!isCollapsed && <span className="student-sidebar__text">About</span>}
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default SupervisorSidebar; 