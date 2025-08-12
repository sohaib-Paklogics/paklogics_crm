
import api from '../lib/api';

export interface CalendarEvent {
  _id: string;
  leadId: string;
  userId: string;
  title: string;
  startTime: string;
  endTime: string;
  timezone: string;
  description?: string;
  createdAt: string;
}

export interface CreateEventData {
  leadId: string;
  userId: string;
  title: string;
  startTime: string;
  endTime: string;
  timezone: string;
  description?: string;
}

export const calendarService = {
  // Get all events
  getEvents: async (params?: {
    startDate?: string;
    endDate?: string;
    userId?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.userId) queryParams.append('userId', params.userId);
    
    const response = await api.get(`/calendar/events?${queryParams.toString()}`);
    return response.data;
  },

  // Create new event
  createEvent: async (data: CreateEventData) => {
    const response = await api.post('/calendar/event', data);
    return response.data;
  },

  // Delete event
  deleteEvent: async (id: string) => {
    const response = await api.delete(`/calendar/event/${id}`);
    return response.data;
  },
};
