// controllers/testTask.controller.js
import * as service from "../services/testTask.service.js";
import * as validator from "../validations/testTask.validation.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

// CREATE (supports optional file uploads via multipart/form-data)
export const create = asyncHandler(async (req, res) => {
  console.log("Creating test task with files:", req.files);
  const { leadId } = req.params;
  const payload = await validator.createSchema.validateAsync(req.body);
  const files = Array.isArray(req.files) ? req.files : req.files?.attachments || [];
  const task = await service.createTestTask(leadId, payload, req.user?.id, files);
  res.status(201).json(ApiResponse.success(task, "Test task created successfully", 201));
});

export const listAll = asyncHandler(async (req, res) => {
  const q = await validator.listQuerySchema.validateAsync(req.query);
  const data = await service.listAll(q);
  res.json(ApiResponse.success(data, "Test tasks fetched"));
});

export const listByLead = asyncHandler(async (req, res) => {
  console.log("Listing test tasks for lead:", req.params.leadId);
  const { leadId } = req.params;
  const q = await validator.listQuerySchema.validateAsync(req.query);
  const data = await service.listByLead(leadId, q);
  res.json(ApiResponse.success(data, "Lead test tasks fetched"));
});

export const getOne = asyncHandler(async (req, res) => {
  const data = await service.getTaskById(req.params.id);
  res.json(ApiResponse.success(data, "Test task fetched"));
});

// UPDATE (does NOT overwrite attachments; use dedicated endpoints below)
export const update = asyncHandler(async (req, res) => {
  const payload = await validator.updateSchema.validateAsync(req.body);
  const data = await service.updateTask(req.params.id, payload, req.user?.id);
  res.json(ApiResponse.success(data, "Test task updated"));
});

export const assign = asyncHandler(async (req, res) => {
  const { assignedTo } = await validator.assignSchema.validateAsync(req.body);
  const data = await service.assignTask(req.params.id, assignedTo, req.user?.id);
  res.json(ApiResponse.success(data, "Assignee updated"));
});

export const setStatus = asyncHandler(async (req, res) => {
  const { status } = await validator.statusSchema.validateAsync(req.body);
  const data = await service.updateStatus(req.params.id, status, req.user?.id);
  res.json(ApiResponse.success(data, "Status updated"));
});

export const review = asyncHandler(async (req, res) => {
  const payload = await validator.reviewSchema.validateAsync(req.body);
  const data = await service.reviewTask(req.params.id, payload, req.user?.id);
  res.json(ApiResponse.success(data, "Task reviewed"));
});

export const remove = asyncHandler(async (req, res) => {
  await service.deleteTask(req.params.id);
  res.json(ApiResponse.success(null, "Test task deleted"));
});

/**
 * ATTACHMENTS
 * Expect multipart/form-data with files in:
 * - req.files (array) OR req.files.attachments (multer field name 'attachments')
 */
export const addAttachments = asyncHandler(async (req, res) => {
  const files = Array.isArray(req.files) ? req.files : req.files?.attachments || [];
  if (!files.length) return res.status(400).json(ApiResponse.error("No files provided", 400));
  const data = await service.addAttachments(req.params.id, files, req.user?.id);
  res.json(ApiResponse.success(data, "Attachments added"));
});

export const removeAttachment = asyncHandler(async (req, res) => {
  const { attachmentId } = req.params; // subdoc _id
  const data = await service.removeAttachment(req.params.id, attachmentId);
  res.json(ApiResponse.success(data, "Attachment removed"));
});

export const replaceAttachment = asyncHandler(async (req, res) => {
  const { attachmentId } = req.params;
  const file = Array.isArray(req.files) ? req.files[0] : req.file || req.files?.attachment;
  if (!file) return res.status(400).json(ApiResponse.error("No file provided", 400));
  const data = await service.replaceAttachment(req.params.id, attachmentId, file, req.user?.id);
  res.json(ApiResponse.success(data, "Attachment replaced"));
});
