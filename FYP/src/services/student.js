import API from "./api";

// Fetch Student Details
export const fetchStudentDetails = async () => {
  try 
  {
    const response = await API.get("/api/auth/student/details");
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
    const response = await API.post("/api/auth/student/project-proposal", proposalData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Chatbot API Call
export const chatbot = async (message) => {
  try {
    const response = await API.post("/api/auth/student/chatbot", { message });
    
    // Check if we got a valid response
    if (!response.data || !response.data.response) {
      throw new Error("Invalid response from chatbot");
    }
    
    return response.data.response;
  } catch (error) {
    // Handle specific error cases
    if (error.response?.status === 401) {
      throw new Error("Please log in to continue");
    } else if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new Error(error.response.data.msg || "Failed to get response from chatbot");
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error("No response received from chatbot service");
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error("Failed to send message to chatbot");
    }
  }
};