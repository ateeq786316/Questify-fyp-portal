import React, { useState } from 'react';
import { FaUpload, FaFileExcel, FaDownload } from 'react-icons/fa';
import axios from 'axios';
import '../../../styles/shared.css';
import './UploadSupervisors.css';
import AdminSidebarLayout from '../../../components/AdminSidebarLayout';

const StudentUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [duplicateEmails, setDuplicateEmails] = useState([]);
  const [uploadResponse, setUploadResponse] = useState(null);
  const [singleStudent, setSingleStudent] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    batch: '',
    contact: '',
    role: 'student',
  });
  const [singleStudentMsg, setSingleStudentMsg] = useState(null);
  const [singleStudentError, setSingleStudentError] = useState(null);
  const [singleStudentLoading, setSingleStudentLoading] = useState(false);

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

  const validateEmail = (email) => {
    const emailRegex = /@lgu\.edu\.pk$/;
    return emailRegex.test(email);
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
      const response = await axios.post('http://localhost:5000/api/admin/upload-students', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setUploadResponse(response.data);

      if (response.data.success) {
        setSuccess('Students uploaded successfully');
        setFile(null);
        // Check for invalid emails in the response
        if (response.data.invalidEmails && response.data.invalidEmails.length > 0) {
          setError('Some emails were invalid. Only @lgu.edu.pk emails are allowed for students.');
          setDuplicateEmails(response.data.invalidEmails);
        } else {
          setDuplicateEmails(response.data.details?.duplicates?.map(d => d.email) || []);
        }
        // Reset file input
        document.getElementById('fileInput').value = '';
      } else {
        setError(response.data.msg || 'Upload failed');
        setDuplicateEmails([]);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.msg || 'Failed to upload students');
      setDuplicateEmails([]);
      setUploadResponse(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateDownload = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('http://localhost:5000/api/admin/student-template', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      });

      // Create a blob from the response data
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'student_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Template download error:', err);
      setError('Failed to download template');
    }
  };

  const handleSingleStudentChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'email') {
      if (!validateEmail(value)) {
        setSingleStudentError('Invalid email domain. Only @lgu.edu.pk emails are allowed for students.');
      } else {
        setSingleStudentError(null);
      }
    }
    
    setSingleStudent({
      ...singleStudent,
      [name]: value,
    });
  };

  const handleSingleStudentSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email before submission
    if (!validateEmail(singleStudent.email)) {
      setSingleStudentError('Invalid email domain. Only @lgu.edu.pk emails are allowed for students.');
      return;
    }
    
    setSingleStudentMsg(null);
    setSingleStudentError(null);
    setSingleStudentLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post('http://localhost:5000/api/admin/add-student', singleStudent, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.data.success) {
        setSingleStudentMsg('Student added successfully');
        setSingleStudent({
          name: '',
          email: '',
          password: '',
          department: '',
          batch: '',
          contact: '',
          role: 'student',
        });
      } else {
        setSingleStudentError(response.data.msg || 'Failed to add student');
      }
    } catch (err) {
      setSingleStudentError(err.response?.data?.msg || 'Failed to add student');
    } finally {
      setSingleStudentLoading(false);
    }
  };

  return (
    <AdminSidebarLayout>
      <div className="upload-cards-container">
        <div className="upload-card">
          <h2><FaUpload className="icon" /> Upload Students</h2>
          
          <div className="upload-content">
            <p>Upload an Excel file containing student information.</p>
            <p className="note">Note: File must be in .xlsx format</p>

            <div className="template-section">
              <button 
                className="template-button"
                onClick={handleTemplateDownload}
              >
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
              {loading ? 'Uploading...' : 'Upload Students'}
                </button>
          </div>
                </div>
        <div className="single-student-card">
          <div className="single-student-section">
            <h3>Add a Single Student</h3>
            <form onSubmit={handleSingleStudentSubmit} className="single-student-form">
              <div className="form-row">
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={singleStudent.name}
                  onChange={handleSingleStudentChange}
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email must be @lgu.edu.pk"
                  value={singleStudent.email}
                  onChange={handleSingleStudentChange}
                  required
                />
            </div>
              <div className="form-row">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={singleStudent.password}
                  onChange={handleSingleStudentChange}
                  required
                />
                <input
                  type="text"
                  name="department"
                  placeholder="Department"
                  value={singleStudent.department}
                  onChange={handleSingleStudentChange}
                  required
                />
                </div>
              <div className="form-row">
                <input
                  type="text"
                  name="batch"
                  placeholder="Batch"
                  value={singleStudent.batch}
                  onChange={handleSingleStudentChange}
                />
                <input
                  type="text"
                  name="contact"
                  placeholder="Contact"
                  value={singleStudent.contact}
                  onChange={handleSingleStudentChange}
                />
                <input
                  type="text"
                  name="role"
                  value={singleStudent.role}
                  readOnly
                  style={{ background: '#f1f1f1', color: '#888', cursor: 'not-allowed' }}
                />
              </div>
              <button type="submit" className="upload-button" disabled={singleStudentLoading}>
                {singleStudentLoading ? 'Adding...' : 'Add Student'}
              </button>
              {singleStudentMsg && <div className="success-message">{singleStudentMsg}</div>}
              {singleStudentError && <div className="error-message">{singleStudentError}</div>}
            </form>
          </div>
        </div>
      </div>
    </AdminSidebarLayout>
  );
};

export default StudentUpload; 