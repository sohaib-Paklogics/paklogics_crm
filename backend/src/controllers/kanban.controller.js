import * as service from "../services/kanban.service.js";
import * as leadService from "../services/lead.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import Joi from "joi";

const moveSchema = Joi.object({
  status: Joi.string().valid("new", "interview_scheduled", "test_assigned", "completed").required(),
});

export const board = asyncHandler(async (req, res) => {
  const data = await service.getKanbanBoard(req.query);
  res.json(ApiResponse.success(data, "Kanban board fetched"));
});

// Simple move = changeStatus (ordering can be added later if you add an `order` field)
export const move = asyncHandler(async (req, res) => {
  const { status } = await moveSchema.validateAsync(req.body);
  const updated = await leadService.changeStatus(req.params.id, status);
  res.json(ApiResponse.success(updated, "Card moved"));
});
