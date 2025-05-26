const express = require("express");
const router = express.Router();
const { verifyToken } = require("../utils/token");
const Milestone = require("../models/Milestone");
const User = require("../models/User");
const GroupRequest = require("../models/GroupRequest");
const Document = require("../models/Document");

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

    // Check if sender is already in a group
    const sender = await User.findById(req.user.id);
    if (sender.groupID) {
      return res.status(400).json({ msg: "You are already in a group" });
    }

    // Find target student
    const toUser = await User.findOne({ email: toEmail, role: "student" });
    if (!toUser) return res.status(404).json({ msg: "Student not found" });

    // Check if target student is already in a group
    if (toUser.groupID) {
      return res
        .status(400)
        .json({ msg: "This student is already in a group" });
    }

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

    // Assign groupID logic
    const toUser = await User.findById(req.user.id);
    const fromUser = await User.findById(request.from);
    let groupID = toUser.groupID || fromUser.groupID;
    if (!groupID) {
      // Generate a new groupID (e.g., use timestamp + random)
      groupID = `G${Date.now()}${Math.floor(Math.random() * 1000)}`;
    }
    // Assign groupID to both if not already set or if only one has it
    if (!toUser.groupID) {
      toUser.groupID = groupID;
      await toUser.save();
    }
    if (!fromUser.groupID) {
      fromUser.groupID = groupID;
      await fromUser.save();
    }
    // If both have different groupIDs, do not merge (could add logic to merge groups if needed)

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

// Get current student info
router.get("/me", studentAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email groupID");
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ msg: "Error fetching user info" });
  }
});

// Get current student's proposal
router.get("/proposal", studentAuth, async (req, res) => {
  try {
    // First get the student's info to check groupID
    const student = await User.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ success: false, msg: "Student not found" });
    }

    // If student has a groupID, search for proposal by groupID
    if (student.groupID) {
      const proposal = await Document.findOne({
        fileType: "proposal",
        $or: [
          { uploadedBy: req.user.id },
          { teamMembers: { $in: student.teamMembers } },
        ],
      });

      if (proposal) {
        return res.json({ success: true, proposal });
      }
    } else {
      // If no groupID, just search by student ID
      const proposal = await Document.findOne({
        uploadedBy: req.user.id,
        fileType: "proposal",
      });

      if (proposal) {
        return res.json({ success: true, proposal });
      }
    }

    // No proposal found - this is not an error, just means no proposal exists yet
    return res.json({
      success: true,
      proposal: null,
      message: "No proposal found. You can submit a new proposal.",
    });
  } catch (err) {
    console.error("Error fetching proposal:", err);
    res.status(500).json({
      success: false,
      msg: "Error fetching proposal",
      error: err.message,
    });
  }
});

// Get student's assigned supervisor
router.get("/supervisors", studentAuth, async (req, res) => {
  try {
    const student = await User.findById(req.user.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        msg: "Student not found",
      });
    }

    // If student has an assigned supervisor
    if (student.supervisor?.id) {
      const supervisor = await User.findById(student.supervisor.id);
      if (supervisor) {
        return res.json({
          success: true,
          supervisors: [
            {
              _id: supervisor._id,
              name: supervisor.name,
              email: supervisor.email,
              department: supervisor.department,
            },
          ],
        });
      }
    }

    // If no supervisor is assigned, return empty array
    res.json({
      success: true,
      supervisors: [],
    });
  } catch (err) {
    console.error("Error fetching supervisor:", err);
    res.status(500).json({
      success: false,
      msg: "Error fetching supervisor",
      error: err.message,
    });
  }
});

module.exports = router;
