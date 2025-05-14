const Document = require("../models/Document");
const User = require("../models/User");
const path = require("path");
const fs = require("fs");

// Upload document
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        msg: "No file uploaded",
      });
    }

    const { fileType, title, description } = req.body;
    const studentId = req.user.id;

    // Validate file type
    const validTypes = ["proposal", "srs", "diagram", "finalReport"];
    if (!validTypes.includes(fileType)) {
      // Delete uploaded file if type is invalid
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        msg: "Invalid document type",
      });
    }

    // Create new document record
    const document = new Document({
      fileType,
      filePath: req.file.path.replace(/\\/g, "/"),
      uploadedBy: studentId,
      title: title || req.file.originalname,
      description: description || "",
      status: "pending",
      feedback: "Awaiting review",
    });

    await document.save();

    // Update user's document status based on type
    const updateField = `${fileType}Status`;
    await User.findByIdAndUpdate(studentId, {
      [updateField]: "Submitted",
    });

    res.status(200).json({
      success: true,
      msg: "Document uploaded successfully",
      document,
    });
  } catch (err) {
    console.error("Error uploading document:", err);
    // Delete uploaded file if there's an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      msg: "Error uploading document",
      error: err.message,
    });
  }
};

// Get user's documents
exports.getUserDocuments = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    const documents = await Document.find({ uploadedBy: userId })
      .populate("uploadedBy", "name studentId")
      .sort({ createdAt: -1 });

    // Group documents by type
    const groupedDocs = documents.reduce((acc, doc) => {
      if (!acc[doc.fileType]) {
        acc[doc.fileType] = [];
      }
      acc[doc.fileType].push(doc);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      documents: groupedDocs,
    });
  } catch (err) {
    console.error("Error fetching documents:", err);
    res.status(500).json({
      success: false,
      msg: "Error fetching documents",
      error: err.message,
    });
  }
};

// Delete document
exports.deleteDocument = async (req, res) => {
  try {
    const documentId = req.params.documentId;
    const userId = req.user.id;

    const document = await Document.findOne({
      _id: documentId,
      uploadedBy: userId,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        msg: "Document not found",
      });
    }

    // Delete file from storage
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Delete document record
    await document.remove();

    res.status(200).json({
      success: true,
      msg: "Document deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting document:", err);
    res.status(500).json({
      success: false,
      msg: "Error deleting document",
      error: err.message,
    });
  }
};
