import { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar.jsx";
import Sidebar from "../../../components/Sidebar.jsx";
import "../../../styles/Proposal.css"; // Import CSS file
import { submitProjectProposal } from "../../../services/student";
import { toast } from "react-toastify";
import axios from "axios";

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
  const [proposalStatus, setProposalStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const fetchUserAndProposal = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem('studentToken');
        
        if (!token) {
          setError("No authentication token found. Please log in.");
          return;
        }

        // First fetch user info to get groupID
        const userRes = await axios.get('http://localhost:5000/api/student/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (userRes.data.success) {
          setUserInfo(userRes.data.user);
          
          // Then fetch proposal using groupID
          const proposalRes = await axios.get('http://localhost:5000/api/student/proposal', {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (proposalRes.data.success) {
            if (proposalRes.data.proposal) {
              setExistingProposal(proposalRes.data.proposal);
              setProposalStatus(proposalRes.data.proposal.status);
            } else {
              // No proposal exists yet
              setExistingProposal(null);
              setProposalStatus(null);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        if (err.response?.status === 401) {
          setError("Your session has expired. Please log in again.");
        } else {
          setError("Failed to fetch data. Please try again later.");
        }
        setExistingProposal(null);
        setProposalStatus(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndProposal();
  }, []);

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
      // Validate required fields
      if (!proposal.title || !proposal.description || !proposal.category || !proposal.proposalFile) {
        toast.error("Please fill in all required fields and upload a proposal file");
        setIsSubmitting(false);
        return;
      }

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
        // Refetch proposal status
        const token = localStorage.getItem('studentToken');
        const res = await axios.get('http://localhost:5000/api/student/proposal', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success && res.data.proposal) {
          setExistingProposal(res.data.proposal);
          setProposalStatus(res.data.proposal.status);
        }
      } else {
        // Handle existing proposal case
        setExistingProposal(response.data);
        setProposalStatus(response.data.status);
        toast.info(response.data.message);
      }
    } catch (error) {
      console.error("Proposal submission error:", error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        toast.error(error.response.data?.msg || "Failed to submit proposal. Please try again.");
      } else if (error.request) {
        // The request was made but no response was received
        toast.error("No response from server. Please check your internet connection.");
      } else {
        // Something happened in setting up the request that triggered an Error
        toast.error("An error occurred while submitting the proposal. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status banner logic
  const statusBanner = () => {
    if (!existingProposal) return null;
    if (proposalStatus === "pending" || proposalStatus === "reviewed") {
      return (
        <div style={{ background: '#e9ecef', color: '#333', padding: '1rem', borderRadius: 8, marginBottom: 24, fontWeight: 500 }}>
          Your proposal is under review. Please wait for approval or rejection.
        </div>
      );
    }
    if (proposalStatus === "approved") {
      return (
        <div style={{ background: '#d4edda', color: '#155724', padding: '1rem', borderRadius: 8, marginBottom: 24, fontWeight: 500 }}>
          Your proposal has been approved! You can proceed to the next step.
        </div>
      );
    }
    if (proposalStatus === "rejected") {
      return (
        <div style={{ background: '#f8d7da', color: '#721c24', padding: '1rem', borderRadius: 8, marginBottom: 24, fontWeight: 500 }}>
          Your proposal was rejected. Please upload a revised proposal.
        </div>
      );
    }
    return null;
  };

  // Disable form if proposal is pending or reviewed
  const disableForm = proposalStatus === "pending" || proposalStatus === "reviewed";

  if (isLoading) {
    return (
      <div className="proposal-page">
        <Navbar />
        <div className="proposal__layout">
          <Sidebar />
          <div className="proposal__content">
            <div className="proposal-container">
              <h2 className="proposal-title">Loading...</h2>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="proposal-page">
        <Navbar />
        <div className="proposal__layout">
          <Sidebar />
          <div className="proposal__content">
            <div className="proposal-container">
              <h2 className="proposal-title">Error</h2>
              <div className="error-message" style={{ color: 'red', padding: '1rem' }}>
                {error}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (existingProposal) {
    return (
      <div className="proposal-page">
        <Navbar />
        <div className="proposal__layout">
          <Sidebar />
          <div className="proposal__content">
            <div className="proposal-container">
              <h2 className="proposal-title">📜 Your Group's Proposal</h2>
              <div className="proposal-existing">
                <div className="proposal-status">
                  <h3>Status: {existingProposal.status || 'Pending'}</h3>
                  <p>{existingProposal.message || 'Your proposal is under review'}</p>
                </div>
                <div className="proposal-details">
                  <h4>Proposal Details:</h4>
                  <p><strong>Title:</strong> {existingProposal.title || 'N/A'}</p>
                  <p><strong>Category:</strong> {existingProposal.category || 'N/A'}</p>
                  <p><strong>Submitted On:</strong> {existingProposal.createdAt ? new Date(existingProposal.createdAt).toLocaleDateString() : 'N/A'}</p>
                  <p><strong>Current Status:</strong> {existingProposal.status || 'Pending'}</p>
                  {existingProposal.teamMembers && existingProposal.teamMembers.length > 0 && (
                    <div>
                      <h4>Team Members:</h4>
                      <ul>
                        {existingProposal.teamMembers.map((member, index) => (
                          <li key={index}>{member}</li>
                        ))}
                      </ul>
                    </div>
                  )}
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
            {userInfo?.groupID && (
              <div style={{ background: '#e9ecef', padding: '1rem', borderRadius: 8, marginBottom: 24 }}>
                You are part of group {userInfo.groupID}. This proposal will be submitted on behalf of your group.
              </div>
            )}
            {statusBanner()}
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
                  disabled={disableForm}
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
                  disabled={disableForm}
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
                  disabled={disableForm}
                />
                <input
                  type="text"
                  name="teamMember2"
                  placeholder="Fa-21-BSCS-167"
                  value={proposal.teamMember2}
                  onChange={handleChange}                
                  disabled={disableForm}
                />
              </div>

              <div className="proposal-input-group">
                <label>Project Category:</label>
                <select name="category" value={proposal.category} onChange={handleChange} required disabled={disableForm}>
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
                  disabled={disableForm}
                />
              </div>

              <button 
                type="submit" 
                className="proposal-submit-btn"
                disabled={isSubmitting || disableForm}
              >
                {isSubmitting ? "Submitting..." : "Submit Proposal"}
              </button>
              {/* Inline guidance for disabled state */}
              {disableForm && (
                <div className="mt-2 text-muted">
                  You cannot submit a new proposal while your current proposal is under review.
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalPage;
