"use client";

import { useState } from "react";
import { MoreVertical, Plus } from "lucide-react";
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
  const [open, setOpen] = useState(false);
  const [where, setWhere] = useState<"before" | "after">("after");
  const [name, setName] = useState("");
  const [color, setColor] = useState(stage?.color || "#999999");

  const canSubmit = name.trim().length >= 2;

  const openDialog = (pos: "before" | "after") => {
    setWhere(pos);
    setName("");
    setColor(stage?.color || "#999999");
    setOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    if (where === "before") {
      await actions.addBefore(name.trim(), color);
    } else {
      await actions.addAfter(name.trim(), color);
    }

    setOpen(false);
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
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={() => openDialog("before")}>
            <Plus className="h-4 w-4 mr-2" />
            stage (before)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openDialog("after")}>
            <Plus className="h-4 w-4 mr-2" />
            stage (after)
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {/* future: rename, recolor, delete, move … */}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
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
                onClick={() => setOpen(false)}
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
    </>
  );
}
