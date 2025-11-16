/**
 * Unit Tests for Notifications APIs
 * Based on test cases from 05-notifications.md
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { Response } from 'express';
import { getNotificationsHandler, markAsReadHandler, deleteNotificationHandler } from '../routes/notifications/index.js';
import * as storageModule from '../lib/storage.js';
import { Notification, NotificationType, UserRole } from '../lib/types.js';
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

const mockNotification: Notification = {
  id: 'notif_abc123',
  userId: 'stu_abc123',
  type: NotificationType.SESSION_BOOKING,
  title: 'New Session Booking',
  message: 'You have a new session booking',
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

describe('Notifications API Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ===== TC-NOTIF-001: Get Notifications =====
  describe('TC-NOTIF-001: Get Notifications', () => {
    it('should get notifications with filters', async () => {
      const req = createMockAuthRequest(
        { userId: 'stu_abc123', role: UserRole.STUDENT },
        {},
        {},
        { read: 'false', type: 'session_booking', page: '1', limit: '10' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.find).mockResolvedValue([mockNotification]);

      await getNotificationsHandler(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(true);
      expect(responseData.data).toBeDefined();
    });
  });

  // ===== TC-NOTIF-002: Mark Notification as Read =====
  describe('TC-NOTIF-002: Mark Notification as Read', () => {
    it('should mark notification as read', async () => {
      const req = createMockAuthRequest(
        { userId: 'stu_abc123', role: UserRole.STUDENT },
        { read: true },
        { id: 'notif_abc123' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      const updatedNotification = { ...mockNotification, read: true };

      vi.mocked(storageModule.storage.findById).mockResolvedValue(mockNotification);
      vi.mocked(storageModule.storage.update).mockResolvedValue(updatedNotification);

      await markAsReadHandler(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(true);
    });
  });

  // ===== TC-NOTIF-003: Delete Notification =====
  describe('TC-NOTIF-003: Delete Notification', () => {
    it('should delete notification successfully', async () => {
      const req = createMockAuthRequest(
        { userId: 'stu_abc123', role: UserRole.STUDENT },
        {},
        { id: 'notif_abc123' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.findById).mockResolvedValue(mockNotification);
      vi.mocked(storageModule.storage.delete).mockResolvedValue(true);

      await deleteNotificationHandler(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(true);
    });
  });

  // ===== TC-NOTIF-007: Filter Notifications by Type =====
  describe('TC-NOTIF-007: Filter Notifications by Type', () => {
    it('should filter notifications by type', async () => {
      const req = createMockAuthRequest(
        { userId: 'stu_abc123', role: UserRole.STUDENT },
        {},
        {},
        { type: 'session_booking' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.find).mockResolvedValue([mockNotification]);

      await getNotificationsHandler(req, res);

      expect(res.json).toHaveBeenCalled();
    });
  });

  // ===== TC-NOTIF-008: Filter Unread Notifications =====
  describe('TC-NOTIF-008: Filter Unread Notifications', () => {
    it('should filter unread notifications', async () => {
      const req = createMockAuthRequest(
        { userId: 'stu_abc123', role: UserRole.STUDENT },
        {},
        {},
        { unreadOnly: 'true' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.find).mockResolvedValue([mockNotification]);

      await getNotificationsHandler(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.data.data.every((n: Notification) => !n.read)).toBe(true);
    });
  });

  // ===== TC-NOTIF-010: Notification Authorization =====
  describe('TC-NOTIF-010: Notification Authorization', () => {
    it('should return 403 for accessing other user notification', async () => {
      const req = createMockAuthRequest(
        { userId: 'stu_other', role: UserRole.STUDENT },
        {},
        { id: 'notif_abc123' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.findById).mockResolvedValue(mockNotification);

      await markAsReadHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });
});

