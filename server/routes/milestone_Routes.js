const express = require("express");
const router = express.Router();
const milestoneController = require("../controllers/milestone_Controller");
const { protect, authorize } = require("../middleware/auth");

// Student routes
router.get(
  "/student/:studentId",
  protect,
  authorize("student", "supervisor"),
  milestoneController.getStudentMilestones
);

// Supervisor routes
router.get(
  "/supervisor",
  protect,
  authorize("supervisor"),
  milestoneController.getSupervisorMilestones
);
router.post(
  "/",
  protect,
  authorize("supervisor"),
  milestoneController.createMilestone
);
router.put(
  "/:milestoneId",
  protect,
  authorize("supervisor"),
  milestoneController.updateMilestoneStatus
);
router.delete(
  "/:milestoneId",
  protect,
  authorize("supervisor"),
  milestoneController.deleteMilestone
);

module.exports = router;
