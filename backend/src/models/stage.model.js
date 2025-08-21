// models/stage.model.js
import mongoose from "mongoose";
import slugify from "slugify";

const StageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    // canonical key used in status string to keep backward compatibility (e.g. "new", "interview_scheduled")
    key: { type: String, required: true, unique: true, lowercase: true, trim: true },
    color: { type: String, default: "#6B7280" }, // tailwind/hex as you like
    order: { type: Number, required: true, index: 1 },
    isDefault: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser" },
    meta: { type: Object, default: {} },
  },
  { timestamps: true },
);

StageSchema.pre("validate", function (next) {
  if (!this.key && this.name) {
    this.key = slugify(this.name, { lower: true, strict: true }).replace(/-/g, "_");
  }
  next();
});

export default mongoose.models.Stage || mongoose.model("Stage", StageSchema);
