import React, { useState } from 'react';
import './ReviewDocument.css'; // Import the CSS file
import Navbar from '../../../components/Navbar';


const ReviewDocument = () => {
  // Hardcoded data for projects and documents
  const projects = [
    {
      id: 1,
      title: 'AI Model for Healthcare',
      members: ['Ali', 'Sarah', 'John'],
      documents: [
        { name: 'Project_Report.doc', type: 'doc', path: '../components/os theory notes.docx' },
        { name: 'Presentation.ppt', type: 'ppt', path: '/path/to/Presentation.ppt' },
        { name: 'Research_Paper.pdf', type: 'pdf', path: '/path/to/Research_Paper.pdf' },
      ],
    },
    {
      id: 2,
      title: 'E-commerce Website Development',
      members: ['Ahmed', 'Fatima', 'Zain'],
      documents: [
        { name: 'Project_Plan.doc', type: 'doc', path: '/path/to/Project_Plan.doc' },
        { name: 'Design_Slides.ppt', type: 'ppt', path: '/path/to/Design_Slides.ppt' },
        { name: 'Final_Report.pdf', type: 'pdf', path: '/path/to/Final_Report.pdf' },
      ],
    },
    {
      id: 3,
      title: 'Data Analysis Tool',
      members: ['Hassan', 'Ayesha', 'Usman'],
      documents: [
        { name: 'Analysis_Report.doc', type: 'doc', path: '/path/to/Analysis_Report.doc' },
        { name: 'Data_Slides.ppt', type: 'ppt', path: '/path/to/Data_Slides.ppt' },
        { name: 'Findings.pdf', type: 'pdf', path: '/path/to/Findings.pdf' },
      ],
    },
  ];

  // State to manage the selected project
  const [selectedProject, setSelectedProject] = useState(null);

  // State to manage the selected document
  const [selectedDocument, setSelectedDocument] = useState(null);

  // State to manage comments for each file
  const [comments, setComments] = useState({});

  // State to manage confirmation messages
  const [confirmation, setConfirmation] = useState({});

  // Function to handle project selection
  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setSelectedDocument(null); // Clear selected document when a new project is selected
    setConfirmation({}); // Clear previous confirmations
  };

  // Function to handle document selection
  const handleDocumentClick = (doc) => {
    setSelectedDocument(doc);
  };

  // Function to handle comment input change
  const handleCommentChange = (fileName, comment) => {
    setComments((prevComments) => ({
      ...prevComments,
      [fileName]: comment,
    }));
  };

  // Function to handle "Done" button click
  const handleDoneClick = (fileName) => {
    setConfirmation((prevConfirmation) => ({
      ...prevConfirmation,
      [fileName]: `Comment saved for ${fileName}`,
    }));
  };

  return (
    <div className="dashboard-container">
      <Navbar/>
      {/* Sidebar */}
      <div className="sidebar">
        <a className="active" href="#home">Dashboard</a>
        <a href="#review">Review Document</a>
        <a href="#evaluate">Evaluate</a>
        <a href="#about">About</a>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="review-document">
          <h1>Review Document Page</h1>
          <p>This is where you review documents.</p>

          {/* Projects List */}
          <div className="projects-list">
            <h2>Projects</h2>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Project Title</th>
                  <th>Group Members</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id} onClick={() => handleProjectClick(project)}>
                    <td>{project.id}</td>
                    <td>{project.title}</td>
                    <td>{project.members.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Display Uploaded Documents for Selected Project */}
          {selectedProject && (
            <div className="uploaded-documents">
              <h2>Uploaded Documents for {selectedProject.title}</h2>
              <ul>
                {selectedProject.documents.map((doc, index) => (
                  <li key={index} className="file-item">
                    <div className="file-info" onClick={() => handleDocumentClick(doc)}>
                      <span className={`file-icon ${doc.type}`}></span>
                      {doc.name}
                    </div>
                    <div className="comment-section">
                      <textarea
                        placeholder="Add your comments here..."
                        value={comments[doc.name] || ''}
                        onChange={(e) => handleCommentChange(doc.name, e.target.value)}
                      />
                      <button
                        className="done-button"
                        onClick={() => handleDoneClick(doc.name)}
                      >
                        Done
                      </button>
                      {confirmation[doc.name] && (
                        <p className="confirmation-message">{confirmation[doc.name]}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Display Selected Document */}
          {selectedDocument && (
            <div className="document-viewer">
              <h3>Viewing: {selectedDocument.name}</h3>
              {selectedDocument.type === 'pdf' ? (
                <iframe
                  src={selectedDocument.path}
                  width="100%"
                  height="500px"
                  title={selectedDocument.name}
                />
              ) : (
                <p>
                  <a href={selectedDocument.path} target="_blank" rel="noopener noreferrer">
                    Open : {selectedDocument.name} 
                  </a>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewDocument;