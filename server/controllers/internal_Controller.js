const User = require("../models/User");
const Evaluation = require("../models/Evaluation");
const Document = require("../models/Document");

// Get internal examiner profile
exports.getProfile = async (req, res) => {
  try {
    const internal = await User.findById(req.internalId).select("-password");
    if (!internal)
      return res.status(404).json({ msg: "Internal examiner not found" });
    res.json({ internal });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Get all students for evaluation (example: all students, or filter as needed)
exports.getStudents = async (req, res) => {
  try {
    // You can filter students as needed, e.g., by department
    const students = await User.find({ role: "student" })
      .select("_id name studentId projectTitle department evaluation")
      .lean();
    // Optionally, populate evaluation
    for (let student of students) {
      student.evaluation = await Evaluation.findOne({
        student: student._id,
      }).lean();
      student.finalReport = await Document.findOne({
        uploadedBy: student._id,
        fileType: "finalReport",
      }).lean();
    }
    res.json({ students });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Submit evaluation for a student
exports.evaluateStudent = async (req, res) => {
  try {
    const { studentId, marks, feedback } = req.body;
    if (!studentId || typeof marks !== "number") {
      return res.status(400).json({ msg: "Student ID and marks are required" });
    }
    if (marks < 0 || marks > 50) {
      return res.status(400).json({ msg: "Marks must be between 0 and 50" });
    }
    let evaluation = await Evaluation.findOne({ student: studentId });
    if (!evaluation) {
      // You may want to require a project reference here
      return res
        .status(404)
        .json({ msg: "Evaluation record not found for student" });
    }
    evaluation.internalMarks = {
      marks,
      feedback,
      evaluatedAt: new Date(),
    };
    evaluation.status = "evaluated";
    await evaluation.save();
    res.json({ success: true, evaluation });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
