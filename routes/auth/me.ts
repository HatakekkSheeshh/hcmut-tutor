/**
 * GET /api/auth/me
 * Get current user info
 */

import { Response } from 'express';
import { storage } from '../../lib/storage.js';
import { successResponse, errorResponse } from '../../lib/utils.js';
import { User } from '../../lib/types.js';
import { AuthRequest } from '../../lib/middleware.js';

export async function meHandler(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json(
        errorResponse('Chưa xác thực')
      );
    }

    const user = await storage.findById<User>('users.json', req.user.userId);

    if (!user) {
      return res.status(404).json(
        errorResponse('Không tìm thấy người dùng')
      );
    }

    // Remove password
    const { password, ...userWithoutPassword } = user;

    // Ensure we return the custom ID if available, not ObjectId
    // MongoDB may return _id as id, but we want the original custom id
    const userAny = userWithoutPassword as any;
    if (userAny.id && !userAny.id.includes('_') && userAny.id.length === 24) {
      // This is ObjectId, try to find custom ID
      // Read all users to find the one with matching _id and get its custom id
      const allUsers = await storage.read<User>('users.json');
      const foundUser = allUsers.find(u => {
        const uAny = u as any;
        // Check if this user's _id matches the ObjectId, or if it has the custom id
        return uAny.id === userAny.id || 
               (uAny.id && uAny.id.includes('_') && uAny._id === userAny.id);
      });
      if (foundUser && (foundUser as any).id && (foundUser as any).id.includes('_')) {
        userAny.id = (foundUser as any).id;
      }
    }

    return res.json(
      successResponse(userWithoutPassword)
    );
  } catch (error: any) {
    console.error('Get me error:', error);
    return res.status(500).json(
      errorResponse('Lỗi lấy thông tin người dùng: ' + error.message)
    );
  }
}

