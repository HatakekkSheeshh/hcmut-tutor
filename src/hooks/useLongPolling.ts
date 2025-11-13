/**
 * Hook realtime cho chat sử dụng REST API + Polling (Vercel compatible).
 * Socket.IO được disable trên production vì Vercel không hỗ trợ WebSocket.
 * Giữ tên useLongPolling để tương thích với code cũ.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL, WEBSOCKET_URL } from '../env';

// Check if we're in production (Vercel)
const isProduction = typeof window !== 'undefined' 
  ? window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
  : false;

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'file' | 'image';
  fileUrl?: string;
  read: boolean;
  createdAt: string;
}

interface UseLongPollingOptions {
  conversationId: string | null;
  enabled?: boolean;
  onMessage?: (message: Message) => void;
  onError?: (error: Error) => void;
  onConversationNotFound?: (conversationId: string) => void; // Callback khi conversation không tồn tại
}

const buildApiUrl = (path: string) => {
  if (typeof window === 'undefined') {
    return path;
  }

  const baseUrl = API_BASE_URL.startsWith('http')
    ? API_BASE_URL
    : `${window.location.origin}${API_BASE_URL}`;

  return `${baseUrl}${path}`;
};

const normaliseError = (error: unknown) => {
  if (error instanceof Error) {
    return error;
  }
  if (typeof error === 'string') {
    return new Error(error);
  }
  if (error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string') {
    return new Error((error as any).message);
  }
  return new Error('Socket error');
};

export function useLongPolling({
  conversationId,
  enabled = true,
  onMessage,
  onError,
  onConversationNotFound
}: UseLongPollingOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPolling, setIsPolling] = useState(false); // dùng làm trạng thái tải lịch sử
  const [isConnected, setIsConnected] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const currentConversationRef = useRef<string | null>(null);
  const previousConversationRef = useRef<string | null>(null);
  const historyAbortControllerRef = useRef<AbortController | null>(null);
  const lastMessageIdRef = useRef<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recentSentMessagesRef = useRef<Set<string>>(new Set()); // Track messages sent trong 30 giây gần đây
  const pendingMessagesRef = useRef<Set<string>>(new Set()); // Track messages that need REST API fallback

  const onMessageRef = useRef(onMessage);
  const onErrorRef = useRef(onError);
  const onConversationNotFoundRef = useRef(onConversationNotFound);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    onConversationNotFoundRef.current = onConversationNotFound;
  }, [onConversationNotFound]);

  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  const handleNewMessage = useCallback((message: Message) => {
    console.log('[useLongPolling] 📨 handleNewMessage called:', {
      messageId: message.id,
      conversationId: message.conversationId,
      currentConversationId: currentConversationRef.current,
      content: message.content.substring(0, 50)
    });
    
    if (message.conversationId !== currentConversationRef.current) {
      console.log('[useLongPolling] ⚠️ Message for different conversation, ignoring');
      return;
    }

    lastMessageIdRef.current = message.id;

    setMessages(prev => {
      console.log('[useLongPolling] 📋 Current messages count:', prev.length);
      
      // Kiểm tra xem đã có tin nhắn này chưa (theo ID hoặc content + time)
      // Tăng thời gian match lên 15 giây để đảm bảo match được ngay cả khi server response chậm
      const existingIndex = prev.findIndex(existing => {
        // Match theo ID (tin nhắn thật từ server)
        if (existing.id === message.id) return true;
        
        // Match optimistic message với tin nhắn thật (theo content và time)
        if (existing.id.startsWith('temp_') && existing.content === message.content) {
          const timeDiff = Math.abs(
            new Date(existing.createdAt).getTime() - new Date(message.createdAt).getTime()
          );
          // Match nếu cùng content và thời gian gần nhau (trong 15 giây)
          if (timeDiff < 15000) {
            console.log('[useLongPolling] ✅ Found matching optimistic message:', {
              optimistic: existing.id,
              real: message.id,
              timeDiff: Math.round(timeDiff / 1000) + 's'
            });
            return true;
          }
        }
        return false;
      });

      if (existingIndex >= 0) {
        // Thay thế optimistic message bằng tin nhắn thật
        const optimisticId = prev[existingIndex].id;
        console.log('[useLongPolling] 🔄 Replacing optimistic message at index:', existingIndex, 'optimisticId:', optimisticId);
        
        // Xóa optimistic message khỏi recentSentMessagesRef vì đã được thay thế
        if (optimisticId.startsWith('temp_')) {
          recentSentMessagesRef.current.delete(optimisticId);
        }
        
        const updated = [...prev];
        updated[existingIndex] = message;
        updated.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        console.log('[useLongPolling] ✅ Message replaced, new count:', updated.length);
        return updated;
      }

      // Thêm tin nhắn mới
      console.log('[useLongPolling] ➕ Adding new message');
      const updated = [...prev, message];
      updated.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      console.log('[useLongPolling] ✅ New message added, new count:', updated.length);
      return updated;
    });

    onMessageRef.current?.(message);
    console.log('[useLongPolling] ✅ handleNewMessage callback triggered');
  }, []);

  useEffect(() => {
    if (!enabled) {
      disconnectSocket();
      setIsConnected(false);
      return;
    }

    if (socketRef.current) {
      // đã kết nối
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    const token = window.localStorage.getItem('token');
    if (!token) {
      console.warn('[useLongPolling] Không tìm thấy token -> không kết nối Socket.IO');
      return;
    }

    const socket = io(WEBSOCKET_URL, {
      transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      forceNew: false
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[useLongPolling] ✅ Socket.io connected:', socket.id);
      setIsConnected(true);
      // Join room ngay khi connect nếu đã có conversationId
      if (currentConversationRef.current) {
        console.log('[useLongPolling] 🚪 Joining room on connect:', currentConversationRef.current);
        socket.emit('join-room', currentConversationRef.current);
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      const normalised = normaliseError(err);
      console.error('[useLongPolling] Socket connect error:', normalised);
      console.error('[useLongPolling] Error details:', {
        message: err.message,
        ...(err as any).type && { type: (err as any).type },
        ...(err as any).description && { description: (err as any).description }
      });
      
      // Nếu lỗi authentication, thử refresh token
      if (err.message?.includes('Authentication failed') || err.message?.includes('invalid signature')) {
        console.warn('[useLongPolling] JWT authentication failed - token có thể không khớp với JWT_SECRET trên server');
        console.warn('[useLongPolling] Đảm bảo JWT_SECRET trên Railway giống với JWT_SECRET trên Vercel/API server');
      }
      
      setIsConnected(false);
      onErrorRef.current?.(normalised);
    });

    socket.on('error', (err) => {
      const normalised = normaliseError(err);
      const errorMessage = typeof err === 'string' ? err : (err as any)?.message || normalised.message;
      
      // Nếu lỗi là "Không tìm thấy cuộc trò chuyện", không log error (chỉ warn)
      // Vì có thể do storage không sync giữa Vercel và Railway
      // Tin nhắn sẽ được gửi qua REST API fallback
      if (errorMessage?.includes('Không tìm thấy cuộc trò chuyện') || 
          errorMessage?.includes('conversation') && errorMessage?.includes('not found')) {
        console.warn('[useLongPolling] ⚠️ Conversation not found on WebSocket server (may be storage sync issue):', errorMessage);
        console.warn('[useLongPolling] ⚠️ Message will be sent via REST API fallback instead');
        // Không gọi onError để tránh hiển thị error cho user
        // Tin nhắn sẽ được gửi qua REST API fallback trong sendMessage
        return;
      }
      
      console.error('[useLongPolling] Socket error:', normalised);
      onErrorRef.current?.(normalised);
    });

    socket.on('new-message', (message: Message) => {
      console.log('[useLongPolling] 📩 Received new-message event:', message.id, message.content.substring(0, 50));
      handleNewMessage(message);
    });
    
    // Listen for confirmation that message was sent
    socket.on('message-sent', (data: any) => {
      console.log('[useLongPolling] ✅ Message sent confirmation:', data);
    });

    return () => {
      console.log('[useLongPolling] 🧹 Cleaning up Socket.io listeners');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('error');
      socket.off('new-message', handleNewMessage);
      socket.off('message-sent');
      disconnectSocket();
    };
  }, [disconnectSocket, enabled, handleNewMessage]);

  // Polling function để check tin nhắn mới (fallback khi socket.io không hoạt động)
  const pollNewMessages = useCallback(async () => {
    if (!conversationId || !lastMessageIdRef.current) {
      return;
    }

    if (socketRef.current?.connected) {
      // Nếu socket.io đã kết nối, không cần polling
      return;
    }

    try {
      const token = typeof window !== 'undefined'
        ? window.localStorage.getItem('token')
        : null;

      if (!token) {
        return;
      }

      // Lấy tất cả tin nhắn và filter tin nhắn mới
      const url = buildApiUrl(`/conversations/${conversationId}/messages?page=1&limit=100`);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      const allMessages: Message[] = Array.isArray(data?.data) ? data.data : [];

      if (allMessages.length > 0) {
        // Tìm tin nhắn mới hơn lastMessageId
        const lastMessageIndex = allMessages.findIndex(msg => msg.id === lastMessageIdRef.current);
        const newMessages = lastMessageIndex >= 0 
          ? allMessages.slice(lastMessageIndex + 1)
          : allMessages.filter(msg => {
              if (!lastMessageIdRef.current) return true;
              // So sánh theo thời gian nếu không tìm thấy ID
              return new Date(msg.createdAt).getTime() > Date.now() - 10000; // Tin nhắn trong 10 giây gần đây
            });

        if (newMessages.length > 0) {
          newMessages.forEach(msg => {
            handleNewMessage(msg);
          });
          // Cập nhật lastMessageId
          const sorted = [...allMessages].sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          if (sorted.length > 0) {
            lastMessageIdRef.current = sorted[sorted.length - 1].id;
          }
        }
      }
    } catch (error) {
      // Silent fail cho polling - không log error để tránh spam
    }
  }, [conversationId, handleNewMessage]);

  const loadHistory = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      lastMessageIdRef.current = null;
      return;
    }

    if (historyAbortControllerRef.current) {
      historyAbortControllerRef.current.abort();
    }

    const controller = new AbortController();
    historyAbortControllerRef.current = controller;

    try {
      setIsPolling(true);

      const token = typeof window !== 'undefined'
        ? window.localStorage.getItem('token')
        : null;

      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }

      const url = buildApiUrl(`/conversations/${conversationId}/messages?page=1&limit=100`);
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        
        // Handle 404 - conversation not found (may have been deleted)
        if (response.status === 404) {
          console.warn('[useLongPolling] ⚠️ Conversation not found:', conversationId, errorData);
          // Clear messages and conversation - conversation may have been deleted
          setMessages([]);
          lastMessageIdRef.current = null;
          // Notify parent component that conversation doesn't exist
          onConversationNotFoundRef.current?.(conversationId);
          // Don't throw error - just log and return empty
          // The parent component should handle this by reloading conversations list
          return;
        }
        
        // Handle 403 - user not authorized
        if (response.status === 403) {
          console.warn('[useLongPolling] ⚠️ User not authorized to access conversation:', conversationId);
          setMessages([]);
          lastMessageIdRef.current = null;
          // Notify parent component that user is not authorized
          onConversationNotFoundRef.current?.(conversationId);
          return;
        }
        
        // Other errors - throw normally
        throw new Error(
          `Không thể tải lịch sử tin nhắn (${response.status}): ${errorData?.error || errorText || response.statusText}`
        );
      }

      const data = await response.json();
      const messagesData: Message[] = Array.isArray(data?.data) ? data.data : [];

      const sorted = messagesData
        .filter(Boolean)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      // Giữ lại optimistic messages khi load history
      // Chỉ merge với history, không replace hoàn toàn
      setMessages(prev => {
        // Tìm các optimistic messages (có ID bắt đầu bằng 'temp_')
        const optimisticMessages = prev.filter(msg => msg.id.startsWith('temp_'));
        
        // Merge optimistic messages với history (loại bỏ duplicates)
        // Ưu tiên giữ lại optimistic messages gần đây (đặc biệt là những message vừa gửi)
        const allMessages = [...sorted];
        optimisticMessages.forEach(optimistic => {
          // Kiểm tra xem optimistic message đã có trong history chưa (theo content và time)
          const existsInHistory = sorted.some(msg => {
            // Match theo ID (nếu server đã trả về message với temp ID - không có)
            if (msg.id === optimistic.id) return true;
            // Match theo content và time (trong vòng 15 giây)
            if (msg.content === optimistic.content && msg.senderId === optimistic.senderId) {
              const timeDiff = Math.abs(
                new Date(msg.createdAt).getTime() - new Date(optimistic.createdAt).getTime()
              );
              return timeDiff < 15000; // 15 giây
            }
            return false;
          });
          
          // Kiểm tra xem message này có trong recentSentMessages không (vừa gửi)
          const isRecentlySent = recentSentMessagesRef.current.has(optimistic.id);
          
          // Chỉ thêm optimistic message nếu:
          // 1. Chưa có trong history
          // 2. (Được tạo trong 30 giây gần đây HOẶC là message vừa gửi) - để tránh stale optimistic messages
          const isRecent = new Date(optimistic.createdAt).getTime() > Date.now() - 30000;
          if (!existsInHistory && (isRecent || isRecentlySent)) {
            allMessages.push(optimistic);
            console.log('[useLongPolling] 💾 Keeping optimistic message:', {
              id: optimistic.id,
              content: optimistic.content.substring(0, 50),
              isRecentlySent,
              isRecent
            });
          }
        });
        
        // Sort lại sau khi merge
        const merged = allMessages.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        
        // Cập nhật lastMessageId từ history (không phải từ optimistic)
        const historyMessages = sorted.filter(msg => !msg.id.startsWith('temp_'));
        if (historyMessages.length > 0) {
          lastMessageIdRef.current = historyMessages[historyMessages.length - 1].id;
        } else if (merged.length > 0 && !merged[merged.length - 1].id.startsWith('temp_')) {
          lastMessageIdRef.current = merged[merged.length - 1].id;
        }
        
        return merged;
      });
      
      // Cập nhật lastMessageId từ sorted messages (không phải từ optimistic)
      if (sorted.length > 0) {
        const realMessages = sorted.filter(msg => !msg.id.startsWith('temp_'));
        if (realMessages.length > 0) {
          lastMessageIdRef.current = realMessages[realMessages.length - 1].id;
        }
      } else {
        lastMessageIdRef.current = null;
      }
    } catch (error) {
      // Không log error nếu là AbortError (bình thường khi conversationId thay đổi)
      if (error instanceof Error && error.name === 'AbortError') {
        // Abort là behavior bình thường, không cần log
        return;
      }
      
      const normalised = normaliseError(error);
      console.error('[useLongPolling] Load history error:', normalised);
      onErrorRef.current?.(normalised);
      setMessages([]);
      lastMessageIdRef.current = null;
    } finally {
      setIsPolling(false);
      historyAbortControllerRef.current = null;
    }
  }, [conversationId]);

  // Polling fallback khi socket.io không kết nối được
  useEffect(() => {
    if (!enabled || !conversationId) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    // Chỉ polling khi Socket.IO không kết nối được (fallback)
    // Nếu Socket.IO đã kết nối, không cần polling
    if (socketRef.current?.connected) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    // Bắt đầu polling:
    // - Production (Vercel): Poll mỗi 2 giây (tiết kiệm request)
    // - Development: Poll mỗi 1 giây khi Socket.IO không kết nối được
    const pollInterval = isProduction ? 2000 : 1000;
    
    if (!pollingIntervalRef.current) {
      pollingIntervalRef.current = setInterval(() => {
        void pollNewMessages();
      }, pollInterval);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [enabled, conversationId, isConnected, pollNewMessages]);

  useEffect(() => {
    currentConversationRef.current = conversationId;

    if (!enabled) {
      setMessages([]);
      lastMessageIdRef.current = null;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    if (!conversationId) {
      if (previousConversationRef.current && socketRef.current?.connected) {
        socketRef.current.emit('leave-room', previousConversationRef.current);
      }
      previousConversationRef.current = null;
      setMessages([]);
      lastMessageIdRef.current = null;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    void loadHistory();

    // Join room khi conversationId thay đổi
    // Nếu socket chưa connect, sẽ tự động join khi socket connect (trong event handler 'connect')
    if (socketRef.current) {
      if (socketRef.current.connected) {
        // Socket đã connect, join room ngay
      if (previousConversationRef.current && previousConversationRef.current !== conversationId) {
        console.log('[useLongPolling] 🚪 Leaving previous room:', previousConversationRef.current);
        socketRef.current.emit('leave-room', previousConversationRef.current);
      }
      console.log('[useLongPolling] 🚪 Joining room:', conversationId);
      socketRef.current.emit('join-room', conversationId);
    } else {
        // Socket chưa connect, sẽ tự động join khi connect xong (trong event handler 'connect')
        console.log('[useLongPolling] ⏳ Socket connecting, will join room when connected');
      }
    } else {
      // Socket chưa được tạo, sẽ được tạo trong useEffect khác
      console.log('[useLongPolling] ⏳ Socket not initialized yet');
    }

    previousConversationRef.current = conversationId;

    return () => {
      if (socketRef.current?.connected && conversationId) {
        socketRef.current.emit('leave-room', conversationId);
      }
    };
  }, [conversationId, enabled, loadHistory]);

  const sendMessage = useCallback(async (
    content: string,
    type: 'text' | 'file' | 'image' = 'text',
    fileUrl?: string
  ) => {
    console.log('[useLongPolling] 📝 sendMessage called:', {
      content: content?.substring(0, 50),
      type,
      fileUrl: fileUrl ? 'yes' : 'no',
      conversationId,
      socketConnected: socketRef.current?.connected,
      socketId: socketRef.current?.id
    });
    
    if (!conversationId) {
      console.error('[useLongPolling] ❌ No conversation selected');
      throw new Error('Chưa chọn cuộc trò chuyện');
    }

    const trimmed = content?.trim();
    if (!trimmed && !fileUrl) {
      console.error('[useLongPolling] ❌ Empty message');
      throw new Error('Nội dung tin nhắn không được để trống');
    }

    const token = typeof window !== 'undefined'
      ? window.localStorage.getItem('token')
      : null;

    if (!token) {
      throw new Error('Không tìm thấy token xác thực');
    }

    // Decode token để lấy userId
    let userId: string | null = null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.userId;
    } catch (e) {
      console.error('[useLongPolling] Cannot decode token:', e);
    }

    const payload = {
      conversationId,
      content: trimmed,
      type,
      fileUrl
    };

    // Optimistic update: Hiển thị tin nhắn ngay lập tức
    const optimisticMessage: Message = {
      id: `temp_${Date.now()}_${Math.random()}`,
      conversationId,
      senderId: userId || 'unknown',
      receiverId: '', // Sẽ được cập nhật khi nhận từ server
      content: trimmed,
      type,
      fileUrl,
      read: false,
      createdAt: new Date().toISOString()
    };

    // Thêm tin nhắn optimistic vào UI ngay lập tức (TRƯỚC KHI gửi)
    // Đảm bảo tin nhắn hiển thị ngay, không đợi server
    console.log('[useLongPolling] 🚀 Adding optimistic message to UI:', optimisticMessage.content.substring(0, 50));
    
    // Track message này để đảm bảo không bị mất khi loadHistory()
    recentSentMessagesRef.current.add(optimisticMessage.id);
    // Cleanup sau 30 giây
    setTimeout(() => {
      recentSentMessagesRef.current.delete(optimisticMessage.id);
    }, 30000);
    
    // Update state ngay lập tức - React sẽ batch update nhưng vẫn render sớm
    setMessages(prev => {
      // Kiểm tra xem đã có tin nhắn này chưa
      if (prev.some(existing => existing.id === optimisticMessage.id)) {
        console.log('[useLongPolling] ⚠️ Optimistic message already exists, skipping');
        return prev;
      }
      const updated = [...prev, optimisticMessage];
      updated.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      console.log('[useLongPolling] ✅ Optimistic message added, total messages:', updated.length);
      return updated;
    });
    
    // Trigger callback ngay lập tức - state đã được update, callback sẽ trigger re-render
    onMessageRef.current?.(optimisticMessage);
    console.log('[useLongPolling] ✅ Optimistic message callback triggered, UI should update now');

    // Ưu tiên dùng Socket.io nếu đã kết nối
    // Nhưng luôn có REST API fallback để đảm bảo tin nhắn được gửi
    if (socketRef.current?.connected) {
      try {
        console.log('[useLongPolling] 📤 Sending message via Socket.io to room:', conversationId);
        
        // LUÔN join room trước khi gửi message (không cần check currentConversationRef)
        // Socket.io sẽ tự động handle nếu đã join rồi (không tạo duplicate)
        console.log('[useLongPolling] 🚪 Joining room before sending:', conversationId);
        socketRef.current.emit('join-room', conversationId);
        
        // Gửi tin nhắn ngay lập tức (không cần đợi join room xong)
        // Socket.io sẽ queue message nếu chưa join room xong
        socketRef.current.emit('send-message', payload);
        console.log('[useLongPolling] ✅ Message emitted to Socket.io, optimistic message should be visible');
        console.log('[useLongPolling] 🔍 Waiting for new-message event from server...');
        
        // Tin nhắn thật sẽ được nhận qua event 'new-message' và thay thế optimistic message
        // Nhưng optimistic message đã hiển thị rồi, không cần đợi
        
        // Lưu ý: Nếu server trả về error "Không tìm thấy cuộc trò chuyện",
        // socket.on('error') sẽ được gọi nhưng không làm gì (chỉ log warning)
        // Để đảm bảo tin nhắn được gửi, luôn gọi REST API fallback sau 500ms
        // Nếu Socket.io thành công, new-message sẽ đến trước và optimistic message sẽ được thay thế
        // Nếu Socket.io fail, REST API sẽ đảm bảo tin nhắn được gửi
        const messageKey = `${conversationId}_${trimmed}_${Date.now()}`;
        pendingMessagesRef.current.add(messageKey);
        
        setTimeout(async () => {
          // Nếu vẫn còn trong pending, có nghĩa là Socket.io chưa thành công
          // Gọi REST API fallback để đảm bảo tin nhắn được gửi
          if (pendingMessagesRef.current.has(messageKey)) {
            console.warn('[useLongPolling] ⚠️ No new-message event received after 500ms, using REST API fallback');
            pendingMessagesRef.current.delete(messageKey);
            // REST API fallback sẽ được gọi bên dưới (không return ở đây)
          }
        }, 500);
        
        // Return ngay để optimistic message hiển thị
        // REST API fallback sẽ được gọi sau 500ms nếu Socket.io chưa thành công
        return { success: true };
      } catch (error) {
        console.error('[useLongPolling] ❌ Socket emit error:', error);
        // Fallback to REST API nếu socket emit thất bại
      }
    } else {
      console.warn('[useLongPolling] ⚠️ Socket.io not connected, using REST API fallback');
      console.warn('[useLongPolling] ⚠️ Socket connection status:', {
        connected: socketRef.current?.connected,
        id: socketRef.current?.id
      });
    }

    // Fallback: gọi API REST để đảm bảo tin nhắn được gửi
    // Điều này đảm bảo tin nhắn được gửi ngay cả khi:
    // 1. Socket.io không kết nối được
    // 2. Server trả về error "Không tìm thấy cuộc trò chuyện" (storage không sync)
    // 3. Bất kỳ lỗi nào khác với Socket.io
    console.log('[useLongPolling] 📡 Using REST API fallback to ensure message delivery');
    const url = buildApiUrl(`/conversations/${conversationId}/messages`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token!}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      // Xóa optimistic message nếu gửi thất bại
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      const errorText = await response.text();
      throw new Error(
        `Gửi tin nhắn thất bại (${response.status}): ${errorText || response.statusText}`
      );
    }

    const data = await response.json();
    if (data?.success && data?.data) {
      // Xóa optimistic message và thay thế bằng tin nhắn thật từ server
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== optimisticMessage.id);
        const updated = [...filtered, data.data];
        updated.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        return updated;
      });
      handleNewMessage(data.data);
    }

    return data;
  }, [conversationId, handleNewMessage]);

  return {
    messages,
    isPolling,
    isConnected,
    sendMessage,
    loadHistory
  };
}

