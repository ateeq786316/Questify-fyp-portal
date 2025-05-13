import React, { useState } from "react";
import "../../../styles/InternalLogin.css";
import Navbar from "../../../components/Navbar.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const InternalLogin = () => {
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
      const response = await axios.post('http://localhost:5000/api/auth/internal/login', {
        email: email.toLowerCase(),
        password
      });

      if (response.data.success) {
        localStorage.setItem('internalToken', response.data.token);
        localStorage.setItem('internalData', JSON.stringify(response.data.internal));
        navigate('/internaldashboard');
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
    <div className="internal-login-container">
      <Navbar />
      <div className="internal-login-overlay">
        <div className="internal-login-card">
          <h1 className="internal-login-title">Internal Login</h1>
          <form onSubmit={handleLogin}>
            <div className="internal-login-input-group">
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
            <div className="internal-login-input-group">
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
            <div className="internal-login-options">
              <div className="internal-login-form-check">
                <input type="checkbox" id="remember" className="internal-login-form-check-input" />
                <label htmlFor="remember" className="internal-login-form-check-label">Remember me</label>
              </div>
            </div>
            <button
              type="submit"
              className="internal-login-button"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            {error && <div className="internal-login-error">{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default InternalLogin; 