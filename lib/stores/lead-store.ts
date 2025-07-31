import { create } from "zustand"
import type { Lead, LeadStatus } from "@/lib/types"

interface LeadState {
  leads: Lead[]
  selectedLead: Lead | null
  loading: boolean
  setLeads: (leads: Lead[]) => void
  addLead: (lead: Lead) => void
  updateLead: (id: string, updates: Partial<Lead>) => void
  deleteLead: (id: string) => void
  setSelectedLead: (lead: Lead | null) => void
  updateLeadStatus: (id: string, status: LeadStatus) => void
  setLoading: (loading: boolean) => void
}

export const useLeadStore = create<LeadState>((set, get) => ({
  leads: [],
  selectedLead: null,
  loading: false,
  setLeads: (leads) => set({ leads }),
  addLead: (lead) => set((state) => ({ leads: [...state.leads, lead] })),
  updateLead: (id, updates) =>
    set((state) => ({
      leads: state.leads.map((lead) => (lead.id === id ? { ...lead, ...updates } : lead)),
      selectedLead: state.selectedLead?.id === id ? { ...state.selectedLead, ...updates } : state.selectedLead,
    })),
  deleteLead: (id) =>
    set((state) => ({
      leads: state.leads.filter((lead) => lead.id !== id),
      selectedLead: state.selectedLead?.id === id ? null : state.selectedLead,
    })),
  setSelectedLead: (lead) => set({ selectedLead: lead }),
  updateLeadStatus: (id, status) =>
    set((state) => ({
      leads: state.leads.map((lead) => (lead.id === id ? { ...lead, status } : lead)),
    })),
  setLoading: (loading) => set({ loading }),
}))
