'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import { logout, getAllRooms, createRoom } from '@/lib/api';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import LimitReachedModal from './LimitReachedModal';
import ProgressBar from './ProgressBar';
import ThemeToggle from './ThemeToggle';
import { useTheme } from './ThemeProvider';
import Button from './ui/Button';
import Container from './Container';

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
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  // Refs
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const socketRef = useRef(null);

  const handleNewRoom = () => {
    const slug = `room-${Math.random().toString(36).slice(2, 8)}`;
    router.push(`/room/${slug}`);
  };

  const handleCreateRoom = () => {
    const roomNameToUse = newRoomName.trim() || `room-${Math.random().toString(36).slice(2, 8)}`;
    setIsCreatingRoom(false);
    setNewRoomName('');
    
    // Call createRoom API
    createRoom(roomNameToUse, roomNameToUse).then((result) => {
      if (result.success) {
        router.push(`/room/${result.data.roomId}`);
      } else {
        console.error('Failed to create room:', result.message);
        setError(result.message || 'Failed to create room');
      }
    }).catch((err) => {
      console.error('Error creating room:', err);
      setError('Error creating room: ' + err.message);
    });
  };

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

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      <div className={`flex items-center justify-center min-h-screen ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className={`mt-4 text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Connecting to chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen transition-colors duration-300 bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
      {/* Header */}
      <header className="shadow-sm border-b z-10 transition-colors duration-300 bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="max-w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Toggle sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="p-2 bg-indigo-600 shadow-md shadow-indigo-200 dark:shadow-indigo-900/30">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Chat App</h1>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500 dark:text-gray-400">Room:</span>
                <span className="font-mono font-medium px-2 py-0.5 text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/30">{roomId}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{sessionData.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{sessionData.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button
                onClick={handleNewRoom}
                variant="outline"
                className="px-4 py-2 shadow-sm bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:border-gray-500"
              >
                New Room
              </Button>
              <Button
                onClick={handleLogout}
                variant="danger"
                className="px-4 py-2 border border-red-100 hover:border-red-200 dark:border-red-800 dark:hover:border-red-700"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && error !== 'Disconnected from server' && (
        <div className="border-b px-4 py-3 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800">
          <p className="text-yellow-800 text-sm dark:text-yellow-400">{error}</p>
        </div>
      )}

      <Container className="flex-1 flex overflow-hidden gap-4 py-4">
        {/* Sidebar */}
        <aside className={`${isSidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden rounded-lg bg-white dark:bg-gray-800 flex flex-col`}>
          {/* User Info Section */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                {sessionData?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate text-gray-900 dark:text-white">{sessionData?.name || 'User'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{sessionData?.email || ''}</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="danger"
              size="sm"
              className="w-full flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </Button>
            <h2 className="font-bold text-lg mt-4">Available Rooms</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{availableRooms.length} rooms</p>
          </div>

          {/* Create Room Section */}
          {!isCreatingRoom ? (
            <div className="px-3 py-2">
              <button
                onClick={() => setIsCreatingRoom(true)}
                className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Room
              </button>
            </div>
          ) : (
            <div className="px-3 py-2 space-y-2 border-b border-gray-200 dark:border-gray-700">
              <input
                type="text"
                placeholder="Room name (optional)"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateRoom();
                  }
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateRoom}
                  className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200 text-sm"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setIsCreatingRoom(false);
                    setNewRoomName('');
                  }}
                  className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors duration-200 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {!Array.isArray(availableRooms) || availableRooms.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 text-sm">No rooms available</p>
              </div>
            ) : (
              availableRooms.map((room) => (
                <button
                  key={room.id || room.roomId}
                  onClick={() => {
                    const currentRoomId = room.id || room.roomId;
                    if (currentRoomId !== roomId) {
                      router.push(`/room/${currentRoomId}`);
                    }
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                    (room.id || room.roomId) === roomId
                      ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-900/30 dark:text-indigo-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm truncate">{room.roomId || room.id}</p>
                      <p className="text-xs opacity-75 mt-1">{room.activeUserCount || room.activeUsers || 0} active</p>
                    </div>
                    {(room.roomId || room.id) === roomId && (
                      <span className="text-indigo-600 dark:text-indigo-400 text-lg">✓</span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden shadow-xl transition-colors duration-300 bg-white dark:bg-gray-800 rounded-lg">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 dark:bg-gray-800/50">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 flex items-center justify-center mb-6 bg-indigo-50 dark:bg-indigo-900/30">
                <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">No messages yet</h3>
              <p className="text-gray-500 max-w-sm dark:text-gray-400">
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
        <div className="border-t px-6 py-2 transition-colors duration-300 bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <ProgressBar
            messageCount={roomMessageCount}
            maxMessages={maxMessages}
            label="Room Message Limit"
          />
        </div>

        {/* Active Users */}
        {activeUsers.length > 0 && (
          <div className="border-t px-6 py-2 flex items-center gap-3 overflow-x-auto transition-colors duration-300 bg-gray-50 border-gray-200 dark:bg-gray-900/50 dark:border-gray-700">
            <span className="text-xs font-semibold uppercase tracking-wider whitespace-nowrap text-gray-500 dark:text-gray-400">Active now:</span>
            <div className="flex items-center gap-2">
              {activeUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-1.5 px-2 py-1 border shadow-sm bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-600"
                >
                  <span className="w-2 h-2 bg-green-500 animate-pulse"></span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{user.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t p-4 sm:p-6 transition-colors duration-300 bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          {isLimitReached ? (
            <div className="flex items-center justify-center p-6 border bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-800">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 mb-3 bg-red-100 dark:bg-red-900/30">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-1 text-red-900 dark:text-red-400">Limit Reached</h3>
                <p className="text-red-700 dark:text-red-300">This room has hit the {maxMessages}-message limit.</p>
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
                  className="w-full px-4 py-3.5 border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 pr-12 bg-gray-50 border-gray-200 text-gray-900 focus:bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:bg-gray-600"
                  disabled={!socket}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <Button
                type="submit"
                disabled={!socket || !messageInput.trim() || isLimitReached}
                variant="accent"
                className="px-6 py-3.5 flex items-center gap-2 hover:shadow-lg hover:shadow-indigo-200 disabled:bg-gray-300 dark:hover:shadow-indigo-900/30 dark:disabled:bg-gray-700 dark:disabled:text-gray-500"
              >
                <span>Send</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </Button>
            </form>
          )}
        </div>
        </div>
      </Container>

      {/* Limit Reached Modal */}
      {isLimitReached && (
        <LimitReachedModal messageCount={roomMessageCount} maxMessages={maxMessages} />
      )}
    </div>
  );
}
