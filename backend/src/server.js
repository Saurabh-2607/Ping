import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import config from './config/index.js';
import redisClient from './services/redis.js';
import socketHandler from './socket/index.js';
import authRoutes from './routes/auth.js';
import roomRoutes from './routes/rooms.js';

const app = express();
const httpServer = createServer(app);

// CORS Middleware - allow all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

// Handle preflight requests explicitly
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      redis: redisClient.isConnected,
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// Initialize services and start server
async function startServer() {
  try {
    // Connect to Redis
    // Connect to Redis
    console.log('Connecting to Redis Cloud...');
    await redisClient.connect();

    // Initialize Socket.IO
    console.log('Initializing Socket.IO...');
    socketHandler.initialize(httpServer);

    // Start server
    httpServer.listen(config.port, () => {
      console.log('\n' + '='.repeat(60));
      console.log('Chat App Backend Server Started Successfully!');
      console.log('='.repeat(60));
      console.log(`Server running on: http://localhost:${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
      console.log(`Redis: ${redisClient.isConnected ? 'Connected' : 'Disconnected'}`);
      console.log(`Redis Host: ${config.redis.host}`);
      console.log(`Max messages per room: ${config.chat.maxMessagesPerRoom}`);
      console.log('='.repeat(60) + '\n');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\nSIGTERM received. Shutting down gracefully...');
  
  // Close Socket.IO connections
  socketHandler.getIO()?.close();
  
  // Disconnect from Redis
  await redisClient.disconnect();
  
  // Close HTTP server
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT received. Shutting down gracefully...');
  
  // Close Socket.IO connections
  socketHandler.getIO()?.close();
  
  // Disconnect from Redis
  await redisClient.disconnect();
  
  // Close HTTP server
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start the server
startServer();

export default app;
