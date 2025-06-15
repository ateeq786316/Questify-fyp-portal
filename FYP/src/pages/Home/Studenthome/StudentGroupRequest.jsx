import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../../components/Navbar';
import Sidebar from '../../../components/Sidebar';
import { toast } from 'react-toastify';
import '../../../styles/StudentGroupRequest.css';

const StudentGroupRequest = () => {
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [requestMsg, setRequestMsg] = useState('');
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch current user and incoming requests on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('studentToken');
        const res = await axios.get('http://localhost:5000/api/student/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentUser(res.data.user);
      } catch (err) {
        setCurrentUser(null);
      }
    };
    fetchCurrentUser();
    fetchIncomingRequests();
    // eslint-disable-next-line
  }, []);

  const fetchIncomingRequests = async () => {
    try {
      const token = localStorage.getItem('studentToken');
      const res = await axios.get(
        'http://localhost:5000/api/student/group-requests',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIncomingRequests(res.data.requests);
    } catch (err) {
      setIncomingRequests([]);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchError('');
    setSearchResult(null);
    setRequestMsg('');
    setLoading(true);
    try {
      const token = localStorage.getItem('studentToken');
      const res = await axios.get(
        'http://localhost:5000/api/student/search-student',
        {
          params: { email: searchEmail },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSearchResult(res.data.student);
      setLoading(false);
    } catch (err) {
      setSearchError(err.response?.data?.msg || 'Student not found');
      toast.error(err.response?.data?.msg || 'Student not found');
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    setRequestMsg('');
    setLoading(true);
    try {
      const token = localStorage.getItem('studentToken');
      await axios.post(
        'http://localhost:5000/api/student/group-request',
        { toEmail: searchResult.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequestMsg('Group request sent!');
      toast.success('Group request sent!');
      setLoading(false);
    } catch (err) {
      setRequestMsg(err.response?.data?.msg || 'Failed to send request');
      toast.error(err.response?.data?.msg || 'Failed to send request');
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    setActionMsg('');
    setLoading(true);
    try {
      const token = localStorage.getItem('studentToken');
      await axios.post(
        `http://localhost:5000/api/student/group-request/${requestId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActionMsg('Request approved!');
      toast.success('Group request approved!');
      setIncomingRequests((prev) => prev.filter((r) => r._id !== requestId));
      // Refetch current user to update groupID
      const res = await axios.get('http://localhost:5000/api/student/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentUser(res.data.user);
      setLoading(false);
    } catch (err) {
      setActionMsg(err.response?.data?.msg || 'Failed to approve request');
      toast.error(err.response?.data?.msg || 'Failed to approve request');
      setLoading(false);
    }
  };

  const handleReject = async (requestId) => {
    setActionMsg('');
    setLoading(true);
    try {
      const token = localStorage.getItem('studentToken');
      await axios.post(
        `http://localhost:5000/api/student/group-request/${requestId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActionMsg('Request rejected.');
      toast.info('Group request rejected.');
      setIncomingRequests((prev) => prev.filter((r) => r._id !== requestId));
      setLoading(false);
    } catch (err) {
      setActionMsg(err.response?.data?.msg || 'Failed to reject request');
      toast.error(err.response?.data?.msg || 'Failed to reject request');
      setLoading(false);
    }
  };

  return (
    <div className="stgr-container">
      <Navbar />
      <div className="stgr-wrapper">
        <Sidebar />
        <div className="stgr-content">
          <h1 className="stgr-title">Group Requests</h1>
          
          {/* Status Banner */}
          {currentUser?.groupID && (
            <div className="stgr-status-banner">
              You are already in a group (Group ID: {currentUser.groupID}). You cannot send or receive new group requests.
            </div>
          )}

          <div className="stgr-card">
            <h2 className="stgr-card-title">Request a Group Member</h2>
            {currentUser?.groupID ? null : (
              <>
                <form onSubmit={handleSearch} className="stgr-search-form">
                  <input
                    type="email"
                    placeholder="Enter student email"
                    value={searchEmail}
                    onChange={e => setSearchEmail(e.target.value)}
                    required
                    className="stgr-search-input"
                    disabled={!!currentUser?.groupID}
                  />
                  <button 
                    type="submit" 
                    disabled={loading || !!currentUser?.groupID}
                    className="stgr-search-btn"
                  >
                    {loading ? 'Searching...' : 'Search'}
                  </button>
                </form>

                {searchError && <div className="stgr-error">{searchError}</div>}
                
                {searchResult && (
                  <div className="stgr-result">
                    <div className="stgr-result-info">
                      <div><b>Name:</b> {searchResult.name}</div>
                      <div><b>Email:</b> {searchResult.email}</div>
                      <div><b>Department:</b> {searchResult.department}</div>
                    </div>
                    {searchResult.groupID ? (
                      <div className="stgr-result-warning">
                        This student is already in a group (Group ID: {searchResult.groupID}).
                      </div>
                    ) : (
                      <button 
                        onClick={handleSendRequest} 
                        disabled={loading || !!currentUser?.groupID || !!searchResult.groupID}
                        className="stgr-send-btn"
                      >
                        {loading ? 'Sending...' : 'Send Group Request'}
                      </button>
                    )}
                  </div>
                )}

                {requestMsg && (
                  <div className={`stgr-message ${requestMsg.includes('sent') ? 'stgr-message--success' : 'stgr-message--error'}`}>
                    {requestMsg}
                  </div>
                )}

                {!searchResult && (
                  <div className="stgr-guidance">
                    Enter a student email and click Search to find a student to request.
                  </div>
                )}
              </>
            )}
          </div>

          <div className="stgr-card">
            <h2 className="stgr-card-title">Incoming Group Requests</h2>
            {actionMsg && (
              <div className={`stgr-message ${actionMsg.includes('approve') ? 'stgr-message--success' : 'stgr-message--error'}`}>
                {actionMsg}
              </div>
            )}
            
            {incomingRequests.length === 0 ? (
              <div className="stgr-guidance">No incoming requests.</div>
            ) : (
              <ul className="stgr-list">
                {incomingRequests.map((req) => (
                  <li key={req._id} className="stgr-item">
                    <div className="stgr-item-info">
                      <div><b>From:</b> {req.fromName} ({req.fromEmail})</div>
                      <div><b>Department:</b> {req.fromDepartment}</div>
                    </div>
                    <div className="stgr-actions">
                      <button 
                        onClick={() => handleApprove(req._id)} 
                        disabled={loading || !!currentUser?.groupID}
                        className="stgr-approve-btn"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleReject(req._id)} 
                        disabled={loading || !!currentUser?.groupID}
                        className="stgr-reject-btn"
                      >
                        Reject
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {currentUser?.groupID && (
              <div className="stgr-guidance">
                You cannot approve or reject group requests while you are in a group.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentGroupRequest; 