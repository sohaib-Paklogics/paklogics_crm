"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

import { useLeadsStore } from "@/stores/leads.store";
import { useStagesStore } from "@/stores/stages.store";
import { useUserStore } from "@/stores/user.store";
import ButtonLoader from "../common/ButtonLoader";

type LeadSource = "website" | "referral" | "linkedin" | "job_board" | "other";

interface AddLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddLeadModal({ open, onOpenChange, onSuccess }: AddLeadModalProps) {
  const { create, isLoading: creating } = useLeadsStore();

  // stages
  const { items: stages, fetch: fetchStages, fetchLoading: stagesLoading } = useStagesStore();

  // developers
  const { users, fetchDeveloper, loading: developersLoading } = useUserStore();

  const [formData, setFormData] = useState<{
    clientName: string;
    jobDescription: string;
    source: LeadSource | "";
    stageId: string;
    assignedTo: string;
    notes: string;
  }>({
    clientName: "",
    jobDescription: "",
    source: "",
    stageId: "",
    assignedTo: "",
    notes: "",
  });

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

  const handleDialogOpenChange = (next: boolean) => {
    if (!next) {
      resetForm();
    }
    onOpenChange(next);
  };

  // load stages + developers when modal opens
  useEffect(() => {
    if (!open) return;
    fetchStages();
    fetchDeveloper?.({ page: 1, limit: 50 } as any);
  }, [open, fetchStages, fetchDeveloper]);

  // pick default stage (isDefault) when stages loaded
  useEffect(() => {
    if (!open) return;
    if (!formData.stageId && stages?.length) {
      const def = (stages as any[]).find((s) => s.isDefault) ?? stages[0];
      if (def?._id) {
        setFormData((p) => ({ ...p, stageId: def._id }));
      }
    }
  }, [open, stages, formData.stageId]);

  const selectedStage = useMemo(
    () => (stages || []).find((s: any) => String(s._id) === String(formData.stageId)),
    [stages, formData.stageId],
  );

  // status is derived from stage.key (read-only)
  const derivedStatus = selectedStage?.key ?? "new";

  // guard: only developers (even if API already returns just devs)
  const developers = useMemo(() => (users || []).filter((u: any) => u.role === "developer"), [users]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isBusy = creating || stagesLoading || developersLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clientName || !formData.jobDescription || !formData.source) return;
    if (!formData.stageId) return;

    const payload: any = {
      clientName: formData.clientName.trim(),
      jobDescription: formData.jobDescription.trim(),
      source: formData.source,
      stage: formData.stageId,
    };

    if (formData.assignedTo) payload.assignedTo = formData.assignedTo;
    if (formData.notes.trim()) payload.notes = formData.notes.trim();

    const created = await create(payload);
    if (created) {
      resetForm();
      onSuccess?.();
      onOpenChange(false);
    }
  };

  const canSubmit =
    !!formData.clientName && !!formData.jobDescription && !!formData.source && !!formData.stageId && !isBusy;

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent
        className="w-[95vw] sm:max-w-[640px]
        max-h-[82vh] sm:max-h-[86vh]
        overflow-y-auto"
      >
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-lg font-semibold">Add New Lead</DialogTitle>
          <DialogDescription className="text-sm">
            Capture the key details for this lead. You can refine information later from the lead details page.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Lead Information */}
          <div className="rounded-md border bg-muted/30 px-4 py-3 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Lead Information</p>
              {isBusy && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading…
                </span>
              )}
            </div>

            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange("clientName", e.target.value)}
                  placeholder="e.g. Acme Inc. – Frontend Role"
                  required
                  disabled={isBusy}
                />
                <p className="text-xs text-muted-foreground">Use a clear, recognizable name (company + role).</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="source">Source *</Label>
                <Select
                  value={formData.source}
                  onValueChange={(value) => handleInputChange("source", value as LeadSource)}
                  disabled={isBusy}
                >
                  <SelectTrigger id="source">
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
                <p className="text-xs text-muted-foreground">Where did this lead originate from?</p>
              </div>
            </div>

            {/* Job Description */}
            <div className="space-y-1.5">
              <Label htmlFor="jobDescription">Job Description *</Label>
              <Textarea
                id="jobDescription"
                value={formData.jobDescription}
                onChange={(e) => handleInputChange("jobDescription", e.target.value)}
                rows={4}
                required
                disabled={isBusy}
                placeholder="Paste the core responsibilities, tech stack, and expectations…"
              />
            </div>
          </div>

          {/* Pipeline & Assignment */}
          <div className="rounded-md border bg-muted/30 px-4 py-3 space-y-4">
            <p className="text-sm font-medium text-muted-foreground">Pipeline & Assignment</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Stage */}
              <div className="space-y-1.5">
                <Label htmlFor="stage">Pipeline Stage *</Label>
                <Select
                  value={formData.stageId}
                  onValueChange={(value) => handleInputChange("stageId", value)}
                  disabled={isBusy || !stages?.length}
                >
                  <SelectTrigger id="stage">
                    <SelectValue placeholder={stagesLoading ? "Loading stages..." : "Select stage"} />
                  </SelectTrigger>
                  <SelectContent>
                    {(stages || []).map((s: any) => (
                      <SelectItem key={s._id} value={s._id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                  <span>Derived status</span>
                  <Badge variant="outline" className="px-2 py-0 text-[10px] font-medium capitalize">
                    {String(derivedStatus || "new").replace(/_/g, " ")}
                  </Badge>
                </div>
              </div>

              {/* Developer assignment */}
              <div className="space-y-1.5">
                <Label htmlFor="assignedTo">Assign Developer (optional)</Label>
                <Select
                  value={formData.assignedTo ? formData.assignedTo : "unassigned"}
                  onValueChange={(value) => handleInputChange("assignedTo", value === "unassigned" ? "" : value)}
                  disabled={isBusy}
                >
                  <SelectTrigger id="assignedTo">
                    <SelectValue placeholder={developersLoading ? "Loading developers..." : "Unassigned"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {developers.map((u: any) => {
                      const id = String(u.id ?? u._id);
                      return (
                        <SelectItem className="capitalize" key={id} value={id}>
                          {u.username}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Assign a developer now, or leave it unassigned for later.
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Internal Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
              placeholder="Anything the team should know before starting work…"
              disabled={isBusy}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => handleDialogOpenChange(false)} disabled={isBusy}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {(creating || stagesLoading) && <ButtonLoader />}
              Add Lead
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
