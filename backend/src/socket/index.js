import { Server } from 'socket.io';
import redisClient from '../services/redis.js';
import config from '../config/index.js';
import { v4 as uuidv4 } from 'uuid';

class SocketHandler {
  constructor() {
    this.io = null;
    this.rooms = new Map(); // Track active rooms and users
  }

  initialize(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: config.cors.allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    this.io.on('connection', (socket) => {
      console.log(`New client connected: ${socket.id}`);
      this.handleConnection(socket);
    });

    console.log('Socket.IO server initialized');
    return this.io;
  }

  handleConnection(socket) {
    let currentRoom = null;
    let currentUser = null;

    // Join a room
    socket.on('join-room', async (data) => {
      try {
        const { roomId, user } = data;
        
        if (!roomId || !user || !user.email || !user.name) {
          socket.emit('error', { message: 'Invalid room or user data' });
          return;
        }

        // Leave current room if in one
        if (currentRoom) {
          socket.leave(currentRoom);
          this.removeUserFromRoom(currentRoom, socket.id);
        }

        // Join new room
        socket.join(roomId);
        currentRoom = roomId;
        currentUser = {
          id: socket.id,
          email: user.email,
          name: user.name,
          joinedAt: new Date().toISOString(),
        };

        // Track room membership
        this.addUserToRoom(roomId, currentUser);

        // Get user's message count
        const userMessageCount = await redisClient.getUserMessageCount(user.email);
        const isUserLimitReached = userMessageCount >= config.chat.maxMessagesPerRoom;

        // Get current message count and room stats
        const messageCount = await redisClient.getMessageCount(roomId);
        const isLimitReached = messageCount >= config.chat.maxMessagesPerRoom;
        const messages = await redisClient.getMessages(roomId, 0, 49); // Last 50 messages

        // Send room data to the user
        socket.emit('room-joined', {
          roomId,
          userMessageCount,
          isUserLimitReached,
          messageCount,
          maxMessages: config.chat.maxMessagesPerRoom,
          isLimitReached,
          messages,
          activeUsers: this.getRoomUsers(roomId),
        });

        // Notify others in the room
        socket.to(roomId).emit('user-joined', {
          user: { name: currentUser.name, id: socket.id },
          activeUsers: this.getRoomUsers(roomId),
        });

        console.log(`User ${currentUser.name} joined room: ${roomId}`);
      } catch (error) {
        console.error('Error in join-room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Handle new message
    socket.on('send-message', async (data) => {
      try {
        if (!currentRoom || !currentUser) {
          socket.emit('error', { message: 'Not in a room' });
          return;
        }

        const { text } = data;
        
        if (!text || text.trim().length === 0) {
          socket.emit('error', { message: 'Message cannot be empty' });
          return;
        }

        // Check user's message count (per-user limit)
        const userCount = await redisClient.getUserMessageCount(currentUser.email);
        
        if (userCount >= config.chat.maxMessagesPerRoom) {
          socket.emit('limit-reached', {
            message: 'Your message limit has been reached',
            userMessageCount: userCount,
            maxMessages: config.chat.maxMessagesPerRoom,
          });
          return;
        }

        // Create message object
        const message = {
          id: uuidv4(),
          roomId: currentRoom,
          text: text.trim(),
          user: {
            name: currentUser.name,
            email: currentUser.email,
            id: socket.id,
          },
          timestamp: new Date().toISOString(),
        };

        // Increment user's message count in Redis
        const userMessageCount = await redisClient.incrementUserMessageCount(currentUser.email);
        // Also increment room count for room stats
        const roomMessageCount = await redisClient.incrementMessageCount(currentRoom);

        // Store message in Redis
        await redisClient.storeMessage(currentRoom, message);

        // Broadcast message to all users in the room
        this.io.to(currentRoom).emit('new-message', {
          message,
          userMessageCount,
          roomMessageCount,
          messageCount: roomMessageCount,
          maxMessages: config.chat.maxMessagesPerRoom,
        });

        // Check if user limit is reached
        if (userMessageCount >= config.chat.maxMessagesPerRoom) {
          this.io.to(currentRoom).emit('limit-reached', {
            message: 'User has reached the 50-message limit',
            userMessageCount,
            maxMessages: config.chat.maxMessagesPerRoom,
          });
        }

        console.log(`Message from ${currentUser.email} in room ${currentRoom}: user count ${userMessageCount}/${config.chat.maxMessagesPerRoom}`);
      } catch (error) {
        console.error('Error in send-message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing', () => {
      if (currentRoom && currentUser) {
        socket.to(currentRoom).emit('user-typing', {
          user: { name: currentUser.name, id: socket.id },
        });
      }
    });

    socket.on('stop-typing', () => {
      if (currentRoom && currentUser) {
        socket.to(currentRoom).emit('user-stop-typing', {
          user: { name: currentUser.name, id: socket.id },
        });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      
      if (currentRoom && currentUser) {
        this.removeUserFromRoom(currentRoom, socket.id);
        
        socket.to(currentRoom).emit('user-left', {
          user: { name: currentUser.name, id: socket.id },
          activeUsers: this.getRoomUsers(currentRoom),
        });
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  addUserToRoom(roomId, user) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Map());
    }
    this.rooms.get(roomId).set(user.id, user);
  }

  removeUserFromRoom(roomId, userId) {
    if (this.rooms.has(roomId)) {
      this.rooms.get(roomId).delete(userId);
      
      // Clean up empty rooms
      if (this.rooms.get(roomId).size === 0) {
        this.rooms.delete(roomId);
      }
    }
  }

  getRoomUsers(roomId) {
    if (!this.rooms.has(roomId)) {
      return [];
    }
    return Array.from(this.rooms.get(roomId).values()).map(user => ({
      id: user.id,
      name: user.name,
      joinedAt: user.joinedAt,
    }));
  }

  getIO() {
    return this.io;
  }
}

export default new SocketHandler();
