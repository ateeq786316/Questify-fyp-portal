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
  chatbot,
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
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const Document = require("../models/Document");
const { verifyToken } = require("../utils/token");
const authController = require("../controllers/authController");

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const fileType = req.body.fileType || "proposals";
    const uploadPath = path.join(__dirname, "..", "uploads", fileType);

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept PDF, DOC, DOCX, and image files
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "image/gif",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only PDF, Word documents, and images are allowed."
      ),
      false
    );
  }
};

// Configure multer upload with increased file size limit
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Error handling middleware for Multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        msg: "File size too large. Maximum size is 50MB.",
      });
    }
    return res.status(400).json({
      success: false,
      msg: `Upload error: ${err.message}`,
    });
  }
  next(err);
};

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
  upload.single("file"),
  handleMulterError,
  async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res
          .status(401)
          .json({ success: false, msg: "No token provided" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded || decoded.role !== "student") {
        return res.status(401).json({ success: false, msg: "Invalid token" });
      }

      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, msg: "No file uploaded" });
      }

      const { title, description, fileType } = req.body;
      if (!title || !description || !fileType) {
        // Delete uploaded file if validation fails
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({
          success: false,
          msg: "Title, description, and file type are required",
        });
      }

      // Check if student already has a document of this type
      const existingDoc = await Document.findOne({
        uploadedBy: decoded.id,
        fileType: fileType,
      });

      // If document exists and was rejected, allow new upload
      if (existingDoc && existingDoc.status === "rejected") {
        // Delete the old file
        try {
          const oldFilePath = path.join(__dirname, "..", existingDoc.filePath);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        } catch (err) {
          console.error("Error deleting old file:", err);
        }

        // Delete the old document
        await Document.findByIdAndDelete(existingDoc._id);
      }
      // If document exists and wasn't rejected, return error
      else if (existingDoc) {
        // Delete the newly uploaded file since we won't use it
        fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          msg: `You already have a ${fileType} document that is ${existingDoc.status}. Please wait for it to be rejected before uploading a new one.`,
        });
      }

      // Create new document
      const document = new Document({
        title,
        description,
        fileType,
        filePath: path
          .join(fileType, path.basename(req.file.path))
          .replace(/\\/g, "/"), // Store relative path
        uploadedBy: decoded.id,
        status: "pending",
      });

      await document.save();

      res.status(201).json({
        success: true,
        msg: "Document uploaded successfully",
        document,
      });
    } catch (err) {
      console.error("Error uploading document:", err);
      // If there was an error and a file was uploaded, delete it
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkErr) {
          console.error("Error deleting uploaded file:", unlinkErr);
        }
      }
      res.status(500).json({
        success: false,
        msg: "Error uploading document",
        error: err.message,
      });
    }
  }
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

// Student signup route
router.post("/student/signup", authController.studentSignup);

// OTP verification route
router.post("/student/verify-otp", authController.verifyOTP);

module.exports = router;
