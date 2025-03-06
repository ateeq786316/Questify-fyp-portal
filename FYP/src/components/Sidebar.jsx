import { useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const location = useLocation();  // Get current route
  const [active, setActive] = useState("chat");

  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}
         onMouseEnter={() => setIsCollapsed(false)}
         onMouseLeave={() => setIsCollapsed(true)}
    >
      {/* Sidebar Title */}
      <h2 className={`sidebar-title ${isCollapsed ? "hidden" : ""}`}>Student Dashboard</h2>

      {/* Sidebar Menu ☰*/}
      <ul className="sidebar-menu">
        <li className={location.pathname === "/studentdashboard" ? "active" : ""}>
          <Link to="/studentdashboard">☰ {!isCollapsed && "Home"}</Link>
        </li>
        <li className={location.pathname === "/studentproposal" ? "active" : ""}>
          <Link to="/studentproposal">📜 {!isCollapsed && "Submit Proposal"}</Link>
        </li>
        <li className={location.pathname === "/studenttrackprogress" ? "active" : ""}>
          <Link to="/studenttrackprogress">📈 {!isCollapsed && "Track Progress"}</Link>
        </li>
        <li className={location.pathname === "/studentrequestsuperviser" ? "active" : ""}>
          <Link to="/studentrequestsuperviser">👨‍🏫 {!isCollapsed && "Request Supervisor"}</Link>
        </li>
        <li className={location.pathname === "/studentuploaddocument" ? "active" : ""}>
          <Link to="/studentuploaddocument">📂 {!isCollapsed && "Upload Document"}</Link>
        </li>
        <li className={location.pathname === "/studentfeedbackcomments" ? "active" : ""}>
          <Link to="/studentfeedbackcomments">📝 {!isCollapsed && "Feedback/Comments"}</Link>
        </li>
        <li className={location.pathname === "/studentcommunication" ? "active" : ""}>
          <Link to="/studentcommunication">📬 {!isCollapsed && "Communication"}</Link>
        </li>
        <li className={location.pathname === "/studentchatbot" ? "active" : ""}>
          <Link to="/studentchatbot">💬 {!isCollapsed && "Chat"}</Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
