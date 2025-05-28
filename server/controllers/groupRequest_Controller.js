const GroupRequest = require("../models/GroupRequest");
const User = require("../models/User");

// Get all group requests for a student
exports.getGroupRequests = async (req, res) => {
  try {
    const studentId = req.user.id;

    const requests = await GroupRequest.find({ to: studentId })
      .populate("from", "name email studentId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      requests,
    });
  } catch (err) {
    console.error("Error fetching group requests:", err);
    res.status(500).json({
      success: false,
      msg: "Server error",
      error: err.message,
    });
  }
};

// Send a group request
exports.sendGroupRequest = async (req, res) => {
  try {
    const { toEmail } = req.body;
    const fromId = req.user.id;

    // Find the target student
    const toStudent = await User.findOne({ email: toEmail, role: "student" });
    if (!toStudent) {
      return res.status(404).json({
        success: false,
        msg: "Student not found",
      });
    }

    // Check if request already exists
    const existingRequest = await GroupRequest.findOne({
      from: fromId,
      to: toStudent._id,
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        msg: "Request already sent",
      });
    }

    // Create new request
    const request = new GroupRequest({
      from: fromId,
      to: toStudent._id,
    });

    await request.save();

    res.status(201).json({
      success: true,
      msg: "Group request sent successfully",
      request,
    });
  } catch (err) {
    console.error("Error sending group request:", err);
    res.status(500).json({
      success: false,
      msg: "Server error",
      error: err.message,
    });
  }
};

// Approve a group request
exports.approveGroupRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const studentId = req.user.id;

    // Find the request
    const request = await GroupRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        msg: "Request not found",
      });
    }

    // Verify the request is for this student
    if (request.to.toString() !== studentId) {
      return res.status(403).json({
        success: false,
        msg: "Not authorized to approve this request",
      });
    }

    // Update request status
    request.status = "approved";
    await request.save();

    // Update both students' group information
    const [fromStudent, toStudent] = await Promise.all([
      User.findById(request.from),
      User.findById(request.to),
    ]);

    // Generate a unique group ID
    const groupId = `GROUP_${Date.now()}`;

    // Update both students with the same group ID
    await Promise.all([
      User.findByIdAndUpdate(request.from, {
        groupID: groupId,
        teamMembers: [request.to],
      }),
      User.findByIdAndUpdate(request.to, {
        groupID: groupId,
        teamMembers: [request.from],
      }),
    ]);

    res.status(200).json({
      success: true,
      msg: "Group request approved successfully",
      request,
    });
  } catch (err) {
    console.error("Error approving group request:", err);
    res.status(500).json({
      success: false,
      msg: "Server error",
      error: err.message,
    });
  }
};

// Reject a group request
exports.rejectGroupRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const studentId = req.user.id;

    const request = await GroupRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        msg: "Request not found",
      });
    }

    if (request.to.toString() !== studentId) {
      return res.status(403).json({
        success: false,
        msg: "Not authorized to reject this request",
      });
    }

    request.status = "rejected";
    await request.save();

    res.status(200).json({
      success: true,
      msg: "Group request rejected successfully",
      request,
    });
  } catch (err) {
    console.error("Error rejecting group request:", err);
    res.status(500).json({
      success: false,
      msg: "Server error",
      error: err.message,
    });
  }
};
