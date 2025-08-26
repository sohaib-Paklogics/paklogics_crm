// services/kanban.service.js
import Lead from "../models/lead.model.js";
import { buildFilter, getPagination } from "../utils/pagination.js";
import { Types } from "mongoose";
import { listStages } from "./stage.service.js";
import ApiError from "../utils/ApiError.js";

export async function getBoard(query) {
  const stages = await listStages();
  const searchable = ["clientName", "jobDescription", "source", "status"];
  const filter = buildFilter(query, searchable);

  // role-based scoping (optional if you already do in middleware)
  if (query.createdBy) filter.createdBy = query.createdBy;
  if (query.assignedTo) filter.assignedTo = query.assignedTo;

  const { limit } = getPagination(query.page, query.limit || 50);

  const columns = {};
  for (const stage of stages) {
    const q = { ...filter, stage: stage._id };
    const data = await Lead.find(q)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("assignedTo", "username role")
      .populate("createdBy", "username role")
      .lean();
    columns[String(stage._id)] = { stage, data, count: data.length };
  }

  return { stages, columns };
}

export async function moveLead(leadId, toStageId) {
  if (!Types.ObjectId.isValid(leadId)) throw new ApiError(400, "Invalid lead id");
  if (!Types.ObjectId.isValid(toStageId)) throw new ApiError(400, "Invalid stage id");

  const stages = await listStages();
  const target = stages.find((s) => String(s._id) === String(toStageId));
  if (!target) throw new ApiError(404, "Target stage not found");

  const updated = await Lead.findByIdAndUpdate(leadId, { $set: { stage: target._id } }, { new: true })
    .populate("assignedTo", "username role")
    .populate("createdBy", "username role");

  if (!updated) throw new ApiError(404, "Lead not found");
  return updated;
}
