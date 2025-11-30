/**
 * Chatbot API Routes
 * POST /api/chatbot/chat - Send message to AI chatbot
 * GET /api/chatbot/history - Get conversation history
 */

import { Response } from 'express';
import { AuthRequest } from '../../lib/middleware.js';
import { storage } from '../../lib/storage.js';
import { generateAIResponse, isGeminiConfigured } from '../../lib/services/geminiService.js';
import { successResponse, errorResponse } from '../../lib/utils.js';
import { nanoid } from 'nanoid';

interface ChatMessage {
  id: string;
  conversationId: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

/**
 * POST /api/chatbot/chat
 * Send a message to the chatbot and get AI response
 */
export async function chatHandler(req: AuthRequest, res: Response) {
  try {
    const { message, conversationId } = req.body;
    const userId = req.user!.userId;

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json(
        errorResponse('Tin nhắn không được để trống')
      );
    }

    // Check if Gemini is configured
    if (!isGeminiConfigured()) {
      return res.status(500).json(
        errorResponse('Chatbot chưa được cấu hình. Vui lòng liên hệ quản trị viên.')
      );
    }

    // Get or create conversation
    let conversation: Conversation | null = null;
    let currentConversationId = conversationId;

    if (currentConversationId) {
      const conversations = await storage.find<Conversation>(
        'chatbot-conversations.json',
        c => c.id === currentConversationId && c.userId === userId
      );
      conversation = conversations[0] || null;
    }

    if (!conversation) {
      // Create new conversation
      currentConversationId = `conv_${nanoid()}`;
      conversation = {
        id: currentConversationId,
        userId,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await storage.create<Conversation>('chatbot-conversations.json', conversation);
    }

    // Save user message
    const userMessage: ChatMessage = {
      id: `msg_${nanoid()}`,
      conversationId: currentConversationId,
      userId,
      role: 'user',
      content: message.trim(),
      createdAt: new Date().toISOString()
    };

    conversation.messages.push(userMessage);
    await storage.update<Conversation>(
      'chatbot-conversations.json',
      currentConversationId,
      {
        messages: conversation.messages,
        updatedAt: new Date().toISOString()
      }
    );

    // Get conversation history for context (last 10 messages)
    const historyMessages = conversation.messages.slice(-10).map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Generate AI response
    const aiResponse = await generateAIResponse(
      message.trim(),
      userId,
      historyMessages
    );

    // Save AI response
    const assistantMessage: ChatMessage = {
      id: `msg_${nanoid()}`,
      conversationId: currentConversationId,
      userId,
      role: 'assistant',
      content: aiResponse,
      createdAt: new Date().toISOString()
    };

    conversation.messages.push(assistantMessage);
    await storage.update<Conversation>(
      'chatbot-conversations.json',
      currentConversationId,
      {
        messages: conversation.messages,
        updatedAt: new Date().toISOString()
      }
    );

    return res.json(
      successResponse({
        message: aiResponse,
        conversationId: currentConversationId,
        messageId: assistantMessage.id
      })
    );
  } catch (error: any) {
    console.error('Chatbot error:', error);
    return res.status(500).json(
      errorResponse(error.message || 'Lỗi khi xử lý tin nhắn')
    );
  }
}

/**
 * GET /api/chatbot/history
 * Get conversation history for the current user
 */
export async function getHistoryHandler(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { conversationId, limit = 50 } = req.query;

    if (conversationId) {
      // Get specific conversation
      const conversations = await storage.find<Conversation>(
        'chatbot-conversations.json',
        c => c.id === conversationId && c.userId === userId
      );

      if (conversations.length === 0) {
        return res.status(404).json(
          errorResponse('Không tìm thấy cuộc trò chuyện')
        );
      }

      return res.json(
        successResponse({
          conversation: conversations[0],
          messages: conversations[0].messages.slice(-Number(limit))
        })
      );
    } else {
      // Get all conversations for user
      const conversations = await storage.find<Conversation>(
        'chatbot-conversations.json',
        c => c.userId === userId
      );

      // Sort by updatedAt descending
      conversations.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      return res.json(
        successResponse({
          conversations: conversations.map(conv => ({
            id: conv.id,
            userId: conv.userId,
            lastMessage: conv.messages[conv.messages.length - 1],
            messageCount: conv.messages.length,
            createdAt: conv.createdAt,
            updatedAt: conv.updatedAt
          }))
        })
      );
    }
  } catch (error: any) {
    console.error('Get history error:', error);
    return res.status(500).json(
      errorResponse('Lỗi khi lấy lịch sử trò chuyện')
    );
  }
}

