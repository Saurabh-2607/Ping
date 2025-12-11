'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import { logout, getAllRooms } from '@/lib/api';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import LimitReachedModal from './LimitReachedModal';
import Sidebar from './Sidebar';
import ChatHeader from './ChatHeader';
import { useTheme } from './ThemeProvider';
import Button from './ui/Button';
import Container from './ui/Container';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function ChatScreen({ sessionData, onLogout, roomId: incomingRoomId }) {
  const router = useRouter();
  const { theme } = useTheme();
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
  const [availableRooms, setAvailableRooms] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Refs
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const socketRef = useRef(null);

  const fetchAvailableRooms = async () => {
    try {
      const result = await getAllRooms();
      if (result.success && result.data) {
        // Handle both array and object responses
        const roomsArray = Array.isArray(result.data) ? result.data : (result.data.rooms || []);
        setAvailableRooms(roomsArray);
      } else {
        setAvailableRooms([]);
      }
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
      setAvailableRooms([]);
    }
  };

  // Scroll to bottom of messages (only when user sends a message)
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Only scroll when initial messages load or user sends a message
  const shouldScroll = useRef(true);

  useEffect(() => {
    if (shouldScroll.current && messages.length > 0) {
      scrollToBottom();
      shouldScroll.current = false;
    }
  }, []);

  // Fetch available rooms
  useEffect(() => {
    fetchAvailableRooms();
    const interval = setInterval(fetchAvailableRooms, 10000);
    return () => clearInterval(interval);
  }, []);

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

    // Scroll to bottom after sending message
    setTimeout(() => {
      scrollToBottom();
    }, 100);
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
      <Container fullHeight className={`flex items-center justify-center ${
        theme === 'dark' ? 'bg-black' : 'bg-white'
      }`}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className={`mt-4 text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Connecting to chat...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fullHeight className="flex flex-col transition-colors duration-300 text-gray-900 dark:text-white !px-0 sm:!px-6">
      {/* Error Banner */}
      {error && error !== 'Disconnected from server' && (
        <div className="shrink-0 border-b px-4 py-3 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800">
          <p className="text-yellow-800 text-sm dark:text-yellow-400">{error}</p>
        </div>
      )}

      <div className="flex flex-1 min-h-0 overflow-hidden border border-gray-200 dark:border-white/15">
        {/* Sidebar */}
        <Sidebar
          sessionData={sessionData}
          roomId={roomId}
          availableRooms={availableRooms}
          isSidebarOpen={isSidebarOpen}
          onLogout={handleLogout}
          onCloseSidebar={() => setIsSidebarOpen(false)}
        />

        {/* Overlay for mobile when sidebar is open */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-10 sm:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden transition-colors duration-300 bg-white dark:bg-black">
          {/* Chat Header */}
          <ChatHeader
            roomId={roomId}
            roomMessageCount={roomMessageCount}
            maxMessages={maxMessages}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />

          {/* Messages Container */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-5 bg-gray-50/50 dark:bg-black/50">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 sm:p-6 md:p-8">
                <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 flex items-center justify-center mb-4 sm:mb-5 md:mb-6 bg-indigo-50 dark:bg-indigo-900/30">
                  <svg className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900 dark:text-white">No messages yet</h3>
                <p className="text-sm sm:text-base text-gray-500 max-w-sm dark:text-gray-400">
                  Be the first to break the silence! Start the conversation by typing a message below.
                </p>
              </div>
            ) : (
              <>
                {messages.map((message, index) => {
                  const prevMessage = messages[index - 1];
                  const showAvatar = !prevMessage || prevMessage.user.email !== message.user.email;
                  return (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isCurrentUser={message.user.email === sessionData.email}
                      showAvatar={showAvatar}
                    />
                  );
                })}
              </>
            )}

            {/* Typing Indicator */}
            {otherUsersTyping.length > 0 && (
              <div className="ml-2 sm:ml-4">
                <TypingIndicator users={otherUsersTyping} />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Active Users */}
          {activeUsers.length > 0 && (
            <div className="shrink-0 border-t px-2 sm:px-4 py-1 sm:py-1.5 flex items-center gap-1.5 sm:gap-2 overflow-x-auto transition-colors duration-300 bg-gray-50 border-gray-200 dark:bg-black/50 dark:border-white/15">
              <span className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap text-gray-500 dark:text-gray-400">Active:</span>
              <div className="flex items-center gap-1 sm:gap-1.5">
                {activeUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 border rounded bg-white border-gray-200 dark:bg-black dark:border-white/15"
                  >
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[8px] sm:text-[10px] font-medium text-gray-600 dark:text-gray-300">{user.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="shrink-0 border-t p-2 sm:p-3 md:p-4 transition-colors duration-300 bg-white border-gray-200 dark:bg-black dark:border-white/15">
            {isLimitReached ? (
              <div className="flex items-center justify-center p-4 border bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 mb-2 bg-red-100 dark:bg-red-900/30">
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold mb-1 text-red-900 dark:text-red-400">Limit Reached</h3>
                  <p className="text-xs text-red-700 dark:text-red-300">This room has hit the {maxMessages}-message limit.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="flex gap-2 sm:gap-3 items-center">
                <div className="flex-1 relative min-w-0">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={handleInputChange}
                    placeholder="Type your message..."
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all duration-200 pr-10 sm:pr-12 bg-white border-gray-300 text-gray-900 dark:bg-black dark:border-white/15 dark:text-white dark:placeholder-gray-400 dark:focus:ring-white/20 dark:focus:border-white"
                    disabled={!socket}
                  />
                  <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={!socket || !messageInput.trim() || isLimitReached}
                  variant="accent"
                  className="px-3 sm:px-4 py-2 sm:py-3 h-full"
                >
                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline">Send</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Limit Reached Modal */}
      {isLimitReached && (
        <LimitReachedModal messageCount={roomMessageCount} maxMessages={maxMessages} />
      )}
    </Container>
  );
}
