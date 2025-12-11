import { createClient } from 'redis';
import config from '../config/index.js';

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      this.client = createClient({
        username: config.redis.username,
        password: config.redis.password,
        socket: {
          host: config.redis.host,
          port: config.redis.port,
        }
      });

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('Redis client connecting...');
      });

      this.client.on('ready', () => {
        console.log('Redis client ready');
        this.isConnected = true;
      });

      await this.client.connect();
      return this.client;
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
      console.log('Redis client disconnected');
    }
  }

  getClient() {
    if (!this.isConnected) {
      throw new Error('Redis client is not connected');
    }
    return this.client;
  }

  // Room message count operations
  // User message count operations (per-user limit)
  async getUserMessageCount(email) {
    const key = `user:${email}:message_count`;
    const count = await this.client.get(key);
    return count ? parseInt(count) : 0;
  }

  async incrementUserMessageCount(email) {
    const key = `user:${email}:message_count`;
    const newCount = await this.client.incr(key);
    
    // Set expiry if this is the first message (24 hours)
    if (newCount === 1) {
      await this.client.expire(key, config.chat.messageExpirySeconds);
    }
    
    return newCount;
  }

  async resetUserMessageCount(email) {
    const key = `user:${email}:message_count`;
    await this.client.del(key);
  }

  // Room message count operations
  async getMessageCount(roomId) {
    const key = `room:${roomId}:message_count`;
    const count = await this.client.get(key);
    return count ? parseInt(count) : 0;
  }

  async incrementMessageCount(roomId) {
    const key = `room:${roomId}:message_count`;
    const newCount = await this.client.incr(key);
    
    // Set expiry if this is the first message
    if (newCount === 1) {
      await this.client.expire(key, config.chat.messageExpirySeconds);
    }
    
    return newCount;
  }

  async resetMessageCount(roomId) {
    const key = `room:${roomId}:message_count`;
    await this.client.del(key);
  }

  // Store messages in Redis (optional, for message history)
  async storeMessage(roomId, message) {
    const key = `room:${roomId}:messages`;
    await this.client.rPush(key, JSON.stringify(message));
    await this.client.expire(key, config.chat.messageExpirySeconds);
  }

  async getMessages(roomId, start = 0, end = -1) {
    const key = `room:${roomId}:messages`;
    const messages = await this.client.lRange(key, start, end);
    return messages.map(msg => JSON.parse(msg));
  }

  // OTP operations for email authentication
  async storeOTP(email, otp) {
    const key = `otp:${email}`;
    await this.client.setEx(key, 600, otp); // 10 minutes expiry
  }

  async getOTP(email) {
    const key = `otp:${email}`;
    return await this.client.get(key);
  }

  async deleteOTP(email) {
    const key = `otp:${email}`;
    await this.client.del(key);
  }

  // Session management
  async storeSession(sessionId, data) {
    const key = `session:${sessionId}`;
    await this.client.setEx(key, 86400, JSON.stringify(data)); // 24 hours
  }

  async getSession(sessionId) {
    const key = `session:${sessionId}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async deleteSession(sessionId) {
    const key = `session:${sessionId}`;
    await this.client.del(key);
  }

  // Room metadata operations
  async createRoom(roomId, roomName) {
    const key = `room:${roomId}:metadata`;
    const metadata = {
      roomId,
      roomName,
      createdAt: new Date().toISOString(),
    };
    await this.client.setEx(key, config.chat.messageExpirySeconds, JSON.stringify(metadata));
    
    // Add to rooms set for listing
    await this.client.sAdd('active:rooms', roomId);
  }

  async getRoomMetadata(roomId) {
    const key = `room:${roomId}:metadata`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async getAllRooms() {
    const roomIds = await this.client.sMembers('active:rooms');
    return roomIds;
  }

  async deleteRoom(roomId) {
    const key = `room:${roomId}:metadata`;
    await this.client.del(key);
    await this.client.sRem('active:rooms', roomId);
  }
}

export default new RedisClient();
