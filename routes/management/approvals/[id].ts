/**
 * Management Approval Request Detail APIs
 * GET /api/management/approvals/:id - Get approval request detail
 * PUT /api/management/approvals/:id/approve - Approve request
 * PUT /api/management/approvals/:id/reject - Reject request
 * PUT /api/management/approvals/:id/clarify - Request clarification
 * POST /api/management/approvals/:id/escalate - Escalate to Academic Affairs
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
  SessionStatus,
  Tutor,
  Student,
  ForumPost,
  ForumComment,
  Class
} from '../../../lib/types.js';
import { AuthRequest } from '../../../lib/middleware.js';
import { successResponse, errorResponse, generateId, now } from '../../../lib/utils.js';
import { handleResourceAllocation, handleContentModeration, handleContentModerationRejection } from './handlers.js';

/**
 * GET /api/management/approvals/:id
 */
export async function getApprovalRequestHandler(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    // Only management can view approval requests
    if (currentUser.role !== UserRole.MANAGEMENT) {
      return res.status(403).json(errorResponse('Bạn không có quyền truy cập'));
    }

    const approval = await storage.findById<ApprovalRequest>('approvals.json', id);
    if (!approval) {
      return res.status(404).json(errorResponse('Không tìm thấy yêu cầu phê duyệt'));
    }

    // Load related data in parallel
    const [requester, reviewer, targetEntity] = await Promise.all([
      storage.findById<User>('users.json', approval.requesterId),
      approval.reviewerId ? storage.findById<User>('users.json', approval.reviewerId) : null,
      approval.targetId ? getTargetEntity(approval.targetId, approval.type, approval) : null
    ]);

    return res.json(successResponse({
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
      targetEntity,
      isDeadlineApproaching: approval.deadline 
        ? new Date(approval.deadline).getTime() - Date.now() < 24 * 60 * 60 * 1000
        : false,
      isDeadlinePassed: approval.deadline 
        ? new Date(approval.deadline) < new Date()
        : false
    }));
  } catch (error: any) {
    console.error('Get approval request error:', error);
    return res.status(500).json(
      errorResponse('Lỗi lấy thông tin yêu cầu: ' + error.message)
    );
  }
}

/**
 * PUT /api/management/approvals/:id/approve
 */
export async function approveApprovalRequestHandler(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { reviewNotes, location } = req.body; // location for room allocation
    const currentUser = req.user!;
    
    // Debug log to check request body
    console.log('Approve request body:', JSON.stringify(req.body, null, 2));
    console.log('Location value:', location, 'Type:', typeof location);

    // Only management can approve requests
    if (currentUser.role !== UserRole.MANAGEMENT) {
      return res.status(403).json(errorResponse('Bạn không có quyền phê duyệt'));
    }

    const approval = await storage.findById<ApprovalRequest>('approvals.json', id);
    if (!approval) {
      return res.status(404).json(errorResponse('Không tìm thấy yêu cầu phê duyệt'));
    }

    if (approval.status !== ApprovalRequestStatus.PENDING && 
        approval.status !== ApprovalRequestStatus.CLARIFICATION_REQUESTED) {
      return res.status(400).json(errorResponse('Yêu cầu này đã được xử lý rồi'));
    }

    // For resource_allocation with reallocate_room, require location
    if (approval.type === ApprovalRequestType.RESOURCE_ALLOCATION && approval.resourceAllocationData) {
      const hasRoomAllocation = approval.resourceAllocationData.changes?.some(
        (change: any) => change.type === 'reallocate_room'
      );
      
      console.log('Checking room allocation:', { 
        hasRoomAllocation, 
        location, 
        locationType: typeof location,
        locationLength: location?.length,
        approvalType: approval.type,
        changes: approval.resourceAllocationData.changes
      });
      
      // Check if location is provided and not empty
      const locationProvided = location && typeof location === 'string' && location.trim().length > 0;
      
      console.log('Location check result:', { locationProvided, locationTrimmed: location?.trim(), locationTrimmedLength: location?.trim()?.length });
      
      if (hasRoomAllocation && !locationProvided) {
        console.log('Room allocation requires location but location is missing or empty:', { 
          location, 
          locationType: typeof location,
          locationValue: location,
          hasRoomAllocation, 
          approvalType: approval.type,
          requestBody: req.body
        });
        return res.status(400).json(errorResponse('Vui lòng nhập phòng học để phân bổ cho buổi học offline'));
      }

      // Update resourceAllocationData with location
      if (hasRoomAllocation && locationProvided) {
        const trimmedLocation = location.trim();
        approval.resourceAllocationData = {
          ...approval.resourceAllocationData,
          changes: approval.resourceAllocationData.changes?.map((change: any) => {
            if (change.type === 'reallocate_room') {
              return {
                ...change,
                toValue: trimmedLocation
              };
            }
            return change;
          }) || []
        };
        console.log('Updated resourceAllocationData with location:', trimmedLocation);
      }
    }

    // Update approval request with updated resourceAllocationData and status
    const updatedApproval = await storage.update<ApprovalRequest>('approvals.json', id, {
      status: ApprovalRequestStatus.APPROVED,
      reviewerId: currentUser.userId,
      reviewNotes: reviewNotes || 'Yêu cầu đã được phê duyệt',
      resourceAllocationData: approval.resourceAllocationData, // Include updated location
      updatedAt: now()
    });

    // Apply the approval based on type (use updated approval with location)
    await applyApproval(updatedApproval);

    // Create notification for requester
    const requester = await storage.findById<User>('users.json', approval.requesterId);
    if (requester) {
      const notification: Notification = {
        id: generateId('notif'),
        userId: approval.requesterId,
        type: NotificationType.APPROVAL_APPROVED,
        title: 'Yêu cầu đã được phê duyệt',
        message: `Yêu cầu "${approval.title}" đã được phê duyệt`,
        read: false,
        link: `/management/approvals/${id}`,
        metadata: {
          approvalRequestId: id,
          reviewNotes: reviewNotes
        },
        createdAt: now()
      };
      await storage.create<Notification>('notifications.json', notification);
    }

    return res.json(
      successResponse(updatedApproval, 'Phê duyệt yêu cầu thành công')
    );
  } catch (error: any) {
    console.error('Approve approval request error:', error);
    return res.status(500).json(
      errorResponse('Lỗi phê duyệt yêu cầu: ' + error.message)
    );
  }
}

/**
 * PUT /api/management/approvals/:id/reject
 */
export async function rejectApprovalRequestHandler(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { reviewNotes } = req.body;
    const currentUser = req.user!;

    // Only management can reject requests
    if (currentUser.role !== UserRole.MANAGEMENT) {
      return res.status(403).json(errorResponse('Bạn không có quyền từ chối'));
    }

    const approval = await storage.findById<ApprovalRequest>('approvals.json', id);
    if (!approval) {
      return res.status(404).json(errorResponse('Không tìm thấy yêu cầu phê duyệt'));
    }

    if (approval.status !== ApprovalRequestStatus.PENDING && 
        approval.status !== ApprovalRequestStatus.CLARIFICATION_REQUESTED) {
      return res.status(400).json(errorResponse('Yêu cầu này đã được xử lý rồi'));
    }

    if (!reviewNotes || reviewNotes.length < 10) {
      return res.status(400).json(errorResponse('Lý do từ chối phải có ít nhất 10 ký tự'));
    }

    // Update approval request
    const updatedApproval = await storage.update<ApprovalRequest>('approvals.json', id, {
      status: ApprovalRequestStatus.REJECTED,
      reviewerId: currentUser.userId,
      reviewNotes: reviewNotes,
      updatedAt: now()
    });

    // Handle content moderation rejection (set content status to rejected/hidden)
    if (approval.type === 'content_moderation' && approval.contentModerationData) {
      try {
        await handleContentModerationRejection(updatedApproval);
      } catch (error: any) {
        console.error('Error handling content moderation rejection:', error);
        // Continue with notification even if content update fails
      }
    }

    // Create notification for requester
    const requester = await storage.findById<User>('users.json', approval.requesterId);
    if (requester) {
      const notification: Notification = {
        id: generateId('notif'),
        userId: approval.requesterId,
        type: NotificationType.APPROVAL_REJECTED,
        title: 'Yêu cầu đã bị từ chối',
        message: `Yêu cầu "${approval.title}" đã bị từ chối: ${reviewNotes}`,
        read: false,
        link: `/management/approvals/${id}`,
        metadata: {
          approvalRequestId: id,
          reviewNotes: reviewNotes
        },
        createdAt: now()
      };
      await storage.create<Notification>('notifications.json', notification);
    }

    return res.json(
      successResponse(updatedApproval, 'Từ chối yêu cầu thành công')
    );
  } catch (error: any) {
    console.error('Reject approval request error:', error);
    return res.status(500).json(
      errorResponse('Lỗi từ chối yêu cầu: ' + error.message)
    );
  }
}

/**
 * PUT /api/management/approvals/:id/clarify
 */
export async function requestClarificationHandler(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { clarificationRequest } = req.body;
    const currentUser = req.user!;

    // Only management can request clarification
    if (currentUser.role !== UserRole.MANAGEMENT) {
      return res.status(403).json(errorResponse('Bạn không có quyền yêu cầu làm rõ'));
    }

    const approval = await storage.findById<ApprovalRequest>('approvals.json', id);
    if (!approval) {
      return res.status(404).json(errorResponse('Không tìm thấy yêu cầu phê duyệt'));
    }

    if (approval.status !== ApprovalRequestStatus.PENDING) {
      return res.status(400).json(errorResponse('Chỉ có thể yêu cầu làm rõ cho yêu cầu đang chờ'));
    }

    // Update approval request
    const updatedApproval = await storage.update<ApprovalRequest>('approvals.json', id, {
      status: ApprovalRequestStatus.CLARIFICATION_REQUESTED,
      reviewerId: currentUser.userId,
      clarificationRequest: clarificationRequest,
      updatedAt: now()
    });

    // Create notification for requester
    const requester = await storage.findById<User>('users.json', approval.requesterId);
    if (requester) {
      const notification: Notification = {
        id: generateId('notif'),
        userId: approval.requesterId,
        type: NotificationType.APPROVAL_REQUEST,
        title: 'Yêu cầu làm rõ thông tin',
        message: `Yêu cầu "${approval.title}" cần được làm rõ: ${clarificationRequest}`,
        read: false,
        link: `/management/approvals/${id}`,
        metadata: {
          approvalRequestId: id,
          clarificationRequest: clarificationRequest
        },
        createdAt: now()
      };
      await storage.create<Notification>('notifications.json', notification);
    }

    return res.json(
      successResponse(updatedApproval, 'Yêu cầu làm rõ đã được gửi')
    );
  } catch (error: any) {
    console.error('Request clarification error:', error);
    return res.status(500).json(
      errorResponse('Lỗi yêu cầu làm rõ: ' + error.message)
    );
  }
}

/**
 * POST /api/management/approvals/:id/escalate
 */
export async function escalateApprovalRequestHandler(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { escalationReason } = req.body;
    const currentUser = req.user!;

    // Only management can escalate requests
    if (currentUser.role !== UserRole.MANAGEMENT) {
      return res.status(403).json(errorResponse('Bạn không có quyền chuyển yêu cầu'));
    }

    const approval = await storage.findById<ApprovalRequest>('approvals.json', id);
    if (!approval) {
      return res.status(404).json(errorResponse('Không tìm thấy yêu cầu phê duyệt'));
    }

    if (approval.status === ApprovalRequestStatus.ESCALATED) {
      return res.status(400).json(errorResponse('Yêu cầu này đã được chuyển lên rồi'));
    }

    // Update approval request
    const updatedApproval = await storage.update<ApprovalRequest>('approvals.json', id, {
      status: ApprovalRequestStatus.ESCALATED,
      reviewerId: currentUser.userId,
      escalationReason: escalationReason,
      updatedAt: now()
    });

    // Create notification for Academic Affairs Office (management users with specific permissions)
    const academicAffairsUsers = await storage.find<User>('users.json', 
      (u) => u.role === UserRole.MANAGEMENT && 
             (u as any).permissions?.includes('handle_escalation')
    );

    const notifications = academicAffairsUsers.map(user => ({
      id: generateId('notif'),
      userId: user.id,
      type: NotificationType.APPROVAL_REQUEST,
      title: 'Yêu cầu được chuyển lên',
      message: `Yêu cầu "${approval.title}" đã được chuyển lên: ${escalationReason}`,
      read: false,
      link: `/management/approvals/${id}`,
      metadata: {
        approvalRequestId: id,
        escalationReason: escalationReason
      },
      createdAt: now()
    }));

    await Promise.all(
      notifications.map(notif => storage.create<Notification>('notifications.json', notif))
    );

    return res.json(
      successResponse(updatedApproval, 'Chuyển yêu cầu lên thành công')
    );
  } catch (error: any) {
    console.error('Escalate approval request error:', error);
    return res.status(500).json(
      errorResponse('Lỗi chuyển yêu cầu: ' + error.message)
    );
  }
}

// ===== HELPER FUNCTIONS =====

/**
 * Get target entity based on approval type
 */
async function getTargetEntity(targetId: string, type: string, approval?: ApprovalRequest): Promise<any> {
  switch (type) {
    case 'tutor_verification':
      const tutor = await storage.findById<Tutor>('users.json', targetId);
      return tutor ? {
        id: tutor.id,
        name: tutor.name,
        email: tutor.email,
        verified: tutor.verified,
        subjects: tutor.subjects
      } : null;
    
    case 'session_change':
      const session = await storage.findById<Session>('sessions.json', targetId);
      if (!session) return null;
      
      // Use approval object if provided, otherwise search for it
      let approvalData = approval;
      if (!approvalData) {
        const approvals = await storage.read<ApprovalRequest>('approvals.json');
        approvalData = approvals.find(a => 
          (a.targetId === targetId || a.id === targetId) && 
          a.type === 'session_change'
        );
      }
      
      return {
        id: session.id,
        subject: session.subject,
        startTime: session.startTime,
        endTime: session.endTime,
        status: session.status,
        studentIds: session.studentIds,
        tutorId: session.tutorId,
        changeType: approvalData?.changeType,
        changeData: approvalData?.changeData,
        originalSessionData: approvalData?.originalSessionData,
        proposedSessionData: approvalData?.proposedSessionData
      };
    
    case 'resource_allocation':
      // For resource allocation, targetId might be optimization plan ID or session/class ID
      // Return resource allocation data from approval
      if (approval?.resourceAllocationData) {
        return {
          optimizationPlanId: approval.resourceAllocationData.optimizationPlanId,
          changes: approval.resourceAllocationData.changes,
          affectedTutorIds: approval.resourceAllocationData.affectedTutorIds,
          affectedSessionIds: approval.resourceAllocationData.affectedSessionIds,
          affectedStudentIds: approval.resourceAllocationData.affectedStudentIds
        };
      }
      return null;
    
    case 'content_moderation':
      // For content moderation, targetId is the content ID (post or comment)
      if (approval?.contentModerationData) {
        const { contentType, contentId } = approval.contentModerationData;
        
        if (contentType === 'post') {
          const post = await storage.findById<ForumPost>('forum-posts.json', contentId);
          if (post) {
            return {
              id: post.id,
              title: post.title,
              content: post.content,
              authorId: post.authorId,
              category: post.category,
              status: post.status,
              contentType: 'post',
              contentModerationData: approval.contentModerationData
            };
          }
        } else if (contentType === 'comment') {
          const comment = await storage.findById<ForumComment>('forum-comments.json', contentId);
          if (comment) {
            return {
              id: comment.id,
              content: comment.content,
              authorId: comment.authorId,
              postId: comment.postId,
              status: comment.status,
              contentType: 'comment',
              contentModerationData: approval.contentModerationData
            };
          }
        }
      }
      return null;
    
    default:
      return null;
  }
}

/**
 * Apply approval based on type
 */
async function applyApproval(approval: ApprovalRequest): Promise<void> {
  switch (approval.type) {
    case 'tutor_verification':
      if (approval.targetId) {
        await storage.update<Tutor>('users.json', approval.targetId, {
          verified: true,
          updatedAt: now()
        });
      }
      break;
    
    case 'session_change':
      if (approval.changeType === 'change_type' && approval.changeData) {
        await handleSessionTypeChange(approval);
      } else if (approval.changeType === 'change_location' && approval.changeData) {
        await handleLocationChange(approval);
      } else if (approval.changeType === 'change_duration' && approval.changeData) {
        await handleDurationChange(approval);
      }
      break;
    
    case 'resource_allocation':
      if (approval.resourceAllocationData) {
        await handleResourceAllocation(approval);
      }
      break;
    
    case 'content_moderation':
      if (approval.contentModerationData) {
        await handleContentModeration(approval);
      }
      break;
    
    default:
      // Other types can be handled here
      break;
  }
}

/**
 * Handle session type change (Individual ↔ Group)
 * Supports:
 * - Merge: Multiple individual sessions → 1 group session
 * - Split: 1 group session → Multiple individual sessions
 */
async function handleSessionTypeChange(approval: ApprovalRequest): Promise<void> {
  const { changeData, targetId } = approval;
  if (!changeData) return;

  // Case 1: Merge multiple individual sessions into 1 group session
  if (changeData.mergeSessionIds && changeData.mergeSessionIds.length >= 2) {
    await mergeSessions(changeData.mergeSessionIds, approval);
  }
  // Case 2: Split 1 group session into multiple individual sessions
  else if (targetId && changeData.splitInto && changeData.splitInto >= 2) {
    await splitSession(targetId, changeData.splitInto, approval);
  }
}

/**
 * Merge multiple individual sessions into 1 group session
 */
async function mergeSessions(sessionIds: string[], approval: ApprovalRequest): Promise<void> {
  try {
    // Load all sessions to merge
    const sessions = await Promise.all(
      sessionIds.map(id => storage.findById<Session>('sessions.json', id))
    );

    // Validate all sessions exist and are individual (1 student each)
    const validSessions = sessions.filter(s => s !== null) as Session[];
    if (validSessions.length < 2) {
      throw new Error('Không tìm thấy đủ sessions để merge');
    }

    // Check all sessions have same tutor, subject, and time
    const firstSession = validSessions[0];
    const allSameTutor = validSessions.every(s => s.tutorId === firstSession.tutorId);
    const allSameSubject = validSessions.every(s => s.subject === firstSession.subject);
    const allSameTime = validSessions.every(s => 
      s.startTime === firstSession.startTime && 
      s.endTime === firstSession.endTime
    );

    if (!allSameTutor || !allSameSubject || !allSameTime) {
      throw new Error('Các sessions phải có cùng tutor, subject và thời gian để merge');
    }

    // Collect all unique student IDs
    const allStudentIds = new Set<string>();
    validSessions.forEach(s => {
      s.studentIds.forEach(id => allStudentIds.add(id));
    });

    // Check if any session is already a group session
    const hasGroupSession = validSessions.some(s => s.studentIds.length > 1);
    if (hasGroupSession) {
      throw new Error('Không thể merge sessions đã là group session');
    }

    // Create new merged group session
    const mergedSession: Session = {
      id: generateId('ses'),
      studentIds: Array.from(allStudentIds),
      tutorId: firstSession.tutorId,
      subject: firstSession.subject,
      topic: firstSession.topic || `Group session - ${firstSession.subject}`,
      description: `Merged from ${validSessions.length} individual sessions`,
      status: firstSession.status,
      startTime: firstSession.startTime,
      endTime: firstSession.endTime,
      duration: firstSession.duration,
      isOnline: firstSession.isOnline,
      location: firstSession.location,
      meetingLink: firstSession.meetingLink,
      notes: `Merged from sessions: ${sessionIds.join(', ')}`,
      classId: firstSession.classId,
      createdAt: now(),
      updatedAt: now()
    };

    // Save merged session
    await storage.create<Session>('sessions.json', mergedSession);

    // Cancel/delete original individual sessions
    for (const session of validSessions) {
      await storage.update<Session>('sessions.json', session.id, {
        status: SessionStatus.CANCELLED,
        cancelReason: `Merged into group session ${mergedSession.id}`,
        cancelledBy: approval.reviewerId || approval.requesterId,
        updatedAt: now()
      });
    }

    // Notify all affected students
    const students = await storage.findByIds<Student>('users.json', Array.from(allStudentIds));
    const notifications: Notification[] = Array.from(allStudentIds).map(studentId => ({
      id: generateId('notif'),
      userId: studentId,
      type: NotificationType.SESSION_RESCHEDULED,
      title: 'Sessions đã được merge thành group session',
      message: `Các individual sessions của bạn đã được merge thành 1 group session cho môn ${firstSession.subject}`,
      read: false,
      link: `/sessions/${mergedSession.id}`,
      metadata: {
        sessionId: mergedSession.id,
        mergedSessionIds: sessionIds
      },
      createdAt: now()
    }));

    await Promise.all(
      notifications.map(notif => storage.create<Notification>('notifications.json', notif))
    );

    // Notify tutor
    const tutorNotification: Notification = {
      id: generateId('notif'),
      userId: firstSession.tutorId,
      type: NotificationType.SESSION_RESCHEDULED,
      title: 'Sessions đã được merge thành group session',
      message: `${validSessions.length} individual sessions đã được merge thành 1 group session cho môn ${firstSession.subject}`,
      read: false,
      link: `/sessions/${mergedSession.id}`,
      metadata: {
        sessionId: mergedSession.id,
        mergedSessionIds: sessionIds
      },
      createdAt: now()
    };
    await storage.create<Notification>('notifications.json', tutorNotification);

  } catch (error: any) {
    console.error('Error merging sessions:', error);
    throw new Error(`Lỗi merge sessions: ${error.message}`);
  }
}

/**
 * Split 1 group session into multiple individual sessions
 */
async function splitSession(sessionId: string, splitInto: number, approval: ApprovalRequest): Promise<void> {
  try {
    // Load the group session
    const groupSession = await storage.findById<Session>('sessions.json', sessionId);
    if (!groupSession) {
      throw new Error('Không tìm thấy session để split');
    }

    // Validate it's a group session (has multiple students)
    if (groupSession.studentIds.length < 2) {
      throw new Error('Session này không phải là group session (chỉ có 1 student)');
    }

    // Validate splitInto doesn't exceed number of students
    if (splitInto > groupSession.studentIds.length) {
      throw new Error(`Không thể split thành ${splitInto} sessions khi chỉ có ${groupSession.studentIds.length} students`);
    }

    // Calculate students per session
    const studentsPerSession = Math.ceil(groupSession.studentIds.length / splitInto);
    const newSessions: Session[] = [];

    // Create individual sessions
    for (let i = 0; i < splitInto; i++) {
      const startIdx = i * studentsPerSession;
      const endIdx = Math.min(startIdx + studentsPerSession, groupSession.studentIds.length);
      const studentIds = groupSession.studentIds.slice(startIdx, endIdx);

      // For individual sessions, each should have only 1 student
      // If we have more students than sessions, distribute evenly
      if (studentIds.length > 0) {
        const individualSession: Session = {
          id: generateId('ses'),
          studentIds: [studentIds[0]], // Individual session = 1 student
          tutorId: groupSession.tutorId,
          subject: groupSession.subject,
          topic: groupSession.topic || `${groupSession.subject} - Individual`,
          description: `Split from group session ${groupSession.id}`,
          status: groupSession.status,
          startTime: groupSession.startTime,
          endTime: groupSession.endTime,
          duration: groupSession.duration,
          isOnline: groupSession.isOnline,
          location: groupSession.location,
          meetingLink: groupSession.meetingLink,
          notes: `Split from group session ${groupSession.id}`,
          classId: groupSession.classId,
          createdAt: now(),
          updatedAt: now()
        };
        newSessions.push(individualSession);
      }
    }

    // Handle remaining students if any (create additional sessions)
    const remainingStudents = groupSession.studentIds.slice(newSessions.length);
    for (const studentId of remainingStudents) {
      const individualSession: Session = {
        id: generateId('ses'),
        studentIds: [studentId],
        tutorId: groupSession.tutorId,
        subject: groupSession.subject,
        topic: groupSession.topic || `${groupSession.subject} - Individual`,
        description: `Split from group session ${groupSession.id}`,
        status: groupSession.status,
        startTime: groupSession.startTime,
        endTime: groupSession.endTime,
        duration: groupSession.duration,
        isOnline: groupSession.isOnline,
        location: groupSession.location,
        meetingLink: groupSession.meetingLink,
        notes: `Split from group session ${groupSession.id}`,
        classId: groupSession.classId,
        createdAt: now(),
        updatedAt: now()
      };
      newSessions.push(individualSession);
    }

    // Save all new individual sessions
    await Promise.all(
      newSessions.map(s => storage.create<Session>('sessions.json', s))
    );

    // Cancel original group session
    await storage.update<Session>('sessions.json', sessionId, {
      status: SessionStatus.CANCELLED,
      cancelReason: `Split into ${newSessions.length} individual sessions`,
      cancelledBy: approval.reviewerId || approval.requesterId,
      updatedAt: now()
    });

    // Notify all affected students
    const notifications: Notification[] = groupSession.studentIds.map(studentId => ({
      id: generateId('notif'),
      userId: studentId,
      type: NotificationType.SESSION_RESCHEDULED,
      title: 'Group session đã được split thành individual sessions',
      message: `Group session của bạn cho môn ${groupSession.subject} đã được split thành individual sessions`,
      read: false,
      link: `/sessions`,
      metadata: {
        originalSessionId: sessionId,
        newSessionIds: newSessions.map(s => s.id)
      },
      createdAt: now()
    }));

    await Promise.all(
      notifications.map(notif => storage.create<Notification>('notifications.json', notif))
    );

    // Notify tutor
    const tutorNotification: Notification = {
      id: generateId('notif'),
      userId: groupSession.tutorId,
      type: NotificationType.SESSION_RESCHEDULED,
      title: 'Group session đã được split thành individual sessions',
      message: `Group session cho môn ${groupSession.subject} đã được split thành ${newSessions.length} individual sessions`,
      read: false,
      link: `/sessions`,
      metadata: {
        originalSessionId: sessionId,
        newSessionIds: newSessions.map(s => s.id)
      },
      createdAt: now()
    };
    await storage.create<Notification>('notifications.json', tutorNotification);

  } catch (error: any) {
    console.error('Error splitting session:', error);
    throw new Error(`Lỗi split session: ${error.message}`);
  }
}

/**
 * Handle session location/mode change (Offline ↔ Online)
 * Supports:
 * - Change from offline to online (release room)
 * - Change from online to offline (book room)
 */
async function handleLocationChange(approval: ApprovalRequest): Promise<void> {
  try {
    const { targetId, changeData } = approval;
    if (!targetId || !changeData) {
      throw new Error('Missing targetId or changeData for location change');
    }

    // Validate required fields
    if (changeData.newIsOnline === undefined) {
      throw new Error('newIsOnline is required for location change');
    }

    // Load the session
    const session = await storage.findById<Session>('sessions.json', targetId);
    if (!session) {
      throw new Error('Không tìm thấy session để thay đổi location');
    }

    // Validate session is not cancelled or completed
    if (session.status === SessionStatus.CANCELLED || session.status === SessionStatus.COMPLETED) {
      throw new Error('Không thể thay đổi location cho session đã bị hủy hoặc đã hoàn thành');
    }

    const isChangingToOnline = changeData.newIsOnline === true;
    const isChangingToOffline = changeData.newIsOnline === false;
    const isCurrentlyOnline = session.isOnline === true;

    // Validate change is actually different
    if (isChangingToOnline === isCurrentlyOnline) {
      throw new Error(`Session đã ở chế độ ${isCurrentlyOnline ? 'online' : 'offline'}`);
    }

    // Prepare update data
    const updateData: Partial<Session> = {
      isOnline: changeData.newIsOnline,
      updatedAt: now()
    };

    // Update location or meeting link based on new mode
    if (isChangingToOnline) {
      // Changing to online: require meetingLink, clear location
      if (!changeData.newMeetingLink) {
        throw new Error('Meeting link là bắt buộc khi chuyển sang online');
      }
      updateData.meetingLink = changeData.newMeetingLink;
      updateData.location = undefined; // Clear location for online sessions
      
      // Log room release (if session had a location)
      if (session.location) {
        console.log(`[Room Release] Session ${session.id} released room: ${session.location}`);
        // In a real system, you would call a room booking service to release the room
      }
    } else if (isChangingToOffline) {
      // Changing to offline: require location, clear meetingLink
      if (!changeData.newLocation) {
        throw new Error('Location là bắt buộc khi chuyển sang offline');
      }
      updateData.location = changeData.newLocation;
      updateData.meetingLink = undefined; // Clear meeting link for offline sessions
      
      // Log room booking
      console.log(`[Room Booking] Session ${session.id} booked room: ${changeData.newLocation}`);
      // In a real system, you would call a room booking service to book the room
      // For now, we'll just validate the location is provided
    }

    // Update session
    await storage.update<Session>('sessions.json', targetId, updateData);

    // Load all affected users (students and tutor)
    const allUserIds = [...session.studentIds, session.tutorId];
    const users = await storage.findByIds<User>('users.json', allUserIds);

    // Create notifications for all participants
    const notifications: Notification[] = allUserIds.map(userId => {
      const user = users.get(userId);
      const userName = user?.name || 'User';
      const locationInfo = isChangingToOnline 
        ? `Meeting link: ${changeData.newMeetingLink}`
        : `Địa điểm: ${changeData.newLocation}`;

      return {
        id: generateId('notif'),
        userId: userId,
        type: NotificationType.SESSION_RESCHEDULED,
        title: `Session đã thay đổi từ ${isCurrentlyOnline ? 'online' : 'offline'} sang ${isChangingToOnline ? 'online' : 'offline'}`,
        message: `Session "${session.subject}" đã được chuyển sang chế độ ${isChangingToOnline ? 'online' : 'offline'}. ${locationInfo}`,
        read: false,
        link: `/sessions/${session.id}`,
        metadata: {
          sessionId: session.id,
          oldIsOnline: isCurrentlyOnline,
          newIsOnline: changeData.newIsOnline,
          newLocation: changeData.newLocation,
          newMeetingLink: changeData.newMeetingLink
        },
        createdAt: now()
      };
    });

    // Create notifications in parallel
    await Promise.all(
      notifications.map(notif => storage.create<Notification>('notifications.json', notif))
    );

    console.log(`Successfully changed session ${session.id} location from ${isCurrentlyOnline ? 'online' : 'offline'} to ${isChangingToOnline ? 'online' : 'offline'}`);

  } catch (error: any) {
    console.error('Error changing session location:', error);
    throw new Error(`Lỗi thay đổi location session: ${error.message}`);
  }
}

/**
 * Handle session duration/time change (Reschedule)
 * Used for rescheduling offline sessions that require room allocation
 */
async function handleDurationChange(approval: ApprovalRequest): Promise<void> {
  try {
    const { targetId, changeData } = approval;
    if (!targetId || !changeData) {
      throw new Error('Missing targetId or changeData for duration change');
    }

    // Load the session
    const session = await storage.findById<Session>('sessions.json', targetId);
    if (!session) {
      throw new Error('Không tìm thấy session');
    }

    // Check if this is a cancel request
    if (changeData.cancelRequest) {
      // Handle cancel request
      // For offline sessions, log room release
      if (!session.isOnline && session.location) {
        console.log(`[Room Release] Session ${session.id} released room: ${session.location}`);
        // In a real system, you would call a room booking service to release the room
      }

      // Cancel the session
      await storage.update<Session>('sessions.json', targetId, {
        status: SessionStatus.CANCELLED,
        cancelledBy: approval.requesterId,
        cancelReason: changeData.cancelReason || 'Cancelled by management approval',
        updatedAt: now()
      });

      // Load all affected users (students and tutor)
      const allUserIds = [...session.studentIds, session.tutorId];
      
      // Create notifications for all participants
      const notifications: Notification[] = allUserIds.map(userId => ({
        id: generateId('notif'),
        userId: userId,
        type: NotificationType.SESSION_CANCELLED,
        title: 'Session đã bị hủy',
        message: `Session "${session.subject}" đã bị hủy bởi management`,
        read: false,
        link: `/sessions/${session.id}`,
        metadata: {
          sessionId: session.id,
          cancelReason: changeData.cancelReason,
          approvedBy: approval.reviewerId
        },
        createdAt: now()
      }));

      await Promise.all(
        notifications.map(notif => storage.create<Notification>('notifications.json', notif))
      );

      // Update session request status if it exists (from cancel request)
      const sessionRequests = await storage.read<any>('session-requests.json');
      const relatedRequest = sessionRequests.find((sr: any) => 
        sr.sessionId === targetId && 
        sr.type === 'cancel' &&
        sr.status === 'approved'
      );

      if (relatedRequest) {
        await storage.update('session-requests.json', relatedRequest.id, {
          responseMessage: 'Yêu cầu hủy đã được management phê duyệt và session đã bị hủy',
          metadata: {
            managementApproved: true,
            approvedAt: now(),
            approvalRequestId: approval.id
          },
          updatedAt: now()
        });
      }

      return; // Exit early for cancel requests
    }

    // Regular reschedule - validate required fields
    if (!changeData.newStartTime || !changeData.newEndTime) {
      throw new Error('newStartTime and newEndTime are required for duration change');
    }

    // Validate session is not cancelled or completed
    if (session.status === SessionStatus.CANCELLED || session.status === SessionStatus.COMPLETED) {
      throw new Error('Không thể thay đổi thời gian cho session đã bị hủy hoặc đã hoàn thành');
    }

    // Save old times before update
    const oldStartTime = session.startTime;
    const oldEndTime = session.endTime;

    // Calculate new duration
    const newDuration = changeData.newDuration || Math.round(
      (new Date(changeData.newEndTime).getTime() - new Date(changeData.newStartTime).getTime()) / (1000 * 60)
    );

    // For offline sessions, log room allocation change
    if (!session.isOnline && session.location) {
      console.log(`[Room Reallocation] Session ${session.id} room ${session.location} needs to be reallocated from ${new Date(oldStartTime).toLocaleString('vi-VN')} to ${new Date(changeData.newStartTime).toLocaleString('vi-VN')}`);
      // In a real system, you would call a room booking service to:
      // 1. Release the old room booking
      // 2. Check room availability for new time
      // 3. Book the room for new time
      // For now, we'll just validate and update the session
    }

    // Update session with new time
    await storage.update<Session>('sessions.json', targetId, {
      startTime: changeData.newStartTime,
      endTime: changeData.newEndTime,
      duration: newDuration,
      status: SessionStatus.RESCHEDULED,
      rescheduledFrom: oldStartTime,
      updatedAt: now()
    });

    // Load all affected users (students and tutor)
    const allUserIds = [...session.studentIds, session.tutorId];
    const users = await storage.findByIds<User>('users.json', allUserIds);

    // Create notifications for all participants
    const notifications: Notification[] = allUserIds.map(userId => {
      const oldTime = new Date(oldStartTime).toLocaleString('vi-VN');
      const newTime = new Date(changeData.newStartTime).toLocaleString('vi-VN');
      const locationInfo = session.location ? ` tại ${session.location}` : '';

      return {
        id: generateId('notif'),
        userId: userId,
        type: NotificationType.SESSION_RESCHEDULED,
        title: 'Session đã được đổi lịch',
        message: `Session "${session.subject}" đã được đổi lịch từ ${oldTime} sang ${newTime}${locationInfo}`,
        read: false,
        link: `/sessions/${session.id}`,
        metadata: {
          sessionId: session.id,
          oldStartTime: oldStartTime,
          newStartTime: changeData.newStartTime,
          newEndTime: changeData.newEndTime,
          newDuration: newDuration
        },
        createdAt: now()
      };
    });

    // Create notifications in parallel
    await Promise.all(
      notifications.map(notif => storage.create<Notification>('notifications.json', notif))
    );

    // Update session request status if it exists (from reschedule request)
    // Find session request related to this approval
    const sessionRequests = await storage.read<any>('session-requests.json');
    const relatedRequest = sessionRequests.find((sr: any) => 
      sr.sessionId === targetId && 
      sr.type === 'reschedule' &&
      sr.status === 'approved'
    );

    if (relatedRequest) {
      // Update session request to indicate management has approved
      await storage.update('session-requests.json', relatedRequest.id, {
        responseMessage: 'Yêu cầu đã được management phê duyệt và session đã được đổi lịch',
        metadata: {
          ...(relatedRequest.metadata || {}),
          managementApproved: true,
          managementApprovedAt: now()
        },
        updatedAt: now()
      });

      // Notify student that reschedule is complete
      const studentNotification: Notification = {
        id: generateId('notif'),
        userId: relatedRequest.studentId,
        type: NotificationType.SESSION_RESCHEDULED,
        title: 'Yêu cầu đổi lịch đã được hoàn tất',
        message: `Yêu cầu đổi lịch session "${session.subject}" đã được management phê duyệt và session đã được đổi lịch thành công.`,
        read: false,
        link: `/student/session/${session.id}`,
        metadata: {
          requestId: relatedRequest.id,
          sessionId: session.id,
          approvalRequestId: approval.id
        },
        createdAt: now()
      };
      await storage.create('notifications.json', studentNotification);
    }

    console.log(`Successfully rescheduled session ${session.id} from ${new Date(oldStartTime).toLocaleString('vi-VN')} to ${new Date(changeData.newStartTime).toLocaleString('vi-VN')}`);

  } catch (error: any) {
    console.error('Error changing session duration:', error);
    throw new Error(`Lỗi thay đổi thời gian session: ${error.message}`);
  }
}

