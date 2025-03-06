const mongoose = require("mongoose");

const internalSchema = new mongoose.Schema({
  internalId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User model
  positionInUniversity: { type: String },
  // Add any other internal-specific fields here
});

module.exports = mongoose.model("Internal", internalSchema);