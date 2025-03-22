import API from "./api";  // Importing the main API instance

// Student Login API
export const studentLogin = async (formData) => {
  try {
    const response = await API.post("/auth/student/login", formData);
    return response.data; 
  } catch (error) {
    throw error;
  }
};

// Admin Login API
export const adminLogin = async (formData) => {
  try {
    const response = await API.post("/auth/admin/login", formData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

