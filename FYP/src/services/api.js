// services/api.js
import axios from "axios";
const API = axios.create({baseURL: "http://localhost:5000/",headers: {"Content-Type": "application/json",},});
// Automatically add token (if available)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // Token from local storage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;


// const response = await axios.post("http://localhost:5000/api/auth/chatbot", { message: input });