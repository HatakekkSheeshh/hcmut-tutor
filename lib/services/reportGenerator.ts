/**
 * Report Generator Service
 * Generates progress reports for students and tutors
 */

import { storage } from '../storage.js';
import { 
  Session, 
  Evaluation, 
  ProgressEntry,
  Student, 
  Tutor,
  User,
  ProgressReport,
  StudentProgressData,
  TutorProgressData,
  ProgressReportSummary,
  SessionStatus
} from '../types.js';
import { now, generateId } from '../utils.js';

/**
 * Generate progress report
 */
export async function generateProgressReport(
  type: 'student' | 'tutor' | 'department' | 'subject' | 'custom',
  scope: {
    studentIds?: string[];
    tutorIds?: string[];
    department?: string;
    subject?: string;
    timeRange: {
      startDate: string;
      endDate: string;
    };
  },
  filters?: {
    minScore?: number;
    minAttendance?: number;
    subjects?: string[];
  }
): Promise<ProgressReport> {
  const startDate = new Date(scope.timeRange.startDate);
  const endDate = new Date(scope.timeRange.endDate);

  let students: StudentProgressData[] = [];
  let tutors: TutorProgressData[] = [];

  // Get all sessions in time range
  const allSessions = await storage.find<Session>('sessions.json',
    (s) => {
      const sessionDate = new Date(s.startTime);
      return sessionDate >= startDate && sessionDate <= endDate;
    }
  );

  // Get all evaluations and progress entries
  const [allEvaluations, allProgress] = await Promise.all([
    storage.read<Evaluation>('evaluations.json'),
    storage.read<ProgressEntry>('progress.json')
  ]);

  // Filter evaluations and progress by time range
  const evaluations = allEvaluations.filter(evaluation => {
    const evalDate = new Date(evaluation.createdAt);
    return evalDate >= startDate && evalDate <= endDate;
  });

  const progressEntries = allProgress.filter(prog => {
    const progDate = new Date(prog.createdAt);
    return progDate >= startDate && progDate <= endDate;
  });

  // Generate student progress data
  if (type === 'student' || type === 'custom') {
    let studentIds = scope.studentIds || [];
    
    // If no specific students, get all students from sessions
    if (studentIds.length === 0) {
      studentIds = Array.from(new Set(
        allSessions.flatMap(s => s.studentIds || [])
      ));
    }

    // Filter by department if specified
    if (scope.department) {
      const allStudents = await storage.find<Student>('users.json',
        (u) => u.role === 'student'
      );
      studentIds = allStudents
        .filter(s => (s as Student).major?.includes(scope.department || ''))
        .map(s => s.id);
    }

    students = await Promise.all(
      studentIds.map(async (studentId) => {
        const student = await storage.findById<Student>('users.json', studentId);
        if (!student) return null;

        // Get student sessions
        const studentSessions = allSessions.filter(s => 
          s.studentIds?.includes(studentId)
        );

        // Get student evaluations
        const studentEvaluations = evaluations.filter(e => 
          e.studentId === studentId
        );

        // Get student progress
        const studentProgress = progressEntries.filter(p => 
          p.studentId === studentId
        );

        // Calculate attendance
        const completedSessions = studentSessions.filter(s => 
          s.status === SessionStatus.COMPLETED
        );
        const attendanceRate = studentSessions.length > 0
          ? (completedSessions.length / studentSessions.length) * 100
          : 0;

        // Calculate average score
        const scores = studentProgress
          .filter(p => p.score !== undefined)
          .map(p => p.score!);
        const averageScore = scores.length > 0
          ? scores.reduce((sum, score) => sum + score, 0) / scores.length
          : 0;

        // Group by subject
        const subjectMap = new Map<string, {
          sessions: number;
          scores: number[];
          completed: number;
        }>();

        studentSessions.forEach(session => {
          if (!subjectMap.has(session.subject)) {
            subjectMap.set(session.subject, { sessions: 0, scores: [], completed: 0 });
          }
          const subjectData = subjectMap.get(session.subject)!;
          subjectData.sessions++;
          if (session.status === SessionStatus.COMPLETED) {
            subjectData.completed++;
          }
        });

        studentProgress.forEach(prog => {
          if (prog.score !== undefined) {
            if (!subjectMap.has(prog.subject)) {
              subjectMap.set(prog.subject, { sessions: 0, scores: [], completed: 0 });
            }
            subjectMap.get(prog.subject)!.scores.push(prog.score!);
          }
        });

        const subjects = Array.from(subjectMap.entries()).map(([subject, data]) => ({
          subject,
          sessions: data.sessions,
          averageScore: data.scores.length > 0
            ? data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length
            : 0,
          attendanceRate: data.sessions > 0
            ? (data.completed / data.sessions) * 100
            : 0
        }));

        // Get improvements and challenges from progress entries
        const improvements = Array.from(new Set(
          studentProgress.flatMap(p => p.improvements || [])
        ));
        const challenges = Array.from(new Set(
          studentProgress.flatMap(p => p.challenges || [])
        ));

        const studentData: StudentProgressData = {
          studentId: student.id,
          studentName: student.name,
          sessionsCompleted: completedSessions.length,
          sessionsTotal: studentSessions.length,
          attendanceRate: Math.round(attendanceRate * 100) / 100,
          averageScore: Math.round(averageScore * 100) / 100,
          subjects,
          improvements,
          challenges
        };

        // Apply filters
        if (filters?.minScore && studentData.averageScore < filters.minScore) {
          return null;
        }
        if (filters?.minAttendance && studentData.attendanceRate < filters.minAttendance) {
          return null;
        }
        if (filters?.subjects && filters.subjects.length > 0) {
          const hasSubject = studentData.subjects.some(s => filters.subjects!.includes(s.subject));
          if (!hasSubject) return null;
        }

        return studentData;
      })
    );

    // Filter out nulls
    students = students.filter((s): s is StudentProgressData => s !== null);
  }

  // Generate tutor progress data
  if (type === 'tutor' || type === 'custom') {
    let tutorIds = scope.tutorIds || [];
    
    // If no specific tutors, get all tutors from sessions
    if (tutorIds.length === 0) {
      tutorIds = Array.from(new Set(allSessions.map(s => s.tutorId)));
    }

    tutors = await Promise.all(
      tutorIds.map(async (tutorId) => {
        const tutor = await storage.findById<Tutor>('users.json', tutorId);
        if (!tutor) return null;

        // Get tutor sessions
        const tutorSessions = allSessions.filter(s => s.tutorId === tutorId);

        // Get tutor evaluations
        const tutorEvaluations = evaluations.filter(e => e.tutorId === tutorId);

        // Calculate metrics
        const completedSessions = tutorSessions.filter(s => 
          s.status === SessionStatus.COMPLETED
        );
        const attendanceRate = tutorSessions.length > 0
          ? (completedSessions.length / tutorSessions.length) * 100
          : 0;

        // Calculate average rating
        const ratings = tutorEvaluations.map(e => e.rating);
        const averageRating = ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
          : 0;

        // Calculate performance metrics from evaluations
        const performanceMetrics = {
          communication: 0,
          knowledge: 0,
          helpfulness: 0,
          punctuality: 0
        };

        tutorEvaluations.forEach(evaluation => {
          if (evaluation.aspects) {
            performanceMetrics.communication += evaluation.aspects.communication || 0;
            performanceMetrics.knowledge += evaluation.aspects.knowledge || 0;
            performanceMetrics.helpfulness += evaluation.aspects.helpfulness || 0;
            performanceMetrics.punctuality += evaluation.aspects.punctuality || 0;
          }
        });

        const evalCount = tutorEvaluations.filter(e => e.aspects).length;
        if (evalCount > 0) {
          performanceMetrics.communication = performanceMetrics.communication / evalCount;
          performanceMetrics.knowledge = performanceMetrics.knowledge / evalCount;
          performanceMetrics.helpfulness = performanceMetrics.helpfulness / evalCount;
          performanceMetrics.punctuality = performanceMetrics.punctuality / evalCount;
        }

        // Get unique students
        const studentIds = new Set(
          tutorSessions.flatMap(s => s.studentIds || [])
        );
        const studentsCount = studentIds.size;

        // Get subjects
        const subjects = Array.from(new Set(tutorSessions.map(s => s.subject)));

        return {
          tutorId: tutor.id,
          tutorName: tutor.name,
          studentsCount,
          sessionsCompleted: completedSessions.length,
          sessionsTotal: tutorSessions.length,
          averageRating: Math.round(averageRating * 100) / 100,
          attendanceRate: Math.round(attendanceRate * 100) / 100,
          subjects,
          performanceMetrics: {
            communication: Math.round(performanceMetrics.communication * 100) / 100,
            knowledge: Math.round(performanceMetrics.knowledge * 100) / 100,
            helpfulness: Math.round(performanceMetrics.helpfulness * 100) / 100,
            punctuality: Math.round(performanceMetrics.punctuality * 100) / 100
          }
        };
      })
    );

    // Filter out nulls
    tutors = tutors.filter(t => t !== null) as TutorProgressData[];
  }

  // Generate summary
  const summary: ProgressReportSummary = {
    totalStudents: new Set(students.map(s => s.studentId)).size,
    totalTutors: new Set(tutors.map(t => t.tutorId)).size,
    totalSessions: allSessions.length,
    completedSessions: allSessions.filter(s => s.status === SessionStatus.COMPLETED).length,
    averageAttendanceRate: students.length > 0
      ? students.reduce((sum, s) => sum + s.attendanceRate, 0) / students.length
      : 0,
    averageScore: students.length > 0
      ? students.reduce((sum, s) => sum + s.averageScore, 0) / students.length
      : 0,
    averageRating: tutors.length > 0
      ? tutors.reduce((sum, t) => sum + t.averageRating, 0) / tutors.length
      : 0
  };

  return {
    id: generateId('report'),
    title: `Progress Report - ${type}`,
    type,
    scope,
    data: {
      students: students.length > 0 ? students : undefined,
      tutors: tutors.length > 0 ? tutors : undefined,
      summary
    },
    filters,
    createdBy: 'system',
    createdAt: now(),
    updatedAt: now()
  };
}

/**
 * Export report to format
 */
export function exportReport(
  report: ProgressReport,
  format: 'json' | 'csv' | 'pdf'
): string | Buffer {
  if (format === 'json') {
    return JSON.stringify(report, null, 2);
  } else if (format === 'csv') {
    // Simple CSV export
    let csv = 'Type,ID,Name,Attendance Rate,Average Score/Rating\n';
    
    if (report.data.students) {
      report.data.students.forEach(student => {
        csv += `Student,${student.studentId},${student.studentName},${student.attendanceRate},${student.averageScore}\n`;
      });
    }
    
    if (report.data.tutors) {
      report.data.tutors.forEach(tutor => {
        csv += `Tutor,${tutor.tutorId},${tutor.tutorName},${tutor.attendanceRate},${tutor.averageRating}\n`;
      });
    }
    
    return csv;
  } else {
    // PDF would require a PDF library
    // For now, return JSON as fallback
    return JSON.stringify(report, null, 2);
  }
}

