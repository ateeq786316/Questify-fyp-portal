// services/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to add the auth token to requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("studentToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Remove all tokens
      localStorage.removeItem("studentToken");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("supervisorToken");
      localStorage.removeItem("internalToken");
      localStorage.removeItem("externalToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Document-related API calls
export const uploadDocument = async (formData) => {
  try {
    const response = await API.post("/auth/documents/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDocuments = async () => {
  try {
    const response = await API.get("/auth/documents");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addComment = async (docId, message) => {
  try {
    const response = await API.post(`/auth/documents/${docId}/comments`, {
      message,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDocument = async (docId) => {
  try {
    const response = await API.get(`/auth/documents/${docId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default API;

// const response = await axios.post("http://localhost:5000/api/auth/chatbot", { message: input });
