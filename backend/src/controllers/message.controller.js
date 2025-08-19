import * as service from "../services/message.service.js";
import * as validator from "../validations/message.validation.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

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
