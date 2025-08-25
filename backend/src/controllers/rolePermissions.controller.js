// controllers/rolePermissions.controller.js
import * as service from "../services/rolePermissions.service.js";
import * as validator from "../validations/rolePermissions.validation.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

export const listAll = asyncHandler(async (_req, res) => {
  const data = await service.listAll();
  res.json(ApiResponse.success(data, "Role permissions fetched"));
});

export const getById = asyncHandler(async (req, res) => {
  const data = await service.getById(req.params.id);
  res.json(ApiResponse.success(data, "Role permissions fetched"));
});

export const getByRole = asyncHandler(async (req, res) => {
  const { role } = await validator.roleParamSchema.validateAsync(req.params);
  const data = await service.getByRole(role);
  res.json(ApiResponse.success(data, "Role permissions fetched"));
});

export const create = asyncHandler(async (req, res) => {
  const payload = await validator.createSchema.validateAsync(req.body);
  const data = await service.create(payload);
  res.status(201).json(ApiResponse.success(data, "Role permissions created", 201));
});

export const replace = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const payload = await validator.replaceSchema.validateAsync(req.body);
  const data = await service.replace(id, payload);
  res.json(ApiResponse.success(data, "Role permissions replaced"));
});

export const update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const payload = await validator.updateSchema.validateAsync(req.body);
  const data = await service.update(id, payload);
  res.json(ApiResponse.success(data, "Role permissions updated"));
});

export const remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id);
  res.json(ApiResponse.success(null, "Role permissions deleted"));
});

export const upsertByRole = asyncHandler(async (req, res) => {
  const { role } = await validator.roleParamSchema.validateAsync(req.params);
  const payload = await validator.replaceSchema.validateAsync({ ...req.body, role }); // ensure role matches
  const data = await service.upsertByRole(role, payload);
  res.json(ApiResponse.success(data, "Role permissions upserted"));
});
