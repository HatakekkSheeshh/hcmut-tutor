/**
 * Session Detail APIs
 * GET /api/sessions/:id - Get session detail
 * PUT /api/sessions/:id - Update session
 * DELETE /api/sessions/:id - Cancel session
 * POST /api/sessions/:id/reschedule - Reschedule session
 */

import { Response } from 'express';
import { storage } from '../../lib/storage.js';
import { Session, SessionStatus, UserRole, Notification, NotificationType, ApprovalRequest, ApprovalRequestType, ApprovalRequestStatus, User } from '../../lib/types.js';
import { AuthRequest } from '../../lib/middleware.js';
import { successResponse, errorResponse, now, generateId } from '../../lib/utils.js';

/**
 * GET /api/sessions/:id
 */
export async function getSessionHandler(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    const session = await storage.findById<Session>('sessions.json', id);

    if (!session) {
      return res.status(404).json(errorResponse('Không tìm thấy buổi học'));
    }

    // Authorization check
    if (
      currentUser.role !== UserRole.MANAGEMENT &&
      !session.studentIds?.includes(currentUser.userId) &&
      session.tutorId !== currentUser.userId
    ) {
      return res.status(403).json(errorResponse('Bạn không có quyền xem buổi học này'));
    }

    return res.json(successResponse(session));
  } catch (error: any) {
    return res.status(500).json(
      errorResponse('Lỗi lấy thông tin buổi học: ' + error.message)
    );
  }
}

/**
 * PUT /api/sessions/:id
 */
export async function updateSessionHandler(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const updates = req.body;
    const currentUser = req.user!;

    const session = await storage.findById<Session>('sessions.json', id);
    if (!session) {
      return res.status(404).json(errorResponse('Không tìm thấy buổi học'));
    }

    // Authorization: only tutor can update (e.g., confirm session)
    if (session.tutorId !== currentUser.userId && currentUser.role !== UserRole.MANAGEMENT) {
      return res.status(403).json(errorResponse('Chỉ gia sư mới có thể cập nhật buổi học'));
    }

    // Don't allow changing certain fields
    delete updates.id;
    delete updates.studentId;
    delete updates.tutorId;
    delete updates.createdAt;

    // Check for time conflicts if startTime/endTime/duration is being updated
    if (updates.startTime || updates.endTime || updates.duration) {
      const newStartTime = updates.startTime ? new Date(updates.startTime) : new Date(session.startTime);
      const newEndTime = updates.endTime ? new Date(updates.endTime) : 
                        (updates.duration ? new Date(newStartTime.getTime() + updates.duration * 60 * 1000) : 
                        new Date(session.endTime));

      // Check for conflicts with other sessions of the same tutor
      const existingSessions = await storage.find<Session>(
        'sessions.json',
        (s) => s.tutorId === session.tutorId && 
               s.id !== id && // Exclude current session
               (s.status === SessionStatus.CONFIRMED || s.status === SessionStatus.PENDING) &&
               !s.classId // Only check individual sessions
      );

      // Buffer time between sessions (30 minutes)
      const SESSION_BUFFER_MINUTES = 30;

      for (const existingSession of existingSessions) {
        const existingStart = new Date(existingSession.startTime);
        const existingEnd = new Date(existingSession.endTime);

        // Check if same date
        if (existingStart.toDateString() !== newStartTime.toDateString()) {
          continue;
        }

        // Apply buffer time: new time must start at least 30 minutes after existing session ends
        // and must end at least 30 minutes before existing session starts
        const existingEndWithBuffer = new Date(existingEnd.getTime() + SESSION_BUFFER_MINUTES * 60 * 1000);
        const existingStartWithBuffer = new Date(existingStart.getTime() - SESSION_BUFFER_MINUTES * 60 * 1000);

        // Check if new time overlaps with existing session (including buffer)
        if (
          (newStartTime < existingEndWithBuffer && newEndTime > existingStartWithBuffer)
        ) {
          return res.status(400).json(
            errorResponse(`Thời gian mới trùng với buổi học khác (${existingSession.subject}, ${existingStart.toLocaleString('vi-VN')}) hoặc không đủ thời gian nghỉ (cần ít nhất ${SESSION_BUFFER_MINUTES} phút giữa các buổi học). Vui lòng chọn thời gian khác.`)
          );
        }
      }
    }

    const updatedSession = await storage.update<Session>(
      'sessions.json',
      id,
      { ...updates, updatedAt: now() }
    );

    // If tutor is confirming an offline session without location, create approval request for room allocation
    if (
      updates.status === SessionStatus.CONFIRMED &&
      updatedSession.isOnline === false &&
      !updatedSession.location &&
      currentUser.userId === session.tutorId &&
      currentUser.role === UserRole.TUTOR
    ) {
      try {
        // Get equipment requirements from request body if provided
        const equipmentRequirements = (req.body as any).equipmentRequirements || [];
        
        // Create approval request for room allocation
        const approvalRequest: ApprovalRequest = {
          id: generateId('approval'),
          type: ApprovalRequestType.RESOURCE_ALLOCATION,
          requesterId: currentUser.userId,
          targetId: id,
          title: `Yêu cầu phân bổ phòng học cho buổi học ${updatedSession.subject}`,
          description: `Buổi học offline đã được tutor xác nhận nhưng chưa có phòng học. Vui lòng phân bổ phòng học phù hợp.\n\nThời gian: ${new Date(updatedSession.startTime).toLocaleString('vi-VN')} - ${new Date(updatedSession.endTime).toLocaleString('vi-VN')}\nMôn học: ${updatedSession.subject}\nSố học sinh: ${updatedSession.studentIds?.length || 1}${equipmentRequirements.length > 0 ? `\n\nYêu cầu thiết bị: ${equipmentRequirements.join(', ')}` : ''}`,
          status: ApprovalRequestStatus.PENDING,
          priority: 'high',
          deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 48 hours
          resourceAllocationData: {
            changes: [
              {
                type: 'reallocate_room',
                resourceId: id,
                fromValue: null, // No location currently
                toValue: null, // Will be set by manager when approving
                reason: equipmentRequirements.length > 0 
                  ? `Offline session requires room allocation with equipment: ${equipmentRequirements.join(', ')}`
                  : 'Offline session requires room allocation',
                equipmentRequirements: equipmentRequirements // Store equipment requirements
              }
            ],
            affectedSessionIds: [id],
            affectedTutorIds: [updatedSession.tutorId],
            affectedStudentIds: updatedSession.studentIds || []
          },
          createdAt: now(),
          updatedAt: now()
        };

        await storage.create<ApprovalRequest>('approvals.json', approvalRequest);

        // Create notifications for management users
        const managementUsers = await storage.find<User>(
          'users.json',
          (u: any) => u.role === UserRole.MANAGEMENT
        );

        const notifications = managementUsers.map((manager: any) => ({
          id: generateId('notif'),
          userId: manager.id,
          type: NotificationType.APPROVAL_REQUEST,
          title: 'Yêu cầu phân bổ phòng học mới',
          message: `Buổi học offline ${updatedSession.subject} cần được phân bổ phòng học`,
          read: false,
          link: `/management/approvals/${approvalRequest.id}`,
          metadata: {
            approvalRequestId: approvalRequest.id,
            type: ApprovalRequestType.RESOURCE_ALLOCATION,
            priority: 'high',
            sessionId: id
          },
          createdAt: now()
        }));

        await Promise.all(
          notifications.map((notif: any) => storage.create<Notification>('notifications.json', notif))
        );

        // Notify tutor that approval request has been created
        const tutorNotification: Notification = {
          id: generateId('notif'),
          userId: currentUser.userId,
          type: NotificationType.APPROVAL_REQUEST,
          title: 'Yêu cầu phân bổ phòng học đã được tạo',
          message: `Yêu cầu phân bổ phòng học cho buổi học ${updatedSession.subject} đã được gửi tới management. Phòng học sẽ được phân bổ sau khi management phê duyệt.`,
          read: false,
          link: `/sessions/${id}`,
          metadata: {
            approvalRequestId: approvalRequest.id,
            type: ApprovalRequestType.RESOURCE_ALLOCATION
          },
          createdAt: now()
        };
        await storage.create<Notification>('notifications.json', tutorNotification);

        console.log(`Created room allocation approval request ${approvalRequest.id} for session ${id}`);
      } catch (error: any) {
        console.error('Error creating room allocation approval request:', error);
        // Don't fail the session update if approval request creation fails
        // Log error but continue with session update
      }
    }

    return res.json(successResponse(updatedSession, 'Cập nhật buổi học thành công'));
  } catch (error: any) {
    return res.status(500).json(
      errorResponse('Lỗi cập nhật buổi học: ' + error.message)
    );
  }
}

/**
 * DELETE /api/sessions/:id (Cancel session)
 */
export async function cancelSessionHandler(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const currentUser = req.user!;

    const session = await storage.findById<Session>('sessions.json', id);
    if (!session) {
      return res.status(404).json(errorResponse('Không tìm thấy buổi học'));
    }

    // Both student and tutor can cancel
    if (
      !session.studentIds?.includes(currentUser.userId) &&
      session.tutorId !== currentUser.userId &&
      currentUser.role !== UserRole.MANAGEMENT
    ) {
      return res.status(403).json(errorResponse('Bạn không có quyền hủy buổi học này'));
    }

    // Update session status to cancelled
    await storage.update<Session>('sessions.json', id, {
      status: SessionStatus.CANCELLED,
      cancelledBy: currentUser.userId,
      cancelReason: reason,
      updatedAt: now()
    });

    // Notify all students and tutor (except current user) - batch create
    const notifyUserIds = [...session.studentIds, session.tutorId].filter(
      uid => uid !== currentUser.userId
    );
    
    if (notifyUserIds.length > 0) {
      const notifications: Notification[] = notifyUserIds.map(notifyUserId => ({
        id: require('../../lib/utils.js').generateId('notif'),
        userId: notifyUserId,
        type: NotificationType.SESSION_CANCELLED,
        title: 'Buổi học đã bị hủy',
        message: `Buổi học ${session.subject} đã bị hủy: ${reason}`,
        read: false,
        link: `/sessions/${id}`,
        createdAt: now()
      }));
      await storage.createMany('notifications.json', notifications);
    }

    return res.json(successResponse(null, 'Hủy buổi học thành công'));
  } catch (error: any) {
    return res.status(500).json(
      errorResponse('Lỗi hủy buổi học: ' + error.message)
    );
  }
}

/**
 * POST /api/sessions/:id/reschedule
 */
export async function rescheduleSessionHandler(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { startTime, endTime, reason } = req.body;
    const currentUser = req.user!;

    const session = await storage.findById<Session>('sessions.json', id);
    if (!session) {
      return res.status(404).json(errorResponse('Không tìm thấy buổi học'));
    }

    // Both student and tutor can reschedule
    if (
      !session.studentIds?.includes(currentUser.userId) &&
      session.tutorId !== currentUser.userId
    ) {
      return res.status(403).json(errorResponse('Bạn không có quyền đổi lịch buổi học này'));
    }

    // Calculate new duration
    const duration = Math.round(
      (new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60)
    );

    // Update session
    const updatedSession = await storage.update<Session>('sessions.json', id, {
      startTime,
      endTime,
      duration,
      status: SessionStatus.RESCHEDULED,
      rescheduledFrom: session.startTime,
      updatedAt: now()
    });

    // Notify all students and tutor (except current user) - batch create
    const notifyUserIds = [...session.studentIds, session.tutorId].filter(
      uid => uid !== currentUser.userId
    );
    
    if (notifyUserIds.length > 0) {
      const notifications: Notification[] = notifyUserIds.map(notifyUserId => ({
        id: require('../../lib/utils.js').generateId('notif'),
        userId: notifyUserId,
        type: NotificationType.SESSION_RESCHEDULED,
        title: 'Buổi học đã được đổi lịch',
        message: `Buổi học ${session.subject} đã được đổi sang ${new Date(startTime).toLocaleString('vi-VN')}`,
        read: false,
        link: `/sessions/${id}`,
        metadata: { reason },
        createdAt: now()
      }));
      await storage.createMany('notifications.json', notifications);
    }

    return res.json(successResponse(updatedSession, 'Đổi lịch buổi học thành công'));
  } catch (error: any) {
    return res.status(500).json(
      errorResponse('Lỗi đổi lịch buổi học: ' + error.message)
    );
  }
}

