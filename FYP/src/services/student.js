import API from "./api";

// Fetch Student Details
export const fetchStudentDetails = async () => {
  try {
    const response = await API.get("/auth/student/details");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fetch Milestones and Feedback
export const fetchMilestonesAndFeedback = async () => {
  try {
    const response = await API.get("/student/milestones-feedback");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Submit Project Proposal
export const submitProjectProposal = async (proposalData) => {
  try {
    // Validate required fields
    if (
      !proposalData.title ||
      !proposalData.description ||
      !proposalData.category ||
      !proposalData.proposalFile
    ) {
      throw new Error("Missing required fields");
    }

    const formData = new FormData();
    formData.append("title", proposalData.title);
    formData.append("description", proposalData.description);
    formData.append("category", proposalData.category);
    if (proposalData.teamMembers) {
      formData.append("teamMembers", JSON.stringify(proposalData.teamMembers));
    }
    formData.append("proposalFile", proposalData.proposalFile);

    const response = await API.post(
      "/auth/student/project-proposal",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error in submitProjectProposal:", error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new Error(error.response.data?.msg || "Failed to submit proposal");
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error(
        "No response from server. Please check your internet connection."
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(
        error.message || "An error occurred while submitting the proposal"
      );
    }
  }
};

// Chatbot API Call
export const chatbot = async (message) => {
  try {
    const response = await API.post("/auth/student/chatbot", { message });

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
      throw new Error(
        error.response.data.msg || "Failed to get response from chatbot"
      );
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error("No response received from chatbot service");
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error("Failed to send message to chatbot");
    }
  }
};
