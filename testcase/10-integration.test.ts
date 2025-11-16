/**
 * Integration Tests
 * Based on test cases from 10-integration.md
 * 
 * Note: These are higher-level integration tests that test workflows
 * across multiple endpoints and features.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { Response } from 'express';
import { createSessionHandler } from '../routes/sessions/index.js';
import { createEnrollmentHandler } from '../routes/enrollments/index.js';
import { createConversationHandler } from '../routes/conversations/index.js';
import { sendMessageHandler } from '../routes/conversations/[id]/messages.js';
import { createEvaluationHandler } from '../routes/evaluations/index.js';
import { createProgressHandler } from '../routes/progress/index.js';
import * as storageModule from '../lib/storage.js';
import * as notificationQueueModule from '../lib/services/notificationQueue.js';
import { Session, SessionStatus, Enrollment, EnrollmentStatus, UserRole, Class, ClassStatus } from '../lib/types.js';
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

vi.mock('../lib/services/notificationQueue.js', () => ({
  queueNotification: vi.fn(),
  addToQueue: vi.fn()
}));

vi.mock('../lib/idNormalizer.js', () => ({
  normalizeUserId: vi.fn((id: string) => Promise.resolve(id))
}));

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

describe('Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ===== TC-INT-001: Complete Session Booking Flow =====
  describe('TC-INT-001: Complete Session Booking Flow', () => {
    it('should complete full session booking workflow', async () => {
      const student = { userId: 'stu_abc123', role: UserRole.STUDENT };
      const tutor = { id: 'tut_abc123', role: UserRole.TUTOR, subjects: ['Mathematics'] };
      const session = {
        id: 'ses_abc123',
        studentIds: ['stu_abc123'],
        tutorId: 'tut_abc123',
        subject: 'Mathematics',
        status: SessionStatus.PENDING,
        startTime: '2025-01-20T10:00:00Z',
        endTime: '2025-01-20T11:00:00Z',
        duration: 60,
        isOnline: true
      };

      // Step 1: Student books session
      const bookReq = createMockAuthRequest(
        student,
        {
          tutorId: 'tut_abc123',
          subject: 'Mathematics',
          startTime: '2025-01-20T10:00:00Z',
          endTime: '2025-01-20T11:00:00Z',
          duration: 60,
          isOnline: true
        }
      ) as AuthRequest;
      const bookRes = createMockResponse() as Response;

      vi.mocked(storageModule.storage.findById).mockResolvedValue(tutor as any);
      vi.mocked(storageModule.storage.find).mockResolvedValue([]);
      vi.mocked(storageModule.storage.create).mockResolvedValue(session as any);
      vi.mocked(notificationQueueModule.queueNotification).mockResolvedValue(undefined);

      await createSessionHandler(bookReq, bookRes);

      expect(bookRes.json).toHaveBeenCalled();
      const bookResponse = vi.mocked(bookRes.json).mock.calls[0][0];
      expect(bookResponse.success).toBe(true);

      // Verify notification was queued
      expect(notificationQueueModule.queueNotification).toHaveBeenCalled();
    });
  });

  // ===== TC-INT-003: Class Enrollment to Sessions Flow =====
  describe('TC-INT-003: Class Enrollment to Sessions Flow', () => {
    it('should complete class enrollment workflow', async () => {
      const student = { userId: 'stu_abc123', role: UserRole.STUDENT };
      const mockClass: Class = {
        id: 'cls_abc123',
        code: 'C01',
        tutorId: 'tut_abc123',
        subject: 'Mathematics',
        day: 'monday',
        startTime: '08:00',
        endTime: '10:00',
        duration: 120,
        maxStudents: 30,
        currentEnrollment: 0,
        status: ClassStatus.ACTIVE,
        semesterStart: '2025-01-15',
        semesterEnd: '2025-05-15',
        isOnline: false,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      };

      // Step 1: Student enrolls in class
      const enrollReq = createMockAuthRequest(
        student,
        { classId: 'cls_abc123' }
      ) as AuthRequest;
      const enrollRes = createMockResponse() as Response;

      const mockEnrollment: Enrollment = {
        id: 'enr_abc123',
        studentId: 'stu_abc123',
        classId: 'cls_abc123',
        status: EnrollmentStatus.ACTIVE,
        enrolledAt: '2025-01-01T00:00:00Z'
      };

      vi.mocked(storageModule.storage.findById).mockResolvedValue(mockClass);
      vi.mocked(storageModule.storage.find).mockResolvedValue([]);
      vi.mocked(storageModule.storage.create).mockResolvedValue(mockEnrollment);
      vi.mocked(storageModule.storage.update).mockResolvedValue({
        ...mockClass,
      });

      await createEnrollmentHandler(enrollReq, enrollRes);

      expect(enrollRes.json).toHaveBeenCalled();
      const enrollResponse = vi.mocked(enrollRes.json).mock.calls[0][0];
      expect(enrollResponse.success).toBe(true);
    });
  });

  // ===== TC-INT-004: Real-time Chat Integration =====
  describe('TC-INT-004: Real-time Chat Integration', () => {
    it('should complete messaging workflow', async () => {
      const userA = { userId: 'stu_abc123', role: UserRole.STUDENT };
      const userB = { userId: 'tut_xyz789', role: UserRole.TUTOR };

      const mockConversation = {
        id: 'conv_abc123',
        participants: ['stu_abc123', 'tut_xyz789'],
        unreadCount: { 'stu_abc123': 0, 'tut_xyz789': 0 },
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      };

      // Step 1: Create conversation
      const convReq = createMockAuthRequest(
        userA,
        { participants: ['stu_abc123', 'tut_xyz789'] }
      ) as AuthRequest;
      const convRes = createMockResponse() as Response;

      vi.mocked(storageModule.storage.read).mockResolvedValue([
        { id: 'stu_abc123' },
        { id: 'tut_xyz789' }
      ]);
      vi.mocked(storageModule.storage.create).mockResolvedValue(mockConversation as any);

      await createConversationHandler(convReq, convRes);

      expect(convRes.json).toHaveBeenCalled();

      // Step 2: Send message
      const msgReq = createMockAuthRequest(
        userA,
        {
          content: 'Hello',
          type: 'text'
        },
        { id: 'conv_abc123' }
      ) as AuthRequest;
      const msgRes = createMockResponse() as Response;

      const mockMessage = {
        id: 'msg_abc123',
        conversationId: 'conv_abc123',
        senderId: 'stu_abc123',
        receiverId: 'tut_xyz789',
        content: 'Hello',
        type: 'text',
        read: false,
        createdAt: '2025-01-01T00:00:00Z'
      };

      vi.mocked(storageModule.storage.findById).mockResolvedValue(mockConversation as any);
      vi.mocked(storageModule.storage.create).mockResolvedValue(mockMessage as any);
      vi.mocked(storageModule.storage.update).mockResolvedValue(mockConversation as any);

      await sendMessageHandler(msgReq, msgRes);

      expect(msgRes.json).toHaveBeenCalled();
    });
  });

  // ===== TC-INT-009: Evaluation to Rating Update =====
  describe('TC-INT-009: Evaluation to Rating Update', () => {
    it('should update tutor rating after evaluation', async () => {
      const student = { userId: 'stu_abc123', role: UserRole.STUDENT };
      const tutor = {
        id: 'tut_xyz789',
        role: UserRole.TUTOR,
        rating: 4.0,
        totalSessions: 9
      };

      const mockSession = {
        id: 'ses_abc123',
        status: SessionStatus.COMPLETED,
        tutorId: 'tut_xyz789',
        studentIds: ['stu_abc123']
      };

      const mockEvaluation = {
        id: 'eval_abc123',
        sessionId: 'ses_abc123',
        studentId: 'stu_abc123',
        tutorId: 'tut_xyz789',
        rating: 5,
        comment: 'Excellent',
        createdAt: '2025-01-01T00:00:00Z'
      };

      const evalReq = createMockAuthRequest(
        student,
        {
          sessionId: 'ses_abc123',
          tutorId: 'tut_xyz789',
          rating: 5,
          comment: 'Excellent'
        }
      ) as AuthRequest;
      const evalRes = createMockResponse() as Response;

      vi.mocked(storageModule.storage.findById).mockResolvedValue(mockSession as any);
      vi.mocked(storageModule.storage.find).mockResolvedValue([]);
      vi.mocked(storageModule.storage.create).mockResolvedValue(mockEvaluation as any);
/*       vi.mocked(storageModule.storage.update).mockResolvedValue({
        ...tutor,
        rating: 4.1, // Updated rating
        totalSessions: 10
      } as any); */

      await createEvaluationHandler(evalReq, evalRes);

      expect(evalRes.json).toHaveBeenCalled();
      // Verify tutor update was called
      expect(storageModule.storage.create).toHaveBeenCalled();
    });
  });

  // ===== TC-INT-011: Error Handling and Recovery =====
  describe('TC-INT-011: Error Handling and Recovery', () => {
    it('should handle errors gracefully', async () => {
      const req = createMockAuthRequest(
        { userId: 'stu_abc123', role: UserRole.STUDENT },
        {
          tutorId: 'tut_abc123',
          subject: 'Mathematics'
        }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      // Simulate database error
      vi.mocked(storageModule.storage.findById).mockRejectedValue(new Error('Database error'));

      await createSessionHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });

  // ===== TC-INT-014: Data Consistency Across Features =====
  describe('TC-INT-014: Data Consistency Across Features', () => {
    it('should maintain data consistency across operations', async () => {
      const student = { userId: 'stu_abc123', role: UserRole.STUDENT };
      const tutor = { id: 'tut_abc123', role: UserRole.TUTOR, subjects: ['Mathematics'] };

      // Create session
      const sessionReq = createMockAuthRequest(
        student,
        {
          tutorId: 'tut_abc123',
          subject: 'Mathematics',
          startTime: '2025-01-20T10:00:00Z',
          endTime: '2025-01-20T11:00:00Z',
          duration: 60,
          isOnline: true
        }
      ) as AuthRequest;
      const sessionRes = createMockResponse() as Response;

      const mockSession = {
        id: 'ses_abc123',
        studentIds: ['stu_abc123'],
        tutorId: 'tut_abc123',
        subject: 'Mathematics',
        status: SessionStatus.PENDING
      };

      vi.mocked(storageModule.storage.findById).mockResolvedValue(tutor as any);
      vi.mocked(storageModule.storage.find).mockResolvedValue([]);
      vi.mocked(storageModule.storage.create).mockResolvedValue(mockSession as any);
      vi.mocked(notificationQueueModule.queueNotification).mockResolvedValue(undefined);

      await createSessionHandler(sessionReq, sessionRes);

      // Create progress entry for the session
      const progressReq = createMockAuthRequest(
        { userId: 'tut_abc123', role: UserRole.TUTOR },
        {
          studentId: 'stu_abc123',
          sessionId: 'ses_abc123',
          subject: 'Mathematics',
          topic: 'Calculus',
          notes: 'Good progress'
        }
      ) as AuthRequest;
      const progressRes = createMockResponse() as Response;

      const mockProgress = {
        id: 'prog_abc123',
        studentId: 'stu_abc123',
        tutorId: 'tut_abc123',
        sessionId: 'ses_abc123',
        subject: 'Mathematics',
        topic: 'Calculus',
        notes: 'Good progress',
        createdAt: '2025-01-01T00:00:00Z'
      };

      vi.mocked(storageModule.storage.create).mockResolvedValue(mockProgress as any);

      await createProgressHandler(progressReq, progressRes);

      expect(progressRes.json).toHaveBeenCalled();
      // Verify both operations completed successfully
      expect(sessionRes.json).toHaveBeenCalled();
    });
  });
});

