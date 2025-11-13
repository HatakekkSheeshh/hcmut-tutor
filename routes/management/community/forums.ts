/**
 * Management Community Forum APIs
 * GET /api/management/community/forums - List forums
 * POST /api/management/community/forums - Create forum
 * PUT /api/management/community/forums/:id - Update forum
 * DELETE /api/management/community/forums/:id - Delete forum
 * POST /api/management/community/forums/:id/pin - Pin forum
 * POST /api/management/community/forums/:id/lock - Lock forum
 */

import { Response } from 'express';
import { storage } from '../../../lib/storage.js';
import { 
  User, 
  UserRole,
  Management,
  ForumPost
} from '../../../lib/types.js';
import { AuthRequest } from '../../../lib/middleware.js';
import { successResponse, errorResponse } from '../../../lib/utils.js';
import {
  pinForumPost,
  unpinForumPost,
  lockForumPost,
  unlockForumPost
} from '../../../lib/services/communityManager.js';

/**
 * GET /api/management/community/forums
 */
export async function listForumsHandler(req: AuthRequest, res: Response) {
  try {
    const currentUser = req.user!;
    
    // Only management can list forums
    if (currentUser.role !== UserRole.MANAGEMENT) {
      return res.status(403).json(errorResponse('Bạn không có quyền truy cập'));
    }

    // Check permissions
    const managementUser = await storage.findById<Management>('users.json', currentUser.userId);
    if (!managementUser || !managementUser.permissions?.includes('manage_community')) {
      return res.status(403).json(errorResponse('Bạn không có quyền quản lý cộng đồng'));
    }

    const { category, pinned, locked, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    let posts = await storage.read<ForumPost>('forum-posts.json');

    // Filter by category
    if (category) {
      posts = posts.filter(p => p.category === category);
    }

    // Filter by pinned
    if (pinned !== undefined) {
      posts = posts.filter(p => p.pinned === (pinned === 'true'));
    }

    // Filter by locked
    if (locked !== undefined) {
      posts = posts.filter(p => p.locked === (locked === 'true'));
    }

    // Sort: pinned first, then by createdAt
    posts.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Pagination
    const total = posts.length;
    const totalPages = Math.ceil(total / limitNum);
    const start = (pageNum - 1) * limitNum;
    const end = start + limitNum;
    const paginatedData = posts.slice(start, end);

    // Get author info
    const authorIds = Array.from(new Set(paginatedData.map(p => p.authorId)));
    const authorsMap = await storage.findByIds<User>('users.json', authorIds);

    const enrichedData = paginatedData.map(post => {
      const author = authorsMap.get(post.authorId);
      return {
        ...post,
        author: author ? {
          id: author.id,
          name: author.name,
          email: author.email,
          avatar: author.avatar
        } : null
      };
    });

    return res.json(successResponse({
      data: enrichedData,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages
      }
    }));
  } catch (error: any) {
    console.error('List forums error:', error);
    return res.status(500).json(
      errorResponse('Lỗi lấy danh sách forums: ' + error.message)
    );
  }
}

/**
 * POST /api/management/community/forums
 */
export async function createForumHandler(req: AuthRequest, res: Response) {
  try {
    const currentUser = req.user!;
    
    // Only management can create forums
    if (currentUser.role !== UserRole.MANAGEMENT) {
      return res.status(403).json(errorResponse('Bạn không có quyền tạo forum'));
    }

    // Check permissions
    const managementUser = await storage.findById<Management>('users.json', currentUser.userId);
    if (!managementUser || !managementUser.permissions?.includes('manage_community')) {
      return res.status(403).json(errorResponse('Bạn không có quyền tạo forum'));
    }

    // Use existing forum post creation logic
    // This is handled by routes/forum/posts.ts createPostHandler
    // But we can create a management-specific forum here if needed
    return res.status(501).json(errorResponse('Use /api/forum/posts to create forum posts'));
  } catch (error: any) {
    console.error('Create forum error:', error);
    return res.status(500).json(
      errorResponse('Lỗi tạo forum: ' + error.message)
    );
  }
}

/**
 * PUT /api/management/community/forums/:id
 */
export async function updateForumHandler(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    // Only management can update forums
    if (currentUser.role !== UserRole.MANAGEMENT) {
      return res.status(403).json(errorResponse('Bạn không có quyền cập nhật forum'));
    }

    // Check permissions
    const managementUser = await storage.findById<Management>('users.json', currentUser.userId);
    if (!managementUser || !managementUser.permissions?.includes('manage_community')) {
      return res.status(403).json(errorResponse('Bạn không có quyền cập nhật forum'));
    }

    const post = await storage.findById<ForumPost>('forum-posts.json', id);
    if (!post) {
      return res.status(404).json(errorResponse('Không tìm thấy forum post'));
    }

    const { title, content, category, tags, pinned, locked } = req.body;

    const updatedPost = await storage.update<ForumPost>('forum-posts.json', id, {
      title: title || post.title,
      content: content || post.content,
      category: category || post.category,
      tags: tags || post.tags,
      pinned: pinned !== undefined ? pinned : post.pinned,
      locked: locked !== undefined ? locked : post.locked,
      updatedAt: new Date().toISOString()
    });

    return res.json(
      successResponse(updatedPost, 'Cập nhật forum thành công')
    );
  } catch (error: any) {
    console.error('Update forum error:', error);
    return res.status(500).json(
      errorResponse('Lỗi cập nhật forum: ' + error.message)
    );
  }
}

/**
 * DELETE /api/management/community/forums/:id
 */
export async function deleteForumHandler(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    // Only management can delete forums
    if (currentUser.role !== UserRole.MANAGEMENT) {
      return res.status(403).json(errorResponse('Bạn không có quyền xóa forum'));
    }

    // Check permissions
    const managementUser = await storage.findById<Management>('users.json', currentUser.userId);
    if (!managementUser || !managementUser.permissions?.includes('manage_community')) {
      return res.status(403).json(errorResponse('Bạn không có quyền xóa forum'));
    }

    const post = await storage.findById<ForumPost>('forum-posts.json', id);
    if (!post) {
      return res.status(404).json(errorResponse('Không tìm thấy forum post'));
    }

    // Delete post
    await storage.delete('forum-posts.json', id);

    // Delete comments
    const comments = await storage.find('forum-comments.json',
      (c: any) => c.postId === id
    );
    for (const comment of comments) {
      await storage.delete('forum-comments.json', comment.id);
    }

    return res.json(
      successResponse(null, 'Xóa forum thành công')
    );
  } catch (error: any) {
    console.error('Delete forum error:', error);
    return res.status(500).json(
      errorResponse('Lỗi xóa forum: ' + error.message)
    );
  }
}

/**
 * POST /api/management/community/forums/:id/pin
 */
export async function pinForumHandler(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    // Only management can pin forums
    if (currentUser.role !== UserRole.MANAGEMENT) {
      return res.status(403).json(errorResponse('Bạn không có quyền pin forum'));
    }

    // Check permissions
    const managementUser = await storage.findById<Management>('users.json', currentUser.userId);
    if (!managementUser || !managementUser.permissions?.includes('manage_community')) {
      return res.status(403).json(errorResponse('Bạn không có quyền pin forum'));
    }

    const { action } = req.body || {}; // 'pin' or 'unpin'

    let updatedPost: ForumPost;
    if (action === 'unpin') {
      updatedPost = await unpinForumPost(id, currentUser.userId);
    } else {
      updatedPost = await pinForumPost(id, currentUser.userId);
    }

    return res.json(
      successResponse(updatedPost, `${action === 'unpin' ? 'Unpin' : 'Pin'} forum thành công`)
    );
  } catch (error: any) {
    console.error('Pin forum error:', error);
    return res.status(500).json(
      errorResponse('Lỗi pin forum: ' + error.message)
    );
  }
}

/**
 * POST /api/management/community/forums/:id/lock
 */
export async function lockForumHandler(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    // Only management can lock forums
    if (currentUser.role !== UserRole.MANAGEMENT) {
      return res.status(403).json(errorResponse('Bạn không có quyền lock forum'));
    }

    // Check permissions
    const managementUser = await storage.findById<Management>('users.json', currentUser.userId);
    if (!managementUser || !managementUser.permissions?.includes('manage_community')) {
      return res.status(403).json(errorResponse('Bạn không có quyền lock forum'));
    }

    const { action } = req.body || {}; // 'lock' or 'unlock'

    let updatedPost: ForumPost;
    if (action === 'unlock') {
      updatedPost = await unlockForumPost(id, currentUser.userId);
    } else {
      updatedPost = await lockForumPost(id, currentUser.userId);
    }

    return res.json(
      successResponse(updatedPost, `${action === 'unlock' ? 'Unlock' : 'Lock'} forum thành công`)
    );
  } catch (error: any) {
    console.error('Lock forum error:', error);
    return res.status(500).json(
      errorResponse('Lỗi lock forum: ' + error.message)
    );
  }
}

