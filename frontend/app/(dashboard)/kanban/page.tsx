"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
  DroppableProps,
} from "react-beautiful-dnd";
import { MoreVertical, Plus, User } from "lucide-react";

import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import useAuthStore from "@/stores/auth-store";
import { useKanbanStore } from "@/stores/kanban.store";
import { useStagesStore } from "@/stores/stages.store";
import type { Lead, Stage } from "@/types/lead";
import { StageActions } from "@/components/StageActions";
import ButtonLoader from "@/components/common/ButtonLoader";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AddLeadModal } from "@/components/modals/add-lead-modal";

/** React 18 StrictMode helper for react-beautiful-dnd */
function StrictModeDroppable(props: DroppableProps) {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(raf);
      setEnabled(false);
    };
  }, []);
  if (!enabled) return null;
  return <Droppable {...props} />;
}

export default function KanbanPage() {
  const { user, hasPermission } = useAuthStore();
  const { board, isLoading, fetchBoard, moveCard } = useKanbanStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // ⬇️ pull adjacent-insert helpers so StageActions doesn’t do ordering logic
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
    // always fetch stages first (sorted by `order` in store), then board
    await fetchStages();
    await fetchBoard(buildBoardParams());
  }, [fetchStages, fetchBoard, buildBoardParams]);

  // initial loads
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

  // Build columns from dynamic stages (store already sorts by `order`)
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

  if (!mounted || !user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-validiz-brown" />
        </div>
      </MainLayout>
    );
  }

  const onDragEnd = async (result: DropResult) => {
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
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
        </div>

        {/* Kanban Board */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(stagesLoading ? [] : columns).map(({ stage, leads }) => (
              <KanbanColumn
                key={stage._id}
                stage={stage}
                leads={leads}
                canDragDrop={!!canDragDrop}
                isLoading={isLoading || stagesLoading}
                allStages={stages}
                onChangeStatus={changeStatusViaMenu}
                // ⬇️ pass *functions* to StageActions; StageActions shouldn’t know ordering logic
                stageActions={{
                  addBefore: async (name: string, color?: string) => {
                    await addBefore(stage._id, name, color);
                    await refreshBoard();
                  },
                  addAfter: async (name: string, color?: string) => {
                    await addAfter(stage._id, name, color);
                    await refreshBoard();
                  },
                  refresh: refreshBoard, // optional, if StageActions needs it
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

/* ---------- Sub-components ---------- */

function KanbanColumn({
  stage,
  leads,
  canDragDrop,
  isLoading,
  allStages,
  onChangeStatus,
  stageActions,
}: {
  stage: Stage;
  leads: Lead[];
  canDragDrop: boolean;
  isLoading: boolean;
  allStages: Stage[];
  onChangeStatus: (lead: Lead, toStageId: string) => Promise<void>;
  stageActions: {
    addBefore: (name: string, color?: string) => Promise<void>;
    addAfter: (name: string, color?: string) => Promise<void>;
    refresh?: () => Promise<void>;
  };
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ background: stage.color }}
          />
          <h3 className="font-semibold text-validiz-brown">{stage.name}</h3>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-gray-100 text-gray-600">
            {isLoading ? <ButtonLoader color="border-black" /> : leads.length}
          </Badge>

          {/* ✅ StageActions now receives *functions*, not inline code */}
          <StageActions stage={stage} actions={stageActions} />
        </div>
      </div>

      <StrictModeDroppable droppableId={String(stage._id)}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[500px] p-3 rounded-lg border-2 border-dashed transition-colors ${
              snapshot.isDraggingOver
                ? "border-validiz-mustard bg-validiz-mustard/5"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            {leads.map((lead, index) => (
              <Link href={`/leads/${lead._id}`} key={String(lead._id)}>
                <LeadCard
                  key={String(lead._id)}
                  lead={lead}
                  index={index}
                  canDragDrop={canDragDrop}
                  allStages={allStages}
                  onChangeStatus={onChangeStatus}
                />
              </Link>
            ))}
            {provided.placeholder}

            {!isLoading && leads.length === 0 && (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                <div className="text-center">
                  <p className="text-sm">No leads</p>
                  <p className="text-xs mt-1">
                    {canDragDrop ? "Drag leads here" : "No leads in this stage"}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </StrictModeDroppable>
    </div>
  );
}

function LeadCard({
  lead,
  index,
  canDragDrop,
  allStages,
  onChangeStatus,
}: {
  lead: Lead;
  index: number;
  canDragDrop: boolean;
  allStages: Stage[];
  onChangeStatus: (lead: Lead, toStageId: string) => Promise<void>;
}) {
  const whileDragging = (isDragging: boolean) =>
    `mb-3 ${isDragging ? "rotate-2" : ""}`;
  const hoverScale = (isDragging: boolean) =>
    `cursor-pointer transition-all hover:shadow-md ${
      !isDragging && canDragDrop ? "hover:scale-105" : ""
    }`;
  const assigned =
    lead.assignedTo && typeof lead.assignedTo === "object"
      ? lead.assignedTo
      : null;

  const stageId = String(
    typeof lead.stage === "string" ? lead.stage : lead.stage?._id
  );

  return (
    <Draggable
      draggableId={String(lead._id)}
      index={index}
      isDragDisabled={!canDragDrop}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={whileDragging(snapshot.isDragging)}
        >
          <Card className={hoverScale(snapshot.isDragging)}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-validiz-brown text-sm">
                      {lead.clientName}
                    </h4>
                    <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                      {lead.jobDescription}
                    </p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="p-1 rounded hover:bg-gray-100"
                        aria-label="Lead actions"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4 text-gray-500" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuLabel>Move to…</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {allStages.map((s) => (
                        <DropdownMenuItem
                          key={s._id}
                          disabled={String(s._id) === stageId}
                          onClick={(e) => {
                            e.stopPropagation();
                            onChangeStatus(lead, String(s._id));
                          }}
                          className="flex items-center justify-between"
                        >
                          <span>{s.name}</span>
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ background: s.color }}
                          />
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs capitalize">
                    {lead.source === "job_board"
                      ? "Job Board"
                      : lead.source.replace("_", " ")}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    {assigned ? (
                      <div className="flex items-center space-x-1">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-validiz-brown text-white">
                            {assigned.username?.charAt(0)?.toUpperCase() ?? "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-600">
                          {assigned.username}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-gray-400">
                        <User className="h-4 w-4" />
                        <span className="text-xs">Unassigned</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  Created {new Date(lead.createdAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
}
