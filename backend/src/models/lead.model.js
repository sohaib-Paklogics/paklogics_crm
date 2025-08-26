import mongoose from "mongoose";

const lifecycleStatusSchema = new mongoose.Schema(
  {
    value: {
      type: String,
      enum: ["active", "delayed", "deleted"],
      required: true,
      default: "active",
    },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser" },
    changedAt: { type: Date },
  },
  { _id: false },
);

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
      type: lifecycleStatusSchema,
      default: () => ({ value: "active" }),
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

// Indexes
leadSchema.index({ "status.value": 1 });
leadSchema.index({ source: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ createdBy: 1 });

export default mongoose.model("Lead", leadSchema);
