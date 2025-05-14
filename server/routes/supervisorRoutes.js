const express = require("express");
const router = express.Router();
const { verifyToken } = require("../utils/token");
const Document = require("../models/Document");

// Middleware to verify supervisor token
const verifySupervisor = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ msg: "No token provided" });
  }

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== "supervisor") {
    return res.status(401).json({ msg: "Invalid token or unauthorized" });
  }

  req.supervisorId = decoded.id;
  next();
};

// Get documents by student IDs
router.get("/documents", verifySupervisor, async (req, res) => {
  try {
    const { studentIds } = req.query;
    if (!studentIds) {
      return res.status(400).json({ msg: "Student IDs are required" });
    }

    const ids = studentIds.split(",");
    const documents = await Document.find({
      uploadedBy: { $in: ids },
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      documents,
    });
  } catch (err) {
    console.error("Error fetching documents:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Submit feedback for a document
router.post(
  "/documents/:documentId/feedback",
  verifySupervisor,
  async (req, res) => {
    try {
      const { documentId } = req.params;
      const { feedback } = req.body;

      if (!feedback) {
        return res.status(400).json({ msg: "Feedback is required" });
      }

      const document = await Document.findById(documentId);
      if (!document) {
        return res.status(404).json({ msg: "Document not found" });
      }

      document.feedback = feedback;
      document.status = "reviewed";
      await document.save();

      res.json({
        success: true,
        msg: "Feedback submitted successfully",
        document,
      });
    } catch (err) {
      console.error("Error submitting feedback:", err);
      res.status(500).json({ msg: "Server error", error: err.message });
    }
  }
);

module.exports = router;
