import express from 'express';
import rateLimit from 'express-rate-limit';
import { authenticateToken } from '../middleware/auth.js';
import dailyRandomDataService from '../services/dailyRandomData.js';

const router = express.Router();

// Anti-abuse rate limiter middleware (max 10 push requests per minute per IP)
const pushLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // max 10 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Rate limit exceeded: Too many requests from this IP. Please wait 1 minute before trying again.',
  },
});

// Push random data into database (requires authentication token + rate limited)
router.post('/', pushLimiter, authenticateToken, async (req, res) => {
  try {
    const data = await dailyRandomDataService.pushRandomData();

    res.status(201).json({
      success: true,
      message: 'Random data successfully pushed to database',
      authType: req.authType,
      data,
    });
  } catch (error) {
    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        message: error.message,
        retryAfterSeconds: error.retryAfter,
      });
    }
    console.error('Error pushing random data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to push random data to database',
    });
  }
});

// Alias endpoint for pushing random data
router.post('/push', pushLimiter, authenticateToken, async (req, res) => {
  try {
    const data = await dailyRandomDataService.pushRandomData();

    res.status(201).json({
      success: true,
      message: 'Random data successfully pushed to database',
      authType: req.authType,
      data,
    });
  } catch (error) {
    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        message: error.message,
        retryAfterSeconds: error.retryAfter,
      });
    }
    console.error('Error pushing random data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to push random data to database',
    });
  }
});

// Get all pushed random data entries (max limit 100 to prevent oversized responses)
router.get('/', async (req, res) => {
  try {
    const requestedLimit = parseInt(req.query.limit || '50');
    const limit = Math.min(Math.max(requestedLimit, 1), 100);
    const data = await dailyRandomDataService.getAllRandomData(limit);

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error('Error fetching random data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch random data',
    });
  }
});

export default router;
