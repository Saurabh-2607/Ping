import { randomInt, randomUUID } from 'crypto';
import redisClient from './redis.js';

const DAILY_RANDOM_DATA_INDEX_KEY = 'daily:random-data:keys';
const WORD_BANK = {
  adjectives: ['swift', 'quiet', 'bright', 'steady', 'curious', 'vivid'],
  nouns: ['comet', 'forest', 'signal', 'river', 'echo', 'lantern'],
};

class DailyRandomDataService {
  constructor() {
    this.timeoutId = null;
  }

  getTodayKey(date = new Date()) {
    return date.toISOString().slice(0, 10);
  }

  buildRedisKey(dateKey) {
    return `daily:random-data:${dateKey}`;
  }

  generatePayload(date = new Date()) {
    const adjective = WORD_BANK.adjectives[randomInt(0, WORD_BANK.adjectives.length)];
    const noun = WORD_BANK.nouns[randomInt(0, WORD_BANK.nouns.length)];

    return {
      id: randomUUID(),
      date: this.getTodayKey(date),
      generatedAt: date.toISOString(),
      value: randomInt(100000, 999999),
      label: `${adjective}-${noun}`,
    };
  }

  getDelayUntilNextRun(now = new Date()) {
    const nextRun = new Date(now);
    nextRun.setDate(now.getDate() + 1);
    nextRun.setHours(0, 0, 0, 0);
    return nextRun.getTime() - now.getTime();
  }

  async pushRandomData(cooldownSeconds = 5) {
    const client = redisClient.getClient();

    // Anti-abuse: enforce a minimum cooldown window between pushes
    const acquired = await client.set('random-data:cooldown', 'active', {
      ex: cooldownSeconds,
      nx: true,
    });

    if (!acquired) {
      const error = new Error(`Rate limit exceeded: Please wait ${cooldownSeconds} seconds between data pushes.`);
      error.status = 429;
      error.retryAfter = cooldownSeconds;
      throw error;
    }

    const now = new Date();
    const payload = this.generatePayload(now);
    const redisKey = `daily:random-data:${payload.id}`;

    // Set individual item with 7-day TTL to prevent DB memory growth
    await client.set(redisKey, payload, { ex: 604800 });
    await client.sadd(DAILY_RANDOM_DATA_INDEX_KEY, redisKey);
    await client.lpush('random-data:list', payload);
    // Cap list at maximum 100 entries to prevent memory abuse
    await client.ltrim('random-data:list', 0, 99);
    await client.set('random-data:latest', payload, { ex: 604800 });

    console.log(`Pushed random data entry [${payload.id}] (${payload.label}) to DB`);
    return payload;
  }

  async getAllRandomData(limit = 50) {
    const client = redisClient.getClient();
    const items = await client.lrange('random-data:list', 0, limit - 1);
    if (!items || items.length === 0) {
      // Fallback: check index keys
      const keys = await client.smembers(DAILY_RANDOM_DATA_INDEX_KEY);
      if (!keys || keys.length === 0) return [];
      const fetched = [];
      for (const k of keys.slice(0, limit)) {
        const data = await client.get(k);
        if (data) {
          fetched.push(typeof data === 'string' ? JSON.parse(data) : data);
        }
      }
      return fetched;
    }
    return items.map(item => (typeof item === 'string' ? JSON.parse(item) : item));
  }

  async insertDailyRandomDataIfMissing() {
    const now = new Date();
    const dateKey = this.getTodayKey(now);
    const redisKey = this.buildRedisKey(dateKey);
    const existingValue = await redisClient.getClient().get(redisKey);

    if (existingValue) {
      return false;
    }

    const payload = this.generatePayload(now);
    await redisClient.getClient().set(redisKey, payload);
    await redisClient.getClient().sadd(DAILY_RANDOM_DATA_INDEX_KEY, redisKey);
    await redisClient.getClient().lpush('random-data:list', payload);
    console.log(`Inserted daily random data for ${dateKey}`);
    return true;
  }

  scheduleNextRun() {
    const delay = this.getDelayUntilNextRun();
    this.timeoutId = setTimeout(async () => {
      try {
        await this.insertDailyRandomDataIfMissing();
      } catch (error) {
        console.error('Daily random data job failed:', error);
      } finally {
        this.scheduleNextRun();
      }
    }, delay);
  }

  async start() {
    await this.insertDailyRandomDataIfMissing();
    this.scheduleNextRun();
  }

  stop() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

export default new DailyRandomDataService();