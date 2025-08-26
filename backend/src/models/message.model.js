import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminUser",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    readStatus: {
      type: Boolean,
      default: false,
    },
    editedAt: { type: Date },
  },
  { timestamps: true },
);

// Add indexes for efficient querying
messageSchema.index({ leadId: 1, timestamp: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ timestamp: 1 }); // For cleanup job

export default mongoose.model("Message", messageSchema);
