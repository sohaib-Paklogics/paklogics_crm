
import Joi from "joi";

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const createSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("superadmin", "admin", "business_developer", "developer").default("admin"),
  status: Joi.string().valid("active", "inactive", "suspended").default("active"),
  permissions: Joi.array().items(Joi.string()).default([]),
});

export const updateSchema = Joi.object({
  username: Joi.string().min(3).max(50),
  email: Joi.string().email(),
  password: Joi.string().min(6),
  role: Joi.string().valid("superadmin", "admin", "business_developer", "developer"),
  status: Joi.string().valid("active", "inactive", "suspended"),
  permissions: Joi.array().items(Joi.string()),
});
