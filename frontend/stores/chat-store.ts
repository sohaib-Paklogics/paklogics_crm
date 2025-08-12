import { create } from 'zustand';
import { callApi } from '../lib/callApi';
import { chatService, type Message, type SendMessageData } from '../services/chat.service';

interface ChatStore {
  messages: Message[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchMessages: (leadId: string, params?: { limit?: number; offset?: number }) => Promise<void>;
  sendMessage: (leadId: string, data: SendMessageData) => Promise<void>;
  addMessage: (message: Message) => void;

  // Utils
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,

  fetchMessages: async (leadId, params) => {
    set({ isLoading: true, error: null });
    const result = await callApi(
      () => chatService.getMessages(leadId, params),
      { successMessage: 'Messages loaded successfully' }
    );
    if (result) {
      set({ messages: result.data || result, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  sendMessage: async (leadId, data) => {
    set({ isLoading: true, error: null });
    const result = await callApi(
      () => chatService.sendMessage(leadId, data),
      { successMessage: 'Message sent successfully' }
    );
    if (result) {
      const { messages } = get();
      set({ messages: [...messages, result.data || result], isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  addMessage: (message) => {
    const { messages } = get();
    set({ messages: [...messages, message] });
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearMessages: () => set({ messages: [] }),
}));