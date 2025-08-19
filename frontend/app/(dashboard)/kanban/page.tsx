"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Button } from "@/components/ui/button";
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
import type { Lead, LeadStatus } from "@/types/lead";

const COLUMNS: { id: LeadStatus; title: string; color: string }[] = [
  { id: "new", title: "New", color: "bg-validiz-mustard" },
  {
    id: "interview_scheduled",
    title: "Interview Scheduled",
    color: "bg-blue-500",
  },
  { id: "test_assigned", title: "Test Assigned", color: "bg-orange-500" },
  { id: "completed", title: "Completed", color: "bg-green-500" },
];

/** Fix for React 18 StrictMode + react-beautiful-dnd */
function StrictModeDroppable(props: DroppableProps) {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);
  if (!enabled) return null;
  return <Droppable {...props} />;
}

export default function KanbanPage() {
  const { user, hasPermission } = useAuthStore();
  const { board, isLoading, fetchBoard, moveCard } = useKanbanStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!user) return;
    // Fetch board with role-based server filters
    const params: Record<string, any> = { limit: 50 };
    if (user.role === "business_developer") params.createdBy = user.id;
    if (user.role === "developer") params.assignedTo = user.id;
    fetchBoard(params);
  }, [user, fetchBoard]);

  const canDragDrop =
    hasPermission({ action: "update", resource: "leads" }) ||
    // optional: allow admins by default
    (user && (user.role === "admin" || user.role === "superadmin"));

  const applyRoleFilter = (items: Lead[]) => {
    if (!user) return [];
    if (user.role === "admin" || user.role === "superadmin") return items;
    if (user.role === "business_developer") {
      return items.filter(
        (l) =>
          (typeof l.createdBy === "string" ? l.createdBy : l.createdBy?._id) ===
          user.id
      );
    }
    if (user.role === "developer") {
      return items.filter(
        (l) =>
          (typeof l.assignedTo === "string"
            ? l.assignedTo
            : l.assignedTo?._id) === user.id
      );
    }
    return items;
  };

  const columnData = useMemo(() => {
    return {
      new: applyRoleFilter(board?.new?.data ?? []),
      interview_scheduled: applyRoleFilter(
        board?.interview_scheduled?.data ?? []
      ),
      test_assigned: applyRoleFilter(board?.test_assigned?.data ?? []),
      completed: applyRoleFilter(board?.completed?.data ?? []),
    } as Record<LeadStatus, Lead[]>;
  }, [board, user]);

  const totalFiltered = useMemo(
    () =>
      columnData.new.length +
        columnData.interview_scheduled.length +
        columnData.test_assigned.length +
        columnData.completed.length || 0,
    [columnData]
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

    const from = source.droppableId as LeadStatus;
    const to = destination.droppableId as LeadStatus;

    if (from === to && destination.index === source.index) return;

    await moveCard(String(draggableId), from, to);
  };

  const changeStatusViaMenu = async (lead: Lead, to: LeadStatus) => {
    if (lead.status === to) return;
    await moveCard(String(lead._id), lead.status as LeadStatus, to);
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
        </div>

        {/* Kanban Board */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                columnId={col.id}
                title={col.title}
                color={col.color}
                leads={columnData[col.id]}
                canDragDrop={!!canDragDrop}
                isLoading={isLoading}
                onChangeStatus={changeStatusViaMenu}
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
              {COLUMNS.map((col) => {
                const count = columnData[col.id].length;
                const pct =
                  totalFiltered > 0
                    ? Math.round((count / totalFiltered) * 100)
                    : 0;
                return (
                  <div key={col.id} className="text-center">
                    <div
                      className={`w-4 h-4 rounded-full ${col.color} mx-auto mb-2`}
                    />
                    <p className="text-2xl font-bold text-validiz-brown">
                      {count}
                    </p>
                    <p className="text-sm text-gray-600">{col.title}</p>
                    <p className="text-xs text-gray-500">{pct}% of total</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

/* ===========================
   Sub-components
   =========================== */

function KanbanColumn({
  columnId,
  title,
  color,
  leads,
  canDragDrop,
  isLoading,
  onChangeStatus,
}: {
  columnId: LeadStatus;
  title: string;
  color: string;
  leads: Lead[];
  canDragDrop: boolean;
  isLoading: boolean;
  onChangeStatus: (lead: Lead, to: LeadStatus) => Promise<void>;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${color}`} />
          <h3 className="font-semibold text-validiz-brown">{title}</h3>
        </div>
        <Badge variant="secondary" className="bg-gray-100 text-gray-600">
          {isLoading ? "…" : leads.length}
        </Badge>
      </div>

      {/* StrictMode-safe Droppable */}
      <StrictModeDroppable droppableId={String(columnId)}>
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
              <LeadCard
                key={String(lead._id)}
                lead={lead}
                index={index}
                canDragDrop={canDragDrop}
                onChangeStatus={onChangeStatus}
              />
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
  onChangeStatus,
}: {
  lead: Lead;
  index: number;
  canDragDrop: boolean;
  onChangeStatus: (lead: Lead, to: LeadStatus) => Promise<void>;
}) {
  const whileDragging = (isDragging: boolean) =>
    `mb-3 ${isDragging ? "rotate-2" : ""}`;

  const hoverScale = (isDragging: boolean) =>
    `cursor-pointer transition-all hover:shadow-md ${
      !isDragging && canDragDrop ? "hover:scale-105" : ""
    }`;

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

                  {/* 3-dot menu */}
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
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {(
                        [
                          "new",
                          "interview_scheduled",
                          "test_assigned",
                          "completed",
                        ] as LeadStatus[]
                      ).map((s) => (
                        <DropdownMenuItem
                          key={s}
                          disabled={lead.status === s}
                          onClick={(e) => {
                            e.stopPropagation();
                            onChangeStatus(lead, s);
                          }}
                          className="capitalize"
                        >
                          {s.replace("_", " ")}
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
                    {lead.assignedTo ? (
                      <div className="flex items-center space-x-1">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-validiz-brown text-white">
                            {lead.assignedTo.username
                              ?.charAt(0)
                              ?.toUpperCase() ?? "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-600">
                          {lead.assignedTo.username}
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
