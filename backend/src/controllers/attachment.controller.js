import * as service from "../services/attachment.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import * as v from "../validations/attachment.validation.js";

export const upload = asyncHandler(async (req, res) => {
  const leadId = req.params.id;
  const result = await service.uploadAttachment({ leadId, file: req.file, uploadedBy: req.user.id });
  res.status(201).json(ApiResponse.success(result, "Attachment uploaded", 201));
});

export const list = asyncHandler(async (req, res) => {
  const leadId = req.params.id;
  const q = await v.listQuery.validateAsync(req.query);
  const result = await service.listAttachments(leadId, q);
  res.json(ApiResponse.success(result, "Attachments fetched"));
});

export const remove = asyncHandler(async (req, res) => {
  const { attachmentId } = await v.deleteSchema.validateAsync({ attachmentId: req.params.attachmentId });
  const result = await service.deleteAttachment(attachmentId);
  res.json(ApiResponse.success(result, "Attachment deleted"));
});
