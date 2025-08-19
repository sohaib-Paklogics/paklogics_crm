// src/store/notes.store.ts
import { create } from "zustand";
import { callApi } from "@/lib/callApi";
import { noteService } from "@/services/note.service";
import type { LeadNote, PaginatedResponse } from "@/types/lead";

interface NotesState {
  items: LeadNote[];
  pagination: PaginatedResponse<LeadNote>["pagination"] | null;
  isLoading: boolean;

  fetch: (leadId: string, page?: number, limit?: number) => Promise<void>;
  create: (leadId: string, text: string) => Promise<LeadNote | null>;
  remove: (leadId: string, noteId: string) => Promise<boolean>;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  items: [],
  pagination: null,
  isLoading: false,

  fetch: async (leadId, page = 1, limit = 10) => {
    set({ isLoading: true });
    const res = await callApi(() => noteService.list(leadId, page, limit), {
      showSuccess: false,
    });
    if (res?.success) {
      set({
        items: res.data.data,
        pagination: res.data.pagination,
        isLoading: false,
      });
    } else set({ isLoading: false });
  },

  create: async (leadId, text) => {
    const res = await callApi(() => noteService.create(leadId, text), {
      successMessage: "Note added",
    });
    if (res?.success) {
      set({ items: [res.data, ...get().items] });
      return res.data;
    }
    return null;
  },

  remove: async (leadId, noteId) => {
    const res = await callApi(() => noteService.remove(leadId, noteId), {
      successMessage: "Note deleted",
    });
    if (res?.success) {
      set({ items: get().items.filter((n) => n._id !== noteId) });
      return true;
    }
    return false;
  },
}));
