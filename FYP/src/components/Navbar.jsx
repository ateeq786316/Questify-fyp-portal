import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import logo from "../assets/logo.png";
import "./Navbar.css";
import { NavLink, Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark custom-navbar">
      <div className="container">
        {/* Logo */}
        <Link className="navbar-brand d-flex align-items-center" to="/" aria-label="FYP Portal Home">
          <img src={logo} alt="LGU Logo" className="navbar-logo" />
          <span className="logo-text">FYP Portal</span>
        </Link>

        {/* Mobile Toggle Button */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"  
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <NavLink className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} to="/intro">
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} to="/aboutus">
                About Us
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} to="/contactus">
                Contact Us
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} to="/login">
                LOGOUT
              </NavLink>
            </li>
          </ul>
          
        </div>
        
      </div>
    </nav>
  );
};

export default Navbar;