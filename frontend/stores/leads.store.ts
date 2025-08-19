// src/store/leads.store.ts
import { create } from "zustand";
import { callApi } from "@/lib/callApi";
import { leadService } from "@/services/lead.service";
import type { Lead, LeadFilters, PaginatedResponse } from "@/types/lead";

interface LeadsState {
  items: Lead[];
  pagination: PaginatedResponse<Lead>["pagination"] | null;
  isLoading: boolean;
  filters: LeadFilters;

  fetch: (filters?: LeadFilters) => Promise<void>;
  getOne: (id: string) => Promise<Lead | null>;
  create: (payload: Partial<Lead>) => Promise<Lead | null>;
  update: (id: string, payload: Partial<Lead>) => Promise<Lead | null>;
  assign: (id: string, assignedTo: string | null) => Promise<Lead | null>;
  changeStatus: (id: string, status: Lead["status"]) => Promise<Lead | null>;
  remove: (id: string) => Promise<boolean>;
  setFilters: (f: Partial<LeadFilters>) => void;
  reset: () => void;
}

export const useLeadsStore = create<LeadsState>((set, get) => ({
  items: [],
  pagination: null,
  isLoading: false,
  filters: {
    page: 1,
    limit: 10,
    status: "all",
    order: "desc",
    sort: "createdAt",
  },

  fetch: async (filters = {}) => {
    set({ isLoading: true });
    const merged = { ...get().filters, ...filters };
    const res = await callApi(() => leadService.list(merged), {
      showSuccess: false,
    });
    if (res?.success) {
      set({
        items: res.data.data,
        pagination: res.data.pagination,
        filters: merged,
        isLoading: false,
      });
    } else {
      set({ isLoading: false });
    }
  },

  getOne: async (id) => {
    const res = await callApi(() => leadService.getOne(id), {
      showSuccess: false,
    });
    return res?.success ? (res.data as Lead) : null;
  },

  create: async (payload) => {
    const res = await callApi(() => leadService.create(payload), {
      successMessage: "Lead created",
    });
    if (res?.success) {
      // refresh first page or prepend optimistic
      await get().fetch({ page: 1 });
      return res.data as Lead;
    }
    return null;
  },

  update: async (id, payload) => {
    const res = await callApi(() => leadService.update(id, payload), {
      successMessage: "Lead updated",
    });
    if (res?.success) {
      const updated = res.data as Lead;
      set({ items: get().items.map((l) => (l._id === id ? updated : l)) });
      return updated;
    }
    return null;
  },

  assign: async (id, assignedTo) => {
    const res = await callApi(() => leadService.assign(id, assignedTo), {
      successMessage: "Lead assigned",
    });
    if (res?.success) {
      const updated = res.data as Lead;
      set({ items: get().items.map((l) => (l._id === id ? updated : l)) });
      return updated;
    }
    return null;
  },

  changeStatus: async (id, status) => {
    const res = await callApi(() => leadService.changeStatus(id, status), {
      successMessage: "Status updated",
    });
    if (res?.success) {
      const updated = res.data as Lead;
      set({ items: get().items.map((l) => (l._id === id ? updated : l)) });
      return updated;
    }
    return null;
  },

  remove: async (id) => {
    const res = await callApi(() => leadService.remove(id), {
      successMessage: "Lead deleted",
    });
    if (res?.success) {
      set({ items: get().items.filter((l) => l._id !== id) });
      return true;
    }
    return false;
  },

  setFilters: (f) => set({ filters: { ...get().filters, ...f } }),
  reset: () =>
    set({
      items: [],
      pagination: null,
      isLoading: false,
      filters: {
        page: 1,
        limit: 10,
        status: "all",
        order: "desc",
        sort: "createdAt",
      },
    }),
}));
