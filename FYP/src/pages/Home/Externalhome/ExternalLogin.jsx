import React, { useState } from "react";
import "../../../styles/ExternalLogin.css";
import Navbar from "../../../components/Navbar.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ExternalLogin = () => {
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
      const response = await axios.post('http://localhost:5000/api/auth/external/login', {
        email: email.toLowerCase(),
        password
      });

      if (response.data.success) {
        localStorage.setItem('externalToken', response.data.token);
        localStorage.setItem('externalData', JSON.stringify(response.data.external));
        navigate('/externaldashboard');
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
    <div className="external-login-container">
      <Navbar />
      <div className="external-login-overlay">
        <div className="external-login-card">
          <h1 className="external-login-title">External Login</h1>
          <form onSubmit={handleLogin}>
            <div className="external-login-input-group">
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
            <div className="external-login-input-group">
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
            <div className="external-login-options">
              <div className="external-login-form-check">
                <input type="checkbox" id="remember" className="external-login-form-check-input" />
                <label htmlFor="remember" className="external-login-form-check-label">Remember me</label>
              </div>
            </div>
            <button
              type="submit"
              className="external-login-button"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            {error && <div className="external-login-error">{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExternalLogin; 