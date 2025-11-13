/**
 * Management Community APIs
 * GET /api/management/community/resources - List shared resources
 * POST /api/management/community/resources - Share resource
 * PUT /api/management/community/resources/:id/restrict - Restrict access
 * POST /api/management/community/events - Create virtual event
 */

import { Response } from 'express';
import { storage } from '../../../lib/storage.js';
import { 
  User, 
  UserRole,
  Management,
  CommunityResource,
  CommunityEvent
} from '../../../lib/types.js';
import { AuthRequest } from '../../../lib/middleware.js';
import { successResponse, errorResponse } from '../../../lib/utils.js';
import {
  shareCommunityResource,
  restrictCommunityResource,
  createCommunityEvent,
  canAccessCommunityResource,
  recordResourceView,
  recordResourceDownload,
  getCommunityActivities
} from '../../../lib/services/communityManager.js';

/**
 * GET /api/management/community/resources
 */
export async function listCommunityResourcesHandler(req: AuthRequest, res: Response) {
  try {
    const currentUser = req.user!;
    
    // Only authenticated users can list resources
    if (!currentUser) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    // Management users have full access
    const isManagement = currentUser.role === UserRole.MANAGEMENT;

    const { 
      category, 
      type,
      isPublic,
      page = '1', 
      limit = '20' 
    } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    let resources = await storage.read<CommunityResource>('community-resources.json');

    // Filter by category
    if (category) {
      resources = resources.filter(r => r.category === category);
    }

    // Filter by type
    if (type) {
      resources = resources.filter(r => r.type === type);
    }

    // Filter by isPublic
    if (isPublic !== undefined) {
      resources = resources.filter(r => r.isPublic === (isPublic === 'true'));
    }

    // Filter by access - only show resources user can access
    const accessibleResources: CommunityResource[] = [];
    for (const resource of resources) {
      if (isManagement) {
        // Management can see all resources
        accessibleResources.push(resource);
      } else {
        const canAccess = await canAccessCommunityResource(resource.id, currentUser.userId);
        if (canAccess) {
          accessibleResources.push(resource);
        }
      }
    }

    // Sort by sharedAt (newest first)
    accessibleResources.sort((a, b) => 
      new Date(b.sharedAt).getTime() - new Date(a.sharedAt).getTime()
    );

    // Pagination
    const total = accessibleResources.length;
    const totalPages = Math.ceil(total / limitNum);
    const start = (pageNum - 1) * limitNum;
    const end = start + limitNum;
    const paginatedData = accessibleResources.slice(start, end);

    // Get sharer info
    const sharerIds = Array.from(new Set(paginatedData.map(r => r.sharedBy)));
    const sharersMap = await storage.findByIds<User>('users.json', sharerIds);

    const enrichedData = paginatedData.map(resource => {
      const sharer = sharersMap.get(resource.sharedBy);
      return {
        ...resource,
        sharer: sharer ? {
          id: sharer.id,
          name: sharer.name,
          email: sharer.email,
          avatar: sharer.avatar
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
    console.error('List community resources error:', error);
    return res.status(500).json(
      errorResponse('Lỗi lấy danh sách tài nguyên: ' + error.message)
    );
  }
}

/**
 * POST /api/management/community/resources
 */
export async function shareCommunityResourceHandler(req: AuthRequest, res: Response) {
  try {
    const currentUser = req.user!;
    
    // Only authenticated users can share resources
    if (!currentUser) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    // Management users have full access
    const isManagement = currentUser.role === UserRole.MANAGEMENT;
    if (!isManagement) {
      // Check if user has share permission
      const hasPermission = true; // Students and tutors can share
      if (!hasPermission) {
        return res.status(403).json(errorResponse('Bạn không có quyền chia sẻ tài nguyên'));
      }
    }

    const {
      title,
      description,
      type,
      url,
      fileUrl,
      thumbnail,
      category,
      subject,
      tags,
      isPublic,
      isEncrypted,
      accessLevel,
      restrictedTo,
      metadata
    } = req.body;

    const resource = await shareCommunityResource(
      title,
      currentUser.userId,
      {
        description,
        type,
        url,
        fileUrl,
        thumbnail,
        category,
        subject,
        tags,
        isPublic,
        isEncrypted,
        accessLevel,
        restrictedTo,
        metadata
      }
    );

    return res.status(201).json(
      successResponse(resource, 'Chia sẻ tài nguyên thành công')
    );
  } catch (error: any) {
    console.error('Share community resource error:', error);
    return res.status(500).json(
      errorResponse('Lỗi chia sẻ tài nguyên: ' + error.message)
    );
  }
}

/**
 * PUT /api/management/community/resources/:id/restrict
 */
export async function restrictCommunityResourceHandler(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    // Only management can restrict resources
    if (currentUser.role !== UserRole.MANAGEMENT) {
      return res.status(403).json(errorResponse('Bạn không có quyền hạn chế tài nguyên'));
    }

    // Check permissions
    const managementUser = await storage.findById<Management>('users.json', currentUser.userId);
    if (!managementUser || !managementUser.permissions?.includes('manage_community')) {
      return res.status(403).json(errorResponse('Bạn không có quyền hạn chế tài nguyên'));
    }

    const resource = await storage.findById<CommunityResource>('community-resources.json', id);
    if (!resource) {
      return res.status(404).json(errorResponse('Không tìm thấy tài nguyên'));
    }

    const { restrictedTo, accessLevel } = req.body;

    const updatedResource = await restrictCommunityResource(
      id,
      restrictedTo,
      accessLevel || 'restricted',
      currentUser.userId
    );

    return res.json(
      successResponse(updatedResource, 'Hạn chế truy cập tài nguyên thành công')
    );
  } catch (error: any) {
    console.error('Restrict community resource error:', error);
    return res.status(500).json(
      errorResponse('Lỗi hạn chế tài nguyên: ' + error.message)
    );
  }
}

/**
 * POST /api/management/community/events
 */
export async function createCommunityEventHandler(req: AuthRequest, res: Response) {
  try {
    const currentUser = req.user!;
    
    // Only management can create events
    if (currentUser.role !== UserRole.MANAGEMENT) {
      return res.status(403).json(errorResponse('Bạn không có quyền tạo sự kiện'));
    }

    // Check permissions
    const managementUser = await storage.findById<Management>('users.json', currentUser.userId);
    if (!managementUser || !managementUser.permissions?.includes('manage_community')) {
      return res.status(403).json(errorResponse('Bạn không có quyền tạo sự kiện'));
    }

    const {
      title,
      description,
      type,
      startTime,
      endTime,
      location,
      meetingLink,
      isOnline,
      maxParticipants,
      category,
      tags,
      resources,
      registrationRequired,
      registrationDeadline,
      metadata
    } = req.body;

    const event = await createCommunityEvent(
      title,
      description,
      type,
      currentUser.userId,
      startTime,
      endTime,
      {
        location,
        meetingLink,
        isOnline,
        maxParticipants,
        category,
        tags,
        resources,
        registrationRequired,
        registrationDeadline,
        metadata
      }
    );

    return res.status(201).json(
      successResponse(event, 'Tạo sự kiện thành công')
    );
  } catch (error: any) {
    console.error('Create community event error:', error);
    return res.status(500).json(
      errorResponse('Lỗi tạo sự kiện: ' + error.message)
    );
  }
}

/**
 * GET /api/management/community/activities
 */
export async function getCommunityActivitiesHandler(req: AuthRequest, res: Response) {
  try {
    const currentUser = req.user!;
    
    // Only management can view activities
    if (currentUser.role !== UserRole.MANAGEMENT) {
      return res.status(403).json(errorResponse('Bạn không có quyền truy cập'));
    }

    // Check permissions
    const managementUser = await storage.findById<Management>('users.json', currentUser.userId);
    if (!managementUser || !managementUser.permissions?.includes('manage_community')) {
      return res.status(403).json(errorResponse('Bạn không có quyền xem hoạt động cộng đồng'));
    }

    const { entityType, entityId, page = '1', limit = '20' } = req.query;

    const result = await getCommunityActivities(
      entityType as 'forum' | 'resource' | 'event' | undefined,
      entityId as string | undefined,
      parseInt(page as string),
      parseInt(limit as string)
    );

    // Get user info
    const userIds = Array.from(new Set(result.data.map(a => a.userId)));
    const usersMap = await storage.findByIds<User>('users.json', userIds);

    const enrichedData = result.data.map(activity => {
      const user = usersMap.get(activity.userId);
      return {
        ...activity,
        user: user ? {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar
        } : null
      };
    });

    return res.json(successResponse({
      data: enrichedData,
      pagination: result.pagination
    }));
  } catch (error: any) {
    console.error('Get community activities error:', error);
    return res.status(500).json(
      errorResponse('Lỗi lấy hoạt động cộng đồng: ' + error.message)
    );
  }
}

