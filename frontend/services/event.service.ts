// src/services/event.service.ts
import api from "@/lib/api";
import type { ApiResponse, LeadEvent, PaginatedResponse } from "@/types/lead";

export const eventService = {
  create: async (
    leadId: string,
    payload: Pick<
      LeadEvent,
      "title" | "startTime" | "endTime" | "timezone" | "description"
    >
  ): Promise<ApiResponse<LeadEvent>> => {
    const { data } = await api.post<ApiResponse<LeadEvent>>(
      `/leads/${leadId}/events`,
      payload
    );
    return data;
  },

  listByLeadId: async (
    leadId: string,
    params: { page?: number; limit?: number; from?: string; to?: string } = {}
  ): Promise<ApiResponse<PaginatedResponse<LeadEvent>>> => {
    const { data } = await api.get<ApiResponse<PaginatedResponse<LeadEvent>>>(
      `/leads/${leadId}/events`,
      {
        params,
      }
    );
    return data;
  },
  allList: async (
    params: { page?: number; limit?: number; from?: string; to?: string } = {}
  ): Promise<ApiResponse<PaginatedResponse<LeadEvent>>> => {
    const { data } = await api.get<ApiResponse<PaginatedResponse<LeadEvent>>>(
      `/events`,
      {
        params,
      }
    );
    return data;
  },

  remove: async (eventId: string): Promise<ApiResponse<{ id: string }>> => {
    const { data } = await api.delete<ApiResponse<{ id: string }>>(
      `/events/${eventId}`
    );
    return data;
  },
};
