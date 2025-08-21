// validations/lead.validation.ts
import Joi from "joi";

export const id = Joi.string().hex().length(24);

/** -------- Create --------
 * - stage is REQUIRED
 * - status is derived on the server from the stage.key
 */
export const createSchema = Joi.object({
  clientName: Joi.string().min(2).max(120).required(),
  jobDescription: Joi.string().min(3).required(),
  source: Joi.string().valid("website", "referral", "linkedin", "job_board", "other").required(),

  assignedTo: id.optional(), // AdminUser _id (optional)
  stage: id.required(), // Stage _id (required)
  status: Joi.optional(), // prevent direct writes; server derives from stage.key

  notes: Joi.string().allow("", null),
  createdBy: id.optional(), // typically set via auth middleware
});

/** -------- Update (partial) --------
 * - allow changing stage (server updates status accordingly)
 * - forbid direct status writes
 */
export const updateSchema = Joi.object({
  clientName: Joi.string().min(2).max(120),
  jobDescription: Joi.string().min(3),
  source: Joi.string().valid("website", "referral", "linkedin", "job_board", "other"),
  assignedTo: Joi.alternatives().try(id, Joi.valid(null)), // null to unassign
  stage: id, // changing stage triggers status update server-side
  status: Joi.optional(), // keep status managed by server
  notes: Joi.string().allow("", null),
}).min(1);

/** -------- Assign / Unassign --------
 * - explicit endpoint to set or clear assignee
 */
export const assignSchema = Joi.object({
  assignedTo: Joi.alternatives().try(id, Joi.valid(null)).required(), // null to unassign
});

/** -------- Change Stage (preferred over "change status") -------- */
export const changeStageSchema = Joi.object({
  stage: id.required(),
});

/** (Optional) Back-compat: Change Status (dynamic string)
 * Prefer changeStageSchema. If you still have a /status endpoint, keep this:
 */
export const statusSchema = Joi.object({
  status: Joi.string()
    .trim()
    .pattern(/^[a-z0-9_]+$/)
    .required(),
});

/** -------- List / Query --------
 * - supports filtering by either stage (recommended) or status (string)
 * - status accepts any kebab/underscore/slug-like token, plus "all"
 */
export const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().allow(""),

  // dynamic status (or "all")
  status: Joi.alternatives()
    .try(
      Joi.string().valid("all"),
      Joi.string()
        .trim()
        .pattern(/^[a-z0-9_]+$/),
    )
    .default("all"),

  // recommended: filter by stage _id
  stage: id.optional(),

  source: Joi.string().valid("website", "referral", "linkedin", "job_board", "other"),
  assignedTo: id,
  createdBy: id,

  dateFrom: Joi.date(),
  dateTo: Joi.date(),

  sort: Joi.string().valid("createdAt", "updatedAt").default("createdAt"),
  order: Joi.string().valid("asc", "desc").default("desc"),
});

/** -------- Kanban: move card --------
 * PATCH /kanban/leads/:id/move  { toStageId }
 */
export const moveSchema = Joi.object({
  toStageId: id.required(),
});
