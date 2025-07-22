import React, { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";
import "../../../styles/StudentFeedbackComments.css"
import { Card, Form, Button, Badge } from "react-bootstrap";
import { FaCommentDots, FaPaperPlane, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { getDocuments, addComment } from "../../../services/api";
import { showError, showSuccess, showLoading, updateLoading } from "../../../utils/toastNotifications";

const StudentFeedbackComments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [userRole, setUserRole] = useState("student");

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    const loadingToast = showLoading("Fetching documents and comments...");
    try {
      setLoading(true);
      const response = await getDocuments();
      if (response.success) {
        const flatDocuments = Object.values(response.documents).flat();
        setDocuments(flatDocuments);
        updateLoading(loadingToast, "Documents loaded successfully", "success");
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
      updateLoading(loadingToast, err.response?.data?.msg || "Failed to fetch documents", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e, docId) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const loadingToast = showLoading("Adding your comment...");
    try {
      const response = await addComment(docId, newComment);
      if (response.success) {
        setDocuments(prevDocs => 
          prevDocs.map(doc => 
            doc._id === docId ? response.document : doc
          )
        );
        setNewComment("");
        updateLoading(loadingToast, "Comment added successfully", "success");
      }
    } catch (err) {
      console.error("Error adding comment:", err);
      updateLoading(loadingToast, err.response?.data?.msg || "Failed to add comment", "error");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: "warning", text: "Pending" },
      reviewed: { bg: "info", text: "Reviewed" },
      approved: { bg: "success", text: "Approved" },
      rejected: { bg: "danger", text: "Rejected" }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="stfc-container">
        <Navbar />
        <div className="stfc-layout">
          <Sidebar />
          <div className="stfc-content">
            <h1 className="stfc-title text-center">💬 Feedback & Comments</h1>
            <div className="text-center">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stfc-container">
      <Navbar />
      <div className="stfc-layout">
        <Sidebar />
        <div className="stfc-content">
          <h1 className="stfc-title text-center">💬 Feedback & Comments</h1>

          <div className="stfc-grid">
                  {documents.map((doc) => (
              <Card className="stfc-doc-card" key={doc._id}>
                <Card.Header className="stfc-card-header">
                  <h3 className="stfc-doc-title">{doc.title}</h3>
                  <div className="stfc-status">{getStatusBadge(doc.status)}</div>
                </Card.Header>
              <Card.Body>
                  <div className="stfc-feedback">
                    <h4>Feedback:</h4>
                    <p>{doc.feedback || "No remarks yet."}</p>
                  </div>

                  <div className="stfc-comments-section">
                    <h4>Comments:</h4>
                    <div className="stfc-comments-list">
                  {doc.comments && doc.comments.length > 0 ? (
                    doc.comments.map((comment, index) => (
                          <div key={index} className={`stfc-comment ${comment.sender.role === "student" ? "stfc-comment-student" : "stfc-comment-supervisor"}`}>
                            <div className="stfc-comment-header">
                              <strong>{comment.sender.name}</strong>
                              <span className="stfc-comment-date">{formatDate(comment.date)}</span>
                            </div>
                            <p className="stfc-comment-message">{comment.message}</p>
                      </div>
                    ))
                  ) : (
                        <p className="stfc-no-comments">No comments yet.</p>
                  )}
                </div>

                    <Form onSubmit={(e) => handleCommentSubmit(e, doc._id)} className="stfc-comment-form">
                      <Form.Group className="d-flex gap-2">
                    <Form.Control
                      type="text"
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                          className="stfc-comment-input"
                    />
                        <Button variant="primary" type="submit" className="stfc-comment-submit">
                      <FaPaperPlane /> Send
                    </Button>
                  </Form.Group>
                </Form>
                  </div>
              </Card.Body>
            </Card>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentFeedbackComments;
