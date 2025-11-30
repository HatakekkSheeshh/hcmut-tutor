/**
 * Unit Tests for Session Management APIs
 * Based on test cases from 03-session-management.md
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { Request, Response } from 'express';
import { listSessionsHandler, createSessionHandler } from '../routes/sessions/index.js';
import { getSessionHandler, updateSessionHandler, cancelSessionHandler, rescheduleSessionHandler } from '../routes/sessions/[id].js';
import * as storageModule from '../lib/storage.js';
import * as notificationQueueModule from '../lib/services/notificationQueue.js';
import * as utilsModule from '../lib/utils.js';
import { Session, SessionStatus, UserRole, User, Tutor, Student } from '../lib/types.js';
import type { AuthRequest } from '../lib/middleware.js';

// Mock dependencies - hoist mocks to top level
vi.mock('../lib/storage.js', () => ({
  storage: {
    find: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
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

vi.mock('../lib/utils.js', async () => {
  const actual = await vi.importActual('../lib/utils.js') as any;
  return {
    ...actual,
    generateId: vi.fn((prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`),
    now: vi.fn(() => new Date().toISOString()),
    successResponse: (data: any, message?: string) => ({
      success: true,
      data,
      message
    }),
    errorResponse: (message: string, statusCode?: number) => ({
      success: false,
      error: message
    })
  };
});

// Test data
const mockStudent: Student = {
  id: 'stu_abc123',
  email: 'student@hcmut.edu.vn',
  password: '$2a$10$hashedpassword',
  name: 'Test Student',
  hcmutId: 'B20TEST1',
  role: UserRole.STUDENT,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
};

const mockTutor: Tutor = {
  id: 'tut_61QAuOdQbyZS',
  email: 'tutor@hcmut.edu.vn',
  password: '$2a$10$hashedpassword',
  name: 'Test Tutor',
  hcmutId: 'T20TEST1',
  role: UserRole.TUTOR,
  subjects: ['Mathematics'],
  rating: 4.5,
  totalSessions: 10,
  availability: [],
  verified: true,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
};

const mockSession: Session = {
  id: 'ses_abc123',
  studentIds: ['stu_abc123'],
  tutorId: 'tut_61QAuOdQbyZS',
  subject: 'Mathematics',
  topic: 'Calculus',
  status: SessionStatus.CONFIRMED,
  startTime: '2025-01-20T10:00:00Z',
  endTime: '2025-01-20T11:00:00Z',
  duration: 60,
  isOnline: true,
  meetingLink: 'https://meet.example.com/room123',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
};

// Helper functions
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

describe('Session Management API Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ===== TC-SESSION-001: List Sessions =====
  describe('TC-SESSION-001: List Sessions', () => {
    it('should list sessions with filters', async () => {
      const req = createMockAuthRequest(
        { userId: mockStudent.id, role: UserRole.STUDENT },
        {},
        {},
        { status: 'confirmed', studentId: 'stu_123', page: '1', limit: '10' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.paginate).mockResolvedValue({
        data: [mockSession],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      });

      await listSessionsHandler(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.data).toBeInstanceOf(Array);
      expect(responseData.pagination).toBeDefined();
    });
  });

  // ===== TC-SESSION-002: Create Session (Book Session) =====
  describe('TC-SESSION-002: Create Session (Book Session)', () => {
    it('should create session successfully', async () => {
      const req = createMockAuthRequest(
        { userId: mockStudent.id, role: UserRole.STUDENT },
        {
          tutorId: 'tut_abc123',
          subject: 'Mathematics',
          topic: 'Calculus',
          startTime: '2025-01-20T10:00:00Z',
          endTime: '2025-01-20T11:00:00Z',
          duration: 60,
          isOnline: true,
          meetingLink: 'https://meet.example.com/room123'
        }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.findById).mockResolvedValue(mockTutor);
      vi.mocked(storageModule.storage.find).mockResolvedValue([]); // No conflicts
      vi.mocked(storageModule.storage.create).mockResolvedValue(mockSession);
      vi.mocked(notificationQueueModule.queueNotification).mockResolvedValue(undefined);

      await createSessionHandler(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(true);
      expect(storageModule.storage.create).toHaveBeenCalled();
    });
  });

  // ===== TC-SESSION-003: Create Session with Invalid Tutor =====
  describe('TC-SESSION-003: Create Session with Invalid Tutor', () => {
    it('should return 404 for non-existent tutor', async () => {
      const req = createMockAuthRequest(
        { userId: mockStudent.id, role: UserRole.STUDENT },
        {
          tutorId: 'tut_nonexistent',
          subject: 'Mathematics',
          startTime: '2025-01-20T10:00:00Z',
          endTime: '2025-01-20T11:00:00Z'
        }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.findById).mockResolvedValue(null);

      await createSessionHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalled();
    });
  });

  // ===== TC-SESSION-004: Create Session with Time Conflict =====
  describe('TC-SESSION-004: Create Session with Time Conflict', () => {
    it('should return 400 for time conflict', async () => {
      const req = createMockAuthRequest(
        { userId: mockStudent.id, role: UserRole.STUDENT },
        {
          tutorId: 'tut_abc123',
          subject: 'Mathematics',
          startTime: '2025-01-20T10:00:00Z',
          endTime: '2025-01-20T11:00:00Z',
          duration: 60,
          isOnline: true
        }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      // Create a conflicting session that matches the handler's filter criteria
      const conflictingSession: Session = {
        ...mockSession,
        id: 'ses_conflict',
        tutorId: 'tut_abc123',
        startTime: '2025-01-20T10:00:00Z',
        endTime: '2025-01-20T11:00:00Z',
        duration: 60,
        status: SessionStatus.CONFIRMED, // Must be CONFIRMED or PENDING
        classId: undefined // Must not have classId (individual session)
      };

      // Mock tutor lookup
      vi.mocked(storageModule.storage.findById).mockResolvedValue(mockTutor);
      
      // Mock class lookup (should return empty for no class conflicts)
      vi.mocked(storageModule.storage.find).mockImplementation(async (file: string, filter?: any) => {
        if (file === 'classes.json') {
          return []; // No class conflicts
        }
        if (file === 'sessions.json') {
          // Return conflicting session if filter matches
          if (filter && filter(conflictingSession)) {
            return [conflictingSession];
          }
          return [];
        }
        return [];
      });

      await createSessionHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
    });
  });

  // ===== TC-SESSION-005: Get Session by ID =====
  describe('TC-SESSION-005: Get Session by ID', () => {
    it('should get session by ID', async () => {
      const req = createMockAuthRequest(
        { userId: mockStudent.id, role: UserRole.STUDENT },
        {},
        { id: 'ses_abc123' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.findById).mockResolvedValue(mockSession);

      await getSessionHandler(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(true);
      expect(responseData.data.id).toBe('ses_abc123');
    });
  });

  // ===== TC-SESSION-006: Get Session as Unauthorized User =====
  describe('TC-SESSION-006: Get Session as Unauthorized User', () => {
    it('should return 403 for unauthorized access', async () => {
      const req = createMockAuthRequest(
        { userId: 'stu_other', role: UserRole.STUDENT },
        {},
        { id: 'ses_abc123' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.findById).mockResolvedValue(mockSession);

      await getSessionHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalled();
    });
  });

  // ===== TC-SESSION-007: Update Session =====
  describe('TC-SESSION-007: Update Session', () => {
    it('should update session successfully', async () => {
      const req = createMockAuthRequest(
        { userId: mockTutor.id, role: UserRole.TUTOR },
        {
          topic: 'Updated Topic',
          description: 'Updated description',
          notes: 'Additional notes'
        },
        { id: 'ses_abc123' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      const updatedSession = {
        ...mockSession,
        topic: 'Updated Topic',
        description: 'Updated description',
        notes: 'Additional notes',
        updatedAt: '2025-01-02T00:00:00Z'
      };

      vi.mocked(storageModule.storage.findById).mockResolvedValue(mockSession);
      vi.mocked(storageModule.storage.find).mockResolvedValue([]); // No conflicts
      vi.mocked(storageModule.storage.update).mockResolvedValue(updatedSession);

      await updateSessionHandler(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(true);
    });
  });

  // ===== TC-SESSION-008: Cancel Session =====
  describe('TC-SESSION-008: Cancel Session', () => {
    it('should cancel session successfully', async () => {
      const req = createMockAuthRequest(
        { userId: mockTutor.id, role: UserRole.TUTOR },
        { reason: 'Tutor unavailable' },
        { id: 'ses_abc123' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      const cancelledSession = {
        ...mockSession,
        status: SessionStatus.CANCELLED,
        cancelledBy: mockTutor.id,
        cancelReason: 'Tutor unavailable',
        updatedAt: '2025-01-02T00:00:00Z'
      };

      vi.mocked(storageModule.storage.findById).mockResolvedValue(mockSession);
      vi.mocked(storageModule.storage.update).mockResolvedValue(cancelledSession);
      // The handler uses createMany to create notifications, not queueNotification
      vi.mocked(storageModule.storage.createMany).mockResolvedValue([]);
      // Ensure generateId is properly mocked for the require() call inside the handler
      vi.mocked(utilsModule.generateId).mockReturnValue('notif_mock123');

      await cancelSessionHandler(req, res);
      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(true);
    });
  });

  // ===== TC-SESSION-009: Reschedule Session =====
  describe('TC-SESSION-009: Reschedule Session', () => {
    it('should reschedule session successfully', async () => {
      const req = createMockAuthRequest(
        { userId: mockTutor.id, role: UserRole.TUTOR },
        {
          newStartTime: '2025-01-21T10:00:00Z',
          newEndTime: '2025-01-21T11:00:00Z',
          reason: 'Schedule conflict'
        },
        { id: 'ses_abc123' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      const rescheduledSession = {
        ...mockSession,
        startTime: '2025-01-21T10:00:00Z',
        endTime: '2025-01-21T11:00:00Z',
        rescheduledFrom: mockSession.startTime,
        updatedAt: '2025-01-02T00:00:00Z'
      };

      vi.mocked(storageModule.storage.findById).mockResolvedValue(mockSession);
      vi.mocked(storageModule.storage.find).mockResolvedValue([]); // No conflicts
      vi.mocked(storageModule.storage.update).mockResolvedValue(rescheduledSession);
      vi.mocked(notificationQueueModule.queueNotification).mockResolvedValue(undefined);

      await rescheduleSessionHandler(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(true);
    });
  });

  // ===== TC-SESSION-010: Tutor Cannot Create Session =====
  describe('TC-SESSION-010: Tutor Cannot Create Session', () => {
    it('should return 403 when tutor tries to create session', async () => {
      const req = createMockAuthRequest(
        { userId: mockTutor.id, role: UserRole.TUTOR },
        {
          tutorId: 'tut_61QAuOdQbyZS',
          subject: 'Mathematics',
          startTime: '2025-01-20T10:00:00Z',
          endTime: '2025-01-20T11:00:00Z',
          duration: 60,
          isOnline: true
        }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      await createSessionHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Chỉ sinh viên mới có thể đặt buổi học');
    });
  });

  // ===== TC-SESSION-011: Filter Sessions by Status =====
  describe('TC-SESSION-011: Filter Sessions by Status', () => {
    it('should filter sessions by status', async () => {
      const req = createMockAuthRequest(
        { userId: mockStudent.id, role: UserRole.STUDENT },
        {},
        {},
        { status: 'confirmed' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.paginate).mockResolvedValue({
        data: [mockSession],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      });

      await listSessionsHandler(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.data).toBeInstanceOf(Array);
    });
  });

  // ===== TC-SESSION-012: Filter Sessions by Date Range =====
  describe('TC-SESSION-012: Filter Sessions by Date Range', () => {
    it('should filter sessions by date range', async () => {
      const req = createMockAuthRequest(
        { userId: mockStudent.id, role: UserRole.STUDENT },
        {},
        {},
        { startDate: '2025-01-01', endDate: '2025-01-31' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.paginate).mockResolvedValue({
        data: [mockSession],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      });

      await listSessionsHandler(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.data).toBeInstanceOf(Array);
    });
  });
});

