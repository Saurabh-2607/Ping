import express from 'express';
import redisClient from '../services/redis.js';
import config from '../config/index.js';

const router = express.Router();

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
