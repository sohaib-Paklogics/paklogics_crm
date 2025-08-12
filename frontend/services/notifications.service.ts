
import api from '../lib/api';

export interface Notification {
  _id: string;
  userId: string;
  type: 'Email' | 'SMS';
  content: string;
  sentAt: string;
}

export interface SendNotificationData {
  userId: string;
  type: 'Email' | 'SMS';
  content: string;
}

export const notificationsService = {
  // Send notification
  sendNotification: async (data: SendNotificationData) => {
    const response = await api.post('/notifications', data);
    return response.data;
  },
};
