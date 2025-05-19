import React, { useState } from 'react';
import { FaUpload, FaFileExcel } from 'react-icons/fa';
import axios from 'axios';
import '../../../styles/shared.css';
import './UploadSupervisors.css';
import AdminSidebarLayout from '../../../components/AdminSidebarLayout';

const UploadSupervisors = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

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

      if (response.data.success) {
        setSuccess('Supervisors uploaded successfully');
        setFile(null);
        // Reset file input
        document.getElementById('fileInput').value = '';
      } else {
        setError(response.data.msg || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.msg || 'Failed to upload supervisors');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminSidebarLayout>
      <div className="upload-container">
        <h2><FaUpload className="icon" /> Upload Supervisors</h2>
        
        <div className="upload-card">
          <div className="upload-header">
            <FaFileExcel className="excel-icon" />
            <h3>Upload Supervisor Data</h3>
          </div>

          <div className="upload-content">
            <p>Upload an Excel file containing supervisor information.</p>
            <p className="note">Note: File must be in .xlsx format</p>

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

            <button 
              className="upload-button"
              onClick={handleUpload}
              disabled={!file || loading}
            >
              {loading ? 'Uploading...' : 'Upload Supervisors'}
            </button>
          </div>
        </div>
      </div>
    </AdminSidebarLayout>
  );
};

export default UploadSupervisors; 