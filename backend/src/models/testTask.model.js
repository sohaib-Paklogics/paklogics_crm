// models/test-task.model.js
import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
  {
    publicId: { type: String, required: true }, // Cloudinary public_id
    url: { type: String, required: true }, // secure URL
    originalFilename: { type: String },
    bytes: { type: Number },
    resourceType: { type: String }, // 'image' | 'raw' | 'video' | 'auto'
    format: { type: String },
    folder: { type: String },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser" },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const testTaskSchema = new mongoose.Schema(
  {
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["pending", "in_progress", "submitted", "reviewed", "passed", "failed", "canceled"],
      default: "pending",
      index: true,
    },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    dueDate: { type: Date },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser" },
    // review fields
    score: { type: Number, min: 0, max: 100 },
    resultNotes: { type: String },

    // NEW: attachments
    attachments: [attachmentSchema],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser", required: true },
  },
  { timestamps: true },
);

testTaskSchema.index({ leadId: 1, status: 1 });

export default mongoose.model("TestTask", testTaskSchema);
