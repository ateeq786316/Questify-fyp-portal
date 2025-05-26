const express = require("express");
const router = express.Router();
const { verifyToken } = require("../utils/token");
const User = require("../models/User");
const SupervisorRequest = require("../models/SupervisorRequest");
const Document = require("../models/Document");
const path = require("path");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const supervisorController = require("../controllers/supervisor_Controller");
const { protect, authorize } = require("../middleware/auth");

// Middleware to verify supervisor token
const supervisorAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ msg: "No token provided" });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "supervisor") {
      return res.status(401).json({ msg: "Not authorized as supervisor" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error("Supervisor auth middleware error:", err);
    res.status(401).json({ msg: "Token is not valid" });
  }
};

// Get supervisor dashboard data
router.get("/dashboard", supervisorAuth, async (req, res) => {
  try {
    const supervisor = req.user;

    // Get approved students
    const approvedStudents = await User.find({
      "supervisor.id": supervisor.id,
      role: "student",
    }).select("studentId name projectTitle projectStatus");

    // Get pending requests
    const pendingRequests = await SupervisorRequest.find({
      supervisorId: supervisor.id,
      status: "pending",
    })
      .populate("studentId", "studentId name projectTitle")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      supervisor: {
        supervisorId: supervisor.id,
        name: supervisor.name,
        supervisorExpertise: supervisor.supervisorExpertise,
      },
      approvedStudents,
      pendingRequests,
    });
  } catch (err) {
    console.error("Error fetching supervisor dashboard:", err);
    res.status(500).json({
      success: false,
      msg: "Error fetching supervisor dashboard data",
    });
  }
});

// Handle student request (approve/reject)
router.post(
  "/requests/:requestId/:action",
  supervisorAuth,
  async (req, res) => {
    try {
      const { requestId, action } = req.params;
      const supervisor = req.user;

      if (!["approve", "reject"].includes(action)) {
        return res.status(400).json({
          success: false,
          msg: "Invalid action",
        });
      }

      const request = await SupervisorRequest.findById(requestId);
      if (!request) {
        return res.status(404).json({
          success: false,
          msg: "Request not found",
        });
      }

      if (request.supervisorId.toString() !== supervisor.id.toString()) {
        return res.status(403).json({
          success: false,
          msg: "Not authorized to handle this request",
        });
      }

      if (request.status !== "pending") {
        return res.status(400).json({
          success: false,
          msg: "Request has already been processed",
        });
      }

      // Get student details to ensure we have project information
      const student = await User.findById(request.studentId);
      if (!student) {
        return res.status(404).json({
          success: false,
          msg: "Student not found",
        });
      }

      // Update request with project details if not already set
      if (!request.projectTitle || !request.projectDescription) {
        request.projectTitle = student.projectTitle || "Not specified";
        request.projectDescription =
          student.projectDescription || "Not specified";
      }

      // Update request status
      request.status = action === "approve" ? "approved" : "rejected";
      await request.save();

      if (action === "approve") {
        // Get supervisor details
        const supervisorDetails = await User.findById(supervisor.id);
        if (!supervisorDetails) {
          return res.status(404).json({
            success: false,
            msg: "Supervisor not found",
          });
        }

        // Update student's supervisor and project status with complete supervisor information
        await User.findByIdAndUpdate(request.studentId, {
          supervisor: {
            id: supervisor.id,
            name: supervisorDetails.name,
            department: supervisorDetails.department,
            email: supervisorDetails.email,
            contact: supervisorDetails.contact,
            supervisorId: supervisorDetails.supervisorId,
            supervisorExpertise: supervisorDetails.supervisorExpertise,
          },
          projectStatus: "Approved",
        });

        // Update supervisor's current students list
        await User.findByIdAndUpdate(supervisor.id, {
          $push: { currentGroupId: request.studentId },
        });
      }

      res.status(200).json({
        success: true,
        msg: `Request ${action}d successfully`,
      });
    } catch (err) {
      console.error("Error handling student request:", err);
      res.status(500).json({
        success: false,
        msg: "Error processing request",
      });
    }
  }
);

// Get all groups assigned to supervisor
router.get("/groups", supervisorAuth, async (req, res) => {
  try {
    const supervisorId = req.user.id;

    // Find all students who have this supervisor
    const students = await User.find({
      "supervisor.id": supervisorId,
      role: "student",
    }).select(
      "name studentId email department groupID projectTitle projectStatus _id"
    );

    // Group students by their groupID
    const groups = students.reduce((acc, student) => {
      const groupId = student.groupID;
      if (!groupId) return acc;

      if (!acc[groupId]) {
        acc[groupId] = {
          _id: groupId,
          groupId,
          students: [],
          projectTitle: student.projectTitle,
          status: student.projectStatus,
        };
      }

      acc[groupId].students.push({
        _id: student._id,
        name: student.name,
        studentId: student.studentId,
        email: student.email,
        department: student.department,
      });

      return acc;
    }, {});

    res.json({
      success: true,
      groups: Object.values(groups),
    });
  } catch (err) {
    console.error("Error fetching groups:", err);
    res.status(500).json({
      success: false,
      msg: "Error fetching groups",
    });
  }
});

// Get documents for a specific group
router.get("/groups/:groupId/documents", supervisorAuth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const supervisorId = req.user.id;

    // Verify the group belongs to this supervisor
    const groupExists = await User.findOne({
      groupID: groupId,
      "supervisor.id": supervisorId,
    });

    if (!groupExists) {
      return res.status(404).json({
        success: false,
        msg: "Group not found or not assigned to this supervisor",
      });
    }

    // Get all documents for this group
    const documents = await Document.find({
      uploadedBy: { $in: await User.find({ groupID: groupId }).select("_id") },
    }).populate("uploadedBy", "name studentId");

    res.status(200).json({
      success: true,
      documents,
    });
  } catch (err) {
    console.error("Error fetching group documents:", err);
    res.status(500).json({
      success: false,
      msg: "Error fetching documents",
    });
  }
});

// Get documents by student IDs
router.get("/documents", supervisorAuth, async (req, res) => {
  try {
    const { studentIds } = req.query;
    if (!studentIds) {
      return res.status(400).json({
        success: false,
        msg: "Student IDs are required",
      });
    }

    const studentIdArray = studentIds.split(",");
    const documents = await Document.find({
      uploadedBy: { $in: studentIdArray },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      documents,
    });
  } catch (err) {
    console.error("Error fetching documents:", err);
    res.status(500).json({
      success: false,
      msg: "Error fetching documents",
    });
  }
});

// Submit feedback for a document
router.post(
  "/documents/:documentId/feedback",
  supervisorAuth,
  async (req, res) => {
    try {
      const { documentId } = req.params;
      const { feedback } = req.body;

      if (!feedback) {
        return res.status(400).json({
          success: false,
          msg: "Feedback is required",
        });
      }

      const document = await Document.findById(documentId);
      if (!document) {
        return res.status(404).json({
          success: false,
          msg: "Document not found",
        });
      }

      document.feedback = feedback;
      document.status = "reviewed";
      await document.save();

      res.status(200).json({
        success: true,
        msg: "Feedback submitted successfully",
      });
    } catch (err) {
      console.error("Error submitting feedback:", err);
      res.status(500).json({
        success: false,
        msg: "Error submitting feedback",
      });
    }
  }
);

// Get document file
router.get("/documents/:documentId/file", async (req, res) => {
  try {
    // Get token from query parameter
    const token = req.query.token;
    if (!token) {
      return res.status(401).json({ success: false, msg: "No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || decoded.role !== "supervisor") {
      return res.status(401).json({ success: false, msg: "Invalid token" });
    }

    const document = await Document.findById(req.params.documentId);
    if (!document) {
      return res
        .status(404)
        .json({ success: false, msg: "Document not found" });
    }

    // Construct the file path relative to the uploads directory
    const filePath = path.join(__dirname, "..", "uploads", document.filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error("File not found:", filePath);
      return res.status(404).json({
        success: false,
        msg: "File not found",
        path: document.filePath,
      });
    }

    // Set appropriate headers
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", "inline");

    // Send the file
    res.sendFile(filePath);
  } catch (err) {
    console.error("Error serving document file:", err);
    res.status(500).json({
      success: false,
      msg: "Error serving document file",
      error: err.message,
    });
  }
});

// Update document status
router.put("/documents/:documentId/status", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, msg: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || decoded.role !== "supervisor") {
      return res.status(401).json({ success: false, msg: "Invalid token" });
    }

    const { status } = req.body;
    if (!["pending", "reviewed", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, msg: "Invalid status" });
    }

    const document = await Document.findById(req.params.documentId);
    if (!document) {
      return res
        .status(404)
        .json({ success: false, msg: "Document not found" });
    }

    // If status is rejected, delete the file and document
    if (status === "rejected") {
      try {
        // Delete the file from the filesystem
        const filePath = path.join(__dirname, document.filePath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        // Delete the document from database
        await Document.findByIdAndDelete(req.params.documentId);

        return res.json({
          success: true,
          msg: "Document rejected and deleted successfully",
        });
      } catch (err) {
        console.error("Error deleting rejected document:", err);
        return res.status(500).json({
          success: false,
          msg: "Error deleting rejected document",
        });
      }
    }

    // For other statuses, just update the status
    document.status = status;
    await document.save();

    res.json({ success: true, document });
  } catch (err) {
    console.error("Error updating document status:", err);
    res
      .status(500)
      .json({ success: false, msg: "Error updating document status" });
  }
});

// Get assigned students
router.get(
  "/students",
  protect,
  authorize("supervisor"),
  supervisorController.getAssignedStudents
);

// Get evaluations
router.get(
  "/evaluations",
  protect,
  authorize("supervisor"),
  supervisorController.getEvaluations
);

// Evaluate student
router.post(
  "/evaluate",
  protect,
  authorize("supervisor"),
  supervisorController.evaluateStudent
);

// Get assigned students
router.get("/assigned-students", supervisorAuth, async (req, res) => {
  try {
    // Find all students who have this supervisor assigned
    const students = await User.find({
      "supervisor.id": req.user.id,
      role: "student",
    }).select("name email studentId department");

    res.json({
      success: true,
      students,
    });
  } catch (err) {
    console.error("Error fetching assigned students:", err);
    res.status(500).json({
      success: false,
      msg: "Error fetching assigned students",
      error: err.message,
    });
  }
});

module.exports = router;
