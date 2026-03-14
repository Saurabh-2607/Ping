<p align="center">
  <img src="./banner.png" alt="Ping Banner" />
</p>

<p align="center">
Frontend - 
  <a href="https://ping.headbanger.me">ping.headbanger.me</a><br>
Backend -
  <a href="https://chat-app-lzp5.onrender.com"> chat-app-lzp5.onrender.com</a>
</p>

# Ping Chat Application

This document provides a comprehensive overview of the Ping Chat Application, including setup instructions, features, and technical implementation details.

## Setup Instructions

The application consists of two parts: a Backend API/WebSocket server and a Frontend client. Both must be running for the application to function correctly.

### Prerequisites
- Node.js (Version 16 or higher)
- Redis Server (Running locally or accessible via cloud)

### 1. Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure environment variables:
    - Create a `.env` file based on `.env.example`.
    - Ensure Redis connection details are correct.
4.  Start the server:
    ```bash
    npm run dev
    ```
    The backend runs on port 3000 by default.

### 2. Frontend Setup

1.  Open a new terminal and navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the application:
    ```bash
    npm run dev
    ```
    The frontend runs on port 3000 (usually proxied to a different port if backend is taking 3000, e.g., 3001) or as configured. Check the console output for the local URL.

## Technical Architecture

### Socket Implementation

The real-time communication functionality is implemented using **Socket.IO**.

1.  **Connection**: When a client enters a room, a WebSocket connection is established. The user joins a specific "room" channel identified by the `roomId`.
2.  **Event-Driven Communication**: Data is transferred via named events.
    - `join-room`: Sent by client to authenticate and subscribe to room updates.
    - `send-message`: Sent by client to push new content.
    - `new-message`: Broadcast by server to all subscribers of the room.
3.  **State Management**: While Socket.IO requires a persistent connection, the application state (users, room metadata) is managed in memory on the server instance, with persistent data (message history) offloaded to **Redis**. This allows for quick state recovery and potentially scaling across multiple instances using a Redis adapter if needed in the future.

### Enforcing the 50-Message Limit

To maintain performance and manage resources, each chat room is strictly limited to 50 active messages. This is enforced on the backend before any new message is processed:

1.  **Pre-Validation**: When a `send-message` event is received, the server queries Redis for the current message count of the specific room.
2.  **Conditional Logic**:
    - If the count is **less than 50**, the message is accepted, stored in Redis, and broadcast to the room. The counter is then incremented.
    - If the count is **equal to or greater than 50**, the server rejects the message. It immediately emits a `limit-reached` event back to the sender (or the room), preventing the addition of new data.
3.  **UI Synchronization**: The frontend listens for the `limit-reached` event to disable the input field and notify the user that the conversation limit has been met.

## Additional Features

Beyond standard real-time messaging, the application includes several advanced capabilities:

-   **Secure Authentication**: A passwordless login system using Email OTPs (One-Time Passwords) ensures verified user identity without the hassle of managing passwords.
-   **Rich Media & Stickers**: Integrated support for the Tenor API allows users to search for and send animated stickers, enhancing expressiveness.
-   **Real-Time Presence**: Users can see "typing..." indicators when others are composing messages, along with a live list of active participants in the room.
-   **Session Persistence**: Redis-backed session management allows users to refresh the page or reconnect without losing their logged-in state.
-   **Smart Message Grouping**: To keep the chat clean and readable, consecutive messages from the same user are visually grouped, displaying the user's avatar only once for the entire block.
-   **Responsive Interface**: The user interface is fully responsive, optimized for a seamless experience across desktop and mobile devices.
