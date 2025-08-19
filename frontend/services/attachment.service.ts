// src/services/attachment.service.ts
import api from "@/lib/api";
import type { ApiResponse, Attachment, PaginatedResponse } from "@/types/lead";

export const attachmentService = {
  upload: async (
    leadId: string,
    file: File
  ): Promise<ApiResponse<Attachment>> => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post<ApiResponse<Attachment>>(
      `/leads/${leadId}/attachments`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return data;
  },

  list: async (
    leadId: string,
    page = 1,
    limit = 10
  ): Promise<ApiResponse<PaginatedResponse<Attachment>>> => {
    const { data } = await api.get<ApiResponse<PaginatedResponse<Attachment>>>(
      `/leads/${leadId}/attachments`,
      {
        params: { page, limit },
      }
    );
    return data;
  },

  remove: async (
    attachmentId: string
  ): Promise<ApiResponse<{ id: string }>> => {
    const { data } = await api.delete<ApiResponse<{ id: string }>>(
      `/attachments/${attachmentId}`
    );
    return data;
  },
};
