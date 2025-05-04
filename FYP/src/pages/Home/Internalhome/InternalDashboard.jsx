import React, { useState } from "react";
import './InternalDashboard.css';

function InternalDashboard() {
  // Example internal details
  const internal = {
    id: "INT123",
    name: "John Doe",
    email: "john.doe@example.com",
    domain: "Computer Science"
  };

  // Example student group data
  const groups = [
    {
      groupId: "G1",
      members: "Alice, Bob, Charlie",
      projectTitle: "AI-based Chatbot",
      documents: [
        { name: "Proposal", fileType: "pdf", url: "#" },
        { name: "System Design", fileType: "ppt", url: "#" },
        { name: "SRS", fileType: "docx", url: "#" },
        { name: "Full Book", fileType: "pdf", url: "#" },
      ]
    },
    {
      groupId: "G1",
      members: "Alice, Bob, Charlie",
      projectTitle: "AI-based Chatbot",
      documents: [
        { name: "Proposal", fileType: "pdf", url: "#" },
        { name: "System Design", fileType: "ppt", url: "#" },
        { name: "SRS", fileType: "docx", url: "#" },
        { name: "Full Book", fileType: "pdf", url: "#" },
      ]
    },
    {
      groupId: "G2",
      members: "David, Emma, Frank",
      projectTitle: "Blockchain Application",
      documents: [
        { name: "Proposal", fileType: "pdf", url: "#" },
        { name: "System Design", fileType: "ppt", url: "#" },
        { name: "SRS", fileType: "docx", url: "#" },
        { name: "Full Book", fileType: "pdf", url: "#" },
      ]
    },
    {
      groupId: "G3",
      members: "George, Hannah, Ian",
      projectTitle: "Machine Learning Model",
      documents: [
        { name: "Proposal", fileType: "pdf", url: "#" },
        { name: "System Design", fileType: "ppt", url: "#" },
        { name: "SRS", fileType: "docx", url: "#" },
        { name: "Full Book", fileType: "pdf", url: "#" },
      ]
    }
  ];

  // States for comments, marks, and document visibility
  const [comments, setComments] = useState({});
  const [marks, setMarks] = useState({});
  const [feedback, setFeedback] = useState("");
  const [documentVisibility, setDocumentVisibility] = useState({});

  // Handle comments change
  const handleCommentChange = (groupId, event) => {
    setComments({
      ...comments,
      [groupId]: event.target.value,
    });
  };

  // Handle marks change
  const handleMarksChange = (groupId, event) => {
    setMarks({
      ...marks,
      [groupId]: event.target.value,
    });
  };

  // Handle submit comment and marks
  const handleSubmit = (groupId) => {
    setFeedback(`Feedback submitted for Group ${groupId}`);
    // Optionally, you can clear the comments and marks after submission
    setComments({
      ...comments,
      [groupId]: "",
    });
    setMarks({
      ...marks,
      [groupId]: "",
    });
  };

  // Toggle document visibility
  const toggleDocuments = (groupId) => {
    setDocumentVisibility({
      ...documentVisibility,
      [groupId]: !documentVisibility[groupId],
    });
  };

  return (
    <div className="internal-dashboard">
      {/* Banner */}
      <div className="banner">
        <h1 className="internal-name">{internal.name}</h1>
        <div className="info">
          <p><strong>ID:</strong> {internal.id}</p>
          <p><strong>Email:</strong> {internal.email}</p>
          <p><strong>Domain:</strong> {internal.domain}</p>
        </div>
      </div>

      {/* Groups List */}
      <div className="groups-container">
        {groups.map((group, index) => {
          const groupClass = index % 2 === 0 ? "even-group" : "odd-group"; // Apply even or odd class
          return (
            <div key={group.groupId} className={`group-card ${groupClass}`}>
              <div className="group-header">
                <h2>Group {group.groupId} - {group.projectTitle}</h2>
                <p><strong>Members:</strong> {group.members}</p>
              </div>

              {/* Comments Section */}
              <textarea
                className="comment-box"
                value={comments[group.groupId] || ""}
                onChange={(event) => handleCommentChange(group.groupId, event)}
                placeholder="Add your comments here..."
              />

              {/* Marks Input */}
              <input
                type="number"
                className="marks-input"
                value={marks[group.groupId] || ""}
                onChange={(event) => handleMarksChange(group.groupId, event)}
                placeholder="Enter Marks"
              />

              {/* Submit Button */}
              <button
                className="submit-btn"
                onClick={() => handleSubmit(group.groupId)}
              >
                Submit Feedback
              </button>

              {/* Feedback Message */}
              {feedback && <p className="feedback-message">{feedback}</p>}

              {/* Document Button */}
              <button 
                className="doc-toggle-btn"
                onClick={() => toggleDocuments(group.groupId)}
              >
                {documentVisibility[group.groupId] ? 'Hide Documents' : 'View Documents'}
              </button>

              {/* Document Links */}
              {documentVisibility[group.groupId] && (
                <div className="documents">
                  <ul>
                    {group.documents.map((doc, index) => (
                      <li key={index}>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          {doc.name} ({doc.fileType.toUpperCase()})
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default InternalDashboard;
