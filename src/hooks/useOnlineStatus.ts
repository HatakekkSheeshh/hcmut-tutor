/**
 * Hook to track online status of users via WebSocket
 */

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { WEBSOCKET_URL } from '../env';

interface UseOnlineStatusOptions {
  enabled?: boolean;
}

export const useOnlineStatus = ({ enabled = true }: UseOnlineStatusOptions = {}) => {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Connect to WebSocket
    const socket = io(WEBSOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('[useOnlineStatus] Connected to WebSocket');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('[useOnlineStatus] Disconnected from WebSocket');
    });

    socket.on('onlineUsers', (users: string[]) => {
      setOnlineUsers(users || []);
    });

    socket.on('userOnline', (userId: string) => {
      setOnlineUsers(prev => {
        if (!prev.includes(userId)) {
          return [...prev, userId];
        }
        return prev;
      });
    });

    socket.on('userOffline', (userId: string) => {
      setOnlineUsers(prev => prev.filter(id => id !== userId));
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [enabled]);

  const isUserOnline = (userId: string): boolean => {
    return onlineUsers.includes(userId);
  };

  return {
    onlineUsers,
    isUserOnline,
    isConnected
  };
};

