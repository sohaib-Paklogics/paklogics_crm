// controllers/kanban.controller.js
import * as service from "../services/kanban.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

export const board = asyncHandler(async (req, res) => {
  const data = await service.getBoard(req.query);
  res.json(ApiResponse.success(data, "Kanban board fetched"));
});

export const move = asyncHandler(async (req, res) => {
  const { toStageId } = req.body;
  const updated = await service.moveLead(req.params.leadId, toStageId);
  res.json(ApiResponse.success(updated, "Lead moved"));
});
