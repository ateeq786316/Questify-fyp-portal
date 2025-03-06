const mongoose = require("mongoose");

const supervisorSchema = new mongoose.Schema({
  supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User model
  contact: { type: String },
  expertise: { type: String },
  currentStudent: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' }, // Reference to Student model
  // Add any other supervisor-specific fields here
});

module.exports = mongoose.model("Supervisor", supervisorSchema);