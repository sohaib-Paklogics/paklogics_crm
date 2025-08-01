// models/RolePermissions.js
import mongoose from "mongoose";

const RolePermissionsSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["superadmin", "admin", "business_developer", "developer"],
    required: true,
    unique: true,
  },
  permissions: {
    type: Map,
    of: [String], // e.g. leads: ["create", "read"]
    default: {},
  },
  leadPermissions: {
    clientName: { view: Boolean, edit: Boolean },
    jobDescription: { view: Boolean, edit: Boolean },
    leadSource: { view: Boolean, edit: Boolean },
    status: { view: Boolean, edit: Boolean },
    assignedDeveloper: { view: Boolean, edit: Boolean },
    notes: { view: Boolean, edit: Boolean },
    attachments: { view: Boolean, edit: Boolean },
  },
});

export default mongoose.models.RolePermissions || mongoose.model("RolePermissions", RolePermissionsSchema);
