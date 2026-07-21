import 'dotenv/config';

export default {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  authToken: process.env.AUTH_TOKEN || 'muhmelellode',
  
  redis: {
    url: process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_HOST,
    token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_PASSWORD,
  },
  
  resend: {
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.FROM_EMAIL || 'noreply@resend.dev',
  },
  
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS === '*' ? '*' : (process.env.ALLOWED_ORIGINS || '*').split(','),
  },
  
  chat: {
    maxMessagesPerRoom: parseInt(process.env.MAX_MESSAGES_PER_ROOM || '50'),
    messageExpirySeconds: parseInt(process.env.MESSAGE_EXPIRY_SECONDS || '86400'),
  },
};
