
import api from '../lib/api';

export interface Message {
  _id: string;
  leadId: string;
  senderId: string;
  content: string;
  timestamp: string;
  readStatus: boolean;
  sender?: {
    name: string;
    email: string;
  };
}

export interface SendMessageData {
  content: string;
}

export const chatService = {
  // Get messages for a lead
  getMessages: async (leadId: string, params?: {
    limit?: number;
    offset?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const response = await api.get(`/leads/${leadId}/messages?${queryParams.toString()}`);
    return response.data;
  },

  // Send message
  sendMessage: async (leadId: string, data: SendMessageData) => {
    const response = await api.post(`/leads/${leadId}/messages`, data);
    return response.data;
  },
};
