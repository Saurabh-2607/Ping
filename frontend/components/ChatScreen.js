'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import { logout, getAllRooms } from '@/lib/api';
import MessagesList from './chat/MessagesList';
import MessageInput from './chat/MessageInput';
import ActiveUsersBar from './chat/ActiveUsersBar';
import LoadingScreen from './chat/LoadingScreen';
import ErrorBanner from './chat/ErrorBanner';
import LimitReachedModal from './modals/LimitReachedModal';
import Sidebar from './layout/Sidebar';
import ChatHeader from './chat/ChatHeader';
import { useTheme } from './ThemeProvider';
import Container from './ui/Container';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function ChatScreen({ sessionData, onLogout, roomId: incomingRoomId }) {
  const router = useRouter();
  const { theme } = useTheme();
  const roomId = incomingRoomId || 'default';

  // State
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

  // trigger to ask MessagesList to scroll to bottom (increments on send)
  const [scrollTrigger, setScrollTrigger] = useState(0);

  // Fetch available rooms
  useEffect(() => {
    // eslint-disable-next-line
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
      setRoomMessageCount(prev => data.messageCount || prev);
      setMaxMessages(prev => data.maxMessages || prev);
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
      setError('Disconnected from server');
    });

    return () => {
      newSocket.disconnect();
    };
  }, [sessionData, roomId]);

  // Handle sending message
  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!messageInput.trim() || !socketRef.current || isLimitReached) {
      return;
    }

    socketRef.current.emit('send-message', {
      text: messageInput.trim(),
    });

    setMessageInput('');
    socketRef.current.emit('stop-typing');
    setIsTyping(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Ask MessagesList to scroll to bottom
    setScrollTrigger((s) => s + 1);
  };

  const handleSendSticker = (sticker) => {
    if (!socketRef.current || isLimitReached || !sticker?.url) {
      return;
    }

    socketRef.current.emit('send-sticker', {
      stickerId: sticker.id || sticker.url,
      stickerUrl: sticker.url,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (isTyping) {
      socketRef.current.emit('stop-typing');
      setIsTyping(false);
    }

    setScrollTrigger((s) => s + 1);
  };

  // Handle typing
  const handleInputChange = (e) => {
    setMessageInput(e.target.value);

    if (!isTyping && socketRef.current && !isLimitReached) {
      setIsTyping(true);
      socketRef.current.emit('typing');
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.emit('stop-typing');
      }
      setIsTyping(false);
    }, 1000);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout(sessionData.sessionId);
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      onLogout();
    } catch (err) {
      console.error('Logout error:', err);
      onLogout();
    }
  };

  if (isLoading) {
    return <LoadingScreen theme={theme} />;
  }

  return (
    <Container fullHeight className="flex flex-col transition-colors duration-300 text-gray-900 dark:text-white px-0! sm:px-6!">
      <ErrorBanner error={error} />

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
          <MessagesList
            messages={messages}
            sessionData={sessionData}
            otherUsersTyping={otherUsersTyping}
            scrollTrigger={scrollTrigger}
          />

          <ActiveUsersBar activeUsers={activeUsers} />

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
              <MessageInput
                messageInput={messageInput}
                onChange={handleInputChange}
                onSend={handleSendMessage}
                onSendSticker={handleSendSticker}
                disabled={!socketRef.current}
                isLimitReached={isLimitReached}
              />
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
