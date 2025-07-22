const User = require("../models/User");
const Evaluation = require("../models/Evaluation");
const Project = require("../models/Project");

// Get all students assigned to a supervisor
exports.getAssignedStudents = async (req, res) => {
  try {
    const supervisorId = req.user.id;

    // Find all students who have this supervisor
    const students = await User.find({
      "supervisor.id": supervisorId,
      role: "student",
    }).select("name studentId projectTitle _id");

    res.status(200).json({
      success: true,
      students,
    });
  } catch (err) {
    console.error("Error fetching assigned students:", err);
    res.status(500).json({
      success: false,
      msg: "Unable to fetch assigned students. Please try again later.",
    });
  }
};

// Get evaluations for supervisor's students
exports.getEvaluations = async (req, res) => {
  try {
    const supervisorId = req.user.id;

    // Find all students who have this supervisor
    const students = await User.find({
      "supervisor.id": supervisorId,
      role: "student",
    }).select("_id");

    const studentIds = students.map((student) => student._id);

    // Get evaluations for these students
    const evaluations = await Evaluation.find({
      student: { $in: studentIds },
    }).populate("student", "name studentId projectTitle");

    res.status(200).json({
      success: true,
      evaluations,
    });
  } catch (err) {
    console.error("Error fetching evaluations:", err);
    res.status(500).json({
      success: false,
      msg: "Unable to retrieve evaluations at this time. Please try again later.",
    });
  }
};

// Evaluate a student
exports.evaluateStudent = async (req, res) => {
  try {
    const { studentId, marks, feedback } = req.body;
    const supervisorId = req.user.id;

    // Verify the student is assigned to this supervisor
    const student = await User.findOne({
      _id: studentId,
      "supervisor.id": supervisorId,
      role: "student",
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        msg: "This student is not assigned to you or does not exist.",
      });
    }

    // Validate marks
    if (marks < 0 || marks > 50) {
      return res.status(400).json({
        success: false,
        msg: "Marks must be a number between 0 and 50.",
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

    // Update supervisor marks
    evaluation.supervisorMarks = {
      marks,
      feedback,
      evaluatedAt: new Date(),
    };

    // Update status
    evaluation.status = "evaluated";

    await evaluation.save();

    res.status(200).json({
      success: true,
      msg: "Evaluation submitted successfully",
      evaluation,
    });
  } catch (err) {
    console.error("Error evaluating student:", err);
    res.status(500).json({
      success: false,
      msg: "Unable to submit evaluation at this time. Please try again later.",
    });
  }
};
