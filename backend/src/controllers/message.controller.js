import * as service from "../services/message.service.js";
import * as validator from "../validations/message.validation.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

export const create = asyncHandler(async (req, res) => {
  const { content } = await validator.createSchema.validateAsync(req.body);
  const result = await service.create({
    leadId: req.params.id,
    senderId: req.user.id,
    content,
  });
  res.status(201).json(ApiResponse.success(result, "Message sent", 201));
});

export const list = asyncHandler(async (req, res) => {
  const q = await validator.listQuerySchema.validateAsync(req.query);
  const result = await service.list(req.params.id, q);
  res.json(ApiResponse.success(result, "Messages fetched"));
});

export const markRead = asyncHandler(async (req, res) => {
  const { readStatus } = await validator.markReadSchema.validateAsync(req.body);
  const updated = await service.markRead(req.params.messageId, readStatus);
  res.json(ApiResponse.success(updated, "Message read status updated"));
});

export const markAllRead = asyncHandler(async (req, res) => {
  const result = await service.markAllReadForLead(req.params.id);
  res.json(ApiResponse.success(result, "All messages marked as read"));
});

export const remove = asyncHandler(async (req, res) => {
  const result = await service.remove(req.params.messageId, req.user);
  res.json(ApiResponse.success(result, "Message deleted"));
});

export const editMessage = asyncHandler(async (req, res) => {
  console.log("Editing message...");
  const { error, value } = validator.editSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  const leadId = req.params.id;
  const messageId = req.params.messageId;
  const userId = req.user?.id;

  const updated = await service.editMessageService({
    leadId,
    messageId,
    userId,
    content: value.content,
  });

  // Emit Socket.IO event (kept at controller boundary)
  if (req.io) {
    req.io.to(`lead:${leadId}`).emit("messageUpdated", updated);
  }

  return res.json(new ApiResponse(200, updated, "Message updated successfully"));
});
