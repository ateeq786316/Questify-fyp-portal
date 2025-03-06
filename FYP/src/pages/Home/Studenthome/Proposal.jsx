import { useState } from "react";
import Navbar from "../../../components/Navbar.jsx";
import Sidebar from "../../../components/Sidebar.jsx";
import "../../../styles/Proposal.css"; // Import CSS file

const ProposalPage = () => {
  const [proposal, setProposal] = useState({
    title: "",
    description: "",
    teamMembers: "",
    category: "",
    file: null,
  });

  const handleChange = (e) => {
    setProposal({ ...proposal, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setProposal({ ...proposal, file: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Proposal Submitted Successfully!");
  };

  return (
    <div className="proposal-page">
      <Navbar />
      <div className="content">
        <Sidebar currentPage="/submit-proposal" />
        <div className="proposal-container">
          <h2 className="title">📜 Submit Your Project Proposal</h2>
          <form onSubmit={handleSubmit} className="proposal-form">
            <div className="input-group">
              <label>Project Title:</label>
              <input
                type="text"
                name="title"
                placeholder="Enter project title"
                value={proposal.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Project Description:</label>
              <textarea
                name="description"
                placeholder="Describe your project..."
                value={proposal.description}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div className="input-group">
              <label>Team Members (comma separated):</label>
              <input
                type="text"
                name="teamMembers"
                placeholder="e.g., Ali, Ahmed, Sara"
                value={proposal.teamMembers}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Project Category:</label>
              <select name="category" value={proposal.category} onChange={handleChange} required>
                <option value="">Select Category</option>
                <option value="AI">Artificial Intelligence</option>
                <option value="Web Dev">Web Development</option>
                <option value="IoT">Internet of Things</option>
                <option value="Cybersecurity">Cybersecurity</option>
              </select>
            </div>

            <div className="input-group">
              <label>Upload Proposal Document (PDF):</label>
              <input type="file" accept=".pdf" onChange={handleFileChange} required />
            </div>

            <button type="submit" className="submit-btn">Submit Proposal</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProposalPage;
