import API from "./api";

export const login = async (credentials) => {
  try {
    const response = await API.post("/api/auth/student/login", credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};
