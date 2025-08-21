import { create } from "zustand";
import { kanbanService } from "@/services/kanban.service";
import type { Lead, Stage } from "@/types/lead";
import { callApi } from "@/lib/callApi";

type Column = { stage: Stage; data: Lead[]; count: number };
type Board = { stages: Stage[]; columns: Record<string, Column> };

type KanbanState = {
  board: Board | null;
  isLoading: boolean;
  error: string | null;
  fetchBoard: (params?: Record<string, any>) => Promise<void>;
  moveCard: (
    leadId: string,
    fromStageId: string,
    toStageId: string
  ) => Promise<void>;
};

export const useKanbanStore = create<KanbanState>((set, get) => ({
  board: null,
  isLoading: false,
  error: null,

  fetchBoard: async (params) => {
    set({ isLoading: true, error: null });
    const res = await callApi(() => kanbanService.board(params), {
      showError: true,
      showSuccess: false,
    });
    if (res?.success) {
      set({ board: res.data as Board, isLoading: false });
    } else {
      set({ isLoading: false, error: res?.message || "Failed to load board" });
    }
  },

  moveCard: async (leadId, fromStageId, toStageId) => {
    // optimistic update
    const prev = get().board;
    if (!prev) return;

    const next: Board = {
      ...prev,
      columns: { ...prev.columns },
    };

    const fromCol = { ...next.columns[fromStageId] };
    const toCol = { ...next.columns[toStageId] };
    const idx = fromCol.data.findIndex((l) => String(l._id) === String(leadId));
    if (idx > -1) {
      const [moved] = fromCol.data.splice(idx, 1);
      moved.stage = toCol.stage._id;
      moved.status = toCol.stage.key;
      toCol.data.unshift(moved);
      fromCol.count = fromCol.data.length;
      toCol.count = toCol.data.length;
      next.columns[fromStageId] = fromCol;
      next.columns[toStageId] = toCol;
      set({ board: next });
    }

    const res = await callApi(() => kanbanService.move(leadId, toStageId), {
      showError: true,
    });
    if (!res?.success) {
      // revert on error
      set({ board: prev });
    }
  },
}));
