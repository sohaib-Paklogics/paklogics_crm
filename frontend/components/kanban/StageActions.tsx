"use client";

import { useCallback, useMemo, useState } from "react";
import { MoreVertical, Plus, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Stage } from "@/types/lead";
import EditStageDialog from "../modals/EditStageDialog";
import DeleteStageDialog from "../modals/DeleteStageDialog";
import { useStagesStore } from "@/stores/stages.store";
import ButtonLoader from "../common/ButtonLoader";

type Actions = {
  addBefore: (name: string, color?: string) => Promise<void>;
  addAfter: (name: string, color?: string) => Promise<void>;
  refresh?: () => Promise<void>;
};

export function StageActions({ stage, actions }: { stage: Stage; actions: Actions }) {
  // Dialogs
  const [openCreate, setOpenCreate] = useState(false);
  const [where, setWhere] = useState<"before" | "after">("after");
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [color, setColor] = useState(stage?.color || "#999999");
  const [submitting, setSubmitting] = useState(false);

  // Reflect store loading for adjacent insert next to this pivot
  const insertAdjacentLoadingFor = useStagesStore((s) => s.insertAdjacentLoadingFor);
  const storeBusyHere = insertAdjacentLoadingFor === String(stage._id);
  const isBusy = submitting || storeBusyHere;

  const canSubmit = useMemo(() => name.trim().length >= 2, [name]);

  const openCreateDialog = useCallback(
    (pos: "before" | "after") => {
      setWhere(pos);
      setName("");
      setColor(stage?.color || "#999999");
      setOpenCreate(true);
    },
    [stage?.color],
  );

  const handleCreate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSubmit || isBusy) return;

      setSubmitting(true);
      try {
        const trimmed = name.trim();
        if (where === "before") {
          await actions.addBefore(trimmed, color);
        } else {
          await actions.addAfter(trimmed, color);
        }

        // Close + reset, then optional refresh
        setOpenCreate(false);
        setName("");
        setColor(stage?.color || "#999999");

        await actions.refresh?.();
      } finally {
        setSubmitting(false);
      }
    },
    [actions, canSubmit, color, isBusy, name, stage?.color, where],
  );

  // Keep text input and color picker roughly in sync
  const onColorTextChange = (v: string) => {
    const next = v.startsWith("#") ? v : `#${v}`;
    setColor(next);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="p-1 rounded outline-none focus:ring-2 focus:ring-white/60"
            aria-label="Stage actions"
          >
            <MoreVertical className="h-4 w-4 text-white" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onClick={() => openCreateDialog("before")}>
            <Plus className="h-4 w-4 mr-2" />
            Add stage (before)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openCreateDialog("after")}>
            <Plus className="h-4 w-4 mr-2" />
            Add stage (after)
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setOpenEdit(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            Rename / recolor
          </DropdownMenuItem>

          <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => setOpenDelete(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
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
                disabled={isBusy}
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
                  disabled={isBusy}
                />
                <Input
                  value={color}
                  onChange={(e) => onColorTextChange(e.target.value)}
                  placeholder="#E2B144"
                  disabled={isBusy}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpenCreate(false)} disabled={isBusy}>
                Cancel
              </Button>
              <Button type="submit" disabled={!canSubmit || isBusy}>
                {isBusy ? (
                  <span className="inline-flex items-center gap-2">
                    <ButtonLoader />
                    Creating…
                  </span>
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <EditStageDialog open={openEdit} onOpenChange={setOpenEdit} stage={stage} onDone={actions.refresh} />

      {/* Delete */}
      <DeleteStageDialog open={openDelete} onOpenChange={setOpenDelete} stage={stage} onDone={actions.refresh} />
    </>
  );
}
