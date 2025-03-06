const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fileType: { type: String, enum: ["proposal","srs","systemdiagram", "report", "diagram", "slides"], required: true },
  filePath: { type: String, required: true },
  status: { type: String, enum: ["pending", "reviewed", "approved"], default: "pending" },
  feedback: { type: String },
});

module.exports = mongoose.model("Document", documentSchema);
