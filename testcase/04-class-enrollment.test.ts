/**
 * Unit Tests for Class & Enrollment APIs
 * Based on test cases from 04-class-enrollment.md
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { Response } from 'express';
import { listClassesHandler, createClassHandler } from '../routes/classes/index.js';
import { getClassHandler, updateClassHandler, deleteClassHandler } from '../routes/classes/[id].js';
import { generateSessionsHandler } from '../routes/classes/[id]/generate-sessions.js';
import { listEnrollmentsHandler, createEnrollmentHandler } from '../routes/enrollments/index.js';
import { getEnrollmentHandler, updateEnrollmentHandler } from '../routes/enrollments/[id].js';
import * as storageModule from '../lib/storage.js';
import { Class, ClassStatus, Enrollment, EnrollmentStatus, UserRole, Tutor, Availability } from '../lib/types.js';
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

vi.mock('../lib/idNormalizer.js', () => ({
  normalizeUserId: vi.fn((id: string) => Promise.resolve(id))
}));

const mockTutor: Tutor = {
  id: 'tut_abc123',
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

const mockClass: Class = {
  id: 'cls_abc123',
  code: 'C01',
  tutorId: 'tut_abc123',
  subject: 'Mathematics',
  description: 'Advanced Calculus',
  day: 'monday',
  startTime: '08:00',
  endTime: '10:00',
  duration: 120,
  maxStudents: 30,
  currentEnrollment: 5,
  status: ClassStatus.ACTIVE,
  semesterStart: '2025-01-15',
  semesterEnd: '2025-05-15',
  isOnline: false,
  location: 'Room A101',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
};

const mockEnrollment: Enrollment = {
  id: 'enr_abc123',
  studentId: 'stu_abc123',
  classId: 'cls_abc123',
  status: EnrollmentStatus.ACTIVE,
  enrolledAt: '2025-01-01T00:00:00Z'
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

describe('Class & Enrollment API Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ===== TC-CLASS-001: List Classes =====
  describe('TC-CLASS-001: List Classes', () => {
    it('should list classes with filters', async () => {
      const req = createMockAuthRequest(
        {},
        {},
        {},
        { status: 'active', subject: 'Mathematics', page: '1', limit: '10' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.paginate).mockResolvedValue({
        data: [mockClass],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
      });

      await listClassesHandler(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(true);
      expect(responseData.data).toBeInstanceOf(Array);
    });
  });

  // ===== TC-CLASS-002: Create Class =====
  describe('TC-CLASS-002: Create Class', () => {
    it('should create class successfully for tutor', async () => {
      const req = createMockAuthRequest(
        { userId: mockTutor.id, role: UserRole.TUTOR },
        {
          code: 'C01',
          subject: 'Mathematics',
          description: 'Advanced Calculus',
          day: 'monday',
          startTime: '08:00',
          endTime: '10:00',
          duration: 120,
          maxStudents: 30,
          semesterStart: '2025-01-15',
          semesterEnd: '2025-05-15',
          isOnline: false,
          location: 'Room A101'
        }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      const mockAvailability: Availability = {
        id: 'avail_123',
        tutorId: mockTutor.id,
        timeSlots: [{
          day: 'monday',
          startTime: '08:00',
          endTime: '17:00'
        }],
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      };

      vi.mocked(storageModule.storage.find).mockResolvedValue([mockAvailability]);
      vi.mocked(storageModule.storage.create).mockResolvedValue(mockClass);

      await createClassHandler(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(true);
    });
  });

  // ===== TC-CLASS-003: Get Class by ID =====
  describe('TC-CLASS-003: Get Class by ID', () => {
    it('should get class by ID', async () => {
      const req = createMockAuthRequest(
        {},
        {},
        { id: 'cls_abc123' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.findById).mockResolvedValue(mockClass);

      await getClassHandler(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(true);
      expect(responseData.data.id).toBe('cls_abc123');
    });
  });

  // ===== TC-CLASS-004: Update Class =====
  describe('TC-CLASS-004: Update Class', () => {
    it('should update class successfully', async () => {
      const req = createMockAuthRequest(
        { userId: mockTutor.id, role: UserRole.TUTOR },
        { description: 'Updated description', maxStudents: 35 },
        { id: 'cls_abc123' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      const updatedClass = {
        ...mockClass,
        description: 'Updated description',
        maxStudents: 35,
        updatedAt: '2025-01-02T00:00:00Z'
      };

      vi.mocked(storageModule.storage.findById).mockResolvedValue(mockClass);
      vi.mocked(storageModule.storage.update).mockResolvedValue(updatedClass);

      await updateClassHandler(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(true);
    });
  });

  // ===== TC-CLASS-005: Delete Class =====
  describe('TC-CLASS-005: Delete Class', () => {
    it('should delete class successfully', async () => {
      const req = createMockAuthRequest(
        { userId: mockTutor.id, role: UserRole.TUTOR },
        {},
        { id: 'cls_abc123' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.findById).mockResolvedValue(mockClass);
      vi.mocked(storageModule.storage.delete).mockResolvedValue(true);

      await deleteClassHandler(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(true);
    });
  });

  // ===== TC-CLASS-006: Generate Sessions from Class =====
  describe('TC-CLASS-006: Generate Sessions from Class', () => {
    it('should generate sessions from class', async () => {
      const req = createMockAuthRequest(
        { userId: mockTutor.id, role: UserRole.TUTOR },
        { startDate: '2025-01-15', endDate: '2025-05-15' },
        { id: 'cls_abc123' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.findById).mockResolvedValue(mockClass);
      vi.mocked(storageModule.storage.find).mockResolvedValue([]);
      vi.mocked(storageModule.storage.create).mockResolvedValue({} as any);

      await generateSessionsHandler(req, res);

      expect(res.json).toHaveBeenCalled();
    });
  });

  // ===== TC-ENROLL-001: List Enrollments =====
  describe('TC-ENROLL-001: List Enrollments', () => {
    it('should list enrollments with filters', async () => {
      const req = createMockAuthRequest(
        { userId: 'stu_abc123', role: UserRole.STUDENT },
        {},
        {},
        { studentId: 'stu_123', status: 'active' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.paginate).mockResolvedValue({
        data: [mockEnrollment],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
      });
      vi.mocked(storageModule.storage.read).mockResolvedValue([]);

      await listEnrollmentsHandler(req, res);

      expect(res.json).toHaveBeenCalled();
    });
  });

  // ===== TC-ENROLL-002: Create Enrollment =====
  describe('TC-ENROLL-002: Create Enrollment', () => {
    it('should create enrollment successfully', async () => {
      const req = createMockAuthRequest(
        { userId: 'stu_abc123', role: UserRole.STUDENT },
        { classId: 'cls_abc123', notes: 'Interested in advanced topics' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.findById).mockResolvedValue(mockClass);
      vi.mocked(storageModule.storage.find).mockResolvedValue([]); // No existing enrollment
      vi.mocked(storageModule.storage.create).mockResolvedValue(mockEnrollment);
      vi.mocked(storageModule.storage.update).mockResolvedValue({
        ...mockClass,
        currentEnrollment: 6
      });

      await createEnrollmentHandler(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(true);
    });
  });

  // ===== TC-ENROLL-003: Create Enrollment for Full Class =====
  describe('TC-ENROLL-003: Create Enrollment for Full Class', () => {
    it('should return 400 for full class', async () => {
      const fullClass = {
        ...mockClass,
        currentEnrollment: 30,
        maxStudents: 30,
        status: ClassStatus.FULL
      };

      const req = createMockAuthRequest(
        { userId: 'stu_abc123', role: UserRole.STUDENT },
        { classId: 'cls_full' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.findById).mockResolvedValue(fullClass);

      await createEnrollmentHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  // ===== TC-ENROLL-004: Get Enrollment by ID =====
  describe('TC-ENROLL-004: Get Enrollment by ID', () => {
    it('should get enrollment by ID', async () => {
      const req = createMockAuthRequest(
        {},
        {},
        { id: 'enr_abc123' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.findById).mockResolvedValue(mockEnrollment);

      await getEnrollmentHandler(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(true);
    });
  });

  // ===== TC-ENROLL-005: Update Enrollment =====
  describe('TC-ENROLL-005: Update Enrollment', () => {
    it('should update enrollment successfully', async () => {
      const req = createMockAuthRequest(
        { userId: 'stu_abc123', role: UserRole.STUDENT }, // Student owns this enrollment
        { notes: 'Updated notes', status: 'completed' },
        { id: 'enr_abc123' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      const updatedEnrollment = {
        ...mockEnrollment,
        notes: 'Updated notes',
        status: EnrollmentStatus.COMPLETED,
        completedAt: '2025-01-02T00:00:00Z'
      };

      vi.mocked(storageModule.storage.findById)
        .mockResolvedValueOnce(mockEnrollment) // First call: get enrollment
        .mockResolvedValueOnce(mockClass); // Second call: get class (if status changes to DROPPED/CANCELLED)
      vi.mocked(storageModule.storage.update).mockResolvedValue(updatedEnrollment);

      await updateEnrollmentHandler(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(true);
    });
  });

  // ===== TC-ENROLL-006: Delete Enrollment (Drop) =====
  describe('TC-ENROLL-006: Delete Enrollment (Drop)', () => {
    it('should drop enrollment successfully', async () => {
      const req = createMockAuthRequest(
        { userId: 'stu_abc123', role: UserRole.STUDENT },
        {},
        { id: 'enr_abc123' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.findById).mockResolvedValue(mockEnrollment);
      vi.mocked(storageModule.storage.update).mockResolvedValue({
        ...mockEnrollment,
        status: EnrollmentStatus.DROPPED
      });

      await updateEnrollmentHandler(req, res);

      expect(res.json).toHaveBeenCalled();
    });
  });

  // ===== TC-ENROLL-009: Duplicate Enrollment Prevention =====
  describe('TC-ENROLL-009: Duplicate Enrollment Prevention', () => {
    it('should return 400 for duplicate enrollment', async () => {
      const req = createMockAuthRequest(
        { userId: 'stu_abc123', role: UserRole.STUDENT },
        { classId: 'cls_abc123' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.findById).mockResolvedValue(mockClass);
      vi.mocked(storageModule.storage.find).mockResolvedValue([mockEnrollment]); // Already enrolled

      await createEnrollmentHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});

