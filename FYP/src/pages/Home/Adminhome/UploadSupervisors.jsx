import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUpload, FaFileExcel, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import AdminSidebarLayout from '../../../components/AdminSidebarLayout';
import './UploadSupervisors.css';

const UploadSupervisors = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          selectedFile.type === 'application/vnd.ms-excel') {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please upload an Excel file (.xlsx or .xls)');
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(
        'http://localhost:5000/api/admin/upload-supervisors',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Supervisors uploaded successfully!');
        setFile(null);
        // Reset file input
        document.getElementById('fileInput').value = '';
      } else {
        throw new Error(response.data.msg || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.msg || err.message || 'Failed to upload supervisors');
      toast.error(err.response?.data?.msg || err.message || 'Failed to upload supervisors');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminSidebarLayout>
      <div className="upload-supervisors-container">
        <h1>Upload Supervisors</h1>
        
        <div className="upload-section">
          <div className="upload-box">
            <FaFileExcel className="excel-icon" />
            <h2>Upload Supervisor Data</h2>
            <p>Upload an Excel file containing supervisor information</p>
            
            <div className="file-input-container">
              <input
                type="file"
                id="fileInput"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="file-input"
              />
              <label htmlFor="fileInput" className="file-input-label">
                Choose File
              </label>
              {file && <span className="file-name">{file.name}</span>}
            </div>

            {error && <div className="error-message">{error}</div>}

            <button 
              onClick={handleUpload} 
              disabled={!file || loading}
              className="upload-button"
            >
              {loading ? (
                <>
                  <FaSpinner className="spinner" />
                  Uploading...
                </>
              ) : (
                <>
                  <FaUpload />
                  Upload Supervisors
                </>
              )}
            </button>
          </div>

          <div className="instructions-box">
            <h3>Instructions</h3>
            <ol>
              <li>Download the template file</li>
              <li>Fill in the supervisor information</li>
              <li>Save the file in Excel format (.xlsx or .xls)</li>
              <li>Upload the file using the form above</li>
            </ol>
            <button className="download-template-button">
              Download Template
            </button>
          </div>
        </div>
      </div>
    </AdminSidebarLayout>
  );
};

export default UploadSupervisors; 