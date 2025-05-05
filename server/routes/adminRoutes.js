const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin_controller");
const { isAdmin } = require("../middleware/authMiddleware");

router.get("/stats", isAdmin, adminController.getDashboardStats);
router.get("/student-groups", isAdmin, adminController.getStudentGroups);
router.get("/milestones", isAdmin, adminController.getMilestones);
router.post("/milestones", isAdmin, adminController.saveMilestones);
router.post("/upload-students", isAdmin, adminController.uploadStudents);

module.exports = router;
