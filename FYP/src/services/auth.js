import API from "./api";

export const login = async (credentials) => {
  try {
    const response = await API.post("/auth/student/login", credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const adminLogin = async (credentials) => {
  try {
    const response = await API.post("/auth/admin/login", credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getStudentDetails = async () => {
  try {
    const response = await API.get("/auth/student/details");
    return response.data;
  } catch (error) {
    throw error;
  }
};
