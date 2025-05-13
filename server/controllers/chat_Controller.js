const Conversation = require("../models/Conversation");
const User = require("../models/User");

// Get conversation between student and their supervisor
exports.getConversation = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Find the student and their supervisor
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ msg: "Student not found" });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      student: studentId,
      supervisor: student.supervisor.id,
    }).populate({
      path: "messages.sender",
      select: "name role",
    });

    if (!conversation) {
      // Create new conversation if none exists
      conversation = new Conversation({
        student: studentId,
        supervisor: student.supervisor.id,
        messages: [],
      });
      await conversation.save();
    }

    // Format messages for frontend
    const formattedMessages = conversation.messages.map((msg) => ({
      text: msg.text,
      sender: msg.sender.role === "student" ? "Student" : "Supervisor",
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

    res.status(200).json({
      success: true,
      messages: formattedMessages,
    });
  } catch (err) {
    console.error("Error fetching conversation:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Send a new message
exports.sendMessage = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { text } = req.body;
    const senderId = req.user.id; // From auth middleware

    // Find the student and their supervisor
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ msg: "Student not found" });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      student: studentId,
      supervisor: student.supervisor.id,
    });

    if (!conversation) {
      conversation = new Conversation({
        student: studentId,
        supervisor: student.supervisor.id,
        messages: [],
      });
    }

    // Add new message
    conversation.messages.push({
      sender: senderId,
      text,
      timestamp: new Date(),
    });

    // Update lastUpdated
    conversation.lastUpdated = new Date();

    await conversation.save();

    // Get sender details for response
    const sender = await User.findById(senderId).select("name role");

    // Format the new message
    const newMessage = {
      text,
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

    res.status(200).json({
      success: true,
      message: newMessage,
    });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
