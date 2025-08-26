import Joi from "joi";

export const createSchema = Joi.object({
  content: Joi.string().trim().min(1).required(),
});
export const editSchema = Joi.object({
  content: Joi.string().trim().min(1).required(),
});

export const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50),
  before: Joi.date().optional(), // messages strictly before this timestamp
  after: Joi.date().optional(), // messages strictly after this timestamp
  order: Joi.string().valid("asc", "desc").default("asc"),
});

export const markReadSchema = Joi.object({
  readStatus: Joi.boolean().default(true),
});
