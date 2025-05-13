const express = require("express");
const router = express.Router();
const Milestone = require("../models/Milestone");
const milestoneController = require("../controllers/milestone_controller");

// Get all milestones
router.get("/", async (req, res) => {
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
router.put("/bulk", async (req, res) => {
  console.log("\n=== Bulk Update Milestones ===");
  console.log("Method:", req.method);
  console.log("URL:", req.originalUrl);
  console.log("Body:", req.body);

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

    // Process each milestone
    const results = {
      updated: [],
      created: [],
      errors: [],
    };

    for (const milestone of milestones) {
      try {
        // Try to find existing milestone
        const existingMilestone = await Milestone.findOne({
          name: milestone.name,
        });

        if (existingMilestone) {
          // Update existing milestone
          const updated = await Milestone.findOneAndUpdate(
            { name: milestone.name },
            {
              deadline: milestone.deadline
                ? new Date(milestone.deadline)
                : null,
              order: milestone.order,
              updatedAt: new Date(),
            },
            { new: true, runValidators: true }
          );
          results.updated.push(updated);
        } else {
          // Create new milestone
          const newMilestone = new Milestone({
            name: milestone.name.trim(),
            deadline: milestone.deadline ? new Date(milestone.deadline) : null,
            order: milestone.order || (await Milestone.countDocuments()) + 1,
          });
          const saved = await newMilestone.save();
          results.created.push(saved);
        }
      } catch (err) {
        console.error(`Error processing milestone ${milestone.name}:`, err);
        results.errors.push({
          name: milestone.name,
          error: err.message,
        });
      }
    }

    console.log("Bulk update results:", {
      updated: results.updated.length,
      created: results.created.length,
      errors: results.errors.length,
    });

    res.status(200).json({
      success: true,
      msg: "Milestones processed successfully",
      results: {
        updated: results.updated,
        created: results.created,
        errors: results.errors,
      },
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

// Create new milestone
router.post("/", async (req, res) => {
  console.log("\n=== Creating New Milestone ===");
  console.log("Method:", req.method);
  console.log("URL:", req.originalUrl);
  console.log("Body:", req.body);

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
    console.error("Error creating milestone:", err);
    res.status(500).json({
      success: false,
      msg: "Error creating milestone",
      error: err.message,
    });
  }
});

// Update milestone by name
router.put("/:name", async (req, res) => {
  console.log("\n=== Milestone Update Request ===");
  console.log("Method:", req.method);
  console.log("URL:", req.originalUrl);
  console.log("Params:", req.params);
  console.log("Body:", req.body);

  try {
    const { name } = req.params;
    const { deadline, order } = req.body;

    // Check if milestone exists
    const existingMilestone = await Milestone.findOne({ name });
    if (!existingMilestone) {
      console.log("Error: Milestone not found:", name);
      return res.status(404).json({
        success: false,
        msg: `Milestone "${name}" not found`,
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

    // Update the milestone
    const updated = await Milestone.findOneAndUpdate(
      { name },
      {
        deadline: deadline ? new Date(deadline) : existingMilestone.deadline,
        order: order || existingMilestone.order,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    console.log("Success: Milestone updated:", updated);
    res.status(200).json({
      success: true,
      msg: "Milestone updated successfully",
      milestone: updated,
    });
  } catch (err) {
    console.error("Error updating milestone:", err);
    res.status(500).json({
      success: false,
      msg: "Error updating milestone",
      error: err.message,
    });
  }
});

// Delete milestone by name
router.delete("/:name", async (req, res) => {
  console.log("\n=== Delete Milestone Request ===");
  console.log("Method:", req.method);
  console.log("URL:", req.originalUrl);
  console.log("Params:", req.params);

  try {
    const { name } = req.params;

    // Check if milestone exists
    const milestone = await Milestone.findOne({ name });
    if (!milestone) {
      console.log("Error: Milestone not found:", name);
      return res.status(404).json({
        success: false,
        msg: `Milestone "${name}" not found`,
      });
    }

    // Delete the milestone
    await Milestone.deleteOne({ name });
    console.log("Success: Milestone deleted:", name);

    res.status(200).json({
      success: true,
      msg: `Milestone "${name}" deleted successfully`,
    });
  } catch (err) {
    console.error("Error deleting milestone:", err);
    res.status(500).json({
      success: false,
      msg: "Error deleting milestone",
      error: err.message,
    });
  }
});

module.exports = router;
