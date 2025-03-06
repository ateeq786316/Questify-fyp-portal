const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateToken,verifyToken } = require('../utils/token');
const axios = require('axios');
require('dotenv').config();



exports.studentLogin = async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt with:", email, password);

  try {
    const user = await User.findOne({ email, role: 'student' });
    if (!user) {
      return res.status(404).json({ msg: 'Student not found' });
    }
    if (user.password !== password) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    // Generate JWT token
    const token= generateToken(user);
    // Send token and user details in response so user can login
    res.status(200).json({ token, student: user });
    console.log("Genreated token is: ",token);
  } 
  catch (err) 
  {
    console.error("Login error in controller:", err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
  
//======================================getstudent details======================================
exports.getStudentDetails = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).json({ msg: "No token provided" });

    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ msg: "Invalid token" });

    const student = await User.findById(decoded.id).select('-password');
    if (!student) return res.status(404).json({ msg: 'Student not found' });

    res.status(200).json(student);
  } 
  catch (err) {
    console.error("Error fetching student details:", err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
//====================================== chatbot======================================

exports.chatbot = async (req, res) => {
  try {
    const { message } = req.body;
    const apiKey = process.env.HUGGINGFACE_API_KEY; // Add API key in .env
    const model = "facebook/blenderbot-400M-distill"; // Example model

    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${model}`,
      { inputs: message },
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const botResponse = response.data.generated_text || "Sorry, I couldn't process that.";
    res.status(200).json({ response: botResponse });
  } catch (err) {
    console.error("Error in chatbot controller:", err);
    res.status(500).json({
      msg: "Server error in chatbotRoute",
      error: err.message,
    });
  }
};

