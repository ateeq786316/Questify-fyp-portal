import React, { useState, useEffect } from 'react';
import '../../../styles/ReviewDocument.css';
import Navbar from '../../../components/Navbar';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import SupervisorSidebar from './SupervisorSidebar';

const ReviewDocument = () => {
  // State for groups and documents
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fetch supervisor's assigned groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('supervisorToken');
        console.log('Supervisor token:', token); // Debug log

        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get('http://localhost:5000/api/supervisor/groups', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('API Response:', response.data); // Debug log

        if (response.data.success) {
          setGroups(response.data.groups);
        } else {
          throw new Error(response.data.msg || 'Failed to fetch groups');
        }
      } catch (err) {
        console.error('Error fetching groups:', err);
        console.error('Error details:', err.response?.data); // Debug log
        setError(err.response?.data?.msg || 'Failed to fetch groups');
        toast.error(err.response?.data?.msg || 'Failed to fetch groups');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  // Fetch documents when a group is selected
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!selectedGroup) return;

      try {
        setLoading(true);
        const token = localStorage.getItem('supervisorToken');
        
        // Get all student IDs from the group
        const studentIds = selectedGroup.students?.map(student => student._id) || [];
        console.log('Selected group:', selectedGroup);
        console.log('Student IDs:', studentIds);
        
        // Fetch documents for all students in the group
        const response = await axios.get(`http://localhost:5000/api/supervisor/documents`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            studentIds: studentIds.join(',')
          }
        });
        console.log('Documents response:', response.data);

        if (response.data.success) {
          setDocuments(response.data.documents);
          // Initialize feedback state for each document
          const initialFeedback = {};
          response.data.documents.forEach(doc => {
            initialFeedback[doc._id] = doc.feedback || '';
          });
          setFeedback(initialFeedback);
        } else {
          throw new Error(response.data.msg || 'Failed to fetch documents');
        }
      } catch (err) {
        console.error('Error fetching documents:', err);
        console.error('Error details:', err.response?.data);
        setError(err.response?.data?.msg || 'Failed to fetch documents');
        toast.error(err.response?.data?.msg || 'Failed to fetch documents');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [selectedGroup]);

  // Handle group selection
  const handleGroupClick = (group) => {
    setSelectedGroup(group);
    setDocuments([]);
    setFeedback({});
  };

  // Handle feedback change
  const handleFeedbackChange = (docId, value) => {
    setFeedback(prev => ({
      ...prev,
      [docId]: value
    }));
  };

  // Handle feedback submission
  const handleSubmitFeedback = async (docId) => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem('supervisorToken');
      const response = await axios.post(
        `http://localhost:5000/api/supervisor/documents/${docId}/feedback`,
        { feedback: feedback[docId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Feedback submitted successfully');
        // Update document status in the local state
        setDocuments(prev => prev.map(doc => 
          doc._id === docId 
            ? { ...doc, status: 'reviewed', feedback: feedback[docId] }
            : doc
        ));
      } else {
        throw new Error(response.data.msg || 'Failed to submit feedback');
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
      toast.error(err.response?.data?.msg || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle document preview
  const handlePreviewDocument = async (doc) => {
    try {
    const token = localStorage.getItem('supervisorToken');
    const url = `http://localhost:5000/api/supervisor/documents/${doc._id}/file`;
    
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = `${url}?token=${token}`;
      link.target = '_blank'; // Open in new tab
      link.download = doc.title || 'document'; // Set download filename
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading document:', err);
      toast.error('Failed to download document');
    }
  };

  // Handle status update
  const handleStatusUpdate = async (docId, newStatus) => {
    try {
      setUpdatingStatus(true);
      const token = localStorage.getItem('supervisorToken');
      const response = await axios.put(
        `http://localhost:5000/api/supervisor/documents/${docId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Update document status in the local state
        setDocuments(prev => prev.map(doc => 
          doc._id === docId 
            ? { ...doc, status: newStatus }
            : doc
        ));
        toast.success(`Document status updated to ${newStatus}`);
      } else {
        throw new Error(response.data.msg || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating document status:', err);
      toast.error(err.response?.data?.msg || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading && !selectedGroup) {
  return (
      <div className="review-document">
        <Navbar />
    <div className="dashboard-container">
      <SupervisorSidebar />
          <div className="main-content">
            <div className="loading">Loading groups...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="review-document">
      <Navbar />
      <div className="dashboard-container">
        <SupervisorSidebar />
      <div className="main-content">
          <div className="review-document-section">
            <h2>Review Documents</h2>
            
            {loading && <div className="loading">Loading...</div>}
            {error && <div className="error">{error}</div>}

            <div className="groups-list">
              {groups.map((group) => (
                <div
                  key={group._id}
                  className={`group-item ${selectedGroup?._id === group._id ? 'selected' : ''}`}
                  onClick={() => handleGroupClick(group)}
                >
                  <h4>Group {group.groupId}</h4>
                  <p>Project: {group.projectTitle}</p>
                  <p>Status: {group.status}</p>
                  <p>Students: {group.students?.map(student => student.name).join(', ') || 'No students assigned'}</p>
                </div>
              ))}
          </div>

            {selectedGroup && (
              <div className="documents-section">
                <h3>Documents for Group {selectedGroup.groupId}</h3>
                {documents.length === 0 ? (
                  <p>No documents found for this group.</p>
                ) : (
                  <div className="documents-list">
                    {documents.map((doc) => (
                      <div key={doc._id} className="document-item">
                        <div className="document-info">
                          <h4>{doc.title}</h4>
                          <p>Uploaded by: {doc.uploadedBy?.name || 'Unknown'}</p>
                          <p>Status: {doc.status}</p>
                          <p>Uploaded on: {new Date(doc.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="document-actions">
                          <button
                            className="preview-btn"
                            onClick={() => handlePreviewDocument(doc)}
                          >
                            Preview
                          </button>
                          <div className="status-buttons">
                            <button
                              className={`status-btn ${doc.status === 'pending' ? 'active' : ''}`}
                              onClick={() => handleStatusUpdate(doc._id, 'pending')}
                              disabled={updatingStatus || doc.status === 'pending'}
                            >
                              Pending
                            </button>
                            <button
                              className={`status-btn ${doc.status === 'reviewed' ? 'active' : ''}`}
                              onClick={() => handleStatusUpdate(doc._id, 'reviewed')}
                              disabled={updatingStatus || doc.status === 'reviewed'}
                            >
                              Reviewed
                            </button>
                            <button
                              className={`status-btn ${doc.status === 'approved' ? 'active' : ''}`}
                              onClick={() => handleStatusUpdate(doc._id, 'approved')}
                              disabled={updatingStatus || doc.status === 'approved'}
                            >
                              Approved
                            </button>
                            <button
                              className={`status-btn ${doc.status === 'rejected' ? 'active' : ''}`}
                              onClick={() => handleStatusUpdate(doc._id, 'rejected')}
                              disabled={updatingStatus || doc.status === 'rejected'}
                            >
                              Rejected
                            </button>
                    </div>
                          <div className="feedback-section">
                      <textarea
                              value={feedback[doc._id] || ''}
                              onChange={(e) => handleFeedbackChange(doc._id, e.target.value)}
                              placeholder="Enter your feedback..."
                              disabled={doc.status === 'approved'}
                      />
                      <button
                              className="submit-btn"
                              onClick={() => handleSubmitFeedback(doc._id)}
                              disabled={submitting || doc.status === 'approved'}
                      >
                              {submitting ? 'Submitting...' : 'Submit Feedback'}
                      </button>
                          </div>
                        </div>
                    </div>
                ))}
            </div>
          )}
              </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewDocument;