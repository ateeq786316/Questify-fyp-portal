const express = require("express");
const router = express.Router();
const {
  studentLogin,
  adminLogin,
  supervisorLogin,
  internalLogin,
  externalLogin,
  submitProjectProposal,
  getStudentDetails,
  getAllSupervisors,
  createSupervisorRequest,
  getStudentRequests,
} = require("../controllers/auth_Controller");
const {
  uploadDocument,
  getUserDocuments,
  deleteDocument,
} = require("../controllers/document_Controller");
const {
  getConversation,
  sendMessage,
} = require("../controllers/chat_Controller");
const upload = require("../middleware/uploadMiddleware");
const { verifyToken } = require("../utils/token");
const Document = require("../models/Document");

// Auth middleware
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ msg: "No token provided" });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ msg: "Invalid token" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(401).json({ msg: "Token is not valid" });
  }
};

// Student role middleware
const studentMiddleware = (req, res, next) => {
  if (req.user.role !== "student") {
    return res.status(403).json({ msg: "Access denied. Students only." });
  }
  next();
};

// Auth routes
router.post("/student/login", studentLogin);
router.post("/admin/login", adminLogin);
router.post("/supervisor/login", supervisorLogin);
router.post("/internal/login", internalLogin);
router.post("/external/login", externalLogin);
router.get("/student/details", authMiddleware, getStudentDetails);

// Document routes
router.post(
  "/documents/upload",
  authMiddleware,
  studentMiddleware,
  upload.single("file"),
  uploadDocument
);
router.get("/documents/:userId?", authMiddleware, getUserDocuments);
router.delete(
  "/documents/:documentId",
  authMiddleware,
  studentMiddleware,
  deleteDocument
);

// Student routes
router.post(
  "/student/project-proposal",
  authMiddleware,
  upload.single("proposalFile"),
  submitProjectProposal
);

// Supervisor request routes
router.get("/supervisors", authMiddleware, getAllSupervisors);
router.post("/supervisor-request", authMiddleware, createSupervisorRequest);
router.get("/supervisor-request", authMiddleware, getStudentRequests);

// Document comment routes
router.post("/documents/:docId/comments", authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    const document = await Document.findById(req.params.docId);

    if (!document) {
      return res.status(404).json({ msg: "Document not found" });
    }

    // Add new comment
    document.comments.push({
      sender: req.user.id,
      message,
      date: new Date(),
    });

    await document.save();

    // Populate sender details
    await document.populate({
      path: "comments.sender",
      select: "name role",
    });

    res.status(200).json({
      success: true,
      document,
    });
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Get document with comments
router.get("/documents/:docId", authMiddleware, async (req, res) => {
  try {
    const document = await Document.findById(req.params.docId)
      .populate({
        path: "comments.sender",
        select: "name role",
      })
      .populate("uploadedBy", "name studentId");

    if (!document) {
      return res.status(404).json({ msg: "Document not found" });
    }

    res.status(200).json({
      success: true,
      document,
    });
  } catch (err) {
    console.error("Error fetching document:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Chat routes
router.get("/chat/:studentId", authMiddleware, getConversation);
router.post("/chat/:studentId/send", authMiddleware, sendMessage);

module.exports = router;
