// src/services/note.service.ts
import api from "@/lib/api";
import type { ApiResponse, LeadNote, PaginatedResponse } from "@/types/lead";

export const noteService = {
  create: async (
    leadId: string,
    text: string
  ): Promise<ApiResponse<LeadNote>> => {
    const { data } = await api.post<ApiResponse<LeadNote>>(
      `/leads/${leadId}/notes`,
      { text }
    );
    return data;
  },

  list: async (
    leadId: string,
    page = 1,
    limit = 10
  ): Promise<ApiResponse<PaginatedResponse<LeadNote>>> => {
    const { data } = await api.get<ApiResponse<PaginatedResponse<LeadNote>>>(
      `/leads/${leadId}/notes`,
      {
        params: { page, limit },
      }
    );
    return data;
  },

  remove: async (
    leadId: string,
    noteId: string
  ): Promise<ApiResponse<{ id: string }>> => {
    const { data } = await api.delete<ApiResponse<{ id: string }>>(
      `/leads/${leadId}/notes/${noteId}`
    );
    return data;
  },
};
