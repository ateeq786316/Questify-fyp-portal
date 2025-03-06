import API from "./api";

// Fetch Student Details
export const fetchStudentDetails = async () => {
  try 
  {
    //http://localhost:5000//student/details
    const response = await API.get("/student/details");
    return response.data;
  } 
  catch (error) 
  {
    throw error;
  }
};

// Submit Project Proposal
export const submitProjectProposal = async (proposalData) => {
  try {
    const response = await API.post("/student/project-proposal", proposalData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Chatbot API Call  ✅ ADD THIS FUNCTION
export const chatbot = async (message) => {
  try {
    const response = await API.post("/chatbot", { message });
    return response.data.response;
  } catch (error) {
    throw error;
  }
};