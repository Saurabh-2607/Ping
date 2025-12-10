import express from 'express';
import redisClient from '../services/redis.js';
import config from '../config/index.js';
import socketHandler from '../socket/index.js';

const router = express.Router();

// Create a new room
router.post('/create', async (req, res) => {
  try {
    const { roomId, roomName } = req.body;

    if (!roomId || !roomName) {
      return res.status(400).json({
        success: false,
        message: 'Room ID and room name are required',
      });
    }

    // Check if room already exists
    const existingRoom = await redisClient.getRoomMetadata(roomId);
    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: 'Room already exists',
      });
    }

    // Create the room
    await redisClient.createRoom(roomId, roomName);

    res.json({
      success: true,
      message: 'Room created successfully',
      data: {
        roomId,
        roomName,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error in create room:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create room',
    });
  }
});

// Get all available rooms with active user counts
router.get('/', async (req, res) => {
  try {
    const roomIds = await redisClient.getAllRooms();
    const rooms = [];

    for (const roomId of roomIds) {
      const metadata = await redisClient.getRoomMetadata(roomId);
      const activeUsers = socketHandler.getRoomUsers(roomId);
      const messageCount = await redisClient.getMessageCount(roomId);

      if (metadata) {
        rooms.push({
          roomId,
          roomName: metadata.roomName,
          activeUserCount: activeUsers.length,
          messageCount,
          maxMessages: config.chat.maxMessagesPerRoom,
          isLimitReached: messageCount >= config.chat.maxMessagesPerRoom,
          createdAt: metadata.createdAt,
        });
      }
    }

    // Sort by active users count (descending)
    rooms.sort((a, b) => b.activeUserCount - a.activeUserCount);

    res.json({
      success: true,
      data: {
        rooms,
        totalRooms: rooms.length,
      },
    });
  } catch (error) {
    console.error('Error fetching all rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rooms',
    });
  }
});

// Get user's message count
router.get('/user/:email/stats', async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const userMessageCount = await redisClient.getUserMessageCount(email);
    const isLimitReached = userMessageCount >= config.chat.maxMessagesPerRoom;

    res.json({
      success: true,
      data: {
        email,
        userMessageCount,
        maxMessages: config.chat.maxMessagesPerRoom,
        isLimitReached,
        remainingMessages: Math.max(0, config.chat.maxMessagesPerRoom - userMessageCount),
      },
    });
  } catch (error) {
    console.error('Error in user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics',
    });
  }
});

// Get room statistics
router.get('/:roomId/stats', async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: 'Room ID is required',
      });
    }

    const messageCount = await redisClient.getMessageCount(roomId);
    const isLimitReached = messageCount >= config.chat.maxMessagesPerRoom;

    res.json({
      success: true,
      data: {
        roomId,
        messageCount,
        maxMessages: config.chat.maxMessagesPerRoom,
        isLimitReached,
        remainingMessages: Math.max(0, config.chat.maxMessagesPerRoom - messageCount),
      },
    });
  } catch (error) {
    console.error('Error in room stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch room statistics',
    });
  }
});

// Get room messages
router.get('/:roomId/messages', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 50 } = req.query;

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: 'Room ID is required',
      });
    }

    const messages = await redisClient.getMessages(roomId, 0, parseInt(limit) - 1);

    res.json({
      success: true,
      data: {
        roomId,
        messages,
        count: messages.length,
      },
    });
  } catch (error) {
    console.error('Error in room messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch room messages',
    });
  }
});

// Reset room (admin only - in production, add authentication)
router.post('/:roomId/reset', async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: 'Room ID is required',
      });
    }

    await redisClient.resetMessageCount(roomId);

    res.json({
      success: true,
      message: 'Room reset successfully',
      data: {
        roomId,
        messageCount: 0,
      },
    });
  } catch (error) {
    console.error('Error in room reset:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset room',
    });
  }
});

export default router;
