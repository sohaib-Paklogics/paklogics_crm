import LeadNote from "../models/leadNote.model.js";
import { getPagination, paginate } from "../utils/pagination.js";

export async function create(leadId, userId, text) {
  return await LeadNote.create({ leadId, userId, text });
}

export async function list(leadId, query) {
  const { skip, limit, page } = getPagination(query.page, query.limit);
  const filter = { leadId };
  const [total, rows] = await Promise.all([
    LeadNote.countDocuments(filter),
    LeadNote.find(filter).populate("userId", "username email").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
  ]);
  return paginate(rows, page, limit, total);
}

export async function remove(leadId, noteId) {
  await LeadNote.deleteOne({ _id: noteId, leadId });
  return { id: noteId };
}
