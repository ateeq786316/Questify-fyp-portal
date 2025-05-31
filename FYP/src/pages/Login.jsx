import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('student'); // Default user type
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`http://localhost:5000/api/auth/${userType}/login`, {
        email: email.toLowerCase(),
        password
      });

      if (response.data.success) {
        // Store token and user data based on user type
        localStorage.setItem(`${userType}Token`, response.data.token);
        localStorage.setItem(`${userType}Data`, JSON.stringify(response.data[userType]));
        
        // Navigate to appropriate dashboard
        switch(userType) {
          case 'student':
            navigate('/studentdashboard');
            break;
          case 'supervisor':
            navigate('/supervisordashboard');
            break;
          case 'admin':
            navigate('/admindashboard');
            break;
          case 'internal':
            navigate('/internaldashboard');
            break;
          case 'external':
            navigate('/externaldashboard');
            break;
          default:
            navigate('/');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.msg || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Navbar />
      <div className="login-overlay">
        <div className="login-card">
          <h1 className="login-title">Login</h1>
          <form onSubmit={handleLogin}>
            <div className="login-input-group">
              <label htmlFor="userType">Login As</label>
              <select
                id="userType"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="login-select"
              >
                <option value="student">Student</option>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Admin</option>
                <option value="internal">Internal Examiner</option>
                <option value="external">External Examiner</option>
              </select>
            </div>
            <div className="login-input-group">
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
            <div className="login-input-group">
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
            <div className="login-options">
              <div className="login-form-check">
                <input type="checkbox" id="remember" className="login-form-check-input" />
                <label htmlFor="remember" className="login-form-check-label">Remember me</label>
              </div>
            </div>
            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            {error && <div className="login-error">{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login; 