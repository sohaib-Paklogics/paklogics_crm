// src/store/events.store.ts
import { create } from "zustand";
import { callApi } from "@/lib/callApi";
import { eventService } from "@/services/event.service";
import type { LeadEvent, PaginatedResponse } from "@/types/lead";

interface EventsState {
  items: LeadEvent[];
  pagination: PaginatedResponse<LeadEvent>["pagination"] | null;
  isLoading: boolean;

  fetch: (params?: {
    page?: number;
    limit?: number;
    from?: string;
    to?: string;
    search?: string;
  }) => Promise<void>;
  fetchByLead: (
    leadId: string,
    params?: {
      page?: number;
      limit?: number;
      from?: string;
      to?: string;
      search?: string;
    }
  ) => Promise<void>;
  create: (
    leadId: string,
    payload: Pick<
      LeadEvent,
      "title" | "startTime" | "endTime" | "timezone" | "description"
    >
  ) => Promise<LeadEvent | null>;
  remove: (eventId: string) => Promise<boolean>;
}

export const useEventsStore = create<EventsState>((set, get) => ({
  items: [],
  pagination: null,
  isLoading: false,

  fetch: async (params = {}) => {
    set({ isLoading: true });
    const res = await callApi(() => eventService.allList(params), {
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

  fetchByLead: async (leadId, params = {}) => {
    set({ isLoading: true });
    const res = await callApi(() => eventService.listByLeadId(leadId, params), {
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

  create: async (leadId, payload) => {
    const res = await callApi(() => eventService.create(leadId, payload), {
      successMessage: "Event created",
    });
    if (res?.success) {
      set({ items: [res.data, ...get().items] });
      return res.data;
    }
    return null;
  },

  remove: async (eventId) => {
    const res = await callApi(() => eventService.remove(eventId), {
      successMessage: "Event deleted",
    });
    if (res?.success) {
      set({ items: get().items.filter((e) => e._id !== eventId) });
      return true;
    }
    return false;
  },
}));
