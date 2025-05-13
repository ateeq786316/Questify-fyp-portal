import { useState } from "react";
import Navbar from "../../../components/Navbar.jsx";
import "../../../styles/StudentLogin.css";
import API from "../../../services/api";

function StudentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await API.post("/auth/student/login", { email, password });
      const { data } = response;
      localStorage.setItem("studentToken", data.token);
      console.log("Login successful:", data.student);
      window.location.href = "/studentdashboard"; 
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.msg || "Login failed. Please try again.");
    }
  };
  
  return (
    <div className="student-login-container">
      <Navbar />
      <div className="student-login-overlay d-flex align-items-center justify-content-center">
        <div className="student-login-card glass-effect">
          <h2 className="student-login-title">Student Login</h2>
          <form onSubmit={handleLogin}>
            {/* Username Field */}
            <div className="student-login-input-group">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                placeholder="Enter your email" 
                required 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            {/* Password Field */}
            <div className="student-login-input-group">
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password" 
                placeholder="Enter your password" 
                required 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>
            {/* Error Message */}
            {error && <p className="student-login-error">{error}</p>}
            {/* Login Button */}
            <button type="submit" className="student-login-button">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default StudentLogin;
