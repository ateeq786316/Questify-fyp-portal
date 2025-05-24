const express = require("express");
const router = express.Router();
const { verifyToken } = require("../utils/token");
const Milestone = require("../models/Milestone");
const User = require("../models/User");
const GroupRequest = require("../models/GroupRequest");

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

// Send a group request
router.post("/group-request", studentAuth, async (req, res) => {
  try {
    const { toEmail } = req.body;
    if (!toEmail)
      return res.status(400).json({ msg: "Recipient email required" });
    const toUser = await User.findOne({ email: toEmail, role: "student" });
    if (!toUser) return res.status(404).json({ msg: "Student not found" });
    if (toUser._id.equals(req.user.id))
      return res.status(400).json({ msg: "Cannot send request to yourself" });
    // Check for existing pending request
    const existing = await GroupRequest.findOne({
      from: req.user.id,
      to: toUser._id,
      status: "pending",
    });
    if (existing)
      return res.status(400).json({ msg: "Request already sent and pending" });
    await GroupRequest.create({ from: req.user.id, to: toUser._id });
    res.json({ success: true, msg: "Group request sent" });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Server error sending request", error: err.message });
  }
});

// List incoming group requests
router.get("/group-requests", studentAuth, async (req, res) => {
  try {
    const requests = await GroupRequest.find({
      to: req.user.id,
      status: "pending",
    }).populate("from", "name email department");
    res.json({
      success: true,
      requests: requests.map((r) => ({
        _id: r._id,
        fromName: r.from.name,
        fromEmail: r.from.email,
        fromDepartment: r.from.department,
      })),
    });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Server error fetching requests", error: err.message });
  }
});

// Approve a group request
router.post("/group-request/:id/approve", studentAuth, async (req, res) => {
  try {
    const request = await GroupRequest.findOne({
      _id: req.params.id,
      to: req.user.id,
      status: "pending",
    });
    if (!request) return res.status(404).json({ msg: "Request not found" });
    // Add each other as team members
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { teamMembers: request.from },
    });
    await User.findByIdAndUpdate(request.from, {
      $addToSet: { teamMembers: req.user.id },
    });
    request.status = "approved";
    await request.save();
    res.json({ success: true, msg: "Request approved" });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Server error approving request", error: err.message });
  }
});

// Reject a group request
router.post("/group-request/:id/reject", studentAuth, async (req, res) => {
  try {
    const request = await GroupRequest.findOne({
      _id: req.params.id,
      to: req.user.id,
      status: "pending",
    });
    if (!request) return res.status(404).json({ msg: "Request not found" });
    request.status = "rejected";
    await request.save();
    res.json({ success: true, msg: "Request rejected" });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Server error rejecting request", error: err.message });
  }
});

// Search for a student by email
router.get("/search-student", studentAuth, async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ msg: "Email required" });
    const student = await User.findOne({ email, role: "student" }).select(
      "name email department"
    );
    if (!student) return res.status(404).json({ msg: "Student not found" });
    res.json({ success: true, student });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Server error searching student", error: err.message });
  }
});

module.exports = router;
