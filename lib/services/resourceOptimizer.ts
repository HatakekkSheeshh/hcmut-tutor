/**
 * Resource Optimization Service
 * Analyzes and optimizes resource allocation
 */

import { storage } from '../storage.js';
import { 
  Tutor, 
  Session, 
  Class, 
  Enrollment,
  ResourceAllocation,
  ResourceInefficiency,
  OptimizationPlan,
  OptimizationChange,
  SessionStatus,
  ClassStatus
} from '../types.js';
import { now, generateId } from '../utils.js';

/**
 * Calculate tutor workload
 */
export async function calculateTutorWorkload(tutorId: string): Promise<ResourceAllocation> {
  const [sessions, classes, enrollments] = await Promise.all([
    storage.find<Session>('sessions.json', 
      (s) => s.tutorId === tutorId && s.status !== SessionStatus.CANCELLED
    ),
    storage.find<Class>('classes.json',
      (c) => c.tutorId === tutorId && c.status === ClassStatus.ACTIVE
    ),
    storage.find<Enrollment>('enrollments.json',
      (e) => e.status === 'active'
    )
  ]);

  // Calculate total hours
  const sessionHours = sessions.reduce((total, session) => {
    if (session.status === SessionStatus.COMPLETED || session.status === SessionStatus.CONFIRMED) {
      return total + (session.duration / 60);
    }
    return total;
  }, 0);

  const classHours = classes.reduce((total, classItem) => {
    const durationHours = classItem.duration / 60;
    const weeksInSemester = Math.ceil(
      (new Date(classItem.semesterEnd).getTime() - new Date(classItem.semesterStart).getTime()) 
      / (1000 * 60 * 60 * 24 * 7)
    );
    return total + (durationHours * weeksInSemester);
  }, 0);

  const totalHours = sessionHours + classHours;

  // Calculate student count
  const sessionStudents = new Set<string>();
  sessions.forEach(session => {
    session.studentIds?.forEach(id => sessionStudents.add(id));
  });

  const classStudents = new Set<string>();
  const classIds = classes.map(c => c.id);
  enrollments.forEach(enrollment => {
    if (classIds.includes(enrollment.classId)) {
      classStudents.add(enrollment.studentId);
    }
  });

  const studentCount = new Set([...sessionStudents, ...classStudents]).size;

  // Determine workload
  let workload: 'low' | 'medium' | 'high' | 'overloaded' = 'low';
  if (totalHours > 30 || studentCount > 50) {
    workload = 'overloaded';
  } else if (totalHours > 20 || studentCount > 30) {
    workload = 'high';
  } else if (totalHours > 10 || studentCount > 15) {
    workload = 'medium';
  }

  return {
    id: generateId('resource'),
    tutorId,
    sessionIds: sessions.map(s => s.id),
    classIds: classes.map(c => c.id),
    totalHours: Math.round(totalHours * 100) / 100,
    studentCount,
    workload,
    createdAt: now(),
    updatedAt: now()
  };
}

/**
 * Identify resource inefficiencies
 */
export async function identifyInefficiencies(): Promise<ResourceInefficiency[]> {
  const inefficiencies: ResourceInefficiency[] = [];

  // Get all tutors
  const tutors = await storage.find<Tutor>('users.json',
    (u) => u.role === 'tutor'
  );

  // Analyze each tutor's workload
  const workloads = await Promise.all(
    tutors.map(tutor => calculateTutorWorkload(tutor.id))
  );

  // Find overloaded tutors
  const overloadedTutors = workloads.filter(w => w.workload === 'overloaded' || w.workload === 'high');
  overloadedTutors.forEach(workload => {
    inefficiencies.push({
      id: generateId('ineff'),
      type: 'overloaded_tutor',
      description: `Tutor có workload quá cao: ${workload.totalHours} giờ/tuần với ${workload.studentCount} học sinh`,
      severity: workload.workload === 'overloaded' ? 'high' : 'medium',
      affectedResources: [workload.tutorId, ...workload.sessionIds, ...workload.classIds],
      suggestedActions: [
        'Phân bổ lại một số sessions cho tutors khác',
        'Giảm số lượng học sinh trong các classes',
        'Thêm tutor mới để hỗ trợ'
      ],
      createdAt: now()
    });
  });

  // Find underutilized tutors
  const underutilizedTutors = workloads.filter(w => w.workload === 'low' && w.totalHours < 5);
  underutilizedTutors.forEach(workload => {
    inefficiencies.push({
      id: generateId('ineff'),
      type: 'underutilized_tutor',
      description: `Tutor chưa được sử dụng hiệu quả: chỉ ${workload.totalHours} giờ/tuần`,
      severity: 'low',
      affectedResources: [workload.tutorId],
      suggestedActions: [
        'Phân bổ thêm sessions cho tutor này',
        'Đăng ký tutor vào các classes cần thêm người',
        'Xem xét lại availability của tutor'
      ],
      createdAt: now()
    });
  });

  // Check group balance
  const classes = await storage.read<Class>('classes.json');
  const enrollments = await storage.find<Enrollment>('enrollments.json',
    (e) => e.status === 'active'
  );

  classes.forEach(classItem => {
    const classEnrollments = enrollments.filter(e => e.classId === classItem.id);
    const enrollmentCount = classEnrollments.length;
    const utilizationRate = (enrollmentCount / classItem.maxStudents) * 100;

    if (utilizationRate < 30 && enrollmentCount > 0) {
      inefficiencies.push({
        id: generateId('ineff'),
        type: 'unbalanced_group',
        description: `Class ${classItem.code} chỉ có ${enrollmentCount}/${classItem.maxStudents} học sinh (${Math.round(utilizationRate)}%)`,
        severity: utilizationRate < 20 ? 'high' : 'medium',
        affectedResources: [classItem.id, classItem.tutorId],
        suggestedActions: [
          'Thêm học sinh vào class',
          'Merge với class khác có cùng subject',
          'Giảm maxStudents của class'
        ],
        createdAt: now()
      });
    } else if (enrollmentCount >= classItem.maxStudents) {
      inefficiencies.push({
        id: generateId('ineff'),
        type: 'unbalanced_group',
        description: `Class ${classItem.code} đã đầy (${enrollmentCount}/${classItem.maxStudents})`,
        severity: 'high',
        affectedResources: [classItem.id],
        suggestedActions: [
          'Tăng maxStudents nếu có thể',
          'Tạo class mới với cùng subject',
          'Chuyển một số học sinh sang class khác'
        ],
        createdAt: now()
      });
    }
  });

  // Check for resource conflicts (sessions at same time)
  const sessions = await storage.find<Session>('sessions.json',
    (s) => s.status === SessionStatus.CONFIRMED || s.status === SessionStatus.ONGOING
  );

  const tutorSessions = new Map<string, Session[]>();
  sessions.forEach(session => {
    if (!tutorSessions.has(session.tutorId)) {
      tutorSessions.set(session.tutorId, []);
    }
    tutorSessions.get(session.tutorId)!.push(session);
  });

  tutorSessions.forEach((tutorSessionsList, tutorId) => {
    // Check for overlapping sessions
    for (let i = 0; i < tutorSessionsList.length; i++) {
      for (let j = i + 1; j < tutorSessionsList.length; j++) {
        const session1 = tutorSessionsList[i];
        const session2 = tutorSessionsList[j];
        
        const start1 = new Date(session1.startTime);
        const end1 = new Date(session1.endTime);
        const start2 = new Date(session2.startTime);
        const end2 = new Date(session2.endTime);

        // Check if sessions overlap
        if ((start1 < end2 && start2 < end1)) {
          inefficiencies.push({
            id: generateId('ineff'),
            type: 'resource_conflict',
            description: `Xung đột lịch: Tutor có 2 sessions trùng thời gian`,
            severity: 'high',
            affectedResources: [tutorId, session1.id, session2.id],
            suggestedActions: [
              'Đổi lịch một trong hai sessions',
              'Hủy session không cần thiết',
              'Phân bổ session cho tutor khác'
            ],
            createdAt: now()
          });
          break;
        }
      }
    }
  });

  return inefficiencies;
}

/**
 * Generate optimization plan
 */
export async function generateOptimizationPlan(
  focusAreas?: string[],
  constraints?: {
    maxWorkloadPerTutor?: number;
    minGroupSize?: number;
    maxGroupSize?: number;
  }
): Promise<OptimizationPlan> {
  const inefficiencies = await identifyInefficiencies();
  const changes: OptimizationChange[] = [];

  // Filter inefficiencies by focus areas if provided
  let filteredInefficiencies = inefficiencies;
  if (focusAreas && focusAreas.length > 0) {
    const focusMap: Record<string, string> = {
      'workload': 'overloaded_tutor',
      'group_balance': 'unbalanced_group',
      'resource_conflicts': 'resource_conflict',
      'utilization': 'underutilized_tutor'
    };

    filteredInefficiencies = inefficiencies.filter(ineff => {
      return focusAreas.some(area => {
        const inefficiencyType = focusMap[area];
        return inefficiencyType && ineff.type === inefficiencyType;
      });
    });
  }

  // Generate changes for each inefficiency
  for (const ineff of filteredInefficiencies) {
    if (ineff.type === 'overloaded_tutor') {
      // Suggest reallocating sessions
      const tutorId = ineff.affectedResources[0];
      const sessions = ineff.affectedResources.filter(id => id.startsWith('session_'));
      
      if (sessions.length > 0) {
        // Find underutilized tutors
        const tutors = await storage.find<Tutor>('users.json',
          (u) => u.role === 'tutor' && u.id !== tutorId
        );
        
        // Simple heuristic: suggest moving to first available tutor
        // In real implementation, would use more sophisticated matching
        if (tutors.length > 0) {
          changes.push({
            type: 'reallocate_session',
            from: tutorId,
            to: tutors[0].id,
            resourceId: sessions[0],
            reason: `Giảm workload cho tutor ${tutorId}`
          });
        }
      }
    } else if (ineff.type === 'unbalanced_group') {
      const classId = ineff.affectedResources[0];
      // Suggest adjusting group size or merging
      changes.push({
        type: 'adjust_group_size',
        from: classId,
        to: classId,
        resourceId: classId,
        reason: `Cân bằng kích thước nhóm cho class ${classId}`
      });
    } else if (ineff.type === 'resource_conflict') {
      const sessionId = ineff.affectedResources[1];
      changes.push({
        type: 'modify_schedule',
        from: sessionId,
        to: sessionId,
        resourceId: sessionId,
        reason: `Giải quyết xung đột lịch cho session ${sessionId}`
      });
    }
  }

  // Calculate estimated impact
  const workloadReduction = filteredInefficiencies
    .filter(i => i.type === 'overloaded_tutor')
    .length * 15; // Estimate 15% reduction per overloaded tutor

  const balanceImprovement = filteredInefficiencies
    .filter(i => i.type === 'unbalanced_group')
    .length * 20; // Estimate 20% improvement per unbalanced group

  const resourceUtilization = Math.min(100, 
    (1 - (filteredInefficiencies.filter(i => i.type === 'underutilized_tutor').length / 10)) * 100
  );

  return {
    id: generateId('plan'),
    name: `Optimization Plan - ${new Date().toLocaleDateString('vi-VN')}`,
    description: `Kế hoạch tối ưu hóa tài nguyên với ${changes.length} thay đổi`,
    changes,
    estimatedImpact: {
      workloadReduction: Math.min(100, workloadReduction),
      balanceImprovement: Math.min(100, balanceImprovement),
      resourceUtilization: Math.max(0, resourceUtilization)
    },
    status: 'draft',
    createdBy: 'system',
    createdAt: now()
  };
}

/**
 * Apply optimization changes
 */
export async function applyOptimizationChanges(
  planId: string,
  changeIds: string[]
): Promise<void> {
  const plan = await storage.findById<OptimizationPlan>('optimization-plans.json', planId);
  if (!plan) {
    throw new Error('Optimization plan not found');
  }

  if (plan.status !== 'draft' && plan.status !== 'pending') {
    throw new Error('Cannot apply changes to a plan that is not in draft or pending status');
  }

  const changesToApply = plan.changes.filter(change => 
    changeIds.includes(change.resourceId)
  );

  for (const change of changesToApply) {
    try {
      await applyChange(change);
    } catch (error) {
      console.error(`Error applying change ${change.resourceId}:`, error);
      // Continue with other changes even if one fails
    }
  }

  // Update plan status
  await storage.update<OptimizationPlan>('optimization-plans.json', planId, {
    status: 'applied',
    appliedAt: now(),
    updatedAt: now()
  });
}

/**
 * Apply a single optimization change
 */
async function applyChange(change: OptimizationChange): Promise<void> {
  switch (change.type) {
    case 'reallocate_session':
      await storage.update<Session>('sessions.json', change.resourceId, {
        tutorId: change.to,
        updatedAt: now()
      });
      break;

    case 'reallocate_student':
      // Find enrollment and update
      const enrollments = await storage.find<Enrollment>('enrollments.json',
        (e) => e.studentId === change.resourceId && e.status === 'active'
      );
      if (enrollments.length > 0) {
        // This is a simplified implementation
        // In real scenario, would need to handle class transfers more carefully
        await storage.update<Enrollment>('enrollments.json', enrollments[0].id, {
          classId: change.to,
          updatedAt: now()
        });
      }
      break;

    case 'adjust_group_size':
      const classItem = await storage.findById<Class>('classes.json', change.resourceId);
      if (classItem) {
        // Adjust based on current enrollment
        const enrollments = await storage.find<Enrollment>('enrollments.json',
          (e) => e.classId === change.resourceId && e.status === 'active'
        );
        const suggestedMax = Math.max(enrollments.length + 2, classItem.maxStudents);
        await storage.update<Class>('classes.json', change.resourceId, {
          maxStudents: suggestedMax,
          updatedAt: now()
        });
      }
      break;

    case 'modify_schedule':
      // For schedule modifications, would need more context
      // This is a placeholder - real implementation would calculate new time
      break;
  }
}

