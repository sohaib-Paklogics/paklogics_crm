

"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  { key: "admin", label: "Admin" },
  { key: "business_developer", label: "Business Developer" },
  { key: "developer", label: "Developer" },
];

// Show these resources in the CRUD grid (order & labels)
const RESOURCE_ORDER: { key: keyof PermissionsMap; label: string }[] = [
  { key: "leads", label: "Leads" },
  { key: "users", label: "Contacts" },
  { key: "calendar", label: "Calendar" },
  { key: "reports", label: "Analytics" },
  { key: "reports", label: "Reports" },
  { key: "chat", label: "Settings" },
];

const CRUD_ACTIONS: CrudAction[] = ["create", "read", "update", "delete"];

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
  const { byRole, fetchByRole, upsertByRole, isSubmit } = useRolePermissionsStore();

  const [selectedRole, setSelectedRole] = useState<RoleKey>("business_developer");

  // local editable copies
  const [permissions, setPermissions] = useState<PermissionsMap>({});
  const [leadPermissions, setLeadPermissions] = useState<LeadPermissions>(EMPTY_LEAD_PERMISSIONS);

  // load on role change
  useEffect(() => {
    (async () => {
      const existing = byRole[selectedRole] ?? (await fetchByRole(selectedRole));
      const doc = (existing ?? byRole[selectedRole]) as RPDoc | undefined;

      setPermissions({ ...(doc?.permissions ?? {}) });
      setLeadPermissions(ensureLeadDefaults(doc?.leadPermissions));
    })();
  }, [selectedRole, byRole, fetchByRole]);

  // --- CRUD toggles ---
  const hasAction = (resource: string, action: CrudAction) =>
    Array.isArray(permissions?.[resource]) && permissions[resource].includes(action);

  const toggleAction = (resource: string, action: CrudAction, checked: boolean) => {
    setPermissions((prev) => {
      const setForRes = new Set(prev[resource] ?? []);
      if (checked) setForRes.add(action);
      else setForRes.delete(action);
      return { ...prev, [resource]: Array.from(setForRes) as CrudAction[] };
    });
  };

  // bulk row toggles (all actions for a resource)
  const allRowOn = (resource: string) => CRUD_ACTIONS.every((a) => hasAction(resource, a));

  const toggleRowAll = (resource: string, on: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [resource]: on ? [...CRUD_ACTIONS] : [],
    }));
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

  const displayResources = useMemo(() => {
    const known = RESOURCE_ORDER.map((r) => r.key as string);
    const extra = Object.keys(permissions || {}).filter((k) => !known.includes(k));
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg md:text-2xl font-semibold text-primary truncate">Role Permissions</h2>
          <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-gray-500">Configure access permissions for each role</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as RoleKey)}>
            <SelectTrigger className="w-full sm:w-[220px] max-w-[360px]">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent className="max-h-[280px]">
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
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm">Module</th>
                  <th className="py-4 px-6 text-center font-medium text-gray-700 text-sm">Create</th>
                  <th className="py-4 px-6 text-center font-medium text-gray-700 text-sm">Read</th>
                  <th className="py-4 px-6 text-center font-medium text-gray-700 text-sm">Update</th>
                  <th className="py-4 px-6 text-center font-medium text-gray-700 text-sm">Update</th>
                  <th className="py-4 px-6 text-center font-medium text-gray-700 text-sm">All</th>
                </tr>
              </thead>
              <tbody>
                {displayResources.map(({ key, label }) => (
                  <tr key={key} className="border-b last:border-b-0 hover:bg-gray-50/50">
                    <td className="py-4 px-6 font-normal text-gray-700">{label}</td>
                    {CRUD_ACTIONS.map((act) => (
                      <td key={act} className="py-4 px-6 text-center">
                        <div className="flex justify-center">
                          <Switch
                            checked={hasAction(key, act)}
                            onCheckedChange={(c) => toggleAction(key, act, c)}
                            className="data-[state=checked]:bg-amber-900 data-[state=unchecked]:bg-gray-300"
                          />
                        </div>
                      </td>
                    ))}
                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center">
                        <Switch
                          checked={allRowOn(key)}
                          onCheckedChange={(c) => toggleRowAll(key, c)}
                          className="data-[state=checked]:bg-yellow-500 data-[state=unchecked]:bg-gray-300"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Footer text and buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs sm:text-sm text-gray-600 min-w-0">
          Configuring permissions for{" "}
          <span className="font-semibold inline-block truncate align-bottom max-w-[18rem] sm:max-w-none">
            {ROLE_OPTIONS.find((r) => r.key === selectedRole)?.label}
          </span>
        </p>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Button variant="outline" onClick={onReset} className="px-6 w-full sm:w-auto">
            Refresh
          </Button>
          <Button
            className="bg-amber-900 hover:bg-amber-800 text-white px-6 w-full sm:w-auto"
            onClick={onSave}
            disabled={isSubmit}
          >
            {isSubmit ? <ButtonLoader /> : "Save Permissions"}
          </Button>
        </div>
      </div>
    </div>
  );
}