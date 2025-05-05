const Milestone = require("../models/Milestone");

// Get all milestones
exports.getMilestones = async (req, res) => {
  try {
    console.log("Fetching all milestones...");

    const milestones = await Milestone.find()
      .sort({ order: 1 })
      .select("name deadline order status");

    console.log(`Found ${milestones.length} milestones`);

    res.status(200).json({
      success: true,
      milestones,
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

// Create new milestone
exports.createMilestone = async (req, res) => {
  try {
    const { name, deadline } = req.body;

    console.log("Creating new milestone:", { name, deadline });

    if (!name) {
      console.log("Error: Milestone name is required");
      return res.status(400).json({
        success: false,
        msg: "Milestone name is required",
      });
    }

    // Check if milestone already exists
    const existingMilestone = await Milestone.findOne({ name });
    if (existingMilestone) {
      console.log("Error: Milestone already exists:", name);
      return res.status(400).json({
        success: false,
        msg: "Milestone with this name already exists",
      });
    }

    // Get the highest order number
    const highestOrder = await Milestone.findOne()
      .sort("-order")
      .select("order");
    const newOrder = highestOrder ? highestOrder.order + 1 : 1;

    // Create new milestone
    const newMilestone = new Milestone({
      name,
      deadline: deadline ? new Date(deadline) : null,
      order: newOrder,
    });

    await newMilestone.save();
    console.log("Successfully created milestone:", newMilestone);

    res.status(201).json({
      success: true,
      msg: "Milestone created successfully",
      milestone: newMilestone,
    });
  } catch (err) {
    console.error("Error in createMilestone:", err.message);

    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        msg: "Validation error",
        errors: Object.values(err.errors).map((e) => e.message),
      });
    }

    res.status(500).json({
      success: false,
      msg: "Error creating milestone",
      error: err.message,
    });
  }
};
