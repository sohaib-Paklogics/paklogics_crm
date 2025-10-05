"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { useKanbanStore } from "@/stores/kanban.store";
import { useStagesStore } from "@/stores/stages.store";
import type { Lead } from "@/types/lead";
import useAuthStore from "@/stores/auth.store";
import KanbanHeader from "@/components/kanban/KanbanHeader";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import { AddLeadModal } from "@/components/modals/AddLeadModal";

export default function KanbanPage() {
  const { user, hasPermission } = useAuthStore();

  // stores with granular flags
  const { board, fetchLoading: boardLoading, moveLoadingById, fetchBoard, moveCard } = useKanbanStore();

  const {
    items: stages,
    fetch: fetchStages,
    fetchLoading: stagesLoading,
    addBefore,
    addAfter,
    insertAdjacentLoadingFor,
  } = useStagesStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  const applyRoleFilter = useCallback(
    (items: Lead[]) => {
      if (!user) return [];
      if (user.role === "admin" || user.role === "superadmin") return items;

      if (user.role === "business_developer") {
        return items.filter(
          (l) => String(typeof l.createdBy === "string" ? l.createdBy : l.createdBy?._id) === String(user.id),
        );
      }
      if (user.role === "developer") {
        return items.filter(
          (l) => String(typeof l.assignedTo === "string" ? l.assignedTo : l.assignedTo?._id) === String(user.id),
        );
      }
      return items;
    },
    [user],
  );

  const needle = useMemo(() => searchQuery.trim().toLowerCase(), [searchQuery]);

  const filter = useCallback(
    (leads: Lead[]) => {
      const scoped = applyRoleFilter(leads);
      if (!needle) return scoped;
      return scoped.filter((l) => {
        const title = String(l.clientName ?? "").toLowerCase();
        const company = String((l as any)?.company ?? "").toLowerCase();
        return title.includes(needle) || company.includes(needle);
      });
    },
    [applyRoleFilter, needle],
  );

  const totalLeads = useMemo(() => {
    if (!board) return 0;
    return Object.values(board.columns).reduce((sum, col) => sum + col.data.length, 0);
  }, [board]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <KanbanHeader
          onSearch={setSearchQuery}
          onAddLead={() => setIsAddModalOpen(true)}
          addLeadLoading={false}
          totalLeads={totalLeads}
        />

        <KanbanBoard
          board={board}
          stages={stages}
          canDragDrop={!!canDragDrop}
          boardLoading={boardLoading}
          stagesLoading={stagesLoading}
          moveLoadingById={moveLoadingById}
          insertAdjacentLoadingFor={insertAdjacentLoadingFor}
          refreshBoard={refreshBoard}
          moveCard={moveCard}
          addBefore={async (pivotId, name, color) => {
            await addBefore(pivotId, name, color);
          }}
          addAfter={async (pivotId, name, color) => {
            await addAfter(pivotId, name, color);
          }}
          filter={filter}
          onStageMeasured={() => {
            // no-op hook; kept for future scroll-to-first results, etc.
          }}
        />

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
