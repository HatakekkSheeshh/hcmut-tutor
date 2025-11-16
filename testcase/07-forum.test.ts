/**
 * Unit Tests for Forum APIs
 * Based on test cases from 07-forum.md
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { Response } from 'express';
import { listPostsHandler, createPostHandler, getPostHandler, updatePostHandler, deletePostHandler, likePostHandler } from '../routes/forum/posts.js';
import { getCommentsHandler, createCommentHandler, deleteCommentHandler } from '../routes/forum/comments.js';
import * as storageModule from '../lib/storage.js';
import { ForumPost, ForumComment, UserRole } from '../lib/types.js';
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

const mockPost: ForumPost = {
  id: 'post_abc123',
  authorId: 'stu_abc123',
  title: 'Question about Calculus',
  content: 'I need help with derivatives...',
  category: 'Mathematics',
  tags: ['calculus', 'help'],
  likes: [],
  views: 0,
  pinned: false,
  locked: false,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
};

const mockComment: ForumComment = {
  id: 'comment_abc123',
  postId: 'post_abc123',
  authorId: 'tut_xyz789',
  content: 'Great question! Here\'s my answer...',
  likes: [],
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

describe('Forum API Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ===== TC-FORUM-001: List Forum Posts =====
  describe('TC-FORUM-001: List Forum Posts', () => {
    it('should list posts with filters', async () => {
      const req = createMockAuthRequest(
        { userId: 'stu_abc123', role: UserRole.STUDENT },
        {},
        {},
        { page: '1', limit: '10', category: 'Mathematics' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.paginate).mockResolvedValue({
        data: [mockPost],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
      });

      await listPostsHandler(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(true);
      expect(responseData.data).toBeInstanceOf(Array);
    });
  });

  // ===== TC-FORUM-002: Create Forum Post =====
  describe('TC-FORUM-002: Create Forum Post', () => {
    it('should create post successfully', async () => {
      const req = createMockAuthRequest(
        { userId: 'stu_abc123', role: UserRole.STUDENT },
        {
          title: 'Question about Calculus',
          content: 'I need help with derivatives...',
          category: 'Mathematics',
          tags: ['calculus', 'help']
        }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.create).mockResolvedValue(mockPost);

      await createPostHandler(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(true);
    });
  });

  // ===== TC-FORUM-003: Get Post by ID =====
  describe('TC-FORUM-003: Get Post by ID', () => {
    it('should get post by ID', async () => {
      const req = createMockAuthRequest(
        {},
        {},
        { id: 'post_abc123' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.findById).mockResolvedValue(mockPost);

      await getPostHandler(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(true);
    });
  });

  // ===== TC-FORUM-004: Update Post =====
  describe('TC-FORUM-004: Update Post', () => {
    it('should update post successfully', async () => {
      const req = createMockAuthRequest(
        { userId: 'stu_abc123', role: UserRole.STUDENT },
        {
          title: 'Updated Title',
          content: 'Updated content'
        },
        { id: 'post_abc123' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      const updatedPost = {
        ...mockPost,
        title: 'Updated Title',
        content: 'Updated content',
        updatedAt: '2025-01-02T00:00:00Z'
      };

      vi.mocked(storageModule.storage.findById).mockResolvedValue(mockPost);
      vi.mocked(storageModule.storage.update).mockResolvedValue(updatedPost);

      await updatePostHandler(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(true);
    });
  });

  // ===== TC-FORUM-005: Update Post as Non-Author =====
  describe('TC-FORUM-005: Update Post as Non-Author', () => {
    it('should return 403 for non-author', async () => {
      const req = createMockAuthRequest(
        { userId: 'stu_other', role: UserRole.STUDENT },
        { title: 'Updated Title' },
        { id: 'post_abc123' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.findById).mockResolvedValue(mockPost);

      await updatePostHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  // ===== TC-FORUM-007: Like Post =====
  describe('TC-FORUM-007: Like Post', () => {
    it('should like post successfully', async () => {
      const req = createMockAuthRequest(
        { userId: 'stu_abc123', role: UserRole.STUDENT },
        {},
        { id: 'post_abc123' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      const likedPost = {
        ...mockPost,
        likes: ['stu_abc123']
      };

      vi.mocked(storageModule.storage.findById).mockResolvedValue(mockPost);
      vi.mocked(storageModule.storage.update).mockResolvedValue(likedPost);

      await likePostHandler(req, res);

      expect(res.json).toHaveBeenCalled();
    });
  });

  // ===== TC-FORUM-010: Create Comment =====
  describe('TC-FORUM-010: Create Comment', () => {
    it('should create comment successfully', async () => {
      const req = createMockAuthRequest(
        { userId: 'tut_xyz789', role: UserRole.TUTOR },
        {
          content: 'Great question! Here\'s my answer...'
        },
        { id: 'post_abc123' }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      vi.mocked(storageModule.storage.findById).mockResolvedValue(mockPost);
      vi.mocked(storageModule.storage.create).mockResolvedValue(mockComment);

      await createCommentHandler(req, res);

      expect(res.json).toHaveBeenCalled();
      const responseData = vi.mocked(res.json).mock.calls[0][0];
      expect(responseData.success).toBe(true);
    });
  });

  // ===== TC-FORUM-014: Post Validation =====
  describe('TC-FORUM-014: Post Validation', () => {
    it('should return 400 for invalid post data', async () => {
      const req = createMockAuthRequest(
        { userId: 'stu_abc123', role: UserRole.STUDENT },
        {
          title: '',
          content: ''
        }
      ) as AuthRequest;
      const res = createMockResponse() as Response;

      await createPostHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});

