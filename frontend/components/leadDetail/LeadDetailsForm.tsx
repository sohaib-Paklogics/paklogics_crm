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
import { useEffect } from "react";
import { useUserStore } from "@/stores/user-store";
import { AdminUser } from "@/types/types";

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

  useEffect(() => {
    stageFetch();
    fetchUsers();
  }, [stageFetch, fetchUsers]);

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
          <div className="space-y-2">
            <Label htmlFor="stage">Stage</Label>

            <Select
              value={
                isEditing
                  ? (typeof editData.stage === "object"
                      ? editData.stage?._id
                      : editData.stage) ??
                    (typeof lead?.stage === "object"
                      ? lead?.stage?._id
                      : (lead?.stage as any))
                  : typeof lead?.stage === "object"
                  ? lead?.stage?._id
                  : (lead?.stage as any)
              }
              onValueChange={(v) => set("stage", v)} // << set the STAGE field, not status
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

          <div className="space-y-2">
            <Label htmlFor="assignedTo">Assigned To</Label>
            <Select
              value={
                isEditing
                  ? (typeof (editData as any).assignedTo === "string"
                      ? (editData as any).assignedTo
                      : (editData as any).assignedTo?._id) ??
                    lead.assignedTo?._id ??
                    ""
                  : lead.assignedTo?._id ?? ""
              }
              onValueChange={(v) =>
                onChange({ ...editData, assignedTo: v } as any)
              }
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Developer" />
              </SelectTrigger>
              <SelectContent>
                {userList
                  .filter((user: AdminUser) => user.role === "developer") // 👈 only developers
                  .map((user: AdminUser) => (
                    <SelectItem
                      className="capitalize"
                      key={user._id}
                      value={user._id}
                    >
                      {user.username} ({user.role})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Internal Notes</Label>
          <Textarea
            id="notes"
            rows={3}
            value={isEditing ? editData.notes ?? "" : lead.notes ?? ""}
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
