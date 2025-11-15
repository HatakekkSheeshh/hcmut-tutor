/**
 * Forum Posts APIs
 * GET /api/forum/posts - List posts
 * POST /api/forum/posts - Create post
 * GET /api/forum/posts/:id - Get post detail
 * PUT /api/forum/posts/:id - Update post
 * DELETE /api/forum/posts/:id - Delete post
 * POST /api/forum/posts/:id/like - Like/unlike post
 */

import { Response } from 'express';
import { storage } from '../../lib/storage.js';
import { ForumPost } from '../../lib/types.js';
import { AuthRequest } from '../../lib/middleware.js';
import { successResponse, errorResponse, generateId, now } from '../../lib/utils.js';

/**
 * GET /api/forum/posts
 */
export async function listPostsHandler(req: AuthRequest, res: Response) {
  try {
    const { category, search, page = '1', limit = '10', status } = req.query;
    const currentUser = req.user;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const filter = (post: ForumPost) => {
      // Only show approved posts to regular users
      // Managers can see all posts or filter by status
      if (currentUser?.role !== 'management') {
        // If post has no status, treat it as approved (for backward compatibility)
        if (post.status && post.status !== 'approved') return false;
      } else {
        // Manager can filter by status if provided
        if (status && status !== 'all') {
          // If filtering by specific status, only show posts with that status
          if (post.status !== status) return false;
        }
        // If no status filter or 'all', show all (including pending and posts without status)
      }
      
      if (category && post.category !== category) return false;
      
      if (search) {
        const searchLower = (search as string).toLowerCase();
        return (
          post.title.toLowerCase().includes(searchLower) ||
          post.content.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    };

    const result = await storage.paginate<ForumPost>(
      'forum-posts.json',
      pageNum,
      limitNum,
      filter
    );

    return res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error: any) {
    return res.status(500).json(
      errorResponse('Lỗi lấy danh sách bài viết: ' + error.message)
    );
  }
}

/**
 * POST /api/forum/posts
 */
export async function createPostHandler(req: AuthRequest, res: Response) {
  try {
    const currentUser = req.user!;
    const { title, content, category, tags } = req.body;

    const newPost: ForumPost = {
      id: generateId('post'),
      authorId: currentUser.userId,
      title,
      content,
      category,
      tags: tags || [],
      likes: [],
      views: 0,
      pinned: false,
      locked: false,
      status: 'pending', // Posts need approval before appearing
      createdAt: now(),
      updatedAt: now()
    };

    await storage.create('forum-posts.json', newPost);

    return res.status(201).json(
      successResponse(newPost, 'Tạo bài viết thành công. Bài viết đang chờ phê duyệt.')
    );
  } catch (error: any) {
    return res.status(500).json(
      errorResponse('Lỗi tạo bài viết: ' + error.message)
    );
  }
}

/**
 * GET /api/forum/posts/:id
 */
export async function getPostHandler(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const post = await storage.findById<ForumPost>('forum-posts.json', id);
    if (!post) {
      return res.status(404).json(errorResponse('Không tìm thấy bài viết'));
    }

    // Increment views
    await storage.update<ForumPost>('forum-posts.json', id, {
      views: post.views + 1
    });

    return res.json(successResponse({ ...post, views: post.views + 1 }));
  } catch (error: any) {
    return res.status(500).json(
      errorResponse('Lỗi lấy bài viết: ' + error.message)
    );
  }
}

/**
 * PUT /api/forum/posts/:id
 */
export async function updatePostHandler(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const updates = req.body;
    const currentUser = req.user!;

    const post = await storage.findById<ForumPost>('forum-posts.json', id);
    if (!post) {
      return res.status(404).json(errorResponse('Không tìm thấy bài viết'));
    }

    // Authorization: only author can update
    if (post.authorId !== currentUser.userId) {
      return res.status(403).json(
        errorResponse('Chỉ tác giả mới có thể sửa bài viết')
      );
    }

    delete updates.id;
    delete updates.authorId;
    delete updates.likes;
    delete updates.views;
    delete updates.createdAt;

    const updated = await storage.update<ForumPost>(
      'forum-posts.json',
      id,
      { ...updates, updatedAt: now() }
    );

    return res.json(successResponse(updated, 'Cập nhật bài viết thành công'));
  } catch (error: any) {
    return res.status(500).json(
      errorResponse('Lỗi cập nhật bài viết: ' + error.message)
    );
  }
}

/**
 * DELETE /api/forum/posts/:id
 */
export async function deletePostHandler(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    const post = await storage.findById<ForumPost>('forum-posts.json', id);
    if (!post) {
      return res.status(404).json(errorResponse('Không tìm thấy bài viết'));
    }

    if (post.authorId !== currentUser.userId) {
      return res.status(403).json(
        errorResponse('Chỉ tác giả mới có thể xóa bài viết')
      );
    }

    await storage.delete('forum-posts.json', id);

    return res.json(successResponse(null, 'Xóa bài viết thành công'));
  } catch (error: any) {
    return res.status(500).json(
      errorResponse('Lỗi xóa bài viết: ' + error.message)
    );
  }
}

/**
 * POST /api/forum/posts/:id/like
 */
export async function likePostHandler(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    const post = await storage.findById<ForumPost>('forum-posts.json', id);
    if (!post) {
      return res.status(404).json(errorResponse('Không tìm thấy bài viết'));
    }

    const likes = post.likes || [];
    const userIndex = likes.indexOf(currentUser.userId);

    if (userIndex > -1) {
      // Unlike
      likes.splice(userIndex, 1);
    } else {
      // Like
      likes.push(currentUser.userId);
    }

    await storage.update<ForumPost>('forum-posts.json', id, { likes });

    return res.json(
      successResponse({ liked: userIndex === -1, likesCount: likes.length })
    );
  } catch (error: any) {
    return res.status(500).json(
      errorResponse('Lỗi thích bài viết: ' + error.message)
    );
  }
}

/**
 * POST /api/forum/posts/:id/approve
 * Only management can approve posts
 */
export async function approvePostHandler(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const currentUser = req.user!;
    const { notes } = req.body;

    if (currentUser.role !== 'management') {
      return res.status(403).json(errorResponse('Chỉ management mới có quyền phê duyệt bài viết'));
    }

    const post = await storage.findById<ForumPost>('forum-posts.json', id);
    if (!post) {
      return res.status(404).json(errorResponse('Không tìm thấy bài viết'));
    }

    await storage.update<ForumPost>('forum-posts.json', id, {
      status: 'approved',
      moderationNotes: notes || '',
      moderatedBy: currentUser.userId,
      moderatedAt: now(),
      updatedAt: now()
    });

    return res.json(successResponse(null, 'Phê duyệt bài viết thành công'));
  } catch (error: any) {
    return res.status(500).json(
      errorResponse('Lỗi phê duyệt bài viết: ' + error.message)
    );
  }
}

/**
 * POST /api/forum/posts/:id/reject
 * Only management can reject posts
 */
export async function rejectPostHandler(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const currentUser = req.user!;
    const { notes } = req.body;

    if (currentUser.role !== 'management') {
      return res.status(403).json(errorResponse('Chỉ management mới có quyền từ chối bài viết'));
    }

    const post = await storage.findById<ForumPost>('forum-posts.json', id);
    if (!post) {
      return res.status(404).json(errorResponse('Không tìm thấy bài viết'));
    }

    await storage.update<ForumPost>('forum-posts.json', id, {
      status: 'rejected',
      moderationNotes: notes || '',
      moderatedBy: currentUser.userId,
      moderatedAt: now(),
      updatedAt: now()
    });

    return res.json(successResponse(null, 'Từ chối bài viết thành công'));
  } catch (error: any) {
    return res.status(500).json(
      errorResponse('Lỗi từ chối bài viết: ' + error.message)
    );
  }
}

