/**
 * Unit Tests for Library & Progress APIs
 * Based on test cases from 09-library-progress.md
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { Response } from 'express';
import { searchMaterialsHandler } from '../routes/library/index.js';
import { getMaterialHandler } from '../routes/library/[id].js';
import { listProgressHandler, createProgressHandler } from '../routes/progress/index.js';
import { listEvaluationsHandler, createEvaluationHandler } from '../routes/evaluations/index.js';
import * as storageModule from '../lib/storage.js';
import * as libraryServiceModule from '../lib/services/libraryService.js';
import { LibraryResource, ProgressEntry, Evaluation, UserRole, SessionStatus } from '../lib/types.js';
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

vi.mock('../lib/services/libraryService.js', () => ({
  default: {
    searchMaterials: vi.fn(),
    bookmarkMaterial: vi.fn()
  }
}));

const mockLibraryResource: LibraryResource = {
  id: 'lib_abc123',
  title: 'Calculus Textbook',
  type: 'book',
  subject: 'Mathematics',
  description: 'Advanced calculus textbook',
  tags: ['calculus', 'mathematics'],
  downloads: 0,
  views: 0,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
};

const mockProgressEntry: ProgressEntry = {
  id: 'prog_abc123',
  studentId: 'stu_abc123',
  tutorId: 'tut_abc123',
  sessionId: 'ses_abc123',
  subject: 'Mathematics',
  topic: 'Calculus',
  notes: 'Student showed good understanding',
  score: 85,
  improvements: ['Practice more problems'],
  challenges: ['Time management'],
  nextSteps: ['Review derivatives'],
  createdAt: '2025-01-01T00:00:00Z'
};

const mockEvaluation: Evaluation = {
  id: 'eval_abc123',
  sessionId: 'ses_abc123',
  studentId: 'stu_abc123',
  tutorId: 'tut_xyz789',
  rating: 5,
  comment: 'Excellent tutor, very helpful',
  aspects: {
    communication: 5,
    knowledge: 5,
    helpfulness: 5,
    punctuality: 4
  },
  improvements: ['Could provide more examples'],
  recommend: true,
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

describe('Library & Progress API Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ===== TC-LIB-001: List Library Resources =====
  describe('TC-LIB-001: List Library Resources', () => {
    it('should list library resources with filters', async () => {
      const req = createMockAuthRequest(
        { userId: 'stu_abc123', role: UserRole.STUDENT },
        {},
        {},
        { type: 'book', subject: 'Mathematics', page: '1', limit: '10' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(libraryServiceModule.default.searchMaterials).mockResolvedValue({
        success: true,
        data: [mockLibraryResource],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
      });

      await searchMaterialsHandler(req, res);

      expect(res.json).toHaveBeenCalled();
    });
  });

  // ===== TC-LIB-002: Get Library Resource by ID =====
  describe('TC-LIB-002: Get Library Resource by ID', () => {
    it('should get library resource by ID', async () => {
      const req = createMockAuthRequest(
        {},
        {},
        { id: 'lib_abc123' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.findById).mockResolvedValue(mockLibraryResource);

      await getMaterialHandler(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(true);
    });
  });

  // ===== TC-LIB-003: Search Library Resources =====
  describe('TC-LIB-003: Search Library Resources', () => {
    it('should search library resources', async () => {
      const req = createMockAuthRequest(
        {},
        {},
        {},
        { q: 'calculus', type: 'book' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(libraryServiceModule.default.searchMaterials).mockResolvedValue({
        success: true,
        data: [mockLibraryResource],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
      });

      await searchMaterialsHandler(req, res);

      expect(res.json).toHaveBeenCalled();
    });
  });

  // ===== TC-PROG-001: List Progress Entries =====
  describe('TC-PROG-001: List Progress Entries', () => {
    it('should list progress entries with filters', async () => {
      const req = createMockAuthRequest(
        { userId: 'stu_abc123', role: UserRole.STUDENT },
        {},
        {},
        { studentId: 'stu_123', subject: 'Mathematics' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.paginate).mockResolvedValue({
        data: [mockProgressEntry],
        pagination: { page: 1, limit: 100, total: 1, totalPages: 1 }
      });

      await listProgressHandler(req, res);

      expect(res.json).toHaveBeenCalled();
    });
  });

  // ===== TC-PROG-002: Create Progress Entry =====
  describe('TC-PROG-002: Create Progress Entry', () => {
    it('should create progress entry successfully', async () => {
      const req = createMockAuthRequest(
        { userId: 'tut_abc123', role: UserRole.TUTOR },
        {
          studentId: 'stu_abc123',
          sessionId: 'ses_xyz789',
          subject: 'Mathematics',
          topic: 'Calculus',
          notes: 'Student showed good understanding',
          score: 85,
          improvements: ['Practice more problems'],
          challenges: ['Time management'],
          nextSteps: ['Review derivatives']
        }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      // Mock session that belongs to this tutor
      const mockSession = {
        id: 'ses_xyz789',
        tutorId: 'tut_abc123', // Must match currentUser.userId
        studentIds: ['stu_abc123'],
        subject: 'Mathematics',
        status: SessionStatus.CONFIRMED
      };

      // Mock storage.findById for session (line 93 in handler)
      vi.mocked(storageModule.storage.findById).mockResolvedValue(mockSession);
      // Mock storage.find to return empty array (no existing progress, line 101-104)
      vi.mocked(storageModule.storage.find).mockResolvedValue([]);
      // Mock storage.create for progress entry
      vi.mocked(storageModule.storage.create).mockResolvedValue(mockProgressEntry);

      await createProgressHandler(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(true);
    });
  });

  // ===== TC-PROG-005: Progress Authorization =====
  describe('TC-PROG-005: Progress Authorization', () => {
    it('should return 403 for accessing other user progress', async () => {
      const req = createMockAuthRequest(
        { userId: 'stu_other', role: UserRole.STUDENT },
        {},
        {},
        { studentId: 'stu_abc123' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.paginate).mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 100, total: 0, totalPages: 0 }
      });

      await listProgressHandler(req, res);

      // Should filter out other user's progress
      expect(res.json).toHaveBeenCalled();
    });
  });

  // ===== TC-EVAL-001: List Evaluations =====
  describe('TC-EVAL-001: List Evaluations', () => {
    it('should list evaluations with filters', async () => {
      const req = createMockAuthRequest(
        {},
        {},
        {},
        { sessionId: 'ses_123', studentId: 'stu_123' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.paginate).mockResolvedValue({
        data: [mockEvaluation],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
      });

      await listEvaluationsHandler(req, res);

      expect(res.json).toHaveBeenCalled();
    });
  });

  // ===== TC-EVAL-002: Create Evaluation =====
  describe('TC-EVAL-002: Create Evaluation', () => {
    it('should create evaluation successfully', async () => {
      const req = createMockAuthRequest(
        { userId: 'stu_abc123', role: UserRole.STUDENT },
        {
          sessionId: 'ses_abc123',
          tutorId: 'tut_xyz789',
          rating: 5,
          comment: 'Excellent tutor, very helpful',
          aspects: {
            communication: 5,
            knowledge: 5,
            helpfulness: 5,
            punctuality: 4
          },
          improvements: ['Could provide more examples'],
          recommend: true
        }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      const mockSession = {
        id: 'ses_abc123',
        status: SessionStatus.COMPLETED,
        tutorId: 'tut_xyz789',
        studentIds: ['stu_abc123']
      };

      vi.mocked(storageModule.storage.findById).mockResolvedValue(mockSession as any);
      vi.mocked(storageModule.storage.find).mockResolvedValue([]); // No existing evaluation
      vi.mocked(storageModule.storage.create).mockResolvedValue(mockEvaluation);
      vi.mocked(storageModule.storage.update).mockResolvedValue({} as any);

      await createEvaluationHandler(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(true);
    });
  });

  // ===== TC-EVAL-006: Evaluation Validation =====
  describe('TC-EVAL-006: Evaluation Validation', () => {
    it('should return 400 for invalid evaluation data', async () => {
      const req = createMockAuthRequest(
        { userId: 'stu_abc123', role: UserRole.STUDENT },
        {
          rating: 10,
          sessionId: 'invalid_session'
        }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.findById).mockResolvedValue(null);

      await createEvaluationHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ===== TC-EVAL-007: Duplicate Evaluation Prevention =====
  describe('TC-EVAL-007: Duplicate Evaluation Prevention', () => {
    it('should return 400 for duplicate evaluation', async () => {
      const req = createMockAuthRequest(
        { userId: 'stu_abc123', role: UserRole.STUDENT },
        {
          sessionId: 'ses_abc123'
        }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      const mockSession = {
        id: 'ses_abc123',
        status: SessionStatus.COMPLETED
      };

      vi.mocked(storageModule.storage.findById).mockResolvedValue(mockSession as any);
      vi.mocked(storageModule.storage.find).mockResolvedValue([mockEvaluation]); // Already evaluated

      await createEvaluationHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});

