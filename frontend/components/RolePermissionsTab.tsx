"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types/types";

type FieldKey =
  | "clientName"
  | "jobDescription"
  | "leadSource"
  | "status"
  | "assignedDeveloper"
  | "notes"
  | "attachments";

type Permission = {
  view: boolean;
  edit: boolean;
};

type RolePermissionMap = {
  [key in FieldKey]: Permission;
};

type RolePermissions = {
  admin: RolePermissionMap;
  bd: RolePermissionMap;
  developer: RolePermissionMap;
};

export function RolePermissionsTab() {
  const [permissions, setPermissions] = useState<RolePermissions>({
    admin: {
      clientName: { view: true, edit: true },
      jobDescription: { view: true, edit: true },
      leadSource: { view: true, edit: true },
      status: { view: true, edit: true },
      assignedDeveloper: { view: true, edit: true },
      notes: { view: true, edit: true },
      attachments: { view: true, edit: true },
    },
    bd: {
      clientName: { view: true, edit: true },
      jobDescription: { view: true, edit: true },
      leadSource: { view: true, edit: true },
      status: { view: true, edit: true },
      assignedDeveloper: { view: true, edit: true },
      notes: { view: true, edit: false },
      attachments: { view: true, edit: false },
    },
    developer: {
      clientName: { view: true, edit: false },
      jobDescription: { view: true, edit: false },
      leadSource: { view: true, edit: false },
      status: { view: true, edit: false },
      assignedDeveloper: { view: true, edit: false },
      notes: { view: true, edit: false },
      attachments: { view: true, edit: false },
    },
  });

  const updatePermission = (
    role: UserRole,
    field: FieldKey,
    type: "view" | "edit",
    value: boolean
  ) => {
    setPermissions((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [field]: {
          ...prev[role][field],
          [type]: value,
        },
      },
    }));
  };

  const fields = [
    { key: "clientName", label: "Client Name" },
    { key: "jobDescription", label: "Job Description" },
    { key: "leadSource", label: "Lead Source" },
    { key: "status", label: "Status" },
    { key: "assignedDeveloper", label: "Assigned Developer" },
    { key: "notes", label: "Notes" },
    { key: "attachments", label: "Attachments" },
  ];

  const roles: { key: UserRole; label: string }[] = [
    { key: "admin", label: "Admin" },
    { key: "bd", label: "Business Developer" },
    { key: "developer", label: "Developer" },
  ];

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "bd":
        return "bg-blue-100 text-blue-800";
      case "developer":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-validiz-brown">Role Permissions</CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Configure view/edit fields per role
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-validiz-brown font-semibold">
                  Field
                </th>
                {roles.map((role) => (
                  <th key={role.key} className="text-center py-3 px-4">
                    <div className="flex flex-col items-center space-y-1">
                      <Badge className={getRoleBadgeColor(role.key)}>
                        {role.label}
                      </Badge>
                      <div className="flex space-x-2 text-xs text-gray-500">
                        <span>View</span>
                        <span>Edit</span>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fields.map((field) => (
                <tr key={field.key} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{field.label}</td>
                  {roles.map((role) => (
                    <td key={role.key} className="py-3 px-4 text-center">
                      <div className="flex justify-center space-x-4">
                        <Checkbox
                          checked={
                            permissions[role.key][field.key as FieldKey]
                              ?.edit || false
                          }
                          onCheckedChange={(checked) =>
                            updatePermission(
                              role.key,
                              field.key as FieldKey,
                              "edit",
                              checked as boolean
                            )
                          }
                          className="data-[state=checked]:bg-validiz-brown"
                        />
                        <Checkbox
                          checked={
                            permissions[role.key][field.key as FieldKey]
                              ?.edit || false
                          }
                          onCheckedChange={(checked) =>
                            updatePermission(
                              role.key,
                              field.key as FieldKey,
                              "edit",
                              checked as boolean
                            )
                          }
                          className="data-[state=checked]:bg-validiz-mustard"
                        />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end mt-6">
          <Button className="bg-validiz-brown hover:bg-validiz-brown/90">
            Save Permissions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
