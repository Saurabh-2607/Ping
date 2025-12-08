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
  const [maxMessages, setMaxMessages] = useState(50);
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
      setMaxMessages(data.maxMessages || 50);
      setIsLimitReached(data.isLimitReached || false);
      setActiveUsers(data.activeUsers || []);
    });

    newSocket.on('new-message', (data) => {
      setMessages((prev) => [...prev, data.message]);
      setRoomMessageCount(data.messageCount || 0);
      setMaxMessages(data.maxMessages || 50);
      
      if (data.messageCount >= data.maxMessages) {
        setIsLimitReached(true);
      }
    });

    newSocket.on('limit-reached', (data) => {
      setIsLimitReached(true);
      setRoomMessageCount(data.messageCount || roomMessageCount);
      setMaxMessages(data.maxMessages || maxMessages);
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

    if (!messageInput.trim() || !socket || isLimitReached) {
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

    if (!isTyping && socket && !isLimitReached) {
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
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-md shadow-indigo-200">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Chat App</h1>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Room:</span>
                <span className="font-mono font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{roomId}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-gray-900">{sessionData.name}</p>
              <p className="text-xs text-gray-500">{sessionData.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleNewRoom}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition duration-200 text-sm font-medium shadow-sm"
              >
                New Room
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 hover:border-red-200 transition duration-200 text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && error !== 'Disconnected from server' && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
          <p className="text-yellow-800 text-sm">{error}</p>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden max-w-5xl mx-auto w-full bg-white shadow-xl my-4 rounded-2xl border border-gray-200">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No messages yet</h3>
              <p className="text-gray-500 max-w-sm">
                Be the first to break the silence! Start the conversation by typing a message below.
              </p>
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
          {otherUsersTyping.length > 0 && (
            <div className="ml-4">
              <TypingIndicator users={otherUsersTyping} />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Progress Bar */}
        <div className="bg-white border-t border-gray-100 px-6 py-2">
          <ProgressBar
            messageCount={roomMessageCount}
            maxMessages={maxMessages}
            label="Room Message Limit"
          />
        </div>

        {/* Active Users */}
        {activeUsers.length > 0 && (
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-2 flex items-center gap-3 overflow-x-auto">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Active now:</span>
            <div className="flex items-center gap-2">
              {activeUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 rounded-full shadow-sm"
                >
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-xs font-medium text-gray-700">{user.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4 sm:p-6">
          {isLimitReached ? (
            <div className="flex items-center justify-center p-6 bg-red-50 rounded-xl border border-red-100">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-3">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-red-900 mb-1">Limit Reached</h3>
                <p className="text-red-700">This room has hit the {maxMessages}-message limit.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={messageInput}
                  onChange={handleInputChange}
                  placeholder="Type your message..."
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 pr-12"
                  disabled={!socket}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <button
                type="submit"
                disabled={!socket || !messageInput.trim() || isLimitReached}
                className="px-6 py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 flex items-center gap-2"
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
        <LimitReachedModal messageCount={roomMessageCount} maxMessages={maxMessages} />
      )}
    </div>
  );
}
