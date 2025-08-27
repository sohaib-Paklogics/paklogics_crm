import Event from "../models/event.model.js";
import leadModel from "../models/lead.model.js";
import { getPagination, paginate } from "../utils/pagination.js";

export async function create(leadId, userId, payload) {
  return await Event.create({ ...payload, leadId, userId });
}

function getDateFilter(query) {
  if (!query.from && !query.to) return {};
  const range = {};
  if (query.from) range.$gte = new Date(query.from);
  if (query.to) range.$lte = new Date(query.to);
  return { startTime: range };
}

function getSearchFilter(query) {
  if (!query.search) return {};
  const regex = new RegExp(query.search, "i");
  return { $or: [{ title: regex }, { description: regex }] };
}

function role(user) {
  const r = String(user?.role || "").toLowerCase();
  return {
    isDev: r === "developer",
    full: r === "admin" || r === "superadmin" || r === "business_developer",
  };
}

/**
 * Get all leadIds that a developer is allowed to see (Lead.assignedTo = user._id)
 */
async function getDeveloperLeadIds(userId) {
  const rows = await leadModel.find({ assignedTo: userId }).select("_id").lean();
  return rows.map((r) => r._id);
}

export async function list(leadId, query, user) {
  const { skip, limit, page } = getPagination(query.page, query.limit);

  const { isDev, full } = role(user);
  console.log(isDev, full);
  // If developer, ensure the requested leadId is assigned to them
  if (isDev) {
    const allowed = await leadModel.exists({ _id: leadId, assignedTo: user._id });
    if (!allowed) {
      // Return an empty page (or throw 403 if you prefer)
      return paginate([], page, limit, 0);
    }
  }

  const filter = {
    leadId,
    ...getDateFilter(query),
    ...getSearchFilter(query),
  };

  const [total, rows] = await Promise.all([
    Event.countDocuments(filter),
    Event.find(filter).populate("userId", "username email").sort({ startTime: 1 }).skip(skip).limit(limit).lean(),
  ]);

  return paginate(rows, page, limit, total);
}

export async function listAll(query, user) {
  const { skip, limit, page } = getPagination(query.page, query.limit);

  const { isDev, full } = role(user);
  console.log(isDev, full);

  const filter = {
    ...getDateFilter(query),
    ...getSearchFilter(query),
  };

  if (isDev) {
    // Limit by leads assigned to this developer
    const leadIds = await getDeveloperLeadIds(user._id);
    if (!leadIds.length) {
      return paginate([], page, limit, 0);
    }
    filter.leadId = { $in: leadIds };
  }
  // admins/BDs get all events -> no extra leadId filter

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
