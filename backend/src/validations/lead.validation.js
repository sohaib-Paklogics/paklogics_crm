import Joi from "joi";

const id = Joi.string().hex().length(24);

export const createSchema = Joi.object({
  clientName: Joi.string().min(2).max(120).required(),
  jobDescription: Joi.string().min(3).required(),
  source: Joi.string().valid("website", "referral", "linkedin", "job_board", "other").required(),
  assignedTo: id.optional(),
  status: Joi.string().valid("new", "interview_scheduled", "test_assigned", "completed").optional(),
  notes: Joi.string().allow("", null),
  createdBy: id.optional(),
});

export const updateSchema = Joi.object({
  clientName: Joi.string().min(2).max(120),
  jobDescription: Joi.string().min(3),
  source: Joi.string().valid("website", "referral", "linkedin", "job_board", "other"),
  assignedTo: id.allow(null),
  status: Joi.string().valid("new", "interview_scheduled", "test_assigned", "completed"),
  notes: Joi.string().allow("", null),
}).min(1);

export const assignSchema = Joi.object({
  assignedTo: id.allow(null).required(), // allow unassign by sending null
});

export const statusSchema = Joi.object({
  status: Joi.string().valid("new", "interview_scheduled", "test_assigned", "completed").required(),
});

export const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().allow(""),
  status: Joi.string().valid("all", "new", "interview_scheduled", "test_assigned", "completed").default("all"),
  source: Joi.string().valid("website", "referral", "linkedin", "job_board", "other"),
  assignedTo: id,
  createdBy: id,
  dateFrom: Joi.date(),
  dateTo: Joi.date(),
  sort: Joi.string().valid("createdAt", "updatedAt").default("createdAt"),
  order: Joi.string().valid("asc", "desc").default("desc"),
});
