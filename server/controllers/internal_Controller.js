const User = require("../models/User");
const Evaluation = require("../models/Evaluation");
const Document = require("../models/Document");

// Get internal examiner profile
exports.getProfile = async (req, res) => {
  try {
    const internal = await User.findById(req.internalId).select("-password");
    if (!internal)
      return res.status(404).json({
        msg: "No profile found for the internal examiner. Please check your login or contact admin.",
      });
    res.json({ internal });
  } catch (err) {
    res.status(500).json({
      msg: "Unable to retrieve profile at this time. Please try again later.",
    });
  }
};

// Get all students for evaluation (example: all students, or filter as needed)
exports.getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("_id name studentId projectTitle department evaluation")
      .lean();
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
    res.status(500).json({
      msg: "Unable to fetch students for evaluation. Please refresh or try again later.",
    });
  }
};

// Submit evaluation for a student
exports.evaluateStudent = async (req, res) => {
  try {
    const { studentId, marks, feedback } = req.body;
    if (!studentId || typeof marks !== "number") {
      return res.status(400).json({
        msg: "Student and marks are required to submit an evaluation.",
      });
    }
    if (marks < 0 || marks > 50) {
      return res
        .status(400)
        .json({ msg: "Marks must be a number between 0 and 50." });
    }
    let evaluation = await Evaluation.findOne({ student: studentId });
    if (!evaluation) {
      return res.status(404).json({
        msg: "This student does not have an evaluation record. Please verify the student’s registration.",
      });
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
    res.status(500).json({
      msg: "Unable to submit evaluation at this time. Please try again later.",
    });
  }
};
