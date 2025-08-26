import Lead from "../models/lead.model.js";
import ApiError from "../utils/ApiError.js";
import { getPagination, paginate, buildFilter } from "../utils/pagination.js";

export async function createLead(data) {
  // Defensive default (works even if model default exists, but helps older docs/tests)
  if (!data.status) {
    data.status = { value: "active" };
    data.status.changedBy = data.createdBy;
    data.status.changedAt = new Date();
  }
  const doc = await Lead.create(data);
  return doc;
}

export async function getLeads(query) {
  const { skip, limit, page } = getPagination(query.page, query.limit);
  console.log("query", query);
  const filter = buildFilter(query);
  console.log("filter", filter);
  const sort = { [query.sort || "createdAt"]: query.order === "asc" ? 1 : -1 };

  const [total, rows] = await Promise.all([
    Lead.countDocuments(filter),
    Lead.find(filter)
      .populate("assignedTo", "username email role status")
      .populate("createdBy", "username email")
      .populate("stage", "name color")
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
    .populate("stage", "name color")
    .lean();
  if (!lead || lead.deletedAt) throw new ApiError(404, "Lead not found");
  return lead;
}

export async function updateLead(id, data) {
  // Do NOT allow direct lifecycle writes here if your validator forbids it
  if ("status" in data) {
    delete data.status;
  }

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

export async function changeStage(id, status) {
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

// services/lead.service.js
export async function updateLeadStatus(id, newStatus, userId) {
  if (!["new", "active", "delayed", "completed", "deleted"].includes(newStatus)) {
    throw new ApiError(400, "Invalid status");
  }

  const lead = await Lead.findByIdAndUpdate(
    id,
    {
      status: {
        value: newStatus,
        changedBy: userId,
        changedAt: new Date(),
      },
    },
    { new: true },
  ).populate("assignedTo createdBy status.changedBy", "username email");

  if (!lead) throw new ApiError(404, "Lead not found");
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
