import leadModel from "../models/lead.model.js";
import Message from "../models/message.model.js";
import ApiError from "../utils/ApiError.js";
import { getPagination, paginate } from "../utils/pagination.js";
import mongoose from "mongoose";

export async function create({ leadId, senderId, content }) {
  return await Message.create({
    leadId: new mongoose.Types.ObjectId(leadId),
    senderId: new mongoose.Types.ObjectId(senderId),
    content,
  });
}

export async function list(leadId, query) {
  const { skip, limit, page } = getPagination(query.page, query.limit);
  const filter = { leadId: new mongoose.Types.ObjectId(leadId) };

  if (query.before || query.after) {
    filter.timestamp = {};
    if (query.before) filter.timestamp.$lt = new Date(query.before);
    if (query.after) filter.timestamp.$gt = new Date(query.after);
  }

  const sort = { timestamp: query.order === "desc" ? -1 : 1 };

  const [total, rows] = await Promise.all([
    Message.countDocuments(filter),
    Message.find(filter).populate("senderId", "username email").sort(sort).skip(skip).limit(limit).lean(),
  ]);

  return paginate(rows, page, limit, total);
}

export async function markRead(messageId, readStatus = true) {
  const updated = await Message.findByIdAndUpdate(messageId, { readStatus, updatedAt: new Date() }, { new: true });
  if (!updated) throw new ApiError(404, "Message not found");
  return updated;
}

export async function markAllReadForLead(leadId) {
  await Message.updateMany(
    { leadId: new mongoose.Types.ObjectId(leadId), readStatus: false },
    { $set: { readStatus: true } },
  );
  return { leadId, updated: true };
}

export async function remove(messageId, requester) {
  const msg = await Message.findById(messageId).lean();
  if (!msg) throw new ApiError(404, "Message not found");

  const isOwner = requester?.id?.toString() === msg.senderId?.toString();
  const isAdmin = requester?.role === "admin" || requester?.role === "superadmin";

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "Not allowed to delete this message");
  }

  await Message.deleteOne({ _id: messageId });
  return { id: messageId };
}

export async function editMessageService({
  leadId,
  messageId,
  userId,
  content,
  populateSenderFields = "username email role name",
}) {
  // 1) Ensure lead exists (cheap select)
  const lead = await leadModel.findById(leadId).select("_id");
  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  // 2) Fetch message and verify ownership & lead linkage
  const message = await Message.findById(messageId);
  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  if (String(message.leadId) !== String(leadId)) {
    throw new ApiError(400, "Message does not belong to this lead");
  }

  if (String(message.senderId) !== String(userId)) {
    throw new ApiError(403, "You are not allowed to edit this message");
  }

  // 3) Update content (+ editedAt if you have it in schema)
  message.content = content;
  // If your schema includes editedAt, this will work; otherwise remove or add the field in schema.
  // @ts-ignore
  message.editedAt = new Date();
  await message.save();

  // 4) Re-populate for response/socket
  const populated = await Message.findById(message._id).populate("senderId", populateSenderFields);

  return populated;
}
