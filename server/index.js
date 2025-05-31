const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require("./routes/auth");
const supervisorRoutes = require("./routes/supervisor");
const studentRoutes = require("./routes/student");
const adminRoutes = require("./routes/admin");

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/supervisor", supervisorRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/admin", adminRoutes);
