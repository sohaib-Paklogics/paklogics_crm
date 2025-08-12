"use client";

import { useState } from "react";
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
import { useLeadStore } from "@/stores/lead-store";
import { Loader2 } from "lucide-react";

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
  const { createLead, isLoading } = useLeadStore();
  const [formData, setFormData] = useState({
    clientName: "",
    jobDescription: "",
    source: "",
    status: "New" as const,
    assignedTo: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await createLead({
      clientName: formData.clientName,
      jobDescription: formData.jobDescription,
      source: formData.source,
      status: formData.status,
      assignedTo: formData.assignedTo || undefined,
      notes: formData.notes || undefined,
    });

    if (result) {
      // Reset form
      setFormData({
        clientName: "",
        jobDescription: "",
        source: "",
        status: "New",
        assignedTo: "",
        notes: "",
      });
      onSuccess?.();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name *</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) =>
                  handleInputChange("clientName", e.target.value)
                }
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Select
                value={formData.source}
                onValueChange={(value) => handleInputChange("source", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="job_board">Job Board</SelectItem>
                  <SelectItem value="website">Company Website</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobDescription">Job Description</Label>
            <Textarea
              id="jobDescription"
              value={formData.jobDescription}
              onChange={(e) =>
                handleInputChange("jobDescription", e.target.value)
              }
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
                disabled={isLoading}
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
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Input
                id="assignedTo"
                value={formData.assignedTo}
                onChange={(e) =>
                  handleInputChange("assignedTo", e.target.value)
                }
                placeholder="Enter assignee name"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
              placeholder="Add any additional notes..."
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Lead
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
