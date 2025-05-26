const Milestone = require("../models/Milestone");
const User = require("../models/User");

// Get all milestones
exports.getMilestones = async (req, res) => {
  try {
    console.log("Fetching all milestones...");

    const milestones = await Milestone.find()
      .populate("student", "name email studentId")
      .populate("supervisor", "name email")
      .sort({ dueDate: 1 });

    console.log(`Found ${milestones.length} milestones`);

    res.status(200).json({
      success: true,
      milestones: milestones || [],
      count: milestones.length,
    });
  } catch (err) {
    console.error("Error in getMilestones:", err.message);
    res.status(500).json({
      success: false,
      msg: "Error fetching milestones",
      error: err.message,
    });
  }
};

// Update or create milestone
exports.updateMilestone = async (req, res) => {
  try {
    const { name } = req.params;
    const { deadline } = req.body;

    console.log("Updating milestone:", { name, deadline });

    if (!name) {
      console.log("Error: Milestone name is required");
      return res.status(400).json({
        success: false,
        msg: "Milestone name is required",
      });
    }

    // Validate deadline format if provided
    if (deadline && isNaN(Date.parse(deadline))) {
      console.log("Error: Invalid deadline format");
      return res.status(400).json({
        success: false,
        msg: "Invalid deadline format",
      });
    }

    // Find the milestone by name or create new one
    const updatedMilestone = await Milestone.findOneAndUpdate(
      { name },
      {
        deadline: deadline ? new Date(deadline) : null,
        updatedAt: new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedMilestone) {
      console.log("Error: Milestone not found:", name);
      return res.status(404).json({
        success: false,
        msg: "Milestone not found",
      });
    }

    console.log("Successfully updated milestone:", updatedMilestone);

    res.status(200).json({
      success: true,
      msg: "Milestone updated successfully",
      milestone: updatedMilestone,
    });
  } catch (err) {
    console.error("Error in updateMilestone:", err.message);

    // Handle validation errors
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        msg: "Validation error",
        errors: Object.values(err.errors).map((e) => e.message),
      });
    }

    res.status(500).json({
      success: false,
      msg: "Error updating milestone",
      error: err.message,
    });
  }
};

// Delete milestone
exports.deleteMilestone = async (req, res) => {
  try {
    const { name } = req.params;

    const milestone = await Milestone.findOneAndDelete({ name });

    if (!milestone) {
      return res.status(404).json({
        success: false,
        msg: "Milestone not found",
      });
    }

    res.status(200).json({
      success: true,
      msg: "Milestone deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting milestone:", err);
    res.status(500).json({
      success: false,
      msg: "Error deleting milestone",
      error: err.message,
    });
  }
};

// Get all milestones for a student
exports.getStudentMilestones = async (req, res) => {
  try {
    const { studentId } = req.params;

    const milestones = await Milestone.find({ student: studentId })
      .populate("supervisor", "name email")
      .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      milestones,
    });
  } catch (err) {
    console.error("Error fetching milestones:", err);
    res.status(500).json({
      success: false,
      msg: "Server error",
      error: err.message,
    });
  }
};

// Get all milestones for a supervisor
exports.getSupervisorMilestones = async (req, res) => {
  try {
    const supervisorId = req.user.id;

    const milestones = await Milestone.find({ supervisor: supervisorId })
      .populate("student", "name email studentId")
      .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      milestones,
    });
  } catch (err) {
    console.error("Error fetching milestones:", err);
    res.status(500).json({
      success: false,
      msg: "Server error",
      error: err.message,
    });
  }
};

// Create a new milestone
exports.createMilestone = async (req, res) => {
  try {
    const { studentId, title, description, dueDate } = req.body;
    const supervisorId = req.user.id;

    // Validate student exists
    const student = await User.findOne({ _id: studentId, role: "student" });
    if (!student) {
      return res.status(404).json({
        success: false,
        msg: "Student not found",
      });
    }

    const milestone = new Milestone({
      student: studentId,
      supervisor: supervisorId,
      title,
      description,
      dueDate: new Date(dueDate),
    });

    await milestone.save();

    res.status(201).json({
      success: true,
      milestone,
    });
  } catch (err) {
    console.error("Error creating milestone:", err);
    res.status(500).json({
      success: false,
      msg: "Server error",
      error: err.message,
    });
  }
};

// Update milestone status
exports.updateMilestoneStatus = async (req, res) => {
  try {
    const { milestoneId } = req.params;
    const { status, feedback } = req.body;

    const milestone = await Milestone.findById(milestoneId);
    if (!milestone) {
      return res.status(404).json({
        success: false,
        msg: "Milestone not found",
      });
    }

    // Only allow status updates by the assigned supervisor
    if (milestone.supervisor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        msg: "Not authorized to update this milestone",
      });
    }

    milestone.status = status;
    if (feedback) milestone.feedback = feedback;
    if (status === "Completed") milestone.completedDate = new Date();

    await milestone.save();

    res.status(200).json({
      success: true,
      milestone,
    });
  } catch (err) {
    console.error("Error updating milestone:", err);
    res.status(500).json({
      success: false,
      msg: "Server error",
      error: err.message,
    });
  }
};

// Delete a milestone
exports.deleteMilestone = async (req, res) => {
  try {
    const { milestoneId } = req.params;

    const milestone = await Milestone.findById(milestoneId);
    if (!milestone) {
      return res.status(404).json({
        success: false,
        msg: "Milestone not found",
      });
    }

    // Only allow deletion by the assigned supervisor
    if (milestone.supervisor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        msg: "Not authorized to delete this milestone",
      });
    }

    await milestone.remove();

    res.status(200).json({
      success: true,
      msg: "Milestone deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting milestone:", err);
    res.status(500).json({
      success: false,
      msg: "Server error",
      error: err.message,
    });
  }
};
