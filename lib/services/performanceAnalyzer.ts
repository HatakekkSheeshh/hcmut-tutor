/**
 * Performance Analyzer Service
 * Analyzes academic performance of students and tutors
 */

import { storage } from '../storage.js';
import { 
  Session, 
  Evaluation, 
  ProgressEntry,
  Student, 
  Tutor,
  User,
  PerformanceAnalysis,
  PerformanceMetrics,
  PerformanceTrend,
  PerformanceComparison,
  PerformanceKPIs,
  SessionStatus
} from '../types.js';
import { now, generateId } from '../utils.js';

/**
 * Generate performance analysis
 */
export async function generatePerformanceAnalysis(
  type: 'student' | 'tutor' | 'comparative' | 'overall',
  scope: {
    studentIds?: string[];
    tutorIds?: string[];
    subjects?: string[];
    timeRange: {
      startDate: string;
      endDate: string;
    };
  },
  includeComparisons: boolean = false,
  includeTrends: boolean = true
): Promise<PerformanceAnalysis> {
  const startDate = new Date(scope.timeRange.startDate);
  const endDate = new Date(scope.timeRange.endDate);

  // Get all sessions in time range
  let allSessions = await storage.find<Session>('sessions.json',
    (s) => {
      const sessionDate = new Date(s.startTime);
      return sessionDate >= startDate && sessionDate <= endDate;
    }
  );
  
  // Ensure allSessions is an array
  if (!Array.isArray(allSessions)) {
    allSessions = [];
  }

  // Filter by subjects if provided
  if (scope.subjects && scope.subjects.length > 0) {
    allSessions = allSessions.filter(s => scope.subjects!.includes(s.subject));
  }

  // Get all evaluations and progress
  const [allEvaluations, allProgress] = await Promise.all([
    storage.read<Evaluation>('evaluations.json'),
    storage.read<ProgressEntry>('progress.json')
  ]);

  // Ensure they are arrays
  const evaluationsArray = Array.isArray(allEvaluations) ? allEvaluations : [];
  const progressArray = Array.isArray(allProgress) ? allProgress : [];

  // Filter by time range
  const evaluations = evaluationsArray.filter(evaluation => {
    const evalDate = new Date(evaluation.createdAt);
    return evalDate >= startDate && evalDate <= endDate;
  });

  const progressEntries = progressArray.filter(prog => {
    const progDate = new Date(prog.createdAt);
    return progDate >= startDate && progDate <= endDate;
  });

  // Filter sessions by student/tutor IDs if provided
  if (scope.studentIds && scope.studentIds.length > 0) {
    allSessions = allSessions.filter(s => {
      // Ensure studentIds is an array
      const studentIds = Array.isArray(s.studentIds) ? s.studentIds : (s.studentIds ? [s.studentIds] : []);
      return studentIds.some(id => scope.studentIds!.includes(id));
    });
  }

  if (scope.tutorIds && scope.tutorIds.length > 0) {
    allSessions = allSessions.filter(s => 
      scope.tutorIds!.includes(s.tutorId)
    );
  }

  // Calculate metrics
  const metrics = await calculatePerformanceMetrics(
    allSessions,
    evaluations,
    progressEntries
  );

  // Generate trends
  let trends: PerformanceTrend[] = [];
  if (includeTrends) {
    trends = await generateTrends(allSessions, evaluations, progressEntries, startDate, endDate);
  }

  // Generate comparisons
  let comparisons: PerformanceComparison[] | undefined;
  if (includeComparisons && (scope.studentIds || scope.tutorIds)) {
    comparisons = await generateComparisons(
      scope.studentIds || scope.tutorIds || [],
      type === 'student' ? 'student' : 'tutor',
      allSessions,
      evaluations,
      progressEntries
    );
  }

  return {
    id: generateId('analysis'),
    type,
    scope,
    metrics,
    trends,
    comparisons,
    createdAt: now()
  };
}

/**
 * Calculate performance metrics
 */
async function calculatePerformanceMetrics(
  sessions: Session[],
  evaluations: Evaluation[],
  progressEntries: ProgressEntry[]
): Promise<PerformanceMetrics> {
  // Ensure inputs are arrays
  const sessionsArray = Array.isArray(sessions) ? sessions : [];
  const evaluationsArray = Array.isArray(evaluations) ? evaluations : [];
  const progressEntriesArray = Array.isArray(progressEntries) ? progressEntries : [];
  
  // Attendance metrics
  const totalSessions = sessionsArray.length;
  const completedSessions = sessionsArray.filter(s => 
    s.status === SessionStatus.COMPLETED
  );
  const presentCount = completedSessions.length;
  const absentCount = totalSessions - presentCount;
  const attendanceRate = totalSessions > 0
    ? (presentCount / totalSessions) * 100
    : 0;

  // Rating metrics
  const ratings = evaluationsArray.map(e => e.rating);
  const averageRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
    : 0;

  // Rating distribution
  const distribution: { rating: number; count: number }[] = [];
  for (let i = 1; i <= 5; i++) {
    distribution.push({
      rating: i,
      count: ratings.filter(r => r === i).length
    });
  }

  // Completion metrics
  const completionRate = totalSessions > 0
    ? (completedSessions.length / totalSessions) * 100
    : 0;

  // Score metrics
  const scores = progressEntriesArray
    .filter(p => p.score !== undefined)
    .map(p => p.score!);
  const averageScore = scores.length > 0
    ? scores.reduce((sum, s) => sum + s, 0) / scores.length
    : 0;

  // Score distribution
  const scoreRanges = [
    { range: '0-2', min: 0, max: 2 },
    { range: '3-5', min: 3, max: 5 },
    { range: '6-7', min: 6, max: 7 },
    { range: '8-9', min: 8, max: 9 },
    { range: '10', min: 10, max: 10 }
  ];

  const scoreDistribution = scoreRanges.map(range => ({
    range: range.range,
    count: scores.filter(s => s >= range.min && s <= range.max).length
  }));

  return {
    attendance: {
      average: attendanceRate,
      total: totalSessions,
      present: presentCount,
      absent: absentCount,
      rate: Math.round(attendanceRate * 100) / 100
    },
    ratings: {
      average: Math.round(averageRating * 100) / 100,
      total: ratings.length,
      distribution
    },
    completion: {
      rate: Math.round(completionRate * 100) / 100,
      completed: completedSessions.length,
      total: totalSessions
    },
    scores: {
      average: Math.round(averageScore * 100) / 100,
      total: scores.length,
      distribution: scoreDistribution
    }
  };
}

/**
 * Generate performance trends
 */
async function generateTrends(
  sessions: Session[],
  evaluations: Evaluation[],
  progressEntries: ProgressEntry[],
  startDate: Date,
  endDate: Date
): Promise<PerformanceTrend[]> {
  const trends: PerformanceTrend[] = [];
  
  // Ensure inputs are arrays
  const sessionsArray = Array.isArray(sessions) ? sessions : [];
  const evaluationsArray = Array.isArray(evaluations) ? evaluations : [];
  const progressEntriesArray = Array.isArray(progressEntries) ? progressEntries : [];
  
  // Group by week
  const weekMap = new Map<string, {
    sessions: Session[];
    evaluations: Evaluation[];
    progressEntries: ProgressEntry[];
  }>();

  sessionsArray.forEach(session => {
    const week = getWeekKey(new Date(session.startTime));
    if (!weekMap.has(week)) {
      weekMap.set(week, { sessions: [], evaluations: [], progressEntries: [] });
    }
    weekMap.get(week)!.sessions.push(session);
  });

  evaluationsArray.forEach(evaluation => {
    const week = getWeekKey(new Date(evaluation.createdAt));
    if (!weekMap.has(week)) {
      weekMap.set(week, { sessions: [], evaluations: [], progressEntries: [] });
    }
    weekMap.get(week)!.evaluations.push(evaluation);
  });

  progressEntriesArray.forEach(prog => {
    const week = getWeekKey(new Date(prog.createdAt));
    if (!weekMap.has(week)) {
      weekMap.set(week, { sessions: [], evaluations: [], progressEntries: [] });
    }
    weekMap.get(week)!.progressEntries.push(prog);
  });

  // Calculate metrics for each week
  for (const [week, data] of weekMap.entries()) {
    const weekMetrics = await calculatePerformanceMetrics(
      data.sessions,
      data.evaluations,
      data.progressEntries
    );

    trends.push({
      period: 'week',
      date: week,
      attendanceRate: weekMetrics.attendance.rate,
      averageRating: weekMetrics.ratings.average,
      completionRate: weekMetrics.completion.rate,
      averageScore: weekMetrics.scores.average
    });
  }

  // Sort by date
  trends.sort((a, b) => a.date.localeCompare(b.date));

  return trends;
}

/**
 * Generate performance comparisons
 */
async function generateComparisons(
  entityIds: string[],
  entityType: 'student' | 'tutor',
  sessions: Session[],
  evaluations: Evaluation[],
  progressEntries: ProgressEntry[]
): Promise<PerformanceComparison[]> {
  const comparisons: PerformanceComparison[] = [];

  // Ensure inputs are arrays
  const sessionsArray = Array.isArray(sessions) ? sessions : [];
  const evaluationsArray = Array.isArray(evaluations) ? evaluations : [];
  const progressEntriesArray = Array.isArray(progressEntries) ? progressEntries : [];

  for (const entityId of entityIds) {
    // Get entity-specific data
    let entitySessions = sessionsArray;
    let entityEvaluations = evaluationsArray;
    let entityProgress = progressEntriesArray;

    if (entityType === 'student') {
      entitySessions = sessionsArray.filter(s => {
        // Ensure studentIds is an array
        const studentIds = Array.isArray(s.studentIds) ? s.studentIds : (s.studentIds ? [s.studentIds] : []);
        return studentIds.includes(entityId);
      });
      entityEvaluations = evaluationsArray.filter(e => e.studentId === entityId);
      entityProgress = progressEntriesArray.filter(p => p.studentId === entityId);
    } else {
      entitySessions = sessionsArray.filter(s => s.tutorId === entityId);
      entityEvaluations = evaluationsArray.filter(e => e.tutorId === entityId);
      entityProgress = progressEntriesArray.filter(p => p.tutorId === entityId);
    }

    // Calculate metrics
    const metrics = await calculatePerformanceMetrics(
      entitySessions,
      entityEvaluations,
      entityProgress
    );

    // Get entity name
    const entity = await storage.findById<User>('users.json', entityId);
    const entityName = entity?.name || 'Unknown';

    comparisons.push({
      entityId,
      entityName,
      metrics,
      rank: 0, // Will be calculated after all comparisons
      percentile: 0 // Will be calculated after all comparisons
    });
  }

  // Calculate ranks and percentiles
  if (comparisons.length > 0) {
    // Sort by average score or rating
    comparisons.sort((a, b) => {
      const scoreA = entityType === 'student' 
        ? a.metrics.scores.average 
        : a.metrics.ratings.average;
      const scoreB = entityType === 'student' 
        ? b.metrics.scores.average 
        : b.metrics.ratings.average;
      return scoreB - scoreA;
    });

    comparisons.forEach((comp, index) => {
      comp.rank = index + 1;
      comp.percentile = Math.round(((comparisons.length - index) / comparisons.length) * 100);
    });
  }

  return comparisons;
}

/**
 * Get performance KPIs
 */
export async function getPerformanceKPIs(): Promise<PerformanceKPIs> {
  // Get all users
  const [students, tutors, sessions, evaluations] = await Promise.all([
    storage.find<Student>('users.json', (u) => u.role === 'student'),
    storage.find<Tutor>('users.json', (u) => u.role === 'tutor'),
    storage.read<Session>('sessions.json'),
    storage.read<Evaluation>('evaluations.json')
  ]);

  // Ensure they are arrays
  const sessionsArray = Array.isArray(sessions) ? sessions : [];
  const evaluationsArray = Array.isArray(evaluations) ? evaluations : [];

  // Calculate overall metrics
  const totalSessions = sessionsArray.length;
  const completedSessions = sessionsArray.filter(s => 
    s.status === SessionStatus.COMPLETED
  );
  const attendanceRate = totalSessions > 0
    ? (completedSessions.length / totalSessions) * 100
    : 0;

  const ratings = evaluationsArray.map(e => e.rating);
  const averageRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
    : 0;

  const completionRate = totalSessions > 0
    ? (completedSessions.length / totalSessions) * 100
    : 0;

  // Get top performers (students with highest scores)
  const progressEntries = await storage.read<ProgressEntry>('progress.json');
  const progressArray = Array.isArray(progressEntries) ? progressEntries : [];
  const studentScores = new Map<string, number[]>();
  
  progressArray.forEach(prog => {
    if (prog.score !== undefined) {
      if (!studentScores.has(prog.studentId)) {
        studentScores.set(prog.studentId, []);
      }
      studentScores.get(prog.studentId)!.push(prog.score!);
    }
  });

  const studentAverages = Array.from(studentScores.entries()).map(([studentId, scores]) => {
    const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    return { studentId, average: avg };
  });

  studentAverages.sort((a, b) => b.average - a.average);
  const topPerformers = await Promise.all(
    studentAverages.slice(0, 10).map(async ({ studentId, average }) => {
      const student = await storage.findById<Student>('users.json', studentId);
      return {
        studentId,
        studentName: student?.name || 'Unknown',
        score: Math.round(average * 100) / 100
      };
    })
  );

  // Get top rated tutors
  const tutorRatings = new Map<string, number[]>();
  evaluationsArray.forEach(evaluation => {
    if (!tutorRatings.has(evaluation.tutorId)) {
      tutorRatings.set(evaluation.tutorId, []);
    }
    tutorRatings.get(evaluation.tutorId)!.push(evaluation.rating);
  });

  const tutorAverages = Array.from(tutorRatings.entries()).map(([tutorId, ratings]) => {
    const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    return { tutorId, average: avg };
  });

  tutorAverages.sort((a, b) => b.average - a.average);
  const topRated = await Promise.all(
    tutorAverages.slice(0, 10).map(async ({ tutorId, average }) => {
      const tutor = await storage.findById<Tutor>('users.json', tutorId);
      return {
        tutorId,
        tutorName: tutor?.name || 'Unknown',
        rating: Math.round(average * 100) / 100
      };
    })
  );

  // Get most active tutors
  const tutorSessionCounts = new Map<string, number>();
  sessionsArray.forEach(session => {
    tutorSessionCounts.set(
      session.tutorId,
      (tutorSessionCounts.get(session.tutorId) || 0) + 1
    );
  });

  const tutorSessionList = Array.from(tutorSessionCounts.entries())
    .map(([tutorId, count]) => ({ tutorId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const mostActive = await Promise.all(
    tutorSessionList.map(async ({ tutorId, count }) => {
      const tutor = await storage.findById<Tutor>('users.json', tutorId);
      return {
        tutorId,
        tutorName: tutor?.name || 'Unknown',
        sessions: count
      };
    })
  );

  // Calculate trends (simplified - compare last month to previous month)
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 2, 1);

  const lastMonthSessions = sessions.filter(s => {
    const sessionDate = new Date(s.startTime);
    return sessionDate >= lastMonth && sessionDate < now;
  });

  const previousMonthSessions = sessions.filter(s => {
    const sessionDate = new Date(s.startTime);
    return sessionDate >= previousMonth && sessionDate < lastMonth;
  });

  const lastMonthAttendance = lastMonthSessions.length > 0
    ? (lastMonthSessions.filter(s => s.status === SessionStatus.COMPLETED).length / lastMonthSessions.length) * 100
    : 0;

  const previousMonthAttendance = previousMonthSessions.length > 0
    ? (previousMonthSessions.filter(s => s.status === SessionStatus.COMPLETED).length / previousMonthSessions.length) * 100
    : 0;

  const attendanceTrend = lastMonthAttendance > previousMonthAttendance
    ? 'increasing'
    : lastMonthAttendance < previousMonthAttendance
    ? 'decreasing'
    : 'stable';

  // Similar for ratings and completion
  const lastMonthEvaluations = evaluations.filter(e => {
    const evalDate = new Date(e.createdAt);
    return evalDate >= lastMonth && evalDate < now;
  });

  const previousMonthEvaluations = evaluations.filter(e => {
    const evalDate = new Date(e.createdAt);
    return evalDate >= previousMonth && evalDate < lastMonth;
  });

  const lastMonthRating = lastMonthEvaluations.length > 0
    ? lastMonthEvaluations.reduce((sum, e) => sum + e.rating, 0) / lastMonthEvaluations.length
    : 0;

  const previousMonthRating = previousMonthEvaluations.length > 0
    ? previousMonthEvaluations.reduce((sum, e) => sum + e.rating, 0) / previousMonthEvaluations.length
    : 0;

  const ratingTrend = lastMonthRating > previousMonthRating
    ? 'increasing'
    : lastMonthRating < previousMonthRating
    ? 'decreasing'
    : 'stable';

  const completionTrend = lastMonthSessions.length > previousMonthSessions.length
    ? 'increasing'
    : lastMonthSessions.length < previousMonthSessions.length
    ? 'decreasing'
    : 'stable';

  return {
    overall: {
      totalStudents: students.length,
      totalTutors: tutors.length,
      totalSessions,
      averageAttendanceRate: Math.round(attendanceRate * 100) / 100,
      averageRating: Math.round(averageRating * 100) / 100,
      completionRate: Math.round(completionRate * 100) / 100
    },
    students: {
      topPerformers,
      needsAttention: [], // Would need more logic to determine
      averageProgress: 0 // Would need to calculate
    },
    tutors: {
      topRated,
      mostActive,
      averageRating: Math.round(averageRating * 100) / 100
    },
    trends: {
      attendanceTrend,
      ratingTrend,
      completionTrend
    }
  };
}

/**
 * Helper function to get week key
 */
function getWeekKey(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const week = Math.ceil(date.getDate() / 7);
  return `${year}-W${month}-${week}`;
}

