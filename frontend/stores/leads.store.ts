// src/store/leads.store.ts
import { create } from "zustand";
import { callApi } from "@/lib/callApi";
import { leadService } from "@/services/lead.service";
import type { Lead, LeadFilters, PaginatedResponse } from "@/types/lead";

// 1) Single source of truth for defaults
const DEFAULT_FILTERS: LeadFilters = {
  page: 1,
  limit: 10,
  stage: "all",
  order: "desc",
  sort: "createdAt",
  search: "",
  dateFrom: null,
  dateTo: null,
};

interface LeadsState {
  items: Lead[];
  pagination: PaginatedResponse<Lead>["pagination"] | null;
  isLoading: boolean;
  filters: LeadFilters;

  fetch: (filters?: LeadFilters) => Promise<void>;
  getOne: (id: string) => Promise<Lead | null>;
  create: (payload: Partial<Lead>) => Promise<Lead | null>;
  update: (id: string, payload: Partial<Lead>) => Promise<Lead | null>;
  assign: (id: string, assignedTo: string | null, assignedBusinessDeveloper?: string | null) => Promise<Lead | null>;

  changeStage: (id: string, stage: string) => Promise<Lead | null>;
  changeStatus: (id: string, status: Lead["status"]["value"]) => Promise<Lead | null>;

  remove: (id: string) => Promise<boolean>;
  setFilters: (f: Partial<LeadFilters>) => void;

  // 2) make reset async so it can refetch with defaults
  reset: () => Promise<void>;
}

export const useLeadsStore = create<LeadsState>((set, get) => ({
  items: [],
  pagination: null,
  isLoading: false,

  // 2) use DEFAULT_FILTERS here
  filters: { ...DEFAULT_FILTERS },

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

  assign: async (id, assignedTo, assignedBusinessDeveloper) => {
    const res = await callApi(() => leadService.assign(id, assignedTo, assignedBusinessDeveloper), {
      successMessage: "Lead assigned",
    });
    if (res?.success) {
      const updated = res.data as Lead;
      set({ items: get().items.map((l) => (l._id === id ? updated : l)) });
      return updated;
    }
    return null;
  },

  changeStage: async (id, stage) => {
    const res = await callApi(() => leadService.changeStage(id, stage), {
      successMessage: "Stage updated",
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

  // 3) Reset + refetch with the exact defaults
  reset: async () => {
    set({
      items: [],
      pagination: null,
      isLoading: false,
      filters: { ...DEFAULT_FILTERS },
    });
    await get().fetch({ ...DEFAULT_FILTERS });
  },
}));
