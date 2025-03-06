const mongoose = require("mongoose");

const bigdataSchema = new mongoose.Schema({
  // User Data
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "supervisor", "admin", "internal", "external"], required: true },
  department: { type: String },
  program: { type: String },
  contact: { type: String },
  groupID: { type: String, required: true },
  projectTitle: { type: String, required: true },

  // Student Data
  studentId: { type: String },
  batch: { type: String },
  cgpa: { type: Number },
  skills: [{ type: String }],
  interests: [{ type: String }],

  // Project Data
  projectDescription: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  projectStatus: { type: String, enum: ["Proposed", "In Progress", "Completed", "Rejected", "Pending"] },

  // Proposal Data
  proposalTitle: { type: String },
  proposalDescription: { type: String },
  proposalSubmissionDate: { type: Date },
  proposalStatus: { type: String, enum: ["Submitted", "Approved", "Rejected", "Pending"] },

  // Submission Data
  submissionTitle: { type: String },
  submissionDescription: { type: String },
  submissionDate: { type: Date },
  submissionFileUrl: { type: String },

  // Progress Data
  progressDate: { type: Date },
  progressDescription: { type: String },
  progressPercentage: { type: Number },

  // Feedback Data
  feedbackSenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to sender
  feedbackMessage: { type: String },
  feedbackDate: { type: Date },

  // Meeting Data
  meetingDate: { type: Date },
  meetingLocation: { type: String },
  meetingAgenda: { type: String },

  // Evaluation Data
  evaluationEvaluatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to evaluator
  evaluationCriteria: { type: String },
  evaluationMarks: { type: Number },
  evaluationComments: { type: String },

  // Notification Data
  notificationMessage: { type: String },
  notificationDate: { type: Date },
  notificationRead: { type: Boolean, default: false },

  // Supervisor Data
  supervisorId: { type: String },
  supervisorExpertise: [{ type: String }],

  // Internal Data
  internalId: { type: String },
  internalExpertise: [{ type: String }],

  // External Data
  externalId: { type: String },
  externalOrganization: { type: String },
  externalExpertise: [{ type: String }],

  // Document Data (Assuming this is a general file upload model)
  documentTitle: { type: String },
  documentDescription: { type: String },
  documentFileUrl: { type: String },
  documentUploadDate: { type: Date },

  // Timestamps for creation and updates
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("bigdata", bigdataSchema); 