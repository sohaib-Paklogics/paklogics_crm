import { create } from "zustand";
import { callApi } from "@/lib/callApi";
import { messageService } from "@/services/message.service";
import type { ChatMessage, PaginatedResponse } from "@/types/message";

interface MessagesState {
  items: ChatMessage[];
  pagination: PaginatedResponse<ChatMessage>["pagination"] | null;
  isLoading: boolean;

  fetch: (
    leadId: string,
    page?: number,
    limit?: number,
    opts?: { order?: "asc" | "desc"; before?: string; after?: string }
  ) => Promise<void>;
  send: (leadId: string, content: string) => Promise<boolean>;
  markRead: (messageId: string, read?: boolean) => Promise<void>;
  markAllRead: (leadId: string) => Promise<void>;
  remove: (messageId: string) => Promise<void>;

  // helpers
  prepend: (msg: ChatMessage) => void; // if using desc order
  append: (msg: ChatMessage) => void; // if using asc order (default here)
  clear: () => void;
}

export const useMessagesStore = create<MessagesState>((set, get) => ({
  items: [],
  pagination: null,
  isLoading: false,

  fetch: async (leadId, page = 1, limit = 50, opts = {}) => {
    set({ isLoading: true });
    const res = await callApi(
      () =>
        messageService.list(leadId, {
          page,
          limit,
          order: opts.order ?? "asc",
          before: opts.before,
          after: opts.after,
        }),
      { showSuccess: false }
    );

    if (res?.success) {
      set({
        items: res.data.data,
        pagination: res.data.pagination,
        isLoading: false,
      });
    } else {
      set({ isLoading: false });
    }
  },

  send: async (leadId, content) => {
    // optimistic append (asc order)
    const tempId = `temp-${Date.now()}`;
    const optimistic: ChatMessage = {
      _id: tempId,
      leadId,
      senderId: "You",
      content,
      timestamp: new Date().toISOString(),
      readStatus: true,
    };
    set({ items: [...get().items, optimistic] });

    const res = await callApi(() => messageService.send(leadId, content), {
      showSuccess: false,
    });
    if (res?.success) {
      // replace temp with real
      set({
        items: get().items.map((m) =>
          m._id === tempId ? (res.data as ChatMessage) : m
        ),
      });
      return true;
    } else {
      // rollback optimistic
      set({ items: get().items.filter((m) => m._id !== tempId) });
      return false;
    }
  },

  markRead: async (messageId, read = true) => {
    const res = await callApi(() => messageService.markRead(messageId, read), {
      showSuccess: false,
    });
    if (res?.success) {
      set({
        items: get().items.map((m) =>
          m._id === messageId ? { ...m, readStatus: read } : m
        ),
      });
    }
  },

  markAllRead: async (leadId) => {
    const res = await callApi(() => messageService.markAllRead(leadId), {
      showSuccess: false,
    });
    if (res?.success) {
      set({
        items: get().items.map((m) => ({ ...m, readStatus: true })),
      });
    }
  },

  remove: async (messageId) => {
    const prev = get().items;
    set({ items: prev.filter((m) => m._id !== messageId) });
    const res = await callApi(() => messageService.remove(messageId), {
      showSuccess: true,
      successMessage: "Message deleted",
    });
    if (!res?.success) set({ items: prev }); // rollback on failure
  },

  prepend: (msg) => set({ items: [msg, ...get().items] }),
  append: (msg) => set({ items: [...get().items, msg] }),
  clear: () => set({ items: [], pagination: null, isLoading: false }),
}));
