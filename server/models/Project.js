const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' }, // Reference to Student model
  supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supervisor' }, // Reference to Supervisor model

  title: { type: String, required: true },
  description: { type: String, required: true },
  domain: { type: String, required: true },
  teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  supervisor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["pending", "approved", "in-progress", "completed"], default: "pending" },
  submissionDate: { type: Date },
  documents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Document" }],
  feedback: [{ type: String }],

});

module.exports = mongoose.model("Project", projectSchema);
