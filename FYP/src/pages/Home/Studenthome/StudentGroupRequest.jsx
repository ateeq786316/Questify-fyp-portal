import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../../components/Navbar';
import Sidebar from '../../../components/Sidebar';

const StudentGroupRequest = () => {
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [requestMsg, setRequestMsg] = useState('');
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  // Fetch incoming requests on mount
  useEffect(() => {
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
      setLoading(false);
    } catch (err) {
      setRequestMsg(err.response?.data?.msg || 'Failed to send request');
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
      setIncomingRequests((prev) => prev.filter((r) => r._id !== requestId));
      setLoading(false);
    } catch (err) {
      setActionMsg(err.response?.data?.msg || 'Failed to approve request');
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
      setIncomingRequests((prev) => prev.filter((r) => r._id !== requestId));
      setLoading(false);
    } catch (err) {
      setActionMsg(err.response?.data?.msg || 'Failed to reject request');
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
          <div className="card" style={{ padding: '2rem', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
            <h2>Request a Group Member</h2>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <input
                type="email"
                placeholder="Enter student email"
                value={searchEmail}
                onChange={e => setSearchEmail(e.target.value)}
                required
                style={{ flex: 1, padding: '0.75rem', borderRadius: 6, border: '1px solid #ccc' }}
              />
              <button type="submit" disabled={loading} style={{ padding: '0.75rem 1.5rem', borderRadius: 6, background: '#007bff', color: '#fff', border: 'none' }}>
                {loading ? 'Searching...' : 'Search'}
              </button>
            </form>
            {searchError && <div style={{ color: 'red', marginBottom: 8 }}>{searchError}</div>}
            {searchResult && (
              <div style={{ marginBottom: 8, background: '#f9f9f9', padding: '1rem', borderRadius: 6 }}>
                <div><b>Name:</b> {searchResult.name}</div>
                <div><b>Email:</b> {searchResult.email}</div>
                <div><b>Department:</b> {searchResult.department}</div>
                <button onClick={handleSendRequest} disabled={loading} style={{ marginTop: 8, padding: '0.5rem 1.2rem', borderRadius: 6, background: '#28a745', color: '#fff', border: 'none' }}>
                  {loading ? 'Sending...' : 'Send Group Request'}
                </button>
              </div>
            )}
            {requestMsg && <div style={{ color: requestMsg.includes('sent') ? 'green' : 'red' }}>{requestMsg}</div>}
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
                    <button onClick={() => handleApprove(req._id)} disabled={loading} style={{ marginRight: 8, padding: '0.5rem 1.2rem', borderRadius: 6, background: '#28a745', color: '#fff', border: 'none' }}>Approve</button>
                    <button onClick={() => handleReject(req._id)} disabled={loading} style={{ padding: '0.5rem 1.2rem', borderRadius: 6, background: '#dc3545', color: '#fff', border: 'none' }}>Reject</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentGroupRequest; 