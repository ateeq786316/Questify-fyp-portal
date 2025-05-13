import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { FaBars, FaHome, FaUsers, FaCalendarAlt, FaCog, FaGraduationCap, FaChartPie, FaCloudUploadAlt } from 'react-icons/fa';
import { Spinner } from 'react-bootstrap';
import './AdminDashboard.css';
import Navbar from '../../../components/Navbar';
import { useNavigate, useLocation } from 'react-router-dom';

const StudentUpload = () => {
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Upload state
  const [csvFile, setCsvFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  // Handle file input change
  const handleFileChange = (e) => {
    setFeedback('');
    setFileError('');
    setParsedData([]);
    setHeaders([]);
    const file = e.target.files[0];
    if (!file) return;

    // Accept only .xlsx
    if (!file.name.endsWith('.xlsx')) {
      setFileError('Please upload a valid .xlsx Excel file.');
      setCsvFile(null);
      return;
    }

    setCsvFile(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (!jsonData.length) {
        setFileError('Excel file is empty or incorrectly formatted.');
        setParsedData([]);
        setHeaders([]);
        return;
      }

      // Get headers from the first row
      setHeaders(Object.keys(jsonData[0]));
      setParsedData(jsonData);
      console.log('Parsed XLSX:', jsonData);
    };
    reader.onerror = (err) => {
      setFileError('Error reading Excel file.');
      setParsedData([]);
      setHeaders([]);
      console.error('FileReader error:', err);
    };
    reader.readAsBinaryString(file);
  };

  // Handle submit to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback('');
    setFileError('');
    if (!csvFile) {
      setFileError('Please select an Excel file to upload.');
      return;
    }
    if (!parsedData.length) {
      setFeedback('No data to upload.');
      return;
    }
    setLoading(true);
    try {
      // Add role: 'student' to each entry
      const students = parsedData.map((row) => ({ ...row, role: 'student' }));
      console.log('Submitting students:', students);
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(
        'http://localhost:5000/api/admin/upload-students',
        { students },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      console.log('Backend response:', response.data);
      if (response.data.success) {
        setFeedback('Students uploaded successfully!');
        setParsedData([]);
        setCsvFile(null);
        setHeaders([]);
      } else {
        setFeedback(response.data.msg || 'Upload failed.');
      }
    } catch (err) {
      setFeedback('Error uploading students.');
      console.error('Upload error:', err);
    }
    setLoading(false);
  };

  // Sidebar toggle functions
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  return (
    <div>
      <Navbar />
      <div className={`admin-dashboard ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
        {/* Mobile Sidebar Toggle */}
        <button className="mobile-sidebar-toggle" onClick={toggleMobileSidebar}>
          <FaBars />
        </button>

        {/* Sidebar */}
        <div className={`sidebar ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
          <div className="sidebar-header">
            <h3>FYP Dashboard</h3>
            <button className="sidebar-toggle" onClick={toggleSidebar}>
              {sidebarOpen ? '◀' : '▶'}
            </button>
          </div>
          
          <ul className="sidebar-menu">
            <li className={location.pathname === '/admindashboard' ? 'active' : ''} onClick={() => navigate('/admindashboard')} style={{cursor: 'pointer'}}>
              <FaHome className="sidebar-icon" />
              {sidebarOpen && <span>Dashboard</span>}
            </li>
            <li className={location.pathname === '/admin/upload-students' ? 'active' : ''} onClick={() => navigate('/admin/upload-students')} style={{cursor: 'pointer'}}>
              <FaGraduationCap className="sidebar-icon" />
              {sidebarOpen && <span>Students</span>}
            </li>
            <li>
              <FaUsers className="sidebar-icon" />
              {sidebarOpen && <span>Supervisors</span>}
            </li>
            <li>
              <FaCalendarAlt className="sidebar-icon" />
              {sidebarOpen && <span>Milestones</span>}
            </li>
            <li>
              <FaChartPie className="sidebar-icon" />
              {sidebarOpen && <span>Reports</span>}
            </li>
            <li>
              <FaCog className="sidebar-icon" />
              {sidebarOpen && <span>Settings</span>}
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="main-content">
          <div className="dashboard-content">
            <h1>Upload Students</h1>
            
            <div className="upload-section">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="xlsx-upload">
                    <FaCloudUploadAlt className="upload-icon" /> Select Excel File
                  </label>
                  <input
                    id="xlsx-upload"
                    type="file"
                    accept=".xlsx"
                    onChange={handleFileChange}
                    disabled={loading}
                    className="date-picker-input"
                  />
                  {fileError && (
                    <div className="error-message">
                      <p>{fileError}</p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="save-button"
                  disabled={!csvFile || loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" /> Uploading...
                    </>
                  ) : (
                    'Submit to Database'
                  )}
                </button>
              </form>

              {feedback && (
                <div className={`feedback-message ${feedback.includes('successfully') ? 'success' : 'error'}`}>
                  <p>{feedback}</p>
                </div>
              )}
            </div>

            {parsedData.length > 0 && (
              <div className="preview-section">
                <h2>Preview</h2>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        {headers.map((header) => (
                          <th key={header}>{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.map((row, idx) => (
                        <tr key={idx}>
                          {headers.map((header) => (
                            <td key={header}>{row[header]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentUpload; 