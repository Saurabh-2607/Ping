import 'dotenv/config';

export default {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  redis: {
    username: process.env.REDIS_USERNAME || 'default',
    password: process.env.REDIS_PASSWORD,
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
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
