// services/testTask.service.js
import mongoose from "mongoose";
import TestTask from "../models/testTask.model.js";
import Lead from "../models/lead.model.js";
import ApiError from "../utils/ApiError.js";
import { getPagination, paginate } from "../utils/pagination.js";
import cloudinary, { streamUpload } from "../utils/cloudinary.js"; // adjust path if different

// Map Cloudinary result -> attachment subdoc
function toAttachment(result, uploadedBy) {
  return {
    publicId: result.public_id,
    url: result.secure_url,
    originalFilename: result.original_filename,
    bytes: result.bytes,
    resourceType: result.resource_type,
    format: result.format,
    folder: result.folder,
    uploadedBy,
    uploadedAt: new Date(),
  };
}

async function uploadMany(files = [], folder, uploadedBy) {
  if (!files?.length) return [];
  const uploads = await Promise.all(files.map((f) => streamUpload(f.buffer, folder)));
  return uploads.map((r) => toAttachment(r, uploadedBy));
}

export async function createTestTask(leadId, payload, userId, files = []) {
  if (!mongoose.Types.ObjectId.isValid(leadId)) {
    throw new ApiError(400, "Invalid lead id");
  }

  const lead = await Lead.findById(leadId);
  if (!lead) throw new ApiError(404, "Lead not found");

  // optional file uploads
  const folder = `crm/testTasks/${leadId}`;
  const newAttachments = await uploadMany(files, folder, userId);

  // prevent attachments from body from overwriting; we only take uploaded ones here
  const { attachments: _ignore, ...rest } = payload || {};

  const task = await TestTask.create({
    ...rest,
    leadId,
    createdBy: userId,
    attachments: newAttachments,
  });

  await Lead.findByIdAndUpdate(leadId, { $inc: { testTasksCount: 1 } });
  return getTaskById(task._id); // return populated
}

export async function getTaskById(id) {
  const task = await TestTask.findById(id)
    .populate("leadId", "clientName stage status")
    .populate("assignedTo", "username email role")
    .populate("createdBy", "username email")
    .populate("attachments.uploadedBy", "username email") // NEW
    .lean();

  if (!task) throw new ApiError(404, "Test task not found");
  return task;
}

export async function listAll(query) {
  const filter = buildFilter(query);
  const { skip, limit, page } = getPagination(query.page, query.limit);

  const total = await TestTask.countDocuments(filter);
  const docs = await TestTask.find(filter)
    .sort({ [query.sort || "createdAt"]: query.order === "asc" ? 1 : -1 })
    .skip(skip)
    .limit(limit)
    .populate("leadId", "clientName stage status")
    .populate("assignedTo", "username email role")
    .populate("attachments.uploadedBy", "username email")
    .lean();

  return paginate(docs, page, limit, total);
}

export async function listByLead(leadId, query) {
  if (!mongoose.Types.ObjectId.isValid(leadId)) {
    throw new ApiError(400, "Invalid lead id");
  }

  const baseFilter = { leadId };
  const extra = buildFilter(query, true);
  const filter = { ...baseFilter, ...extra };

  const { skip, limit, page } = getPagination(query.page, query.limit);
  const total = await TestTask.countDocuments(filter);
  const docs = await TestTask.find(filter)
    .sort({ [query.sort || "createdAt"]: query.order === "asc" ? 1 : -1 })
    .skip(skip)
    .limit(limit)
    .populate("assignedTo", "username email role")
    .populate("attachments.uploadedBy", "username email")
    .lean();

  return paginate(docs, page, limit, total);
}

export async function updateTask(id, payload, userId) {
  // Never let a raw update overwrite attachments
  const { attachments: _ignore, ...rest } = payload || {};
  const task = await TestTask.findByIdAndUpdate(id, { ...rest, updatedBy: userId }, { new: true })
    .populate("leadId", "clientName stage status")
    .populate("assignedTo", "username email role")
    .populate("attachments.uploadedBy", "username email");

  if (!task) throw new ApiError(404, "Test task not found");
  return task;
}

export async function assignTask(id, assignedTo, userId) {
  const task = await TestTask.findByIdAndUpdate(
    id,
    { assignedTo: assignedTo || null, updatedBy: userId },
    { new: true },
  )
    .populate("leadId", "clientName")
    .populate("assignedTo", "username email role")
    .populate("attachments.uploadedBy", "username email");

  if (!task) throw new ApiError(404, "Test task not found");
  return task;
}

export async function updateStatus(id, status, userId) {
  const patch = { status, updatedBy: userId };
  if (status === "submitted") patch.submittedAt = new Date();
  if (["reviewed", "passed", "failed"].includes(status)) patch.reviewedAt = new Date();

  const task = await TestTask.findByIdAndUpdate(id, patch, { new: true })
    .populate("leadId", "clientName")
    .populate("assignedTo", "username email role")
    .populate("attachments.uploadedBy", "username email");

  if (!task) throw new ApiError(404, "Test task not found");
  return task;
}

export async function reviewTask(id, { score, resultNotes, status }, userId) {
  const patch = {
    updatedBy: userId,
    reviewedAt: new Date(),
  };
  if (typeof score === "number") patch.score = score;
  if (typeof resultNotes === "string") patch.resultNotes = resultNotes;
  patch.status = status || "reviewed";

  const task = await TestTask.findByIdAndUpdate(id, patch, { new: true })
    .populate("leadId", "clientName")
    .populate("assignedTo", "username email role")
    .populate("attachments.uploadedBy", "username email");

  if (!task) throw new ApiError(404, "Test task not found");
  return task;
}

export async function deleteTask(id) {
  const task = await TestTask.findById(id);
  if (!task) throw new ApiError(404, "Test task not found");

  // Best-effort Cloudinary cleanup
  const destroyOps = (task.attachments || []).map((a) => cloudinary.uploader.destroy(a.publicId).catch(() => null));
  await Promise.all(destroyOps);

  await TestTask.findByIdAndDelete(id);
  await Lead.findByIdAndUpdate(task.leadId, { $inc: { testTasksCount: -1 } });

  return true;
}

/**
 * ATTACHMENTS SERVICES
 */

// Add multiple files
export async function addAttachments(taskId, files = [], userId) {
  const task = await TestTask.findById(taskId);
  if (!task) throw new ApiError(404, "Test task not found");

  const folder = `crm/testTasks/${task.leadId}`;
  const newAttachments = await uploadMany(files, folder, userId);

  task.attachments.push(...newAttachments);
  task.updatedBy = userId;
  await task.save();

  return getTaskById(task._id);
}

// Remove a single attachment (and delete from Cloudinary)
export async function removeAttachment(taskId, attachmentId) {
  const task = await TestTask.findById(taskId);
  if (!task) throw new ApiError(404, "Test task not found");

  const att = task.attachments.id(attachmentId);
  if (!att) throw new ApiError(404, "Attachment not found");

  await cloudinary.uploader.destroy(att.publicId).catch(() => null);
  att.remove(); // subdoc remove
  await task.save();

  return getTaskById(task._id);
}

// Replace one attachment (destroy old, upload new)
export async function replaceAttachment(taskId, attachmentId, file, userId) {
  const task = await TestTask.findById(taskId);
  if (!task) throw new ApiError(404, "Test task not found");

  const att = task.attachments.id(attachmentId);
  if (!att) throw new ApiError(404, "Attachment not found");

  // destroy old
  await cloudinary.uploader.destroy(att.publicId).catch(() => null);

  // upload new
  const folder = `crm/testTasks/${task.leadId}`;
  const uploaded = await streamUpload(file.buffer, folder);
  const newAtt = toAttachment(uploaded, userId);

  // mutate subdoc fields
  att.set(newAtt);
  task.updatedBy = userId;
  await task.save();

  return getTaskById(task._id);
}

// helpers (unchanged + keep your custom stage mover)
function buildFilter(q = {}, omitSearch = false) {
  const filter = {};

  if (!omitSearch && q.search) {
    filter.$or = [{ title: { $regex: q.search, $options: "i" } }, { description: { $regex: q.search, $options: "i" } }];
  }
  if (q.status && q.status !== "all") filter.status = q.status;
  if (q.priority) filter.priority = q.priority;
  if (q.assignedTo) filter.assignedTo = q.assignedTo;

  if (q.dateFrom || q.dateTo) {
    filter.createdAt = {};
    if (q.dateFrom) filter.createdAt.$gte = new Date(q.dateFrom);
    if (q.dateTo) filter.createdAt.$lte = new Date(q.dateTo);
  }

  if (q.dueBefore || q.dueAfter) {
    filter.dueDate = {};
    if (q.dueAfter) filter.dueDate.$gte = new Date(q.dueAfter);
    if (q.dueBefore) filter.dueDate.$lte = new Date(q.dueBefore);
  }

  return filter;
}

export async function moveTaskToStage(id, toStageId, userId) {
  if (!mongoose.Types.ObjectId.isValid(toStageId)) {
    throw new ApiError(400, "Invalid stage id");
  }

  const task = await TestTask.findByIdAndUpdate(id, { stage: toStageId, updatedBy: userId }, { new: true })
    .populate("leadId", "clientName stage status")
    .populate("assignedTo", "username email role")
    .populate("attachments.uploadedBy", "username email");

  if (!task) throw new ApiError(404, "Test task not found");
  return task;
}
