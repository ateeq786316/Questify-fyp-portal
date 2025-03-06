const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  notificationId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to User model
  message: { type: String },
  // Add any other notification-specific fields here
});

module.exports = mongoose.model("Notification", notificationSchema);