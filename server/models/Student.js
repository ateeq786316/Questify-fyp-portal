const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User model
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }, // Reference to Project model
  supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supervisor' }, // Reference to Supervisor model
  // Add any other student-specific fields here
});

module.exports = mongoose.model("Student", studentSchema);