const mongoose = require("mongoose");

const proposalSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  proposalFile: { type: String, required: true }, // Path to the uploaded PDF
  plagiarismReport: { type: String, required: true }, // Path to AI report PDF
  status: {
    type: String,
    enum: ["Submitted", "Approved", "Rejected", "Pending"],
    default: "Pending",
  },
  submissionDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Proposal", proposalSchema);
