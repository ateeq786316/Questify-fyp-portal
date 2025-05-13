import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';
import Navbar from '../../../components/Navbar';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/admin/login', {
        email: email.toLowerCase(),
        password
      });

      if (response.data.success) {
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminData', JSON.stringify(response.data.admin));
        navigate('/admindashboard');
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
    <div className="admin-login-container">
      <Navbar/>
      <div className="admin-login-overlay">
        <div className="admin-login-card">
          <h1 className="admin-login-title">Admin Login</h1>
          <form onSubmit={handleSubmit}>
            <div className="admin-login-input-group">
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
            <div className="admin-login-input-group">
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
            <div className="admin-login-options">
              <div className="admin-login-form-check">
                <input type="checkbox" id="remember" className="admin-login-form-check-input" />
                <label htmlFor="remember" className="admin-login-form-check-label">Remember me</label>
              </div>
            </div>
            <button
              type="submit"
              className="admin-login-button"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            {error && <div className="admin-login-error">{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 