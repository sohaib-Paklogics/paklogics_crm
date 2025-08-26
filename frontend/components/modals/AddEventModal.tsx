"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import type { LeadEvent } from "@/types/lead";

const AddEventModal = ({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (
    payload: Pick<
      LeadEvent,
      "title" | "startTime" | "endTime" | "timezone" | "description"
    >
  ) => Promise<void>;
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const toISO = (local: string) => new Date(local).toISOString();
  const userTZ =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Karachi";

  const canSubmit = title && start && end;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onCreate({
        title,
        description: description || undefined,
        startTime: toISO(start),
        endTime: toISO(end),
        timezone: userTZ,
      });
      // reset local form after successful create
      setTitle("");
      setDescription("");
      setStart("");
      setEnd("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-validiz-brown">
            Add New Event
          </DialogTitle>
          <DialogDescription>
            Schedule an interview, test, or follow-up
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                placeholder="Enter event title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tz">Timezone</Label>
              <Input id="tz" value={userTZ} disabled />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Event description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Date & Time *</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Date & Time *</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                min={start || undefined}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-validiz-brown hover:bg-validiz-brown/90"
              disabled={!canSubmit || submitting}
            >
              Create Event
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEventModal;
