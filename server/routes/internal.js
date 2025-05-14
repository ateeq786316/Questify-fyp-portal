const express = require("express");
const router = express.Router();
const { verifyToken } = require("../utils/token");
const User = require("../models/User");
const Evaluation = require("../models/Evaluation");
const Document = require("../models/Document");
const Project = require("../models/Project");

// Middleware to verify internal examiner token
const internalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, msg: "No token provided" });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, msg: "Invalid token" });
    }

    const internal = await User.findOne({
      _id: decoded.id,
      role: "internal",
    });
    if (!internal) {
      return res
        .status(403)
        .json({ success: false, msg: "Not authorized as internal examiner" });
    }

    req.internal = internal;
    next();
  } catch (err) {
    console.error("Internal auth error:", err);
    res.status(401).json({ success: false, msg: "Token is not valid" });
  }
};

// Get internal examiner profile
router.get("/profile", internalAuth, async (req, res) => {
  try {
    const internal = req.internal;
    res.status(200).json({
      success: true,
      internal: {
        internalId: internal.internalId,
        name: internal.name,
        email: internal.email,
        department: internal.department,
        internalExpertise: internal.internalExpertise,
      },
    });
  } catch (err) {
    console.error("Error fetching internal profile:", err);
    res.status(500).json({
      success: false,
      msg: "Error fetching internal examiner profile",
    });
  }
});

// Get students for evaluation
router.get("/students", internalAuth, async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("name studentId projectTitle department project")
      .lean();

    // Get final reports and evaluations for each student
    const studentsWithData = await Promise.all(
      students.map(async (student) => {
        const [finalReport, evaluation] = await Promise.all([
          Document.findOne({
            uploadedBy: student._id,
            fileType: "finalReport",
          })
            .select("filePath")
            .lean(),
          Evaluation.findOne({ student: student._id }).lean(),
        ]);

        return {
          ...student,
          finalReport,
          evaluation: evaluation || {
            internalMarks: { marks: 0, feedback: "" },
          },
        };
      })
    );

    res.status(200).json({
      success: true,
      students: studentsWithData,
    });
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({
      success: false,
      msg: "Error fetching students for evaluation",
    });
  }
});

// Submit evaluation
router.post("/evaluate", internalAuth, async (req, res) => {
  try {
    const { studentId, marks, feedback } = req.body;
    const internalId = req.internal._id;

    if (!studentId || marks === undefined || !feedback) {
      return res.status(400).json({
        success: false,
        msg: "Student ID, marks, and feedback are required",
      });
    }

    // Validate marks
    if (marks < 0 || marks > 50) {
      return res.status(400).json({
        success: false,
        msg: "Marks must be between 0 and 50",
      });
    }

    // Get student details
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(400).json({
        success: false,
        msg: "Student not found",
      });
    }

    // Find or create project
    let project = await Project.findOne({ student: studentId });
    if (!project) {
      project = await Project.create({
        title: student.projectTitle || "Untitled Project",
        student: studentId,
        description: student.projectDescription || "",
      });
    }

    // Find or create evaluation
    let evaluation = await Evaluation.findOne({ student: studentId });
    if (!evaluation) {
      evaluation = new Evaluation({
        student: studentId,
        project: project._id,
      });
    }

    // Update internal marks
    evaluation.internalMarks = {
      marks,
      feedback,
      evaluatedBy: internalId,
      evaluatedAt: new Date(),
    };

    // Update status if all evaluations are complete
    if (evaluation.supervisorMarks && evaluation.externalMarks) {
      evaluation.status = "evaluated";
    }

    await evaluation.save();

    res.status(200).json({
      success: true,
      msg: "Evaluation submitted successfully",
      evaluation,
    });
  } catch (err) {
    console.error("Error submitting evaluation:", err);
    res.status(500).json({
      success: false,
      msg: "Error submitting evaluation",
    });
  }
});

module.exports = router;
