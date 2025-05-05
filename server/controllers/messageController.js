const Message = require('../models/Message');

exports.sendMessage = async (req, res) => {
  try {
    const { to, content, documentType } = req.body;
    const from = req.user.id; // assuming you use authentication middleware
    const message = new Message({ from, to, content, documentType });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { studentId, supervisorId, documentType } = req.query;
    const messages = await Message.find({
      $or: [
        { from: studentId, to: supervisorId },
        { from: supervisorId, to: studentId }
      ],
      documentType
    }).sort({ date: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};