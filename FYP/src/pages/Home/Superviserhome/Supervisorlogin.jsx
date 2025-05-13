import React, { useState } from "react";
import "../../../styles/SupervisorLogin.css";
//navbar import
import Navbar from "../../../components/Navbar.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SupervisorLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/supervisor/login', {
        email: email.toLowerCase(),
        password
      });

      if (response.data.success) {
        localStorage.setItem('supervisorToken', response.data.token);
        localStorage.setItem('supervisorData', JSON.stringify(response.data.supervisor));
        navigate('/supervisordashboard');
      } else {
        setError(response.data.msg || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.msg || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="supervisor-login-container">
      <Navbar />
      <div className="supervisor-login-overlay">
        <div className="supervisor-login-card">
          <h1 className="supervisor-login-title">Supervisor Login</h1>
          <form onSubmit={handleLogin}>
            <div className="supervisor-login-input-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="supervisor-login-input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="supervisor-login-options">
              <div className="supervisor-login-form-check">
                <input type="checkbox" id="remember" className="supervisor-login-form-check-input" />
                <label htmlFor="remember" className="supervisor-login-form-check-label">Remember me</label>
              </div>
            </div>
            <button
              type="submit"
              className="supervisor-login-button"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            {error && <div className="supervisor-login-error">{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SupervisorLogin;
