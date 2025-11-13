/**
 * Management Resource Allocation APIs
 * GET /api/management/resources/overview - Get resource overview
 * GET /api/management/resources/inefficiencies - Identify inefficiencies
 * POST /api/management/resources/optimize - Generate optimization plan
 * POST /api/management/resources/apply - Apply optimization
 * POST /api/management/resources/manual-override - Manual override
 */

import { Response } from 'express';
import { storage } from '../../../lib/storage.js';
import { 
  User, 
  UserRole,
  Management,
  Tutor,
  ResourceAllocation,
  ResourceInefficiency,
  OptimizationPlan,
  OptimizationChange,
  Notification,
  NotificationType,
  ApprovalRequest,
  ApprovalRequestType,
  ApprovalRequestStatus,
  Session,
  Class,
  Enrollment
} from '../../../lib/types.js';
import { AuthRequest } from '../../../lib/middleware.js';
import { successResponse, errorResponse, generateId, now } from '../../../lib/utils.js';
import {
  calculateTutorWorkload,
  identifyInefficiencies,
  generateOptimizationPlan,
  applyOptimizationChanges
} from '../../../lib/services/resourceOptimizer.js';

/**
 * GET /api/management/resources/overview
 */
export async function getResourceOverviewHandler(req: AuthRequest, res: Response) {
  try {
    const currentUser = req.user!;
    
    // Only management can view resource overview
    if (currentUser.role !== UserRole.MANAGEMENT) {
      return res.status(403).json(errorResponse('Bạn không có quyền truy cập'));
    }

    // Get all tutors
    const tutors = await storage.find<Tutor>('users.json',
      (u) => u.role === 'tutor'
    );

    // Calculate workload for each tutor
    const workloads = await Promise.all(
      tutors.map(tutor => calculateTutorWorkload(tutor.id))
    );

    // Get tutor details
    const tutorsMap = await storage.findByIds<User>('users.json', tutors.map(t => t.id));

    // Enrich with tutor info
    const enrichedWorkloads = workloads.map(workload => {
      const tutor = tutorsMap.get(workload.tutorId);
      return {
        ...workload,
        tutor: tutor ? {
          id: tutor.id,
          name: tutor.name,
          email: tutor.email,
          avatar: tutor.avatar,
          subjects: (tutor as Tutor).subjects,
          rating: (tutor as Tutor).rating
        } : null
      };
    });

    // Calculate statistics
    const totalTutors = tutors.length;
    const totalHours = workloads.reduce((sum, w) => sum + w.totalHours, 0);
    
    // Calculate total unique students across all tutors
    // Collect all student IDs from all sessions and classes
    const allStudentIds = new Set<string>();
    for (const workload of workloads) {
      // Get students from sessions
      for (const sessionId of workload.sessionIds) {
        const session = await storage.findById<Session>('sessions.json', sessionId);
        if (session && session.studentIds) {
          session.studentIds.forEach(id => allStudentIds.add(id));
        }
      }
      // Get students from classes
      for (const classId of workload.classIds) {
        const classItem = await storage.findById<Class>('classes.json', classId);
        if (classItem) {
          const enrollments = await storage.find<Enrollment>('enrollments.json',
            (e: any) => e.classId === classId && e.status === 'active'
          );
          enrollments.forEach(e => allStudentIds.add(e.studentId));
        }
      }
    }
    
    const totalStudents = allStudentIds.size;
    
    const workloadDistribution = {
      overloaded: workloads.filter(w => w.workload === 'overloaded').length,
      high: workloads.filter(w => w.workload === 'high').length,
      medium: workloads.filter(w => w.workload === 'medium').length,
      low: workloads.filter(w => w.workload === 'low').length
    };

    return res.json(successResponse({
      overview: {
        totalTutors,
        totalHours: Math.round(totalHours * 100) / 100,
        totalStudents,
        workloadDistribution
      },
      workloads: enrichedWorkloads
    }));
  } catch (error: any) {
    console.error('Get resource overview error:', error);
    return res.status(500).json(
      errorResponse('Lỗi lấy tổng quan tài nguyên: ' + error.message)
    );
  }
}

/**
 * GET /api/management/resources/inefficiencies
 */
export async function getInefficienciesHandler(req: AuthRequest, res: Response) {
  try {
    const currentUser = req.user!;
    
    // Only management can view inefficiencies
    if (currentUser.role !== UserRole.MANAGEMENT) {
      return res.status(403).json(errorResponse('Bạn không có quyền truy cập'));
    }

    const { severity, type } = req.query;

    let inefficiencies = await identifyInefficiencies();

    // Apply filters
    if (severity) {
      inefficiencies = inefficiencies.filter(i => i.severity === severity);
    }
    if (type) {
      inefficiencies = inefficiencies.filter(i => i.type === type);
    }

    // Sort by severity (high -> medium -> low)
    const severityOrder = { high: 3, medium: 2, low: 1 };
    inefficiencies.sort((a, b) => 
      severityOrder[b.severity] - severityOrder[a.severity]
    );

    return res.json(successResponse({
      inefficiencies,
      total: inefficiencies.length,
      bySeverity: {
        high: inefficiencies.filter(i => i.severity === 'high').length,
        medium: inefficiencies.filter(i => i.severity === 'medium').length,
        low: inefficiencies.filter(i => i.severity === 'low').length
      }
    }));
  } catch (error: any) {
    console.error('Get inefficiencies error:', error);
    return res.status(500).json(
      errorResponse('Lỗi lấy danh sách không hiệu quả: ' + error.message)
    );
  }
}

/**
 * POST /api/management/resources/optimize
 */
export async function optimizeResourceAllocationHandler(req: AuthRequest, res: Response) {
  try {
    const currentUser = req.user!;
    
    // Only management can optimize resources
    if (currentUser.role !== UserRole.MANAGEMENT) {
      return res.status(403).json(errorResponse('Bạn không có quyền tối ưu hóa tài nguyên'));
    }

    const { focusAreas, constraints } = req.body;

    const plan = await generateOptimizationPlan(focusAreas, constraints);

    // Save plan
    await storage.create<OptimizationPlan>('optimization-plans.json', plan);

    return res.status(201).json(
      successResponse(plan, 'Tạo kế hoạch tối ưu hóa thành công')
    );
  } catch (error: any) {
    console.error('Optimize resource allocation error:', error);
    return res.status(500).json(
      errorResponse('Lỗi tối ưu hóa tài nguyên: ' + error.message)
    );
  }
}

/**
 * POST /api/management/resources/apply
 * Create approval request for optimization plan instead of applying directly
 */
export async function applyOptimizationHandler(req: AuthRequest, res: Response) {
  try {
    const currentUser = req.user!;
    
    // Only management can apply optimization
    if (currentUser.role !== UserRole.MANAGEMENT) {
      return res.status(403).json(errorResponse('Bạn không có quyền áp dụng tối ưu hóa'));
    }

    const { planId, selectedChanges, description } = req.body;

    if (!planId || !selectedChanges || selectedChanges.length === 0) {
      return res.status(400).json(errorResponse('Plan ID và selectedChanges là bắt buộc'));
    }

    // Get optimization plan
    const plan = await storage.findById<OptimizationPlan>('optimization-plans.json', planId);
    if (!plan) {
      return res.status(404).json(errorResponse('Không tìm thấy kế hoạch tối ưu hóa'));
    }

    // Get selected changes from plan
    const changesToApply = plan.changes.filter(change => 
      selectedChanges.includes(change.resourceId)
    );

    if (changesToApply.length === 0) {
      return res.status(400).json(errorResponse('Không có thay đổi nào được chọn'));
    }

    // Convert OptimizationChange to resourceAllocationData format
    const resourceAllocationChanges = await Promise.all(
      changesToApply.map(async (change) => {
        // Load current resource to get fromValue
        let fromValue: any = null;
        let toValue: any = null;

        if (change.type === 'reallocate_session') {
          // For session reallocation, fromValue is old tutorId, toValue is new tutorId
          const session = await storage.findById<Session>('sessions.json', change.resourceId);
          if (session) {
            fromValue = session.tutorId;
            toValue = change.to;
            return {
              type: 'reassign_tutor' as const,
              resourceId: change.resourceId,
              fromValue: fromValue,
              toValue: toValue,
              reason: change.reason
            };
          }
        } else if (change.type === 'adjust_group_size') {
          // For group size adjustment, fromValue is old maxStudents, toValue is new maxStudents
          const classItem = await storage.findById<Class>('classes.json', change.resourceId);
          if (classItem) {
            const enrollments = await storage.find<Enrollment>('enrollments.json',
              (e: any) => e.classId === change.resourceId && e.status === 'active'
            );
            fromValue = { maxStudents: classItem.maxStudents, currentStudents: enrollments.length };
            toValue = { maxStudents: Math.max(enrollments.length + 2, classItem.maxStudents), currentStudents: enrollments.length };
            return {
              type: 'adjust_group_size' as const,
              resourceId: change.resourceId,
              fromValue: fromValue,
              toValue: toValue,
              reason: change.reason
            };
          }
        } else if (change.type === 'modify_schedule') {
          // For schedule modification, fromValue is old schedule, toValue is new schedule
          const session = await storage.findById<Session>('sessions.json', change.resourceId);
          if (session) {
            fromValue = { startTime: session.startTime, endTime: session.endTime, duration: session.duration };
            // toValue would need to be calculated based on optimization logic
            // For now, we'll leave it as the same (would need more context)
            toValue = fromValue; // Placeholder - would need actual new schedule
            return {
              type: 'adjust_schedule' as const,
              resourceId: change.resourceId,
              fromValue: fromValue,
              toValue: toValue,
              reason: change.reason
            };
          }
        }

        return null;
      })
    );

    // Filter out null values
    const validChanges = resourceAllocationChanges.filter((change): change is NonNullable<typeof change> => change !== null);

    if (validChanges.length === 0) {
      return res.status(400).json(errorResponse('Không thể tạo thay đổi từ kế hoạch tối ưu hóa'));
    }

    // Collect affected resources
    const affectedTutorIds = new Set<string>();
    const affectedSessionIds = new Set<string>();
    const affectedStudentIds = new Set<string>();

    for (const change of validChanges) {
      if (change.type === 'reassign_tutor') {
        if (change.fromValue) affectedTutorIds.add(change.fromValue);
        if (change.toValue) affectedTutorIds.add(change.toValue);
        affectedSessionIds.add(change.resourceId);
        // Load session to get students
        const session = await storage.findById<Session>('sessions.json', change.resourceId);
        if (session && session.studentIds) {
          session.studentIds.forEach(id => affectedStudentIds.add(id));
        }
      } else if (change.type === 'adjust_group_size') {
        // Load class to get tutor and students
        const classItem = await storage.findById<Class>('classes.json', change.resourceId);
        if (classItem) {
          affectedTutorIds.add(classItem.tutorId);
          const enrollments = await storage.find<Enrollment>('enrollments.json',
            (e: any) => e.classId === change.resourceId && e.status === 'active'
          );
          enrollments.forEach(e => affectedStudentIds.add(e.studentId));
        }
      } else if (change.type === 'adjust_schedule') {
        affectedSessionIds.add(change.resourceId);
        // Load session to get tutor and students
        const session = await storage.findById<Session>('sessions.json', change.resourceId);
        if (session) {
          affectedTutorIds.add(session.tutorId);
          if (session.studentIds) {
            session.studentIds.forEach(id => affectedStudentIds.add(id));
          }
        }
      }
    }

    // Calculate 48-hour deadline
    const deadlineDate = new Date();
    deadlineDate.setHours(deadlineDate.getHours() + 48);
    const deadline = deadlineDate.toISOString();

    const approvalRequest: ApprovalRequest = {
      id: generateId('approval'),
      type: ApprovalRequestType.RESOURCE_ALLOCATION,
      requesterId: currentUser.userId || currentUser.id,
      targetId: planId,
      title: `Tối ưu hóa phân bổ tài nguyên: ${plan.name}`,
      description: description || plan.description || `Áp dụng kế hoạch tối ưu hóa với ${validChanges.length} thay đổi`,
      status: ApprovalRequestStatus.PENDING,
      priority: 'medium',
      deadline,
      resourceAllocationData: {
        optimizationPlanId: planId,
        changes: validChanges,
        affectedTutorIds: Array.from(affectedTutorIds),
        affectedSessionIds: Array.from(affectedSessionIds),
        affectedStudentIds: Array.from(affectedStudentIds)
      },
      createdAt: now(),
      updatedAt: now()
    };

    await storage.create<ApprovalRequest>('approvals.json', approvalRequest);

    // Update plan status to pending
    await storage.update<OptimizationPlan>('optimization-plans.json', planId, {
      status: 'pending',
      updatedAt: now()
    });

    // Create notification for management users (excluding the requester)
    const managementUsers = await storage.find<User>('users.json', 
      (u) => u.role === UserRole.MANAGEMENT && u.id !== currentUser.id
    );

    const notifications = managementUsers.map(manager => ({
      id: generateId('notif'),
      userId: manager.id,
      type: NotificationType.APPROVAL_REQUEST,
      title: 'Yêu cầu phê duyệt tối ưu hóa tài nguyên',
      message: `Yêu cầu phê duyệt: ${approvalRequest.title}`,
      read: false,
      link: `/management/approvals/${approvalRequest.id}`,
      metadata: {
        approvalRequestId: approvalRequest.id,
        type: ApprovalRequestType.RESOURCE_ALLOCATION,
        priority: 'medium',
        planId: planId
      },
      createdAt: now()
    }));

    await Promise.all(
      notifications.map(notif => storage.create<Notification>('notifications.json', notif))
    );

    return res.status(201).json(
      successResponse(approvalRequest, 'Đã tạo yêu cầu phê duyệt tối ưu hóa. Vui lòng chờ phê duyệt từ management.')
    );
  } catch (error: any) {
    console.error('Apply optimization error:', error);
    return res.status(500).json(
      errorResponse('Lỗi tạo yêu cầu tối ưu hóa: ' + error.message)
    );
  }
}

/**
 * POST /api/management/resources/manual-override
 */
export async function manualOverrideHandler(req: AuthRequest, res: Response) {
  try {
    const currentUser = req.user!;
    
    // Only management can do manual override
    if (currentUser.role !== UserRole.MANAGEMENT) {
      return res.status(403).json(errorResponse('Bạn không có quyền thực hiện manual override'));
    }

    const { type, from, to, resourceId, reason } = req.body;

    // Create optimization change
    const change: OptimizationChange = {
      type,
      from,
      to,
      resourceId,
      reason
    };

    // Apply the change directly
    switch (type) {
      case 'reallocate_session':
        await storage.update('sessions.json', resourceId, {
          tutorId: to,
          updatedAt: now()
        });
        break;
      case 'reallocate_student':
        const enrollments = await storage.find('enrollments.json',
          (e: any) => e.studentId === resourceId && e.status === 'active'
        );
        if (enrollments.length > 0) {
          await storage.update('enrollments.json', enrollments[0].id, {
            classId: to,
            updatedAt: now()
          });
        }
        break;
      case 'adjust_group_size':
        const classItem = await storage.findById('classes.json', resourceId);
        if (classItem) {
          const enrollments = await storage.find('enrollments.json',
            (e: any) => e.classId === resourceId && e.status === 'active'
          );
          await storage.update('classes.json', resourceId, {
            maxStudents: Math.max(enrollments.length + 2, (classItem as any).maxStudents),
            updatedAt: now()
          });
        }
        break;
      case 'modify_schedule':
        // Schedule modification would need more parameters
        break;
    }

    // Create notification for affected users
    const notification: Notification = {
      id: generateId('notif'),
      userId: to,
      type: NotificationType.SYSTEM,
      title: 'Phân bổ tài nguyên đã được điều chỉnh',
      message: `Tài nguyên đã được điều chỉnh: ${reason}`,
      read: false,
      link: '/management/resources',
      metadata: {
        type,
        from,
        to,
        resourceId,
        reason
      },
      createdAt: now()
    };
    await storage.create<Notification>('notifications.json', notification);

    return res.json(
      successResponse(change, 'Manual override thành công')
    );
  } catch (error: any) {
    console.error('Manual override error:', error);
    return res.status(500).json(
      errorResponse('Lỗi manual override: ' + error.message)
    );
  }
}

