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
        msg: "Please select a file to upload.",
      });
    }
    const { fileType, title, description } = req.body;
    const studentId = req.user.id;
    const validTypes = ["proposal", "srs", "diagram", "finalReport"];
    if (!validTypes.includes(fileType)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        msg: "The selected document type is not supported. Please choose a valid type.",
      });
    }
    // Always store the relative path from uploads directory
    const uploadsDir = path.join(__dirname, "..", "uploads");
    let relativePath = path
      .relative(uploadsDir, req.file.path)
      .replace(/\\/g, "/");
    const document = new Document({
      fileType,
      filePath: relativePath,
      uploadedBy: studentId,
      title: title || req.file.originalname,
      description: description || "",
      status: "pending",
      feedback: "Awaiting review",
    });
    await document.save();
    const updateField = `${fileType}Status`;
    await User.findByIdAndUpdate(studentId, { [updateField]: "Submitted" });
    res.status(200).json({
      success: true,
      msg: "Document uploaded successfully",
      document,
    });
  } catch (err) {
    console.error("Error uploading document:", err);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      msg: "There was a problem uploading your document. Please try again. If the issue persists, contact support.",
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
      msg: "Unable to retrieve documents at this time. Please refresh or try again later.",
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
        msg: "The document you are trying to delete does not exist or has already been removed.",
      });
    }
    // Always resolve the absolute path from uploads directory
    const uploadsDir = path.join(__dirname, "..", "uploads");
    const absolutePath = path.join(uploadsDir, document.filePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
    await document.remove();
    res.status(200).json({
      success: true,
      msg: "Document deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting document:", err);
    res.status(500).json({
      success: false,
      msg: "Unable to delete the document. Please try again. If the problem continues, contact support.",
    });
  }
};
