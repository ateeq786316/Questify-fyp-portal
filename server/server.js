const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/adminRoutes");
const milestoneRoutes = require("./routes/milestone");
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

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", milestoneRoutes);

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
