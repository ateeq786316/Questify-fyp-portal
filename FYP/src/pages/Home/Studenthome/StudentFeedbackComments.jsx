import React, { useState } from "react";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";
import "../../../styles/StudentFeedbackComments.css"
import { Card, Form, Button, Table, Badge } from "react-bootstrap";
import { FaCommentDots, FaPaperPlane, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const StudentFeedbackComments = () => {
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState({
    proposal: [{ from: "Supervisor", message: "Your proposal needs more details on methodology.", date: "Feb 8, 2025" }],
    srs: [{ from: "Supervisor", message: "Well structured, but needs more references.", date: "Feb 10, 2025" }],
    diagram: [],
    finalReport: [],
  });

  const documentSections = [
    { title: "📜 Project Proposal", type: "proposal", status: "Reviewed" },
    { title: "📑 SRS Document", type: "srs", status: "Pending" },
    { title: "📊 System Diagram", type: "diagram", status: "Pending" },
    { title: "📄 Final Report", type: "finalReport", status: "Not Submitted" },
  ];

  const handleCommentSubmit = (e, type) => {
    e.preventDefault();
    if (newComment.trim()) {
      setComments({
        ...comments,
        [type]: [...comments[type], { from: "Student", message: newComment, date: "Feb 10, 2025" }],
      });
      setNewComment("");
    }
  };

  return (
    <div className="student-feedback-comments">
      <Navbar />
      <div className="dashboard-container d-flex">
        <Sidebar />
        <div className="dashboard-content p-4 w-100">
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
                  {documentSections.map((section) => (
                    <tr key={section.type}>
                      <td>{section.title}</td>
                      <td>
                        <Badge
                          bg={section.status === "Reviewed" ? "success" : section.status === "Pending" ? "warning" : "danger"}
                        >
                          {section.status}
                        </Badge>
                      </td>
                      <td>
                        {comments[section.type].length > 0
                          ? comments[section.type][0].message
                          : "No remarks yet."}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Comments Section */}
          {documentSections.map((section) => (
            <Card className="comment-card mb-4" key={section.type}>
              <Card.Body>
                <h2>{section.title} - Comments</h2>
                <div className="comments-list">
                  {comments[section.type].length > 0 ? (
                    comments[section.type].map((comment, index) => (
                      <div key={index} className={`comment ${comment.from === "Student" ? "student" : "supervisor"}`}>
                        <strong>{comment.from}:</strong> {comment.message}
                        <span className="comment-date">{comment.date}</span>
                      </div>
                    ))
                  ) : (
                    <p className="no-comments">No comments yet.</p>
                  )}
                </div>

                {/* Comment Input */}
                <Form onSubmit={(e) => handleCommentSubmit(e, section.type)}>
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
