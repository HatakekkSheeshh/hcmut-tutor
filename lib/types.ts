// ===== ENUMS & CONSTANTS =====

export enum UserRole {
  STUDENT = 'student',
  TUTOR = 'tutor',
  MANAGEMENT = 'management'
}

export enum SessionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  RESCHEDULED = 'rescheduled'
}

export enum NotificationType {
  SESSION_BOOKING = 'session_booking',
  SESSION_REMINDER = 'session_reminder',
  SESSION_CANCELLED = 'session_cancelled',
  SESSION_RESCHEDULED = 'session_rescheduled',
  SESSION_CANCEL_REQUEST = 'session_cancel_request',
  SESSION_RESCHEDULE_REQUEST = 'session_reschedule_request',
  NEW_MESSAGE = 'new_message',
  EVALUATION_REQUEST = 'evaluation_request',
  APPROVAL_REQUEST = 'approval_request',
  APPROVAL_APPROVED = 'approval_approved',
  APPROVAL_REJECTED = 'approval_rejected',
  PERMISSION_CHANGED = 'permission_changed',
  SYSTEM = 'system'
}

// ApprovalStatus is now ApprovalRequestStatus - see below

export enum RequestType {
  CANCEL = 'cancel',
  RESCHEDULE = 'reschedule'
}

export enum RequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn'
}

// ===== USER ENTITIES =====

export interface BaseUser {
  id: string;
  email: string;
  password: string; // hashed
  name: string;
  hcmutId: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Student extends BaseUser {
  role: UserRole.STUDENT;
  major?: string;
  year?: number;
  interests?: string[];
  preferredSubjects?: string[];
  trainingCredits?: number; // Total training credits earned
}

export interface Tutor extends BaseUser {
  role: UserRole.TUTOR;
  subjects: string[];
  bio?: string;
  rating: number;
  totalSessions: number;
  availability: string[]; // array of time slots
  verified: boolean;
  credentials?: string[];
}

export interface Management extends BaseUser {
  role: UserRole.MANAGEMENT;
  department?: string;
  permissions: string[];
}

export type User = Student | Tutor | Management;

// ===== SESSION ENTITIES =====

export interface Session {
  id: string;
  studentIds: string[]; // Changed from studentId to support multiple students
  tutorId: string;
  subject: string;
  topic?: string;
  description?: string;
  status: SessionStatus;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  location?: string;
  isOnline: boolean;
  meetingLink?: string;
  notes?: string;
  classId?: string; // Link to Class for recurring sessions
  createdAt: string;
  updatedAt: string;
  cancelledBy?: string;
  cancelReason?: string;
  rescheduledFrom?: string;
}

// ===== AVAILABILITY =====

export interface TimeSlot {
  day: string; // 'monday', 'tuesday', etc.
  startTime: string; // '09:00'
  endTime: string; // '17:00'
}

export interface Availability {
  id: string;
  tutorId: string;
  timeSlots: TimeSlot[];
  exceptions?: {
    date: string;
    reason: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

// ===== CLASS & ENROLLMENT =====

export enum ClassStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  FULL = 'full'
}

export enum EnrollmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DROPPED = 'dropped',
  CANCELLED = 'cancelled'
}

export interface Class {
  id: string;
  code: string; // C01, C02, etc.
  tutorId: string;
  subject: string;
  description?: string;
  day: string; // 'monday', 'tuesday', etc.
  startTime: string; // '08:00'
  endTime: string; // '10:00'
  duration: number; // minutes
  maxStudents: number; // capacity
  currentEnrollment: number; // số students hiện tại
  status: ClassStatus;
  semesterStart: string; // ISO date
  semesterEnd: string; // ISO date
  isOnline: boolean;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  classId: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  completedAt?: string;
  droppedAt?: string;
  notes?: string;
}

// ===== MESSAGES =====

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'file' | 'image';
  fileUrl?: string;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: string[]; // user IDs
  lastMessage?: Message;
  unreadCount: { [userId: string]: number };
  createdAt: string;
  updatedAt: string;
}

// ===== NOTIFICATIONS =====

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  metadata?: any;
  createdAt: string;
}

// ===== EVALUATIONS =====

export interface Evaluation {
  id: string;
  sessionId: string;
  studentId: string;
  tutorId: string;
  rating: number; // 1-5
  comment?: string;
  aspects?: {
    communication?: number;
    knowledge?: number;
    helpfulness?: number;
    punctuality?: number;
  };
  improvements?: string[];
  recommend?: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ===== PROGRESS TRACKING =====

export interface ProgressEntry {
  id: string;
  studentId: string;
  tutorId: string;
  sessionId?: string;
  subject: string;
  topic: string;
  notes: string;
  score?: number;
  improvements?: string[];
  challenges?: string[];
  nextSteps?: string[];
  createdAt: string;
}

export interface ProgressStats {
  studentId: string;
  subjectStats: {
    subject: string;
    sessionsCompleted: number;
    averageScore?: number;
    totalHours: number;
    improvement?: number; // percentage
  }[];
  totalSessions: number;
  totalHours: number;
  favoriteSubjects: string[];
  recentProgress: ProgressEntry[];
}

// ===== DIGITAL LIBRARY =====

export interface LibraryResource {
  id: string;
  title: string;
  type: 'book' | 'article' | 'video' | 'document' | 'other';
  subject: string;
  description?: string;
  author?: string;
  url?: string;
  fileUrl?: string;
  thumbnail?: string;
  tags: string[];
  sharedBy?: string;
  downloads: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

// ===== FORUM =====

export interface ForumPost {
  id: string;
  authorId: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  likes: string[]; // user IDs who liked
  views: number;
  pinned: boolean;
  locked: boolean;
  status?: 'pending' | 'approved' | 'rejected' | 'hidden'; // For content moderation
  moderationNotes?: string; // Notes from moderator
  moderatedBy?: string; // User ID of moderator
  moderatedAt?: string; // When content was moderated
  createdAt: string;
  updatedAt: string;
}

export interface ForumComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  parentCommentId?: string; // for nested comments
  likes: string[];
  status?: 'pending' | 'approved' | 'rejected' | 'hidden'; // For content moderation
  moderationNotes?: string; // Notes from moderator
  moderatedBy?: string; // User ID of moderator
  moderatedAt?: string; // When content was moderated
  createdAt: string;
  updatedAt: string;
}

// ===== ANALYTICS =====

export interface SessionAnalytics {
  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  averageDuration: number;
  popularSubjects: { subject: string; count: number }[];
  sessionsPerDay: { date: string; count: number }[];
  sessionsPerTutor: { tutorId: string; count: number }[];
}

export interface TutorPerformance {
  tutorId: string;
  totalSessions: number;
  completedSessions: number;
  averageRating: number;
  studentCount: number;
  subjects: string[];
  responseTime?: number; // average in minutes
}

export interface SystemAnalytics {
  totalUsers: number;
  activeUsers: number;
  totalStudents: number;
  totalTutors: number;
  totalSessions: number;
  growthRate: {
    users: number; // percentage
    sessions: number;
  };
  topTutors: TutorPerformance[];
  sessionAnalytics: SessionAnalytics;
}

// ===== APPROVALS =====

export enum ApprovalRequestType {
  TUTOR_VERIFICATION = 'tutor_verification',
  SESSION_CHANGE = 'session_change',
  RESOURCE_ALLOCATION = 'resource_allocation',
  CONTENT_MODERATION = 'content_moderation'
}

export enum ApprovalRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CLARIFICATION_REQUESTED = 'clarification_requested',
  ESCALATED = 'escalated'
}

export interface ApprovalRequest {
  id: string;
  type: ApprovalRequestType;
  requesterId: string;
  targetId?: string; // ID of the entity being approved (user, post, session, etc.)
  title: string;
  description: string;
  status: ApprovalRequestStatus;
  reviewerId?: string;
  reviewNotes?: string;
  attachments?: string[];
  clarificationRequest?: string; // Request for clarification from coordinator
  escalationReason?: string; // Reason for escalation to Academic Affairs
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  deadline?: string; // 48-hour deadline from creation
  // Session change specific fields
  changeType?: 'change_type' | 'change_location' | 'change_duration';
  changeData?: {
    // For change_type (Individual ↔ Group)
    newType?: 'individual' | 'group';
    newStudentIds?: string[]; // For converting to group - list of student IDs
    mergeSessionIds?: string[]; // For merge: IDs of sessions to merge
    splitInto?: number; // For split: number of individual sessions to create
    // For change_location (Offline ↔ Online)
    newIsOnline?: boolean;
    newLocation?: string;
    newMeetingLink?: string;
    // For change_duration (Reschedule)
    newStartTime?: string;
    newEndTime?: string;
    newDuration?: number;
    // For cancel request (via change_duration type)
    cancelRequest?: boolean;
    cancelReason?: string;
  };
  originalSessionData?: Session; // Snapshot of session before change
  proposedSessionData?: Partial<Session>; // Proposed session data after change
  // Resource allocation specific fields
  resourceAllocationData?: {
    optimizationPlanId?: string; // ID of optimization plan
    changes?: Array<{
      type: 'reassign_tutor' | 'adjust_group_size' | 'reallocate_room' | 'adjust_schedule';
      resourceId: string; // Tutor ID, Session ID, Class ID, Room ID
      fromValue?: any; // Old value
      toValue?: any; // New value
      reason?: string;
      equipmentRequirements?: string[]; // Equipment requirements for room allocation
    }>;
    affectedTutorIds?: string[]; // Tutors affected by allocation
    affectedSessionIds?: string[]; // Sessions affected by allocation
    affectedStudentIds?: string[]; // Students affected by allocation
  };
  // Content moderation specific fields
  contentModerationData?: {
    contentType: 'post' | 'comment'; // Type of content being moderated
    contentId: string; // Post ID or Comment ID
    contentPreview?: string; // Preview of content (first 200 chars)
    reportedBy?: string[]; // User IDs who reported this content
    reportReasons?: string[]; // Reasons for reporting
    violationType?: 'spam' | 'inappropriate' | 'harassment' | 'false_information' | 'other';
    severity?: 'low' | 'medium' | 'high' | 'critical';
  };
  createdAt: string;
  updatedAt: string;
}

// ===== PERMISSIONS =====

export interface PermissionAudit {
  id: string;
  userId: string;
  action: 'grant' | 'revoke' | 'update';
  permissions: string[];
  previousPermissions?: string[];
  actorId: string; // ID of the management user who made the change
  reason?: string;
  temporary?: boolean;
  expiresAt?: string; // For temporary permissions
  createdAt: string;
}

export interface UserPermission {
  userId: string;
  permissions: string[];
  lastUpdated: string;
  updatedBy: string;
}

// ===== ROOMS & BUILDINGS =====

export interface Room {
  id: string;
  name: string;
  code: string;
  capacity: number;
  equipment: string[];
  floor: number;
  buildingId: string;
}

export interface Floor {
  floorNumber: number;
  rooms: Room[];
}

export interface Building {
  id: string;
  name: string;
  code: string;
  description?: string;
  floors: Floor[];
  createdAt: string;
  updatedAt: string;
}

// ===== RESOURCE ALLOCATION =====

export interface ResourceAllocation {
  id: string;
  tutorId: string;
  sessionIds: string[];
  classIds: string[];
  totalHours: number;
  studentCount: number;
  workload: 'low' | 'medium' | 'high' | 'overloaded';
  createdAt: string;
  updatedAt: string;
}

export interface ResourceInefficiency {
  id: string;
  type: 'overloaded_tutor' | 'unbalanced_group' | 'underutilized_tutor' | 'resource_conflict';
  description: string;
  severity: 'low' | 'medium' | 'high';
  affectedResources: string[]; // tutor IDs, session IDs, class IDs
  suggestedActions: string[];
  createdAt: string;
}

export interface OptimizationPlan {
  id: string;
  name: string;
  description: string;
  changes: OptimizationChange[];
  estimatedImpact: {
    workloadReduction: number; // percentage
    balanceImprovement: number; // percentage
    resourceUtilization: number; // percentage
  };
  status: 'draft' | 'pending' | 'applied' | 'rejected';
  createdBy: string;
  createdAt: string;
  appliedAt?: string;
}

export interface OptimizationChange {
  type: 'reallocate_session' | 'reallocate_student' | 'adjust_group_size' | 'modify_schedule';
  from: string; // tutor ID, session ID, etc.
  to: string;
  resourceId: string; // session ID, student ID, etc.
  reason: string;
}

// ===== PROGRESS REPORTS =====

export interface ProgressReport {
  id: string;
  title: string;
  type: 'student' | 'tutor' | 'department' | 'subject' | 'custom';
  scope: {
    studentIds?: string[];
    tutorIds?: string[];
    department?: string;
    subject?: string;
    timeRange: {
      startDate: string;
      endDate: string;
    };
  };
  data: {
    students?: StudentProgressData[];
    tutors?: TutorProgressData[];
    summary: ProgressReportSummary;
  };
  filters?: {
    minScore?: number;
    minAttendance?: number;
    subjects?: string[];
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProgressData {
  studentId: string;
  studentName: string;
  sessionsCompleted: number;
  sessionsTotal: number;
  attendanceRate: number; // percentage
  averageScore: number;
  subjects: {
    subject: string;
    sessions: number;
    averageScore: number;
    attendanceRate: number;
  }[];
  improvements: string[];
  challenges: string[];
}

export interface TutorProgressData {
  tutorId: string;
  tutorName: string;
  studentsCount: number;
  sessionsCompleted: number;
  sessionsTotal: number;
  averageRating: number;
  attendanceRate: number; // percentage
  subjects: string[];
  performanceMetrics: {
    communication: number;
    knowledge: number;
    helpfulness: number;
    punctuality: number;
  };
}

export interface ProgressReportSummary {
  totalStudents: number;
  totalTutors: number;
  totalSessions: number;
  completedSessions: number;
  averageAttendanceRate: number;
  averageScore: number;
  averageRating: number;
}

// ===== PERFORMANCE ANALYSIS =====

export interface PerformanceAnalysis {
  id: string;
  type: 'student' | 'tutor' | 'comparative' | 'overall';
  scope: {
    studentIds?: string[];
    tutorIds?: string[];
    subjects?: string[];
    timeRange: {
      startDate: string;
      endDate: string;
    };
  };
  metrics: PerformanceMetrics;
  trends: PerformanceTrend[];
  comparisons?: PerformanceComparison[];
  createdAt: string;
}

export interface PerformanceMetrics {
  attendance: {
    average: number;
    total: number;
    present: number;
    absent: number;
    rate: number; // percentage
  };
  ratings: {
    average: number;
    total: number;
    distribution: { rating: number; count: number }[];
  };
  completion: {
    rate: number; // percentage
    completed: number;
    total: number;
  };
  scores: {
    average: number;
    total: number;
    distribution: { range: string; count: number }[];
  };
}

export interface PerformanceTrend {
  period: string; // week, month, etc.
  date: string;
  attendanceRate: number;
  averageRating: number;
  completionRate: number;
  averageScore: number;
}

export interface PerformanceComparison {
  entityId: string; // student ID or tutor ID
  entityName: string;
  metrics: PerformanceMetrics;
  rank: number;
  percentile: number;
}

export interface PerformanceKPIs {
  overall: {
    totalStudents: number;
    totalTutors: number;
    totalSessions: number;
    averageAttendanceRate: number;
    averageRating: number;
    completionRate: number;
  };
  students: {
    topPerformers: { studentId: string; studentName: string; score: number }[];
    needsAttention: { studentId: string; studentName: string; issues: string[] }[];
    averageProgress: number;
  };
  tutors: {
    topRated: { tutorId: string; tutorName: string; rating: number }[];
    mostActive: { tutorId: string; tutorName: string; sessions: number }[];
    averageRating: number;
  };
  trends: {
    attendanceTrend: 'increasing' | 'decreasing' | 'stable';
    ratingTrend: 'increasing' | 'decreasing' | 'stable';
    completionTrend: 'increasing' | 'decreasing' | 'stable';
  };
}

// ===== TRAINING CREDITS =====

export interface TrainingCredit {
  id: string;
  studentId: string;
  sessionId?: string; // Optional - for session-based credits
  classId?: string; // Optional - for class-based credits
  semester?: string; // e.g., "2024-2025-1"
  credits: number; // Number of credits awarded
  reason: string; // Reason for awarding credits
  awardedBy: string; // Management user ID who awarded
  awardedAt: string;
  revokedAt?: string;
  revokedBy?: string;
  revokeReason?: string;
  status: 'active' | 'revoked';
  metadata?: {
    attendanceRate?: number;
    performanceScore?: number;
    completionRate?: number;
  };
}

export interface CreditEligibility {
  studentId: string;
  studentName: string;
  eligible: boolean;
  reason: string;
  sessionId?: string;
  classId?: string;
  semester?: string;
  criteria: {
    attendanceRate: number;
    minAttendanceRequired: number;
    sessionsCompleted: number;
    minSessionsRequired: number;
    performanceScore?: number;
    minPerformanceRequired?: number;
  };
}

// ===== DOCUMENT SHARING =====

export interface Document {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  fileUrl: string;
  fileSize: number; // bytes
  fileType: string; // MIME type
  category: 'academic' | 'administrative' | 'reference' | 'other';
  subject?: string;
  tags: string[];
  uploadedBy: string; // User ID
  uploadedAt: string;
  updatedAt: string;
  isPublic: boolean;
  isEncrypted: boolean;
  accessLevel: 'public' | 'private' | 'restricted';
  downloadCount: number;
  viewCount: number;
  metadata?: {
    author?: string;
    version?: string;
    language?: string;
    pages?: number;
  };
}

export interface DocumentPermission {
  id: string;
  documentId: string;
  userId: string;
  permission: 'read' | 'write' | 'delete' | 'share';
  grantedBy: string;
  grantedAt: string;
  expiresAt?: string;
  isTemporary: boolean;
}

export interface DocumentSharing {
  id: string;
  documentId: string;
  sharedBy: string;
  sharedWith: string[]; // User IDs
  sharedAt: string;
  message?: string;
  expiresAt?: string;
  accessLevel: 'read' | 'write' | 'delete';
}

export interface DocumentActivity {
  id: string;
  documentId: string;
  userId: string;
  action: 'view' | 'download' | 'upload' | 'update' | 'delete' | 'share' | 'revoke_access';
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}

// ===== COMMUNITY MANAGEMENT =====

export interface CommunityResource {
  id: string;
  title: string;
  description?: string;
  type: 'document' | 'link' | 'video' | 'other';
  url?: string;
  fileUrl?: string;
  thumbnail?: string;
  category: 'academic' | 'administrative' | 'reference' | 'event' | 'other';
  subject?: string;
  tags: string[];
  sharedBy: string; // User ID
  sharedAt: string;
  isPublic: boolean;
  isEncrypted: boolean;
  accessLevel: 'public' | 'private' | 'restricted';
  restrictedTo?: string[]; // User IDs or roles
  downloadCount: number;
  viewCount: number;
  likes: string[]; // User IDs who liked
  metadata?: {
    author?: string;
    duration?: number; // For videos
    language?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  type: 'webinar' | 'workshop' | 'meeting' | 'seminar' | 'other';
  organizerId: string; // User ID
  startTime: string;
  endTime: string;
  location?: string;
  meetingLink?: string;
  isOnline: boolean;
  maxParticipants?: number;
  participants: string[]; // User IDs
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  category: string;
  tags: string[];
  resources?: string[]; // CommunityResource IDs
  registrationRequired: boolean;
  registrationDeadline?: string;
  metadata?: {
    agenda?: string;
    speakers?: string[];
    recordingUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CommunityActivity {
  id: string;
  type: 'forum_post' | 'forum_comment' | 'resource_share' | 'event_create' | 'event_join' | 'resource_view' | 'resource_download';
  userId: string;
  entityId: string; // Forum post ID, resource ID, event ID, etc.
  entityType: 'forum' | 'resource' | 'event';
  action: string;
  timestamp: string;
  metadata?: any;
}

// ===== API RESPONSES =====

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ===== SEARCH & FILTERS =====

export interface SearchFilters {
  subject?: string;
  minRating?: number;
  availability?: string; // 'today', 'tomorrow', 'this-week'
  location?: string;
  isOnline?: boolean;
}

export interface TutorMatchScore {
  tutorId: string;
  score: number;
  reasons: string[];
  tutor?: Tutor;
}

// ===== COURSE CONTENT =====

export enum CourseContentType {
  DOCUMENT = 'document',
  ANNOUNCEMENT = 'announcement',
  MATERIAL = 'material',
  LINK = 'link'
}

export interface CourseContent {
  id: string;
  sessionId?: string; // Optional - for one-time sessions
  classId?: string; // Optional - for recurring classes
  type: CourseContentType;
  title: string;
  description?: string;
  content?: string; // For announcements or text content
  fileUrl?: string;
  fileName?: string;
  fileSize?: number; // bytes
  url?: string; // For external links
  createdBy: string; // tutor ID
  createdAt: string;
  updatedAt: string;
}

// ===== QUIZZES =====

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[]; // For multiple choice
  correctAnswer: string | number; // Answer index for MC, string for others
  points: number;
}

export interface Quiz {
  id: string;
  sessionId?: string; // Optional - for one-time sessions
  classId?: string; // Optional - for recurring classes
  title: string;
  description?: string;
  questions: QuizQuestion[];
  totalPoints: number;
  duration?: number; // minutes
  dueDate?: string;
  createdBy: string; // tutor ID
  createdAt: string;
  updatedAt: string;
}

export interface QuizSubmission {
  id: string;
  quizId: string;
  studentId: string;
  answers: {
    questionId: string;
    answer: string | number;
  }[];
  score?: number;
  gradedBy?: string; // tutor ID
  submittedAt: string;
  gradedAt?: string;
}

// ===== ASSIGNMENTS =====

export interface Assignment {
  id: string;
  sessionId?: string; // Optional - for one-time sessions
  classId?: string; // Optional - for recurring classes
  title: string;
  description: string;
  instructions?: string;
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
  }[];
  totalPoints: number;
  dueDate: string;
  createdBy: string; // tutor ID
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  content?: string; // Text submission
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
  }[];
  score?: number;
  feedback?: string;
  gradedBy?: string; // tutor ID
  submittedAt: string;
  gradedAt?: string;
  status: 'submitted' | 'graded' | 'late';
}

// ===== GRADES =====

export interface Grade {
  id: string;
  sessionId?: string; // Optional - for one-time sessions
  classId?: string; // Optional - for recurring classes
  studentId: string;
  itemType: 'quiz' | 'assignment';
  itemId: string; // quizId or assignmentId
  itemTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  feedback?: string;
  gradedBy: string; // tutor ID
  gradedAt: string;
}

export interface GradeSummary {
  studentId: string;
  sessionId?: string; // Optional - for one-time sessions
  classId?: string; // Optional - for recurring classes
  totalPoints: number;
  earnedPoints: number;
  percentage: number;
  grades: Grade[];
}

// ===== SESSION REQUESTS =====

export interface SessionRequest {
  id: string;
  sessionId: string;
  studentId: string;
  tutorId: string;
  classId?: string; // Optional - copy from session.classId to distinguish class session vs individual
  type: RequestType; // cancel or reschedule
  status: RequestStatus;
  reason: string; // reason from student
  preferredStartTime?: string; // for reschedule
  preferredEndTime?: string; // for reschedule
  alternativeSessionId?: string; // For class reschedule - selected alternative session ID
  responseMessage?: string; // response from tutor
  createdAt: string;
  updatedAt: string;
}

