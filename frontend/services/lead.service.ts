// src/services/lead.service.ts
import api from "@/lib/api";
import type {
  ApiResponse,
  Lead,
  LeadFilters,
  PaginatedResponse,
} from "@/types/lead";

export const leadService = {
  create: async (payload: Partial<Lead>): Promise<ApiResponse<Lead>> => {
    const { data } = await api.post<ApiResponse<Lead>>("/leads", payload);
    return data;
  },

  list: async (
    filters: LeadFilters
  ): Promise<ApiResponse<PaginatedResponse<Lead>>> => {
    const { data } = await api.get<ApiResponse<PaginatedResponse<Lead>>>(
      "/leads",
      { params: filters }
    );
    return data;
  },

  getOne: async (id: string): Promise<ApiResponse<Lead>> => {
    const { data } = await api.get<ApiResponse<Lead>>(`/leads/${id}`);
    return data;
  },

  update: async (
    id: string,
    payload: Partial<Lead>
  ): Promise<ApiResponse<Lead>> => {
    const { data } = await api.put<ApiResponse<Lead>>(`/leads/${id}`, payload);
    return data;
  },

  remove: async (
    id: string
  ): Promise<ApiResponse<{ id: string; deletedAt: string }>> => {
    const { data } = await api.delete<
      ApiResponse<{ id: string; deletedAt: string }>
    >(`/leads/${id}`);
    return data;
  },

  assign: async (
    id: string,
    assignedTo: string | null
  ): Promise<ApiResponse<Lead>> => {
    const { data } = await api.patch<ApiResponse<Lead>>(`/leads/${id}/assign`, {
      assignedTo,
    });
    return data;
  },

  changeStage: async (
    id: string,
    stage: string
  ): Promise<ApiResponse<Lead>> => {
    const { data } = await api.patch<ApiResponse<Lead>>(`/leads/${id}/stage`, {
      stage,
    });
    return data;
  },

  changeStatus: async (
    id: string,
    status: Lead["status"]["value"]
  ): Promise<ApiResponse<Lead>> => {
    const { data } = await api.patch<ApiResponse<Lead>>(`/leads/${id}/status`, {
      status,
    });
    return data;
  },

  statsSummary: async (): Promise<ApiResponse<any>> => {
    const { data } = await api.get<ApiResponse<any>>("/leads/stats/summary");
    return data;
  },
};
