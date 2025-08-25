// validations/rolePermissions.validation.js
import Joi from "joi";

const roleEnum = ["superadmin", "admin", "business_developer", "developer"];
const actionEnum = ["create", "read", "update", "delete"];

const permissionsSchema = Joi.object().pattern(
  Joi.string().min(1),
  Joi.array()
    .items(Joi.string().valid(...actionEnum))
    .default([]),
);

const leadFieldSchema = Joi.object({
  view: Joi.boolean().required(),
  edit: Joi.boolean().required(),
});

const leadPermissionsSchema = Joi.object({
  clientName: leadFieldSchema,
  jobDescription: leadFieldSchema,
  leadSource: leadFieldSchema,
  status: leadFieldSchema,
  assignedDeveloper: leadFieldSchema,
  notes: leadFieldSchema,
  attachments: leadFieldSchema,
});

export const roleParamSchema = Joi.object({
  role: Joi.string()
    .valid(...roleEnum)
    .required(),
});

export const createSchema = Joi.object({
  role: Joi.string()
    .valid(...roleEnum)
    .required(),
  permissions: permissionsSchema.default({}),
  leadPermissions: leadPermissionsSchema.required(),
});

export const replaceSchema = Joi.object({
  role: Joi.string()
    .valid(...roleEnum)
    .required(),
  permissions: permissionsSchema.default({}),
  leadPermissions: leadPermissionsSchema.required(),
});

export const updateSchema = Joi.object({
  role: Joi.string().valid(...roleEnum),
  permissions: permissionsSchema,
  leadPermissions: leadPermissionsSchema,
}).min(1);
