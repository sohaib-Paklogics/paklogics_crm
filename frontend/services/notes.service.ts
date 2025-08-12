
import api from '../lib/api';

export interface LeadNote {
  _id: string;
  leadId: string;
  userId: string;
  text: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

export interface CreateNoteData {
  text: string;
}

export const notesService = {
  // Get all notes for a lead
  getNotes: async (leadId: string) => {
    const response = await api.get(`/leads/${leadId}/notes`);
    return response.data;
  },

  // Create new note
  createNote: async (leadId: string, data: CreateNoteData) => {
    const response = await api.post(`/leads/${leadId}/notes`, data);
    return response.data;
  },
};
