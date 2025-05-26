const User = require("../models/User");
const Chat = require("../models/Chat");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateToken, verifyToken } = require("../utils/token");
const axios = require("axios");
const { sanitizeInput } = require("../utils/sanitizer");
const Milestone = require("../models/Milestone");
const Document = require("../models/Document");
const SupervisorRequest = require("../models/SupervisorRequest");
const Evaluation = require("../models/Evaluation");
require("dotenv").config();

exports.studentLogin = async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt with:", email);

  try {
    const user = await User.findOne({ email, role: "student" });
    if (!user) {
      return res.status(404).json({ msg: "Student not found" });
    }

    // Use the comparePassword method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Remove password from response
    const userData = user.toObject();
    delete userData.password;

    // Send token and user details in response
    res.status(200).json({
      success: true,
      token,
      student: userData,
    });
  } catch (err) {
    console.error("Login error in controller:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

//======================================getstudent details======================================
exports.getStudentDetails = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) return res.status(401).json({ msg: "No token provided" });

    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ msg: "Invalid token" });

    // Get student details
    const student = await User.findById(decoded.id)
      .select("-password")
      .populate({
        path: "teamMembers",
        select: "name studentId email department cgpa program",
      })
      .populate({
        path: "supervisor.id",
        select:
          "name department email supervisorId supervisorExpertise contact",
      })
      .lean();

    if (!student) return res.status(404).json({ msg: "Student not found" });

    // Get student's evaluation
    let evaluation = null;
    try {
      evaluation = await Evaluation.findOne({ student: student._id })
        .populate("project", "title description")
        .lean();
    } catch (err) {
      console.error("Error fetching evaluation:", err);
    }

    // Get milestones
    const milestones = await Milestone.find().sort({ deadline: 1 }).lean();

    // Find the next upcoming milestone
    const now = new Date();
    const upcomingMilestone = milestones.find(
      (milestone) => milestone.deadline && new Date(milestone.deadline) > now
    );

    // Format the response with proper data validation
    const formattedStudent = {
      ...student,
      studentInfo: {
        name: student.name || "Not Available",
        studentId: student.studentId || "Not Available",
        program: student.program || "Not Available",
        cgpa: student.cgpa || "Not Available",
        department: student.department || "Not Available",
        contact: student.contact || "Not Available",
      },
      projectInfo: {
        title: student.projectTitle || "Not Assigned",
        description: student.projectDescription || "Not Available",
        category: student.projectCategory || "Not Assigned",
        status: student.projectStatus || "Pending",
        proposalStatus: student.proposalStatus || "Pending",
        proposalFile: student.proposalFile || null,
        plagiarismReport: student.plagiarismReport || null,
        submissionDate: student.submissionDate
          ? new Date(student.submissionDate).toISOString()
          : null,
      },
      evaluation: evaluation
        ? {
            supervisorMarks: evaluation.supervisorMarks || null,
            internalMarks: evaluation.internalMarks || null,
            externalMarks: evaluation.externalMarks || null,
            status: evaluation.status || "pending",
            evaluatedAt: evaluation.evaluatedAt || null,
            updatedAt: evaluation.updatedAt || null,
          }
        : null,
      teamMembers:
        student.teamMembers?.map((member) => ({
          name: member.name || "Not Available",
          studentId: member.studentId || "Not Available",
          email: member.email || "Not Available",
          department: member.department || "Not Available",
          program: member.program || "Not Available",
          cgpa: member.cgpa || "Not Available",
        })) || [],
      supervisor: {
        name:
          student.supervisor?.name ||
          student.supervisor?.id?.name ||
          "Not Assigned",
        department:
          student.supervisor?.department ||
          student.supervisor?.id?.department ||
          "Not Available",
        email:
          student.supervisor?.email ||
          student.supervisor?.id?.email ||
          "Not Available",
        supervisorId: student.supervisor?.id?.supervisorId || "Not Available",
        expertise:
          student.supervisor?.id?.supervisorExpertise || "Not Available",
        contact: student.supervisor?.id?.contact || "Not Available",
      },
      dates: {
        startDate: student.startDate
          ? new Date(student.startDate).toISOString()
          : null,
        endDate: student.endDate
          ? new Date(student.endDate).toISOString()
          : null,
        createdAt: student.createdAt
          ? new Date(student.createdAt).toISOString()
          : null,
        updatedAt: student.updatedAt
          ? new Date(student.updatedAt).toISOString()
          : null,
      },
      groupID: student.groupID || "Not Assigned",
      upcomingMilestone: upcomingMilestone
        ? {
            name: upcomingMilestone.name,
            deadline: upcomingMilestone.deadline,
            order: upcomingMilestone.order,
          }
        : null,
    };

    res.status(200).json(formattedStudent);
  } catch (err) {
    console.error("Error fetching student details:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
//====================================== chatbot======================================

exports.chatbot = async (req, res) => {
  try {
    const { message } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ msg: "Authentication required" });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ msg: "Invalid token" });
    }

    // Input validation and sanitization
    if (
      !message ||
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      return res
        .status(400)
        .json({ msg: "Message is required and must be a non-empty string!" });
    }

    const sanitizedMessage = sanitizeInput(message);
    if (sanitizedMessage.length > 500) {
      return res.status(400).json({
        msg: "Message is too long. Maximum length is 500 characters.",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Gemini API key is missing!");
      return res.status(500).json({
        msg: "Chatbot service is not properly configured. Please contact support.",
      });
    }

    // Get or create chat history
    let chat = await Chat.findOne({ userId: decoded.id });
    if (!chat) {
      chat = new Chat({ userId: decoded.id });
    }

    // Add user message to history
    chat.messages.push({
      role: "user",
      content: sanitizedMessage,
    });

    // Prepare context from recent messages
    const recentMessages = chat.messages.slice(-5); // Get last 5 messages for context
    const contextPrompt = recentMessages
      .map(
        (msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
      )
      .join("\n");

    // Make the chat request with context
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
      {
        contents: [
          {
            parts: [
              {
                text: `Context:\n${contextPrompt}\n\nUser: ${sanitizedMessage}\n\nAssistant:`,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
      }
    );

    if (
      !response.data ||
      !response.data.candidates?.[0]?.content?.parts?.[0]?.text
    ) {
      throw new Error("Invalid response from Gemini API");
    }

    // Format the response
    let formattedResponse = response.data.candidates[0].content.parts[0].text
      .split("\n")
      .slice(0, 10)
      .join("\n")
      .trim();

    // Add formatting rules
    formattedResponse = formattedResponse
      .replace(/^[-•*]\s/gm, "• ")
      .replace(/\./g, ". ")
      .replace(/hello|hi|hey/i, "👋 Hello")
      .replace(/thank you|thanks/i, "🙏 Thank you")
      .replace(/sorry/i, "😔 Sorry")
      .replace(/goodbye|bye/i, "👋 Goodbye")
      .replace(/\n/g, "\n\n")
      .replace(/(^\w|\.\s+\w)/gm, (letter) => letter.toUpperCase());

    // Add a friendly prefix if it's a greeting
    if (
      sanitizedMessage.toLowerCase().includes("hello") ||
      sanitizedMessage.toLowerCase().includes("hi")
    ) {
      formattedResponse = "👋 " + formattedResponse;
    }

    // Add assistant's response to chat history
    chat.messages.push({
      role: "assistant",
      content: formattedResponse,
    });

    // Update lastUpdated timestamp
    chat.lastUpdated = new Date();

    // Save chat history
    await chat.save();

    res.status(200).json({
      response: formattedResponse,
      context: chat.context,
    });
  } catch (err) {
    console.error("Error in chatbot controller:", err.message);

    if (err.response) {
      // API error
      return res.status(err.response.status || 500).json({
        msg: "Sorry, I'm having trouble processing your request right now. Please try again later.",
        details: err.response.data,
      });
    } else if (err.request) {
      // Network error
      return res.status(503).json({
        msg: "Sorry, the chatbot service is temporarily unavailable. Please try again later.",
      });
    } else if (err.name === "ValidationError") {
      // Mongoose validation error
      return res.status(400).json({
        msg: "Invalid input data",
        details: Object.values(err.errors).map((e) => e.message),
      });
    } else {
      // Other errors
      return res.status(500).json({
        msg: "An unexpected error occurred. Please try again later.",
      });
    }
  }
};

// Admin login
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;
  console.log("Admin login attempt with:", email);

  try {
    const admin = await User.findOne({ email, role: "admin" });
    if (!admin) {
      return res.status(404).json({ msg: "Admin not found" });
    }

    // Use the comparePassword method
    const isMatch = admin.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Generate JWT token
    const token = generateToken(admin);

    // Remove password from response
    const adminData = admin.toObject();
    delete adminData.password;

    // Send token and admin details in response
    res.status(200).json({
      success: true,
      token,
      admin: adminData,
    });
    console.log("Generated admin token:", token);
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Submit Project Proposal
exports.submitProjectProposal = async (req, res) => {
  try {
    const { title, description, category, teamMembers } = req.body;
    const studentId = req.user.id;

    // Check if student already has a proposal
    const existingProposal = await Document.findOne({
      uploadedBy: studentId,
      fileType: "proposal",
    });

    if (existingProposal) {
      // Get the status of the existing proposal
      const student = await User.findById(studentId);
      return res.status(200).json({
        success: false,
        msg: "You have already submitted a proposal",
        data: {
          status: student.proposalStatus,
          message: `Your proposal is currently ${student.proposalStatus.toLowerCase()}. Please wait for feedback from your supervisor.`,
          existingProposal: {
            title: existingProposal.title,
            category: existingProposal.category,
            submittedAt: existingProposal.createdAt,
            status: existingProposal.status,
          },
        },
      });
    }

    // Create new document record
    const document = new Document({
      fileType: "proposal",
      filePath: req.file.path,
      uploadedBy: studentId,
      title: title,
      description: description,
      category: category,
      teamMembers: teamMembers ? JSON.parse(teamMembers) : [],
    });

    await document.save();

    // Update student's proposal status
    await User.findByIdAndUpdate(studentId, {
      proposalStatus: "Submitted",
      projectTitle: title,
      projectDescription: description,
      projectCategory: category,
    });

    res.status(200).json({
      success: true,
      msg: "Proposal submitted successfully",
      data: document,
    });
  } catch (error) {
    console.error("Error submitting proposal:", error);
    res.status(500).json({
      success: false,
      msg: "Error submitting proposal",
      error: error.message,
    });
  }
};

// Get all supervisors
exports.getAllSupervisors = async (req, res) => {
  try {
    const supervisors = await User.find({ role: "supervisor" })
      .select("name department supervisorExpertise email")
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      supervisors,
    });
  } catch (err) {
    console.error("Error fetching supervisors:", err);
    res.status(500).json({
      success: false,
      msg: "Error fetching supervisors",
    });
  }
};

// Create supervisor request
exports.createSupervisorRequest = async (req, res) => {
  try {
    const { supervisorId } = req.body;
    const studentId = req.user.id;

    // Get student details to get project information
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        msg: "Student not found",
      });
    }

    // Check if student already has a pending request
    const existingRequest = await SupervisorRequest.findOne({
      studentId,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        msg: "You already have a pending supervisor request",
      });
    }

    // Create new request with project details
    const request = new SupervisorRequest({
      studentId,
      supervisorId,
      projectTitle: student.projectTitle || "Not specified",
      projectDescription: student.projectDescription || "Not specified",
    });

    await request.save();

    res.status(201).json({
      success: true,
      msg: "Supervisor request submitted successfully",
      request,
    });
  } catch (err) {
    console.error("Error creating supervisor request:", err);
    res.status(500).json({
      success: false,
      msg: "Error creating supervisor request",
    });
  }
};

// Get student's supervisor requests
exports.getStudentRequests = async (req, res) => {
  try {
    const studentId = req.user.id;

    const requests = await SupervisorRequest.find({ studentId })
      .populate("supervisorId", "name department supervisorExpertise")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      requests,
    });
  } catch (err) {
    console.error("Error fetching student requests:", err);
    res.status(500).json({
      success: false,
      msg: "Error fetching supervisor requests",
    });
  }
};

// Supervisor login
exports.supervisorLogin = async (req, res) => {
  const { email, password } = req.body;
  console.log("Supervisor login attempt with:", email);

  try {
    const supervisor = await User.findOne({ email, role: "supervisor" });
    if (!supervisor) {
      return res
        .status(404)
        .json({ success: false, msg: "Supervisor not found" });
    }

    // Use the comparePassword method
    const isMatch = supervisor.comparePassword(password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid credentials" });
    }

    // Generate JWT token
    const token = generateToken(supervisor);

    // Remove password from response
    const supervisorData = supervisor.toObject();
    delete supervisorData.password;

    // Send token and supervisor details in response
    res.status(200).json({
      success: true,
      token,
      supervisor: supervisorData,
    });
    console.log("Generated supervisor token:", token);
  } catch (err) {
    console.error("Supervisor login error:", err);
    res
      .status(500)
      .json({ success: false, msg: "Server error", error: err.message });
  }
};

// Internal login
exports.internalLogin = async (req, res) => {
  const { email, password } = req.body;
  console.log("\n=== Internal Examiner Login Attempt ===");
  console.log("Email:", email);

  try {
    // First try to find by role
    let internal = await User.findOne({ email, role: "internal" });

    // If not found by role, try to find by type
    if (!internal) {
      internal = await User.findOne({ email, type: "Internal" });
      if (internal) {
        // Update the user's role to "internal"
        internal.role = "internal";
        await internal.save();
        console.log("Updated user role to internal");
      }
    }

    if (!internal) {
      console.log("Internal examiner not found");
      return res.status(404).json({ msg: "Internal examiner not found" });
    }

    // Use the comparePassword method
    const isMatch = await internal.comparePassword(password);
    if (!isMatch) {
      console.log("Invalid credentials for internal examiner:", internal.name);
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = generateToken(internal);
    console.log("Internal examiner logged in successfully:");
    console.log("Name:", internal.name);
    console.log("Token:", token);

    const internalData = internal.toObject();
    delete internalData.password;

    res.status(200).json({
      success: true,
      token,
      internal: internalData,
    });
  } catch (err) {
    console.error("Internal examiner login error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// External login
exports.externalLogin = async (req, res) => {
  const { email, password } = req.body;
  console.log("\n=== External Examiner Login Attempt ===");
  console.log("Email:", email);

  try {
    const external = await User.findOne({ email, role: "external" });
    if (!external) {
      console.log("External examiner not found");
      return res.status(404).json({ msg: "External examiner not found" });
    }

    // Use the comparePassword method
    const isMatch = await external.comparePassword(password);
    if (!isMatch) {
      console.log("Invalid credentials for external examiner:", external.name);
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = generateToken(external);
    console.log("External examiner logged in successfully:");
    console.log("Name:", external.name);
    console.log("Token:", token);

    const externalData = external.toObject();
    delete externalData.password;

    res.status(200).json({
      success: true,
      token,
      external: externalData,
    });
  } catch (err) {
    console.error("External examiner login error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
