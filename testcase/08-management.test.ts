/**
 * Unit Tests for Management Features APIs
 * Based on test cases from 08-management.md
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { Response } from 'express';
import { listApprovalRequestsHandler, createApprovalRequestHandler } from '../routes/management/approvals/index.js';
import { getApprovalRequestHandler, approveApprovalRequestHandler, rejectApprovalRequestHandler, requestClarificationHandler } from '../routes/management/approvals/[id].js';
import { listUsersWithPermissionsHandler } from '../routes/management/permissions/index.js';
import { getUserPermissionsHandler, updateUserPermissionsHandler } from '../routes/management/permissions/[userId].js';
import { getResourceOverviewHandler } from '../routes/management/resources/index.js';
import { listProgressReportsHandler, createProgressReportHandler } from '../routes/management/reports/progress.js';
import { getPerformanceAnalysisHandler } from '../routes/management/analytics/performance.js';
import { awardCreditsHandler } from '../routes/management/credits/index.js';
import * as storageModule from '../lib/storage.js';
import { ApprovalRequest, ApprovalRequestType, ApprovalRequestStatus, UserRole, User } from '../lib/types.js';
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

const mockManagement: User = {
  id: 'mgmt_test123',
  email: 'management@hcmut.edu.vn',
  password: '$2a$10$hashedpassword',
  name: 'Test Management',
  hcmutId: 'M20TEST1',
  role: UserRole.MANAGEMENT,
  permissions: ['view_analytics'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
};

const mockApprovalRequest: ApprovalRequest = {
  id: 'appr_abc123',
  type: ApprovalRequestType.RESOURCE_ALLOCATION,
  requesterId: 'tut_abc123',
  title: 'Request room allocation',
  description: 'Need room for offline session',
  status: ApprovalRequestStatus.PENDING,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
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

describe('Management Features API Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ===== TC-MGMT-001: List Approval Requests =====
  describe('TC-MGMT-001: List Approval Requests', () => {
    it('should list approval requests for management', async () => {
      const req = createMockAuthRequest(
        { userId: mockManagement.id, role: UserRole.MANAGEMENT },
        {},
        {},
        { status: 'pending', type: 'resource_allocation' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.read).mockResolvedValue([mockApprovalRequest]);

      await listApprovalRequestsHandler(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(true);
    });
  });

  // ===== TC-MGMT-002: Create Approval Request =====
  describe('TC-MGMT-002: Create Approval Request', () => {
    it('should create approval request successfully', async () => {
      const req = createMockAuthRequest(
        { userId: 'tut_abc123', role: UserRole.TUTOR },
        {
          type: 'resource_allocation',
          title: 'Request room allocation',
          description: 'Need room for offline session',
          metadata: {
            sessionId: 'ses_abc123',
            roomId: 'room_xyz'
          }
        }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.create).mockResolvedValue(mockApprovalRequest);

      await createApprovalRequestHandler(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(true);
    });
  });

  // ===== TC-MGMT-003: Approve Approval Request =====
  describe('TC-MGMT-003: Approve Approval Request', () => {
    it('should approve request successfully', async () => {
      const req = createMockAuthRequest(
        { userId: mockManagement.id, role: UserRole.MANAGEMENT },
        { notes: 'Approved. Room allocated.' },
        { id: 'appr_abc123' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      const approvedRequest = {
        ...mockApprovalRequest,
        status: ApprovalRequestStatus.APPROVED,
        reviewerId: mockManagement.id,
        reviewNotes: 'Approved. Room allocated.',
        updatedAt: '2025-01-02T00:00:00Z'
      };

      vi.mocked(storageModule.storage.findById).mockResolvedValue(mockApprovalRequest);
      vi.mocked(storageModule.storage.update).mockResolvedValue(approvedRequest);

      await approveApprovalRequestHandler(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(true);
    });
  });

  // ===== TC-MGMT-004: Reject Approval Request =====
  describe('TC-MGMT-004: Reject Approval Request', () => {
    it('should reject request successfully', async () => {
      const req = createMockAuthRequest(
        { userId: mockManagement.id, role: UserRole.MANAGEMENT },
        { reason: 'Room not available at requested time' },
        { id: 'appr_abc123' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      const rejectedRequest = {
        ...mockApprovalRequest,
        status: ApprovalRequestStatus.REJECTED,
        reviewerId: mockManagement.id,
        reviewNotes: 'Room not available at requested time',
        updatedAt: '2025-01-02T00:00:00Z'
      };

      vi.mocked(storageModule.storage.findById).mockResolvedValue(mockApprovalRequest);
      vi.mocked(storageModule.storage.update).mockResolvedValue(rejectedRequest);

      await rejectApprovalRequestHandler(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(true);
    });
  });

  // ===== TC-MGMT-005: Request Clarification =====
  describe('TC-MGMT-005: Request Clarification', () => {
    it('should request clarification successfully', async () => {
      const req = createMockAuthRequest(
        { userId: mockManagement.id, role: UserRole.MANAGEMENT },
        { questions: 'Please provide more details about room requirements' },
        { id: 'appr_abc123' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      const clarificationRequest = {
        ...mockApprovalRequest,
        status: ApprovalRequestStatus.CLARIFICATION_REQUESTED,
        clarificationRequest: 'Please provide more details about room requirements',
        updatedAt: '2025-01-02T00:00:00Z'
      };

      vi.mocked(storageModule.storage.findById).mockResolvedValue(mockApprovalRequest);
      vi.mocked(storageModule.storage.update).mockResolvedValue(clarificationRequest);

      await requestClarificationHandler(req, res);

      expect(res.json).toHaveBeenCalled();
    });
  });

  // ===== TC-MGMT-006: List Users with Permissions =====
  describe('TC-MGMT-006: List Users with Permissions', () => {
    it('should list users with permissions', async () => {
      const req = createMockAuthRequest(
        { userId: mockManagement.id, role: UserRole.MANAGEMENT }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.read).mockResolvedValue([mockManagement]);

      await listUsersWithPermissionsHandler(req, res);

      expect(res.json).toHaveBeenCalled();
    });
  });

  // ===== TC-MGMT-007: Get User Permissions =====
  describe('TC-MGMT-007: Get User Permissions', () => {
    it('should get user permissions', async () => {
      const req = createMockAuthRequest(
        { userId: mockManagement.id, role: UserRole.MANAGEMENT },
        {},
        { userId: 'stu_abc123' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.read).mockResolvedValue([]);

      await getUserPermissionsHandler(req, res);

      expect(res.json).toHaveBeenCalled();
    });
  });

  // ===== TC-MGMT-008: Update User Permissions =====
  describe('TC-MGMT-008: Update User Permissions', () => {
    it('should update user permissions', async () => {
      const req = createMockAuthRequest(
        { userId: mockManagement.id, role: UserRole.MANAGEMENT },
        { permissions: ['read_reports', 'manage_users'] },
        { userId: 'stu_abc123' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.read).mockResolvedValue([]);
      vi.mocked(storageModule.storage.create).mockResolvedValue({} as any);

      await updateUserPermissionsHandler(req, res);

      expect(res.json).toHaveBeenCalled();
    });
  });

  // ===== TC-MGMT-010: Get Resource Overview =====
  describe('TC-MGMT-010: Get Resource Overview', () => {
    it('should get resource overview', async () => {
      const req = createMockAuthRequest(
        { userId: mockManagement.id, role: UserRole.MANAGEMENT }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.read).mockResolvedValue([]);

      await getResourceOverviewHandler(req, res);

      expect(res.json).toHaveBeenCalled();
    });
  });

  // ===== TC-MGMT-013: List Progress Reports =====
  describe('TC-MGMT-013: List Progress Reports', () => {
    it('should list progress reports', async () => {
      const req = createMockAuthRequest(
        { userId: mockManagement.id, role: UserRole.MANAGEMENT },
        {},
        {},
        { studentId: 'stu_123', dateRange: '2025-01' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.paginate).mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
      });

      await listProgressReportsHandler(req, res);

      expect(res.json).toHaveBeenCalled();
    });
  });

  // ===== TC-MGMT-014: Create Progress Report =====
  describe('TC-MGMT-014: Create Progress Report', () => {
    it('should create progress report', async () => {
      const req = createMockAuthRequest(
        { userId: mockManagement.id, role: UserRole.MANAGEMENT },
        {
          studentId: 'stu_abc123',
          period: '2025-01',
          summary: 'Good progress in Mathematics',
          recommendations: ['Continue practice', 'Focus on calculus']
        }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.create).mockResolvedValue({} as any);

      await createProgressReportHandler(req, res);

      expect(res.json).toHaveBeenCalled();
    });
  });

  // ===== TC-MGMT-015: Get Performance Analysis =====
  describe('TC-MGMT-015: Get Performance Analysis', () => {
    it('should get performance analysis', async () => {
      const req = createMockAuthRequest(
        { userId: mockManagement.id, role: UserRole.MANAGEMENT },
        {},
        {},
        { tutorId: 'tut_123', dateRange: '2025-01' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.read).mockResolvedValue([]);

      await getPerformanceAnalysisHandler(req, res);

      expect(res.json).toHaveBeenCalled();
    });
  });

  // ===== TC-MGMT-017: Award Training Credits =====
  describe('TC-MGMT-017: Award Training Credits', () => {
    it('should award training credits', async () => {
      const req = createMockAuthRequest(
        { userId: mockManagement.id, role: UserRole.MANAGEMENT },
        {
          studentId: 'stu_abc123',
          amount: 10,
          reason: 'Excellent performance in Mathematics'
        }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.findById).mockResolvedValue({} as any);
      vi.mocked(storageModule.storage.create).mockResolvedValue({} as any);
      vi.mocked(storageModule.storage.update).mockResolvedValue({} as any);

      await awardCreditsHandler(req, res);

      expect(res.json).toHaveBeenCalled();
    });
  });

  // ===== TC-MGMT-021: Management Authorization =====
  describe('TC-MGMT-021: Management Authorization', () => {
    it('should return 403 for non-management users', async () => {
      const req = createMockAuthRequest(
        { userId: 'stu_abc123', role: UserRole.STUDENT }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      await listApprovalRequestsHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });
});

