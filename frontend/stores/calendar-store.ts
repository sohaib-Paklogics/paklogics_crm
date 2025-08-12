
import { create } from 'zustand';
import { callApi } from '../lib/callApi';
import { calendarService, type CalendarEvent, type CreateEventData } from '../services/calendar.service';

interface CalendarStore {
  events: CalendarEvent[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchEvents: (params?: { startDate?: string; endDate?: string; userId?: string }) => Promise<void>;
  createEvent: (data: CreateEventData) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  
  // Utils
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  events: [],
  isLoading: false,
  error: null,

  fetchEvents: async (params) => {
    set({ isLoading: true, error: null });
    const result = await callApi(
      () => calendarService.getEvents(params),
      { successMessage: 'Events loaded successfully' }
    );
    if (result) {
      set({ events: result.data || result, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  createEvent: async (data) => {
    set({ isLoading: true, error: null });
    const result = await callApi(
      () => calendarService.createEvent(data),
      { successMessage: 'Event created successfully' }
    );
    if (result) {
      const { events } = get();
      set({ events: [...events, result.data || result], isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  deleteEvent: async (id) => {
    set({ isLoading: true, error: null });
    const result = await callApi(
      () => calendarService.deleteEvent(id),
      { successMessage: 'Event deleted successfully' }
    );
    if (result) {
      const { events } = get();
      const filteredEvents = events.filter(event => event._id !== id);
      set({ events: filteredEvents, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
