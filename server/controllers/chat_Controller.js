const Conversation = require("../models/Conversation");
const User = require("../models/User");

// Get conversation between student and their supervisor
exports.getConversation = async (req, res) => {
  try {
    const { studentId } = req.params;
    console.log("Getting conversation for student:", studentId);

    // Find the student
    const student = await User.findById(studentId);
    console.log(
      "Found student:",
      student
        ? {
            id: student._id,
            name: student.name,
            supervisor: student.supervisor,
          }
        : "Not found"
    );

    if (!student) {
      console.log("Student not found");
      return res.status(404).json({
        success: false,
        msg: "Student not found",
      });
    }

    // Determine supervisor ID based on user role
    let supervisorId;
    if (req.user.role === "supervisor") {
      supervisorId = req.user.id;
    } else {
      // For students, get supervisor from their document
      if (!student.supervisor || !student.supervisor.id) {
        console.log("No supervisor assigned to student");
        return res.status(200).json({
          success: true,
          messages: [],
          msg: "No supervisor assigned yet",
        });
      }
      supervisorId = student.supervisor.id;
    }

    console.log("Looking for conversation with supervisor:", supervisorId);

    // Find or create conversation
    let conversation = await Conversation.findOne({
      student: studentId,
      supervisor: supervisorId,
    }).populate({
      path: "messages.sender",
      select: "name role",
    });

    console.log(
      "Found conversation:",
      conversation
        ? {
            id: conversation._id,
            messageCount: conversation.messages.length,
          }
        : "Not found"
    );

    if (!conversation) {
      console.log("Creating new conversation");
      // Create new conversation if none exists
      conversation = new Conversation({
        student: studentId,
        supervisor: supervisorId,
        messages: [],
      });
      await conversation.save();
      console.log("New conversation created:", conversation._id);
    }

    // Format messages for frontend
    const formattedMessages = conversation.messages.map((msg) => ({
      text: msg.text,
      sender: msg.sender?.role === "student" ? "Student" : "Supervisor",
      timestamp: msg.timestamp.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: msg.timestamp.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    }));

    console.log("Sending formatted messages:", formattedMessages.length);

    res.status(200).json({
      success: true,
      messages: formattedMessages,
    });
  } catch (err) {
    console.error("Error fetching conversation:", err);
    res.status(500).json({
      success: false,
      msg: "Server error",
      error: err.message,
    });
  }
};

// Send a new message
exports.sendMessage = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { text, receiverId } = req.body;
    const senderId = req.user.id; // From auth middleware

    console.log("Sending message:", {
      studentId,
      senderId,
      receiverId,
      text: text?.substring(0, 50) + (text?.length > 50 ? "..." : ""),
    });

    if (!text || text.trim() === "") {
      console.log("Empty message text");
      return res.status(400).json({
        success: false,
        msg: "Message text is required",
      });
    }

    // Find the student
    const student = await User.findById(studentId);
    console.log(
      "Found student:",
      student
        ? {
            id: student._id,
            name: student.name,
            supervisor: student.supervisor,
          }
        : "Not found"
    );

    if (!student) {
      console.log("Student not found");
      return res.status(404).json({
        success: false,
        msg: "Student not found",
      });
    }

    // Determine supervisor ID based on user role
    let supervisorId;
    if (req.user.role === "supervisor") {
      // If sender is supervisor, use their ID
      supervisorId = req.user.id;
    } else {
      // For students, use the receiverId (supervisor's ID)
      if (!receiverId) {
        console.log("No receiverId provided");
        return res.status(400).json({
          success: false,
          msg: "Cannot send message: No supervisor ID provided",
        });
      }
      supervisorId = receiverId;
    }

    console.log("Looking for conversation with supervisor:", supervisorId);

    // Find or create conversation
    let conversation = await Conversation.findOne({
      student: studentId,
      supervisor: supervisorId,
    });

    console.log(
      "Found conversation:",
      conversation
        ? {
            id: conversation._id,
            messageCount: conversation.messages.length,
          }
        : "Not found"
    );

    if (!conversation) {
      console.log("Creating new conversation");
      conversation = new Conversation({
        student: studentId,
        supervisor: supervisorId,
        messages: [],
      });
    }

    // Add new message
    conversation.messages.push({
      sender: senderId,
      text: text.trim(),
      timestamp: new Date(),
    });

    // Update lastUpdated
    conversation.lastUpdated = new Date();

    await conversation.save();
    console.log("Message saved to conversation:", conversation._id);

    // Get sender details for response
    const sender = await User.findById(senderId).select("name role");
    console.log(
      "Found sender:",
      sender
        ? {
            id: sender._id,
            name: sender.name,
            role: sender.role,
          }
        : "Not found"
    );

    if (!sender) {
      console.log("Sender not found");
      return res.status(404).json({
        success: false,
        msg: "Sender not found",
      });
    }

    // Format the new message
    const newMessage = {
      text: text.trim(),
      sender: sender.role === "student" ? "Student" : "Supervisor",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    };

    console.log("Sending response with new message");

    res.status(200).json({
      success: true,
      message: newMessage,
    });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({
      success: false,
      msg: "Server error",
      error: err.message,
    });
  }
};
