import { useState } from "react";
import Navbar from "../../../components/Navbar.jsx";
import "../../../styles/StudentLogin.css";
import axios from "axios";

function StudentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await axios.post("http://localhost:5000/api/auth/student/login", {email,password});
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
    <div className="login-container">
      <Navbar />
      <div className="overlay d-flex align-items-center justify-content-center">
        <div className="login-card glass-effect">
          <h2 className="card-title">Student Login</h2>
          <form onSubmit={handleLogin}>
            {/* Username Field */}
            <div className="input-group">
            <label htmlFor="email">Email</label>
              <input type="email" id="email" placeholder="Enter your email" required onChange={(e) => setEmail(e.target.value)} />
            </div>
            {/* Password Field */}
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" placeholder="Enter your password" required onChange={(e) => setPassword(e.target.value)} />
            </div>
            {/* Error Message */}
            {error && <p className="error-msg">{error}</p>}
            {/* Login Button */}
            <button type="submit" className="btn-primary">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default StudentLogin;
