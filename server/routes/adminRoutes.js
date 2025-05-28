const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin_controller");
const { isAdmin } = require("../middleware/authMiddleware");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.get("/stats", isAdmin, adminController.getDashboardStats);
router.get("/student-groups", isAdmin, adminController.getStudentGroups);
router.get("/milestones", isAdmin, adminController.getMilestones);
router.post("/milestones", isAdmin, adminController.saveMilestones);
router.post(
  "/upload-students",
  isAdmin,
  upload.single("file"),
  adminController.uploadStudents
);
// Student template download route
router.get(
  "/student-template",
  isAdmin,
  adminController.downloadStudentTemplate
);
router.post("/add-student", isAdmin, adminController.addSingleStudent);
router.get(
  "/supervisor-template",
  isAdmin,
  adminController.downloadSupervisorTemplate
);
router.post("/add-supervisor", isAdmin, adminController.addSingleSupervisor);
router.post(
  "/supervisors/upload",
  isAdmin,
  upload.single("file"),
  adminController.uploadSupervisors
);

// User Management Routes
router.get("/users", isAdmin, adminController.getUsers);
router.put("/users/:id", isAdmin, adminController.updateUser);
router.delete("/users/:id", isAdmin, adminController.deleteUser);

module.exports = router;
