"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lead, LeadSource } from "@/types/lead";
import { useStagesStore } from "@/stores/stages.store";
import { useEffect, useMemo } from "react";
import { useUserStore } from "@/stores/user-store";
import { AdminUser } from "@/types/types";
import useAuthStore from "@/stores/auth-store";

const LeadDetailsForm = ({
  isEditing,
  lead,
  editData,
  onChange,
}: {
  isEditing: boolean;
  lead: Lead;
  editData: Partial<Lead>;
  onChange: (data: Partial<Lead>) => void;
}) => {
  const set = (k: keyof Lead, v: any) => onChange({ ...editData, [k]: v });

  const { items: stageList, fetch: stageFetch } = useStagesStore();
  const { users: userList, fetchUsers } = useUserStore();
  const { user } = useAuthStore();

  const isAdmin =
    user?.role === "admin" || user?.role === "superadmin" || false;

  // Robust self id/name (your auth sometimes uses id, sometimes _id)
  const selfId = (user as any)?._id ?? (user as any)?.id ?? null;
  const selfName = (user as any)?.username ?? (user as any)?.name ?? "You";

  // fetch stages always; fetch users only for admin
  useEffect(() => {
    stageFetch();
    if (isAdmin) fetchUsers?.();
  }, [stageFetch, fetchUsers, isAdmin]);

  // Normalize assigned value from lead/editData (id string)
  const assignedValueFromState = useMemo(() => {
    const edited = (editData as any)?.assignedTo;
    if (typeof edited === "string") return edited;
    if (edited && typeof edited === "object") return edited._id;

    const fromLead = (lead as any)?.assignedTo;
    if (typeof fromLead === "string") return fromLead;
    if (fromLead && typeof fromLead === "object") return fromLead._id;

    return "";
  }, [editData, lead]);

  // For non-admins: force assign to self when editing, once selfId is known
  useEffect(() => {
    if (!isEditing || isAdmin) return;
    if (!selfId) return; // wait until we have a real id
    if (assignedValueFromState !== String(selfId)) {
      set("assignedTo" as any, String(selfId));
    }
  }, [isEditing, isAdmin, selfId, assignedValueFromState]);

  // Value shown in the Select
  const assignedSelectValue = isAdmin
    ? assignedValueFromState
    : selfId
    ? String(selfId)
    : ""; // placeholder shown until selfId exists

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">Client Name</Label>
            <Input
              id="clientName"
              value={isEditing ? editData.clientName ?? "" : lead.clientName}
              onChange={(e) => set("clientName", e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="source">Lead Source</Label>
            <Select
              value={isEditing ? editData.source ?? lead.source : lead.source}
              onValueChange={(v) => set("source", v as LeadSource)}
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="job_board">Job Board</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="jobDescription">Job Description</Label>
          <Textarea
            id="jobDescription"
            rows={4}
            value={
              isEditing ? editData.jobDescription ?? "" : lead.jobDescription
            }
            onChange={(e) => set("jobDescription", e.target.value)}
            disabled={!isEditing}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Stage */}
          <div className="space-y-2">
            <Label htmlFor="stage">Stage</Label>
            <Select
              value={
                isEditing
                  ? (typeof editData.stage === "object"
                      ? (editData.stage as any)?._id
                      : (editData.stage as any)) ??
                    (typeof lead?.stage === "object"
                      ? (lead?.stage as any)?._id
                      : (lead?.stage as any))
                  : typeof lead?.stage === "object"
                  ? (lead?.stage as any)?._id
                  : (lead?.stage as any)
              }
              onValueChange={(v) => set("stage", v)}
              disabled={!isEditing}
            >
              <SelectTrigger id="stage">
                <SelectValue placeholder="Select Stage" />
              </SelectTrigger>
              <SelectContent>
                {stageList.map((s) => (
                  <SelectItem key={s._id} value={s._id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assigned To */}
          <div className="space-y-2">
            <Label htmlFor="assignedTo">Assigned To</Label>
            <Select
              value={assignedSelectValue}
              onValueChange={(v) =>
                onChange({ ...editData, assignedTo: v } as any)
              }
              // Only admins can change; non-admins see themselves
              disabled={!isEditing || !isAdmin || !selfId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Developer" />
              </SelectTrigger>
              <SelectContent>
                {isAdmin ? (
                  userList
                    .filter((u: AdminUser) => u.role === "developer" && !!u._id)
                    .map((u: AdminUser) => (
                      <SelectItem
                        className="capitalize"
                        key={String(u._id)}
                        value={String(u._id)}
                      >
                        {u.username} ({u.role})
                      </SelectItem>
                    ))
                ) : selfId ? (
                  // Non-admin: exactly one option with a NON-empty value
                  <SelectItem value={String(selfId)}>
                    {selfName} (you)
                  </SelectItem>
                ) : (
                  // If selfId not ready yet, render a disabled placeholder
                  // NOTE: value is NON-empty to satisfy the Select.Item rule
                  <SelectItem value="__me_loading__" disabled>
                    Loading your profile…
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Internal Notes</Label>
          <Textarea
            id="notes"
            rows={3}
            value={isEditing ? editData.notes ?? "" : (lead.notes as any) ?? ""}
            onChange={(e) => set("notes", e.target.value)}
            disabled={!isEditing}
            placeholder="Optional notes about this lead..."
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default LeadDetailsForm;
