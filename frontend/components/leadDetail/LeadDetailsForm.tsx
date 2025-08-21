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
                <SelectValue />
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
            <Label htmlFor="status">Status</Label>
            <Select
              value={isEditing ? editData.status ?? lead.status : lead.status}
              onValueChange={(v) => set("status", v as string)}
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="interview_scheduled">
                  Interview Scheduled
                </SelectItem>
                <SelectItem value="test_assigned">Test Assigned</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedTo">Assigned To (User ID)</Label>
            <Input
              id="assignedTo"
              placeholder="Optional: AdminUser ObjectId"
              value={
                // allow free typing when editing
                isEditing
                  ? (typeof (editData as any).assignedTo === "string"
                      ? (editData as any).assignedTo
                      : (editData as any).assignedTo?._id) ??
                    lead.assignedTo?._id ??
                    ""
                  : lead.assignedTo?._id ?? ""
              }
              onChange={(e) => {
                // keep a simple shape that onSave can detect
                onChange({
                  ...editData,
                  assignedTo: e.target.value ? (e.target.value as any) : null,
                } as any);
              }}
              disabled={!isEditing}
            />
            <p className="text-xs text-muted-foreground">
              Replace with a searchable user picker later.
            </p>
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
