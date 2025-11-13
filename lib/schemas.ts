import { z } from 'zod';
import { UserRole, SessionStatus, NotificationType, CourseContentType, ApprovalRequestType, ApprovalRequestStatus } from './types.js';

// ===== AUTH SCHEMAS =====

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.nativeEnum(UserRole),
  phone: z.string().optional(),
  // Role-specific fields
  major: z.string().optional(),
  year: z.number().min(1).max(6).optional(),
  subjects: z.array(z.string()).optional(),
  bio: z.string().optional()
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
  // Student fields
  major: z.string().optional(),
  year: z.number().min(1).max(6).optional(),
  interests: z.array(z.string()).optional(),
  preferredSubjects: z.array(z.string()).optional(),
  // Tutor fields
  subjects: z.array(z.string()).optional(),
  bio: z.string().optional(),
  credentials: z.array(z.string()).optional()
});

// ===== SESSION SCHEMAS =====

export const createSessionSchema = z.object({
  tutorId: z.string().optional(), // Optional if classId is provided
  classId: z.string().optional(), // For class-based sessions
  subject: z.string().min(1, 'Subject is required').optional(), // Optional if classId is provided
  topic: z.string().optional(),
  description: z.string().optional(),
  startTime: z.string().datetime('Invalid datetime format'),
  endTime: z.string().datetime('Invalid datetime format'),
  duration: z.number().positive(),
  isOnline: z.boolean().default(true),
  meetingLink: z.string().url().optional(),
  location: z.string().optional(),
  notes: z.string().optional()
});

export const updateSessionSchema = z.object({
  subject: z.string().optional(),
  topic: z.string().optional(),
  description: z.string().optional(),
  status: z.nativeEnum(SessionStatus).optional(),
  notes: z.string().optional(),
  meetingLink: z.string().url().optional()
});

export const rescheduleSessionSchema = z.object({
  startTime: z.string().datetime('Invalid datetime format'),
  endTime: z.string().datetime('Invalid datetime format'),
  reason: z.string().optional()
});

export const cancelSessionSchema = z.object({
  reason: z.string().min(10, 'Please provide a reason (min 10 characters)')
});

// ===== SESSION REQUEST SCHEMAS =====

export const createSessionRequestSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  type: z.enum(['cancel', 'reschedule'], {
    required_error: 'Request type is required',
    invalid_type_error: 'Request type must be either cancel or reschedule'
  }),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
  preferredStartTime: z.string().datetime('Invalid preferred start time format').optional(),
  preferredEndTime: z.string().datetime('Invalid preferred end time format').optional(),
  alternativeSessionId: z.string().optional() // For class reschedule - selected alternative class/session ID
}).refine(
  (data) => {
    if (data.type === 'reschedule') {
      // If alternativeSessionId is provided (class reschedule), preferredStartTime/EndTime are not required
      if (data.alternativeSessionId) {
        return true;
      }
      // Otherwise, preferredStartTime and preferredEndTime are required
      return !!data.preferredStartTime && !!data.preferredEndTime;
    }
    return true;
  },
  {
    message: 'Preferred start time and end time are required for reschedule requests (unless alternative session/class is selected)',
    path: ['preferredStartTime']
  }
);

export const approveSessionRequestSchema = z.object({
  responseMessage: z.string().optional(),
  newStartTime: z.string().datetime('Invalid new start time format').optional(),
  newEndTime: z.string().datetime('Invalid new end time format').optional()
});

export const rejectSessionRequestSchema = z.object({
  responseMessage: z.string().optional()
});

// ===== AVAILABILITY SCHEMAS =====

export const timeSlotSchema = z.object({
  day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)')
});

export const setAvailabilitySchema = z.object({
  timeSlots: z.array(timeSlotSchema).min(1, 'At least one time slot is required'),
  exceptions: z.array(
    z.object({
      date: z.string().date(),
      reason: z.string()
    })
  ).optional()
});

// ===== CLASS SCHEMAS =====

export const createClassSchema = z.object({
  code: z.string().min(1, 'Class code is required').optional(), // Auto-generated if not provided
  subject: z.string().min(1, 'Subject is required'),
  description: z.string().optional(),
  day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  duration: z.number().positive('Duration must be positive'),
  maxStudents: z.number().positive('Max students must be positive'),
  semesterStart: z.string().datetime('Invalid semester start date'),
  semesterEnd: z.string().datetime('Invalid semester end date'),
  isOnline: z.boolean().default(true),
  location: z.string().optional()
});

export const updateClassSchema = z.object({
  code: z.string().min(1).optional(),
  subject: z.string().min(1).optional(),
  description: z.string().optional(),
  day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']).optional(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  duration: z.number().positive().optional(),
  maxStudents: z.number().positive().optional(),
  semesterStart: z.string().datetime().optional(),
  semesterEnd: z.string().datetime().optional(),
  isOnline: z.boolean().optional(),
  location: z.string().optional(),
  status: z.enum(['active', 'inactive', 'full']).optional()
});

// ===== ENROLLMENT SCHEMAS =====

export const createEnrollmentSchema = z.object({
  classId: z.string().min(1, 'Class ID is required')
});

export const updateEnrollmentSchema = z.object({
  status: z.enum(['active', 'completed', 'dropped', 'cancelled']),
  notes: z.string().optional()
});

// ===== EVALUATION SCHEMAS =====

export const createEvaluationSchema = z.object({
  sessionId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  aspects: z.object({
    communication: z.number().min(1).max(5),
    knowledge: z.number().min(1).max(5),
    helpfulness: z.number().min(1).max(5),
    punctuality: z.number().min(1).max(5)
  }).optional()
});

// ===== PROGRESS SCHEMAS =====

export const createProgressSchema = z.object({
  sessionId: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  topic: z.string().min(1, 'Topic is required'),
  notes: z.string().min(10, 'Notes must be at least 10 characters'),
  score: z.number().min(0).max(10).optional(),
  improvements: z.array(z.string()).optional(),
  challenges: z.array(z.string()).optional(),
  nextSteps: z.array(z.string()).optional()
});

// ===== MESSAGE SCHEMAS =====

export const sendMessageSchema = z.object({
  receiverId: z.string(),
  content: z.string().min(1, 'Message cannot be empty'),
  type: z.enum(['text', 'file', 'image']).default('text'),
  fileUrl: z.string().url().optional()
});

// ===== NOTIFICATION SCHEMAS =====

export const createNotificationSchema = z.object({
  userId: z.string(),
  type: z.nativeEnum(NotificationType),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  link: z.string().optional(),
  metadata: z.any().optional()
});

// ===== LIBRARY SCHEMAS =====

export const createLibraryResourceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.enum(['book', 'article', 'video', 'document', 'other']),
  subject: z.string().min(1, 'Subject is required'),
  description: z.string().optional(),
  author: z.string().optional(),
  url: z.string().url().optional(),
  fileUrl: z.string().url().optional(),
  thumbnail: z.string().url().optional(),
  tags: z.array(z.string()).default([])
});

export const shareResourceSchema = z.object({
  resourceId: z.string(),
  userIds: z.array(z.string()).min(1, 'At least one user must be specified')
});

// ===== FORUM SCHEMAS =====

export const createForumPostSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  content: z.string().min(20, 'Content must be at least 20 characters'),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).default([])
});

export const updateForumPostSchema = z.object({
  title: z.string().min(5).optional(),
  content: z.string().min(20).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional()
});

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty'),
  parentCommentId: z.string().optional()
});

// ===== APPROVAL SCHEMAS =====

export const createApprovalRequestSchema = z.object({
  type: z.nativeEnum(ApprovalRequestType),
  targetId: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  attachments: z.array(z.string()).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  // Session change specific fields
  changeType: z.enum(['change_type', 'change_location', 'change_duration']).optional(),
  changeData: z.object({
    // For change_type (Individual ↔ Group)
    newType: z.enum(['individual', 'group']).optional(),
    newStudentIds: z.array(z.string()).optional(),
    mergeSessionIds: z.array(z.string()).optional(), // For merge: IDs of sessions to merge
    splitInto: z.number().int().positive().optional(), // For split: number of individual sessions to create
    // For change_location (Offline ↔ Online)
    newIsOnline: z.boolean().optional(),
    newLocation: z.string().optional(),
    newMeetingLink: z.string().url().optional(),
    // For change_duration (Reschedule)
    newStartTime: z.string().datetime().optional(),
    newEndTime: z.string().datetime().optional(),
    newDuration: z.number().positive().optional(),
    // For cancel request (via change_duration type)
    cancelRequest: z.boolean().optional(),
    cancelReason: z.string().optional()
  }).optional(),
  // Resource allocation specific fields
  resourceAllocationData: z.object({
    optimizationPlanId: z.string().optional(),
    changes: z.array(z.object({
      type: z.enum(['reassign_tutor', 'adjust_group_size', 'reallocate_room', 'adjust_schedule']),
      resourceId: z.string(),
      fromValue: z.any().optional(),
      toValue: z.any().optional(),
      reason: z.string().optional()
    })).optional(),
    affectedTutorIds: z.array(z.string()).optional(),
    affectedSessionIds: z.array(z.string()).optional(),
    affectedStudentIds: z.array(z.string()).optional()
  }).optional(),
  // Content moderation specific fields
  contentModerationData: z.object({
    contentType: z.enum(['post', 'comment']),
    contentId: z.string(),
    contentPreview: z.string().optional(),
    reportedBy: z.array(z.string()).optional(),
    reportReasons: z.array(z.string()).optional(),
    violationType: z.enum(['spam', 'inappropriate', 'harassment', 'false_information', 'other']).optional(),
    severity: z.enum(['low', 'medium', 'high', 'critical']).optional()
  }).optional()
}).refine(
  (data) => {
    // If type is session_change, changeType and changeData are required
    if (data.type === ApprovalRequestType.SESSION_CHANGE) {
      if (!data.changeType) {
        return false;
      }
      if (!data.changeData) {
        return false;
      }
      // For change_type, validate required fields
      if (data.changeType === 'change_type') {
        // Must have either mergeSessionIds (for merge) or targetId with splitInto (for split)
        if (!data.changeData.mergeSessionIds && !(data.targetId && data.changeData.splitInto)) {
          return false;
        }
        // If merge, must have at least 2 session IDs
        if (data.changeData.mergeSessionIds && data.changeData.mergeSessionIds.length < 2) {
          return false;
        }
        // If split, must have targetId and splitInto > 1
        if (data.targetId && data.changeData.splitInto && data.changeData.splitInto < 2) {
          return false;
        }
      }
      // For change_location, validate required fields
      else if (data.changeType === 'change_location') {
        // Must have targetId
        if (!data.targetId) {
          return false;
        }
        // Must have newIsOnline
        if (data.changeData.newIsOnline === undefined) {
          return false;
        }
        // If changing to online, must have newMeetingLink
        if (data.changeData.newIsOnline === true && !data.changeData.newMeetingLink) {
          return false;
        }
        // If changing to offline, must have newLocation
        if (data.changeData.newIsOnline === false && !data.changeData.newLocation) {
          return false;
        }
      }
      // For change_duration, validate required fields
      else if (data.changeType === 'change_duration') {
        // Must have targetId
        if (!data.targetId) {
          return false;
        }
        // Must have newStartTime and newEndTime
        if (!data.changeData.newStartTime || !data.changeData.newEndTime) {
          return false;
        }
      }
    }
    // If type is resource_allocation, resourceAllocationData is required
    if (data.type === ApprovalRequestType.RESOURCE_ALLOCATION) {
      if (!data.resourceAllocationData) {
        return false;
      }
      // Must have either optimizationPlanId or changes array
      if (!data.resourceAllocationData.optimizationPlanId && (!data.resourceAllocationData.changes || data.resourceAllocationData.changes.length === 0)) {
        return false;
      }
    }
    // If type is content_moderation, contentModerationData is required
    if (data.type === ApprovalRequestType.CONTENT_MODERATION) {
      if (!data.contentModerationData) {
        return false;
      }
      // Must have contentType and contentId
      if (!data.contentModerationData.contentType || !data.contentModerationData.contentId) {
        return false;
      }
      // Must have targetId pointing to the content
      if (!data.targetId) {
        return false;
      }
    }
    return true;
  },
  {
    message: 'For session_change type, changeType and changeData are required. For resource_allocation type, resourceAllocationData with optimizationPlanId or changes array is required. For content_moderation type, contentModerationData with contentType and contentId, and targetId are required.'
  }
);

export const approveApprovalRequestSchema = z.object({
  reviewNotes: z.string().optional(),
  location: z.string().optional() // Location for room allocation requests
});

export const rejectApprovalRequestSchema = z.object({
  reviewNotes: z.string().min(10, 'Review notes must be at least 10 characters when rejecting')
});

export const requestClarificationSchema = z.object({
  clarificationRequest: z.string().min(10, 'Clarification request must be at least 10 characters')
});

export const escalateApprovalRequestSchema = z.object({
  escalationReason: z.string().min(10, 'Escalation reason must be at least 10 characters')
});

// ===== PERMISSION SCHEMAS =====

export const updateUserPermissionsSchema = z.object({
  permissions: z.array(z.string()).min(1, 'At least one permission is required'),
  reason: z.string().optional()
});

export const revokeUserPermissionsSchema = z.object({
  permissions: z.array(z.string()).min(1, 'At least one permission is required'),
  reason: z.string().min(10, 'Reason is required when revoking permissions')
});

export const grantTemporaryPermissionsSchema = z.object({
  permissions: z.array(z.string()).min(1, 'At least one permission is required'),
  expiresAt: z.string().datetime('Invalid expiration date format'),
  reason: z.string().min(10, 'Reason is required for temporary permissions')
});

// ===== SEARCH & FILTER SCHEMAS =====

export const searchTutorsSchema = z.object({
  subject: z.string().optional(),
  minRating: z.number().min(0).max(5).optional(),
  availability: z.enum(['today', 'tomorrow', 'this-week', 'next-week']).optional(),
  location: z.string().optional(),
  isOnline: z.boolean().optional(),
  useAI: z.boolean().default(false),
  page: z.number().positive().default(1),
  limit: z.number().positive().max(100).default(10)
});

export const searchLibrarySchema = z.object({
  query: z.string().optional(),
  subject: z.string().optional(),
  type: z.enum(['book', 'article', 'video', 'document', 'other']).optional(),
  tags: z.array(z.string()).optional(),
  page: z.number().positive().default(1),
  limit: z.number().positive().max(100).default(10)
});

// ===== RESOURCE ALLOCATION SCHEMAS =====

export const optimizeResourceAllocationSchema = z.object({
  focusAreas: z.array(z.enum(['workload', 'group_balance', 'resource_conflicts', 'utilization'])).optional(),
  constraints: z.object({
    maxWorkloadPerTutor: z.number().positive().optional(),
    minGroupSize: z.number().positive().optional(),
    maxGroupSize: z.number().positive().optional()
  }).optional()
});

export const applyOptimizationSchema = z.object({
  planId: z.string().min(1, 'Plan ID is required'),
  selectedChanges: z.array(z.string()).min(1, 'At least one change must be selected'),
  description: z.string().optional()
});

export const manualOverrideSchema = z.object({
  type: z.enum(['reallocate_session', 'reallocate_student', 'adjust_group_size', 'modify_schedule']),
  from: z.string().min(1, 'From is required'),
  to: z.string().min(1, 'To is required'),
  resourceId: z.string().min(1, 'Resource ID is required'),
  reason: z.string().min(10, 'Reason must be at least 10 characters')
});

// ===== PROGRESS REPORTS SCHEMAS =====

export const createProgressReportSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.enum(['student', 'tutor', 'department', 'subject', 'custom']),
  scope: z.object({
    studentIds: z.array(z.string()).optional(),
    tutorIds: z.array(z.string()).optional(),
    department: z.string().optional(),
    subject: z.string().optional(),
    timeRange: z.object({
      startDate: z.string().datetime('Invalid start date format'),
      endDate: z.string().datetime('Invalid end date format')
    })
  }),
  filters: z.object({
    minScore: z.number().min(0).max(10).optional(),
    minAttendance: z.number().min(0).max(100).optional(),
    subjects: z.array(z.string()).optional()
  }).optional()
});

export const updateProgressReportSchema = z.object({
  title: z.string().min(1).optional(),
  filters: z.object({
    minScore: z.number().min(0).max(10).optional(),
    minAttendance: z.number().min(0).max(100).optional(),
    subjects: z.array(z.string()).optional()
  }).optional()
});

// ===== PERFORMANCE ANALYSIS SCHEMAS =====

export const generatePerformanceAnalysisSchema = z.object({
  type: z.enum(['student', 'tutor', 'comparative', 'overall']),
  scope: z.object({
    studentIds: z.array(z.string()).optional(),
    tutorIds: z.array(z.string()).optional(),
    subjects: z.array(z.string()).optional(),
    timeRange: z.object({
      startDate: z.string().datetime('Invalid start date format'),
      endDate: z.string().datetime('Invalid end date format')
    })
  }),
  includeComparisons: z.boolean().default(false),
  includeTrends: z.boolean().default(true)
});

export const comparePerformanceSchema = z.object({
  entityIds: z.array(z.string()).min(2, 'At least 2 entities required for comparison'),
  entityType: z.enum(['student', 'tutor']),
  metrics: z.array(z.enum(['attendance', 'ratings', 'completion', 'scores'])).optional(),
  timeRange: z.object({
    startDate: z.string().datetime('Invalid start date format'),
    endDate: z.string().datetime('Invalid end date format')
  }).optional()
});

// ===== TRAINING CREDITS SCHEMAS =====

export const awardCreditsSchema = z.object({
  studentIds: z.array(z.string()).min(1, 'At least one student ID is required'),
  sessionId: z.string().optional(),
  classId: z.string().optional(),
  semester: z.string().optional(),
  credits: z.number().positive('Credits must be positive'),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
  metadata: z.object({
    attendanceRate: z.number().min(0).max(100).optional(),
    performanceScore: z.number().min(0).max(10).optional(),
    completionRate: z.number().min(0).max(100).optional()
  }).optional()
});

export const revokeCreditsSchema = z.object({
  reason: z.string().min(10, 'Revoke reason must be at least 10 characters')
});

export const getEligibleStudentsSchema = z.object({
  sessionId: z.string().optional(),
  classId: z.string().optional(),
  semester: z.string().optional(),
  minAttendance: z.number().min(0).max(100).default(80),
  minSessions: z.number().positive().default(5),
  minPerformance: z.number().min(0).max(10).optional()
});

// ===== DOCUMENT SHARING SCHEMAS =====

export const uploadDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  fileName: z.string().min(1, 'File name is required'),
  fileUrl: z.string().url('Invalid file URL'),
  fileSize: z.number().positive('File size must be positive'),
  fileType: z.string().min(1, 'File type is required'),
  category: z.enum(['academic', 'administrative', 'reference', 'other']),
  subject: z.string().optional(),
  tags: z.array(z.string()).default([]),
  isPublic: z.boolean().default(false),
  isEncrypted: z.boolean().default(false),
  accessLevel: z.enum(['public', 'private', 'restricted']).default('private'),
  metadata: z.object({
    author: z.string().optional(),
    version: z.string().optional(),
    language: z.string().optional(),
    pages: z.number().positive().optional()
  }).optional()
});

export const updateDocumentSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.enum(['academic', 'administrative', 'reference', 'other']).optional(),
  subject: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
  accessLevel: z.enum(['public', 'private', 'restricted']).optional(),
  metadata: z.object({
    author: z.string().optional(),
    version: z.string().optional(),
    language: z.string().optional(),
    pages: z.number().positive().optional()
  }).optional()
});

export const shareDocumentSchema = z.object({
  userIds: z.array(z.string()).min(1, 'At least one user ID is required'),
  message: z.string().optional(),
  expiresAt: z.string().datetime('Invalid expiration date format').optional(),
  accessLevel: z.enum(['read', 'write', 'delete']).default('read')
});

export const updateDocumentAccessSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  permission: z.enum(['read', 'write', 'delete', 'share']),
  expiresAt: z.string().datetime('Invalid expiration date format').optional()
});

// ===== COMMUNITY MANAGEMENT SCHEMAS =====

export const createCommunityForumSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(20, 'Content must be at least 20 characters'),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).default([])
});

export const updateCommunityForumSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(20).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  pinned: z.boolean().optional(),
  locked: z.boolean().optional()
});

export const shareCommunityResourceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.enum(['document', 'link', 'video', 'other']),
  url: z.string().url('Invalid URL').optional(),
  fileUrl: z.string().url('Invalid file URL').optional(),
  thumbnail: z.string().url('Invalid thumbnail URL').optional(),
  category: z.enum(['academic', 'administrative', 'reference', 'event', 'other']),
  subject: z.string().optional(),
  tags: z.array(z.string()).default([]),
  isPublic: z.boolean().default(false),
  isEncrypted: z.boolean().default(false),
  accessLevel: z.enum(['public', 'private', 'restricted']).default('private'),
  restrictedTo: z.array(z.string()).optional(),
  metadata: z.object({
    author: z.string().optional(),
    duration: z.number().positive().optional(),
    language: z.string().optional()
  }).optional()
});

export const restrictCommunityResourceSchema = z.object({
  restrictedTo: z.array(z.string()).min(1, 'At least one user ID or role is required'),
  accessLevel: z.enum(['public', 'private', 'restricted']).default('restricted')
});

export const createCommunityEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  type: z.enum(['webinar', 'workshop', 'meeting', 'seminar', 'other']),
  startTime: z.string().datetime('Invalid start time format'),
  endTime: z.string().datetime('Invalid end time format'),
  location: z.string().optional(),
  meetingLink: z.string().url('Invalid meeting link').optional(),
  isOnline: z.boolean().default(true),
  maxParticipants: z.number().positive().optional(),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).default([]),
  resources: z.array(z.string()).optional(),
  registrationRequired: z.boolean().default(false),
  registrationDeadline: z.string().datetime('Invalid registration deadline format').optional(),
  metadata: z.object({
    agenda: z.string().optional(),
    speakers: z.array(z.string()).optional(),
    recordingUrl: z.string().url().optional()
  }).optional()
});

// ===== ANALYTICS SCHEMAS =====

export const analyticsDateRangeSchema = z.object({
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  groupBy: z.enum(['day', 'week', 'month']).default('day')
});

// ===== COURSE CONTENT SCHEMAS =====

export const createCourseContentSchema = z.object({
  sessionId: z.string(),
  type: z.nativeEnum(CourseContentType),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  content: z.string().optional(), // For announcements
  fileUrl: z.string().url().optional(),
  fileName: z.string().optional(),
  fileSize: z.number().positive().optional(),
  url: z.string().url().optional() // For external links
});

export const updateCourseContentSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  fileUrl: z.string().url().optional(),
  fileName: z.string().optional(),
  fileSize: z.number().positive().optional(),
  url: z.string().url().optional()
});

// ===== QUIZ SCHEMAS =====

export const quizQuestionSchema = z.object({
  id: z.string(),
  question: z.string().min(1, 'Question is required'),
  type: z.enum(['multiple_choice', 'true_false', 'short_answer']),
  options: z.array(z.string()).optional(),
  correctAnswer: z.union([z.string(), z.number()]),
  points: z.number().positive()
});

export const createQuizSchema = z.object({
  sessionId: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  questions: z.array(quizQuestionSchema).min(1, 'At least one question is required'),
  duration: z.number().positive().optional(),
  dueDate: z.string().datetime().optional()
});

export const updateQuizSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  questions: z.array(quizQuestionSchema).optional(),
  duration: z.number().positive().optional(),
  dueDate: z.string().datetime().optional()
});

export const submitQuizSchema = z.object({
  quizId: z.string(),
  answers: z.array(z.object({
    questionId: z.string(),
    answer: z.union([z.string(), z.number()])
  }))
});

// ===== ASSIGNMENT SCHEMAS =====

export const createAssignmentSchema = z.object({
  sessionId: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  instructions: z.string().optional(),
  attachments: z.array(z.object({
    fileName: z.string(),
    fileUrl: z.string().url(),
    fileSize: z.number().positive()
  })).optional(),
  totalPoints: z.number().positive(),
  dueDate: z.string().datetime('Invalid due date format')
});

export const updateAssignmentSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(10).optional(),
  instructions: z.string().optional(),
  attachments: z.array(z.object({
    fileName: z.string(),
    fileUrl: z.string().url(),
    fileSize: z.number().positive()
  })).optional(),
  totalPoints: z.number().positive().optional(),
  dueDate: z.string().datetime().optional()
});

export const submitAssignmentSchema = z.object({
  assignmentId: z.string(),
  content: z.string().optional(),
  attachments: z.array(z.object({
    fileName: z.string(),
    fileUrl: z.string().url(),
    fileSize: z.number().positive()
  })).optional()
});

// ===== GRADING SCHEMAS =====

export const gradeSubmissionSchema = z.object({
  submissionId: z.string(),
  score: z.number().min(0),
  feedback: z.string().optional()
});

// ===== SESSION STUDENTS SCHEMAS =====

export const addStudentToSessionSchema = z.object({
  studentId: z.string()
});

// ===== TYPE EXPORTS =====

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
export type RescheduleSessionInput = z.infer<typeof rescheduleSessionSchema>;
export type CreateEvaluationInput = z.infer<typeof createEvaluationSchema>;
export type CreateProgressInput = z.infer<typeof createProgressSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type CreateLibraryResourceInput = z.infer<typeof createLibraryResourceSchema>;
export type CreateForumPostInput = z.infer<typeof createForumPostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type SearchTutorsInput = z.infer<typeof searchTutorsSchema>;
export type CreateCourseContentInput = z.infer<typeof createCourseContentSchema>;
export type UpdateCourseContentInput = z.infer<typeof updateCourseContentSchema>;
export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>;
export type SubmitQuizInput = z.infer<typeof submitQuizSchema>;
export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
export type UpdateAssignmentInput = z.infer<typeof updateAssignmentSchema>;
export type SubmitAssignmentInput = z.infer<typeof submitAssignmentSchema>;
export type GradeSubmissionInput = z.infer<typeof gradeSubmissionSchema>;
export type CreateClassInput = z.infer<typeof createClassSchema>;
export type UpdateClassInput = z.infer<typeof updateClassSchema>;
export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;
export type UpdateEnrollmentInput = z.infer<typeof updateEnrollmentSchema>;
export type CreateSessionRequestInput = z.infer<typeof createSessionRequestSchema>;
export type ApproveSessionRequestInput = z.infer<typeof approveSessionRequestSchema>;
export type RejectSessionRequestInput = z.infer<typeof rejectSessionRequestSchema>;

