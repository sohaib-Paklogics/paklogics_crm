import Joi from "joi";
const id = Joi.string().hex().length(24);

export const createSchema = Joi.object({
  text: Joi.string().min(1).required(),
});

export const listQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});
