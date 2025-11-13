/**
 * WebSocket Server cho Real-time Chat
 * Server này chạy riêng biệt (Railway/Render) vì Vercel không hỗ trợ WebSocket
 */

import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { config } from '../lib/config.js';
import { verifyToken } from '../lib/utils.js';
import { storage } from '../lib/storage.js';
import { Message, Conversation } from '../lib/types.js';
import { nanoid } from 'nanoid';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || config.frontend.url || '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Track online users
const onlineUsers = new Map<string, string>(); // userId -> socketId

// Socket authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const payload = verifyToken(token);
    
    if (!payload || !payload.userId) {
      return next(new Error('Invalid or expired token'));
    }

    // Attach user info to socket
    (socket as any).userId = payload.userId;
    (socket as any).userRole = payload.role;
    
    next();
  } catch (error: any) {
    console.error('[WebSocket] Authentication error:', error);
    next(new Error('Authentication failed: ' + (error.message || 'Unknown error')));
  }
});

// Connection handler
io.on('connection', (socket: any) => {
  const userId = socket.userId;
  const socketId = socket.id;
  
  console.log(`[WebSocket] ✅ User connected: ${userId} (socket: ${socketId})`);
  
  // Add to online users
  onlineUsers.set(userId, socketId);
  
  // Notify all clients about new online user
  io.emit('userOnline', userId);
  io.emit('onlineUsers', Array.from(onlineUsers.keys()));

  // Join room for a conversation
  socket.on('join-room', async (conversationId: string) => {
    try {
      console.log(`[WebSocket] 🚪 User ${userId} joining room: ${conversationId}`);
      
      // Verify user has access to this conversation
      const conversation = await storage.findById<Conversation>('conversations.json', conversationId);
      
      if (!conversation) {
        socket.emit('error', 'Không tìm thấy cuộc trò chuyện');
        return;
      }
      
      if (!conversation.participants.includes(userId)) {
        socket.emit('error', 'Bạn không có quyền truy cập cuộc trò chuyện này');
        return;
      }
      
      socket.join(conversationId);
      console.log(`[WebSocket] ✅ User ${userId} joined room: ${conversationId}`);
    } catch (error: any) {
      console.error(`[WebSocket] ❌ Error joining room:`, error);
      socket.emit('error', 'Lỗi khi tham gia cuộc trò chuyện: ' + (error.message || 'Unknown error'));
    }
  });

  // Leave room
  socket.on('leave-room', (conversationId: string) => {
    console.log(`[WebSocket] 🚪 User ${userId} leaving room: ${conversationId}`);
    socket.leave(conversationId);
  });

  // Send message
  socket.on('send-message', async (data: {
    conversationId: string;
    content: string;
    type?: 'text' | 'file' | 'image';
    fileUrl?: string;
  }) => {
    try {
      const { conversationId, content, type = 'text', fileUrl } = data;
      
      console.log(`[WebSocket] 📤 User ${userId} sending message to conversation: ${conversationId}`);
      
      if (!content && !fileUrl) {
        socket.emit('error', 'Nội dung tin nhắn hoặc fileUrl là bắt buộc');
        return;
      }

      // Load conversation
      const conversation = await storage.findById<Conversation>('conversations.json', conversationId);
      
      if (!conversation) {
        socket.emit('error', 'Không tìm thấy cuộc trò chuyện');
        return;
      }
      
      // Check if user is a participant
      if (!conversation.participants.includes(userId)) {
        socket.emit('error', 'Bạn không có quyền gửi tin nhắn trong cuộc trò chuyện này');
        return;
      }
      
      // Get receiver ID (the other participant)
      const receiverId = conversation.participants.find(id => id !== userId);
      
      if (!receiverId) {
        socket.emit('error', 'Không tìm thấy người nhận');
        return;
      }
      
      // Create new message
      const now = new Date().toISOString();
      const newMessage: Message = {
        id: `msg_${nanoid()}`,
        conversationId,
        senderId: userId,
        receiverId,
        content: content || '',
        type: type || 'text',
        fileUrl: fileUrl || undefined,
        read: false,
        createdAt: now
      };
      
      // Save message to storage
      const created = await storage.create<Message>('messages.json', newMessage);
      
      // Update conversation's lastMessage and updatedAt
      const updatedConversation: Conversation = {
        ...conversation,
        lastMessage: created,
        updatedAt: now
      };
      
      // Update unread count for receiver
      if (!updatedConversation.unreadCount[receiverId]) {
        updatedConversation.unreadCount[receiverId] = 0;
      }
      updatedConversation.unreadCount[receiverId] += 1;
      
      await storage.update('conversations.json', conversationId, updatedConversation);
      
      // Broadcast message to all clients in the conversation room
      io.to(conversationId).emit('new-message', created);
      
      // Send confirmation to sender
      socket.emit('message-sent', {
        messageId: created.id,
        conversationId
      });
      
      console.log(`[WebSocket] ✅ Message sent: ${created.id} to conversation: ${conversationId}`);
    } catch (error: any) {
      console.error(`[WebSocket] ❌ Error sending message:`, error);
      socket.emit('error', 'Lỗi gửi tin nhắn: ' + (error.message || 'Unknown error'));
    }
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    console.log(`[WebSocket] ❌ User disconnected: ${userId} (socket: ${socketId})`);
    
    // Remove from online users
    onlineUsers.delete(userId);
    
    // Notify all clients about offline user
    io.emit('userOffline', userId);
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
  });

  // Error handler
  socket.on('error', (error: Error) => {
    console.error(`[WebSocket] ❌ Socket error for user ${userId}:`, error);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    onlineUsers: onlineUsers.size,
    connections: io.sockets.sockets.size
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║        🔌 WebSocket Server cho Real-time Chat                ║
║                                                              ║
║  Status: ✅ Running                                          ║
║  Port: ${PORT}                                                  ║
║  Environment: ${process.env.NODE_ENV || 'development'}                               ║
║                                                              ║
║  WebSocket: ws://localhost:${PORT}                            ║
║  Health Check: http://localhost:${PORT}/health                ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `);
});

