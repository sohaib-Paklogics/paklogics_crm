import Event from "../models/event.model.js";
import { getPagination, paginate } from "../utils/pagination.js";

export async function create(leadId, userId, payload) {
  return await Event.create({ ...payload, leadId, userId });
}

export async function list(leadId, query) {
  const { skip, limit, page } = getPagination(query.page, query.limit);
  const filter = { leadId };

  if (query.from || query.to) {
    filter.startTime = {};
    if (query.from) filter.startTime.$gte = new Date(query.from);
    if (query.to) filter.startTime.$lte = new Date(query.to);
  }

  if (query.search) {
    const regex = new RegExp(query.search, "i");
    filter.$or = [{ title: regex }, { description: regex }];
  }

  const [total, rows] = await Promise.all([
    Event.countDocuments(filter),
    Event.find(filter).populate("userId", "username email").sort({ startTime: 1 }).skip(skip).limit(limit).lean(),
  ]);
  return paginate(rows, page, limit, total);
}

export async function remove(eventId) {
  await Event.deleteOne({ _id: eventId });
  return { id: eventId };
}
