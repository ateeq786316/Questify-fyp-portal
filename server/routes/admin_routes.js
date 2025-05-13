// Upload supervisors route
router.post(
  "/supervisors/upload",
  adminAuth,
  adminController.uploadSupervisors
);
