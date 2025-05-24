import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../../components/Navbar';
import Sidebar from '../../../components/Sidebar';
import { toast } from 'react-toastify';

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
    <>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <div style={{ flex: 1, padding: '2rem' }}>
          <h1 style={{ marginBottom: '2rem' }}>Group Requests</h1>
          {/* Status Banner */}
          {currentUser?.groupID && (
            <div style={{ background: '#e9ecef', color: '#333', padding: '1rem', borderRadius: 8, marginBottom: 24, fontWeight: 500 }}>
              You are already in a group (Group ID: {currentUser.groupID}). You cannot send or receive new group requests.
            </div>
          )}
          <div className="card" style={{ padding: '2rem', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
            <h2>Request a Group Member</h2>
            {currentUser?.groupID ? null : (
              <>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <input
                    type="email"
                    placeholder="Enter student email"
                    value={searchEmail}
                    onChange={e => setSearchEmail(e.target.value)}
                    required
                    style={{ flex: 1, padding: '0.75rem', borderRadius: 6, border: '1px solid #ccc' }}
                    disabled={!!currentUser?.groupID}
                  />
                  <button type="submit" disabled={loading || !!currentUser?.groupID} style={{ padding: '0.75rem 1.5rem', borderRadius: 6, background: '#007bff', color: '#fff', border: 'none' }}>
                    {loading ? 'Searching...' : 'Search'}
                  </button>
                </form>
                {searchError && <div style={{ color: 'red', marginBottom: 8 }}>{searchError}</div>}
                {searchResult && (
                  <div style={{ marginBottom: 8, background: '#f9f9f9', padding: '1rem', borderRadius: 6 }}>
                    <div><b>Name:</b> {searchResult.name}</div>
                    <div><b>Email:</b> {searchResult.email}</div>
                    <div><b>Department:</b> {searchResult.department}</div>
                    {searchResult.groupID ? (
                      <div style={{ color: '#888', marginTop: 8 }}>
                        This student is already in a group (Group ID: {searchResult.groupID}).
                      </div>
                    ) : (
                      <button onClick={handleSendRequest} disabled={loading || !!currentUser?.groupID || !!searchResult.groupID} style={{ marginTop: 8, padding: '0.5rem 1.2rem', borderRadius: 6, background: '#28a745', color: '#fff', border: 'none' }}>
                        {loading ? 'Sending...' : 'Send Group Request'}
                      </button>
                    )}
                  </div>
                )}
                {requestMsg && <div style={{ color: requestMsg.includes('sent') ? 'green' : 'red' }}>{requestMsg}</div>}
                {/* Inline guidance for disabled state */}
                {!searchResult && (
                  <div className="mt-2 text-muted">
                    Enter a student email and click Search to find a student to request.
                  </div>
                )}
              </>
            )}
          </div>

          <div className="card" style={{ padding: '2rem', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
            <h2>Incoming Group Requests</h2>
            {actionMsg && <div style={{ color: actionMsg.includes('approve') ? 'green' : 'red', marginBottom: 8 }}>{actionMsg}</div>}
            {incomingRequests.length === 0 ? (
              <div style={{ color: '#888' }}>No incoming requests.</div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {incomingRequests.map((req) => (
                  <li key={req._id} style={{ marginBottom: 16, background: '#f9f9f9', padding: '1rem', borderRadius: 6 }}>
                    <div><b>From:</b> {req.fromName} ({req.fromEmail})</div>
                    <div><b>Department:</b> {req.fromDepartment}</div>
                    <button onClick={() => handleApprove(req._id)} disabled={loading || !!currentUser?.groupID} style={{ marginRight: 8, padding: '0.5rem 1.2rem', borderRadius: 6, background: '#28a745', color: '#fff', border: 'none' }}>Approve</button>
                    <button onClick={() => handleReject(req._id)} disabled={loading || !!currentUser?.groupID} style={{ padding: '0.5rem 1.2rem', borderRadius: 6, background: '#dc3545', color: '#fff', border: 'none' }}>Reject</button>
                  </li>
                ))}
              </ul>
            )}
            {/* Inline guidance for disabled state */}
            {currentUser?.groupID && (
              <div className="mt-2 text-muted">
                You cannot approve or reject group requests while you are in a group.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentGroupRequest; 