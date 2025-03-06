const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  submissionId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }, // Reference to Project model
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' }, // Reference to Student model
  documentType: { type: String },
  submittedTime: { type: Date },
  status: { type: String },
  feedback: { type: String },
  // Add any other submission-specific fields here
});

module.exports = mongoose.model("Submission", submissionSchema);