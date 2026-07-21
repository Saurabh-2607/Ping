import { timingSafeEqual } from 'crypto';
import config from '../config/index.js';
import redisClient from '../services/redis.js';

function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export async function authenticateToken(req, res, next) {
  try {
    let token = null;

    // 1. Check Authorization header (Bearer token or raw token)
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7).trim();
      } else {
        token = authHeader.trim();
      }
    }

    // 2. Check custom headers
    if (!token) {
      token = req.headers['x-auth-token'] || req.headers['x-session-id'];
    }

    // 3. Check query parameters or body
    if (!token) {
      token = req.query?.token || req.query?.sessionId || req.body?.token || req.body?.sessionId;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Authentication token is required',
      });
    }

    // Rate-limit failed auth attempts in Redis to prevent brute-force attacks
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const failKey = `auth_fails:${ip}`;

    if (redisClient.isConnected) {
      const failCount = await redisClient.getClient().get(failKey);
      if (failCount && parseInt(failCount) > 10) {
        return res.status(429).json({
          success: false,
          message: 'Too many failed authentication attempts. Please try again later.',
        });
      }
    }

    // Check timing-safe token match against environment AUTH_TOKEN
    if (config.authToken && safeCompare(token, config.authToken)) {
      req.authType = 'env_token';
      return next();
    }

    // Alternatively check if token is a valid Redis session ID
    if (redisClient.isConnected) {
      const session = await redisClient.getSession(token);
      if (session) {
        req.session = session;
        req.authType = 'user_session';
        return next();
      }

      // Record failed attempt
      const newFails = await redisClient.getClient().incr(failKey);
      if (newFails === 1) {
        await redisClient.getClient().expire(failKey, 900); // 15 min lock window
      }
    }

    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired authentication token',
    });
  } catch (error) {
    console.error('Error in authenticateToken middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication',
    });
  }
}
