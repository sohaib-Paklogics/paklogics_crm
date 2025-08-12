
import api from '../lib/api';

export interface Lead {
  _id: string;
  clientName: string;
  jobDescription: string;
  source: string;
  status: 'New' | 'Interview Scheduled' | 'Test Assigned' | 'Completed';
  assignedTo?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadData {
  clientName: string;
  jobDescription: string;
  source: string;
  status?: string;
  assignedTo?: string;
  notes?: string;
}

export interface UpdateLeadData {
  clientName?: string;
  jobDescription?: string;
  source?: string;
  notes?: string;
}

export interface AssignLeadData {
  assignedTo: string;
}

export interface UpdateStatusData {
  status: string;
}

export const leadService = {
  // Get all leads with filters and pagination
  getLeads: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    source?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.source) queryParams.append('source', params.source);
    
    const response = await api.get(`/leads?${queryParams.toString()}`);
    return response.data;
  },

  // Get single lead by ID
  getLead: async (id: string) => {
    const response = await api.get(`/leads/${id}`);
    return response.data;
  },

  // Create new lead
  createLead: async (data: CreateLeadData) => {
    const response = await api.post('/leads', data);
    return response.data;
  },

  // Update lead
  updateLead: async (id: string, data: UpdateLeadData) => {
    const response = await api.patch(`/leads/${id}`, data);
    return response.data;
  },

  // Delete lead
  deleteLead: async (id: string) => {
    const response = await api.delete(`/leads/${id}`);
    return response.data;
  },

  // Assign lead to user
  assignLead: async (id: string, data: AssignLeadData) => {
    const response = await api.post(`/leads/${id}/assign`, data);
    return response.data;
  },

  // Update lead status
  updateStatus: async (id: string, data: UpdateStatusData) => {
    const response = await api.patch(`/leads/${id}/status`, data);
    return response.data;
  },

  // Upload attachment
  uploadAttachment: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/leads/${id}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
