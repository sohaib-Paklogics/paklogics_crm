// components/leadDetail/LeadDetailsForm.tsx
"use client";

import { useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Lead, LeadSource } from "@/types/lead";
import { useStagesStore } from "@/stores/stages.store";
import { useUserStore } from "@/stores/user.store";
import { AdminUser } from "@/types/types";
import useAuthStore from "@/stores/auth.store";

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
  const { users: userList, fetchDeveloper, loading: usersLoading } = useUserStore();
  const { user } = useAuthStore();

  const isAdmin = user?.role === "admin" || user?.role === "superadmin" || user?.role === "business_developer" || false;

  const selfId = (user as any)?._id ?? (user as any)?.id ?? null;
  const selfName = (user as any)?.username ?? (user as any)?.name ?? "You";

  useEffect(() => {
    stageFetch();
    if (isAdmin) {
      fetchDeveloper?.({ page: 1, limit: 100 } as any);
    }
  }, [stageFetch, fetchDeveloper, isAdmin]);

  const assignedValueFromState = useMemo(() => {
    const edited = (editData as any)?.assignedTo;
    if (typeof edited === "string") return edited;
    if (edited && typeof edited === "object") return edited._id;

    const fromLead = (lead as any)?.assignedTo;
    if (typeof fromLead === "string") return fromLead;
    if (fromLead && typeof fromLead === "object") return fromLead._id;

    return "";
  }, [editData, lead]);

  // Non-admins: force assign to self when editing
  useEffect(() => {
    if (!isEditing || isAdmin) return;
    if (!selfId) return;
    if (assignedValueFromState !== String(selfId)) {
      set("assignedTo" as any, String(selfId));
    }
  }, [isEditing, isAdmin, selfId, assignedValueFromState]);

  const assignedSelectValue = isAdmin ? assignedValueFromState : selfId ? String(selfId) : "";

  const getStageId = (stage: any): string => {
    if (!stage) return "";
    if (typeof stage === "string") return stage;
    if (typeof stage === "object" && stage._id) return String(stage._id);
    return "";
  };

  const currentStageId = isEditing
    ? getStageId((editData as any)?.stage ?? (lead as any)?.stage)
    : getStageId((lead as any)?.stage);

  const statusValue = (lead as any)?.status?.value ?? "active";

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <CardTitle>Lead Details</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Update core information, pipeline stage, and internal notes for this lead.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs md:text-sm text-muted-foreground">
          <span>
            Status: <span className="font-medium capitalize">{statusValue}</span>
          </span>
          <span className="hidden sm:inline text-gray-300">•</span>
          <span>
            Created:{" "}
            <span className="font-medium">{lead.createdAt ? new Date(lead.createdAt).toLocaleString() : "—"}</span>
          </span>
          {lead.updatedAt && (
            <>
              <span className="hidden sm:inline text-gray-300">•</span>
              <span>
                Updated: <span className="font-medium">{new Date(lead.updatedAt).toLocaleString()}</span>
              </span>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Row 1: client + source */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="clientName">Client Name</Label>
            <Input
              id="clientName"
              value={isEditing ? editData.clientName ?? "" : lead.clientName}
              onChange={(e) => set("clientName", e.target.value)}
              disabled={!isEditing}
              placeholder="Company / Role name"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="source">Lead Source</Label>
            <Select
              value={isEditing ? editData.source ?? lead.source : lead.source}
              onValueChange={(v) => set("source", v as LeadSource)}
              disabled={!isEditing}
            >
              <SelectTrigger id="source">
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

        {/* Job Description */}
        <div className="space-y-1.5">
          <Label htmlFor="jobDescription">Job Description</Label>
          <Textarea
            id="jobDescription"
            rows={4}
            value={isEditing ? editData.jobDescription ?? "" : lead.jobDescription}
            onChange={(e) => set("jobDescription", e.target.value)}
            disabled={!isEditing}
            placeholder="Paste the core responsibilities, tech stack, expectations…"
          />
        </div>

        {/* Row 2: Stage + Assigned To */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Stage */}
          <div className="space-y-1.5">
            <Label htmlFor="stage">Stage</Label>
            <Select value={currentStageId} onValueChange={(v) => set("stage", v as any)} disabled={!isEditing}>
              <SelectTrigger id="stage">
                <SelectValue placeholder="Select Stage" />
              </SelectTrigger>
              <SelectContent>
                {stageList.map((s) => (
                  <SelectItem key={s._id} value={String(s._id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Controls where this lead appears on the pipeline board.</p>
          </div>

          {/* Assigned To (developers only) */}
          <div className="space-y-1.5">
            <Label htmlFor="assignedTo">Assigned Developer</Label>
            <Select
              value={assignedSelectValue}
              onValueChange={(v) => onChange({ ...editData, assignedTo: v } as any)}
              disabled={!isEditing || !isAdmin || !selfId}
            >
              <SelectTrigger id="assignedTo">
                <SelectValue
                  placeholder={
                    isAdmin ? (usersLoading ? "Loading developers..." : "Select Developer") : "Assigned to you"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {isAdmin ? (
                  userList
                    .filter((u: AdminUser) => u.role === "developer" && !!u._id)
                    .map((u: AdminUser) => (
                      <SelectItem className="capitalize" key={String(u._id)} value={String(u._id)}>
                        {u.username} ({u.role})
                      </SelectItem>
                    ))
                ) : selfId ? (
                  <SelectItem value={String(selfId)}>{selfName} (you)</SelectItem>
                ) : (
                  <SelectItem value="__me_loading__" disabled>
                    Loading your profile…
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Only users with the <span className="font-medium">developer</span> role are available for assignment.
            </p>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <Label htmlFor="notes">Internal Notes</Label>
          <Textarea
            id="notes"
            rows={3}
            value={isEditing ? editData.notes ?? "" : (lead.notes as any) ?? ""}
            onChange={(e) => set("notes", e.target.value)}
            disabled={!isEditing}
            placeholder="Optional notes about this lead for the internal team…"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default LeadDetailsForm;
