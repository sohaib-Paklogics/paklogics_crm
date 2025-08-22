import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminUser",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    timezone: {
      type: String,
      required: true,
      default: "UTC",
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["scheduled", "in-progress", "completed", "canceled", "rescheduled"],
      default: "scheduled",
    },
  },
  {
    timestamps: true,
  },
);

// Add indexes for efficient querying
eventSchema.index({ userId: 1, startTime: 1 });
eventSchema.index({ leadId: 1 });
eventSchema.index({ status: 1 });

// Validate that endTime is after startTime
eventSchema.pre("save", function (next) {
  if (this.endTime <= this.startTime) {
    return next(new Error("End time must be after start time"));
  }
  next();
});

export default mongoose.model("Event", eventSchema);
