import * as service from "../services/note.service.js";
import * as v from "../validations/note.validation.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

export const create = asyncHandler(async (req, res) => {
  const { text } = await v.createSchema.validateAsync(req.body);
  const note = await service.create(req.params.id, req.user.id, text);
  res.status(201).json(ApiResponse.success(note, "Note added", 201));
});

export const list = asyncHandler(async (req, res) => {
  const q = await v.listQuery.validateAsync(req.query);
  const result = await service.list(req.params.id, q);
  res.json(ApiResponse.success(result, "Notes fetched"));
});

export const remove = asyncHandler(async (req, res) => {
  const result = await service.remove(req.params.id, req.params.noteId);
  res.json(ApiResponse.success(result, "Note deleted"));
});
