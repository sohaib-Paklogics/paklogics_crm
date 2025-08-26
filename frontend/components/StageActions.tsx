"use client";

import { useState, useMemo } from "react";
import { MoreVertical, Plus, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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

type Actions = {
  addBefore: (name: string, color?: string) => Promise<void>;
  addAfter: (name: string, color?: string) => Promise<void>;
  refresh?: () => Promise<void>;
};

export function StageActions({
  stage,
  actions,
}: {
  stage: Stage;
  actions: Actions;
}) {
  const [openCreate, setOpenCreate] = useState(false);
  const [where, setWhere] = useState<"before" | "after">("after");
  const [name, setName] = useState("");
  const [color, setColor] = useState(stage?.color || "#999999");

  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const canSubmit = name.trim().length >= 2;

  const openCreateDialog = (pos: "before" | "after") => {
    setWhere(pos);
    setName("");
    setColor(stage?.color || "#999999");
    setOpenCreate(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    if (where === "before") {
      await actions.addBefore(name.trim(), color);
    } else {
      await actions.addAfter(name.trim(), color);
    }

    setOpenCreate(false);
    await actions.refresh?.();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="p-1 rounded hover:bg-gray-100"
            aria-label="Stage actions"
          >
            <MoreVertical className="h-4 w-4 text-gray-500" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => openCreateDialog("before")}>
            <Plus className="h-4 w-4 mr-2" />
            stage (before)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openCreateDialog("after")}>
            <Plus className="h-4 w-4 mr-2" />
            stage (after)
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpenEdit(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            rename / recolor
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onClick={() => setOpenDelete(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create Adjacent */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>
              Add stage {where === "after" ? "after" : "before"} “{stage.name}”
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stageName">Stage name</Label>
              <Input
                id="stageName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Negotiation"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stageColor">Color</Label>
              <div className="flex items-center gap-2">
                <input
                  id="stageColor"
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
                onClick={() => setOpenCreate(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!canSubmit}>
                Create
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <EditStageDialog
        open={openEdit}
        onOpenChange={setOpenEdit}
        stage={stage}
        onDone={actions.refresh}
      />

      {/* Delete */}
      <DeleteStageDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        stage={stage}
        onDone={actions.refresh}
      />
    </>
  );
}

/* ----------------------------- Edit component ----------------------------- */

function EditStageDialog({
  open,
  onOpenChange,
  stage,
  onDone,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  stage: Stage;
  onDone?: () => Promise<void> | void;
}) {
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
}

/* ---------------------------- Delete component ---------------------------- */

function DeleteStageDialog({
  open,
  onOpenChange,
  stage,
  onDone,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  stage: Stage;
  onDone?: () => Promise<void> | void;
}) {
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
}
