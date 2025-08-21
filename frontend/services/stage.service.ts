// src/services/stage.service.ts
import api from "@/lib/api";
import type { ApiResponse, Stage } from "@/types/lead";

type InsertAdjacentPayload = {
  where: "before" | "after";
  pivotId: string;
  name: string;
  color?: string;
  isDefault?: boolean;
  active?: boolean;
};

export const stageService = {
  list: async (): Promise<ApiResponse<{ stages: Stage[] } | Stage[]>> => {
    const res = await api.get("/stages");
    return res.data;
  },

  create: async (payload: Partial<Stage>): Promise<ApiResponse<Stage>> => {
    const res = await api.post("/stages", payload);
    return res.data;
  },

  update: async (
    id: string,
    payload: Partial<Stage>
  ): Promise<ApiResponse<Stage>> => {
    const res = await api.patch(`/stages/${id}`, payload);
    return res.data;
  },

  delete: async (id: string, targetStageId?: string): Promise<ApiResponse> => {
    const res = await api.delete(`/stages/${id}`, { data: { targetStageId } });
    return res.data;
  },

  reorder: async (orderIds: string[]): Promise<ApiResponse<Stage[]>> => {
    const res = await api.patch("/stages/reorder/all", { orderIds });
    return res.data;
  },

  // NEW: let the server calculate adjacent order
  insertAdjacent: async (
    payload: InsertAdjacentPayload
  ): Promise<ApiResponse<Stage>> => {
    const res = await api.post("/stages/adjacent", payload);
    return res.data;
  },
};
