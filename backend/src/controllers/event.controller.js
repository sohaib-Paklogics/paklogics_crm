import * as service from "../services/event.service.js";
import * as v from "../validations/event.validation.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

export const create = asyncHandler(async (req, res) => {
  const payload = await v.createSchema.validateAsync(req.body);
  const event = await service.create(req.params.id, req.user.id, payload);
  res.status(201).json(ApiResponse.success(event, "Event created", 201));
});

export const list = asyncHandler(async (req, res) => {
  const q = await v.listQuery.validateAsync(req.query);
  const result = await service.list(req.params.id, q);
  res.json(ApiResponse.success(result, "Events fetched"));
});

export const remove = asyncHandler(async (req, res) => {
  const result = await service.remove(req.params.eventId);
  res.json(ApiResponse.success(result, "Event deleted"));
});
