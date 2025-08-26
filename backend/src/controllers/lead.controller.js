import * as service from "../services/lead.service.js";
import * as validator from "../validations/lead.validation.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

export const create = asyncHandler(async (req, res) => {
  const payload = await validator.createSchema.validateAsync(req.body);
  const data = { ...payload, createdBy: req.user._id };
  const result = await service.createLead(data);
  res.status(201).json(ApiResponse.success(result, "Lead created", 201));
});

export const list = asyncHandler(async (req, res) => {
  const q = await validator.listQuerySchema.validateAsync(req.query);
  const result = await service.getLeads(q);
  res.json(ApiResponse.success(result, "Leads fetched"));
});

export const getOne = asyncHandler(async (req, res) => {
  const lead = await service.getLeadById(req.params.id);
  res.json(ApiResponse.success(lead, "Lead fetched"));
});

export const update = asyncHandler(async (req, res) => {
  const data = await validator.updateSchema.validateAsync(req.body);
  const updated = await service.updateLead(req.params.id, data);
  res.json(ApiResponse.success(updated, "Lead updated"));
});

export const remove = asyncHandler(async (req, res) => {
  const result = await service.deleteLead(req.params.id);
  res.json(ApiResponse.success(result, "Lead deleted"));
});

export const assign = asyncHandler(async (req, res) => {
  const { assignedTo } = await validator.assignSchema.validateAsync(req.body);
  const updated = await service.assignLead(req.params.id, assignedTo);
  res.json(ApiResponse.success(updated, "Lead assigned"));
});

export const changeStage = asyncHandler(async (req, res) => {
  const { status } = await validator.statusSchema.validateAsync(req.body);
  const updated = await service.changeStage(req.params.id, status);
  res.json(ApiResponse.success(updated, "Lead status updated"));
});

// controllers/lead.controller.js
export const setStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const lead = await service.updateLeadStatus(req.params.id, status, req.user.id);
  res.json(ApiResponse.success(lead, "Lead status updated"));
});

export const statsSummary = asyncHandler(async (req, res) => {
  const stats = await service.summaryStats();
  res.json(ApiResponse.success(stats, "Lead stats"));
});
