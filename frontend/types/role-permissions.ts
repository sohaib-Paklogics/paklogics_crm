export type RoleKey =
  | "superadmin"
  | "admin"
  | "business_developer"
  | "developer";
export type CrudAction = "create" | "read" | "update" | "delete";

// Object like { leads: ["create","read"], users: [...] }
export type PermissionsMap = Record<string, CrudAction[]>;

export type LeadFieldPerm = { view: boolean; edit: boolean };

export type LeadPermissions = {
  clientName: LeadFieldPerm;
  jobDescription: LeadFieldPerm;
  leadSource: LeadFieldPerm;
  status: LeadFieldPerm;
  assignedDeveloper: LeadFieldPerm;
  notes: LeadFieldPerm;
  attachments: LeadFieldPerm;
};

export type RolePermissions = {
  _id: string;
  role: RoleKey;
  permissions: PermissionsMap;
  leadPermissions: LeadPermissions;
  // timestamps not in schema; add if you enable them
};
