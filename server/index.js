const express = require('express');
const mongoose = require('mongoose');
const cors= require('cors');
const bodyParser= require('body-parser');
require('dotenv').config();
// Import routes
const authRoutes = require("./routes/api/authRoutes");

//importing Database connection  from db.js 
const connectDB = require('./config/db');
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());





// Routes
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});