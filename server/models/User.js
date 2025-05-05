const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  //Common Fields:name, email, password, contact, role, Common fields for to all users.

  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  department: { type: String },
  contact: { type: String },
  role: {
    type: String,
    enum: ["student", "supervisor", "admin", "internal", "external"],
    required: true,
  },

  //Student Fields: name, email, password, contact, role, studentId, program, teamMembers, groupID, projectTitle, projectDescription, projectStatus, proposalStatus, startDate, endDate,

  studentId: { type: String },
  program: { type: String },
  cgpa: { type: Number },
  teamMembers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  groupID: { type: String, required: true },
  projectTitle: { type: String },
  projectDescription: { type: String },
  projectCategory: {
    type: String,
    enum: [
      "Web Development",
      "Mobile Development",
      "AI/ML",
      "Data Science",
      "Networking",
      "Cybersecurity",
      "Other",
    ],
  },
  projectStatus: {
    type: String,
    enum: ["Proposed", "In Progress", "Completed", "Rejected", "Pending"],
    default: "Pending",
  },
  proposalStatus: {
    type: String,
    enum: ["Submitted", "Approved", "Rejected", "Pending"],
    default: "Pending",
  },
  supervisor: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String },
    department: { type: String },
    email: { type: String },
  },

  //Supervisor Fields:name, email, password, contact, role, supervisorId, supervisorExpertise, currentStudents.
  supervisorId: { type: String },
  supervisorExpertise: { type: String },
  currentGroupId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  //Internal Fields:name, email, password, contact, role, internalId, internalExpertise
  internalId: { type: String },
  internalExpertise: [{ type: String }],

  //External Fields: name, email, password, contact, role, externalId, externalOrganization, externalExpertise,
  externalId: { type: String },
  externalOrganization: { type: String },
  externalPosition: { type: String },
  externalExpertise: [{ type: String }],

  //Feedback Fields: feedbackSenderId, feedbackMessage, feedbackDate, Feedback fields applicable to all users.
  feedbackSenderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to sender
  feedbackMessage: { type: String },
  feedbackDate: { type: Date, default: Date.now },

  //EndedAt: endedAt, EndedAt for project completion.
  startDate: { type: Date },
  endDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  //document upload
  //submission
  // endedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);
