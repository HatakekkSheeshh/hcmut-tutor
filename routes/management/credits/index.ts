/**
 * Management Training Credits APIs
 * GET /api/management/credits/eligible - Get eligible students
 * POST /api/management/credits/award - Award credits to student(s)
 * GET /api/management/credits/history - Get credit award history
 * PUT /api/management/credits/:id/revoke - Revoke credits
 */

import { Response } from 'express';
import { storage } from '../../../lib/storage.js';
import { 
  User, 
  UserRole,
  Management,
  TrainingCredit,
  CreditEligibility,
  Notification,
  NotificationType
} from '../../../lib/types.js';
import { AuthRequest } from '../../../lib/middleware.js';
import { successResponse, errorResponse, generateId, now } from '../../../lib/utils.js';
import {
  getEligibleStudents,
  awardCredits,
  revokeCredits,
  getCreditHistory
} from '../../../lib/services/creditAwarder.js';

/**
 * GET /api/management/credits/eligible
 */
export async function getEligibleStudentsHandler(req: AuthRequest, res: Response) {
  try {
    const currentUser = req.user!;
    
    // Only management can view eligible students
    if (currentUser.role !== UserRole.MANAGEMENT) {
      return res.status(403).json(errorResponse('Bạn không có quyền truy cập'));
    }

    // Check permissions
    const managementUser = await storage.findById<Management>('users.json', currentUser.userId);
    if (!managementUser || !managementUser.permissions?.includes('award_credits')) {
      return res.status(403).json(errorResponse('Bạn không có quyền xem học sinh đủ điều kiện'));
    }

    const { 
      sessionId, 
      classId, 
      semester,
      minAttendance,
      minSessions,
      minPerformance
    } = req.query;

    const eligible = await getEligibleStudents(
      sessionId as string,
      classId as string,
      semester as string,
      minAttendance ? parseFloat(minAttendance as string) : undefined,
      minSessions ? parseInt(minSessions as string) : undefined,
      minPerformance ? parseFloat(minPerformance as string) : undefined
    );

    return res.json(successResponse(eligible));
  } catch (error: any) {
    console.error('Get eligible students error:', error);
    return res.status(500).json(
      errorResponse('Lỗi lấy danh sách học sinh đủ điều kiện: ' + error.message)
    );
  }
}

/**
 * POST /api/management/credits/award
 */
export async function awardCreditsHandler(req: AuthRequest, res: Response) {
  try {
    const currentUser = req.user!;
    
    // Only management can award credits
    if (currentUser.role !== UserRole.MANAGEMENT) {
      return res.status(403).json(errorResponse('Bạn không có quyền trao tín chỉ'));
    }

    // Check permissions
    const managementUser = await storage.findById<Management>('users.json', currentUser.userId);
    if (!managementUser || !managementUser.permissions?.includes('award_credits')) {
      return res.status(403).json(errorResponse('Bạn không có quyền trao tín chỉ'));
    }

    const { 
      studentIds, 
      sessionId, 
      classId, 
      semester,
      credits, 
      reason,
      metadata
    } = req.body;

    const awards = await awardCredits(
      studentIds,
      credits,
      reason,
      currentUser.userId,
      sessionId,
      classId,
      semester,
      metadata
    );

    // Notify students about awards
    const notifications = awards.map(award => ({
      id: generateId('notif'),
      userId: award.studentId,
      type: NotificationType.SYSTEM,
      title: 'Tín chỉ đào tạo đã được trao',
      message: `Bạn đã được trao ${award.credits} tín chỉ đào tạo. Lý do: ${award.reason}`,
      read: false,
      link: '/student/credits',
      metadata: {
        creditId: award.id,
        credits: award.credits,
        reason: award.reason
      },
      createdAt: now()
    }));

    await Promise.all(
      notifications.map(notif => storage.create<Notification>('notifications.json', notif))
    );

    return res.status(201).json(
      successResponse(awards, `Đã trao tín chỉ cho ${awards.length} học sinh`)
    );
  } catch (error: any) {
    console.error('Award credits error:', error);
    return res.status(500).json(
      errorResponse('Lỗi trao tín chỉ: ' + error.message)
    );
  }
}

/**
 * GET /api/management/credits/history
 */
export async function getCreditHistoryHandler(req: AuthRequest, res: Response) {
  try {
    const currentUser = req.user!;
    
    // Only management can view credit history
    if (currentUser.role !== UserRole.MANAGEMENT) {
      return res.status(403).json(errorResponse('Bạn không có quyền truy cập'));
    }

    // Check permissions
    const managementUser = await storage.findById<Management>('users.json', currentUser.userId);
    if (!managementUser || !managementUser.permissions?.includes('award_credits')) {
      return res.status(403).json(errorResponse('Bạn không có quyền xem lịch sử trao tín chỉ'));
    }

    const { studentId, semester, page = '1', limit = '20' } = req.query;

    const result = await getCreditHistory(
      studentId as string,
      semester as string,
      parseInt(page as string),
      parseInt(limit as string)
    );

    // Get student and awarder info
    const studentIds = Array.from(new Set(result.data.map(c => c.studentId)));
    const awarderIds = Array.from(new Set(result.data.map(c => c.awardedBy)));
    const allUserIds = [...studentIds, ...awarderIds];
    const usersMap = await storage.findByIds<User>('users.json', allUserIds);

    const enrichedData = result.data.map(credit => {
      const student = usersMap.get(credit.studentId);
      const awarder = usersMap.get(credit.awardedBy);
      return {
        ...credit,
        student: student ? {
          id: student.id,
          name: student.name,
          email: student.email
        } : null,
        awarder: awarder ? {
          id: awarder.id,
          name: awarder.name,
          email: awarder.email
        } : null
      };
    });

    return res.json(successResponse({
      data: enrichedData,
      pagination: result.pagination
    }));
  } catch (error: any) {
    console.error('Get credit history error:', error);
    return res.status(500).json(
      errorResponse('Lỗi lấy lịch sử trao tín chỉ: ' + error.message)
    );
  }
}

/**
 * PUT /api/management/credits/:id/revoke
 */
export async function revokeCreditsHandler(req: AuthRequest, res: Response) {
  try {
    const currentUser = req.user!;
    const { id } = req.params;
    const { reason } = req.body;

    // Only management can revoke credits
    if (currentUser.role !== UserRole.MANAGEMENT) {
      return res.status(403).json(errorResponse('Bạn không có quyền thu hồi tín chỉ'));
    }

    // Check permissions
    const managementUser = await storage.findById<Management>('users.json', currentUser.userId);
    if (!managementUser || !managementUser.permissions?.includes('award_credits')) {
      return res.status(403).json(errorResponse('Bạn không có quyền thu hồi tín chỉ'));
    }

    const revokedCredit = await revokeCredits(id, currentUser.userId, reason);

    // Notify student
    const notification: Notification = {
      id: generateId('notif'),
      userId: revokedCredit.studentId,
      type: NotificationType.SYSTEM,
      title: 'Tín chỉ đào tạo đã bị thu hồi',
      message: `Tín chỉ đào tạo của bạn đã bị thu hồi. Lý do: ${reason}`,
      read: false,
      link: '/student/credits',
      metadata: {
        creditId: revokedCredit.id,
        credits: revokedCredit.credits,
        reason: revokedCredit.revokeReason
      },
      createdAt: now()
    };
    await storage.create<Notification>('notifications.json', notification);

    return res.json(
      successResponse(revokedCredit, 'Thu hồi tín chỉ thành công')
    );
  } catch (error: any) {
    console.error('Revoke credits error:', error);
    return res.status(500).json(
      errorResponse('Lỗi thu hồi tín chỉ: ' + error.message)
    );
  }
}

