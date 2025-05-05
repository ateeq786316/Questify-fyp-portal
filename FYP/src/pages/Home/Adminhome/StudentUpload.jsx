import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import './AdminDashboard.css';

const StudentUpload = () => {
  const [csvFile, setCsvFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState('');

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
      setFileError('Please select a CSV file to upload.');
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

  return (
    <div className="dashboard-content" style={{ maxWidth: 700, margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: 30 }}>Upload Students (CSV)</h1>
      <form onSubmit={handleSubmit} style={{ background: 'white', padding: 30, borderRadius: 10, boxShadow: '0 4px 6px rgba(0,0,0,0.08)', marginBottom: 30 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <label htmlFor="xlsx-upload" style={{ fontWeight: 500, fontSize: 16 }}>Select Excel File:</label>
          <input
            id="xlsx-upload"
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            disabled={loading}
            style={{ marginBottom: 0 }}
            className="date-picker-input"
          />
          {fileError && <div className="error-message" style={{ marginBottom: 0 }}>{fileError}</div>}
          <button
            type="submit"
            className="save-button"
            style={{ marginTop: 10, width: 220, alignSelf: 'flex-start', fontSize: 16 }}
            disabled={!csvFile || loading}
          >
            {loading ? 'Uploading...' : 'Submit to Database'}
          </button>
        </div>
      </form>
      {feedback && <div className="error-message" style={{ marginBottom: 20 }}>{feedback}</div>}
      {parsedData.length > 0 && (
        <>
          <h2 style={{ marginBottom: 10 }}>Preview</h2>
          <div style={{ overflowX: 'auto', marginBottom: 20, background: 'white', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.04)', padding: 16 }}>
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
        </>
      )}
    </div>
  );
};

export default StudentUpload; 