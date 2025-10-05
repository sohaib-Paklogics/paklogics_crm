"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DragDropContext, type DropResult, type DragStart } from "react-beautiful-dnd";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import KanbanColumn from "@/components/kanban/KanbanColumn";
import type { Lead, Stage } from "@/types/lead";
import { useHorizontalAutoscroll } from "@/hooks/useHorizontalAutoscroll";
import ColumnSkeleton from "./ColumnSkeleton";

type ColumnEntry = { stage: Stage; leads: Lead[] };

type Props = {
  // data
  board: { columns: Record<string, { stage: Stage; data: Lead[]; count: number }> } | null;
  stages: Stage[];
  // permissions
  canDragDrop: boolean;
  // loading flags
  boardLoading: boolean;
  stagesLoading: boolean;
  moveLoadingById: Record<string, boolean>;
  insertAdjacentLoadingFor?: string | null;
  // actions
  refreshBoard: () => Promise<void>;
  moveCard: (leadId: string, fromStageId: string, toStageId: string) => Promise<void>;
  addBefore: (pivotId: string, name: string, color?: string) => Promise<void>;
  addAfter: (pivotId: string, name: string, color?: string) => Promise<void>;
  // search
  filter: (leads: Lead[]) => Lead[];

  // highlighting hooks
  onStageMeasured?: () => void;
};

export default function KanbanBoard(props: Props) {
  const {
    board,
    stages,
    canDragDrop,
    boardLoading,
    stagesLoading,
    moveLoadingById,
    insertAdjacentLoadingFor,
    refreshBoard,
    moveCard,
    addBefore,
    addAfter,
    filter,
    onStageMeasured,
  } = props;

  const columns: ColumnEntry[] = useMemo(() => {
    const out: ColumnEntry[] = [];
    if (!board || !stages.length) return out;
    for (const s of stages) {
      const col = board.columns[String(s._id)];
      const leads = col?.data ?? [];
      out.push({ stage: s, leads: filter(leads) });
    }
    return out;
  }, [board, stages, filter]);

  const anyResults = useMemo(() => columns.some((c) => c.leads.length > 0), [columns]);

  // horizontal auto-scroll
  const {
    scrollRef,
    canScrollLeft,
    canScrollRight,
    startHoverScroll,
    stopHoverScroll,
    handleUserScroll,
    startAutoScroll,
    stopAutoScroll,
  } = useHorizontalAutoscroll();

  // drag handlers
  const onDragStart = (_: DragStart) => startAutoScroll();
  const onDragEnd = async (result: DropResult) => {
    stopAutoScroll();
    if (!canDragDrop) return;
    const { source, destination, draggableId } = result;
    if (!destination) return;
    const from = source.droppableId;
    const to = destination.droppableId;
    if (from === to && destination.index === source.index) return;
    await moveCard(String(draggableId), String(from), String(to));
  };

  // measure (optional)
  useEffect(() => {
    onStageMeasured?.();
  }, [columns.length, stagesLoading, onStageMeasured]);

  return (
    <div className="relative">
      {/* arrows */}
      {canScrollLeft && (
        <button
          type="button"
          aria-label="Scroll left"
          onMouseEnter={() => startHoverScroll(-1)}
          onMouseLeave={stopHoverScroll}
          onFocus={() => startHoverScroll(-1)}
          onBlur={stopHoverScroll}
          className="hidden sm:flex items-center justify-center absolute left-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/90 backdrop-blur shadow border border-gray-200 hover:bg-white transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}
      {canScrollRight && (
        <button
          type="button"
          aria-label="Scroll right"
          onMouseEnter={() => startHoverScroll(1)}
          onMouseLeave={stopHoverScroll}
          onFocus={() => startHoverScroll(1)}
          onBlur={stopHoverScroll}
          className="hidden sm:flex items-center justify-center absolute right-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/90 backdrop-blur shadow border border-gray-200 hover:bg-white transition"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      )}

      {/* edge gradients */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-white/90 to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white/90 to-transparent" />

      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 overscroll-x-contain pr-6"
          style={{ scrollBehavior: "auto" }}
          onScroll={handleUserScroll}
        >
          {/* loading skeletons while initial fetching */}
          {(boardLoading || stagesLoading) && !columns.length
            ? Array.from({ length: 3 }).map((_, i) => <ColumnSkeleton key={i} />)
            : columns.map(({ stage, leads }) => (
                <KanbanColumn
                  key={stage._id}
                  stage={stage}
                  leads={leads}
                  canDragDrop={!!canDragDrop}
                  // column-level subtle loading: when either fetching or inserting next to THIS stage
                  isLoading={Boolean(insertAdjacentLoadingFor === String(stage._id))}
                  allStages={stages}
                  // change status from menu -> moveCard
                  onChangeStatus={async (lead, toStageId) => {
                    const fromId = String(typeof lead.stage === "string" ? lead.stage : lead.stage?._id);
                    if (fromId === toStageId) return;
                    await moveCard(String(lead._id), fromId, toStageId);
                  }}
                  stageActions={{
                    addBefore: async (name: string, color?: string) => {
                      await addBefore(String(stage._id), name, color);
                      await refreshBoard();
                    },
                    addAfter: async (name: string, color?: string) => {
                      await addAfter(String(stage._id), name, color);
                      await refreshBoard();
                    },
                    refresh: async () => {
                      await refreshBoard();
                    },
                  }}
                />
              ))}
        </div>
      </DragDropContext>

      {/* empty state when search filters everything out */}
      {!boardLoading && !stagesLoading && !anyResults && (
        <Card className="mt-4">
          <CardContent className="py-10 text-center text-muted-foreground">
            No leads match your current filters.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
