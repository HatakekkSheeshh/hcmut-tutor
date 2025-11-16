/**
 * Unit Tests for Conversations & Messaging APIs
 * Based on test cases from 06-conversations.md
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { Response } from 'express';
import { listConversationsHandler, createConversationHandler, getConversationHandler, deleteConversationHandler } from '../routes/conversations/index.js';
import { getMessagesHandler, sendMessageHandler } from '../routes/conversations/[id]/messages.js';
import * as storageModule from '../lib/storage.js';
import { Conversation, Message, UserRole } from '../lib/types.js';
import type { AuthRequest } from '../lib/middleware.js';

vi.mock('../lib/storage.js', () => ({
  storage: {
    find: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    read: vi.fn(),
    write: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    paginate: vi.fn()
  }
}));

const mockConversation: Conversation = {
  id: 'conv_abc123',
  participants: ['stu_abc123', 'tut_xyz789'],
  unreadCount: { 'stu_abc123': 0, 'tut_xyz789': 1 },
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
};

const mockMessage: Message = {
  id: 'msg_abc123',
  conversationId: 'conv_abc123',
  senderId: 'stu_abc123',
  receiverId: 'tut_xyz789',
  content: 'Hello, how are you?',
  type: 'text',
  read: false,
  createdAt: '2025-01-01T00:00:00Z'
};

const createMockAuthRequest = (user?: any, body?: any, params?: any, query?: any): Partial<AuthRequest> => ({
  body: body || {},
  headers: {},
  params: params || {},
  query: query || {},
  user: user || undefined
});

const createMockResponse = (): Partial<Response> => {
  const res: any = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    statusCode: 200
  };
  return res;
};

describe('Conversations & Messaging API Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ===== TC-CONV-001: List Conversations =====
  describe('TC-CONV-001: List Conversations', () => {
    it('should list conversations for user', async () => {
      const req = createMockAuthRequest(
        { userId: 'stu_abc123', role: UserRole.STUDENT }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.read).mockResolvedValue([mockConversation]);

      await listConversationsHandler(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(true);
      expect(responseData.data).toBeInstanceOf(Array);
    });
  });

  // ===== TC-CONV-002: Create Conversation =====
  describe('TC-CONV-002: Create Conversation', () => {
    it('should create conversation successfully', async () => {
      const req = createMockAuthRequest(
        { userId: 'stu_abc123', role: UserRole.STUDENT },
        { participants: ['stu_abc123', 'tut_xyz789'] }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.read).mockResolvedValue([{ id: 'stu_abc123' }, { id: 'tut_xyz789' }]);
      vi.mocked(storageModule.storage.create).mockResolvedValue(mockConversation);

      await createConversationHandler(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(true);
    });
  });

  // ===== TC-CONV-003: Get Conversation by ID =====
  describe('TC-CONV-003: Get Conversation by ID', () => {
    it('should get conversation by ID', async () => {
      const req = createMockAuthRequest(
        { userId: 'stu_abc123', role: UserRole.STUDENT },
        {},
        { id: 'conv_abc123' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.findById).mockResolvedValue(mockConversation);

      await getConversationHandler(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(true);
    });
  });

  // ===== TC-CONV-004: Get Conversation as Non-Participant =====
  describe('TC-CONV-004: Get Conversation as Non-Participant', () => {
    it('should return 403 for non-participant', async () => {
      const req = createMockAuthRequest(
        { userId: 'stu_other', role: UserRole.STUDENT },
        {},
        { id: 'conv_abc123' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.findById).mockResolvedValue(mockConversation);

      await getConversationHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  // ===== TC-MSG-001: Get Messages =====
  describe('TC-MSG-001: Get Messages', () => {
    it('should get messages for conversation', async () => {
      const req = createMockAuthRequest(
        { userId: 'stu_abc123', role: UserRole.STUDENT },
        {},
        { id: 'conv_abc123' },
        { page: '1', limit: '50' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.findById).mockResolvedValue(mockConversation);
      vi.mocked(storageModule.storage.paginate).mockResolvedValue({
        data: [mockMessage],
        pagination: { page: 1, limit: 50, total: 1, totalPages: 1 }
      });

      await getMessagesHandler(req, res);

      expect(res.json).toHaveBeenCalled();
    });
  });

  // ===== TC-MSG-002: Send Message =====
  describe('TC-MSG-002: Send Message', () => {
    it('should send message successfully', async () => {
      const req = createMockAuthRequest(
        { userId: 'stu_abc123', role: UserRole.STUDENT },
        {
          content: 'Hello, how are you?',
          type: 'text'
        },
        { id: 'conv_abc123' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.findById).mockResolvedValue(mockConversation);
      vi.mocked(storageModule.storage.create).mockResolvedValue(mockMessage);
      vi.mocked(storageModule.storage.update).mockResolvedValue(mockConversation);

      await sendMessageHandler(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(true);
    });
  });

  // ===== TC-MSG-003: Send Message with File =====
  describe('TC-MSG-003: Send Message with File', () => {
    it('should send file message successfully', async () => {
      const req = createMockAuthRequest(
        { userId: 'stu_abc123', role: UserRole.STUDENT },
        {
          content: 'Here\'s the document',
          type: 'file',
          fileUrl: 'https://example.com/document.pdf'
        },
        { id: 'conv_abc123' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      const fileMessage = { ...mockMessage, type: 'file', fileUrl: 'https://example.com/document.pdf' };

      vi.mocked(storageModule.storage.findById).mockResolvedValue(mockConversation);
      vi.mocked(storageModule.storage.create).mockResolvedValue(fileMessage);
      vi.mocked(storageModule.storage.update).mockResolvedValue(mockConversation);

      await sendMessageHandler(req, res);

      expect(res.json).toHaveBeenCalled();
    });
  });

  // ===== TC-MSG-012: Message Validation =====
  describe('TC-MSG-012: Message Validation', () => {
    it('should return 400 for empty message content', async () => {
      const req = createMockAuthRequest(
        { userId: 'stu_abc123', role: UserRole.STUDENT },
        {
          content: '',
          type: 'invalid_type'
        },
        { id: 'conv_abc123' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.findById).mockResolvedValue(mockConversation);

      await sendMessageHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  // ===== TC-MSG-013: Message Authorization =====
  describe('TC-MSG-013: Message Authorization', () => {
    it('should return 403 for non-participant sending message', async () => {
      const req = createMockAuthRequest(
        { userId: 'stu_other', role: UserRole.STUDENT },
        {
          content: 'Hello',
          type: 'text'
        },
        { id: 'conv_abc123' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.findById).mockResolvedValue(mockConversation);

      await sendMessageHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });
});

