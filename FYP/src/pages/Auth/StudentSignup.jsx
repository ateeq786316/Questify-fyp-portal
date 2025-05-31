import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import './Auth.css';

const StudentSignup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Signup form, 2: OTP verification
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    rollNumber: '',
    name: '',
    email: '',
    department: '',
    batch: '',
    contact: '',
    password: '',
    confirmPassword: ''
  });
  const [otp, setOtp] = useState('');

  // Form validation
  const validateForm = () => {
    if (!formData.rollNumber || !formData.name || !formData.email || 
        !formData.department || !formData.batch || !formData.contact || 
        !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return false;
    }

    if (!formData.email.endsWith('@lgu.edu.pk')) {
      setError('Please use your LGU email address');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/student/signup', {
        ...formData,
        role: 'student'
      });

      if (response.data.success) {
        toast.success('OTP sent to your email');
        setStep(2);
      } else {
        setError(response.data.msg || 'Signup failed');
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/student/verify-otp', {
        email: formData.email,
        otp
      });

      if (response.data.success) {
        toast.success('Account created successfully');
        navigate('/login');
      } else {
        setError(response.data.msg || 'OTP verification failed');
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Navbar />
      <Container>
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <div className="auth-form-container">
              <h2>{step === 1 ? 'Student Signup' : 'Verify OTP'}</h2>
              
              {error && <Alert variant="danger">{error}</Alert>}

              {step === 1 ? (
                <Form onSubmit={handleSignupSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-2">
                        <Form.Label>Roll Number</Form.Label>
                        <Form.Control
                          type="text"
                          name="rollNumber"
                          value={formData.rollNumber}
                          onChange={handleInputChange}
                          placeholder="Enter roll number"
                        />
                      </Form.Group>

                      <Form.Group className="mb-2">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter full name"
                        />
                      </Form.Group>

                      <Form.Group className="mb-2">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter LGU email"
                        />
                      </Form.Group>

                      <Form.Group className="mb-2">
                        <Form.Label>Department</Form.Label>
                        <Form.Control
                          type="text"
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          placeholder="Enter department"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-2">
                        <Form.Label>Batch</Form.Label>
                        <Form.Control
                          type="text"
                          name="batch"
                          value={formData.batch}
                          onChange={handleInputChange}
                          placeholder="Enter batch"
                        />
                      </Form.Group>

                      <Form.Group className="mb-2">
                        <Form.Label>Contact</Form.Label>
                        <Form.Control
                          type="tel"
                          name="contact"
                          value={formData.contact}
                          onChange={handleInputChange}
                          placeholder="Enter contact number"
                        />
                      </Form.Group>

                      <Form.Group className="mb-2">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Enter password"
                        />
                      </Form.Group>

                      <Form.Group className="mb-2">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="Confirm password"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Sign Up'}
                  </Button>
                </Form>
              ) : (
                <Form onSubmit={handleOtpSubmit}>
                  <Form.Group className="mb-2">
                    <Form.Label>Enter OTP</Form.Label>
                    <Form.Control
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter the OTP sent to your email"
                    />
                  </Form.Group>

                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={loading}
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </Button>
                </Form>
              )}

              <div className="text-center mt-2">
                <p className="text-white mb-0">
                  Already have an account?{' '}
                  <Button variant="link" onClick={() => navigate('/login')}>
                    Login here
                  </Button>
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default StudentSignup; 