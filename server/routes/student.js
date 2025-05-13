const express = require("express");
const router = express.Router();
const { verifyToken } = require("../utils/token");
const Milestone = require("../models/Milestone");
const User = require("../models/User");

// Middleware to verify student token
const studentAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ msg: "No token provided" });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "student") {
      return res.status(401).json({ msg: "Not authorized as student" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error("Student auth middleware error:", err);
    res.status(401).json({ msg: "Token is not valid" });
  }
};

// Get milestones and feedback for a student
router.get("/milestones-feedback", studentAuth, async (req, res) => {
  try {
    // Get all milestones
    const milestones = await Milestone.find()
      .sort({ order: 1 })
      .select("name status deadline order");

    // Get student's latest feedback
    const student = await User.findById(req.user.id).select(
      "feedbackMessage feedbackDate"
    );

    res.status(200).json({
      success: true,
      milestones,
      feedback: student.feedbackMessage || null,
    });
  } catch (error) {
    console.error("Error fetching milestones and feedback:", error);
    res.status(500).json({
      success: false,
      msg: "Error fetching progress data",
      error: error.message,
    });
  }
});

module.exports = router;
