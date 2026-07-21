import { Redis } from '@upstash/redis';
import config from '../config/index.js';

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      if (config.redis.url && config.redis.token) {
        this.client = new Redis({
          url: config.redis.url,
          token: config.redis.token,
        });
      } else {
        this.client = Redis.fromEnv();
      }

      // Test connectivity using ping
      await this.client.ping();
      this.isConnected = true;
      console.log('Upstash Redis client connected successfully');
      return this.client;
    } catch (error) {
      console.error('Failed to connect to Upstash Redis:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect() {
    this.isConnected = false;
    console.log('Upstash Redis client disconnected');
  }

  getClient() {
    if (!this.isConnected || !this.client) {
      throw new Error('Upstash Redis client is not connected');
    }
    return this.client;
  }

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

  // Store messages in Upstash Redis (for message history)
  async storeMessage(roomId, message) {
    const key = `room:${roomId}:messages`;
    await this.client.rpush(key, message);
    await this.client.expire(key, config.chat.messageExpirySeconds);
  }

  async getMessages(roomId, start = 0, end = -1) {
    const key = `room:${roomId}:messages`;
    const messages = await this.client.lrange(key, start, end);
    if (!messages) return [];
    return messages.map(msg => (typeof msg === 'string' ? JSON.parse(msg) : msg));
  }

  // OTP operations for email authentication
  async storeOTP(email, otp) {
    const key = `otp:${email}`;
    await this.client.set(key, otp, { ex: 600 }); // 10 minutes expiry
  }

  async getOTP(email) {
    const key = `otp:${email}`;
    const otp = await this.client.get(key);
    return otp ? String(otp) : null;
  }

  async deleteOTP(email) {
    const key = `otp:${email}`;
    await this.client.del(key);
  }

  // Session management
  async storeSession(sessionId, data) {
    const key = `session:${sessionId}`;
    await this.client.set(key, data, { ex: 86400 }); // 24 hours
  }

  async getSession(sessionId) {
    const key = `session:${sessionId}`;
    const data = await this.client.get(key);
    if (!data) return null;
    return typeof data === 'string' ? JSON.parse(data) : data;
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
    await this.client.set(key, metadata, { ex: config.chat.messageExpirySeconds });
    
    // Add to rooms set for listing
    await this.client.sadd('active:rooms', roomId);
  }

  async getRoomMetadata(roomId) {
    const key = `room:${roomId}:metadata`;
    const data = await this.client.get(key);
    if (!data) return null;
    return typeof data === 'string' ? JSON.parse(data) : data;
  }

  async getAllRooms() {
    const roomIds = await this.client.smembers('active:rooms');
    return roomIds || [];
  }

  async deleteRoom(roomId) {
    const key = `room:${roomId}:metadata`;
    await this.client.del(key);
    await this.client.srem('active:rooms', roomId);
  }
}

export default new RedisClient();
