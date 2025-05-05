const mongoose = require("mongoose");

const milestoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Milestone name is required"],
      trim: true,
      unique: true,
    },
    deadline: {
      type: Date,
      default: null,
      validate: {
        validator: function (v) {
          return v === null || v instanceof Date;
        },
        message: "Deadline must be a valid date",
      },
    },
    order: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["pending", "active", "completed"],
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
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

// Pre-save middleware to set order if not provided
milestoneSchema.pre("save", async function (next) {
  if (!this.order) {
    const maxOrder = await this.constructor
      .findOne()
      .sort("-order")
      .select("order");
    this.order = maxOrder ? maxOrder.order + 1 : 1;
  }
  next();
});

module.exports = mongoose.model("Milestone", milestoneSchema);
