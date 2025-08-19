// src/services/kanban.service.ts
import api from "@/lib/api";
import type { ApiResponse, KanbanBoard, Lead } from "@/types/lead";

type KanbanQuery = {
  limit?: number;
  newPage?: number;
  interview_scheduledPage?: number;
  test_assignedPage?: number;
  completedPage?: number;
  search?: string;
  assignedTo?: string;
  source?: string;
};

export const kanbanService = {
  board: async (
    params: KanbanQuery = {}
  ): Promise<ApiResponse<KanbanBoard>> => {
    const { data } = await api.get<ApiResponse<KanbanBoard>>("/kanban/leads", {
      params,
    });
    return data;
  },

  move: async (
    id: string,
    status: Lead["status"]
  ): Promise<ApiResponse<Lead>> => {
    const { data } = await api.patch<ApiResponse<Lead>>(
      `/kanban/leads/${id}/move`,
      { status }
    );
    return data;
  },
};
