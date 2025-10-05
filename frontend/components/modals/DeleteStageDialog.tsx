"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStagesStore } from "@/stores/stages.store";
import type { Stage } from "@/types/lead";

const DeleteStageDialog = ({
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
  const { remove } = useStagesStore();
  const [deleting, setDeleting] = useState(false);

  const stageId = (stage as any)?.id ?? (stage as any)?._id ?? "";

  const canDelete = !!stageId;

  const handleDelete = async () => {
    if (!canDelete) return;
    setDeleting(true);
    await remove(stageId); // no targetStageId
    setDeleting(false);
    onOpenChange(false);
    await onDone?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Delete “{stage?.name}”</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this stage? This action cannot be
            undone.
          </p>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={!canDelete || deleting}
            >
              {deleting ? "Deleting…" : "Delete stage"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteStageDialog;
