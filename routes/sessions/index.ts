/**
 * Sessions APIs
 * GET /api/sessions - List sessions
 * POST /api/sessions - Book new session
 */

import { Response } from 'express';
import { storage } from '../../lib/storage.js';
import { Session, SessionStatus, UserRole, NotificationType, Class, ClassStatus, User } from '../../lib/types.js';
import { AuthRequest } from '../../lib/middleware.js';
import { successResponse, errorResponse, generateId, now } from '../../lib/utils.js';
import { queueNotification } from '../../lib/services/notificationQueue.js';
import { normalizeUserId } from '../../lib/idNormalizer.js';
/**
 * GET /api/sessions
 */
export async function listSessionsHandler(req: AuthRequest, res: Response) {
  try {
    const {
      studentId,
      tutorId,
      status,
      startDate,
      endDate,
      classId,
      page = '1',
      limit = '10'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const currentUser = req.user!;

    // Normalize studentId if provided (convert ObjectId to custom ID)
    let normalizedStudentId: string | undefined;
    if (studentId) {
      normalizedStudentId = await normalizeUserId(studentId as string);
    }

    // Normalize currentUser.userId (in case it's ObjectId)
    const normalizedCurrentUserId = await normalizeUserId(currentUser.userId);

    // Build filter
    const filter = (session: Session) => {
      // Authorization: users can only see their own sessions unless management
      if (currentUser.role !== UserRole.MANAGEMENT) {
        if (
          !session.studentIds?.includes(normalizedCurrentUserId) &&
          session.tutorId !== normalizedCurrentUserId
        ) {
          return false;
        }
      }

      // Filter by studentId (use normalized ID)
      if (normalizedStudentId && !session.studentIds?.includes(normalizedStudentId)) return false;

      // Filter by tutorId
      if (tutorId && session.tutorId !== tutorId) return false;

      // Filter by classId
      if (classId) {
        if (classId === 'null' || classId === 'undefined') {
          // Filter for individual sessions (no classId)
          if (session.classId) return false;
        } else {
          // Filter for specific class sessions
          if (session.classId !== classId) return false;
        }
      }

      // Filter by status (support comma-separated values like "confirmed,pending")
      if (status) {
        const statusList = (status as string).split(',').map(s => s.trim());
        if (!statusList.includes(session.status)) return false;
      }

      // Filter by date range
      if (startDate) {
        if (new Date(session.startTime) < new Date(startDate as string)) {
          return false;
        }
      }
      if (endDate) {
        if (new Date(session.startTime) > new Date(endDate as string)) {
          return false;
        }
      }

      return true;
    };

    const result = await storage.paginate<Session>(
      'sessions.json',
      pageNum,
      limitNum,
      filter
    );

    return res.json(result);
  } catch (error: any) {
    console.error('List sessions error:', error);
    return res.status(500).json(
      errorResponse('Lỗi lấy danh sách buổi học: ' + error.message)
    );
  }
}

/**
 * POST /api/sessions
 */
/**
 * Helper function to check time conflict between two time ranges
 */
function hasTimeConflict(
  day1: string,
  start1: string,
  end1: string,
  day2: string,
  start2: string,
  end2: string
): boolean {
  // Different days = no conflict
  if (day1 !== day2) return false;

  // Convert time strings to minutes for comparison
  const parseTime = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const start1Min = parseTime(start1);
  const end1Min = parseTime(end1);
  const start2Min = parseTime(start2);
  const end2Min = parseTime(end2);

  // Check time overlap
  return (
    (start1Min >= start2Min && start1Min < end2Min) ||
    (end1Min > start2Min && end1Min <= end2Min) ||
    (start1Min <= start2Min && end1Min >= end2Min)
  );
}

export async function createSessionHandler(req: AuthRequest, res: Response) {
  try {
    const currentUser = req.user!;
    const sessionData = req.body;

    // Only students can book sessions
    if (currentUser.role !== UserRole.STUDENT) {
      return res.status(403).json(
        errorResponse('Chỉ sinh viên mới có thể đặt buổi học')
      );
    }

    // Verify tutor exists
    const tutor = await storage.findById<User>('users.json', sessionData.tutorId);
    if (!tutor || tutor.role !== UserRole.TUTOR) {
      return res.status(404).json(
        errorResponse('Không tìm thấy gia sư')
      );
    }

    const studentIds = [currentUser.userId];
    const tutorId = sessionData.tutorId;
    const subject = sessionData.subject;

    // Check for conflicts with tutor's class schedules
    const tutorClasses = await storage.find<Class>(
      'classes.json',
      (c) => c.tutorId === tutorId && c.status !== ClassStatus.INACTIVE
    );

    // Get day name from session start time
    const sessionDate = new Date(sessionData.startTime);
    const sessionDay = sessionDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const sessionStartTime = sessionDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const sessionEndTime = new Date(new Date(sessionData.startTime).getTime() + (sessionData.duration || 60) * 60000)
      .toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

    // Check for conflicts with classes on the same day
    for (const classItem of tutorClasses) {
      if (hasTimeConflict(
        sessionDay,
        sessionStartTime,
        sessionEndTime,
        classItem.day.toLowerCase(),
        classItem.startTime,
        classItem.endTime
      )) {
        return res.status(400).json(
          errorResponse(`Thời gian buổi học trùng với lớp ${classItem.code} (${classItem.day} ${classItem.startTime}-${classItem.endTime}). Vui lòng chọn thời gian khác.`)
        );
      }
    }

    // Check for conflicts with existing sessions at the exact same date and time
    // Include buffer time (30 minutes) between sessions
    const existingSessions = await storage.find<Session>(
      'sessions.json',
      (s) => s.tutorId === tutorId && 
             !s.classId && // Only check non-class-based sessions
             (s.status === SessionStatus.CONFIRMED || s.status === SessionStatus.PENDING) // Only check confirmed/pending sessions
    );

    const newSessionStart = new Date(sessionData.startTime);
    const newSessionEnd = new Date(newSessionStart.getTime() + (sessionData.duration || 60) * 60000);

    // Buffer time between sessions (30 minutes)
    const SESSION_BUFFER_MINUTES = 30;

    for (const existingSession of existingSessions) {
      const existingStart = new Date(existingSession.startTime);
      const existingEnd = new Date(existingStart.getTime() + (existingSession.duration || 60) * 60000);

      // Check if same date
      if (existingStart.toDateString() !== newSessionStart.toDateString()) {
        continue;
      }

      // Apply buffer time: new session must start at least 30 minutes after existing session ends
      // and must end at least 30 minutes before existing session starts
      const existingEndWithBuffer = new Date(existingEnd.getTime() + SESSION_BUFFER_MINUTES * 60 * 1000);
      const existingStartWithBuffer = new Date(existingStart.getTime() - SESSION_BUFFER_MINUTES * 60 * 1000);

      // Check if new session overlaps with existing session (including buffer)
      if (
        (newSessionStart < existingEndWithBuffer && newSessionEnd > existingStartWithBuffer)
      ) {
        return res.status(400).json(
          errorResponse(`Thời gian buổi học trùng với buổi học khác hoặc không đủ thời gian nghỉ (cần ít nhất ${SESSION_BUFFER_MINUTES} phút giữa các buổi học). Vui lòng chọn thời gian khác.`)
        );
      }
    }

    // Create new session
    const newSession: Session = {
      id: generateId('ses'),
      studentIds: studentIds,
      tutorId: tutorId,
      subject: subject,
      topic: sessionData.topic,
      description: sessionData.description,
      status: SessionStatus.PENDING,
      startTime: sessionData.startTime,
      endTime: sessionData.endTime,
      duration: sessionData.duration,
      isOnline: sessionData.isOnline ?? true,
      meetingLink: sessionData.meetingLink,
      location: sessionData.location,
      notes: sessionData.notes || '',
      classId: undefined, // Sessions are always individual (not class-based)
      createdAt: now(),
      updatedAt: now()
    };

    await storage.create('sessions.json', newSession);

    // Notify tutor
    const requester = await storage.findById<User>('users.json', currentUser.userId); 
    const fallbackName = requester?.hcmutId || currentUser.email;
    const displayName = requester?.name || fallbackName;
    const type = NotificationType.SESSION_BOOKING;
    const title = 'Yêu cầu buổi học mới';
    const message = `${displayName} đã đặt buổi học ${subject}`;
    const link = `/sessions/${newSession.id}`;
    await queueNotification(
      tutorId,
      {
        type: type,
        title: title,
        message: message,
        link: link
      },
      5 // Delay: 5 phút
    );

    return res.status(201).json(
      successResponse(newSession, 'Đặt buổi học thành công')
    );
  } catch (error: any) {
    console.error('Create session error:', error);
    return res.status(500).json(
      errorResponse('Lỗi tạo buổi học: ' + error.message)
    );
  }
}

