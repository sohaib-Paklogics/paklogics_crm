"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStagesStore } from "@/stores/stages.store";
import type { Stage } from "@/types/lead";


const EditStageDialog = ({
  open,
  onOpenChange,
  stage,
  onDone,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  stage: Stage;
  onDone?: () => Promise<void> | void;
}) => {
  const { update } = useStagesStore();
  const [name, setName] = useState(stage?.name ?? "");
  const [color, setColor] = useState(stage?.color ?? "#999999");
  const [saving, setSaving] = useState(false);

  // Reset fields whenever dialog opens for this stage
  const stageId = (stage as any)?.id ?? (stage as any)?._id ?? "";
  const canSubmit = name.trim().length >= 2;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !stageId) return;
    setSaving(true);
    await update(stageId, { name: name.trim(), color });
    setSaving(false);
    onOpenChange(false);
    await onDone?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Edit “{stage?.name}”</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="editStageName">Stage name</Label>
            <Input
              id="editStageName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Negotiation"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="editStageColor">Color</Label>
            <div className="flex items-center gap-2">
              <input
                id="editStageColor"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-9 w-12 cursor-pointer rounded border"
              />
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#E2B144"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
export default EditStageDialog;
