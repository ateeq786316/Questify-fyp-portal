const mongoose = require("mongoose");

const proposalSchema = new mongoose.Schema({
  proposalId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' }, // Reference to Student model
  supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supervisor' }, // Reference to Supervisor model
  document: { type: String }, // Assuming document is a file path or URL
  status: { type: String },
  // Add any other proposal-specific fields here
});

module.exports = mongoose.model("Proposal", proposalSchema);