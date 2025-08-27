"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useLeadsStore } from "@/stores/leads.store";
import { useStagesStore } from "@/stores/stages.store"; // <- dynamic stages
import { useUserStore } from "@/stores/user-store";
import ButtonLoader from "../common/ButtonLoader";

type LeadSource = "website" | "referral" | "linkedin" | "job_board" | "other";

interface AddLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddLeadModal({
  open,
  onOpenChange,
  onSuccess,
}: AddLeadModalProps) {
  const { create, isLoading: creating } = useLeadsStore();

  // stages
  const {
    items: stages,
    fetch: fetchStages,
    isLoading: stagesLoading,
  } = useStagesStore();

  // users (we’ll filter to developers for assignment)
  const { users, fetchUsers, loading } = useUserStore();

  const [formData, setFormData] = useState<{
    clientName: string;
    jobDescription: string;
    source: LeadSource | "";
    stageId: string; // ObjectId of Stage
    assignedTo: string; // ObjectId of AdminUser (developer)
    notes: string;
  }>({
    clientName: "",
    jobDescription: "",
    source: "",
    stageId: "",
    assignedTo: "",
    notes: "",
  });

  // load stages + developers when modal opens
  useEffect(() => {
    if (!open) return;
    fetchStages();
    // You can filter at API, but if not, fetch and filter client-side:
    fetchUsers?.({ page: 1, limit: 10 } as any);
  }, [open, fetchStages, fetchUsers]);
  console.log("AddLeadModal: users", users);

  // pick default stage (isDefault) when stages loaded
  useEffect(() => {
    if (!open) return;
    if (!formData.stageId && stages?.length) {
      const def = stages.find((s: any) => s.isDefault) ?? stages[0];
      if (def?._id) {
        setFormData((p) => ({ ...p, stageId: def._id }));
      }
    }
  }, [open, stages, formData.stageId]);

  const selectedStage = useMemo(
    () => stages?.find((s: any) => String(s._id) === String(formData.stageId)),
    [stages, formData.stageId]
  );

  // status is derived from stage.key (read-only)
  const derivedStatus = selectedStage?.key ?? "new";

  const developers = useMemo(
    () => (users || []).filter((u: any) => u.role === "developer"),
    [users]
  );

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      clientName: "",
      jobDescription: "",
      source: "",
      stageId: "",
      assignedTo: "",
      notes: "",
    });
  };

  const isBusy = creating || stagesLoading || loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clientName || !formData.jobDescription || !formData.source)
      return;
    if (!formData.stageId) return;

    const payload: any = {
      clientName: formData.clientName,
      jobDescription: formData.jobDescription,
      source: formData.source,
      stage: formData.stageId,
    };

    if (formData.assignedTo) payload.assignedTo = formData.assignedTo;
    if (formData.notes) payload.notes = formData.notes;

    const created = await create(payload);
    if (created) {
      resetForm();
      onSuccess?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name *</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) =>
                  handleInputChange("clientName", e.target.value)
                }
                required
                disabled={isBusy}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Source *</Label>
              <Select
                value={formData.source}
                onValueChange={(value) =>
                  handleInputChange("source", value as LeadSource)
                }
                disabled={isBusy}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="job_board">Job Board</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Job Description */}
          <div className="space-y-2">
            <Label htmlFor="jobDescription">Job Description *</Label>
            <Textarea
              id="jobDescription"
              value={formData.jobDescription}
              onChange={(e) =>
                handleInputChange("jobDescription", e.target.value)
              }
              rows={3}
              required
              disabled={isBusy}
            />
          </div>

          {/* Row 2: Stage + Developer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stage">Pipeline Stage *</Label>
              <Select
                value={formData.stageId}
                onValueChange={(value) => handleInputChange("stageId", value)}
                disabled={isBusy || !stages?.length}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      stagesLoading ? "Loading stages..." : "Select stage"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {(stages || []).map((s: any) => (
                    <SelectItem key={s._id} value={s._id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Read-only status hint */}
              <p className="text-xs text-muted-foreground">
                Stage:{" "}
                <span className="font-medium">
                  {derivedStatus.replace("_", " ")}
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assign Developer</Label>
              <Select
                // if no assignee, select the sentinel "unassigned"
                value={formData.assignedTo ? formData.assignedTo : "unassigned"}
                onValueChange={(value) =>
                  handleInputChange(
                    "assignedTo",
                    value === "unassigned" ? "" : value
                  )
                }
                disabled={isBusy}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={loading ? "Loading users..." : "Optional"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {/* <-- sentinel value (NOT empty string) */}
                  <SelectItem value="unassigned">Unassigned</SelectItem>

                  {developers.map((u: any) => (
                    <SelectItem
                      className="capitalize"
                      key={u._id}
                      value={u._id}
                    >
                      {u.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
              placeholder="Add any additional notes..."
              disabled={isBusy}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isBusy}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isBusy ||
                !formData.clientName ||
                !formData.jobDescription ||
                !formData.source ||
                !formData.stageId
              }
            >
              {(creating || stagesLoading) && <ButtonLoader />}
              Add Lead
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
