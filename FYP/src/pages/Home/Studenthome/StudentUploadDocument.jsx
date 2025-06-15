import React, { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";
import "../../../styles/StudentUploadDocument.css";
import { Table, Form, Button, Alert, Card, Spinner } from "react-bootstrap";
import { FaCloudUploadAlt, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { uploadDocument, getDocuments } from "../../../services/api";
import { showError, showSuccess, showWarning, showLoading, updateLoading } from "../../../utils/toastNotifications";

const StudentUploadDocument = () => {
  const [selectedFiles, setSelectedFiles] = useState({});
  const [uploadStatus, setUploadStatus] = useState({});
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const documentSections = [
    { 
      title: "📜 Project Proposal", 
      type: "proposal",
      folder: "proposals",
      description: "Upload your project proposal document"
    },
    { 
      title: "📑 SRS Document", 
      type: "srs",
      folder: "srs",
      description: "Upload your Software Requirements Specification document"
    },
    { 
      title: "📊 System Diagram", 
      type: "diagram",
      folder: "diagrams",
      description: "Upload your system architecture diagram"
    },
    { 
      title: "📄 Final Report", 
      type: "finalReport",
      folder: "finalReports",
      description: "Upload your final project report"
    },
    { 
      title: "📑 Presentation Slides", 
      type: "slides",
      folder: "slides",
      description: "Upload your presentation slides"
    }
  ];

  // Fetch user's documents on component mount
  useEffect(() => {
    const fetchDocuments = async () => {
      const loadingToast = showLoading("Fetching your documents...");
      try {
        setLoading(true);
        setError(null);
        const response = await getDocuments();
        if (response.success) {
          const flatDocuments = Object.values(response.documents).flat();
          setDocuments(flatDocuments);
          updateLoading(loadingToast, "Documents loaded successfully", "success");
        } else {
          setDocuments([]);
          setError("Failed to fetch documents");
          updateLoading(loadingToast, "Failed to fetch documents", "error");
        }
      } catch (err) {
        console.error("Error fetching documents:", err);
        setError(err.response?.data?.msg || "Failed to fetch documents");
        setDocuments([]);
        updateLoading(loadingToast, err.response?.data?.msg || "Failed to fetch documents", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = {
        proposal: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
        srs: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
        finalReport: ["application/pdf"],
        diagram: ["application/pdf", "image/jpeg", "image/png"],
        slides: ["application/pdf", "application/vnd.openxmlformats-officedocument.presentationml.presentation"]
      };

      if (allowedTypes[type]?.includes(file.type)) {
        setSelectedFiles({ ...selectedFiles, [type]: file });
        setUploadStatus({ ...uploadStatus, [type]: null });
      } else {
        setUploadStatus({ ...uploadStatus, [type]: "invalid" });
        setSelectedFiles({ ...selectedFiles, [type]: null });
        showError(`Invalid file type for ${type}. Please check the allowed file types.`);
      }
    }
  };

  const canUploadDocument = (type) => {
    if (!Array.isArray(documents)) return true;
    
    // Find the latest document of this type
    const latestDoc = documents
      .filter(doc => doc.fileType === type)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

    // Allow upload if no document exists or if the latest document was rejected
    return !latestDoc || latestDoc.status === "rejected";
  };

  const handleUpload = async (e, type) => {
    e.preventDefault();
    if (!selectedFiles[type]) return;

    if (!canUploadDocument(type)) {
      showWarning("You can only upload a new document after the previous one is rejected");
      return;
    }

    const loadingToast = showLoading(`Uploading ${type} document...`);
    try {
      const formData = new FormData();
      formData.append('file', selectedFiles[type]);
      formData.append("fileType", type);
      formData.append("title", `${type.charAt(0).toUpperCase() + type.slice(1)} Document`);
      formData.append("description", `Uploaded ${type} document`);

      const response = await uploadDocument(formData);

      if (response.success) {
        setUploadStatus({ ...uploadStatus, [type]: "success" });
        setDocuments(prev => [...prev, response.document]);
        setSelectedFiles({ ...selectedFiles, [type]: null });
        updateLoading(loadingToast, "Document uploaded successfully!", "success");
        
        // Refresh the documents list
        const updatedResponse = await getDocuments();
        if (updatedResponse.success) {
          const flatDocuments = Object.values(updatedResponse.documents).flat();
          setDocuments(flatDocuments);
        }
      }
    } catch (err) {
      console.error("Error uploading document:", err);
      setUploadStatus({ ...uploadStatus, [type]: "error" });
      updateLoading(loadingToast, err.response?.data?.msg || "Failed to upload document", "error");
    }
  };

  const getLatestDocument = (type) => {
    if (!Array.isArray(documents)) return null;
    
    return documents
      .filter(doc => doc.fileType === type)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
  };

  if (loading) {
    return (
      <div className="student-upload-document">
        <Navbar />
        <div className="student-upload__layout">
          <Sidebar />
          <div className="student-upload__content text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-3">Loading documents...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-upload-document">
        <Navbar />
        <div className="student-upload__layout">
          <Sidebar />
          <div className="student-upload__content">
            <Alert variant="danger">
              <Alert.Heading>Error</Alert.Heading>
              <p>{error}</p>
              <Button variant="primary" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="student-upload-document">
      <Navbar />
      <div className="student-upload__layout">
        <Sidebar />
        <div className="student-upload__content">
          <h1 className="dashboard-title text-center">📤 Upload Documents</h1>
          <div className="student-upload__cards">
            {documentSections.map((section) => {
              const latestDoc = getLatestDocument(section.type);
              const canUpload = canUploadDocument(section.type);
              
              return (
                <Card className="upload-card mb-4" key={section.type}>
                  <Card.Body>
                    <h2>{section.title}</h2>
                    <p className="text-muted">{section.description}</p>
                    {latestDoc && (
                      <Alert variant={latestDoc.status === "rejected" ? "danger" : "info"} className="mb-3">
                        Latest Status: {latestDoc.status.toUpperCase()}
                        {latestDoc.feedback && <div>Feedback: {latestDoc.feedback}</div>}
                      </Alert>
                    )}
                    <Form onSubmit={(e) => handleUpload(e, section.type)}>
                      <Form.Group controlId={`formFile-${section.type}`} className="mb-3">
                        <Form.Label>
                          Select a document
                          {section.type === "finalReport" && " (PDF only)"}
                          {section.type === "diagram" && " (PDF, JPEG, PNG)"}
                          {section.type === "slides" && " (PDF, PPTX)"}
                          {(section.type === "proposal" || section.type === "srs") && " (PDF, DOC, DOCX)"}
                        </Form.Label>
                        <Form.Control 
                          type="file" 
                          onChange={(e) => handleFileChange(e, section.type)}
                          disabled={!canUpload}
                          accept={
                            section.type === "finalReport" ? ".pdf" :
                            section.type === "diagram" ? ".pdf,.jpg,.jpeg,.png" :
                            section.type === "slides" ? ".pdf,.pptx" :
                            ".pdf,.doc,.docx"
                          }
                        />
                      </Form.Group>
                      <Button 
                        variant="primary" 
                        type="submit" 
                        className="student-upload__button"
                        disabled={!selectedFiles[section.type] || !canUpload}
                      >
                        <FaCloudUploadAlt /> Upload
                      </Button>
                    </Form>
                    {!canUpload && latestDoc && latestDoc.status !== "rejected" && (
                      <Alert variant="warning" className="mt-3">
                        You can only upload a new document after the current one is rejected
                      </Alert>
                    )}
                    {uploadStatus[section.type] === "invalid" && (
                      <Alert variant="danger" className="mt-3">
                        ❌ Invalid file format. Please check the allowed file types above.
                      </Alert>
                    )}
                    {uploadStatus[section.type] === "success" && (
                      <Alert variant="success" className="mt-3">
                        ✅ File uploaded successfully. Waiting for supervisor's feedback.
                      </Alert>
                    )}
                  </Card.Body>
                </Card>
              );
            })}
          </div>
          
          {/* Uploaded Documents Section */}
          <Card className="uploaded-documents mb-4">
            <Card.Body>
              <h2>📜 Uploaded Documents</h2>
              <Table striped bordered hover className="student-upload__table">
                <thead>
                  <tr>
                    <th>Document Name</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Feedback</th>
                    <th>Upload Date</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(documents) && documents.map((doc) => (
                    <tr key={doc._id}>
                      <td>{doc.title}</td>
                      <td>{doc.fileType}</td>
                      <td className={doc.status === "approved" ? "student-upload__status-success" : doc.status === "rejected" ? "text-danger" : "student-upload__status-warning"}>
                        {doc.status === "approved" ? <FaCheckCircle /> : doc.status === "rejected" ? <FaTimesCircle /> : "⏳"} {doc.status.toUpperCase()}
                      </td>
                      <td>{doc.feedback || "Awaiting feedback"}</td>
                      <td>{new Date(doc.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {(!Array.isArray(documents) || documents.length === 0) && (
                    <tr>
                      <td colSpan="5" className="text-center">No documents uploaded yet</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentUploadDocument;
