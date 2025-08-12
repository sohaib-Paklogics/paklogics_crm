import { create } from "zustand";
import { callApi } from "../lib/callApi";
import {
  leadService,
  type Lead,
  type CreateLeadData,
  type UpdateLeadData,
} from "../services/lead.service";

interface PaginationInfo {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

interface LeadStore {
  leads: Lead[];
  currentLead: Lead | null;
  isLoading: boolean;
  error: string | null;
  pagination: PaginationInfo;

  // Actions
  fetchLeads: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    source?: string;
  }) => Promise<void>;
  fetchLead: (id: string) => Promise<void>;
  createLead: (data: CreateLeadData) => Promise<void>;
  updateLead: (id: string, data: UpdateLeadData) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  assignLead: (id: string, assignedTo: string) => Promise<void>;
  updateStatus: (id: string, status: string) => Promise<void>;
  uploadAttachment: (id: string, file: File) => Promise<void>;

  // Utils
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearCurrentLead: () => void;
}

export const useLeadStore = create<LeadStore>((set, get) => ({
  leads: [],
  currentLead: null,
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    pages: 1,
    limit: 10,
  },

  fetchLeads: async (params) => {
    set({ isLoading: true, error: null });
    const result = await callApi(() => leadService.getLeads(params), {
      showError: true,
      showSuccess: false,
    });
    console.log("Fetched leads:", result);
    if (result) {
      const data = result.data || result;
      set({
        leads: data.leads,
        pagination: data.pagination,
        isLoading: false,
      });
    } else {
      set({ isLoading: false });
    }
  },

  fetchLead: async (id) => {
    set({ isLoading: true, error: null });
    const result = await callApi(() => leadService.getLead(id), {
      successMessage: "Lead loaded successfully",
    });
    if (result) {
      set({ currentLead: result.data || result, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  createLead: async (data) => {
    set({ isLoading: true, error: null });
    const result = await callApi(() => leadService.createLead(data), {
      successMessage: "Lead created successfully",
    });
    if (result) {
      const { leads } = get();
      set({ leads: [result.data || result, ...leads], isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  updateLead: async (id, data) => {
    set({ isLoading: true, error: null });
    const result = await callApi(() => leadService.updateLead(id, data), {
      successMessage: "Lead updated successfully",
    });
    if (result) {
      const { leads } = get();
      const updatedLeads = leads.map((lead) =>
        lead._id === id ? { ...lead, ...(result.data || result) } : lead
      );
      set({ leads: updatedLeads, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  deleteLead: async (id) => {
    set({ isLoading: true, error: null });
    const result = await callApi(() => leadService.deleteLead(id), {
      successMessage: "Lead deleted successfully",
    });
    if (result) {
      const { leads } = get();
      const filteredLeads = leads.filter((lead) => lead._id !== id);
      set({ leads: filteredLeads, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  assignLead: async (id, assignedTo) => {
    set({ isLoading: true, error: null });
    const result = await callApi(
      () => leadService.assignLead(id, { assignedTo }),
      { successMessage: "Lead assigned successfully" }
    );
    if (result) {
      const { leads } = get();
      const updatedLeads = leads.map((lead) =>
        lead._id === id ? { ...lead, assignedTo } : lead
      );
      set({ leads: updatedLeads, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  updateStatus: async (id, status) => {
    set({ isLoading: true, error: null });
    const result = await callApi(
      () => leadService.updateStatus(id, { status }),
      { successMessage: "Status updated successfully" }
    );
    if (result) {
      const { leads } = get();
      const updatedLeads = leads.map((lead) =>
        lead._id === id ? { ...lead, status: status as Lead["status"] } : lead
      );
      set({ leads: updatedLeads, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  uploadAttachment: async (id, file) => {
    set({ isLoading: true, error: null });
    const result = await callApi(() => leadService.uploadAttachment(id, file), {
      successMessage: "Attachment uploaded successfully",
    });
    if (result) {
      set({ isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearCurrentLead: () => set({ currentLead: null }),
}));
