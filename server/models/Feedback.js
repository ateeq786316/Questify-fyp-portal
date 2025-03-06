const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  feedbackId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
  submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission' }, // Reference to Submission model
  progressId: { type: mongoose.Schema.Types.ObjectId, ref: 'Progress' }, // Reference to Progress model
  supervisorFeedback: { type: String },
  // Add any other feedback-specific fields here
});

module.exports = mongoose.model("Feedback", feedbackSchema);