import { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const location = useLocation();  // Get current route
  const [active, setActive] = useState("chat");

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      isCollapsed ? "80px" : "250px"
    );
    return () => {
      document.documentElement.style.removeProperty("--sidebar-width");
    };
  }, [isCollapsed]);

  return (
    <div className={`student-sidebar ${isCollapsed ? "student-sidebar--collapsed" : ""}`}
         onMouseEnter={() => setIsCollapsed(false)}
         onMouseLeave={() => setIsCollapsed(true)}
    >
      {/* Sidebar Title */}
      <h2 className={`student-sidebar__title ${isCollapsed ? "student-sidebar__title--hidden" : ""}`}>
        Student Dashboard
      </h2>

      {/* Sidebar Menu */}
      <ul className="student-sidebar__menu">
        <li className={`student-sidebar__item ${location.pathname === "/studentdashboard" ? "student-sidebar__item--active" : ""}`}>
          <Link to="/studentdashboard" className="student-sidebar__link">
            <span className="student-sidebar__icon">☰</span>
            {!isCollapsed && <span className="student-sidebar__text">Home</span>}
          </Link>
        </li>
        <li className={`student-sidebar__item ${location.pathname === "/studentproposal" ? "student-sidebar__item--active" : ""}`}>
          <Link to="/studentproposal" className="student-sidebar__link">
            <span className="student-sidebar__icon">📜</span>
            {!isCollapsed && <span className="student-sidebar__text">Submit Proposal</span>}
          </Link>
        </li>
        <li className={`student-sidebar__item ${location.pathname === "/studenttrackprogress" ? "student-sidebar__item--active" : ""}`}>
          <Link to="/studenttrackprogress" className="student-sidebar__link">
            <span className="student-sidebar__icon">📈</span>
            {!isCollapsed && <span className="student-sidebar__text">Track Progress</span>}
          </Link>
        </li>
        <li className={`student-sidebar__item ${location.pathname === "/studentrequestsuperviser" ? "student-sidebar__item--active" : ""}`}>
          <Link to="/studentrequestsuperviser" className="student-sidebar__link">
            <span className="student-sidebar__icon">👨‍🏫</span>
            {!isCollapsed && <span className="student-sidebar__text">Request Supervisor</span>}
          </Link>
        </li>
        <li className={`student-sidebar__item ${location.pathname === "/studentuploaddocument" ? "student-sidebar__item--active" : ""}`}>
          <Link to="/studentuploaddocument" className="student-sidebar__link">
            <span className="student-sidebar__icon">📂</span>
            {!isCollapsed && <span className="student-sidebar__text">Upload Document</span>}
          </Link>
        </li>
        <li className={`student-sidebar__item ${location.pathname === "/studentfeedbackcomments" ? "student-sidebar__item--active" : ""}`}>
          <Link to="/studentfeedbackcomments" className="student-sidebar__link">
            <span className="student-sidebar__icon">📝</span>
            {!isCollapsed && <span className="student-sidebar__text">Feedback/Comments</span>}
          </Link>
        </li>
        <li className={`student-sidebar__item ${location.pathname === "/studentcommunication" ? "student-sidebar__item--active" : ""}`}>
          <Link to="/studentcommunication" className="student-sidebar__link">
            <span className="student-sidebar__icon">📬</span>
            {!isCollapsed && <span className="student-sidebar__text">Communication</span>}
          </Link>
        </li>
        <li className={`student-sidebar__item ${location.pathname === "/studentchatbot" ? "student-sidebar__item--active" : ""}`}>
          <Link to="/studentchatbot" className="student-sidebar__link">
            <span className="student-sidebar__icon">💬</span>
            {!isCollapsed && <span className="student-sidebar__text">Chat</span>}
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
