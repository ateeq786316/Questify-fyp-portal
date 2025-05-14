import React, { useState, useEffect } from 'react';
import '../../../styles/SupervisorEvaluate.css';
import Navbar from '../../../components/Navbar';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const SupervisorEvaluate = () => {
  const [students, setStudents] = useState([]);
  const [evaluations, setEvaluations] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('supervisorToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch students assigned to this supervisor
      const response = await axios.get('http://localhost:5000/api/supervisor/students', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setStudents(response.data.students);
        
        // Fetch existing evaluations
        const evaluationsResponse = await axios.get('http://localhost:5000/api/supervisor/evaluations', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (evaluationsResponse.data.success) {
          const evaluationsMap = {};
          evaluationsResponse.data.evaluations.forEach(evaluation => {
            evaluationsMap[evaluation.student._id] = evaluation;
          });
          setEvaluations(evaluationsMap);
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.msg || 'Failed to fetch data');
      toast.error(err.response?.data?.msg || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleMarksChange = (studentId, value) => {
    const marks = parseInt(value);
    if (marks >= 0 && marks <= 50) {
      setEvaluations(prev => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          supervisorMarks: {
            ...prev[studentId]?.supervisorMarks,
            marks: marks
          }
        }
      }));
    }
  };

  const handleFeedbackChange = (studentId, value) => {
    setEvaluations(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        supervisorMarks: {
          ...prev[studentId]?.supervisorMarks,
          feedback: value
        }
      }
    }));
  };

  const handleSubmit = async (studentId) => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem('supervisorToken');
      const evaluation = evaluations[studentId];

      if (!evaluation?.supervisorMarks?.marks) {
        toast.error('Please enter marks before submitting');
        return;
      }

      const response = await axios.post(
        'http://localhost:5000/api/supervisor/evaluate',
        {
          studentId,
          marks: evaluation.supervisorMarks.marks,
          feedback: evaluation.supervisorMarks.feedback
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Evaluation submitted successfully');
        // Update local state with the new evaluation
        setEvaluations(prev => ({
          ...prev,
          [studentId]: response.data.evaluation
        }));
      }
    } catch (err) {
      console.error('Error submitting evaluation:', err);
      toast.error(err.response?.data?.msg || 'Failed to submit evaluation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="supervisor-evaluate-page">
        <Navbar />
        <div className="supervisor-evaluate-container">
          <div className="supervisor-evaluate-sidebar">
            <Link to="/supervisordashboard">Home</Link>
            <Link to="/supervisor/reviewdocument">Review Document</Link>
            <Link to="/supervisor/evaluate" className="active">Evaluate</Link>
            <Link to="#about">About</Link>
          </div>
          <div className="supervisor-evaluate-content">
            <div className="supervisor-evaluate-loading">Loading students...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="supervisor-evaluate-page">
      <Navbar />
      <div className="supervisor-evaluate-container">
        <div className="supervisor-evaluate-sidebar">
          <Link to="/supervisordashboard">Home</Link>
          <Link to="/supervisor/reviewdocument">Review Document</Link>
          <Link to="/supervisor/evaluate" className="active">Evaluate</Link>
          <Link to="#about">About</Link>
        </div>
        <div className="supervisor-evaluate-content">
          <div className="supervisor-evaluate-section">
            <h2>Student Evaluation</h2>
            
            {error && <div className="supervisor-evaluate-error">{error}</div>}

            <div className="supervisor-evaluate-grid">
              {students.map(student => {
                const evaluation = evaluations[student._id];
                const isEvaluated = evaluation?.status === 'evaluated';

                return (
                  <div key={student._id} className="supervisor-evaluate-card">
                    <div className="supervisor-evaluate-student-info">
                      <h3>{student.name}</h3>
                      <p>ID: {student.studentId}</p>
                      <p>Project: {student.projectTitle}</p>
                    </div>
                    
                    <div className="supervisor-evaluate-form">
                      <div className="supervisor-evaluate-marks">
                        <label>Marks (out of 50):</label>
                        <input
                          type="number"
                          min="0"
                          max="50"
                          value={evaluation?.supervisorMarks?.marks || ''}
                          onChange={(e) => handleMarksChange(student._id, e.target.value)}
                          disabled={submitting}
                        />
                      </div>
                      
                      <div className="supervisor-evaluate-feedback">
                        <label>Feedback:</label>
                        <textarea
                          value={evaluation?.supervisorMarks?.feedback || ''}
                          onChange={(e) => handleFeedbackChange(student._id, e.target.value)}
                          placeholder="Enter your feedback..."
                          disabled={submitting}
                        />
                      </div>

                      <button
                        className={`supervisor-evaluate-submit ${isEvaluated ? 'evaluated' : ''}`}
                        onClick={() => handleSubmit(student._id)}
                        disabled={submitting}
                      >
                        {isEvaluated ? 'Evaluated' : submitting ? 'Submitting...' : 'Submit Evaluation'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorEvaluate; 