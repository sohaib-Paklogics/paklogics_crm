// services/rolePermissions.service.js
import mongoose from "mongoose";
import RolePermissions from "../models/permission.model.js";
import ApiError from "../utils/ApiError.js";

const allowedRoles = ["superadmin", "admin", "business_developer", "developer"];

// normalize defaults for leadPermissions so you always have booleans
const emptyLeadPerms = {
  clientName: { view: false, edit: false },
  jobDescription: { view: false, edit: false },
  leadSource: { view: false, edit: false },
  status: { view: false, edit: false },
  assignedDeveloper: { view: false, edit: false },
  notes: { view: false, edit: false },
  attachments: { view: false, edit: false },
};

function withLeadDefaults(leadPermissions = {}) {
  const out = { ...emptyLeadPerms };
  for (const key of Object.keys(emptyLeadPerms)) {
    if (leadPermissions[key]) {
      out[key] = {
        view: !!leadPermissions[key].view,
        edit: !!leadPermissions[key].edit,
      };
    }
  }
  return out;
}

export async function listAll() {
  const docs = await RolePermissions.find({}).lean();
  return docs;
}

export async function getById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid id");
  const doc = await RolePermissions.findById(id).lean();
  if (!doc) throw new ApiError(404, "Role permissions not found");
  return doc;
}

export async function getByRole(role) {
  if (!allowedRoles.includes(role)) throw new ApiError(400, "Invalid role");
  const doc = await RolePermissions.findOne({ role }).lean();
  if (!doc) throw new ApiError(404, "Role permissions not found");
  return doc;
}

export async function create({ role, permissions = {}, leadPermissions = {} }) {
  const exists = await RolePermissions.findOne({ role });
  if (exists) throw new ApiError(409, "Role already exists");

  const doc = await RolePermissions.create({
    role,
    permissions,
    leadPermissions: withLeadDefaults(leadPermissions),
  });
  return doc;
}

export async function replace(id, { role, permissions = {}, leadPermissions = {} }) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid id");

  const doc = await RolePermissions.findByIdAndUpdate(
    id,
    { role, permissions, leadPermissions: withLeadDefaults(leadPermissions) },
    { new: true, runValidators: true },
  );

  if (!doc) throw new ApiError(404, "Role permissions not found");
  return doc;
}

export async function update(id, payload = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid id");

  // only update provided branches, keep defaults for leadPermissions
  const patch = {};
  if (payload.role) patch.role = payload.role;
  if (payload.permissions) patch.permissions = payload.permissions;
  if (payload.leadPermissions) patch.leadPermissions = withLeadDefaults(payload.leadPermissions);

  const doc = await RolePermissions.findByIdAndUpdate(id, patch, {
    new: true,
    runValidators: true,
  });

  if (!doc) throw new ApiError(404, "Role permissions not found");
  return doc;
}

export async function remove(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid id");
  const doc = await RolePermissions.findByIdAndDelete(id);
  if (!doc) throw new ApiError(404, "Role permissions not found");
  return true;
}

// Upsert by role (create if missing)
export async function upsertByRole(role, { permissions = {}, leadPermissions = {} }) {
  if (!allowedRoles.includes(role)) throw new ApiError(400, "Invalid role");
  const doc = await RolePermissions.findOneAndUpdate(
    { role },
    { role, permissions, leadPermissions: withLeadDefaults(leadPermissions) },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );
  return doc;
}
