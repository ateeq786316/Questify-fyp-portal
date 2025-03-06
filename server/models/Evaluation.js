const mongoose = require("mongoose");

const evaluationSchema = new mongoose.Schema({
  evaluationId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }, // Reference to Project model
  evaluationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' }, // Reference to Student model
  score: { type: Number },
  comments: { type: String },
  // Add any other evaluation-specific fields here
});

module.exports = mongoose.model("Evaluation", evaluationSchema);