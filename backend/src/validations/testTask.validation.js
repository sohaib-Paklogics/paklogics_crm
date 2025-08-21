// validations/testTask.validation.js
import Joi from "joi";

const id = Joi.string().hex().length(24);

export const createSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  description: Joi.string().allow("", null),
  priority: Joi.string().valid("low", "medium", "high").default("medium"),
  dueDate: Joi.date().optional(),
  assignedTo: id.optional(),
  // leadId comes from params; createdBy from auth
});

export const updateSchema = Joi.object({
  title: Joi.string().min(2).max(200),
  description: Joi.string().allow("", null),
  priority: Joi.string().valid("low", "medium", "high"),
  dueDate: Joi.date(),
  assignedTo: id.allow(null),
}).min(1);

export const statusSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "in_progress", "submitted", "reviewed", "passed", "failed", "canceled")
    .required(),
});

export const assignSchema = Joi.object({
  assignedTo: id.allow(null).required(), // null = unassign
});

export const reviewSchema = Joi.object({
  score: Joi.number().min(0).max(100).optional(),
  resultNotes: Joi.string().allow("", null),
  // optional override; else service will set "reviewed"
  status: Joi.string().valid("reviewed", "passed", "failed").optional(),
});

export const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().allow(""),
  status: Joi.string().valid("all", "pending", "in_progress", "submitted", "reviewed", "passed", "failed", "canceled"),
  priority: Joi.string().valid("low", "medium", "high"),
  assignedTo: id,
  dateFrom: Joi.date(),
  dateTo: Joi.date(),
  dueBefore: Joi.date(),
  dueAfter: Joi.date(),
  sort: Joi.string().valid("createdAt", "updatedAt", "dueDate", "score").default("createdAt"),
  order: Joi.string().valid("asc", "desc").default("desc"),
});
