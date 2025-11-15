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

    if (typeof window === 'undefined') {
      return;
    }

    // Get JWT token from localStorage
    const token = window.localStorage.getItem('token');
    if (!token) {
      console.warn('[useOnlineStatus] No token found -> cannot connect to WebSocket');
      return;
    }

    // Connect to WebSocket with authentication
    const socket = io(WEBSOCKET_URL, {
      transports: ['websocket', 'polling'],
      auth: { token }, // Send JWT token for authentication
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('[useOnlineStatus] ✅ Connected to WebSocket:', socket.id);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('[useOnlineStatus] ❌ Disconnected from WebSocket');
    });

    socket.on('connect_error', (err) => {
      console.error('[useOnlineStatus] Connection error:', err.message);
      setIsConnected(false);
    });

    socket.on('onlineUsers', (users: string[]) => {
      console.log('[useOnlineStatus] Received onlineUsers:', users);
      setOnlineUsers(users || []);
    });

    socket.on('userOnline', (userId: string) => {
      console.log('[useOnlineStatus] User online:', userId);
      setOnlineUsers(prev => {
        if (!prev.includes(userId)) {
          return [...prev, userId];
        }
        return prev;
      });
    });

    socket.on('userOffline', (userId: string) => {
      console.log('[useOnlineStatus] User offline:', userId);
      setOnlineUsers(prev => prev.filter(id => id !== userId));
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
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

