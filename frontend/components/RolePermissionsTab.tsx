"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import type {
  RoleKey,
  RolePermissions as RPDoc,
  PermissionsMap,
  LeadPermissions,
  CrudAction,
} from "@/types/role-permissions";
import { useRolePermissionsStore } from "@/stores/rolePermissions.store";
import ButtonLoader from "./common/ButtonLoader";

// --- constants (backend-aligned) ---
const ROLE_OPTIONS: { key: RoleKey; label: string }[] = [
  // { key: "superadmin", label: "Super Admin" },
  { key: "admin", label: "Admin" },
  { key: "business_developer", label: "Business Developer" },
  { key: "developer", label: "Developer" },
];

// Show these resources in the CRUD grid (order & labels)
const RESOURCE_ORDER: { key: keyof PermissionsMap; label: string }[] = [
  { key: "leads", label: "Leads" },
  { key: "users", label: "Users" },
  { key: "reports", label: "Reports" },
  { key: "calendar", label: "Calendar" },
  { key: "notes", label: "Notes" },
  { key: "chat", label: "Chat" },
  { key: "attachments", label: "Attachments" },
];

const CRUD_ACTIONS: CrudAction[] = ["create", "read", "update", "delete"];

const LEAD_FIELDS: Array<{ key: keyof LeadPermissions; label: string }> = [
  { key: "clientName", label: "Client Name" },
  { key: "jobDescription", label: "Job Description" },
  { key: "leadSource", label: "Lead Source" },
  { key: "status", label: "Status" },
  { key: "assignedDeveloper", label: "Assigned Developer" },
  { key: "notes", label: "Notes" },
  { key: "attachments", label: "Attachments" },
];

// sensible defaults if a role is missing or new
const EMPTY_LEAD_PERMISSIONS: LeadPermissions = {
  clientName: { view: false, edit: false },
  jobDescription: { view: false, edit: false },
  leadSource: { view: false, edit: false },
  status: { view: false, edit: false },
  assignedDeveloper: { view: false, edit: false },
  notes: { view: false, edit: false },
  attachments: { view: false, edit: false },
};

function ensureLeadDefaults(p?: Partial<LeadPermissions>): LeadPermissions {
  const base = { ...EMPTY_LEAD_PERMISSIONS };
  if (!p) return base;
  for (const field of Object.keys(base) as (keyof LeadPermissions)[]) {
    if (p[field])
      base[field] = {
        view: !!p[field]?.view,
        edit: !!p[field]?.edit,
      };
  }
  return base;
}

export default function RolePermissionsTab() {
  const { byRole, fetchByRole, upsertByRole, isSubmit } =
    useRolePermissionsStore();

  const [selectedRole, setSelectedRole] = useState<RoleKey>("admin");

  // local editable copies
  const [permissions, setPermissions] = useState<PermissionsMap>({});
  const [leadPermissions, setLeadPermissions] = useState<LeadPermissions>(
    EMPTY_LEAD_PERMISSIONS
  );

  // load on role change
  useEffect(() => {
    (async () => {
      const existing =
        byRole[selectedRole] ?? (await fetchByRole(selectedRole));
      const doc = (existing ?? byRole[selectedRole]) as RPDoc | undefined;

      setPermissions({ ...(doc?.permissions ?? {}) });
      setLeadPermissions(ensureLeadDefaults(doc?.leadPermissions));
    })();
  }, [selectedRole, byRole, fetchByRole]);

  // --- CRUD toggles ---
  const hasAction = (resource: string, action: CrudAction) =>
    Array.isArray(permissions?.[resource]) &&
    permissions[resource].includes(action);

  const toggleAction = (
    resource: string,
    action: CrudAction,
    checked: boolean
  ) => {
    setPermissions((prev) => {
      const setForRes = new Set(prev[resource] ?? []);
      if (checked) setForRes.add(action);
      else setForRes.delete(action);
      return { ...prev, [resource]: Array.from(setForRes) as CrudAction[] };
    });
  };

  // bulk row toggles (all actions for a resource)
  const allRowOn = (resource: string) =>
    CRUD_ACTIONS.every((a) => hasAction(resource, a));

  const toggleRowAll = (resource: string, on: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [resource]: on ? [...CRUD_ACTIONS] : [],
    }));
  };

  // --- Lead Field toggles ---
  const toggleLeadField = (
    field: keyof LeadPermissions,
    type: "view" | "edit",
    checked: boolean
  ) => {
    setLeadPermissions((prev) => {
      const next = { ...prev };
      next[field] = { ...next[field], [type]: checked };
      // Optional rule: if edit=true, ensure view=true
      if (type === "edit" && checked) next[field].view = true;
      // Optional rule: if view=false, force edit=false
      if (type === "view" && !checked) next[field].edit = false;
      return next;
    });
  };

  const onSave = async () => {
    const res = await upsertByRole(selectedRole, {
      permissions,
      leadPermissions,
    });
    if (res) toast.success("Role permissions saved");
  };

  const onReset = () => {
    const doc = byRole[selectedRole];
    setPermissions({ ...(doc?.permissions ?? {}) });
    setLeadPermissions(ensureLeadDefaults(doc?.leadPermissions));
  };

  // Dynamic add resource (optional UX nicety)
  const [newResource, setNewResource] = useState("");
  const addResource = () => {
    const k = newResource.trim().toLowerCase();
    if (!k) return;
    setPermissions((p) => (p[k] ? p : { ...p, [k]: [] }));
    setNewResource("");
  };

  const displayResources = useMemo(() => {
    // keep knowns first, then any extra keys
    const known = RESOURCE_ORDER.map((r) => r.key as string);
    const extra = Object.keys(permissions || {}).filter(
      (k) => !known.includes(k)
    );
    return [
      ...RESOURCE_ORDER.map(({ key, label }) => ({
        key: key as string,
        label,
      })),
      ...extra.map((k) => ({
        key: k,
        label: k[0]?.toUpperCase() + k.slice(1),
      })),
    ];
  }, [permissions]);

  const roleBadge = (role: RoleKey) => {
    switch (role) {
      case "superadmin":
        return "bg-gray-900 text-white";
      case "admin":
        return "bg-red-100 text-red-800";
      case "business_developer":
        return "bg-blue-100 text-blue-800";
      case "developer":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* header / role selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-validiz-brown">
            Role Permissions
          </h2>
          <p className="text-sm text-muted-foreground">
            Configure module actions and lead field access per role.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={roleBadge(selectedRole)}>
            {ROLE_OPTIONS.find((r) => r.key === selectedRole)?.label}
          </Badge>
          <Select
            value={selectedRole}
            onValueChange={(v) => setSelectedRole(v as RoleKey)}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map((r) => (
                <SelectItem key={r.key} value={r.key}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Module CRUD permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-validiz-brown">
            Module Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-validiz-brown">
                    Module
                  </th>
                  <th className="py-3 px-4 text-center">Create</th>
                  <th className="py-3 px-4 text-center">Read</th>
                  <th className="py-3 px-4 text-center">Update</th>
                  <th className="py-3 px-4 text-center">Delete</th>
                  <th className="py-3 px-4 text-center">All</th>
                </tr>
              </thead>
              <tbody>
                {displayResources.map(({ key, label }) => (
                  <tr key={key} className="border-b hover:bg-muted/40">
                    <td className="py-3 px-4 font-medium">{label}</td>
                    {CRUD_ACTIONS.map((act) => (
                      <td key={act} className="py-3 px-4 text-center">
                        <Checkbox
                          checked={hasAction(key, act)}
                          onCheckedChange={(c) => toggleAction(key, act, !!c)}
                          className="data-[state=checked]:bg-validiz-brown"
                        />
                      </td>
                    ))}
                    <td className="py-3 px-4 text-center">
                      <Checkbox
                        checked={allRowOn(key)}
                        onCheckedChange={(c) => toggleRowAll(key, !!c)}
                        className="data-[state=checked]:bg-validiz-mustard"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={onReset}>
              Reset
            </Button>
            <Button
              className="bg-validiz-brown hover:bg-validiz-brown/90"
              onClick={onSave}
              disabled={isSubmit}
            >
              {isSubmit ? <ButtonLoader /> : "Save Permissions"}
            </Button>
          </div>
          {/* Add custom module key (optional) */}
          {/* <div className="flex gap-2 mt-4">
            <Input
              value={newResource}
              onChange={(e) => setNewResource(e.target.value)}
              placeholder="Add custom module key, e.g. billing"
              className="max-w-sm"
            />
            <Button variant="secondary" onClick={addResource}>
              Add Module
            </Button>
          </div> */}
        </CardContent>
      </Card>

      {/* Lead field view/edit permissions */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="text-validiz-brown">
            Lead Field Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-validiz-brown">
                    Field
                  </th>
                  <th className="py-3 px-4 text-center">View</th>
                  <th className="py-3 px-4 text-center">Edit</th>
                </tr>
              </thead>
              <tbody>
                {LEAD_FIELDS.map(({ key, label }) => (
                  <tr key={key} className="border-b hover:bg-muted/40">
                    <td className="py-3 px-4 font-medium">{label}</td>
                    <td className="py-3 px-4 text-center">
                      <Checkbox
                        checked={!!leadPermissions[key]?.view}
                        onCheckedChange={(c) =>
                          toggleLeadField(key, "view", !!c)
                        }
                        className="data-[state=checked]:bg-validiz-brown"
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Checkbox
                        checked={!!leadPermissions[key]?.edit}
                        onCheckedChange={(c) =>
                          toggleLeadField(key, "edit", !!c)
                        }
                        className="data-[state=checked]:bg-validiz-mustard"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={onReset}>
              Reset
            </Button>
            <Button
              className="bg-validiz-brown hover:bg-validiz-brown/90"
              onClick={onSave}
            >
              Save Permissions
            </Button>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
