/**
 * Credit Awarder Service
 * Handles training credit awarding logic
 */

import { storage } from '../storage.js';
import { config } from '../config.js';
import { 
  Student, 
  Session, 
  Class,
  Enrollment,
  ProgressEntry,
  TrainingCredit,
  CreditEligibility,
  SessionStatus
} from '../types.js';
import { now, generateId } from '../utils.js';

/**
 * Check if student is eligible for credits
 */
export async function checkEligibility(
  studentId: string,
  sessionId?: string,
  classId?: string,
  semester?: string,
  minAttendance?: number,
  minSessions?: number,
  minPerformance?: number
): Promise<CreditEligibility> {
  const student = await storage.findById<Student>('users.json', studentId);
  if (!student) {
    return {
      studentId,
      studentName: 'Unknown',
      eligible: false,
      reason: 'Student not found',
      criteria: {
        attendanceRate: 0,
        minAttendanceRequired: minAttendance || config.trainingCredits.minAttendanceRate,
        sessionsCompleted: 0,
        minSessionsRequired: minSessions || config.trainingCredits.minSessionsCompleted,
        performanceScore: 0,
        minPerformanceRequired: minPerformance || config.trainingCredits.minPerformanceScore
      }
    };
  }

  // Get sessions for student
  let sessions: Session[] = [];
  if (sessionId) {
    const session = await storage.findById<Session>('sessions.json', sessionId);
    if (session && session.studentIds?.includes(studentId)) {
      sessions = [session];
    }
  } else if (classId) {
    // Get all sessions for this class
    sessions = await storage.find<Session>('sessions.json',
      (s) => s.classId === classId && s.studentIds?.includes(studentId)
    );
  } else {
    // Get all sessions for student in semester
    sessions = await storage.find<Session>('sessions.json',
      (s) => s.studentIds?.includes(studentId)
    );

    // Filter by semester if provided
    if (semester) {
      // Semester format: "2024-2025-1" (year-year-semester)
      const [year1, year2, sem] = semester.split('-');
      sessions = sessions.filter(s => {
        const sessionDate = new Date(s.startTime);
        const sessionYear = sessionDate.getFullYear();
        const sessionMonth = sessionDate.getMonth() + 1;
        const sessionSem = sessionMonth <= 5 ? 1 : sessionMonth <= 9 ? 2 : 3;
        
        return sessionYear.toString() === year1 && sessionSem.toString() === sem;
      });
    }
  }

  // Calculate attendance
  const completedSessions = sessions.filter(s => 
    s.status === SessionStatus.COMPLETED
  );
  const attendanceRate = sessions.length > 0
    ? (completedSessions.length / sessions.length) * 100
    : 0;

  // Calculate performance score
  const progressEntries = await storage.find<ProgressEntry>('progress.json',
    (p) => p.studentId === studentId
  );
  const scores = progressEntries
    .filter(p => p.score !== undefined)
    .map(p => p.score!);
  const performanceScore = scores.length > 0
    ? scores.reduce((sum, s) => sum + s, 0) / scores.length
    : 0;

  // Check eligibility criteria
  const minAttReq = minAttendance || config.trainingCredits.minAttendanceRate;
  const minSessReq = minSessions || config.trainingCredits.minSessionsCompleted;
  const minPerfReq = minPerformance || config.trainingCredits.minPerformanceScore;

  const eligible = 
    attendanceRate >= minAttReq &&
    completedSessions.length >= minSessReq &&
    (minPerformance === undefined || performanceScore >= minPerfReq);

  let reason = '';
  if (!eligible) {
    const reasons: string[] = [];
    if (attendanceRate < minAttReq) {
      reasons.push(`Attendance rate ${attendanceRate.toFixed(1)}% is below required ${minAttReq}%`);
    }
    if (completedSessions.length < minSessReq) {
      reasons.push(`Completed sessions ${completedSessions.length} is below required ${minSessReq}`);
    }
    if (minPerformance !== undefined && performanceScore < minPerfReq) {
      reasons.push(`Performance score ${performanceScore.toFixed(1)} is below required ${minPerfReq}`);
    }
    reason = reasons.join(', ');
  } else {
    reason = 'Student meets all eligibility criteria';
  }

  return {
    studentId: student.id,
    studentName: student.name,
    eligible,
    reason,
    sessionId,
    classId,
    semester,
    criteria: {
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      minAttendanceRequired: minAttReq,
      sessionsCompleted: completedSessions.length,
      minSessionsRequired: minSessReq,
      performanceScore: Math.round(performanceScore * 100) / 100,
      minPerformanceRequired: minPerformance !== undefined ? minPerfReq : undefined
    }
  };
}

/**
 * Get eligible students
 */
export async function getEligibleStudents(
  sessionId?: string,
  classId?: string,
  semester?: string,
  minAttendance?: number,
  minSessions?: number,
  minPerformance?: number
): Promise<CreditEligibility[]> {
  let studentIds: string[] = [];

  if (sessionId) {
    const session = await storage.findById<Session>('sessions.json', sessionId);
    if (session) {
      studentIds = session.studentIds || [];
    }
  } else if (classId) {
    const enrollments = await storage.find<Enrollment>('enrollments.json',
      (e) => e.classId === classId && e.status === 'active'
    );
    studentIds = enrollments.map(e => e.studentId);
  } else {
    // Get all students
    const students = await storage.find<Student>('users.json',
      (u) => u.role === 'student'
    );
    studentIds = students.map(s => s.id);
  }

  // Check eligibility for each student
  const eligibilities = await Promise.all(
    studentIds.map(studentId => 
      checkEligibility(
        studentId,
        sessionId,
        classId,
        semester,
        minAttendance,
        minSessions,
        minPerformance
      )
    )
  );

  // Filter to only eligible students
  return eligibilities.filter(e => e.eligible);
}

/**
 * Award credits to students
 */
export async function awardCredits(
  studentIds: string[],
  credits: number,
  reason: string,
  awardedBy: string,
  sessionId?: string,
  classId?: string,
  semester?: string,
  metadata?: {
    attendanceRate?: number;
    performanceScore?: number;
    completionRate?: number;
  }
): Promise<TrainingCredit[]> {
  const awards: TrainingCredit[] = [];

  for (const studentId of studentIds) {
    // Check for duplicate awards (BR-1)
    if (config.trainingCredits.preventDuplicateAwards) {
      const existingCredits = await storage.find<TrainingCredit>('training-credits.json',
        (c) => {
          if (c.studentId !== studentId || c.status !== 'active') {
            return false;
          }

          // Check duplicate based on window
          const window = config.trainingCredits.duplicateCheckWindow;
          if (window === 'session' && sessionId) {
            return c.sessionId === sessionId;
          } else if (window === 'semester' && semester) {
            return c.semester === semester;
          } else if (window === 'year' && semester) {
            const [year1] = semester.split('-');
            const creditYear = c.semester?.split('-')[0];
            return creditYear === year1;
          }

          return false;
        }
      );

      if (existingCredits.length > 0) {
        console.warn(`Duplicate credit award prevented for student ${studentId}`);
        continue;
      }
    }

    // Check eligibility
    const eligibility = await checkEligibility(studentId, sessionId, classId, semester);
    if (!eligibility.eligible) {
      console.warn(`Student ${studentId} is not eligible: ${eligibility.reason}`);
      continue;
    }

    // Create credit award
    const credit: TrainingCredit = {
      id: generateId('credit'),
      studentId,
      sessionId,
      classId,
      semester,
      credits,
      reason,
      awardedBy,
      awardedAt: now(),
      status: 'active',
      metadata: metadata || {
        attendanceRate: eligibility.criteria.attendanceRate,
        performanceScore: eligibility.criteria.performanceScore,
        completionRate: eligibility.criteria.sessionsCompleted / (eligibility.criteria.sessionsCompleted + 1) * 100
      }
    };

    // Save credit
    await storage.create<TrainingCredit>('training-credits.json', credit);

    // Update student profile
    const student = await storage.findById<Student>('users.json', studentId);
    if (student) {
      const currentCredits = student.trainingCredits || 0;
      await storage.update<Student>('users.json', studentId, {
        trainingCredits: currentCredits + credits,
        updatedAt: now()
      });
    }

    awards.push(credit);
  }

  return awards;
}

/**
 * Revoke credits
 */
export async function revokeCredits(
  creditId: string,
  revokedBy: string,
  revokeReason: string
): Promise<TrainingCredit> {
  const credit = await storage.findById<TrainingCredit>('training-credits.json', creditId);
  if (!credit) {
    throw new Error('Credit not found');
  }

  if (credit.status === 'revoked') {
    throw new Error('Credit is already revoked');
  }

  // Update credit
  const updatedCredit = await storage.update<TrainingCredit>('training-credits.json', creditId, {
    status: 'revoked',
    revokedAt: now(),
    revokedBy,
    revokeReason
  });

  // Update student profile
  const student = await storage.findById<Student>('users.json', credit.studentId);
  if (student) {
    const currentCredits = student.trainingCredits || 0;
    await storage.update<Student>('users.json', credit.studentId, {
      trainingCredits: Math.max(0, currentCredits - credit.credits),
      updatedAt: now()
    });
  }

  return updatedCredit;
}

/**
 * Get credit award history
 */
export async function getCreditHistory(
  studentId?: string,
  semester?: string,
  page: number = 1,
  limit: number = 20
): Promise<{
  data: TrainingCredit[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  let credits = await storage.read<TrainingCredit>('training-credits.json');

  // Filter by studentId if provided
  if (studentId) {
    credits = credits.filter(c => c.studentId === studentId);
  }

  // Filter by semester if provided
  if (semester) {
    credits = credits.filter(c => c.semester === semester);
  }

  // Sort by awardedAt (newest first)
  credits.sort((a, b) => 
    new Date(b.awardedAt).getTime() - new Date(a.awardedAt).getTime()
  );

  // Pagination
  const total = credits.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedData = credits.slice(start, end);

  return {
    data: paginatedData,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  };
}

