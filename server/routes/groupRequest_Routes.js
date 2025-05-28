const express = require("express");
const router = express.Router();
const groupRequestController = require("../controllers/groupRequest_Controller");
const { protect, authorize } = require("../middleware/auth");

// Get all group requests for a student
router.get(
  "/",
  protect,
  authorize("student"),
  groupRequestController.getGroupRequests
);

// Send a group request
router.post(
  "/",
  protect,
  authorize("student"),
  groupRequestController.sendGroupRequest
);

// Approve a group request
router.post(
  "/:requestId/approve",
  protect,
  authorize("student"),
  groupRequestController.approveGroupRequest
);

// Reject a group request
router.post(
  "/:requestId/reject",
  protect,
  authorize("student"),
  groupRequestController.rejectGroupRequest
);

module.exports = router;
