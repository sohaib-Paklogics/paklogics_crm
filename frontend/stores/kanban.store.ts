// src/store/kanban.store.ts
import { create } from "zustand";
import { callApi } from "@/lib/callApi";
import { kanbanService } from "@/services/kanban.service";
import type { KanbanBoard, Lead } from "@/types/lead";

type ColumnKey = keyof KanbanBoard; // "new" | "interview_scheduled" | "test_assigned" | "completed"

interface KanbanState {
  board: KanbanBoard | null;
  isLoading: boolean;

  fetchBoard: (params?: Record<string, any>) => Promise<void>;
  moveCard: (
    leadId: string,
    from: ColumnKey,
    to: ColumnKey
  ) => Promise<boolean>;
}

export const useKanbanStore = create<KanbanState>((set, get) => ({
  board: null,
  isLoading: false,

  fetchBoard: async (params = {}) => {
    set({ isLoading: true });
    const res = await callApi(() => kanbanService.board(params), {
      showSuccess: false,
    });
    if (res?.success) set({ board: res.data, isLoading: false });
    else set({ isLoading: false });
  },

  // Optimistic move
  moveCard: async (leadId, from, to) => {
    const { board } = get();
    if (!board) return false;

    // optimistic update
    const prev = JSON.parse(JSON.stringify(board)) as KanbanBoard;
    const fromList = [...board[from].data];
    const toList = [...board[to].data];

    const idx = fromList.findIndex((l) => l._id === leadId);
    if (idx < 0) return false;

    const card = { ...fromList[idx], status: to as Lead["status"] };
    fromList.splice(idx, 1);
    toList.unshift(card);

    set({
      board: {
        ...board,
        [from]: { ...board[from], data: fromList },
        [to]: { ...board[to], data: toList },
      },
    });

    const apiRes = await callApi(() => kanbanService.move(leadId, to), {
      showSuccess: false,
    });
    if (!apiRes?.success) {
      // revert on failure
      set({ board: prev });
      return false;
    }
    return true;
  },
}));
