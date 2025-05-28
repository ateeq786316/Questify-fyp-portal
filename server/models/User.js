const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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
  groupID: {
    type: String,
  },
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
  supervisorExpertise: [{ type: String }],
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
  feedbackMessage: {
    type: String,
    default: null,
  },
  feedbackDate: {
    type: Date,
    default: null,
  },

  //EndedAt: endedAt, EndedAt for project completion.
  startDate: { type: Date },
  endDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  //document upload
  //submission
  // endedAt: { type: Date, default: Date.now }
});

// Add method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    // First try direct comparison (for plain text passwords)
    if (this.password === candidatePassword) {
      return true;
    }

    // If direct comparison fails, try bcrypt comparison (for hashed passwords)
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    console.error("Password comparison error:", err);
    return false;
  }
};

// Pre-save middleware to hash password if it's not already hashed
userSchema.pre("save", async function (next) {
  try {
    // Only hash the password if it's modified (or new) and not already hashed
    if (!this.isModified("password")) return next();

    // Check if password is already hashed (bcrypt hashes start with $2)
    if (this.password.startsWith("$2")) return next();

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Add email format validation for student and supervisor roles
userSchema.pre("save", function (next) {
  if (this.role === "student" || this.role === "supervisor") {
    const emailRegex = /@lgu\.edu\.pk$/;
    if (!emailRegex.test(this.email)) {
      const error = new Error(
        "Invalid email domain. Only @lgu.edu.pk emails are allowed for this role."
      );
      error.name = "ValidationError"; // Use ValidationError name for consistency
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
