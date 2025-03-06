const mongoose = require("mongoose");

const externalSchema = new mongoose.Schema({
  externalId:{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User model
  organization:{ type: String, required: true },
  position: {type: String, required: true },
  // You might want to add other relevant fields, like:
  // - Contact information (phone, address, etc.)
  // - Area of expertise or specialization
  // - Any relevant certifications or qualifications
});

module.exports = mongoose.model("External", externalSchema);