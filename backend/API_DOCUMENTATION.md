# Chat App Backend API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Setup Instructions](#setup-instructions)
3. [Architecture](#architecture)
4. [Authentication Flow](#authentication-flow)
5. [REST API Endpoints](#rest-api-endpoints)
6. [WebSocket Events](#websocket-events)
7. [Frontend Integration Guide](#frontend-integration-guide)
8. [Error Handling](#error-handling)
9. [Rate Limiting & Security](#rate-limiting--security)

---

## Overview

This is a real-time chat application backend built with:
- **Node.js + Express** for REST API
- **Socket.IO** for real-time WebSocket communication
- **Redis** for message tracking and session management
- **Convex DB** for persistent data storage
- **Resend** for email-based OTP authentication

### Key Features
- Email-based authentication with OTP
- URL-based dynamic room creation
- Real-time message broadcasting
- 50-message room limit with progress tracking
- Session management with Redis
- Dual storage: Redis (fast) + Convex (persistent)

### URL-Based Rooms
- Room name is everything after `/room/` in the URL (e.g., `/room/project-alpha` → `project-alpha`)
- Users visiting the same `/room/<name>` path join the same room automatically
- Socket connections can omit `roomId`; the server infers it from the HTTP referer path `/room/<name>` during the Socket.IO handshake
- Single global namespace; no room picker UI required

---

## Setup Instructions

### Prerequisites
- Node.js v18+ 
- Redis server running locally or remotely
- Convex account (optional but recommended)
- Resend API key for email

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Convex Configuration (optional)
CONVEX_DEPLOYMENT=https://your-deployment.convex.cloud
CONVEX_DEPLOY_KEY=your_deploy_key

# Resend Email Configuration
RESEND_API_KEY=re_xxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Chat Configuration
MAX_MESSAGES_PER_ROOM=50
MESSAGE_EXPIRY_SECONDS=86400
```

3. **Start Redis:**
```bash
# Windows (if using Redis for Windows)
redis-server

# Or use Docker
docker run -d -p 6379:6379 redis:alpine
```

4. **Deploy Convex functions (if using Convex):**
```bash
npx convex dev
```

5. **Start the server:**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server will start at `http://localhost:3000`

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│  (HTML/CSS/JS or React/Vue - URL-based routing)            │
└───────────────┬─────────────────────────────────────────────┘
                │
                │ HTTP/WebSocket
                │
┌───────────────▼─────────────────────────────────────────────┐
│                    EXPRESS SERVER                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  REST API Routes                                    │   │
│  │  • /api/auth/* (OTP authentication)                 │   │
│  │  • /api/rooms/* (Room stats & management)           │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Socket.IO Handler                                  │   │
│  │  • join-room, send-message, typing, etc.            │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────┬───────────────────┬──────────────────────────┘
               │                   │
        ┌──────▼──────┐    ┌──────▼──────┐
        │    REDIS    │    │   CONVEX    │
        │             │    │             │
        │ • Messages  │    │ • Users     │
        │ • Counts    │    │ • Messages  │
        │ • Sessions  │    │ • Rooms     │
        │ • OTPs      │    │             │
        └─────────────┘    └─────────────┘
```

### Data Flow

1. **Authentication**: Frontend → REST API → Redis (OTP) → Resend (Email)
2. **Join Room**: Frontend → Socket.IO → Redis (count) → Frontend
3. **Send Message**: Frontend → Socket.IO → Redis → Convex → Broadcast to all clients
4. **Message Limit**: Redis room counter reaches 50 → Trigger limit-reached event

---

## Authentication Flow

### Step 1: Request OTP

**Endpoint:** `POST /api/auth/request-otp`

**Request:**
```json
{
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully to your email"
}
```

**What happens:**
- 6-digit OTP is generated
- Stored in Redis with 10-minute expiry
- Sent to user's email via Resend
- Beautiful HTML email template with OTP

### Step 2: Verify OTP

**Endpoint:** `POST /api/auth/verify-otp`

**Request:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Authentication successful",
  "session": {
    "sessionId": "uuid-v4-session-id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**What happens:**
- OTP is verified against Redis
- Session created with 24-hour expiry
- Session ID returned to frontend
- Frontend stores sessionId in localStorage

### Step 3: Validate Session (Optional)

**Endpoint:** `POST /api/auth/validate-session`

**Request:**
```json
{
  "sessionId": "uuid-v4-session-id"
}
```

**Response:**
```json
{
  "success": true,
  "session": {
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2025-12-07T10:00:00.000Z"
  }
}
```

### Step 4: Logout

**Endpoint:** `POST /api/auth/logout`

**Request:**
```json
{
  "sessionId": "uuid-v4-session-id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## REST API Endpoints

### Health Check

**GET** `/health`

Check server status and service connectivity.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-07T10:00:00.000Z",
  "services": {
    "redis": true,
    "convex": true
  }
}
```

---

### Room Statistics

**GET** `/api/rooms/:roomId/stats`

Get current statistics for a specific room.

**Parameters:**
- `roomId` (path): Room identifier from URL

**Response:**
```json
{
  "success": true,
  "data": {
    "roomId": "project-alpha",
    "messageCount": 23,
    "maxMessages": 50,
    "isLimitReached": false,
    "remainingMessages": 27
  }
}
```

---

### Room Messages

**GET** `/api/rooms/:roomId/messages?limit=50`

Retrieve message history for a room.

**Parameters:**
- `roomId` (path): Room identifier
- `limit` (query, optional): Number of messages to retrieve (default: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "roomId": "project-alpha",
    "messages": [
      {
        "id": "uuid",
        "text": "Hello world!",
        "user": {
          "name": "John Doe",
          "email": "john@example.com",
          "id": "socket-id"
        },
        "timestamp": "2025-12-07T10:00:00.000Z"
      }
    ],
    "count": 23
  }
}
```

---

### Reset Room

**POST** `/api/rooms/:roomId/reset`

Reset message count for a room (admin functionality).

**Parameters:**
- `roomId` (path): Room identifier

**Response:**
```json
{
  "success": true,
  "message": "Room reset successfully",
  "data": {
    "roomId": "project-alpha",
    "messageCount": 0
  }
}
```

---

## WebSocket Events

Connect to Socket.IO server:
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  transports: ['websocket'],
  reconnection: true,
});
```

---

### Client → Server Events

#### 1. join-room

Join a chat room.

**Emit:**
```javascript
socket.emit('join-room', {
  roomId: 'project-alpha',
  user: {
    email: 'user@example.com',
    name: 'John Doe'
  }
});
```

**Receives:** `room-joined` event

---

#### 2. send-message

Send a message to the current room.

**Emit:**
```javascript
socket.emit('send-message', {
  text: 'Hello everyone!'
});
```

**Receives:** `new-message` event (broadcast to all room members)

---

#### 3. typing

Notify others that user is typing.

**Emit:**
```javascript
socket.emit('typing');
```

**Receives:** Other users receive `user-typing` event

---

#### 4. stop-typing

Notify others that user stopped typing.

**Emit:**
```javascript
socket.emit('stop-typing');
```

**Receives:** Other users receive `user-stop-typing` event

---

### Server → Client Events

#### 1. room-joined

Confirmation that user successfully joined a room.

**Receives:**
```javascript
socket.on('room-joined', (data) => {
  console.log(data);
  /*
  {
    roomId: 'project-alpha',
    messageCount: 23,
    maxMessages: 50,
    isLimitReached: false,
    messages: [...], // Last 50 messages
    activeUsers: [
      { id: 'socket-id', name: 'John Doe', joinedAt: '...' }
    ]
  }
  */
});
```

---

#### 2. new-message

New message received in the room.

**Receives:**
```javascript
socket.on('new-message', (data) => {
  console.log(data);
  /*
  {
    message: {
      id: 'uuid',
      roomId: 'project-alpha',
      text: 'Hello!',
      user: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        id: 'socket-id'
      },
      timestamp: '2025-12-07T10:00:00.000Z'
    },
    roomMessageCount: 24,
    messageCount: 24, // alias
    maxMessages: 50
  }
  */
});
```

---

#### 3. limit-reached

Room has reached the 50-message limit.

**Receives:**
```javascript
socket.on('limit-reached', (data) => {
  console.log(data);
  /*
  {
    message: 'Room has reached the 50-message limit',
    messageCount: 50,
    maxMessages: 50
  }
  */
  
  // Frontend should:
  // 1. Disable chat input (block further sends)
  // 2. Show full-screen modal overlay that blocks the UI (no close X)
  // 3. Display upgrade message and keep overlay until plan/credits change
  // 4. Provide a button (e.g., "Buy credits") that can log/Toast for now
});
```

---

#### 4. user-joined

Another user joined the room.

**Receives:**
```javascript
socket.on('user-joined', (data) => {
  console.log(data);
  /*
  {
    user: { name: 'New User', id: 'socket-id' },
    activeUsers: [...] // Updated list
  }
  */
});
```

---

#### 5. user-left

User left the room.

**Receives:**
```javascript
socket.on('user-left', (data) => {
  console.log(data);
  /*
  {
    user: { name: 'John Doe', id: 'socket-id' },
    activeUsers: [...] // Updated list
  }
  */
});
```

---

#### 6. user-typing

Another user is typing.

**Receives:**
```javascript
socket.on('user-typing', (data) => {
  console.log(data);
  /*
  {
    user: { name: 'Jane Smith', id: 'socket-id' }
  }
  */
});
```

---

#### 7. user-stop-typing

User stopped typing.

**Receives:**
```javascript
socket.on('user-stop-typing', (data) => {
  console.log(data);
  /*
  {
    user: { name: 'Jane Smith', id: 'socket-id' }
  }
  */
});
```

---

#### 8. error

Error occurred.

**Receives:**
```javascript
socket.on('error', (data) => {
  console.error(data);
  /*
  {
    message: 'Error description'
  }
  */
});
```

---

## Frontend Integration Guide

### Complete Implementation Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chat App</title>
  <script src="https://cdn.socket.io/4.6.1/socket.io.min.js"></script>
</head>
<body>
  <div id="auth-screen">
    <h2>Login</h2>
    <input id="email" type="email" placeholder="Email">
    <input id="name" type="text" placeholder="Name">
    <button onclick="requestOTP()">Send OTP</button>
    
    <div id="otp-input" style="display:none">
      <input id="otp" type="text" placeholder="Enter OTP">
      <button onclick="verifyOTP()">Verify</button>
    </div>
  </div>

  <div id="chat-screen" style="display:none">
    <h2>Room: <span id="room-name"></span></h2>
    <div id="progress">
      <div id="progress-bar" style="width:0%;height:20px;background:blue;"></div>
      <span id="message-count">0 / 50</span>
    </div>
    
    <div id="messages"></div>
    <div id="typing-indicator"></div>
    
    <input id="message-input" type="text" placeholder="Type a message...">
    <button onclick="sendMessage()">Send</button>
  </div>

  <div id="limit-modal" style="display:none">
    <h1>Free Tier Completed!</h1>
    <p>You've sent 50 messages. Please upgrade to continue.</p>
    <button onclick="buyCredits()">Buy Credits</button>
  </div>

  <script>
    const API_URL = 'http://localhost:3000';
    let socket;
    let sessionData = null;

    // Parse room from URL: /room/project-alpha → "project-alpha"
    const roomId = window.location.pathname.split('/room/')[1] || 'default';

    // Check for existing session
    window.onload = () => {
      const session = localStorage.getItem('chatSession');
      if (session) {
        sessionData = JSON.parse(session);
        validateSession();
      }
    };

    async function validateSession() {
      try {
        const response = await fetch(`${API_URL}/api/auth/validate-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: sessionData.sessionId })
        });
        
        const data = await response.json();
        if (data.success) {
          initializeChat();
        } else {
          localStorage.removeItem('chatSession');
          document.getElementById('auth-screen').style.display = 'block';
        }
      } catch (error) {
        console.error('Session validation failed:', error);
      }
    }

    async function requestOTP() {
      const email = document.getElementById('email').value;
      const name = document.getElementById('name').value;

      try {
        const response = await fetch(`${API_URL}/api/auth/request-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name })
        });

        const data = await response.json();
        if (data.success) {
          alert('OTP sent to your email!');
          document.getElementById('otp-input').style.display = 'block';
        }
      } catch (error) {
        console.error('Failed to request OTP:', error);
      }
    }

    async function verifyOTP() {
      const email = document.getElementById('email').value;
      const name = document.getElementById('name').value;
      const otp = document.getElementById('otp').value;

      try {
        const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name, otp })
        });

        const data = await response.json();
        if (data.success) {
          sessionData = data.session;
          localStorage.setItem('chatSession', JSON.stringify(sessionData));
          initializeChat();
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('Failed to verify OTP:', error);
      }
    }

    function initializeChat() {
      document.getElementById('auth-screen').style.display = 'none';
      document.getElementById('chat-screen').style.display = 'block';
      document.getElementById('room-name').textContent = roomId;

      // Connect to Socket.IO
      socket = io(API_URL);

      socket.on('connect', () => {
        console.log('Connected to server');
        
        // Join room
        socket.emit('join-room', {
          roomId: roomId,
          user: {
            email: sessionData.email,
            name: sessionData.name
          }
        });
      });

      socket.on('room-joined', (data) => {
        console.log('Joined room:', data);
        updateProgress(data.messageCount, data.maxMessages);
        if (data.isLimitReached) {
          lockChat();
        }
        
        // Display existing messages
        data.messages.forEach(msg => displayMessage(msg));
      });

      socket.on('new-message', (data) => {
        displayMessage(data.message);
        updateProgress(data.messageCount, data.maxMessages);
        if (data.messageCount >= data.maxMessages) {
          lockChat();
        }
      });

      socket.on('limit-reached', (data) => {
        console.log('limit-reached', data);
        lockChat();
      });

      socket.on('user-joined', (data) => {
        console.log('User joined:', data.user.name);
      });

      socket.on('user-left', (data) => {
        console.log('User left:', data.user.name);
      });

      socket.on('user-typing', (data) => {
        document.getElementById('typing-indicator').textContent = 
          `${data.user.name} is typing...`;
      });

      socket.on('user-stop-typing', () => {
        document.getElementById('typing-indicator').textContent = '';
      });

      // Typing indicator
      let typingTimeout;
      document.getElementById('message-input').addEventListener('input', () => {
        socket.emit('typing');
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
          socket.emit('stop-typing');
        }, 1000);
      });
    }

    function sendMessage() {
      const input = document.getElementById('message-input');
      const text = input.value.trim();

      if (text && socket && !input.disabled) {
        socket.emit('send-message', { text });
        input.value = '';
        socket.emit('stop-typing');
      }
    }

    function displayMessage(message) {
      const messagesDiv = document.getElementById('messages');
      const messageEl = document.createElement('div');
      messageEl.innerHTML = `
        <strong>${message.user.name}</strong>
        <span>${new Date(message.timestamp).toLocaleTimeString()}</span>
        <p>${message.text}</p>
      `;
      messagesDiv.appendChild(messageEl);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    function updateProgress(count, max) {
      const percentage = (count / max) * 100;
      document.getElementById('progress-bar').style.width = percentage + '%';
      document.getElementById('message-count').textContent = `${count} / ${max}`;
    }

    function lockChat() {
      const input = document.getElementById('message-input');
      input.disabled = true;
      document.getElementById('limit-modal').style.display = 'flex';
    }

    function buyCredits() {
      console.log('Buy credits clicked');
      alert('Payment integration coming soon!');
    }
  </script>
</body>
</html>
```

---

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Email and name are required"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Invalid or expired session"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Route not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

### Socket.IO Error Handling

```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error);
  alert(error.message);
});

socket.on('connect_error', (error) => {
  console.error('Connection failed:', error);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
  if (reason === 'io server disconnect') {
    // Reconnect manually
    socket.connect();
  }
});
```

---

## Rate Limiting & Security

### Best Practices

1. **Environment Variables**: Never commit `.env` file
2. **CORS**: Configure `ALLOWED_ORIGINS` properly in production
3. **Redis Password**: Use password in production
4. **Session Security**: Store sessionId in httpOnly cookies (not localStorage) in production
5. **Rate Limiting**: Implement rate limiting on auth endpoints

### Example Rate Limiting (add to routes):

```javascript
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts'
});

app.use('/api/auth', authLimiter, authRoutes);
```

---

## Deployment Checklist

- [ ] Set all environment variables
- [ ] Configure Redis (production instance)
- [ ] Deploy Convex functions
- [ ] Set up Resend with verified domain
- [ ] Configure CORS for production domain
- [ ] Enable HTTPS
- [ ] Set up monitoring (logs, errors)
- [ ] Configure rate limiting
- [ ] Set up automated backups
- [ ] Test email deliverability

---

## Support & Troubleshooting

### Redis Connection Issues
```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG
```

### Socket.IO Connection Issues
- Check CORS configuration
- Verify firewall rules
- Test with `wscat` or Socket.IO client

### Email Not Sending
- Verify Resend API key
- Check FROM_EMAIL is verified in Resend
- Check spam folder
- Review Resend dashboard for errors

---

## License

ISC

---

## Contact

For questions or issues, please contact the development team.
