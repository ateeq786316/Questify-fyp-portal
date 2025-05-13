import React, { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";
import "../../../styles/StudentFeedbackComments.css"
import { Card, Form, Button, Table, Badge } from "react-bootstrap";
import { FaCommentDots, FaPaperPlane, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { getDocuments, addComment } from "../../../services/api";
import { toast } from "react-toastify";

const StudentFeedbackComments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [userRole, setUserRole] = useState("student"); // This should come from your auth context

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await getDocuments();
      if (response.success) {
        const flatDocuments = Object.values(response.documents).flat();
        setDocuments(flatDocuments);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
      toast.error("Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e, docId) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await addComment(docId, newComment);
      if (response.success) {
        // Update the documents state with the new comment
        setDocuments(prevDocs => 
          prevDocs.map(doc => 
            doc._id === docId ? response.document : doc
          )
        );
        setNewComment("");
        toast.success("Comment added successfully");
      }
    } catch (err) {
      console.error("Error adding comment:", err);
      toast.error("Failed to add comment");
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
      <div className="student-feedback-comments">
        <Navbar />
        <div className="student-feedback__layout">
          <Sidebar />
          <div className="student-feedback__content">
            <h1 className="dashboard-title text-center">💬 Feedback & Comments</h1>
            <div className="text-center">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="student-feedback-comments">
      <Navbar />
      <div className="student-feedback__layout">
        <Sidebar />
        <div className="student-feedback__content">
          <h1 className="dashboard-title text-center">💬 Feedback & Comments</h1>

          {/* Feedback Table */}
          <Card className="feedback-table mb-4">
            <Card.Body>
              <h2>📌 Feedback Overview</h2>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Status</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc._id}>
                      <td>{doc.title}</td>
                      <td>{getStatusBadge(doc.status)}</td>
                      <td>{doc.feedback || "No remarks yet."}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Comments Section */}
          {documents.map((doc) => (
            <Card className="comment-card mb-4" key={doc._id}>
              <Card.Body>
                <h2>{doc.title} - Comments</h2>
                <div className="comments-list">
                  {doc.comments && doc.comments.length > 0 ? (
                    doc.comments.map((comment, index) => (
                      <div key={index} className={`comment ${comment.sender.role === "student" ? "student" : "supervisor"}`}>
                        <strong>{comment.sender.name} ({comment.sender.role}):</strong> {comment.message}
                        <span className="comment-date">{formatDate(comment.date)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="no-comments">No comments yet.</p>
                  )}
                </div>

                {/* Comment Input */}
                <Form onSubmit={(e) => handleCommentSubmit(e, doc._id)}>
                  <Form.Group className="mt-3 d-flex">
                    <Form.Control
                      type="text"
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <Button variant="primary" type="submit">
                      <FaPaperPlane /> Send
                    </Button>
                  </Form.Group>
                </Form>
              </Card.Body>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentFeedbackComments;
