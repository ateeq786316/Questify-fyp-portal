import React, { useState } from 'react';
import { FaUpload, FaFileExcel, FaDownload } from 'react-icons/fa';
import axios from 'axios';
import '../../../styles/shared.css';
import './UploadSupervisors.css';
import AdminSidebarLayout from '../../../components/AdminSidebarLayout';

const UploadSupervisors = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [duplicateEmails, setDuplicateEmails] = useState([]);
  const [uploadResponse, setUploadResponse] = useState(null);

  // Single supervisor form state
  const [singleSupervisor, setSingleSupervisor] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    contact: '',
    supervisorId: '',
    supervisorExpertise: '',
    role: 'supervisor',
  });
  const [singleSupervisorMsg, setSingleSupervisorMsg] = useState(null);
  const [singleSupervisorError, setSingleSupervisorError] = useState(null);
  const [singleSupervisorLoading, setSingleSupervisorLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        setFile(selectedFile);
        setError(null);
      } else {
        setFile(null);
      setError('Please select a valid Excel file (.xlsx)');
    }
  };

  const handleTemplateDownload = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('http://localhost:5000/api/admin/supervisor-template', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      });
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'supervisor_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download template');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    setDuplicateEmails([]);
    setUploadResponse(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post('http://localhost:5000/api/admin/supervisors/upload', formData, {
          headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setUploadResponse(response.data);
      if (response.data.success) {
        setSuccess('Supervisors uploaded successfully');
        setFile(null);
        setDuplicateEmails(response.data.details?.duplicates?.map(d => d.email) || []);
        document.getElementById('fileInput').value = '';
      } else {
        setError(response.data.msg || 'Upload failed');
        setDuplicateEmails([]);
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to upload supervisors');
      setDuplicateEmails([]);
      setUploadResponse(null);
    } finally {
      setLoading(false);
    }
  };

  // Single supervisor form handlers
  const handleSingleSupervisorChange = (e) => {
    setSingleSupervisor({
      ...singleSupervisor,
      [e.target.name]: e.target.value,
    });
  };

  const handleSingleSupervisorSubmit = async (e) => {
    e.preventDefault();
    setSingleSupervisorMsg(null);
    setSingleSupervisorError(null);
    setSingleSupervisorLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post('http://localhost:5000/api/admin/add-supervisor', singleSupervisor, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.data.success) {
        setSingleSupervisorMsg('Supervisor added successfully');
        setSingleSupervisor({
          name: '',
          email: '',
          password: '',
          department: '',
          contact: '',
          supervisorId: '',
          supervisorExpertise: '',
          role: 'supervisor',
        });
      } else {
        setSingleSupervisorError(response.data.msg || 'Failed to add supervisor');
      }
    } catch (err) {
      setSingleSupervisorError(err.response?.data?.msg || 'Failed to add supervisor');
    } finally {
      setSingleSupervisorLoading(false);
    }
  };

  return (
    <AdminSidebarLayout>
      <div className="upload-cards-container">
        <div className="upload-card">
          <h2><FaUpload className="icon" /> Upload Supervisors</h2>
          <div className="upload-content">
            <div className="template-section">
              <button className="template-button" onClick={handleTemplateDownload}>
                <FaDownload /> Download Template
              </button>
              <p className="template-note">Download the template file to ensure correct format</p>
            </div>
            <div className="file-input-container">
              <input
                type="file"
                id="fileInput"
                accept=".xlsx"
                onChange={handleFileChange}
                className="file-input"
              />
              <label htmlFor="fileInput" className="file-input-label">
                {file ? file.name : 'Choose File'}
              </label>
            </div>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            {/* Show duplicate emails in file */}
            {uploadResponse?.fileDuplicates && uploadResponse.fileDuplicates.length > 0 && (
              <div className="error-message">
                The following emails were duplicated in your file and not added:
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', textAlign: 'left' }}>
                  {uploadResponse.fileDuplicates.map((email, idx) => (
                    <li key={idx}>{email}</li>
                  ))}
                </ul>
              </div>
            )}
            {/* Show duplicate emails already in database */}
            {duplicateEmails.length > 0 && (
              <div className="error-message">
                The following emails already exist and were not added:
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', textAlign: 'left' }}>
                  {duplicateEmails.map((email, idx) => (
                    <li key={idx}>{email}</li>
                  ))}
                </ul>
              </div>
            )}
            <button 
              className="upload-button"
              onClick={handleUpload} 
              disabled={!file || loading}
            >
              {loading ? 'Uploading...' : 'Upload Supervisors'}
            </button>
          </div>
        </div>
        <div className="single-student-card">
          <div className="single-student-section">
            <h3>Add a Single Supervisor</h3>
            <form onSubmit={handleSingleSupervisorSubmit} className="single-student-form">
              <div className="form-row">
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={singleSupervisor.name}
                  onChange={handleSingleSupervisorChange}
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email must be @lgu.edu.pk"
                  value={singleSupervisor.email}
                  onChange={handleSingleSupervisorChange}
                  required
                />
              </div>
              <div className="form-row">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={singleSupervisor.password}
                  onChange={handleSingleSupervisorChange}
                  required
                />
                <input
                  type="text"
                  name="department"
                  placeholder="Department"
                  value={singleSupervisor.department}
                  onChange={handleSingleSupervisorChange}
                  required
                />
              </div>
              <div className="form-row">
                <input
                  type="text"
                  name="contact"
                  placeholder="Contact"
                  value={singleSupervisor.contact}
                  onChange={handleSingleSupervisorChange}
                />
                <input
                  type="text"
                  name="supervisorId"
                  placeholder="Supervisor ID"
                  value={singleSupervisor.supervisorId}
                  onChange={handleSingleSupervisorChange}
                />
                <input
                  type="text"
                  name="supervisorExpertise"
                  placeholder="Expertise (comma separated)"
                  value={singleSupervisor.supervisorExpertise}
                  onChange={handleSingleSupervisorChange}
                />
                <input
                  type="text"
                  name="role"
                  value={singleSupervisor.role}
                  readOnly
                  style={{ background: '#f1f1f1', color: '#888', cursor: 'not-allowed' }}
                />
              </div>
              <button type="submit" className="upload-button" disabled={singleSupervisorLoading}>
                {singleSupervisorLoading ? 'Adding...' : 'Add Supervisor'}
            </button>
              {singleSupervisorMsg && <div className="success-message">{singleSupervisorMsg}</div>}
              {singleSupervisorError && <div className="error-message">{singleSupervisorError}</div>}
            </form>
          </div>
        </div>
      </div>
    </AdminSidebarLayout>
  );
};

export default UploadSupervisors; 