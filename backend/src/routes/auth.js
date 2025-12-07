import express from 'express';
import emailService from '../services/email.js';
import redisClient from '../services/redis.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Request OTP for email authentication
router.post('/request-otp', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email and name are required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    // Send OTP
    const result = await emailService.sendOTP(email, name);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP',
        error: result.error,
      });
    }

    res.json({
      success: true,
      message: 'OTP sent successfully to your email',
    });
  } catch (error) {
    console.error('Error in request-otp:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
    });
  }
});

// Verify OTP and create session
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, name } = req.body;

    if (!email || !otp || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and name are required',
      });
    }

    // Verify OTP
    const verification = await emailService.verifyOTP(email, otp);

    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        message: verification.message,
      });
    }

    // Create session
    const sessionId = uuidv4();
    const sessionData = {
      email,
      name,
      createdAt: new Date().toISOString(),
    };

    await redisClient.storeSession(sessionId, sessionData);

    res.json({
      success: true,
      message: 'Authentication successful',
      session: {
        sessionId,
        email,
        name,
      },
    });
  } catch (error) {
    console.error('Error in verify-otp:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
    });
  }
});

// Validate session
router.post('/validate-session', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required',
      });
    }

    const sessionData = await redisClient.getSession(sessionId);

    if (!sessionData) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session',
      });
    }

    res.json({
      success: true,
      session: sessionData,
    });
  } catch (error) {
    console.error('Error in validate-session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate session',
    });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (sessionId) {
      await redisClient.deleteSession(sessionId);
    }

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Error in logout:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to logout',
    });
  }
});

export default router;
