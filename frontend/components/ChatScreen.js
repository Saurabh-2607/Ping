'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import { logout } from '@/lib/api';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import LimitReachedModal from './LimitReachedModal';
import ProgressBar from './ProgressBar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const PER_USER_LIMIT = 50;
const userCountKey = (email, roomId) => `userMessageCount:${email}:${roomId}`;

export default function ChatScreen({ sessionData, onLogout, roomId: incomingRoomId }) {
  const router = useRouter();
  const roomId = incomingRoomId || 'default';

  // State
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUsersTyping, setOtherUsersTyping] = useState([]);
  const [roomMessageCount, setRoomMessageCount] = useState(0);
  const [myMessageCount, setMyMessageCount] = useState(0);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [error, setError] = useState('');

  // Refs
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const socketRef = useRef(null);

  const handleNewRoom = () => {
    const slug = `room-${Math.random().toString(36).slice(2, 8)}`;
    router.push(`/room/${slug}`);
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (myMessageCount >= PER_USER_LIMIT) {
      setIsLimitReached(true);
    }
  }, [myMessageCount]);

  // Initialize Socket.IO connection
  useEffect(() => {
    const newSocket = io(API_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsLoading(false);

      // Join room
      newSocket.emit('join-room', {
        roomId: roomId,
        user: {
          email: sessionData.email,
          name: sessionData.name,
        },
      });
    });

    newSocket.on('room-joined', (data) => {
      console.log('Joined room:', data);
      setMessages(data.messages || []);
      setRoomMessageCount(data.messageCount || 0);
      const ownMessages = (data.messages || []).filter(
        (m) => m?.user?.email === sessionData.email
      ).length;
      const storedCount = Number(localStorage.getItem(userCountKey(sessionData.email, roomId)));
      const initialMyCount = Number.isFinite(storedCount) ? storedCount : ownMessages;
      setMyMessageCount(initialMyCount);
      setIsLimitReached(initialMyCount >= PER_USER_LIMIT);
      localStorage.setItem(userCountKey(sessionData.email, roomId), String(initialMyCount));
      setActiveUsers(data.activeUsers || []);
    });

    newSocket.on('new-message', (data) => {
      setMessages((prev) => [...prev, data.message]);
      setRoomMessageCount(data.messageCount || 0);

      if (data.message?.user?.email === sessionData.email) {
        setMyMessageCount((prev) => {
          const next = prev + 1;
          localStorage.setItem(userCountKey(sessionData.email, roomId), String(next));
          if (next >= PER_USER_LIMIT) {
            setIsLimitReached(true);
          }
          return next;
        });
      }
    });

    newSocket.on('limit-reached', (data) => {
      setIsLimitReached(true);
      setRoomMessageCount(data.messageCount || roomMessageCount);
    });

    newSocket.on('user-joined', (data) => {
      setActiveUsers(data.activeUsers || []);
    });

    newSocket.on('user-left', (data) => {
      setActiveUsers(data.activeUsers || []);
    });

    newSocket.on('user-typing', (data) => {
      setOtherUsersTyping((prev) => {
        const exists = prev.find((u) => u.id === data.user.id);
        return exists ? prev : [...prev, data.user];
      });
    });

    newSocket.on('user-stop-typing', (data) => {
      setOtherUsersTyping((prev) => prev.filter((u) => u.id !== data.user.id));
    });

    newSocket.on('error', (data) => {
      setError(data.message || 'An error occurred');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setError('Connection failed. Trying to reconnect...');
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
      setError('Disconnected from server');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [sessionData, roomId]);

  // Handle sending message
  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!messageInput.trim() || !socket || isLimitReached || myMessageCount >= PER_USER_LIMIT) {
      return;
    }

    socket.emit('send-message', {
      text: messageInput.trim(),
    });

    setMessageInput('');
    socket.emit('stop-typing');
    setIsTyping(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  // Handle typing
  const handleInputChange = (e) => {
    setMessageInput(e.target.value);

    if (!isTyping && socket && !isLimitReached && myMessageCount < PER_USER_LIMIT) {
      setIsTyping(true);
      socket.emit('typing');
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      if (socket) {
        socket.emit('stop-typing');
      }
      setIsTyping(false);
    }, 1000);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout(sessionData.sessionId);
      if (socket) {
        socket.disconnect();
      }
      onLogout();
    } catch (err) {
      console.error('Logout error:', err);
      onLogout();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-lg text-gray-700">Connecting to chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Chat App</h1>
              <p className="text-sm text-gray-600">Room: <span className="font-semibold text-indigo-600">{roomId}</span></p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold text-gray-900">{sessionData.name}</p>
              <p className="text-sm text-gray-600">{sessionData.email}</p>
            </div>
            <button
              onClick={handleNewRoom}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition duration-200 text-sm font-medium"
            >
              New Room
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200 text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && error !== 'Disconnected from server' && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
          <p className="text-yellow-800 text-sm">{error}</p>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto bg-white bg-opacity-70 p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-gray-500 text-lg">No messages yet. Start the conversation!</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isCurrentUser={message.user.email === sessionData.email}
                />
              ))}
            </>
          )}

          {/* Typing Indicator */}
          {otherUsersTyping.length > 0 && <TypingIndicator users={otherUsersTyping} />}

          <div ref={messagesEndRef} />
        </div>

        {/* Progress Bar */}
        <ProgressBar
          messageCount={myMessageCount}
          maxMessages={PER_USER_LIMIT}
          label="Your free-tier messages"
        />

        {/* Active Users */}
        {activeUsers.length > 0 && (
          <div className="bg-white border-t border-gray-200 px-6 py-3">
            <p className="text-sm font-semibold text-gray-700 mb-2">Active Users ({activeUsers.length})</p>
            <div className="flex flex-wrap gap-2">
              {activeUsers.map((user) => (
                <div
                  key={user.id}
                  className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium flex items-center gap-2"
                >
                  <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                  {user.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-6">
          {isLimitReached ? (
            <div className="text-center py-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-red-800 font-semibold">50-message personal limit reached</p>
              <p className="text-red-600 text-sm mt-1">Upgrade your plan to continue chatting</p>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                type="text"
                value={messageInput}
                onChange={handleInputChange}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                disabled={!socket}
              />
              <button
                type="submit"
                disabled={!socket || !messageInput.trim() || myMessageCount >= PER_USER_LIMIT}
                className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 flex items-center gap-2"
              >
                <span>Send</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Limit Reached Modal */}
      {isLimitReached && (
        <LimitReachedModal messageCount={myMessageCount} maxMessages={PER_USER_LIMIT} />
      )}
    </div>
  );
}
