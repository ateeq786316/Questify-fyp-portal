import { useState } from "react";
import Navbar from "../../../components/Navbar.jsx";
import Sidebar from "../../../components/Sidebar.jsx";
import "../../../styles/Proposal.css"; // Import CSS file

const ProposalPage = () => {
  const [proposal, setProposal] = useState({
    title: "",
    description: "",
    teamMember1: "",
    teamMember2: "",
    category: "",
    file1: null,
    file2: null,
  });

  const handleChange = (e) => {
    setProposal({ ...proposal, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setProposal({ ...proposal, file1: e.target.files[0], file2: e.target.files[0] });
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
              <label>Team Members:</label>
              <input
                type="text"
                name="teamMember1"
                placeholder="Fa-21-BSCS-197"
                value={proposal.teamMember1}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="teamMember2"
                placeholder="Fa-21-BSCS-167"
                value={proposal.teamMember2}
                onChange={handleChange}                
              />
            </div>

            <div className="input-group">
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

            <div className="input-group">
              <label>Upload Proposal Document (PDF):</label>
              <input type="file1" accept=".pdf" onChange={handleFileChange} required />
            </div>
            <div className="input-group">
              <label>Proposal AI and plagrisum report (PDF):</label>
              <input type="file2" accept=".pdf" onChange={handleFileChange} required />
            </div>

            <button type="submit" className="submit-btn">Submit Proposal</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProposalPage;
