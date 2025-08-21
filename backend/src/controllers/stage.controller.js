// controllers/stage.controller.js
import * as service from "../services/stage.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

export const list = asyncHandler(async (req, res) => {
  const stages = await service.listStages({ includeInactive: req.query.includeInactive === "true" });
  res.json(ApiResponse.success(stages, "Stages fetched"));
});

export const get = asyncHandler(async (req, res) => {
  const stage = await service.getStage(req.params.id);
  res.json(ApiResponse.success(stage, "Stage fetched"));
});

export const create = asyncHandler(async (req, res) => {
  const stage = await service.createStage({ ...req.body, createdBy: req.user?.id });
  res.status(201).json(ApiResponse.success(stage, "Stage created", 201));
});

// controllers/stage.controller.js
export const createAdjacent = asyncHandler(async (req, res) => {
  const { pivotId, where, name, color } = req.body;
  const createdBy = req.user?.id;
  const stage = await service.createStageAdjacent({ pivotId, where, name, color, createdBy });
  res.status(201).json(ApiResponse.success(stage, "Stage created", 201));
});

export const update = asyncHandler(async (req, res) => {
  const stage = await service.updateStage(req.params.id, req.body);
  res.json(ApiResponse.success(stage, "Stage updated"));
});

export const remove = asyncHandler(async (req, res) => {
  const out = await service.deleteStage(req.params.id, { targetStageId: req.body?.targetStageId });
  res.json(ApiResponse.success(out, "Stage deleted"));
});

export const reorder = asyncHandler(async (req, res) => {
  const stages = await service.reorderStages(req.body.orderIds || []);
  res.json(ApiResponse.success(stages, "Stages reordered"));
});
