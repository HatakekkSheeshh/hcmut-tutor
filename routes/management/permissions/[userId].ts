/**
 * Management User Permissions Detail APIs
 * GET /api/management/permissions/users/:id - Get user permissions
 * PUT /api/management/permissions/users/:id - Update user permissions
 * POST /api/management/permissions/users/:id/revoke - Revoke permissions
 * POST /api/management/permissions/users/:id/temporary - Grant temporary permissions
 */

import { Response } from 'express';
import { storage } from '../../../lib/storage.js';
import { 
  User, 
  UserRole,
  Management,
  PermissionAudit,
  Notification,
  NotificationType
} from '../../../lib/types.js';
import { AuthRequest } from '../../../lib/middleware.js';
import { successResponse, errorResponse, generateId, now } from '../../../lib/utils.js';

/**
 * GET /api/management/permissions/users/:id
 */
export async function getUserPermissionsHandler(req: AuthRequest, res: Response) {
  try {
    const { id: userId } = req.params;
    const currentUser = req.user!;

    // Only management can view user permissions
    if (currentUser.role !== UserRole.MANAGEMENT) {
      return res.status(403).json(errorResponse('Bạn không có quyền truy cập'));
    }

    // Check if user has manage_users permission
    const managementUser = await storage.findById<Management>('users.json', currentUser.userId);
    if (!managementUser || !managementUser.permissions?.includes('manage_users')) {
      return res.status(403).json(errorResponse('Bạn không có quyền quản lý người dùng'));
    }

    const user = await storage.findById<User>('users.json', userId);
    if (!user) {
      return res.status(404).json(errorResponse('Không tìm thấy người dùng'));
    }

    // Get permissions (only for management users)
    const permissions = user.role === UserRole.MANAGEMENT 
      ? (user as Management).permissions || []
      : [];

    // Get permission audit log
    const auditLogs = await storage.find<PermissionAudit>('permissions-audit.json',
      (log) => log.userId === userId
    );

    // Sort by createdAt (newest first)
    auditLogs.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Get actor names for audit logs
    const actorIds = auditLogs.map(log => log.actorId);
    const actorsMap = await storage.findByIds<User>('users.json', actorIds);

    const enrichedAuditLogs = auditLogs.map(log => {
      const actor = actorsMap.get(log.actorId);
      return {
        ...log,
        actor: actor ? {
          id: actor.id,
          name: actor.name,
          email: actor.email
        } : null
      };
    });

    return res.json(successResponse({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        hcmutId: user.hcmutId,
        role: user.role,
        avatar: user.avatar
      },
      permissions: permissions,
      auditLogs: enrichedAuditLogs
    }));
  } catch (error: any) {
    console.error('Get user permissions error:', error);
    return res.status(500).json(
      errorResponse('Lỗi lấy thông tin quyền: ' + error.message)
    );
  }
}

/**
 * PUT /api/management/permissions/users/:id
 */
export async function updateUserPermissionsHandler(req: AuthRequest, res: Response) {
  try {
    const { id: userId } = req.params;
    const { permissions, reason } = req.body;
    const currentUser = req.user!;

    // Only management can update permissions
    if (currentUser.role !== UserRole.MANAGEMENT) {
      return res.status(403).json(errorResponse('Bạn không có quyền cập nhật quyền'));
    }

    // Check if user has manage_users permission
    const managementUser = await storage.findById<Management>('users.json', currentUser.userId);
    if (!managementUser || !managementUser.permissions?.includes('manage_users')) {
      return res.status(403).json(errorResponse('Bạn không có quyền quản lý người dùng'));
    }

    const user = await storage.findById<User>('users.json', userId);
    if (!user) {
      return res.status(404).json(errorResponse('Không tìm thấy người dùng'));
    }

    // Only management users can have permissions
    if (user.role !== UserRole.MANAGEMENT) {
      return res.status(400).json(errorResponse('Chỉ người dùng management mới có thể có permissions'));
    }

    const managementUserToUpdate = user as Management;
    const previousPermissions = [...(managementUserToUpdate.permissions || [])];

    // Update user permissions
    const updatedUser = await storage.update<Management>('users.json', userId, {
      permissions: permissions,
      updatedAt: now()
    });

    // Create audit log
    const auditLog: PermissionAudit = {
      id: generateId('audit'),
      userId: userId,
      action: 'update',
      permissions: permissions,
      previousPermissions: previousPermissions,
      actorId: currentUser.userId,
      reason: reason,
      createdAt: now()
    };

    await storage.create<PermissionAudit>('permissions-audit.json', auditLog);

    // Sync with HCMUT_DATACORE (mock)
    await syncWithDatacore(userId, permissions);

    // Create notification for user
    const notification: Notification = {
      id: generateId('notif'),
      userId: userId,
      type: NotificationType.PERMISSION_CHANGED,
      title: 'Quyền đã được cập nhật',
      message: `Quyền của bạn đã được cập nhật`,
      read: false,
      link: `/management/permissions/users/${userId}`,
      metadata: {
        permissions: permissions,
        previousPermissions: previousPermissions
      },
      createdAt: now()
    };
    await storage.create<Notification>('notifications.json', notification);

    return res.json(
      successResponse(updatedUser, 'Cập nhật quyền thành công')
    );
  } catch (error: any) {
    console.error('Update user permissions error:', error);
    return res.status(500).json(
      errorResponse('Lỗi cập nhật quyền: ' + error.message)
    );
  }
}

/**
 * POST /api/management/permissions/users/:id/revoke
 */
export async function revokeUserPermissionsHandler(req: AuthRequest, res: Response) {
  try {
    const { id: userId } = req.params;
    const { permissions, reason } = req.body;
    const currentUser = req.user!;

    // Only management can revoke permissions
    if (currentUser.role !== UserRole.MANAGEMENT) {
      return res.status(403).json(errorResponse('Bạn không có quyền thu hồi quyền'));
    }

    // Check if user has manage_users permission
    const managementUser = await storage.findById<Management>('users.json', currentUser.userId);
    if (!managementUser || !managementUser.permissions?.includes('manage_users')) {
      return res.status(403).json(errorResponse('Bạn không có quyền quản lý người dùng'));
    }

    if (!reason || reason.length < 10) {
      return res.status(400).json(errorResponse('Lý do thu hồi phải có ít nhất 10 ký tự'));
    }

    const user = await storage.findById<User>('users.json', userId);
    if (!user) {
      return res.status(404).json(errorResponse('Không tìm thấy người dùng'));
    }

    if (user.role !== UserRole.MANAGEMENT) {
      return res.status(400).json(errorResponse('Chỉ người dùng management mới có thể có permissions'));
    }

    const managementUserToUpdate = user as Management;
    const previousPermissions = [...(managementUserToUpdate.permissions || [])];
    const updatedPermissions = previousPermissions.filter(p => !permissions.includes(p));

    // Update user permissions
    const updatedUser = await storage.update<Management>('users.json', userId, {
      permissions: updatedPermissions,
      updatedAt: now()
    });

    // Create audit log
    const auditLog: PermissionAudit = {
      id: generateId('audit'),
      userId: userId,
      action: 'revoke',
      permissions: permissions,
      previousPermissions: previousPermissions,
      actorId: currentUser.userId,
      reason: reason,
      createdAt: now()
    };

    await storage.create<PermissionAudit>('permissions-audit.json', auditLog);

    // Sync with HCMUT_DATACORE (mock)
    await syncWithDatacore(userId, updatedPermissions);

    // Create notification for user
    const notification: Notification = {
      id: generateId('notif'),
      userId: userId,
      type: NotificationType.PERMISSION_CHANGED,
      title: 'Quyền đã bị thu hồi',
      message: `Các quyền sau đã bị thu hồi: ${permissions.join(', ')}. Lý do: ${reason}`,
      read: false,
      link: `/management/permissions/users/${userId}`,
      metadata: {
        revokedPermissions: permissions,
        reason: reason
      },
      createdAt: now()
    };
    await storage.create<Notification>('notifications.json', notification);

    return res.json(
      successResponse(updatedUser, 'Thu hồi quyền thành công')
    );
  } catch (error: any) {
    console.error('Revoke user permissions error:', error);
    return res.status(500).json(
      errorResponse('Lỗi thu hồi quyền: ' + error.message)
    );
  }
}

/**
 * POST /api/management/permissions/users/:id/temporary
 */
export async function grantTemporaryPermissionsHandler(req: AuthRequest, res: Response) {
  try {
    const { id: userId } = req.params;
    const { permissions, expiresAt, reason } = req.body;
    const currentUser = req.user!;

    // Only management can grant temporary permissions
    if (currentUser.role !== UserRole.MANAGEMENT) {
      return res.status(403).json(errorResponse('Bạn không có quyền cấp quyền tạm thời'));
    }

    // Check if user has manage_users permission
    const managementUser = await storage.findById<Management>('users.json', currentUser.userId);
    if (!managementUser || !managementUser.permissions?.includes('manage_users')) {
      return res.status(403).json(errorResponse('Bạn không có quyền quản lý người dùng'));
    }

    if (!reason || reason.length < 10) {
      return res.status(400).json(errorResponse('Lý do cấp quyền tạm thời phải có ít nhất 10 ký tự'));
    }

    const user = await storage.findById<User>('users.json', userId);
    if (!user) {
      return res.status(404).json(errorResponse('Không tìm thấy người dùng'));
    }

    if (user.role !== UserRole.MANAGEMENT) {
      return res.status(400).json(errorResponse('Chỉ người dùng management mới có thể có permissions'));
    }

    const managementUserToUpdate = user as Management;
    const previousPermissions = [...(managementUserToUpdate.permissions || [])];
    const updatedPermissions = [...new Set([...previousPermissions, ...permissions])];

    // Update user permissions
    const updatedUser = await storage.update<Management>('users.json', userId, {
      permissions: updatedPermissions,
      updatedAt: now()
    });

    // Create audit log
    const auditLog: PermissionAudit = {
      id: generateId('audit'),
      userId: userId,
      action: 'grant',
      permissions: permissions,
      previousPermissions: previousPermissions,
      actorId: currentUser.userId,
      reason: reason,
      temporary: true,
      expiresAt: expiresAt,
      createdAt: now()
    };

    await storage.create<PermissionAudit>('permissions-audit.json', auditLog);

    // Sync with HCMUT_DATACORE (mock)
    await syncWithDatacore(userId, updatedPermissions);

    // Create notification for user
    const notification: Notification = {
      id: generateId('notif'),
      userId: userId,
      type: NotificationType.PERMISSION_CHANGED,
      title: 'Quyền tạm thời đã được cấp',
      message: `Các quyền tạm thời sau đã được cấp: ${permissions.join(', ')}. Hết hạn: ${new Date(expiresAt).toLocaleString('vi-VN')}`,
      read: false,
      link: `/management/permissions/users/${userId}`,
      metadata: {
        temporaryPermissions: permissions,
        expiresAt: expiresAt,
        reason: reason
      },
      createdAt: now()
    };
    await storage.create<Notification>('notifications.json', notification);

    return res.json(
      successResponse(updatedUser, 'Cấp quyền tạm thời thành công')
    );
  } catch (error: any) {
    console.error('Grant temporary permissions error:', error);
    return res.status(500).json(
      errorResponse('Lỗi cấp quyền tạm thời: ' + error.message)
    );
  }
}

// ===== HELPER FUNCTIONS =====

/**
 * Sync permissions with HCMUT_DATACORE (mock)
 */
async function syncWithDatacore(userId: string, permissions: string[]): Promise<void> {
  // Mock sync with HCMUT_DATACORE
  // In production, this would make an API call to HCMUT_DATACORE
  console.log(`Syncing permissions for user ${userId} with HCMUT_DATACORE:`, permissions);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // In real implementation, this would:
  // 1. Call HCMUT_DATACORE API to update user permissions
  // 2. Handle errors and retries
  // 3. Log sync status
}

