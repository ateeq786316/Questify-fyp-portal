import React, { useState, useEffect } from 'react';
import '../../../styles/ExternalEvaluate.css';
import Navbar from '../../../components/Navbar';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ExternalEvaluate = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [evaluations, setEvaluations] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('externalToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get('http://localhost:5000/api/external/students', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setStudents(response.data.students);
        // Initialize evaluations state
        const initialEvaluations = {};
        response.data.students.forEach(student => {
          initialEvaluations[student._id] = {
            marks: student.evaluation?.externalMarks?.marks || 0,
            feedback: student.evaluation?.externalMarks?.feedback || ''
          };
        });
        setEvaluations(initialEvaluations);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err.response?.data?.msg || 'Failed to fetch students');
      toast.error(err.response?.data?.msg || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluationChange = (studentId, field, value) => {
    setEvaluations(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleSubmitEvaluation = async (studentId) => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem('externalToken');
      const evaluation = evaluations[studentId];

      if (!evaluation.marks || !evaluation.feedback) {
        toast.error('Please provide both marks and feedback');
        return;
      }

      const response = await axios.post(
        'http://localhost:5000/api/external/evaluate',
        {
          studentId,
          marks: evaluation.marks,
          feedback: evaluation.feedback
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success('Evaluation submitted successfully');
      }
    } catch (err) {
      console.error('Error submitting evaluation:', err);
      toast.error(err.response?.data?.msg || 'Failed to submit evaluation');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePreviewDocument = (student) => {
    if (!student.finalReport) {
      toast.error('No final report available for this student');
      return;
    }

    const token = localStorage.getItem('externalToken');
    const url = `http://localhost:5000/api/external/documents/${student.finalReport._id}/file`;
    
    // Create a hidden iframe to handle the file download
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    // Add the token to the URL as a query parameter
    const urlWithToken = `${url}?token=${token}`;
    
    // Set the iframe src to trigger the download
    iframe.src = urlWithToken;
    
    // Remove the iframe after a short delay
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="external-evaluate">
        <Navbar />
        <div className="dashboard-container">
          <div className="sidebar">
            <Link to="/externaldashboard">Home</Link>
            <Link to="/external/evaluate" className="active">Evaluate</Link>
            <Link to="#about">About</Link>
          </div>
          <div className="main-content">
            <div className="loading">Loading students...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="external-evaluate">
      <Navbar />
      <div className="dashboard-container">
        <div className="sidebar">
          <Link to="/externaldashboard">Home</Link>
          <Link to="/external/evaluate" className="active">Evaluate</Link>
          <Link to="#about">About</Link>
        </div>
        <div className="main-content">
          <h2>Student Evaluations</h2>
          
          {error && <div className="error">{error}</div>}

          <div className="students-list">
            {students.map(student => (
              <div key={student._id} className="student-card">
                <div className="student-info">
                  <h3>{student.name}</h3>
                  <p>Student ID: {student.studentId}</p>
                  <p>Department: {student.department}</p>
                  <p>Project: {student.projectTitle}</p>
                </div>

                <div className="evaluation-form">
                  <div className="form-group">
                    <label>Marks (out of 100):</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={evaluations[student._id]?.marks || 0}
                      onChange={(e) => handleEvaluationChange(student._id, 'marks', parseInt(e.target.value))}
                      disabled={submitting}
                    />
                  </div>

                  <div className="form-group">
                    <label>Feedback:</label>
                    <textarea
                      value={evaluations[student._id]?.feedback || ''}
                      onChange={(e) => handleEvaluationChange(student._id, 'feedback', e.target.value)}
                      placeholder="Enter your feedback..."
                      disabled={submitting}
                    />
                  </div>

                  <div className="actions">
                    <button
                      className="preview-btn"
                      onClick={() => handlePreviewDocument(student)}
                      disabled={!student.finalReport}
                    >
                      Preview Final Report
                    </button>
                    <button
                      className="submit-btn"
                      onClick={() => handleSubmitEvaluation(student._id)}
                      disabled={submitting}
                    >
                      {submitting ? 'Submitting...' : 'Submit Evaluation'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExternalEvaluate; 