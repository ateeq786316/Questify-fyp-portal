const User = require('../models/User');
const Chat = require('../models/Chat');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateToken, verifyToken } = require('../utils/token');
const axios = require('axios');
const { sanitizeInput } = require('../utils/sanitizer');
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

    const student = await User.findById(decoded.id)
      .select('-password')
      .populate({
        path: 'teamMembers',
        select: 'name studentId email program cgpa'
      })
      .populate('supervisor.id', 'name department email');

    if (!student) return res.status(404).json({ msg: 'Student not found' });

    // Format the response
    const formattedStudent = {
      ...student.toObject(),
      teamMembers: student.teamMembers.map(member => ({
        name: member.name,
        studentId: member.studentId,
        email: member.email,
        program: member.program,
        cgpa: member.cgpa
      })),
      supervisor: {
        name: student.supervisor?.name || student.supervisor?.id?.name,
        department: student.supervisor?.department || student.supervisor?.id?.department,
        email: student.supervisor?.email || student.supervisor?.id?.email
      }
    };

    res.status(200).json(formattedStudent);
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
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ msg: "Authentication required" });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ msg: "Invalid token" });
    }

    // Input validation and sanitization
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ msg: "Message is required and must be a non-empty string!" });
    }

    const sanitizedMessage = sanitizeInput(message);
    if (sanitizedMessage.length > 500) {
      return res.status(400).json({ msg: "Message is too long. Maximum length is 500 characters." });
    }

    const apiKey = process.env.WRITESONIC_API_KEY;
    if (!apiKey) {
      console.error("Writesonic API key is missing!");
      return res.status(500).json({ 
        msg: "Chatbot service is not properly configured. Please contact support." 
      });
    }

    // Get or create chat history
    let chat = await Chat.findOne({ userId: decoded.id });
    if (!chat) {
      chat = new Chat({ userId: decoded.id });
    }

    // Add user message to history
    chat.messages.push({
      role: 'user',
      content: sanitizedMessage
    });

    // Prepare context from recent messages
    const recentMessages = chat.messages.slice(-5); // Get last 5 messages for context
    const contextPrompt = recentMessages
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    // Make the chat request with context
    const response = await axios.post(
      'https://api.writesonic.com/v2/business/content/chatsonic',
      {
        input_text: `Context:\n${contextPrompt}\n\nUser: ${sanitizedMessage}\n\nAssistant:`,
        enable_google_results: true,
        enable_memory: true,
        language: "en"
      },
      {
        headers: {
          "X-API-KEY": apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data || !response.data.message) {
      throw new Error("Invalid response from Chatsonic API");
    }

    // Format the response
    let formattedResponse = response.data.message
      .split('\n')
      .slice(0, 10)
      .join('\n')
      .trim();

    // Add formatting rules
    formattedResponse = formattedResponse
      .replace(/^[-•*]\s/gm, '• ')
      .replace(/\./g, '. ')
      .replace(/hello|hi|hey/i, '👋 Hello')
      .replace(/thank you|thanks/i, '🙏 Thank you')
      .replace(/sorry/i, '😔 Sorry')
      .replace(/goodbye|bye/i, '👋 Goodbye')
      .replace(/\n/g, '\n\n')
      .replace(/(^\w|\.\s+\w)/gm, letter => letter.toUpperCase());

    // Add a friendly prefix if it's a greeting
    if (sanitizedMessage.toLowerCase().includes('hello') || sanitizedMessage.toLowerCase().includes('hi')) {
      formattedResponse = '👋 ' + formattedResponse;
    }

    // Add assistant's response to chat history
    chat.messages.push({
      role: 'assistant',
      content: formattedResponse
    });

    // Update lastUpdated timestamp
    chat.lastUpdated = new Date();

    // Save chat history
    await chat.save();

    res.status(200).json({ 
      response: formattedResponse,
      context: chat.context
    });

  } catch (err) {
    console.error("Error in chatbot controller:", err.message);
    
    if (err.response) {
      // API error
      return res.status(err.response.status || 500).json({ 
        msg: "Sorry, I'm having trouble processing your request right now. Please try again later.",
        details: err.response.data
      });
    } else if (err.request) {
      // Network error
      return res.status(503).json({ 
        msg: "Sorry, the chatbot service is temporarily unavailable. Please try again later." 
      });
    } else if (err.name === 'ValidationError') {
      // Mongoose validation error
      return res.status(400).json({
        msg: "Invalid input data",
        details: Object.values(err.errors).map(e => e.message)
      });
    } else {
      // Other errors
      return res.status(500).json({ 
        msg: "An unexpected error occurred. Please try again later." 
      });
    }
  }
};

exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find admin by email and role
    const admin = await User.findOne({ 
      email: email.toLowerCase(),
      role: 'admin' 
    });

    if (!admin) {
      return res.status(404).json({ 
        success: false,
        msg: 'Admin not found. Please check your credentials.' 
      });
    }

    // Verify password
    const isMatch = admin.password
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        msg: 'Invalid credentials. Please try again.' 
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from response
    const adminData = admin.toObject();
    delete adminData.password;

    res.status(200).json({
      success: true,
      token,
      admin: adminData
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ 
      success: false,
      msg: 'Server error. Please try again later.',
      error: err.message 
    });
  }
};



