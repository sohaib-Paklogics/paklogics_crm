import Joi from "joi";
const id = Joi.string().hex().length(24);

export const listQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

export const deleteSchema = Joi.object({
  attachmentId: id.required(),
});
