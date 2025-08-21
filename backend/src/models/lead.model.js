import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    jobDescription: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      required: true,
      enum: ["website", "referral", "linkedin", "job_board", "other"],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminUser",
    },
    status: {
      type: String,
      required: true,
      trim: true,
      default: "new",
    },
    stage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stage",
      index: true,
    },
    notes: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminUser",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Add indexes for better query performance
leadSchema.index({ status: 1 });
leadSchema.index({ source: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ createdBy: 1 });

export default mongoose.model("Lead", leadSchema);
