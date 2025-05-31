const mongoose = require("mongoose");

const tempSignupSchema = new mongoose.Schema({
  rollNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/@lgu\.edu\.pk$/, "Please use a valid LGU email address"],
  },
  password: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
    trim: true,
  },
  batch: {
    type: String,
    required: true,
    trim: true,
  },
  contact: {
    type: String,
    required: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  otpExpiry: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // Document will be automatically deleted after 1 hour
  },
});

const TempSignup = mongoose.model("TempSignup", tempSignupSchema);

module.exports = TempSignup;
