/**
 * Management User Permissions APIs
 * GET /api/management/permissions/users - List users with permissions
 */

import { Response } from 'express';
import { storage } from '../../../lib/storage.js';
import { 
  User, 
  UserRole,
  Management,
  PermissionAudit
} from '../../../lib/types.js';
import { AuthRequest } from '../../../lib/middleware.js';
import { successResponse, errorResponse } from '../../../lib/utils.js';

/**
 * GET /api/management/permissions/users
 * List users with their permissions
 */
export async function listUsersWithPermissionsHandler(req: AuthRequest, res: Response) {
  try {
    const currentUser = req.user!;
    
    // Only management can list users with permissions
    if (currentUser.role !== UserRole.MANAGEMENT) {
      return res.status(403).json(errorResponse('Bạn không có quyền truy cập'));
    }

    // Check if user has manage_users permission
    const managementUser = await storage.findById<Management>('users.json', currentUser.userId);
    if (!managementUser || !managementUser.permissions?.includes('manage_users')) {
      return res.status(403).json(errorResponse('Bạn không có quyền quản lý người dùng'));
    }

    const { role, search, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    // Read all users
    let users = await storage.read<User>('users.json');

    // Filter by role if provided
    if (role) {
      users = users.filter(u => u.role === role);
    }

    // Filter by search if provided
    if (search) {
      const searchLower = (search as string).toLowerCase();
      users = users.filter(u => 
        u.name.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower) ||
        u.hcmutId.toLowerCase().includes(searchLower)
      );
    }

    // Sort by createdAt (newest first)
    users.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Pagination
    const total = users.length;
    const totalPages = Math.ceil(total / limitNum);
    const start = (pageNum - 1) * limitNum;
    const end = start + limitNum;
    const paginatedData = users.slice(start, end);

    // Enrich with permissions
    const enrichedData = paginatedData.map(user => {
      const permissions = user.role === UserRole.MANAGEMENT 
        ? (user as Management).permissions || []
        : [];

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        hcmutId: user.hcmutId,
        role: user.role,
        avatar: user.avatar,
        permissions: permissions,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
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
    console.error('List users with permissions error:', error);
    return res.status(500).json(
      errorResponse('Lỗi lấy danh sách người dùng: ' + error.message)
    );
  }
}

