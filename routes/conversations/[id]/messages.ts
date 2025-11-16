/**
 * Messages Management APIs for Conversations
 * GET /api/conversations/:id/messages - Get message history
 * POST /api/conversations/:id/messages - Send message
 */

import { Response } from 'express';
import { storage } from '../../../lib/storage.js';
import { Conversation, Message } from '../../../lib/types.js';
import { AuthRequest } from '../../../lib/middleware.js';
import { successResponse, errorResponse } from '../../../lib/utils.js';
import { nanoid } from 'nanoid';

/**
 * GET /api/conversations/:id/messages
 * Get message history for a conversation
 */
export async function getMessagesHandler(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    const { id: conversationId } = req.params;
    const { limit = '50', before } = req.query;
    
    if (!userId) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    // Load conversation
    const conversation = await storage.findById<Conversation>('conversations.json', conversationId);
    
    if (!conversation) {
      return res.status(404).json(errorResponse('Không tìm thấy cuộc trò chuyện'));
    }
    
    // Check if user is a participant
    if (!conversation.participants.includes(userId)) {
      return res.status(403).json(errorResponse('Bạn không có quyền truy cập cuộc trò chuyện này'));
    }
    
    // Load all messages
    const allMessages = await storage.read<Message>('messages.json');
    
    // Filter messages for this conversation
    let conversationMessages = allMessages.filter((msg: Message) =>
      msg.conversationId === conversationId
    );
    
    // Sort by createdAt (oldest first)
    conversationMessages.sort((a: Message, b: Message) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return aTime - bTime;
    });
    
    // Pagination: if before is provided, return messages before that timestamp
    if (before) {
      const beforeDate = new Date(before as string);
      conversationMessages = conversationMessages.filter((msg: Message) =>
        new Date(msg.createdAt) < beforeDate
      );
    }
    
    // Limit results
    const limitNum = parseInt(limit as string);
    conversationMessages = conversationMessages.slice(-limitNum);
    
    return res.json(successResponse(conversationMessages));
  } catch (error: any) {
    console.error('Get messages error:', error);
    return res.status(500).json(
      errorResponse('Lỗi lấy lịch sử tin nhắn: ' + error.message)
    );
  }
}

/**
 * POST /api/conversations/:id/messages
 * Send message to a conversation
 */
export async function sendMessageHandler(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    const { id: conversationId } = req.params;
    const { content, type = 'text', fileUrl } = req.body;
    
    if (!userId) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    if (!content && !fileUrl) {
      return res.status(400).json(errorResponse('Nội dung tin nhắn hoặc fileUrl là bắt buộc'));
    }

    // Load conversation
    const conversation = await storage.findById<Conversation>('conversations.json', conversationId);
    
    if (!conversation) {
      return res.status(404).json(errorResponse('Không tìm thấy cuộc trò chuyện'));
    }
    
    // Check if user is a participant
    if (!conversation.participants.includes(userId)) {
      return res.status(403).json(errorResponse('Bạn không có quyền gửi tin nhắn trong cuộc trò chuyện này'));
    }
    
    // Get receiver ID (the other participant)
    const receiverId = conversation.participants.find(id => id !== userId);
    
    if (!receiverId) {
      return res.status(400).json(errorResponse('Không tìm thấy người nhận'));
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
    
    // Save message
    const created = await storage.create<Message>('messages.json', newMessage);
    
    // Update conversation's lastMessage and updatedAt
    const updatedConversation: Conversation = {
      ...conversation,
      lastMessage: created,
      updatedAt: now
    };
    
    await storage.update('conversations.json', conversationId, updatedConversation);
    
    // Update unread count for receiver
    if (!updatedConversation.unreadCount[receiverId]) {
      updatedConversation.unreadCount[receiverId] = 0;
    }
    updatedConversation.unreadCount[receiverId] += 1;
    
    await storage.update('conversations.json', conversationId, updatedConversation);
    
    return res.status(201).json(successResponse(created));
  } catch (error: any) {
    console.error('Send message error:', error);
    return res.status(500).json(
      errorResponse('Lỗi gửi tin nhắn: ' + error.message)
    );
  }
}






