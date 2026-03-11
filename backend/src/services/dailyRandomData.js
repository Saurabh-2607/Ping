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

  async insertDailyRandomDataIfMissing() {
    const now = new Date();
    const dateKey = this.getTodayKey(now);
    const redisKey = this.buildRedisKey(dateKey);
    const existingValue = await redisClient.getClient().get(redisKey);

    if (existingValue) {
      return false;
    }

    const payload = this.generatePayload(now);
    await redisClient.getClient().set(redisKey, JSON.stringify(payload));
    await redisClient.getClient().sAdd(DAILY_RANDOM_DATA_INDEX_KEY, redisKey);
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