
import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) return;

    this.socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      auth: {
        token,
      },
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Join lead chat room
  joinLeadChat(leadId: string) {
    this.socket?.emit('joinLeadChat', leadId);
  }

  // Leave lead chat room
  leaveLeadChat(leadId: string) {
    this.socket?.emit('leaveLeadChat', leadId);
  }

  // Listen for lead status updates
  onLeadStatusUpdated(callback: (data: any) => void) {
    this.socket?.on('leadStatusUpdated', callback);
  }

  // Listen for new messages
  onNewMessage(callback: (message: any) => void) {
    this.socket?.on('newMessage', callback);
  }

  // Remove listeners
  off(event: string) {
    this.socket?.off(event);
  }

  get isConnected() {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
