import Joi from "joi";

export const createSchema = Joi.object({
  title: Joi.string().min(2).required(),
  startTime: Joi.date().required(),
  endTime: Joi.date().greater(Joi.ref("startTime")).required(),
  timezone: Joi.string().default("UTC"),
  description: Joi.string().allow("", null),
  status: Joi.string().valid("scheduled", "in-progress", "completed", "canceled", "rescheduled").default("scheduled"),
});

export const listQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  from: Joi.date(),
  to: Joi.date(),
  search: Joi.string().allow("", null),
  status: Joi.string().valid("scheduled", "in-progress", "completed", "canceled", "rescheduled"),
});
