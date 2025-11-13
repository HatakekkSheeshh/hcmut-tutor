/**
 * Conversations Management APIs
 * GET /api/conversations - List conversations for current user
 * POST /api/conversations - Create new conversation
 * GET /api/conversations/:id - Get conversation by id
 * DELETE /api/conversations/:id - Delete conversation
 */

import { Response } from 'express';
import { storage } from '../../lib/storage.js';
import { Conversation, Message } from '../../lib/types.js';
import { AuthRequest } from '../../lib/middleware.js';
import { successResponse, errorResponse } from '../../lib/utils.js';
import { nanoid } from 'nanoid';

/**
 * GET /api/conversations
 * List conversations for current user
 */
export async function listConversationsHandler(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    // Load all conversations
    const allConversations = await storage.read<Conversation>('conversations.json');
    
    // Filter conversations where user is a participant
    const userConversations = allConversations.filter((conv: Conversation) =>
      conv.participants.includes(userId)
    );
    
    // Sort by updatedAt (most recent first)
    userConversations.sort((a: Conversation, b: Conversation) => {
      const aTime = new Date(a.updatedAt || a.createdAt).getTime();
      const bTime = new Date(b.updatedAt || b.createdAt).getTime();
      return bTime - aTime;
    });
    
    return res.json(successResponse(userConversations));
  } catch (error: any) {
    console.error('List conversations error:', error);
    return res.status(500).json(
      errorResponse('Lỗi lấy danh sách cuộc trò chuyện: ' + error.message)
    );
  }
}

/**
 * POST /api/conversations
 * Create new conversation
 */
export async function createConversationHandler(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    const { participantIds } = req.body;
    
    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return res.status(400).json(errorResponse('participantIds là bắt buộc và phải là mảng không rỗng'));
    }

    // Validate that all participants exist
    const allUsers = await storage.read('users.json');
    const invalidParticipants = participantIds.filter((id: string) => 
      !allUsers.find((user: any) => user.id === id)
    );
    
    if (invalidParticipants.length > 0) {
      return res.status(400).json(
        errorResponse(`Người dùng không tồn tại: ${invalidParticipants.join(', ')}`)
      );
    }

    // Combine current user with participants (remove duplicates)
    const allParticipants = Array.from(new Set([userId, ...participantIds]));
    
    // Check if conversation already exists with same participants
    const allConversations = await storage.read<Conversation>('conversations.json');
    const existingConversation = allConversations.find((conv: Conversation) => {
      if (conv.participants.length !== allParticipants.length) {
        return false;
      }
      // Check if all participants match
      return allParticipants.every(id => conv.participants.includes(id));
    });
    
    if (existingConversation) {
      // Return existing conversation
      return res.json(successResponse(existingConversation));
    }

    // Create new conversation
    const now = new Date().toISOString();
    const newConversation: Conversation = {
      id: `conv_${nanoid()}`,
      participants: allParticipants,
      unreadCount: allParticipants.reduce((acc, id) => {
        acc[id] = id === userId ? 0 : 0; // Current user has 0 unread
        return acc;
      }, {} as { [userId: string]: number }),
      createdAt: now,
      updatedAt: now
    };

    // Save to storage
    const created = await storage.create<Conversation>('conversations.json', newConversation);
    
    return res.status(201).json(successResponse(created));
  } catch (error: any) {
    console.error('Create conversation error:', error);
    return res.status(500).json(
      errorResponse('Lỗi tạo cuộc trò chuyện: ' + error.message)
    );
  }
}

/**
 * GET /api/conversations/:id
 * Get conversation by id
 */
export async function getConversationHandler(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    // Load conversation
    const conversation = await storage.findById<Conversation>('conversations.json', id);
    
    if (!conversation) {
      return res.status(404).json(errorResponse('Không tìm thấy cuộc trò chuyện'));
    }
    
    // Check if user is a participant
    if (!conversation.participants.includes(userId)) {
      return res.status(403).json(errorResponse('Bạn không có quyền truy cập cuộc trò chuyện này'));
    }
    
    return res.json(successResponse(conversation));
  } catch (error: any) {
    console.error('Get conversation error:', error);
    return res.status(500).json(
      errorResponse('Lỗi lấy cuộc trò chuyện: ' + error.message)
    );
  }
}

/**
 * DELETE /api/conversations/:id
 * Delete conversation (soft delete - remove user from participants)
 */
export async function deleteConversationHandler(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    // Load conversation
    const conversation = await storage.findById<Conversation>('conversations.json', id);
    
    if (!conversation) {
      return res.status(404).json(errorResponse('Không tìm thấy cuộc trò chuyện'));
    }
    
    // Check if user is a participant
    if (!conversation.participants.includes(userId)) {
      return res.status(403).json(errorResponse('Bạn không có quyền xóa cuộc trò chuyện này'));
    }
    
    // Remove user from participants (soft delete)
    const updatedParticipants = conversation.participants.filter(id => id !== userId);
    
    // If only one participant left, delete the conversation
    if (updatedParticipants.length === 0) {
      await storage.delete('conversations.json', id);
      return res.json(successResponse({ deleted: true }));
    }
    
    // Update conversation
    const updatedConversation: Conversation = {
      ...conversation,
      participants: updatedParticipants,
      updatedAt: new Date().toISOString()
    };
    
    await storage.update('conversations.json', id, updatedConversation);
    
    return res.json(successResponse(updatedConversation));
  } catch (error: any) {
    console.error('Delete conversation error:', error);
    return res.status(500).json(
      errorResponse('Lỗi xóa cuộc trò chuyện: ' + error.message)
    );
  }
}

