"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DragDropContext,
  type DropResult,
  type DragStart,
} from "react-beautiful-dnd";
import { Eye, Plus } from "lucide-react";

import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import useAuthStore from "@/stores/auth-store";
import { useKanbanStore } from "@/stores/kanban.store";
import { useStagesStore } from "@/stores/stages.store";
import type { Lead, Stage } from "@/types/lead";
import { Button } from "@/components/ui/button";
import { AddLeadModal } from "@/components/modals/add-lead-modal";
import KanbanColumn from "@/components/leadDetail/KanbanColumn";
import Loader from "@/components/common/Loader";
import Link from "next/link";

export default function KanbanPage() {
  const { user, hasPermission } = useAuthStore();
  const { board, isLoading, fetchBoard, moveCard } = useKanbanStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const {
    items: stages,
    fetch: fetchStages,
    isLoading: stagesLoading,
    addBefore,
    addAfter,
  } = useStagesStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const buildBoardParams = useCallback(() => {
    const params: Record<string, any> = { limit: 100 };
    if (!user) return params;
    if (user.role === "business_developer") params.createdBy = user.id;
    if (user.role === "developer") params.assignedTo = user.id;
    return params;
  }, [user]);

  const refreshBoard = useCallback(async () => {
    await fetchStages();
    await fetchBoard(buildBoardParams());
  }, [fetchStages, fetchBoard, buildBoardParams]);

  useEffect(() => {
    if (!user) return;
    refreshBoard();
  }, [user, refreshBoard]);

  const canDragDrop =
    hasPermission({ action: "update", resource: "leads" }) ||
    (user && (user.role === "admin" || user.role === "superadmin"));

  const applyRoleFilter = (items: Lead[]) => {
    if (!user) return [];
    if (user.role === "admin" || user.role === "superadmin") return items;

    if (user.role === "business_developer") {
      return items.filter(
        (l) =>
          String(
            typeof l.createdBy === "string" ? l.createdBy : l.createdBy?._id
          ) === String(user.id)
      );
    }
    if (user.role === "developer") {
      return items.filter(
        (l) =>
          String(
            typeof l.assignedTo === "string" ? l.assignedTo : l.assignedTo?._id
          ) === String(user.id)
      );
    }
    return items;
  };

  const columns = useMemo(() => {
    const colEntries: { stage: Stage; leads: Lead[] }[] = [];
    if (!board || !stages?.length) return colEntries;

    for (const s of stages) {
      const col = board.columns[String(s._id)];
      const leads = applyRoleFilter(col?.data ?? []);
      colEntries.push({ stage: s, leads });
    }
    return colEntries;
  }, [board, stages, user]);

  const total = useMemo(
    () => columns.reduce((sum, c) => sum + c.leads.length, 0),
    [columns]
  );

  // ---------- Horizontal edge auto-scroll while dragging ----------
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const lastPointer = useRef<{ x: number; y: number } | null>(null);

  const EDGE_PX = 80; // distance from left/right edge that triggers scroll
  const SCROLL_PX = 24; // amount to scroll per animation frame

  const onPointerMove = useCallback((e: PointerEvent) => {
    lastPointer.current = { x: e.clientX, y: e.clientY };
  }, []);

  const tick = useCallback(() => {
    if (!isDraggingRef.current || !scrollRef.current || !lastPointer.current) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }
    const el = scrollRef.current;
    const rect = el.getBoundingClientRect();
    const { x } = lastPointer.current;

    if (x - rect.left < EDGE_PX) {
      el.scrollBy({ left: -SCROLL_PX, behavior: "auto" });
    } else if (rect.right - x < EDGE_PX) {
      el.scrollBy({ left: SCROLL_PX, behavior: "auto" });
    }

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const startAutoScroll = useCallback(() => {
    isDraggingRef.current = true;
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    rafRef.current = requestAnimationFrame(tick);
  }, [onPointerMove, tick]);

  const stopAutoScroll = useCallback(() => {
    isDraggingRef.current = false;
    window.removeEventListener("pointermove", onPointerMove);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    lastPointer.current = null;
  }, [onPointerMove]);

  useEffect(() => {
    return () => {
      stopAutoScroll();
    };
  }, [stopAutoScroll]);
  // ----------------------------------------------------------------

  if (!mounted || !user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-validiz-brown" />
        </div>
      </MainLayout>
    );
  }

  if (isLoading) {
    return (
      <MainLayout>
        <Loader />
      </MainLayout>
    );
  }

  const onDragStart = (_: DragStart) => {
    // kick off horizontal edge auto-scroll
    startAutoScroll();
  };

  const onDragEnd = async (result: DropResult) => {
    // always stop edge auto-scroll
    stopAutoScroll();

    if (!canDragDrop) return;
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const from = source.droppableId;
    const to = destination.droppableId;
    if (from === to && destination.index === source.index) return;

    await moveCard(String(draggableId), String(from), String(to));
  };

  const changeStatusViaMenu = async (lead: Lead, toStageId: string) => {
    const fromId = String(
      typeof lead.stage === "string" ? lead.stage : lead.stage?._id
    );
    if (fromId === toStageId) return;
    await moveCard(String(lead._id), fromId, toStageId);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-validiz-brown">
              Lead Pipeline
            </h1>
            <p className="text-gray-600 mt-1">
              Track leads through your sales pipeline
              {!canDragDrop && " (Read-only view)"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/leads" className="flex items-center">
              <Button variant={"ghost"}>
                <Eye className="w-4 h-4 mr-2" />
                View Lead
              </Button>
            </Link>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Lead
            </Button>
          </div>
        </div>

        {/* Kanban Board */}
        <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-4 overscroll-x-contain"
            style={{ scrollBehavior: "auto" }} // ensure instant programmatic scroll
          >
            {(stagesLoading ? [] : columns).map(({ stage, leads }) => (
              <KanbanColumn
                key={stage._id}
                stage={stage}
                leads={leads}
                canDragDrop={!!canDragDrop}
                isLoading={isLoading || stagesLoading}
                allStages={stages}
                onChangeStatus={changeStatusViaMenu}
                stageActions={{
                  addBefore: async (name: string, color?: string) => {
                    await addBefore(stage._id, name, color);
                    await refreshBoard();
                  },
                  addAfter: async (name: string, color?: string) => {
                    await addAfter(stage._id, name, color);
                    await refreshBoard();
                  },
                  refresh: refreshBoard,
                }}
              />
            ))}
          </div>
        </DragDropContext>

        {/* Stats Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-validiz-brown">
              Pipeline Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {columns.map(({ stage, leads }) => {
                const percent = total
                  ? Math.round((leads.length / total) * 100)
                  : 0;
                return (
                  <div key={stage._id} className="text-center">
                    <div
                      className="w-4 h-4 rounded-full mx-auto mb-2"
                      style={{ background: stage.color }}
                    />
                    <p className="text-2xl font-bold text-validiz-brown">
                      {leads.length}
                    </p>
                    <p className="text-sm text-gray-600">{stage.name}</p>
                    <p className="text-xs text-gray-500">{percent}% of total</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <AddLeadModal
          open={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
          onSuccess={async () => {
            setIsAddModalOpen(false);
            await fetchBoard(buildBoardParams());
          }}
        />
      </div>
    </MainLayout>
  );
}
