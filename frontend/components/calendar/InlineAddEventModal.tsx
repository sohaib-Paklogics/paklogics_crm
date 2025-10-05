"use client";
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import ButtonLoader from "../common/ButtonLoader";

const InlineAddEventModal = ({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (payload: {
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    location?: string;
  }) => Promise<void>;
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState<string>(() => new Date().toISOString().slice(0, 16));
  const [end, setEnd] = useState<string>(() => new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16));
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);

  const canSave = title.trim().length >= 2 && !!start && !!end;

  // reset form when closed
  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setStart(new Date().toISOString().slice(0, 16));
      setEnd(new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16));
      setLocation("");
      setSaving(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-validiz-brown">Add Event</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Interview with John" />
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Start</Label>
              <Input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>End</Label>
              <Input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Location</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Zoom / Office" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button
              disabled={!canSave || saving}
              onClick={async () => {
                setSaving(true);
                await onCreate({
                  title: title.trim(),
                  description: description.trim() || undefined,
                  startTime: new Date(start).toISOString(),
                  endTime: new Date(end).toISOString(),
                  location: location.trim() || undefined,
                });
                setSaving(false);
              }}
            >
              {saving ? <ButtonLoader /> : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InlineAddEventModal;
