/**
 * Unit Tests for Authentication APIs
 * Based on test cases from 01-authentication.md
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { Request, Response } from 'express';
import { loginHandler } from '../routes/auth/login.js';
import { registerHandler } from '../routes/auth/register.js';
import { meHandler } from '../routes/auth/me.js';
import { refreshTokenHandler } from '../routes/auth/refresh.js';
import { logoutHandler } from '../routes/auth/logout.js';
import { authenticate } from '../lib/middleware.js';
import * as storageModule from '../lib/storage.js';
import * as utilsModule from '../lib/utils.js';
import { User, UserRole } from '../lib/types.js';
import type { AuthRequest } from '../lib/middleware.js';

// Mock dependencies
vi.mock('../lib/storage.js', () => ({
  storage: {
    find: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    read: vi.fn(),
    write: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }
}));

vi.mock('../lib/utils.js', async () => {
  const actual = await vi.importActual('../lib/utils.js');
  return {
    ...actual,
    comparePassword: vi.fn(),
    hashPassword: vi.fn(),
    generateToken: vi.fn(),
    generateRefreshToken: vi.fn(),
    verifyToken: vi.fn(),
    extractToken: vi.fn()
  };
});

// Test data
const mockStudent: User = {
  id: 'stu_test123',
  email: 'student@hcmut.edu.vn',
  password: '$2a$10$hashedpassword', // Mock hashed password
  name: 'Test Student',
  hcmutId: 'B20TEST1',
  role: UserRole.STUDENT,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
};

const mockTutor: User = {
  id: 'tut_test123',
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

// Helper function to create mock request
const createMockRequest = (body?: any, headers?: any): Partial<Request> => ({
  body: body || {},
  headers: headers || {}
});

// Helper function to create mock response
const createMockResponse = (): Partial<Response> => {
  const res: any = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    statusCode: 200
  };
  return res;
};

// Helper function to create mock AuthRequest
const createMockAuthRequest = (user?: any, body?: any): Partial<AuthRequest> => ({
  body: body || {},
  headers: {},
  user: user || undefined
});

describe('Authentication API Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ===== TC-AUTH-001: Successful Login =====
  describe('TC-AUTH-001: Successful Login', () => {
    it('should login successfully with valid credentials', async () => {
      const req = createMockRequest({
        email: '2330009@hcmut.edu.vn',
        password: 'password123'
      }) as Request;
      const res = createMockResponse() as Response;

      // Mock storage.find to return user
      vi.mocked(storageModule.storage.find).mockResolvedValue([mockStudent]);
      
      // Mock password comparison
      vi.mocked(utilsModule.comparePassword).mockResolvedValue(true);
      
      // Mock token generation
      vi.mocked(utilsModule.generateToken).mockReturnValue('mock_access_token');
      vi.mocked(utilsModule.generateRefreshToken).mockReturnValue('mock_refresh_token');

      await loginHandler(req, res);

      // Login handler calls res.json() directly (default status is 200)
      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(true);
      expect(responseData.data).toHaveProperty('user');
      expect(responseData.data).toHaveProperty('token');
      expect(responseData.data).toHaveProperty('refreshToken');
      expect(responseData.data.user).not.toHaveProperty('password');
      expect(responseData.data.user.id).toBe(mockStudent.id);
      expect(responseData.data.user.role).toBe(UserRole.STUDENT);
    });
  });

  // ===== TC-AUTH-002: Login with Invalid Email =====
  describe('TC-AUTH-002: Login with Invalid Email', () => {
    it('should return 401 when email does not exist', async () => {
      const req = createMockRequest({
        email: 'nonexistent@hcmut.edu.vn',
        password: 'anypassword'
      }) as Request;
      const res = createMockResponse() as Response;

      // Mock storage.find to return empty array
      vi.mocked(storageModule.storage.find).mockResolvedValue([]);

      await loginHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Email hoặc mật khẩu không đúng');
    });
  });

  // ===== TC-AUTH-003: Login with Invalid Password =====
  describe('TC-AUTH-003: Login with Invalid Password', () => {
    it('should return 401 when password is incorrect', async () => {
      const req = createMockRequest({
        email: 'student@hcmut.edu.vn',
        password: 'wrongpassword'
      }) as Request;
      const res = createMockResponse() as Response;

      // Mock storage.find to return user
      vi.mocked(storageModule.storage.find).mockResolvedValue([mockStudent]);
      
      // Mock password comparison to return false
      vi.mocked(utilsModule.comparePassword).mockResolvedValue(false);

      await loginHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Email hoặc mật khẩu không đúng');
    });
  });

  // ===== TC-AUTH-004: Login with Missing Email =====
  describe('TC-AUTH-004: Login with Missing Email', () => {
    it('should handle missing email gracefully', async () => {
      const req = createMockRequest({
        password: 'password123'
      }) as Request;
      const res = createMockResponse() as Response;

      // Mock storage.find to return empty array (email undefined won't match)
      vi.mocked(storageModule.storage.find).mockResolvedValue([]);

      await loginHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalled();
    });
  });

  // ===== TC-AUTH-005: Login with Missing Password =====
  describe('TC-AUTH-005: Login with Missing Password', () => {
    it('should handle missing password gracefully', async () => {
      const req = createMockRequest({
        email: 'student@hcmut.edu.vn'
      }) as Request;
      const res = createMockResponse() as Response;

      // Mock storage.find to return user
      vi.mocked(storageModule.storage.find).mockResolvedValue([mockStudent]);
      
      // Mock password comparison to return false (undefined password)
      vi.mocked(utilsModule.comparePassword).mockResolvedValue(false);

      await loginHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalled();
    });
  });

  // ===== TC-AUTH-006: Successful Registration =====
  describe('TC-AUTH-006: Successful Registration', () => {
    it('should register new user successfully', async () => {
      const req = createMockRequest({
        email: 'newstudent@hcmut.edu.vn',
        password: 'password123',
        name: 'New Student',
        hcmutId: 'B20XXXXX',
        role: 'student',
        major: 'Computer Science',
        year: 2
      }) as Request;
      const res = createMockResponse() as Response;

      // Mock storage.find to return empty (email doesn't exist)
      vi.mocked(storageModule.storage.find).mockResolvedValue([]);
      
      // Mock password hashing
      vi.mocked(utilsModule.hashPassword).mockResolvedValue('$2a$10$hashedpassword');
      
      // Mock storage.create
      vi.mocked(storageModule.storage.create).mockResolvedValue(mockStudent);
      
      // Mock token generation
      vi.mocked(utilsModule.generateToken).mockReturnValue('mock_access_token');
      vi.mocked(utilsModule.generateRefreshToken).mockReturnValue('mock_refresh_token');

      await registerHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(true);
      expect(responseData.data).toHaveProperty('user');
      expect(responseData.data).toHaveProperty('token');
      expect(responseData.data).toHaveProperty('refreshToken');
      expect(storageModule.storage.create).toHaveBeenCalled();
    });
  });

  // ===== TC-AUTH-007: Registration with Duplicate Email =====
  describe('TC-AUTH-007: Registration with Duplicate Email', () => {
    it('should return 400 when email already exists', async () => {
      const req = createMockRequest({
        email: 'existing@hcmut.edu.vn',
        password: 'password123',
        name: 'Duplicate User',
        hcmutId: 'B20YYYYY',
        role: 'student'
      }) as Request;
      const res = createMockResponse() as Response;

      // Mock storage.find to return existing user
      vi.mocked(storageModule.storage.find).mockResolvedValue([mockStudent]);

      await registerHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Email đã được sử dụng');
    });
  });

  // ===== TC-AUTH-008: Get Current User (Me) =====
  describe('TC-AUTH-008: Get Current User (Me)', () => {
    it('should return current user information', async () => {
      const req = createMockAuthRequest({
        userId: mockStudent.id,
        email: mockStudent.email,
        role: mockStudent.role,
        hcmutId: mockStudent.hcmutId
      }) as AuthRequest;
      const res = createMockResponse() as Response;

      // Mock storage.findById
      vi.mocked(storageModule.storage.findById).mockResolvedValue(mockStudent);

      await meHandler(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(true);
      expect(responseData.data).not.toHaveProperty('password');
      expect(responseData.data.id).toBe(mockStudent.id);
    });
  });

  // ===== TC-AUTH-009: Get Current User without Token =====
  describe('TC-AUTH-009: Get Current User without Token', () => {
    it('should return 401 when no user in request', async () => {
      const req = createMockAuthRequest() as AuthRequest;
      const res = createMockResponse() as Response;

      await meHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Chưa xác thực');
    });
  });

  // ===== TC-AUTH-010: Get Current User with Invalid Token =====
  describe('TC-AUTH-010: Get Current User with Invalid Token', () => {
    it('should return 401 when token is invalid', async () => {
      const req = createMockRequest({}, {
        authorization: 'Bearer invalid_token_12345'
      }) as Request;
      const res = createMockResponse() as Response;
      const next = vi.fn();

      // Mock extractToken to return token
      vi.mocked(utilsModule.extractToken).mockReturnValue('invalid_token_12345');
      
      // Mock verifyToken to return null (invalid)
      vi.mocked(utilsModule.verifyToken).mockReturnValue(null);

      await authenticate(req as AuthRequest, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  // ===== TC-AUTH-011: Refresh Token =====
  describe('TC-AUTH-011: Refresh Token', () => {
    it('should refresh token successfully', async () => {
      const mockPayload = {
        userId: mockStudent.id,
        email: mockStudent.email,
        role: mockStudent.role,
        hcmutId: mockStudent.hcmutId
      };

      const req = createMockRequest({
        refreshToken: 'valid_refresh_token'
      }) as Request;
      const res = createMockResponse() as Response;

      // Mock verifyToken to return payload
      vi.mocked(utilsModule.verifyToken).mockReturnValue(mockPayload);
      
      // Mock token generation
      vi.mocked(utilsModule.generateToken).mockReturnValue('new_access_token');
      vi.mocked(utilsModule.generateRefreshToken).mockReturnValue('new_refresh_token');

      await refreshTokenHandler(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(true);
      expect(responseData.data).toHaveProperty('token');
      expect(responseData.data).toHaveProperty('refreshToken');
    });
  });

  // ===== TC-AUTH-012: Refresh Token with Invalid Token =====
  describe('TC-AUTH-012: Refresh Token with Invalid Token', () => {
    it('should return 401 when refresh token is invalid', async () => {
      const req = createMockRequest({
        refreshToken: 'invalid_refresh_token'
      }) as Request;
      const res = createMockResponse() as Response;

      // Mock verifyToken to return null (invalid)
      vi.mocked(utilsModule.verifyToken).mockReturnValue(null);

      await refreshTokenHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Refresh token không hợp lệ');
    });
  });

  // ===== TC-AUTH-013: Logout =====
  describe('TC-AUTH-013: Logout', () => {
    it('should logout successfully', async () => {
      const req = createMockAuthRequest({
        userId: mockStudent.id,
        email: mockStudent.email,
        role: mockStudent.role,
        hcmutId: mockStudent.hcmutId
      }) as AuthRequest;
      const res = createMockResponse() as Response;

      await logoutHandler(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(true);
      expect(responseData.message).toContain('Đăng xuất thành công');
    });
  });

  // ===== TC-AUTH-014: Login with Different User Roles =====
  describe('TC-AUTH-014: Login with Different User Roles', () => {
    it('should login student successfully', async () => {
      const req = createMockRequest({
        email: '2051606@hcmut.edu.vn',
        password: 'password123'
      }) as Request;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.find).mockResolvedValue([mockStudent]);
      vi.mocked(utilsModule.comparePassword).mockResolvedValue(true);
      vi.mocked(utilsModule.generateToken).mockReturnValue('student_token');
      vi.mocked(utilsModule.generateRefreshToken).mockReturnValue('student_refresh');

      await loginHandler(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.data.user.role).toBe(UserRole.STUDENT);
    });

    it('should login tutor successfully', async () => {
      const req = createMockRequest({
        email: 'tutor@hcmut.edu.vn',
        password: 'password123'
      }) as Request;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.find).mockResolvedValue([mockTutor]);
      vi.mocked(utilsModule.comparePassword).mockResolvedValue(true);
      vi.mocked(utilsModule.generateToken).mockReturnValue('tutor_token');
      vi.mocked(utilsModule.generateRefreshToken).mockReturnValue('tutor_refresh');

      await loginHandler(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.data.user.role).toBe(UserRole.TUTOR);
    });

    it('should login management successfully', async () => {
      const req = createMockRequest({
        email: 'admin.2@hcmut.edu.vn',
        password: 'admin123'
      }) as Request;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.find).mockResolvedValue([mockManagement]);
      vi.mocked(utilsModule.comparePassword).mockResolvedValue(true);
      vi.mocked(utilsModule.generateToken).mockReturnValue('management_token');
      vi.mocked(utilsModule.generateRefreshToken).mockReturnValue('management_refresh');

      await loginHandler(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.data.user.role).toBe(UserRole.MANAGEMENT);
    });
  });

  // ===== TC-AUTH-015: Token Expiration Handling =====
  describe('TC-AUTH-015: Token Expiration Handling', () => {
    it('should return 401 for expired token', async () => {
      const req = createMockRequest({}, {
        authorization: 'Bearer expired_token'
      }) as Request;
      const res = createMockResponse() as Response;
      const next = vi.fn();

      vi.mocked(utilsModule.extractToken).mockReturnValue('expired_token');
      vi.mocked(utilsModule.verifyToken).mockReturnValue(null); // Expired token returns null

      await authenticate(req as AuthRequest, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should generate new token from valid refresh token', async () => {
      const mockPayload = {
        userId: mockStudent.id,
        email: mockStudent.email,
        role: mockStudent.role,
        hcmutId: mockStudent.hcmutId
      };

      const req = createMockRequest({
        refreshToken: 'valid_refresh_token'
      }) as Request;
      const res = createMockResponse() as Response;

      vi.mocked(utilsModule.verifyToken).mockReturnValue(mockPayload);
      vi.mocked(utilsModule.generateToken).mockReturnValue('new_access_token');
      vi.mocked(utilsModule.generateRefreshToken).mockReturnValue('new_refresh_token');

      await refreshTokenHandler(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(true);
      expect(responseData.data.token).toBe('new_access_token');
    });
  });

  // ===== Additional Edge Cases =====
  describe('Additional Edge Cases', () => {
    it('should handle missing refreshToken in refresh request', async () => {
      const req = createMockRequest({}) as Request;
      const res = createMockResponse() as Response;

      await refreshTokenHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.error).toContain('Refresh token bị thiếu');
    });

    it('should handle authentication middleware with no authorization header', async () => {
      const req = createMockRequest({}, {}) as Request;
      const res = createMockResponse() as Response;
      const next = vi.fn();

      vi.mocked(utilsModule.extractToken).mockReturnValue(null);

      await authenticate(req as AuthRequest, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle server errors gracefully', async () => {
      const req = createMockRequest({
        email: 'student@hcmut.edu.vn',
        password: 'password123'
      }) as Request;
      const res = createMockResponse() as Response;

      // Mock storage.find to throw error
      vi.mocked(storageModule.storage.find).mockRejectedValue(new Error('Database error'));

      await loginHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Lỗi đăng nhập');
    });
  });
});

