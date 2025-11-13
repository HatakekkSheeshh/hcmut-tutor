/**
 * Management Approval Requests APIs
 * GET /api/management/approvals - List approval requests
 * POST /api/management/approvals - Create approval request
 */

import { Response } from 'express';
import { storage } from '../../../lib/storage.js';
import { 
  ApprovalRequest, 
  ApprovalRequestType,
  ApprovalRequestStatus,
  User,
  UserRole,
  Notification,
  NotificationType,
  Session,
  ForumPost,
  ForumComment
} from '../../../lib/types.js';
import { AuthRequest } from '../../../lib/middleware.js';
import { successResponse, errorResponse, generateId, now } from '../../../lib/utils.js';

/**
 * GET /api/management/approvals
 * List approval requests with filters
 */
export async function listApprovalRequestsHandler(req: AuthRequest, res: Response) {
  try {
    const currentUser = req.user!;
    
    // Only management can list approval requests
    if (currentUser.role !== UserRole.MANAGEMENT) {
      return res.status(403).json(errorResponse('Bạn không có quyền truy cập'));
    }

    const { 
      status, 
      type, 
      priority,
      page = '1', 
      limit = '20',
      requesterId,
      reviewerId
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    // Read all approvals
    let approvals = await storage.read<ApprovalRequest>('approvals.json');

    // Apply filters
    if (status) {
      approvals = approvals.filter(a => a.status === status);
    }
    if (type) {
      approvals = approvals.filter(a => a.type === type);
    }
    if (priority) {
      approvals = approvals.filter(a => a.priority === priority);
    }
    if (requesterId) {
      approvals = approvals.filter(a => a.requesterId === requesterId);
    }
    if (reviewerId) {
      approvals = approvals.filter(a => a.reviewerId === reviewerId);
    }

    // Sort by createdAt (newest first)
    approvals.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Pagination
    const total = approvals.length;
    const totalPages = Math.ceil(total / limitNum);
    const start = (pageNum - 1) * limitNum;
    const end = start + limitNum;
    const paginatedData = approvals.slice(start, end);

    // Load related user data in parallel
    const userIds = new Set<string>();
    paginatedData.forEach(a => {
      if (a.requesterId) userIds.add(a.requesterId);
      if (a.reviewerId) userIds.add(a.reviewerId);
    });

    const usersMap = await storage.findByIds<User>('users.json', Array.from(userIds));

    // Enrich with user data
    const enrichedData = paginatedData.map(approval => {
      const requester = usersMap.get(approval.requesterId);
      const reviewer = approval.reviewerId ? usersMap.get(approval.reviewerId) : null;

      return {
        ...approval,
        requester: requester ? {
          id: requester.id,
          name: requester.name,
          email: requester.email,
          avatar: requester.avatar,
          role: requester.role
        } : null,
        reviewer: reviewer ? {
          id: reviewer.id,
          name: reviewer.name,
          email: reviewer.email
        } : null,
        // Check if deadline is approaching (within 24 hours)
        isDeadlineApproaching: approval.deadline 
          ? new Date(approval.deadline).getTime() - Date.now() < 24 * 60 * 60 * 1000
          : false,
        // Check if deadline has passed
        isDeadlinePassed: approval.deadline 
          ? new Date(approval.deadline) < new Date()
          : false
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
    console.error('List approval requests error:', error);
    return res.status(500).json(
      errorResponse('Lỗi lấy danh sách yêu cầu: ' + error.message)
    );
  }
}

/**
 * POST /api/management/approvals
 * Create approval request
 */
export async function createApprovalRequestHandler(req: AuthRequest, res: Response) {
  try {
    const currentUser = req.user!;
    const { 
      type, 
      targetId, 
      title, 
      description, 
      attachments, 
      priority,
      changeType,
      changeData,
      resourceAllocationData,
      contentModerationData
    } = req.body;

    // Check if user has permission to create approval requests
    // Students and tutors can create requests, management can also create on behalf of others
    if (currentUser.role === UserRole.MANAGEMENT) {
      // Management can create requests
    } else if (currentUser.role === UserRole.STUDENT || currentUser.role === UserRole.TUTOR) {
      // Students and tutors can create requests for themselves
    } else {
      return res.status(403).json(errorResponse('Bạn không có quyền tạo yêu cầu'));
    }

    // For session_change type, load original session data
    let originalSessionData = undefined;
    let proposedSessionData = undefined;
    
    if (type === ApprovalRequestType.SESSION_CHANGE && targetId) {
      const session = await storage.findById<Session>('sessions.json', targetId);
      if (session) {
        originalSessionData = session;
        
        // Create proposed session data based on changeType and changeData
        if (changeType === 'change_type' && changeData) {
          if (changeData.mergeSessionIds) {
            // For merge, we'll create proposed data after loading all sessions
            const sessionsToMerge = await Promise.all(
              changeData.mergeSessionIds.map((id: string) => 
                storage.findById<Session>('sessions.json', id)
              )
            );
            const validSessions = sessionsToMerge.filter(s => s !== null) as Session[];
            if (validSessions.length > 0) {
              const firstSession = validSessions[0];
              const allStudentIds = new Set<string>();
              validSessions.forEach(s => {
                s.studentIds.forEach(id => allStudentIds.add(id));
              });
              proposedSessionData = {
                ...firstSession,
                studentIds: Array.from(allStudentIds),
                description: `Merged from ${validSessions.length} individual sessions`
              };
            }
          } else if (changeData.splitInto) {
            // For split, proposed data would be multiple individual sessions
            // We'll just mark the original as to be split
            proposedSessionData = {
              ...session,
              description: `To be split into ${changeData.splitInto} individual sessions`
            };
          }
        } else if (changeType === 'change_location' && changeData) {
          // For location change, create proposed session data with new location/mode
          proposedSessionData = {
            ...session,
            isOnline: changeData.newIsOnline,
            location: changeData.newLocation || undefined,
            meetingLink: changeData.newMeetingLink || undefined,
            description: `Location changed from ${session.isOnline ? 'online' : 'offline'} to ${changeData.newIsOnline ? 'online' : 'offline'}`
          };
        }
      }
    }

    // For content_moderation type, load content and create preview
    let finalContentModerationData = contentModerationData;
    if (type === ApprovalRequestType.CONTENT_MODERATION && contentModerationData && contentModerationData.contentId) {
      if (contentModerationData.contentType === 'post') {
        const post = await storage.findById<ForumPost>('forum-posts.json', contentModerationData.contentId);
        if (post) {
          finalContentModerationData = {
            ...contentModerationData,
            contentPreview: post.content.substring(0, 200) + (post.content.length > 200 ? '...' : '')
          };
        }
      } else if (contentModerationData.contentType === 'comment') {
        const comment = await storage.findById<ForumComment>('forum-comments.json', contentModerationData.contentId);
        if (comment) {
          finalContentModerationData = {
            ...contentModerationData,
            contentPreview: comment.content.substring(0, 200) + (comment.content.length > 200 ? '...' : '')
          };
        }
      }
    }

    // Calculate 48-hour deadline
    const deadlineDate = new Date();
    deadlineDate.setDate(deadlineDate.getDate() + 2);
    const deadline = deadlineDate.toISOString();

    const approvalRequest: ApprovalRequest = {
      id: generateId('approval'),
      type: type as ApprovalRequestType,
      requesterId: currentUser.userId,
      targetId: targetId || (finalContentModerationData ? finalContentModerationData.contentId : undefined),
      title,
      description,
      status: ApprovalRequestStatus.PENDING,
      attachments: attachments || [],
      priority: priority || 'medium',
      deadline,
      changeType,
      changeData,
      originalSessionData,
      proposedSessionData,
      resourceAllocationData,
      contentModerationData: finalContentModerationData,
      createdAt: now(),
      updatedAt: now()
    };

    await storage.create<ApprovalRequest>('approvals.json', approvalRequest);

    // Create notification for management users
    const managementUsers = await storage.find<User>('users.json', 
      (u) => u.role === UserRole.MANAGEMENT
    );

    // Notify all management users about new approval request
    const notifications = managementUsers.map(manager => ({
      id: generateId('notif'),
      userId: manager.id,
      type: NotificationType.APPROVAL_REQUEST,
      title: 'Yêu cầu phê duyệt mới',
      message: `Yêu cầu phê duyệt mới: ${title}`,
      read: false,
      link: `/management/approvals/${approvalRequest.id}`,
      metadata: {
        approvalRequestId: approvalRequest.id,
        type: type,
        priority: priority || 'medium'
      },
      createdAt: now()
    }));

    // Create notifications in parallel
    await Promise.all(
      notifications.map(notif => storage.create<Notification>('notifications.json', notif))
    );

    return res.status(201).json(
      successResponse(approvalRequest, 'Tạo yêu cầu phê duyệt thành công')
    );
  } catch (error: any) {
    console.error('Create approval request error:', error);
    return res.status(500).json(
      errorResponse('Lỗi tạo yêu cầu phê duyệt: ' + error.message)
    );
  }
}

