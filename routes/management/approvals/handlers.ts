/**
 * Handlers for resource allocation and content moderation approvals
 */

import { storage } from '../../../lib/storage.js';
import { 
  ApprovalRequest,
  Notification,
  NotificationType,
  Session,
  ForumPost,
  ForumComment,
  Class
} from '../../../lib/types.js';
import { generateId, now } from '../../../lib/utils.js';

/**
 * Handle resource allocation approval
 * Applies optimization changes to resources (tutors, sessions, classes, rooms)
 */
export async function handleResourceAllocation(approval: ApprovalRequest): Promise<void> {
  try {
    const { resourceAllocationData } = approval;
    if (!resourceAllocationData) {
      throw new Error('Missing resourceAllocationData for resource allocation');
    }

    const changes = resourceAllocationData.changes || [];
    const affectedUserIds = new Set<string>();

    // Apply each change
    for (const change of changes) {
      switch (change.type) {
        case 'reassign_tutor':
          // Reassign tutor to session or class
          if (change.resourceId.startsWith('session_')) {
            const session = await storage.findById<Session>('sessions.json', change.resourceId);
            if (session) {
              const oldTutorId = session.tutorId;
              const newTutorId = change.toValue;
              
              await storage.update<Session>('sessions.json', change.resourceId, {
                tutorId: newTutorId,
                updatedAt: now()
              });

              // Collect affected users
              if (oldTutorId) affectedUserIds.add(oldTutorId);
              if (newTutorId) affectedUserIds.add(newTutorId);
              session.studentIds?.forEach(id => affectedUserIds.add(id));
            }
          } else if (change.resourceId.startsWith('class_')) {
            // For classes, update all sessions in the class
            const classData = await storage.findById<Class>('classes.json', change.resourceId);
            if (classData) {
              const sessions = await storage.find<Session>('sessions.json',
                (s: Session) => s.classId === change.resourceId
              );
              
              const newTutorId = change.toValue;
              for (const session of sessions) {
                const oldTutorId = session.tutorId;
                await storage.update<Session>('sessions.json', session.id, {
                  tutorId: newTutorId,
                  updatedAt: now()
                });

                if (oldTutorId) affectedUserIds.add(oldTutorId);
                if (newTutorId) affectedUserIds.add(newTutorId);
                session.studentIds?.forEach(id => affectedUserIds.add(id));
              }
            }
          }
          break;

        case 'adjust_group_size':
          // Adjust group size (add/remove students from session or class)
          if (change.resourceId.startsWith('session_') || change.resourceId.startsWith('ses_')) {
            // For sessions, adjust studentIds
            const session = await storage.findById<Session>('sessions.json', change.resourceId);
            if (session) {
              const newStudentIds = change.toValue?.studentIds || change.toValue;
              if (Array.isArray(newStudentIds)) {
                await storage.update<Session>('sessions.json', change.resourceId, {
                  studentIds: newStudentIds,
                  updatedAt: now()
                });

                // Collect affected users
                if (session.tutorId) affectedUserIds.add(session.tutorId);
                newStudentIds.forEach(id => affectedUserIds.add(id));
              }
            }
          } else if (change.resourceId.startsWith('class_')) {
            // For classes, adjust maxStudents
            const classItem = await storage.findById<Class>('classes.json', change.resourceId);
            if (classItem) {
              const toValue = change.toValue;
              if (toValue && typeof toValue === 'object' && 'maxStudents' in toValue) {
                await storage.update<Class>('classes.json', change.resourceId, {
                  maxStudents: toValue.maxStudents,
                  updatedAt: now()
                });

                // Collect affected users
                if (classItem.tutorId) affectedUserIds.add(classItem.tutorId);
                // Get all students in the class
                const enrollments = await storage.find<Enrollment>('enrollments.json',
                  (e: any) => e.classId === change.resourceId && e.status === 'active'
                );
                enrollments.forEach(e => affectedUserIds.add(e.studentId));
              }
            }
          }
          break;

        case 'reallocate_room':
          // Reallocate room for offline session
          // Support both 'session_' and 'ses_' prefixes for session IDs
          const sessionId = change.resourceId.startsWith('session_') || change.resourceId.startsWith('ses_')
            ? change.resourceId
            : null;
          
          if (sessionId) {
            const session = await storage.findById<Session>('sessions.json', sessionId);
            if (session && !session.isOnline) {
              const newLocation = change.toValue as string;
              if (!newLocation) {
                throw new Error('Location is required for room allocation');
              }
              
              console.log(`[Room Allocation] Updating session ${sessionId} with location: ${newLocation}`);
              
              await storage.update<Session>('sessions.json', sessionId, {
                location: newLocation,
                updatedAt: now()
              });

              // Collect affected users
              if (session.tutorId) affectedUserIds.add(session.tutorId);
              session.studentIds?.forEach(id => affectedUserIds.add(id));
              
              console.log(`[Room Allocation] Successfully allocated room ${newLocation} to session ${sessionId}`);
            } else if (session && session.isOnline) {
              console.warn(`[Room Allocation] Session ${sessionId} is online, skipping room allocation`);
            } else {
              console.error(`[Room Allocation] Session ${sessionId} not found or invalid`);
            }
          } else {
            console.error(`[Room Allocation] Invalid resourceId format: ${change.resourceId}`);
          }
          break;

        case 'adjust_schedule':
          // Adjust schedule for session
          if (change.resourceId.startsWith('session_')) {
            const session = await storage.findById<Session>('sessions.json', change.resourceId);
            if (session) {
              const newSchedule = change.toValue as { startTime: string; endTime: string; duration?: number };
              await storage.update<Session>('sessions.json', change.resourceId, {
                startTime: newSchedule.startTime,
                endTime: newSchedule.endTime,
                duration: newSchedule.duration || session.duration,
                updatedAt: now()
              });

              // Collect affected users
              if (session.tutorId) affectedUserIds.add(session.tutorId);
              session.studentIds?.forEach(id => affectedUserIds.add(id));
            }
          }
          break;
      }
    }

    // Send notifications to all affected users
    // Check if this is a room allocation for a specific session
    const roomAllocationChange = approval.resourceAllocationData?.changes?.find(
      (change: any) => change.type === 'reallocate_room' && change.resourceId?.startsWith('session_')
    );
    
    let notificationTitle = 'Phân bổ tài nguyên đã được cập nhật';
    let notificationMessage = 'Phân bổ tài nguyên đã được management phê duyệt và cập nhật. Vui lòng kiểm tra lịch học của bạn.';
    
    if (roomAllocationChange && roomAllocationChange.toValue) {
      const session = await storage.findById<Session>('sessions.json', roomAllocationChange.resourceId);
      if (session) {
        notificationTitle = 'Phòng học đã được phân bổ';
        notificationMessage = `Buổi học ${session.subject} đã được phân bổ phòng học: ${roomAllocationChange.toValue}. Vui lòng kiểm tra thông tin buổi học.`;
      }
    }
    
    const notifications: Notification[] = Array.from(affectedUserIds).map(userId => ({
      id: generateId('notif'),
      userId: userId,
      type: NotificationType.SYSTEM,
      title: notificationTitle,
      message: notificationMessage,
      read: false,
      link: roomAllocationChange?.resourceId ? `/sessions/${roomAllocationChange.resourceId}` : '/sessions',
      metadata: {
        approvalRequestId: approval.id,
        type: 'resource_allocation',
        sessionId: roomAllocationChange?.resourceId
      },
      createdAt: now()
    }));

    await Promise.all(
      notifications.map(notif => storage.create<Notification>('notifications.json', notif))
    );

    console.log(`Successfully applied resource allocation changes for approval ${approval.id}`);

  } catch (error: any) {
    console.error('Error applying resource allocation:', error);
    throw new Error(`Lỗi áp dụng phân bổ tài nguyên: ${error.message}`);
  }
}

/**
 * Handle content moderation approval
 * Approves or rejects content (posts/comments) based on moderation decision
 * Note: This is called when approval is approved. For rejection, content status is set to 'rejected' or 'hidden'
 */
export async function handleContentModeration(approval: ApprovalRequest): Promise<void> {
  try {
    const { contentModerationData, targetId } = approval;
    if (!contentModerationData || !targetId) {
      throw new Error('Missing contentModerationData or targetId for content moderation');
    }

    const { contentType, contentId } = contentModerationData;
    const reviewerId = approval.reviewerId;
    const reviewNotes = approval.reviewNotes || '';

    // Since this is called on approval, content should be approved
    // If it was rejected, the status would be 'rejected' and this function wouldn't be called
    // But we need to handle rejection separately in reject handler
    if (contentType === 'post') {
      const post = await storage.findById<ForumPost>('forum-posts.json', contentId);
      if (post) {
        await storage.update<ForumPost>('forum-posts.json', contentId, {
          status: 'approved',
          moderationNotes: reviewNotes,
          moderatedBy: reviewerId,
          moderatedAt: now(),
          updatedAt: now()
        });

        // Notify author
        const notification: Notification = {
          id: generateId('notif'),
          userId: post.authorId,
          type: NotificationType.SYSTEM,
          title: 'Bài viết của bạn đã được phê duyệt',
          message: `Bài viết "${post.title.substring(0, 50)}..." đã được management phê duyệt.`,
          read: false,
          link: `/forum/posts/${post.id}`,
          metadata: {
            approvalRequestId: approval.id,
            type: 'content_moderation',
            contentType: 'post'
          },
          createdAt: now()
        };
        await storage.create<Notification>('notifications.json', notification);
      }
    } else if (contentType === 'comment') {
      const comment = await storage.findById<ForumComment>('forum-comments.json', contentId);
      if (comment) {
        await storage.update<ForumComment>('forum-comments.json', contentId, {
          status: 'approved',
          moderationNotes: reviewNotes,
          moderatedBy: reviewerId,
          moderatedAt: now(),
          updatedAt: now()
        });

        // Notify author
        const notification: Notification = {
          id: generateId('notif'),
          userId: comment.authorId,
          type: NotificationType.SYSTEM,
          title: 'Bình luận của bạn đã được phê duyệt',
          message: `Bình luận của bạn đã được management phê duyệt.`,
          read: false,
          link: `/forum/posts/${comment.postId}`,
          metadata: {
            approvalRequestId: approval.id,
            type: 'content_moderation',
            contentType: 'comment'
          },
          createdAt: now()
        };
        await storage.create<Notification>('notifications.json', notification);
      }
    }

    console.log(`Successfully moderated ${contentType} ${contentId} for approval ${approval.id}`);

  } catch (error: any) {
    console.error('Error moderating content:', error);
    throw new Error(`Lỗi kiểm duyệt nội dung: ${error.message}`);
  }
}

/**
 * Handle content moderation rejection
 * Sets content status to 'rejected' or 'hidden' when approval is rejected
 */
export async function handleContentModerationRejection(approval: ApprovalRequest): Promise<void> {
  try {
    const { contentModerationData, targetId } = approval;
    if (!contentModerationData || !targetId) {
      throw new Error('Missing contentModerationData or targetId for content moderation rejection');
    }

    const { contentType, contentId } = contentModerationData;
    const reviewerId = approval.reviewerId;
    const reviewNotes = approval.reviewNotes || '';

    // Determine if content should be rejected or hidden based on severity
    const severity = contentModerationData.severity || 'medium';
    const status = severity === 'critical' || severity === 'high' ? 'hidden' : 'rejected';

    if (contentType === 'post') {
      const post = await storage.findById<ForumPost>('forum-posts.json', contentId);
      if (post) {
        await storage.update<ForumPost>('forum-posts.json', contentId, {
          status: status,
          moderationNotes: reviewNotes,
          moderatedBy: reviewerId,
          moderatedAt: now(),
          updatedAt: now()
        });

        // Notify author
        const notification: Notification = {
          id: generateId('notif'),
          userId: post.authorId,
          type: NotificationType.SYSTEM,
          title: 'Bài viết của bạn đã bị từ chối',
          message: `Bài viết "${post.title.substring(0, 50)}..." đã bị management từ chối. Lý do: ${reviewNotes}`,
          read: false,
          link: `/forum/posts/${post.id}`,
          metadata: {
            approvalRequestId: approval.id,
            type: 'content_moderation',
            contentType: 'post',
            status: status
          },
          createdAt: now()
        };
        await storage.create<Notification>('notifications.json', notification);
      }
    } else if (contentType === 'comment') {
      const comment = await storage.findById<ForumComment>('forum-comments.json', contentId);
      if (comment) {
        await storage.update<ForumComment>('forum-comments.json', contentId, {
          status: status,
          moderationNotes: reviewNotes,
          moderatedBy: reviewerId,
          moderatedAt: now(),
          updatedAt: now()
        });

        // Notify author
        const notification: Notification = {
          id: generateId('notif'),
          userId: comment.authorId,
          type: NotificationType.SYSTEM,
          title: 'Bình luận của bạn đã bị từ chối',
          message: `Bình luận của bạn đã bị management từ chối. Lý do: ${reviewNotes}`,
          read: false,
          link: `/forum/posts/${comment.postId}`,
          metadata: {
            approvalRequestId: approval.id,
            type: 'content_moderation',
            contentType: 'comment',
            status: status
          },
          createdAt: now()
        };
        await storage.create<Notification>('notifications.json', notification);
      }
    }

    console.log(`Successfully rejected ${contentType} ${contentId} for approval ${approval.id}`);

  } catch (error: any) {
    console.error('Error rejecting content moderation:', error);
    throw new Error(`Lỗi từ chối kiểm duyệt nội dung: ${error.message}`);
  }
}

