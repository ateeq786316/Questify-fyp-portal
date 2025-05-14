const mongoose = require("mongoose");

const evaluationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    externalExaminer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    supervisorMarks: {
      marks: {
        type: Number,
        min: 0,
        max: 100,
      },
      feedback: String,
      evaluatedAt: Date,
    },
    internalMarks: {
      marks: {
        type: Number,
        min: 0,
        max: 100,
      },
      feedback: String,
      evaluatedAt: Date,
    },
    externalMarks: {
      marks: {
        type: Number,
        min: 0,
        max: 100,
      },
      feedback: String,
      evaluatedAt: Date,
    },
    status: {
      type: String,
      enum: ["pending", "evaluated"],
      default: "pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure the model is not already registered
const Evaluation =
  mongoose.models.Evaluation || mongoose.model("Evaluation", evaluationSchema);

module.exports = Evaluation;
