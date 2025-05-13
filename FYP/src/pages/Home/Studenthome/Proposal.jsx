import { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar.jsx";
import Sidebar from "../../../components/Sidebar.jsx";
import "../../../styles/Proposal.css"; // Import CSS file
import { submitProjectProposal } from "../../../services/student";
import { toast } from "react-toastify";

const ProposalPage = () => {
  const [proposal, setProposal] = useState({
    title: "",
    description: "",
    teamMember1: "",
    teamMember2: "",
    category: "",
    proposalFile: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingProposal, setExistingProposal] = useState(null);

  const handleChange = (e) => {
    setProposal({ ...proposal, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setProposal({ ...proposal, proposalFile: file });
    } else {
      toast.error("Please upload a PDF file");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const teamMembers = [];
      if (proposal.teamMember1) teamMembers.push(proposal.teamMember1);
      if (proposal.teamMember2) teamMembers.push(proposal.teamMember2);

      const proposalData = {
        ...proposal,
        teamMembers,
      };

      const response = await submitProjectProposal(proposalData);
      
      if (response.success) {
        toast.success("Proposal submitted successfully!");
        // Reset form
        setProposal({
          title: "",
          description: "",
          teamMember1: "",
          teamMember2: "",
          category: "",
          proposalFile: null,
        });
      } else {
        // Handle existing proposal case
        setExistingProposal(response.data);
        toast.info(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to submit proposal");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (existingProposal) {
    return (
      <div className="proposal-page">
        <Navbar />
        <div className="proposal__layout">
          <Sidebar />
          <div className="proposal__content">
            <div className="proposal-container">
              <h2 className="proposal-title">📜 Your Existing Proposal</h2>
              <div className="proposal-existing">
                <div className="proposal-status">
                  <h3>Status: {existingProposal.status}</h3>
                  <p>{existingProposal.message}</p>
                </div>
                <div className="proposal-details">
                  <h4>Proposal Details:</h4>
                  <p><strong>Title:</strong> {existingProposal.existingProposal.title}</p>
                  <p><strong>Category:</strong> {existingProposal.existingProposal.category}</p>
                  <p><strong>Submitted On:</strong> {new Date(existingProposal.existingProposal.submittedAt).toLocaleDateString()}</p>
                  <p><strong>Current Status:</strong> {existingProposal.existingProposal.status}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="proposal-page">
      <Navbar />
      <div className="proposal__layout">
        <Sidebar />
        <div className="proposal__content">
          <div className="proposal-container">
            <h2 className="proposal-title">📜 Submit Your Project Proposal</h2>
            <form onSubmit={handleSubmit} className="proposal-form">
              <div className="proposal-input-group">
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

              <div className="proposal-input-group">
                <label>Project Description:</label>
                <textarea
                  name="description"
                  placeholder="Describe your project..."
                  value={proposal.description}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <div className="proposal-input-group">
                <label>Team Members:</label>
                <input
                  type="text"
                  name="teamMember1"
                  placeholder="Fa-21-BSCS-197"
                  value={proposal.teamMember1}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="teamMember2"
                  placeholder="Fa-21-BSCS-167"
                  value={proposal.teamMember2}
                  onChange={handleChange}                
                />
              </div>

              <div className="proposal-input-group">
                <label>Project Category:</label>
                <select name="category" value={proposal.category} onChange={handleChange} required>
                  <option value="">Select Category</option>
                  <option value="AI">Artificial Intelligence</option>
                  <option value="Machine Learning">Machine Learning</option>
                  <option value="Deep Learning">Deep Learning</option>
                  <option value="Natural Language Processing">Natural Language Processing</option>
                  <option value="Computer Vision">Computer Vision</option>
                  <option value="Web Development">Web Development</option>            
                  <option value="Full Stack Development">Full Stack Development</option>
                  <option value="Mobile App Development">Mobile App Development</option>
                  <option value="Game Development">Game Development</option>
                  <option value="IoT">Internet of Things</option>
                  <option value="Embedded Systems">Embedded Systems</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Network Security">Network Security</option>
                  <option value="Data Security">Data Security</option>
                  <option value="Cloud Computing">Cloud Computing</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Data Analysis">Data Analysis</option>
                  <option value="Data Visualization">Data Visualization</option>
                  <option value="Blockchain">Blockchain</option>
                  <option value="Cryptocurrency">Cryptocurrency</option>
                  <option value="Virtual Reality">Virtual Reality (VR)</option>
                  <option value="Augmented Reality">Augmented Reality (AR)</option>                            
                </select>
              </div>

              <div className="proposal-input-group">
                <label>Upload Proposal Document (PDF):</label>
                <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={handleFileChange} 
                  required 
                />
              </div>

              <button 
                type="submit" 
                className="proposal-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Proposal"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalPage;
