// services/kanban.service.ts
import api from "@/lib/api";
import type { ApiResponse, Lead, Stage } from "@/types/lead";

export type BoardResponse = {
  stages: Stage[];
  columns: Record<string, { stage: Stage; data: Lead[]; count: number }>;
};

export const kanbanService = {
  board: async (
    params?: Record<string, any>
  ): Promise<ApiResponse<BoardResponse>> => {
    const res = await api.get("/kanban/board", { params });
    return res.data;
  },
  move: async (
    leadId: string,
    toStageId: string
  ): Promise<ApiResponse<Lead>> => {
    const res = await api.patch(`/kanban/leads/${leadId}/move`, { toStageId });
    return res.data;
  },
};
