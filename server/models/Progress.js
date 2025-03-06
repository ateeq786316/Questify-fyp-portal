const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema({
  progressId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }, // Reference to Project model
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' }, // Reference to Student model
  supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supervisor' }, // Reference to Supervisor model
  status: { type: String },
  // Add any other progress-specific fields here
});

module.exports = mongoose.model("Progress", progressSchema);