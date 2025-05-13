const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/adminRoutes");
const milestoneRoutes = require("./routes/milestone");
const studentRoutes = require("./routes/student");
require("dotenv").config();

// Import controllers
const {
  studentLogin,
  getStudentDetails,
  chatbot,
} = require("./controllers/auth_Controller");

// Import middleware
const { chatbotLimiter } = require("./middleware/rateLimiter");

// Import Database connection
const connectDB = require("./config/db");
connectDB();

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads", "proposals");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/milestones", milestoneRoutes);
app.use("/api/student", studentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    msg: "Something went wrong!",
    error: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  console.warn("404 Not Found:", req.method, req.originalUrl);
  res.status(404).json({
    success: false,
    msg: "Route not found",
    path: req.originalUrl,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
