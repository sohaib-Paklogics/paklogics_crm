
import socketIo from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

let io;

const initializeSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.name} connected`);

    // Join lead-specific chat rooms
    socket.on('joinLeadChat', (leadId) => {
      socket.join(`lead:${leadId}`);
      console.log(`User ${socket.user.name} joined lead chat: ${leadId}`);
    });

    // Leave lead-specific chat rooms
    socket.on('leaveLeadChat', (leadId) => {
      socket.leave(`lead:${leadId}`);
      console.log(`User ${socket.user.name} left lead chat: ${leadId}`);
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.user.name} disconnected`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export {
  initializeSocket,
  getIO
};
