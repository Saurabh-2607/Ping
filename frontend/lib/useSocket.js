import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * @param {string} roomId - The room to join
 * @param {object} user - User object with email and name
 * @param {function} onConnect - Callback when connected
 * @param {function} onDisconnect - Callback when disconnected
 * @returns {object} Socket instance
 */
export const useSocket = (roomId, user, onConnect, onDisconnect) => {
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(API_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      onConnect?.(socket);

      // Join room
      socket.emit('join-room', {
        roomId,
        user,
      });
    });

    socket.on('disconnect', () => {
      onDisconnect?.();
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomId, user, onConnect, onDisconnect]);

  return socketRef.current;
};

export default useSocket;
