const upload = require("../middleware/uploadMiddleware");

// Student routes
router.post(
  "/student/project-proposal",
  authMiddleware,
  upload.single("proposalFile"),
  authController.submitProjectProposal
);
router.post("/student/login", authController.studentLogin);
router.post("/admin/login", authController.adminLogin);
router.post("/supervisor/login", authController.supervisorLogin);
