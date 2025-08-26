// validations/lead.validation.ts
import Joi from "joi";

export const id = Joi.string().hex().length(24);

/** -------- Create -------- */
export const createSchema = Joi.object({
  clientName: Joi.string().min(2).max(120).required(),
  jobDescription: Joi.string().min(3).required(),
  source: Joi.string().valid("website", "referral", "linkedin", "job_board", "other").required(),

  assignedTo: id.optional(),
  stage: id.required(), // Stage _id
  status: Joi.optional(),

  notes: Joi.string().allow("", null),
  createdBy: id.optional(),
});

/** -------- Update -------- */
export const updateSchema = Joi.object({
  clientName: Joi.string().min(2).max(120),
  jobDescription: Joi.string().min(3),
  source: Joi.string().valid("website", "referral", "linkedin", "job_board", "other"),
  assignedTo: Joi.alternatives().try(id, Joi.valid(null)),
  stage: id,
  status: Joi.optional(),
  notes: Joi.string().allow("", null),
}).min(1);

/** -------- Assign -------- */
export const assignSchema = Joi.object({
  assignedTo: Joi.alternatives().try(id, Joi.valid(null)).required(),
});

/** -------- Change Stage -------- */
export const changeStageSchema = Joi.object({
  stage: id.required(),
});

/** -------- Change Lifecycle Status -------- */
export const changeStatusSchema = Joi.object({
  status: Joi.string().valid("active", "delayed", "deleted").required(),
});

/** -------- List / Query -------- */
export const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().allow(""),

  // lifecycle status filter
  status: Joi.string().valid("all", "active", "delayed", "deleted").default("all"),

  // stage filter can be "all" or a valid ObjectId
  stage: Joi.alternatives().try(Joi.string().valid("all"), id).default("all"),

  source: Joi.string().valid("website", "referral", "linkedin", "job_board", "other"),
  assignedTo: id,
  createdBy: id,

  dateFrom: Joi.date(),
  dateTo: Joi.date(),

  sort: Joi.string().valid("createdAt", "updatedAt").default("createdAt"),
  order: Joi.string().valid("asc", "desc").default("desc"),
});

/** -------- Kanban Move -------- */
export const moveSchema = Joi.object({
  toStageId: id.required(),
});
