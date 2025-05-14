const express = require("express");
const router = express.Router();
const { verifyToken } = require("../utils/token");
const User = require("../models/User");
const Evaluation = require("../models/Evaluation");
const Project = require("../models/Project");

// Middleware to verify external examiner token
const externalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, msg: "No token provided" });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, msg: "Invalid token" });
    }

    const external = await User.findOne({
      _id: decoded.id,
      role: "external",
    });
    if (!external) {
      return res
        .status(403)
        .json({ success: false, msg: "Not authorized as external examiner" });
    }

    req.external = external;
    next();
  } catch (err) {
    console.error("External auth error:", err);
    res.status(401).json({ success: false, msg: "Token is not valid" });
  }
};

// Get external examiner dashboard data
router.get("/dashboard", externalAuth, async (req, res) => {
  try {
    const external = req.external;

    // Get all students with their project details
    const students = await User.find({ role: "student" })
      .select("studentId name department projectTitle projectStatus")
      .lean();

    // Get evaluations for these students
    const evaluations = await Evaluation.find({
      externalExaminer: external._id,
    }).lean();

    // Create a map of student evaluations for quick lookup
    const evaluationMap = evaluations.reduce((map, eval) => {
      map[eval.student.toString()] = eval;
      return map;
    }, {});

    // Combine student data with their evaluations
    const assignedStudents = students.map((student) => ({
      _id: student._id,
      name: student.name,
      studentId: student.studentId,
      department: student.department,
      projectTitle: student.projectTitle || "Not Assigned",
      projectStatus: student.projectStatus || "Pending",
      evaluation: evaluationMap[student._id.toString()] || null,
    }));

    res.status(200).json({
      success: true,
      external: {
        externalId: external.externalId,
        name: external.name,
        externalOrganization: external.externalOrganization,
        externalPosition: external.externalPosition,
        externalExpertise: external.externalExpertise,
      },
      assignedStudents,
    });
  } catch (err) {
    console.error("Error fetching external dashboard:", err);
    res.status(500).json({
      success: false,
      msg: "Error fetching external dashboard data",
      error: err.message,
    });
  }
});

// Get students for evaluation
router.get("/students", externalAuth, async (req, res) => {
  try {
    // Get all students with their project details
    const students = await User.find({ role: "student" })
      .select("studentId name department projectTitle projectStatus")
      .lean();

    // Get evaluations for these students
    const evaluations = await Evaluation.find({
      externalExaminer: req.external._id,
    }).lean();

    // Create a map of student evaluations for quick lookup
    const evaluationMap = evaluations.reduce((map, eval) => {
      map[eval.student.toString()] = eval;
      return map;
    }, {});

    // Combine student data with their evaluations
    const studentsWithEvaluations = students.map((student) => ({
      _id: student._id,
      name: student.name,
      studentId: student.studentId,
      department: student.department,
      projectTitle: student.projectTitle || "Not Assigned",
      projectStatus: student.projectStatus || "Pending",
      evaluation: evaluationMap[student._id.toString()] || null,
    }));

    res.status(200).json({
      success: true,
      students: studentsWithEvaluations,
    });
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({
      success: false,
      msg: "Error fetching students",
      error: err.message,
    });
  }
});

// Submit evaluation
router.post("/evaluate", externalAuth, async (req, res) => {
  try {
    const { studentId, marks, feedback } = req.body;
    console.log("\n=== Starting External Evaluation Submission ===");
    console.log("Request Body:", { studentId, marks, feedback });
    console.log("External Examiner ID:", req.external._id);

    if (!studentId || marks === undefined || !feedback) {
      console.log("Validation failed: Missing required fields");
      return res.status(400).json({
        success: false,
        msg: "Student ID, marks, and feedback are required",
      });
    }

    if (marks < 0 || marks > 100) {
      console.log("Validation failed: Marks out of range");
      return res.status(400).json({
        success: false,
        msg: "Marks must be between 0 and 100",
      });
    }

    // Get student details
    const student = await User.findById(studentId);
    if (!student) {
      console.log("Error: Student not found");
      return res.status(404).json({
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

    // Find existing evaluation for this student
    let evaluation = await Evaluation.findOne({ student: studentId });
    console.log(
      "\nExisting Evaluation:",
      evaluation
        ? {
            id: evaluation._id,
            student: evaluation.student,
            project: evaluation.project,
            status: evaluation.status,
            supervisorMarks: evaluation.supervisorMarks,
            internalMarks: evaluation.internalMarks,
            externalMarks: evaluation.externalMarks,
          }
        : "No existing evaluation found"
    );

    if (!evaluation) {
      // Create new evaluation if none exists
      evaluation = new Evaluation({
        student: studentId,
        project: project._id,
        externalExaminer: req.external._id,
        status: "pending",
      });
      await evaluation.save();
      console.log("Created new evaluation object");
    }

    // Update evaluation with external marks
    console.log("\nUpdating evaluation with external marks:", {
      marks,
      feedback,
      evaluatedAt: new Date(),
    });

    const updatedEvaluation = await Evaluation.findByIdAndUpdate(
      evaluation._id,
      {
        $set: {
          "externalMarks.marks": marks,
          "externalMarks.feedback": feedback,
          "externalMarks.evaluatedAt": new Date(),
          externalExaminer: req.external._id,
          status: "evaluated",
        },
      },
      { new: true }
    );

    console.log("\nUpdated Evaluation:", {
      id: updatedEvaluation._id,
      student: updatedEvaluation.student,
      project: updatedEvaluation.project,
      status: updatedEvaluation.status,
      supervisorMarks: updatedEvaluation.supervisorMarks,
      internalMarks: updatedEvaluation.internalMarks,
      externalMarks: updatedEvaluation.externalMarks,
    });

    console.log(
      "\n=== External Evaluation Submission Completed Successfully ===\n"
    );

    res.status(200).json({
      success: true,
      msg: "External evaluation submitted successfully",
      evaluation: updatedEvaluation,
    });
  } catch (err) {
    console.error("\n=== Error in External Evaluation Submission ===");
    console.error("Error details:", err);
    console.error("Stack trace:", err.stack);
    res.status(500).json({
      success: false,
      msg: "Error submitting external evaluation",
      error: err.message,
    });
  }
});

module.exports = router;
