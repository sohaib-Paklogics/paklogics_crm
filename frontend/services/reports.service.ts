
import api from '../lib/api';

export interface LeadReport {
  statusCounts: Record<string, number>;
  sourceCounts: Record<string, number>;
  userStats: Array<{
    userId: string;
    userName: string;
    leadCount: number;
  }>;
  totalLeads: number;
}

export const reportsService = {
  // Get lead reports
  getLeadReports: async (params?: {
    format?: 'json' | 'csv';
    startDate?: string;
    endDate?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.format) queryParams.append('format', params.format);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    
    const response = await api.get(`/reports/leads?${queryParams.toString()}`);
    return response.data;
  },
};
