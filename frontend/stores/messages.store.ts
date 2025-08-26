// stores/messages.store.ts
import { create } from "zustand";
import { callApi } from "@/lib/callApi";
import { messageService } from "@/services/message.service";
import type { ChatMessage, PaginatedResponse } from "@/types/message";

interface MessagesState {
  items: ChatMessage[];
  pagination: PaginatedResponse<ChatMessage>["pagination"] | null;
  isLoading: boolean;
  isSending: boolean;

  fetch: (
    leadId: string,
    page?: number,
    limit?: number,
    opts?: { order?: "asc" | "desc"; before?: string; after?: string }
  ) => Promise<void>;
  send: (leadId: string, content: string) => Promise<boolean>;
  edit: (
    leadId: string,
    messageId: string,
    content: string
  ) => Promise<boolean>;
  markRead: (messageId: string, read?: boolean) => Promise<void>;
  markAllRead: (leadId: string) => Promise<void>;
  remove: (messageId: string) => Promise<void>;

  prepend: (msg: ChatMessage) => void;
  append: (msg: ChatMessage) => void;
  clear: () => void;
}

export const useMessagesStore = create<MessagesState>((set, get) => ({
  items: [],
  pagination: null,
  isLoading: false,
  isSending: false,

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
    set({ isSending: true });
    const tempId = `temp-${Date.now()}`;
    const optimistic: ChatMessage = {
      _id: tempId,
      leadId,
      senderId: "You" as any, // depending on your type, this could be object | string
      content,
      timestamp: new Date().toISOString(),
      readStatus: true,
    };
    set({ items: [...get().items, optimistic] });

    const res = await callApi(() => messageService.send(leadId, content), {
      showSuccess: false,
    });
    set({ isSending: false });

    if (res?.success) {
      set({
        items: get().items.map((m) =>
          m._id === tempId ? (res.data as ChatMessage) : m
        ),
      });
      return true;
    } else {
      set({ items: get().items.filter((m) => m._id !== tempId) });
      return false;
    }
  },

  // ✅ NEW: edit with optimistic UI
  edit: async (leadId, messageId, content) => {
    const prev = get().items;
    // optimistic local edit
    set({
      items: prev.map((m) => (m._id === messageId ? { ...m, content } : m)),
    });

    const res = await callApi(
      () => messageService.edit(leadId, messageId, content),
      {
        showSuccess: true,
        successMessage: "Message updated",
      }
    );

    if (res?.success) {
      const updated = res.data as ChatMessage;
      set({
        items: get().items.map((m) => (m._id === messageId ? updated : m)),
      });
      return true;
    } else {
      // rollback on failure
      set({ items: prev });
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
      set({ items: get().items.map((m) => ({ ...m, readStatus: true })) });
    }
  },

  remove: async (messageId) => {
    const prev = get().items;
    set({ items: prev.filter((m) => m._id !== messageId) });
    const res = await callApi(() => messageService.remove(messageId), {
      showSuccess: true,
      successMessage: "Message deleted",
    });
    if (!res?.success) set({ items: prev });
  },

  prepend: (msg) => set({ items: [msg, ...get().items] }),
  append: (msg) => set({ items: [...get().items, msg] }),
  clear: () => set({ items: [], pagination: null, isLoading: false }),
}));
