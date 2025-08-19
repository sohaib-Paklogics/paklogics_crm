import Lead from "../models/lead.model.js";
import ApiError from "../utils/ApiError.js";
import { getPagination, paginate, buildFilter } from "../utils/pagination.js";
import mongoose from "mongoose";

const SEARCHABLE = ["clientName", "jobDescription"]; // used in buildFilter

// Build domain-specific filter using your helper and extra fields
function buildLeadFilter(q) {
  const filter = buildFilter(q, SEARCHABLE);

  if (q.source) filter.source = q.source;
  if (q.assignedTo) filter.assignedTo = new mongoose.Types.ObjectId(q.assignedTo);
  if (q.createdBy) filter.createdBy = new mongoose.Types.ObjectId(q.createdBy);

  if (q.dateFrom || q.dateTo) {
    filter.createdAt = {};
    if (q.dateFrom) filter.createdAt.$gte = new Date(q.dateFrom);
    if (q.dateTo) filter.createdAt.$lte = new Date(q.dateTo);
  }

  return filter;
}

export async function createLead(data) {
  const doc = await Lead.create(data);
  return doc;
}

export async function getLeads(query) {
  const { skip, limit, page } = getPagination(query.page, query.limit);
  const filter = buildLeadFilter(query);

  const sort = { [query.sort || "createdAt"]: query.order === "asc" ? 1 : -1 };

  const [total, rows] = await Promise.all([
    Lead.countDocuments(filter),
    Lead.find(filter)
      .populate("assignedTo", "username email role status")
      .populate("createdBy", "username email")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  return paginate(rows, page, limit, total);
}

export async function getLeadById(id) {
  const lead = await Lead.findById(id)
    .populate("assignedTo", "username email role status")
    .populate("createdBy", "username email")
    .lean();
  if (!lead || lead.deletedAt) throw new ApiError(404, "Lead not found");
  return lead;
}

export async function updateLead(id, data) {
  const updated = await Lead.findOneAndUpdate({ _id: id, deletedAt: { $exists: false } }, data, { new: true });
  if (!updated) throw new ApiError(404, "Lead not found");
  return updated;
}

export async function deleteLead(id) {
  // Soft delete: align with buildFilter (which excludes deletedAt exists)
  const deleted = await Lead.findOneAndUpdate(
    { _id: id, deletedAt: { $exists: false } },
    { deletedAt: new Date() },
    { new: true },
  );
  if (!deleted) throw new ApiError(404, "Lead not found");
  return { id, deletedAt: deleted.deletedAt };
}

export async function assignLead(id, assignedTo) {
  const payload = { assignedTo };
  const updated = await Lead.findOneAndUpdate({ _id: id, deletedAt: { $exists: false } }, payload, { new: true });
  if (!updated) throw new ApiError(404, "Lead not found");
  return updated;
}

const ALLOWED_STATUS = ["new", "interview_scheduled", "test_assigned", "completed"];
const ALLOWED_TRANSITIONS = {
  new: ["interview_scheduled"],
  interview_scheduled: ["test_assigned", "new"], // allow moving back
  test_assigned: ["completed", "interview_scheduled"],
  completed: [], // terminal
};

export async function changeStatus(id, status) {
  if (!ALLOWED_STATUS.includes(status)) {
    throw new ApiError(400, "Invalid status value");
  }

  const lead = await Lead.findOne({ _id: id, deletedAt: { $exists: false } });
  if (!lead) throw new ApiError(404, "Lead not found");

  // Guard transitions
  const nexts = ALLOWED_TRANSITIONS[lead.status] || [];
  if (!nexts.includes(status)) {
    // You can loosen this if you want free-form board moves:
    throw new ApiError(400, `Illegal transition: ${lead.status} -> ${status}`);
  }

  lead.status = status;
  await lead.save();
  return lead;
}

export async function summaryStats() {
  const [byStatus, bySource, total] = await Promise.all([
    Lead.aggregate([{ $match: { deletedAt: { $exists: false } } }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
    Lead.aggregate([{ $match: { deletedAt: { $exists: false } } }, { $group: { _id: "$source", count: { $sum: 1 } } }]),
    Lead.countDocuments({ deletedAt: { $exists: false } }),
  ]);

  return { total, byStatus, bySource };
}
