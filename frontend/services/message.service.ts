// services/message.service.ts
import api from "@/lib/api";
import type {
  ApiResponse,
  ChatMessage,
  PaginatedResponse,
} from "@/types/message";

export const messageService = {
  send: async (
    leadId: string,
    content: string
  ): Promise<ApiResponse<ChatMessage>> => {
    const { data } = await api.post<ApiResponse<ChatMessage>>(
      `/leads/${leadId}/messages`,
      { content }
    );
    return data;
  },

  list: async (
    leadId: string,
    params: {
      page?: number;
      limit?: number;
      before?: string;
      after?: string;
      order?: "asc" | "desc";
    } = {}
  ): Promise<ApiResponse<PaginatedResponse<ChatMessage>>> => {
    const { data } = await api.get<ApiResponse<PaginatedResponse<ChatMessage>>>(
      `/leads/${leadId}/messages`,
      { params }
    );
    return data;
  },

  edit: async (
    leadId: string,
    messageId: string,
    content: string
  ): Promise<ApiResponse<ChatMessage>> => {
    const { data } = await api.patch<ApiResponse<ChatMessage>>(
      `/${leadId}/messages/${messageId}`,
      { content }
    );
    return data;
  },

  markRead: async (
    messageId: string,
    readStatus = true
  ): Promise<ApiResponse<ChatMessage>> => {
    const { data } = await api.patch<ApiResponse<ChatMessage>>(
      `/messages/${messageId}/read`,
      { readStatus }
    );
    return data;
  },

  markAllRead: async (
    leadId: string
  ): Promise<ApiResponse<{ leadId: string; updated: boolean }>> => {
    const { data } = await api.patch<
      ApiResponse<{ leadId: string; updated: boolean }>
    >(`/leads/${leadId}/messages/read`, {});
    return data;
  },

  remove: async (messageId: string): Promise<ApiResponse<{ id: string }>> => {
    const { data } = await api.delete<ApiResponse<{ id: string }>>(
      `/messages/${messageId}`
    );
    return data;
  },
};
