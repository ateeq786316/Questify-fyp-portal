const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Import controllers
const { studentLogin, getStudentDetails, chatbot } = require("./controllers/auth_Controller");

// Import middleware
const { chatbotLimiter } = require('./middleware/rateLimiter');

// Import Database connection
const connectDB = require('./config/db');
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Routes
app.post("/api/auth/student/login", studentLogin);
app.get("/api/auth/student/details", getStudentDetails);
app.post("/api/auth/student/chatbot", chatbotLimiter, chatbot);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});