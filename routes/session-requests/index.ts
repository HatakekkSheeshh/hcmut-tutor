/**
 * Session Requests APIs
 * GET /api/session-requests - List session requests
 * POST /api/session-requests - Create new session request
 */

import { Response } from 'express';
import { storage } from '../../lib/storage.js';
import { 
  SessionRequest, 
  Session, 
  User, 
  Class,
  Notification, 
  NotificationType,
  UserRole,
  SessionStatus,
  RequestType,
  RequestStatus,
  Availability,
  ClassStatus
} from '../../lib/types.js';
import { AuthRequest } from '../../lib/middleware.js';
import { successResponse, errorResponse, generateId, now } from '../../lib/utils.js';

/**
 * GET /api/session-requests
 */
export async function listSessionRequestsHandler(req: AuthRequest, res: Response) {
  try {
    const {
      status,
      type,
      tutorId,
      studentId,
      classId,
      page = '1',
      limit = '10'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const currentUser = req.user!;

    // Build filter
    const filter = (request: SessionRequest) => {
      // Authorization:
      // - Tutors can see requests for their sessions
      // - Students can see their own requests
      // - Management can see all
      if (currentUser.role === UserRole.TUTOR) {
        if (request.tutorId !== currentUser.userId) return false;
      } else if (currentUser.role === UserRole.STUDENT) {
        if (request.studentId !== currentUser.userId) return false;
      }
      // Management can see all (no filter needed)

      if (status && request.status !== status) return false;
      if (type && request.type !== type) return false;
      if (tutorId && request.tutorId !== tutorId) return false;
      if (studentId && request.studentId !== studentId) return false;
      if (classId && request.classId !== classId) return false;

      return true;
    };

    const result = await storage.paginate<SessionRequest>(
      'session-requests.json',
      pageNum,
      limitNum,
      filter
    );

    // Enrich with session, student, tutor, and class info
    const enrichedData = await Promise.all(
      result.data.map(async (request) => {
        const session = await storage.findById<Session>('sessions.json', request.sessionId);
        const student = await storage.findById<User>('users.json', request.studentId);
        const tutor = await storage.findById<User>('users.json', request.tutorId);
        let classInfo = null;
        
        if (request.classId) {
          const classItem = await storage.findById<Class>('classes.json', request.classId);
          if (classItem) {
            classInfo = {
              id: classItem.id,
              code: classItem.code,
              subject: classItem.subject,
              day: classItem.day,
              startTime: classItem.startTime,
              endTime: classItem.endTime
            };
          }
        }

        return {
          ...request,
          session: session ? {
            id: session.id,
            subject: session.subject,
            topic: session.topic,
            startTime: session.startTime,
            endTime: session.endTime,
            status: session.status,
            isOnline: session.isOnline,
            location: session.location,
            meetingLink: session.meetingLink
          } : null,
          student: student ? {
            id: student.id,
            name: student.name,
            email: student.email,
            avatar: student.avatar,
            hcmutId: student.hcmutId
          } : null,
          tutor: tutor ? {
            id: tutor.id,
            name: tutor.name,
            email: tutor.email,
            avatar: tutor.avatar
          } : null,
          class: classInfo
        };
      })
    );

    return res.json({
      success: true,
      data: enrichedData,
      pagination: result.pagination
    });
  } catch (error: any) {
    console.error('List session requests error:', error);
    return res.status(500).json(
      errorResponse('Lỗi lấy danh sách yêu cầu: ' + error.message)
    );
  }
}

/**
 * Helper function to validate reschedule preferred time
 * Checks:
 * 1. If preferred time is within tutor's availability
 * 2. If preferred time conflicts with existing sessions (excluding current session)
 * 3. If preferred time conflicts with tutor's classes
 */
async function validateRescheduleTime(
  tutorId: string,
  preferredStartTime: string,
  preferredEndTime: string,
  excludeSessionId?: string
): Promise<string | null> {
  const preferredStart = new Date(preferredStartTime);
  const preferredEnd = new Date(preferredEndTime);
  const preferredDay = preferredStart.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const preferredStartTimeStr = preferredStart.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false 
  });
  const preferredEndTimeStr = preferredEnd.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false 
  });

  // 1. Check if preferred time is within tutor's availability
  const availabilities = await storage.find<Availability>(
    'availability.json',
    (a) => a.tutorId === tutorId
  );

  if (availabilities.length === 0) {
    return 'Gia sư chưa cài đặt lịch rảnh. Vui lòng liên hệ gia sư để biết thêm thông tin.';
  }

  const availability = availabilities[0];
  const matchingSlot = availability.timeSlots.find(
    (slot) => slot.day.toLowerCase() === preferredDay
  );

  if (!matchingSlot) {
    return `Gia sư không có lịch rảnh vào ${preferredDay}. Vui lòng chọn ngày khác.`;
  }

  // Check if preferred time is within availability slot
  const parseTime = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const availStart = parseTime(matchingSlot.startTime);
  const availEnd = parseTime(matchingSlot.endTime);
  const preferredStartMin = parseTime(preferredStartTimeStr);
  const preferredEndMin = parseTime(preferredEndTimeStr);

  if (preferredStartMin < availStart || preferredEndMin > availEnd) {
    return `Thời gian mong muốn phải nằm trong khoảng ${matchingSlot.startTime} - ${matchingSlot.endTime} của gia sư vào ${preferredDay}.`;
  }

  // 2. Check for conflicts with existing sessions (excluding current session)
  const existingSessions = await storage.find<Session>(
    'sessions.json',
    (s) => s.tutorId === tutorId && 
           s.id !== excludeSessionId && 
           (s.status === SessionStatus.CONFIRMED || s.status === SessionStatus.PENDING) &&
           !s.classId // Only check individual sessions
  );

  for (const existingSession of existingSessions) {
    const existingStart = new Date(existingSession.startTime);
    const existingEnd = new Date(existingSession.endTime);

    // Check if sessions overlap (same date and overlapping times)
    if (
      existingStart.toDateString() === preferredStart.toDateString() &&
      (
        (preferredStart >= existingStart && preferredStart < existingEnd) ||
        (preferredEnd > existingStart && preferredEnd <= existingEnd) ||
        (preferredStart <= existingStart && preferredEnd >= existingEnd)
      )
    ) {
      return `Thời gian mong muốn trùng với buổi học khác (${existingSession.subject}, ${existingStart.toLocaleString('vi-VN')}). Vui lòng chọn thời gian khác.`;
    }
  }

  // 3. Check for conflicts with tutor's classes
  const tutorClasses = await storage.find<Class>(
    'classes.json',
    (c) => c.tutorId === tutorId && 
           c.status !== ClassStatus.INACTIVE &&
           c.day.toLowerCase() === preferredDay
  );

  for (const classItem of tutorClasses) {
    const classStart = parseTime(classItem.startTime);
    const classEnd = parseTime(classItem.endTime);

    // Check if preferred time overlaps with class time
    if (
      (preferredStartMin >= classStart && preferredStartMin < classEnd) ||
      (preferredEndMin > classStart && preferredEndMin <= classEnd) ||
      (preferredStartMin <= classStart && preferredEndMin >= classEnd)
    ) {
      return `Thời gian mong muốn trùng với lịch lớp ${classItem.code} (${classItem.startTime} - ${classItem.endTime}). Vui lòng chọn thời gian khác.`;
    }
  }

  return null; // No validation errors
}

/**
 * POST /api/session-requests
 */
export async function createSessionRequestHandler(req: AuthRequest, res: Response) {
  try {
    const currentUser = req.user!;
    const { sessionId, type, reason, preferredStartTime, preferredEndTime } = req.body;

    // Only students can create requests
    if (currentUser.role !== UserRole.STUDENT) {
      return res.status(403).json(
        errorResponse('Chỉ sinh viên mới có thể tạo yêu cầu hủy/đổi lịch')
      );
    }

    // Get session details
    const session = await storage.findById<Session>('sessions.json', sessionId);
    if (!session) {
      return res.status(404).json(errorResponse('Không tìm thấy buổi học'));
    }

    // Check if session belongs to student
    if (!session.studentIds?.includes(currentUser.userId)) {
      return res.status(403).json(
        errorResponse('Bạn không có quyền tạo yêu cầu cho buổi học này')
      );
    }

    // Check if session status allows requests
    if (session.status !== SessionStatus.CONFIRMED && session.status !== SessionStatus.PENDING) {
      return res.status(400).json(
        errorResponse('Buổi học này không thể hủy hoặc đổi lịch (đã hoàn thành hoặc đã hủy)')
      );
    }

    // Check for duplicate pending request
    const existingRequests = await storage.find<SessionRequest>(
      'session-requests.json',
      (r) => 
        r.sessionId === sessionId &&
        r.studentId === currentUser.userId &&
        r.status === RequestStatus.PENDING
    );

    if (existingRequests.length > 0) {
      return res.status(400).json(
        errorResponse('Bạn đã có yêu cầu đang chờ xử lý cho buổi học này')
      );
    }

    // Validate preferred time for reschedule requests
    if (type === RequestType.RESCHEDULE && preferredStartTime && preferredEndTime) {
      const validationError = await validateRescheduleTime(
        session.tutorId,
        preferredStartTime,
        preferredEndTime,
        sessionId // Exclude current session from conflict check
      );

      if (validationError) {
        return res.status(400).json(errorResponse(validationError));
      }
    }

    // Create request
    const newRequest: SessionRequest = {
      id: generateId('req'),
      sessionId: sessionId,
      studentId: currentUser.userId,
      tutorId: session.tutorId,
      classId: session.classId, // Copy from session to distinguish class vs individual
      type: type,
      status: RequestStatus.PENDING,
      reason: reason,
      preferredStartTime: preferredStartTime,
      preferredEndTime: preferredEndTime,
      createdAt: now(),
      updatedAt: now()
    };

    await storage.create('session-requests.json', newRequest);

    // Create notification for tutor
    const notificationType = type === RequestType.CANCEL
      ? NotificationType.SESSION_CANCEL_REQUEST
      : NotificationType.SESSION_RESCHEDULE_REQUEST;

    const student = await storage.findById<User>('users.json', currentUser.userId);
    const notification: Notification = {
      id: generateId('notif'),
      userId: session.tutorId,
      type: notificationType,
      title: type === RequestType.CANCEL ? 'Yêu cầu hủy buổi học' : 'Yêu cầu đổi lịch buổi học',
      message: `${student?.name || currentUser.email} đã gửi yêu cầu ${type === RequestType.CANCEL ? 'hủy' : 'đổi lịch'} buổi học ${session.subject}`,
      read: false,
      link: `/tutor/cancel-reschedule`,
      metadata: {
        requestId: newRequest.id,
        sessionId: sessionId,
        type: type,
        classId: session.classId
      },
      createdAt: now()
    };
    await storage.create('notifications.json', notification);

    // Get enriched request data
    const tutor = await storage.findById<User>('users.json', session.tutorId);
    let classInfo = null;
    
    if (session.classId) {
      const classItem = await storage.findById<Class>('classes.json', session.classId);
      if (classItem) {
        classInfo = {
          id: classItem.id,
          code: classItem.code,
          subject: classItem.subject
        };
      }
    }

    return res.status(201).json(
      successResponse(
        {
          ...newRequest,
          session: {
            id: session.id,
            subject: session.subject,
            topic: session.topic,
            startTime: session.startTime,
            endTime: session.endTime
          },
          student: student ? {
            id: student.id,
            name: student.name,
            email: student.email
          } : null,
          tutor: tutor ? {
            id: tutor.id,
            name: tutor.name,
            email: tutor.email
          } : null,
          class: classInfo
        },
        'Tạo yêu cầu thành công'
      )
    );
  } catch (error: any) {
    console.error('Create session request error:', error);
    return res.status(500).json(
      errorResponse('Lỗi tạo yêu cầu: ' + error.message)
    );
  }
}

