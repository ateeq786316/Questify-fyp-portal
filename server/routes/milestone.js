const express = require("express");
const router = express.Router();
const Milestone = require("../models/Milestone");
const milestoneController = require("../controllers/milestone_controller");

// Get all milestones
router.get("/milestones", async (req, res) => {
  try {
    console.log("\n=== Fetching All Milestones ===");
    const milestones = await Milestone.find().sort({ order: 1 });
    console.log(
      `Found ${milestones.length} milestones:`,
      milestones.map((m) => m.name)
    );

    res.status(200).json({
      success: true,
      milestones,
    });
  } catch (err) {
    console.error("Error fetching milestones:", err);
    res.status(500).json({
      success: false,
      msg: "Error fetching milestones",
      error: err.message,
    });
  }
});

// Bulk update milestones - MUST BE BEFORE /:name ROUTE
router.put("/milestones/bulk", async (req, res) => {
  console.log("\n=== Bulk Update Milestones ===");
  console.log("Method:", req.method);
  console.log("URL:", req.originalUrl);
  console.log("Body:", req.body);
  console.log("Headers:", req.headers);

  try {
    const { milestones } = req.body;

    if (!Array.isArray(milestones)) {
      console.log("Error: Invalid milestones data");
      return res.status(400).json({
        success: false,
        msg: "Milestones must be an array",
      });
    }

    // Validate each milestone
    for (const milestone of milestones) {
      if (
        !milestone.name ||
        typeof milestone.name !== "string" ||
        milestone.name.trim() === ""
      ) {
        console.log("Error: Invalid milestone name in bulk update");
        return res.status(400).json({
          success: false,
          msg: "Each milestone must have a valid name",
        });
      }

      if (milestone.deadline && isNaN(Date.parse(milestone.deadline))) {
        console.log("Error: Invalid deadline format in bulk update");
        return res.status(400).json({
          success: false,
          msg: "Invalid deadline format in one or more milestones",
        });
      }
    }

    // Update each milestone
    const updatePromises = milestones.map((milestone) =>
      Milestone.findOneAndUpdate(
        { name: milestone.name },
        {
          deadline: milestone.deadline ? new Date(milestone.deadline) : null,
          order: milestone.order,
          updatedAt: new Date(),
        },
        { new: true, runValidators: true }
      )
    );

    const updatedMilestones = await Promise.all(updatePromises);
    console.log(
      "Success: Updated milestones:",
      updatedMilestones.map((m) => m.name)
    );

    res.status(200).json({
      success: true,
      msg: "Milestones updated successfully",
      milestones: updatedMilestones,
    });
  } catch (err) {
    console.error("Error in bulk milestone update:", {
      message: err.message,
      stack: err.stack,
    });

    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        msg: "Invalid milestone data",
        errors: Object.values(err.errors).map((e) => e.message),
      });
    }

    res.status(500).json({
      success: false,
      msg: "Error updating milestones",
      error: err.message,
    });
  }
});

// Update milestone by name
router.put("/milestones/:name", async (req, res) => {
  console.log("\n=== Milestone Update Request ===");
  console.log("Method:", req.method);
  console.log("URL:", req.originalUrl);
  console.log("Params:", req.params);
  console.log("Body:", req.body);
  console.log("Headers:", req.headers);

  try {
    // Validate milestone name
    if (!req.params.name) {
      console.log("Error: Milestone name is missing");
      return res.status(400).json({
        success: false,
        msg: "Milestone name is required",
      });
    }

    // Check if milestone exists
    const existingMilestone = await Milestone.findOne({
      name: req.params.name,
    });
    if (!existingMilestone) {
      console.log("Error: Milestone not found:", req.params.name);
      // List available milestones
      const availableMilestones = await Milestone.find().select("name");
      console.log(
        "Available milestones:",
        availableMilestones.map((m) => m.name)
      );

      return res.status(404).json({
        success: false,
        msg: `Milestone "${req.params.name}" not found`,
        availableMilestones: availableMilestones.map((m) => m.name),
      });
    }

    // Validate deadline format if provided
    if (req.body.deadline && isNaN(Date.parse(req.body.deadline))) {
      console.log("Error: Invalid deadline format");
      return res.status(400).json({
        success: false,
        msg: "Invalid deadline format",
      });
    }

    // Find and update the milestone
    const updated = await Milestone.findOneAndUpdate(
      { name: req.params.name },
      {
        deadline: req.body.deadline ? new Date(req.body.deadline) : null,
        updatedAt: new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    console.log("Success: Milestone updated:", updated);
    res.status(200).json({
      success: true,
      msg: "Milestone updated successfully",
      milestone: updated,
    });
  } catch (err) {
    console.error("Error updating milestone:", {
      message: err.message,
      stack: err.stack,
    });

    res.status(500).json({
      success: false,
      msg: "Error updating milestone",
      error: err.message,
    });
  }
});

// Create new milestone
router.post("/milestones", async (req, res) => {
  console.log("\n=== Creating New Milestone ===");
  console.log("Method:", req.method);
  console.log("URL:", req.originalUrl);
  console.log("Body:", req.body);
  console.log("Headers:", req.headers);

  try {
    const { name, deadline, order } = req.body;

    // Validate required fields
    if (!name || typeof name !== "string" || name.trim() === "") {
      console.log("Error: Invalid milestone name");
      return res.status(400).json({
        success: false,
        msg: "Milestone name is required and must be a non-empty string",
      });
    }

    // Check if milestone with same name already exists
    const existingMilestone = await Milestone.findOne({ name: name.trim() });
    if (existingMilestone) {
      console.log("Error: Milestone with this name already exists");
      return res.status(400).json({
        success: false,
        msg: `Milestone "${name}" already exists`,
      });
    }

    // Validate deadline if provided
    if (deadline && isNaN(Date.parse(deadline))) {
      console.log("Error: Invalid deadline format");
      return res.status(400).json({
        success: false,
        msg: "Invalid deadline format",
      });
    }

    // Create new milestone
    const newMilestone = new Milestone({
      name: name.trim(),
      deadline: deadline ? new Date(deadline) : null,
      order: order || (await Milestone.countDocuments()) + 1,
    });

    // Save milestone
    const savedMilestone = await newMilestone.save();
    console.log("Success: Milestone created:", savedMilestone);

    res.status(201).json({
      success: true,
      msg: "Milestone created successfully",
      milestone: savedMilestone,
    });
  } catch (err) {
    console.error("Error creating milestone:", {
      message: err.message,
      stack: err.stack,
    });

    // Handle validation errors
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        msg: "Invalid milestone data",
        errors: Object.values(err.errors).map((e) => e.message),
      });
    }

    res.status(500).json({
      success: false,
      msg: "Error creating milestone",
      error: err.message,
    });
  }
});

// Delete milestone
router.delete("/milestones/:name", async (req, res) => {
  console.log("\n=== Deleting Milestone ===");
  console.log("Method:", req.method);
  console.log("URL:", req.originalUrl);
  console.log("Params:", req.params);
  console.log("Headers:", req.headers);

  try {
    const { name } = req.params;

    // Validate milestone name
    if (!name || typeof name !== "string" || name.trim() === "") {
      console.log("Error: Invalid milestone name");
      return res.status(400).json({
        success: false,
        msg: "Milestone name is required",
      });
    }

    // Check if milestone exists
    const existingMilestone = await Milestone.findOne({ name: name.trim() });
    if (!existingMilestone) {
      console.log("Error: Milestone not found:", name);
      // List available milestones
      const availableMilestones = await Milestone.find().select("name");
      console.log(
        "Available milestones:",
        availableMilestones.map((m) => m.name)
      );

      return res.status(404).json({
        success: false,
        msg: `Milestone "${name}" not found`,
        availableMilestones: availableMilestones.map((m) => m.name),
      });
    }

    // Delete the milestone
    const deletedMilestone = await Milestone.findOneAndDelete({
      name: name.trim(),
    });
    console.log("Success: Milestone deleted:", deletedMilestone);

    res.status(200).json({
      success: true,
      msg: "Milestone deleted successfully",
      milestone: deletedMilestone,
    });
  } catch (err) {
    console.error("Error deleting milestone:", {
      message: err.message,
      stack: err.stack,
    });

    res.status(500).json({
      success: false,
      msg: "Error deleting milestone",
      error: err.message,
    });
  }
});

module.exports = router;
