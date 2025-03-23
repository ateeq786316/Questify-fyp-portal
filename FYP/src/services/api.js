// services/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically add token (if available)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("studentToken"); // Updated to use studentToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle token expiration
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem("studentToken");
      window.location.href = "/studentlogin";
    }
    return Promise.reject(error);
  }
);

export default API;


// const response = await axios.post("http://localhost:5000/api/auth/chatbot", { message: input });