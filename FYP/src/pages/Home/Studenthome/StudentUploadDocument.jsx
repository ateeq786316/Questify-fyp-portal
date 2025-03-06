import React, { useState } from "react";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";
import "../../../styles/StudentUploadDocument.css";
import bgImage from "../../../assets/lgubgimg.jpg"; // Background Image Import
import { Table, Form, Button, Alert, Card } from "react-bootstrap";
import { FaCloudUploadAlt, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const StudentUploadDocument = () => {
  const [selectedFiles, setSelectedFiles] = useState({});
  const [uploadStatus, setUploadStatus] = useState({});
  const documentSections = [
    { title: "📜 Project Proposal", type: "proposal" },
    { title: "📑 SRS ", type: "SRS" },
    { title: "📊 System Diagram", type: "Diagram" },
    { title: "📄 Final Report", type: "FinalReport" },
  ];
  const [documents, setDocuments] = useState({
    proposal: [],
    srs: [],
    diagram: [],
    finalReport: [],
  });

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file && (file.type === "application/pdf" || file.type.includes("officedocument") || file.type.includes("word"))) {
      setSelectedFiles({ ...selectedFiles, [type]: file });
      setUploadStatus({ ...uploadStatus, [type]: null });
    } else {
      setUploadStatus({ ...uploadStatus, [type]: "invalid" });
      setSelectedFiles({ ...selectedFiles, [type]: null });
    }
  };

  const handleUpload = (e, type) => {
    e.preventDefault();
    if (selectedFiles[type]) {
      setUploadStatus({ ...uploadStatus, [type]: "success" });
      setDocuments({
        ...documents,
        [type]: [
          ...documents[type],
          { name: selectedFiles[type].name, status: "Pending", feedback: "Awaiting review" },
        ],
      });
      setSelectedFiles({ ...selectedFiles, [type]: null });
    }
  };

  return (
    <div className="student-upload-document"
    style={{ backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <Navbar />
      <div className="dashboard-container d-flex">
        <Sidebar />
        <div className="dashboard-content p-4 w-100">
          <h1 className="dashboard-title text-center">📤 Upload Documents</h1>

          {/* Upload Sections */}
          {documentSections.map((section) => (
            <Card className="upload-card mb-4" key={section.type}>
              <Card.Body>
                <h2>{section.title}</h2>
                <Form onSubmit={(e) => handleUpload(e, section.type)}>
                  <Form.Group controlId={`formFile-${section.type}`} className="mb-3">
                    <Form.Label>Select a document (PDF, DOC, DOCX)</Form.Label>
                    <Form.Control type="file" onChange={(e) => handleFileChange(e, section.type)} />
                  </Form.Group>
                  <Button variant="primary" type="submit" disabled={!selectedFiles[section.type]}>
                    <FaCloudUploadAlt /> Upload
                  </Button>
                </Form>
                {uploadStatus[section.type] === "invalid" && (
                  <Alert variant="danger" className="mt-3">
                    ❌ Invalid file format. Please upload a PDF or DOC file.
                  </Alert>
                )}
                {uploadStatus[section.type] === "success" && (
                  <Alert variant="success" className="mt-3">
                    ✅ File uploaded successfully. Waiting for supervisor's feedback.
                  </Alert>
                )}
              </Card.Body>
            </Card>
          ))}

          {/* Uploaded Documents Section */}
          <Card className="uploaded-documents mb-4">
            <Card.Body>
              <h2>📜 Uploaded Documents</h2>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Document Name</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(documents).map((type) =>
                    documents[type].map((doc, index) => (
                      <tr key={index}>
                        <td>{doc.name}</td>
                        <td>{type}</td>
                        <td className={doc.status === "Approved" ? "text-success" : "text-warning"}>
                          {doc.status === "Approved" ? <FaCheckCircle /> : <FaTimesCircle />} {doc.status}
                        </td>
                        <td>{doc.feedback}</td>
                      </tr>
                    ))
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
