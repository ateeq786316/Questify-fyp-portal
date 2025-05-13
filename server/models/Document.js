const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fileType: {
    type: String,
    enum: ["proposal", "srs", "finalReport", "diagram", "slides"],
    required: true,
  },
  filePath: { type: String, required: true },
  title: { type: String },
  description: { type: String },
  category: { type: String },
  teamMembers: [{ type: String }],
  status: {
    type: String,
    enum: ["pending", "reviewed", "approved", "rejected"],
    default: "pending",
  },
  feedback: { type: String },
  comments: [
    {
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      message: {
        type: String,
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Document", documentSchema);
