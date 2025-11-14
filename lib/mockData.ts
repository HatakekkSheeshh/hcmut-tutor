import {
  User,
  Student,
  Tutor,
  Management,
  Session,
  Message,
  Notification,
  Evaluation,
  ProgressEntry,
  LibraryResource,
  ForumPost,
  ForumComment,
  Availability,
  ApprovalRequest,
  ApprovalRequestType,
  ApprovalRequestStatus,
  Class,
  Enrollment,
  CourseContent,
  CourseContentType,
  Quiz,
  QuizQuestion,
  QuizSubmission,
  Assignment,
  AssignmentSubmission,
  Grade,
  UserRole,
  SessionStatus,
  NotificationType,
  ClassStatus,
  EnrollmentStatus,
  SessionRequest,
  RequestType,
  RequestStatus,
  TrainingCredit,
  Document,
  CommunityResource,
  CommunityEvent,
  PermissionAudit,
  OptimizationPlan,
  ProgressReport,
  PerformanceAnalysis
} from './types.js';
import {
  generateId,
  generateHCMUTId,
  hashPassword,
  now,
  addDays,
  randomInt
} from './utils.js';

// ===== CONSTANTS =====

const SUBJECTS = [
  'Toán cao cấp',
  'Vật lý đại cương',
  'Hóa học',
  'Lập trình C/C++',
  'Lập trình Python',
  'Cấu trúc dữ liệu',
  'Giải tích',
  'Đại số tuyến tính',
  'Xác suất thống kê',
  'Tiếng Anh',
  'Cơ học kỹ thuật',
  'Điện tử',
  'Cơ sở dữ liệu',
  'Mạng máy tính',
  'Hệ điều hành'
];

const FIRST_NAMES = ['Văn', 'Thị', 'Hữu', 'Minh', 'Tuấn', 'Hoàng', 'Phương', 'Lan', 'Hương', 'Anh'];
const MIDDLE_NAMES = ['An', 'Bảo', 'Cường', 'Dũng', 'Giang', 'Hà', 'Khánh', 'Linh', 'Mai', 'Nam'];
const LAST_NAMES = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Phan', 'Vũ', 'Đặng', 'Bùi', 'Đỗ'];

const LIBRARY_TYPES: ('book' | 'article' | 'video' | 'document' | 'other')[] = ['book', 'article', 'video', 'document']; // ✅ Mutable array
const FORUM_CATEGORIES = ['Học tập', 'Chia sẻ kiến thức', 'Hỏi đáp', 'Thông báo', 'Khác'];

// ===== HELPER FUNCTIONS =====

const randomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const randomItems = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const generateName = (): string => {
  return `${randomItem(LAST_NAMES)} ${randomItem(MIDDLE_NAMES)} ${randomItem(FIRST_NAMES)}`;
};

const generateEmail = (name: string, role: UserRole): string => {
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .split(' ')
    .join('.');
  
  if (role === UserRole.STUDENT) {
    const year = randomInt(20, 23);
    const num = randomInt(10000, 99999);
    return `${year}${num}@hcmut.edu.vn`;
  }
  
  return `${slug}@hcmut.edu.vn`;
};

// ===== MOCK DATA GENERATORS =====

/**
 * Generate mock students
 */
export const generateStudents = async (count: number = 20): Promise<Student[]> => {
  const students: Student[] = [];
  const defaultPassword = await hashPassword('password123');

  for (let i = 0; i < count; i++) {
    const name = generateName();
    const student: Student = {
      id: generateId('stu'),
      email: generateEmail(name, UserRole.STUDENT),
      password: defaultPassword,
      name,
      hcmutId: generateHCMUTId(),
      role: UserRole.STUDENT,
      major: randomItem(['Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering']),
      year: randomInt(1, 4),
      interests: randomItems(SUBJECTS, randomInt(2, 5)),
      preferredSubjects: randomItems(SUBJECTS, randomInt(1, 3)),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      phone: `09${randomInt(10000000, 99999999)}`,
      createdAt: now(),
      updatedAt: now()
    };
    students.push(student);
  }

  return students;
};

/**
 * Generate mock tutors
 */
export const generateTutors = async (count: number = 15): Promise<Tutor[]> => {
  const tutors: Tutor[] = [];
  const defaultPassword = await hashPassword('password123');

  for (let i = 0; i < count; i++) {
    const name = generateName();
    const tutor: Tutor = {
      id: generateId('tut'),
      email: generateEmail(name, UserRole.TUTOR),
      password: defaultPassword,
      name,
      hcmutId: generateHCMUTId(),
      role: UserRole.TUTOR,
      subjects: randomItems(SUBJECTS, randomInt(2, 5)),
      bio: `Giảng viên có kinh nghiệm ${randomInt(2, 10)} năm trong lĩnh vực giảng dạy. Tận tâm và nhiệt huyết với công việc.`,
      rating: randomInt(35, 50) / 10,
      totalSessions: randomInt(20, 200),
      availability: [],
      verified: Math.random() > 0.3,
      credentials: [`Thạc sĩ ${randomItem(SUBJECTS)}`],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      phone: `09${randomInt(10000000, 99999999)}`,
      createdAt: now(),
      updatedAt: now()
    };
    tutors.push(tutor);
  }

  return tutors;
};

/**
 * Generate mock management users
 */
export const generateManagement = async (count: number = 5): Promise<Management[]> => {
  const management: Management[] = [];
  const defaultPassword = await hashPassword('admin123');

  for (let i = 0; i < count; i++) {
    const name = generateName();
    const mgmt: Management = {
      id: generateId('mgmt'),
      email: `admin.${i + 1}@hcmut.edu.vn`,
      password: defaultPassword,
      name,
      hcmutId: generateHCMUTId(),
      role: UserRole.MANAGEMENT,
      department: randomItem(['Academic Affairs', 'Student Services', 'IT Department', 'Administration']),
      permissions: ['view_analytics', 'manage_users', 'approve_requests', 'view_reports', 'award_credits', 'manage_community'],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      phone: `09${randomInt(10000000, 99999999)}`,
      createdAt: now(),
      updatedAt: now()
    };
    management.push(mgmt);
  }

  return management;
};

/**
 * Generate mock sessions
 */
export const generateSessions = (
  students: Student[],
  tutors: Tutor[],
  count: number = 50
): Session[] => {
  const sessions: Session[] = [];
  const statuses = [
    SessionStatus.PENDING,
    SessionStatus.CONFIRMED,
    SessionStatus.COMPLETED,
    SessionStatus.CANCELLED
  ];

  for (let i = 0; i < count; i++) {
    const student = randomItem(students);
    const tutor = randomItem(tutors);
    const subject = randomItem(tutor.subjects);
    const daysFromNow = randomInt(-30, 30);
    const startTime = addDays(new Date(), daysFromNow);
    startTime.setHours(randomInt(8, 18), 0, 0, 0);
    const duration = randomInt(1, 3) * 60;
    const endTime = new Date(startTime.getTime() + duration * 60000);

    const session: Session = {
      id: generateId('ses'),
      studentIds: [student.id], // ✅ Changed to array
      tutorId: tutor.id,
      subject,
      topic: `Ôn tập ${subject}`,
      description: `Buổi học về ${subject}`,
      status: randomItem(statuses),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration,
      isOnline: Math.random() > 0.3,
      meetingLink: Math.random() > 0.3 ? `https://meet.google.com/${generateId()}` : undefined,
      notes: '',
      createdAt: now(),
      updatedAt: now()
    };
    sessions.push(session);
  }

  return sessions;
};

/**
 * Generate mock evaluations
 */
export const generateEvaluations = (sessions: Session[]): Evaluation[] => {
  const evaluations: Evaluation[] = [];
  const completedSessions = sessions.filter(s => s.status === SessionStatus.COMPLETED);

  completedSessions.forEach(session => {
    if (Math.random() > 0.3) { // 70% of completed sessions have evaluations
      const evaluation: Evaluation = {
        id: generateId('eval'),
        sessionId: session.id,
        studentId: session.studentIds[0], // ✅ Get first student from array
        tutorId: session.tutorId,
        rating: randomInt(3, 5),
        comment: randomItem([
          'Buổi học rất bổ ích, giảng viên nhiệt tình!',
          'Giảng viên dạy dễ hiểu, tận tâm.',
          'Nội dung hay, cần thêm bài tập thực hành.',
          'Rất hài lòng với buổi học.',
          'Giảng viên giải thích rất chi tiết.'
        ]),
        aspects: {
          communication: randomInt(3, 5),
          knowledge: randomInt(4, 5),
          helpfulness: randomInt(3, 5),
          punctuality: randomInt(4, 5)
        },
        createdAt: now()
      };
      evaluations.push(evaluation);
    }
  });

  return evaluations;
};

/**
 * Generate mock progress entries
 */
export const generateProgressEntries = (
  students: Student[],
  tutors: Tutor[],
  sessions: Session[]
): ProgressEntry[] => {
  const entries: ProgressEntry[] = [];

  students.forEach(student => {
    const studentSessions = sessions.filter(
      s => s.studentIds?.includes(student.id) && s.status === SessionStatus.COMPLETED // ✅ Check array
    );

    studentSessions.forEach(session => {
      if (Math.random() > 0.5) {
        const entry: ProgressEntry = {
          id: generateId('prog'),
          studentId: student.id,
          tutorId: session.tutorId,
          sessionId: session.id,
          subject: session.subject,
          topic: session.topic || 'N/A',
          notes: `Học sinh đã nắm được kiến thức cơ bản về ${session.subject}`,
          score: randomInt(6, 10),
          improvements: ['Hiểu bài tốt hơn', 'Làm bài tập nhanh hơn'],
          challenges: ['Cần thêm thời gian luyện tập', 'Một số khái niệm còn khó'],
          nextSteps: ['Tiếp tục luyện bài tập', 'Học thêm về phần nâng cao'],
          createdAt: now()
        };
        entries.push(entry);
      }
    });
  });

  return entries;
};

/**
 * Generate mock library resources
 */
export const generateLibraryResources = (count: number = 30): LibraryResource[] => {
  const resources: LibraryResource[] = [];

  for (let i = 0; i < count; i++) {
    const subject = randomItem(SUBJECTS);
    const resource: LibraryResource = {
      id: generateId('lib'),
      title: `Tài liệu ${subject} - Phần ${i + 1}`,
      type: randomItem(LIBRARY_TYPES),
      subject,
      description: `Tài liệu học tập về ${subject} dành cho sinh viên`,
      author: generateName(),
      url: `https://library.hcmut.edu.vn/resource/${generateId()}`,
      thumbnail: `https://picsum.photos/seed/${i}/300/400`,
      tags: [subject, 'học tập', 'tài liệu'],
      downloads: randomInt(10, 500),
      views: randomInt(50, 1000),
      createdAt: now(),
      updatedAt: now()
    };
    resources.push(resource);
  }

  return resources;
};

/**
 * Generate mock forum posts with various statuses
 */
export const generateForumPosts = (users: User[], count: number = 30): ForumPost[] => {
  const posts: ForumPost[] = [];
  const managementUsers = users.filter(u => u.role === 'management');
  const statuses: ('pending' | 'approved' | 'rejected')[] = ['pending', 'approved', 'rejected'];
  const statusWeights = [0.3, 0.6, 0.1]; // 30% pending, 60% approved, 10% rejected
  
  const forumCategories = [
    'Programming',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Study Groups',
    'Career',
    'General Discussion',
    'Questions & Answers',
    'Resources'
  ];

  const postTitles = [
    'Best practices for learning React.js',
    'Mathematics problem solving techniques',
    'Study group for Physics students',
    'Career advice for Computer Science graduates',
    'How to prepare for technical interviews',
    'Effective study methods for calculus',
    'Resources for learning Python',
    'Tips for time management during exams',
    'Understanding data structures and algorithms',
    'How to improve programming skills',
    'Study schedule recommendations',
    'Collaborative learning strategies',
    'Job market trends in tech',
    'Academic writing tips',
    'How to stay motivated while studying',
    'Mastering organic chemistry',
    'Biology study techniques that work',
    'Forming effective study groups',
    'Career planning for students',
    'Academic life discussion',
    'Q&A: Getting help with homework',
    'Useful learning resources',
    'Note-taking strategies',
    'Exam preparation guide',
    'Balancing work and studies'
  ];

  const postContents = [
    'I\'ve been teaching React for 3 years and here are some tips that have helped my students succeed. First, start with the basics and build a strong foundation. Understanding components, props, and state is crucial before moving to advanced topics like hooks and context.',
    'When approaching complex mathematical problems, it\'s important to break them down into smaller, manageable parts. This technique has helped many students improve their problem-solving skills significantly.',
    'Looking for fellow physics students to form a study group. We meet twice a week to discuss concepts and solve problems together. Anyone interested in joining?',
    'As someone who has mentored many CS graduates, here\'s my advice on navigating the job market and building a successful career in technology. Focus on building a strong portfolio and networking.',
    'Technical interviews can be challenging, but with proper preparation, you can excel. Here are some strategies that have worked for me and my students: practice coding problems daily, understand data structures deeply, and prepare for behavioral questions.',
    'Calculus can be intimidating, but with the right approach, it becomes manageable. Let me share some effective study methods that have helped my students achieve better grades.',
    'Python is a great language for beginners. Here are some excellent resources to get started and advance your skills: official documentation, interactive tutorials, and practice projects.',
    'Time management is crucial during exam periods. Here are some proven strategies to help you stay organized and reduce stress: create a study schedule, take regular breaks, and prioritize difficult topics.',
    'Data structures and algorithms form the foundation of computer science. Understanding them deeply will help you in interviews and real-world problems. Start with arrays and linked lists, then move to trees and graphs.',
    'Improving programming skills requires consistent practice. Here are some exercises and projects that can help you grow: build small applications, contribute to open source, and solve coding challenges regularly.',
    'Chemistry can be challenging, but understanding the periodic table and basic reactions is key. Here are some tips for mastering organic chemistry.',
    'Biology requires memorization and understanding of concepts. Creating mind maps and using flashcards can be very effective study techniques.',
    'Study groups are great for collaborative learning. We discuss difficult topics, share notes, and help each other understand complex concepts.',
    'Career planning is important for students. Research different career paths, network with professionals, and gain relevant experience through internships.',
    'General discussion about academic life, balancing studies with personal life, and maintaining mental health during stressful periods.',
    'Questions and answers section for students to ask about specific topics, get help with homework, and clarify doubts.',
    'Sharing useful resources like online courses, textbooks, study materials, and tools that can help in learning.',
    'Tips for effective note-taking, active reading strategies, and improving memory retention for better academic performance.',
    'Discussion about exam preparation strategies, dealing with test anxiety, and techniques for answering different types of exam questions.',
    'Sharing experiences about internships, part-time jobs, and how to balance work with studies effectively.'
  ];

  for (let i = 0; i < count; i++) {
    const author = randomItem(users);
    const status = weightedRandom(statuses, statusWeights);
    const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const updatedAt = new Date(createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);
    
    const post: ForumPost = {
      id: generateId('post'),
      authorId: author.id,
      title: randomItem(postTitles),
      content: randomItem(postContents),
      category: randomItem(forumCategories),
      tags: randomItems(SUBJECTS, randomInt(1, 4)),
      likes: status === 'approved' ? randomItems(users.map(u => u.id), randomInt(0, 15)) : [],
      views: status === 'approved' ? randomInt(10, 300) : randomInt(0, 5),
      pinned: status === 'approved' && Math.random() > 0.9,
      locked: false,
      status: status,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString()
    };

    // Add moderation info for approved/rejected posts
    if (status !== 'pending' && managementUsers.length > 0) {
      const moderator = randomItem(managementUsers);
      post.moderatedBy = moderator.id;
      post.moderatedAt = new Date(createdAt.getTime() + Math.random() * 2 * 24 * 60 * 60 * 1000).toISOString();
      post.moderationNotes = status === 'approved' 
        ? 'Content approved. Good quality post.'
        : 'Content does not meet community guidelines.';
    }

    posts.push(post);
  }

  return posts;
};

// Helper function for weighted random selection
function weightedRandom<T>(items: T[], weights: number[]): T {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return items[i];
    }
  }
  
  return items[items.length - 1];
}

/**
 * Generate mock forum comments
 */
export const generateForumComments = (
  posts: ForumPost[],
  users: User[],
  count: number = 50
): ForumComment[] => {
  const comments: ForumComment[] = [];

  posts.forEach(post => {
    const commentCount = randomInt(1, 5);
    for (let i = 0; i < commentCount; i++) {
      const author = randomItem(users);
      const comment: ForumComment = {
        id: generateId('cmt'),
        postId: post.id,
        authorId: author.id,
        content: randomItem([
          'Bạn có thể tham khảo tài liệu này để học tốt hơn.',
          'Mình cũng gặp vấn đề tương tự, đã giải quyết bằng cách...',
          'Cảm ơn bạn đã chia sẻ!',
          'Bạn nên liên hệ với giảng viên để được hỗ trợ thêm.'
        ]),
        likes: randomItems(users.map(u => u.id), randomInt(0, 5)),
        createdAt: now(),
        updatedAt: now()
      };
      comments.push(comment);
    }
  });

  return comments;
};

/**
 * Generate mock notifications
 */
export const generateNotifications = (
  users: User[],
  sessions: Session[]
): Notification[] => {
  const notifications: Notification[] = [];

  users.forEach(user => {
    const userSessions = sessions.filter(
      s => s.studentIds?.includes(user.id) || s.tutorId === user.id // ✅ Check array
    );

    userSessions.forEach(session => {
      if (Math.random() > 0.5) {
        const notification: Notification = {
          id: generateId('notif'),
          userId: user.id,
          type: randomItem([
            NotificationType.SESSION_BOOKING,
            NotificationType.SESSION_REMINDER,
            NotificationType.SESSION_CANCELLED
          ]),
          title: 'Thông báo về buổi học',
          message: `Bạn có buổi học ${session.subject} vào ${new Date(session.startTime).toLocaleString('vi-VN')}`,
          read: Math.random() > 0.5,
          link: `/sessions/${session.id}`,
          createdAt: now()
        };
        notifications.push(notification);
      }
    });
  });

  return notifications;
};

/**
 * Generate mock availability
 */
export const generateAvailability = (tutors: Tutor[]): Availability[] => {
  const availabilities: Availability[] = [];
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  tutors.forEach(tutor => {
    const selectedDays = randomItems(days, randomInt(3, 6));
    const availability: Availability = {
      id: generateId('avail'),
      tutorId: tutor.id,
      timeSlots: selectedDays.map(day => ({
        day,
        startTime: `${randomInt(8, 12).toString().padStart(2, '0')}:00`,
        endTime: `${randomInt(16, 20).toString().padStart(2, '0')}:00`
      })),
      createdAt: now(),
      updatedAt: now()
    };
    availabilities.push(availability);
  });

  return availabilities;
};

/**
 * Generate mock approval requests
 */
export const generateApprovalRequests = (
  tutors: Tutor[], 
  management: Management[], 
  sessions: Session[],
  forumPosts?: ForumPost[],
  forumComments?: ForumComment[]
): ApprovalRequest[] => {
  const requests: ApprovalRequest[] = [];
  const statuses = [
    ApprovalRequestStatus.PENDING,
    ApprovalRequestStatus.APPROVED,
    ApprovalRequestStatus.REJECTED,
    ApprovalRequestStatus.CLARIFICATION_REQUESTED
  ];
  const priorities: ('low' | 'medium' | 'high' | 'urgent')[] = ['low', 'medium', 'high', 'urgent'];

  // Tutor verification requests
  tutors.forEach(tutor => {
    if (!tutor.verified && Math.random() > 0.5) {
      const createdAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      const deadline = new Date(createdAt.getTime() + 48 * 60 * 60 * 1000);
      const request: ApprovalRequest = {
        id: generateId('req'),
        type: ApprovalRequestType.TUTOR_VERIFICATION,
        requesterId: tutor.id,
        targetId: tutor.id,
        title: 'Yêu cầu xác thực Tutor',
        description: `Tutor ${tutor.name} yêu cầu xác thực tài khoản với các credentials: ${tutor.credentials?.join(', ') || 'N/A'}`,
        status: randomItem(statuses),
        priority: randomItem(priorities),
        deadline: deadline.toISOString(),
        reviewerId: Math.random() > 0.5 ? randomItem(management).id : undefined,
        reviewNotes: Math.random() > 0.5 ? 'Đã xem xét và phê duyệt' : undefined,
        createdAt: createdAt.toISOString(),
        updatedAt: now()
      };
      requests.push(request);
    }
  });

  // Session change requests
  sessions.filter(s => s.status === SessionStatus.CONFIRMED).slice(0, 5).forEach(session => {
    if (Math.random() > 0.7) {
      const createdAt = new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000);
      const deadline = new Date(createdAt.getTime() + 48 * 60 * 60 * 1000);
      const request: ApprovalRequest = {
        id: generateId('req'),
        type: ApprovalRequestType.SESSION_CHANGE,
        requesterId: session.studentIds?.[0] || '',
        targetId: session.id,
        title: `Yêu cầu thay đổi session ${session.subject}`,
        description: `Yêu cầu thay đổi lịch học cho session ${session.subject} vào ${new Date(session.startTime).toLocaleDateString('vi-VN')}`,
        status: randomItem(statuses),
        priority: randomItem(priorities),
        deadline: deadline.toISOString(),
        reviewerId: Math.random() > 0.5 ? randomItem(management).id : undefined,
        createdAt: createdAt.toISOString(),
        updatedAt: now()
      };
      requests.push(request);
    }
  });

  // Resource allocation requests
  if (sessions.length > 0 && tutors.length > 0) {
    const numResourceRequests = Math.floor(Math.random() * 3) + 1; // 1-3 requests
    for (let i = 0; i < numResourceRequests; i++) {
      const createdAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      const deadline = new Date(createdAt.getTime() + 48 * 60 * 60 * 1000);
      
      // Get some sessions and tutors for resource allocation
      const selectedSessions = sessions.filter(s => s.status === SessionStatus.CONFIRMED).slice(0, 3);
      const selectedTutors = tutors.slice(0, 2);
      
      if (selectedSessions.length > 0 && selectedTutors.length > 0) {
        const changes: Array<{
          type: 'reassign_tutor' | 'adjust_group_size' | 'reallocate_room' | 'adjust_schedule';
          resourceId: string;
          fromValue?: any;
          toValue?: any;
          reason?: string;
        }> = [];
        
        // Add reassign tutor change
        if (selectedSessions.length > 0 && selectedTutors.length >= 2) {
          changes.push({
            type: 'reassign_tutor',
            resourceId: selectedSessions[0].id,
            fromValue: selectedSessions[0].tutorId,
            toValue: selectedTutors[1].id,
            reason: 'Cân bằng workload giữa các tutors'
          });
        }
        
        // Add adjust group size change
        if (selectedSessions.length > 1) {
          const session = selectedSessions[1];
          if (session.studentIds && session.studentIds.length > 0) {
            changes.push({
              type: 'adjust_group_size',
              resourceId: session.id,
              fromValue: session.studentIds,
              toValue: session.studentIds.slice(0, Math.max(1, session.studentIds.length - 1)),
              reason: 'Giảm kích thước nhóm để tăng chất lượng học tập'
            });
          }
        }
        
        if (changes.length > 0) {
          const affectedTutorIds = Array.from(new Set(changes.map((c: any) => [c.fromValue, c.toValue]).flat().filter(Boolean)));
          const affectedSessionIds = changes.map((c: any) => c.resourceId);
          const affectedStudentIds = Array.from(new Set(
            selectedSessions.flatMap(s => s.studentIds || [])
          ));
          
          const request: ApprovalRequest = {
            id: generateId('approval'),
            type: ApprovalRequestType.RESOURCE_ALLOCATION,
            requesterId: randomItem(management).id,
            targetId: selectedSessions[0].id,
            title: 'Yêu cầu phân bổ lại tài nguyên',
            description: `Yêu cầu phân bổ lại tài nguyên để tối ưu hóa hiệu quả hoạt động. Bao gồm ${changes.length} thay đổi.`,
            status: randomItem(statuses),
            priority: randomItem(priorities),
            deadline: deadline.toISOString(),
            resourceAllocationData: {
              changes: changes,
              affectedTutorIds: affectedTutorIds,
              affectedSessionIds: affectedSessionIds,
              affectedStudentIds: affectedStudentIds
            },
            reviewerId: Math.random() > 0.5 ? randomItem(management).id : undefined,
            createdAt: createdAt.toISOString(),
            updatedAt: now()
          };
          requests.push(request);
        }
      }
    }
  }

  // Content moderation requests
  if (forumPosts && forumComments) {
    const numContentRequests = Math.floor(Math.random() * 3) + 1; // 1-3 requests
    for (let i = 0; i < numContentRequests; i++) {
      const createdAt = new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000);
      const deadline = new Date(createdAt.getTime() + 48 * 60 * 60 * 1000);
      
      const violationTypes: Array<'spam' | 'inappropriate' | 'harassment' | 'false_information' | 'other'> = 
        ['spam', 'inappropriate', 'harassment', 'false_information', 'other'];
      const severities: Array<'low' | 'medium' | 'high' | 'critical'> = 
        ['low', 'medium', 'high', 'critical'];
      const contentTypes: Array<'post' | 'comment'> = ['post', 'comment'];
      
      const violationType = randomItem(violationTypes);
      const severity = randomItem(severities);
      const contentType = randomItem(contentTypes);
      
      // Get actual content from forum posts or comments
      let content: ForumPost | ForumComment | null = null;
      let contentId = '';
      
      if (contentType === 'post' && forumPosts.length > 0) {
        content = randomItem(forumPosts);
        contentId = content.id;
      } else if (contentType === 'comment' && forumComments.length > 0) {
        content = randomItem(forumComments);
        contentId = content.id;
      }
      
      if (content && contentId) {
        const contentPreview = contentType === 'post' 
          ? (content as ForumPost).content.substring(0, 200) + ((content as ForumPost).content.length > 200 ? '...' : '')
          : (content as ForumComment).content.substring(0, 200) + ((content as ForumComment).content.length > 200 ? '...' : '');
        
        const request: ApprovalRequest = {
          id: generateId('approval'),
          type: ApprovalRequestType.CONTENT_MODERATION,
          requesterId: randomItem(tutors).id, // Tutor or student reports content
          targetId: contentId,
          title: `Yêu cầu kiểm duyệt ${contentType === 'post' ? 'bài viết' : 'bình luận'}`,
          description: `Yêu cầu kiểm duyệt ${contentType === 'post' ? 'bài viết' : 'bình luận'} do vi phạm: ${violationType}. Mức độ: ${severity}.`,
          status: randomItem(statuses),
          priority: severity === 'critical' || severity === 'high' ? 'high' : randomItem(priorities),
          deadline: deadline.toISOString(),
          contentModerationData: {
            contentType: contentType,
            contentId: contentId,
            contentPreview: contentPreview,
            reportedBy: [randomItem(tutors).id], // Can have multiple reporters
            reportReasons: [`Vi phạm: ${violationType}`, 'Nội dung không phù hợp với cộng đồng'],
            violationType: violationType,
            severity: severity
          },
          reviewerId: Math.random() > 0.5 ? randomItem(management).id : undefined,
          createdAt: createdAt.toISOString(),
          updatedAt: now()
        };
        requests.push(request);
      }
    }
  }

  return requests;
};

/**
 * Generate mock classes
 */
export const generateClasses = (tutors: Tutor[], availability: Availability[]): Class[] => {
  const classes: Class[] = [];
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  tutors.forEach((tutor, index) => {
    const tutorAvailability = availability.find(a => a.tutorId === tutor.id);
    if (!tutorAvailability || tutorAvailability.timeSlots.length === 0) return;

    // Create 2-3 classes per tutor
    const numClasses = randomInt(2, 4);
    const tutorSubjects = [...tutor.subjects];

    for (let i = 0; i < Math.min(numClasses, tutorSubjects.length); i++) {
      const timeSlot = randomItem(tutorAvailability.timeSlots);
      const subject = tutorSubjects[i];
      
      // Parse time
      const [startHour] = timeSlot.startTime.split(':').map(Number);
      const duration = randomItem([60, 90, 120]); // 1h, 1.5h, 2h
      const endHour = startHour + Math.floor(duration / 60);
      const endMinute = duration % 60;

      // Create class
      // Count classes for this tutor to generate per-tutor code
      const tutorClassCount = classes.filter(c => c.tutorId === tutor.id).length;
      const classItem: Class = {
        id: generateId('class'),
        code: `C${String(tutorClassCount + 1).padStart(2, '0')}`,
        tutorId: tutor.id,
        subject: subject,
        description: `Lớp học ${subject} - Học theo lộ trình chuyên sâu với giảng viên giàu kinh nghiệm`,
        day: timeSlot.day,
        startTime: timeSlot.startTime,
        endTime: `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`,
        duration: duration,
        maxStudents: randomInt(15, 30),
        currentEnrollment: 0, // Will be updated by enrollments
        status: ClassStatus.ACTIVE,
        semesterStart: addDays(new Date(), randomInt(-30, 0)).toISOString(), // ✅ Convert to ISO string
        semesterEnd: addDays(new Date(), randomInt(60, 120)).toISOString(), // ✅ Convert to ISO string
        isOnline: Math.random() > 0.3,
        location: Math.random() > 0.5 ? `Phòng ${randomInt(101, 599)}` : undefined,
        createdAt: addDays(new Date(), randomInt(-60, -30)).toISOString(), // ✅ Convert to ISO string
        updatedAt: now()
      };

      classes.push(classItem);
    }
  });

  return classes;
};

/**
 * Generate mock enrollments
 */
export const generateEnrollments = (students: Student[], classes: Class[]): Enrollment[] => {
  const enrollments: Enrollment[] = [];

  students.forEach(student => {
    // Each student enrolls in 1-3 classes
    const numEnrollments = randomInt(1, 4);
    const availableClasses = [...classes];

    for (let i = 0; i < numEnrollments && availableClasses.length > 0; i++) {
      // Pick a random class that student is interested in or random
      let selectedClass = availableClasses.find(c => 
        student.preferredSubjects?.includes(c.subject)
      );

      if (!selectedClass) {
        selectedClass = randomItem(availableClasses);
      }

      // Remove from available to avoid duplicates
      const classIndex = availableClasses.indexOf(selectedClass);
      availableClasses.splice(classIndex, 1);

      // Check if class has space
      if (selectedClass.currentEnrollment >= selectedClass.maxStudents) continue;

      // Create enrollment
      const enrollment: Enrollment = {
        id: generateId('enroll'),
        studentId: student.id,
        classId: selectedClass.id,
        status: EnrollmentStatus.ACTIVE,
        enrolledAt: addDays(new Date(), randomInt(-25, -5)).toISOString(), // ✅ Convert to ISO string
      };

      enrollments.push(enrollment);

      // Update class enrollment count
      selectedClass.currentEnrollment++;
      if (selectedClass.currentEnrollment >= selectedClass.maxStudents) {
        selectedClass.status = ClassStatus.FULL;
      }
    }
  });

  return enrollments;
};

/**
 * Generate course contents for sessions and classes
 */
const generateCourseContents = (sessions: Session[], classes: Class[], tutors: User[]) => {
  const contents: CourseContent[] = [];
  const contentTypes: CourseContentType[] = [
    CourseContentType.ANNOUNCEMENT,
    CourseContentType.MATERIAL,
    CourseContentType.LINK
  ];

  // Generate for sessions (30% of sessions get content)
  sessions.forEach(session => {
    if (Math.random() < 0.3) {
      const numContents = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numContents; i++) {
        contents.push({
          id: generateId('content'),
          sessionId: session.id,
          type: contentTypes[Math.floor(Math.random() * contentTypes.length)],
          title: `${session.subject} - Tài liệu buổi ${i + 1}`,
          description: `Tài liệu học tập cho buổi học ${session.subject}`,
          content: `Nội dung chi tiết về ${session.topic}`,
          fileUrl: Math.random() > 0.5 ? `https://example.com/files/${session.id}_${i}.pdf` : undefined,
          fileName: Math.random() > 0.5 ? `lecture_${i + 1}.pdf` : undefined,
          fileSize: Math.random() > 0.5 ? Math.floor(Math.random() * 5000000) + 100000 : undefined,
          url: Math.random() > 0.5 ? `https://youtube.com/watch?v=${generateId('vid')}` : undefined,
          createdBy: session.tutorId,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }
  });

  // Generate for classes (50% of classes get content)
  classes.forEach(classItem => {
    if (Math.random() < 0.5) {
      const numContents = Math.floor(Math.random() * 4) + 1;
      for (let i = 0; i < numContents; i++) {
        contents.push({
          id: generateId('content'),
          classId: classItem.id,
          type: contentTypes[Math.floor(Math.random() * contentTypes.length)],
          title: `${classItem.subject} - Tài liệu tuần ${i + 1}`,
          description: `Tài liệu học tập cho lớp ${classItem.code}`,
          content: `Nội dung chi tiết về ${classItem.subject}`,
          fileUrl: Math.random() > 0.5 ? `https://example.com/files/${classItem.id}_${i}.pdf` : undefined,
          fileName: Math.random() > 0.5 ? `week_${i + 1}_material.pdf` : undefined,
          fileSize: Math.random() > 0.5 ? Math.floor(Math.random() * 5000000) + 100000 : undefined,
          url: Math.random() > 0.5 ? `https://youtube.com/watch?v=${generateId('vid')}` : undefined,
          createdBy: classItem.tutorId,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }
  });

  return contents;
};

/**
 * Generate quizzes for sessions and classes
 */
const generateQuizzes = (sessions: Session[], classes: Class[]) => {
  const quizzes: Quiz[] = [];

  // Generate for sessions (20% of sessions get a quiz)
  sessions.forEach(session => {
    if (Math.random() < 0.2) {
      const numQuestions = Math.floor(Math.random() * 5) + 3;
      const questions: QuizQuestion[] = [];
      
      for (let i = 0; i < numQuestions; i++) {
        const questionType = ['multiple_choice', 'true_false', 'short_answer'][Math.floor(Math.random() * 3)];
        questions.push({
          id: `q${i + 1}`,
          question: `Câu hỏi ${i + 1} về ${session.subject}`,
          type: questionType as any,
          options: questionType === 'multiple_choice' ? ['A', 'B', 'C', 'D'] : (questionType === 'true_false' ? ['True', 'False'] : undefined),
          correctAnswer: questionType === 'multiple_choice' ? Math.floor(Math.random() * 4) : (questionType === 'true_false' ? Math.floor(Math.random() * 2) : 'Đáp án mẫu'),
          points: Math.floor(Math.random() * 15) + 5
        });
      }

      quizzes.push({
        id: generateId('quiz'),
        sessionId: session.id,
        title: `Kiểm tra ${session.subject}`,
        description: `Bài kiểm tra cho buổi học ${session.topic}`,
        questions,
        totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
        duration: Math.floor(Math.random() * 45) + 15,
        dueDate: new Date(new Date(session.startTime).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: session.tutorId,
        createdAt: new Date(session.createdAt).toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  });

  // Generate for classes (40% of classes get quizzes)
  classes.forEach(classItem => {
    if (Math.random() < 0.4) {
      const numQuizzes = Math.floor(Math.random() * 3) + 1;
      for (let q = 0; q < numQuizzes; q++) {
        const numQuestions = Math.floor(Math.random() * 6) + 4;
        const questions: QuizQuestion[] = [];
        
        for (let i = 0; i < numQuestions; i++) {
          const questionType = ['multiple_choice', 'true_false', 'short_answer'][Math.floor(Math.random() * 3)];
          questions.push({
            id: `q${i + 1}`,
            question: `Câu hỏi ${i + 1} về ${classItem.subject}`,
            type: questionType as any,
            options: questionType === 'multiple_choice' ? ['A', 'B', 'C', 'D'] : (questionType === 'true_false' ? ['True', 'False'] : undefined),
            correctAnswer: questionType === 'multiple_choice' ? Math.floor(Math.random() * 4) : (questionType === 'true_false' ? Math.floor(Math.random() * 2) : 'Đáp án mẫu'),
            points: Math.floor(Math.random() * 15) + 5
          });
        }

        quizzes.push({
          id: generateId('quiz'),
          classId: classItem.id,
          title: `Kiểm tra tuần ${q + 1} - ${classItem.subject}`,
          description: `Bài kiểm tra cho lớp ${classItem.code}`,
          questions,
          totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
          duration: Math.floor(Math.random() * 60) + 30,
          dueDate: new Date(new Date(classItem.semesterStart).getTime() + (q + 2) * 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdBy: classItem.tutorId,
          createdAt: new Date(classItem.createdAt).toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }
  });

  return quizzes;
};

/**
 * Generate assignments for sessions and classes
 */
const generateAssignments = (sessions: Session[], classes: Class[]) => {
  const assignments: Assignment[] = [];

  // Generate for sessions (25% of sessions get an assignment)
  sessions.forEach(session => {
    if (Math.random() < 0.25) {
      assignments.push({
        id: generateId('assign'),
        sessionId: session.id,
        title: `Bài tập ${session.subject}`,
        description: `Bài tập thực hành về ${session.topic}`,
        instructions: `Yêu cầu: Hoàn thành các bài tập liên quan đến ${session.subject}`,
        attachments: Math.random() > 0.5 ? [{
          fileName: 'assignment.pdf',
          fileUrl: `https://example.com/assignments/${session.id}.pdf`,
          fileSize: Math.floor(Math.random() * 1000000) + 100000
        }] : undefined,
        totalPoints: Math.floor(Math.random() * 80) + 20,
        dueDate: new Date(new Date(session.endTime).getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: session.tutorId,
        createdAt: new Date(session.createdAt).toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  });

  // Generate for classes (50% of classes get assignments)
  classes.forEach(classItem => {
    if (Math.random() < 0.5) {
      const numAssignments = Math.floor(Math.random() * 4) + 1;
      for (let a = 0; a < numAssignments; a++) {
        assignments.push({
          id: generateId('assign'),
          classId: classItem.id,
          title: `Bài tập ${a + 1}: ${classItem.subject}`,
          description: `Bài tập thực hành cho lớp ${classItem.code}`,
          instructions: `Yêu cầu: Hoàn thành các bài tập được giao trong tuần ${a + 1}`,
          attachments: Math.random() > 0.5 ? [{
            fileName: `assignment_week_${a + 1}.pdf`,
            fileUrl: `https://example.com/assignments/${classItem.id}_${a}.pdf`,
            fileSize: Math.floor(Math.random() * 1000000) + 100000
          }] : undefined,
          totalPoints: Math.floor(Math.random() * 80) + 20,
          dueDate: new Date(new Date(classItem.semesterStart).getTime() + (a + 2) * 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdBy: classItem.tutorId,
          createdAt: new Date(classItem.createdAt).toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }
  });

  return assignments;
};

/**
 * Generate grades for students in sessions and classes
 */
const generateGrades = (sessions: Session[], classes: Class[], quizzes: Quiz[], assignments: Assignment[], students: User[], enrollments: Enrollment[]) => {
  const grades: Grade[] = [];

  // Generate grades for session quizzes
  quizzes.filter(q => q.sessionId).forEach(quiz => {
    const session = sessions.find(s => s.id === quiz.sessionId);
    if (session) {
      session.studentIds?.forEach(studentId => {
        if (Math.random() < 0.7) { // 70% chance student has submitted
          const score = Math.floor(Math.random() * quiz.totalPoints * 0.6) + quiz.totalPoints * 0.3;
          grades.push({
            id: generateId('grade'),
            sessionId: session.id,
            studentId,
            itemType: 'quiz',
            itemId: quiz.id,
            itemTitle: quiz.title,
            score,
            maxScore: quiz.totalPoints,
            percentage: (score / quiz.totalPoints) * 100,
            feedback: Math.random() > 0.5 ? 'Làm tốt! Tiếp tục phát huy.' : undefined,
            gradedBy: session.tutorId,
            gradedAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString()
          });
        }
      });
    }
  });

  // Generate grades for session assignments
  assignments.filter(a => a.sessionId).forEach(assignment => {
    const session = sessions.find(s => s.id === assignment.sessionId);
    if (session) {
      session.studentIds?.forEach(studentId => {
        if (Math.random() < 0.6) { // 60% chance student has submitted
          const score = Math.floor(Math.random() * assignment.totalPoints * 0.7) + assignment.totalPoints * 0.2;
          grades.push({
            id: generateId('grade'),
            sessionId: session.id,
            studentId,
            itemType: 'assignment',
            itemId: assignment.id,
            itemTitle: assignment.title,
            score,
            maxScore: assignment.totalPoints,
            percentage: (score / assignment.totalPoints) * 100,
            feedback: Math.random() > 0.5 ? 'Bài làm tốt, cần chú ý thêm về...' : undefined,
            gradedBy: session.tutorId,
            gradedAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString()
          });
        }
      });
    }
  });

  // Generate grades for class quizzes
  quizzes.filter(q => q.classId).forEach(quiz => {
    const classItem = classes.find(c => c.id === quiz.classId);
    if (classItem) {
      // Get enrolled students for this class
      const classEnrollments = enrollments.filter(e => e.classId === quiz.classId && e.status === 'active');
      classEnrollments.forEach(enrollment => {
        if (Math.random() < 0.7) { // 70% chance student has submitted
          const score = Math.floor(Math.random() * quiz.totalPoints * 0.6) + quiz.totalPoints * 0.3;
          grades.push({
            id: generateId('grade'),
            classId: classItem.id,
            studentId: enrollment.studentId,
            itemType: 'quiz',
            itemId: quiz.id,
            itemTitle: quiz.title,
            score,
            maxScore: quiz.totalPoints,
            percentage: (score / quiz.totalPoints) * 100,
            feedback: Math.random() > 0.5 ? 'Làm tốt! Tiếp tục phát huy.' : undefined,
            gradedBy: classItem.tutorId,
            gradedAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString()
          });
        }
      });
    }
  });

  // Generate grades for class assignments
  assignments.filter(a => a.classId).forEach(assignment => {
    const classItem = classes.find(c => c.id === assignment.classId);
    if (classItem) {
      // Get enrolled students for this class
      const classEnrollments = enrollments.filter(e => e.classId === assignment.classId && e.status === 'active');
      classEnrollments.forEach(enrollment => {
        if (Math.random() < 0.6) { // 60% chance student has submitted
          const score = Math.floor(Math.random() * assignment.totalPoints * 0.7) + assignment.totalPoints * 0.2;
          grades.push({
            id: generateId('grade'),
            classId: classItem.id,
            studentId: enrollment.studentId,
            itemType: 'assignment',
            itemId: assignment.id,
            itemTitle: assignment.title,
            score,
            maxScore: assignment.totalPoints,
            percentage: (score / assignment.totalPoints) * 100,
            feedback: Math.random() > 0.5 ? 'Bài làm tốt, cần chú ý thêm về...' : undefined,
            gradedBy: classItem.tutorId,
            gradedAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString()
          });
        }
      });
    }
  });

  return grades;
};

/**
 * Generate quiz submissions
 */
const generateQuizSubmissions = (quizzes: Quiz[], sessions: Session[], enrollments: Enrollment[]) => {
  const submissions: QuizSubmission[] = [];

  quizzes.forEach(quiz => {
    if (quiz.sessionId) {
      const session = sessions.find(s => s.id === quiz.sessionId);
      if (session) {
        session.studentIds?.forEach(studentId => {
          if (Math.random() < 0.7) {
            submissions.push({
              id: generateId('quizsub'),
              quizId: quiz.id,
              studentId,
              answers: quiz.questions.map(q => ({
                questionId: q.id,
                answer: Math.random() > 0.3 ? q.correctAnswer : 'Wrong answer'
              })),
              score: Math.floor(Math.random() * quiz.totalPoints * 0.6) + quiz.totalPoints * 0.3,
              gradedBy: session.tutorId,
              submittedAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
              gradedAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString()
            });
          }
        });
      }
    } else if (quiz.classId) {
      const classEnrollments = enrollments.filter(e => e.classId === quiz.classId && e.status === 'active');
      classEnrollments.forEach(enrollment => {
        if (Math.random() < 0.7) {
          submissions.push({
            id: generateId('quizsub'),
            quizId: quiz.id,
            studentId: enrollment.studentId,
            answers: quiz.questions.map(q => ({
              questionId: q.id,
              answer: Math.random() > 0.3 ? q.correctAnswer : 'Wrong answer'
            })),
            score: Math.floor(Math.random() * quiz.totalPoints * 0.6) + quiz.totalPoints * 0.3,
            submittedAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
            gradedAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString()
          });
        }
      });
    }
  });

  return submissions;
};

/**
 * Generate session requests (cancel/reschedule)
 */
export const generateSessionRequests = (
  sessions: Session[],
  count: number = 25
): SessionRequest[] => {
  const requests: SessionRequest[] = [];
  const types: RequestType[] = [RequestType.CANCEL, RequestType.RESCHEDULE];
  const statuses: RequestStatus[] = [
    RequestStatus.PENDING,
    RequestStatus.APPROVED,
    RequestStatus.REJECTED
  ];

  // Filter sessions that can have requests (confirmed or pending status, not in the past)
  const eligibleSessions = sessions.filter(session => {
    const isEligibleStatus = session.status === SessionStatus.CONFIRMED || 
                            session.status === SessionStatus.PENDING;
    const sessionDate = new Date(session.startTime);
    const now = new Date();
    // Allow past sessions for testing, but prefer future ones
    return isEligibleStatus && sessionDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  });

  if (eligibleSessions.length === 0) {
    return requests;
  }

  // Mix between individual sessions (no classId) and class sessions (with classId)
  const individualSessions = eligibleSessions.filter(s => !s.classId);
  const classSessions = eligibleSessions.filter(s => s.classId);

  const targetCount = Math.min(count, eligibleSessions.length * 0.5); // ~50% of eligible sessions

  for (let i = 0; i < targetCount; i++) {
    // Mix: 60% individual, 40% class sessions
    const useClassSession = classSessions.length > 0 && Math.random() < 0.4;
    const sessionPool = useClassSession ? classSessions : individualSessions;
    
    if (sessionPool.length === 0) continue;

    const session = randomItem(sessionPool);
    const studentId = randomItem(session.studentIds);
    const type = randomItem(types);
    const status = randomItem(statuses);
    
    // For reschedule, generate preferred times
    let preferredStartTime: string | undefined;
    let preferredEndTime: string | undefined;
    
    if (type === RequestType.RESCHEDULE) {
      const originalStart = new Date(session.startTime);
      const daysOffset = randomInt(1, 7); // 1-7 days later
      preferredStartTime = addDays(originalStart, daysOffset).toISOString();
      
      const originalEnd = new Date(session.endTime);
      preferredEndTime = addDays(originalEnd, daysOffset).toISOString();
    }

    const reasons = [
      'Có việc đột xuất cần xử lý',
      'Sức khỏe không tốt, cần nghỉ ngơi',
      'Lịch học trùng với kỳ thi khác',
      'Có việc gia đình cần giải quyết',
      'Cần thời gian ôn tập thêm trước buổi học',
      'Xung đột với công việc part-time',
      'Cần điều chỉnh lịch học cho phù hợp hơn'
    ];

    const request: SessionRequest = {
      id: generateId('req'),
      sessionId: session.id,
      studentId: studentId,
      tutorId: session.tutorId,
      classId: session.classId, // Copy from session to distinguish class vs individual
      type: type,
      status: status,
      reason: randomItem(reasons),
      preferredStartTime: preferredStartTime,
      preferredEndTime: preferredEndTime,
      responseMessage: status === RequestStatus.APPROVED || status === RequestStatus.REJECTED
        ? status === RequestStatus.APPROVED
          ? 'Yêu cầu của bạn đã được chấp nhận.'
          : 'Rất tiếc, yêu cầu này không thể được chấp nhận do lịch trình đã được sắp xếp.'
        : undefined,
      createdAt: addDays(new Date(), randomInt(-14, 0)).toISOString(),
      updatedAt: status !== RequestStatus.PENDING 
        ? addDays(new Date(), randomInt(-7, 0)).toISOString()
        : addDays(new Date(), randomInt(-14, 0)).toISOString()
    };

    requests.push(request);
  }

  return requests;
};

/**
 * Generate assignment submissions
 */
const generateAssignmentSubmissions = (assignments: Assignment[], sessions: Session[], enrollments: Enrollment[]) => {
  const submissions: AssignmentSubmission[] = [];

  assignments.forEach(assignment => {
    if (assignment.sessionId) {
      const session = sessions.find(s => s.id === assignment.sessionId);
      if (session) {
        session.studentIds?.forEach(studentId => {
          if (Math.random() < 0.6) {
            submissions.push({
              id: generateId('assignsub'),
              assignmentId: assignment.id,
              studentId,
              content: `Bài làm của học viên cho assignment ${assignment.title}`,
              attachments: Math.random() > 0.5 ? [{
                fileName: 'submission.pdf',
                fileUrl: `https://example.com/submissions/${studentId}_${assignment.id}.pdf`,
                fileSize: Math.floor(Math.random() * 2000000) + 100000
              }] : undefined,
              score: Math.floor(Math.random() * assignment.totalPoints * 0.7) + assignment.totalPoints * 0.2,
              feedback: Math.random() > 0.5 ? 'Bài làm khá tốt!' : undefined,
              gradedBy: session.tutorId,
              submittedAt: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString(),
              gradedAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(),
              status: ['submitted', 'graded'][Math.floor(Math.random() * 2)] as any
            });
          }
        });
      }
    } else if (assignment.classId) {
      const classEnrollments = enrollments.filter(e => e.classId === assignment.classId && e.status === 'active');
      classEnrollments.forEach(enrollment => {
        if (Math.random() < 0.6) {
          submissions.push({
            id: generateId('assignsub'),
            assignmentId: assignment.id,
            studentId: enrollment.studentId,
            content: `Bài làm của học viên cho assignment ${assignment.title}`,
            attachments: Math.random() > 0.5 ? [{
              fileName: 'submission.pdf',
              fileUrl: `https://example.com/submissions/${enrollment.studentId}_${assignment.id}.pdf`,
              fileSize: Math.floor(Math.random() * 2000000) + 100000
            }] : undefined,
            score: Math.floor(Math.random() * assignment.totalPoints * 0.7) + assignment.totalPoints * 0.2,
            feedback: Math.random() > 0.5 ? 'Bài làm tốt!' : undefined,
            submittedAt: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString(),
            gradedAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(),
            status: ['submitted', 'graded'][Math.floor(Math.random() * 2)] as any
          });
        }
      });
    }
  });

  return submissions;
};

// ===== MANAGEMENT MODULE SEED DATA GENERATORS =====

/**
 * Generate permission audit logs
 */
export const generatePermissionAudits = (management: Management[], allUsers: User[]): PermissionAudit[] => {
  const audits: PermissionAudit[] = [];
  const actions: ('grant' | 'revoke' | 'update')[] = ['grant', 'revoke', 'update'];
  const permissions = ['view_analytics', 'manage_users', 'approve_requests', 'view_reports', 'award_credits', 'manage_community'];

  // Generate some permission changes
  for (let i = 0; i < 10; i++) {
    const actor = randomItem(management);
    const targetUser = randomItem(allUsers);
    const action = randomItem(actions);
    const permCount = randomInt(1, 3);
    const selectedPerms = randomItems(permissions, permCount);

    const audit: PermissionAudit = {
      id: generateId('audit'),
      userId: targetUser.id,
      action,
      permissions: selectedPerms,
      previousPermissions: action === 'update' ? randomItems(permissions, randomInt(1, 2)) : undefined,
      actorId: actor.id,
      reason: randomItem([
        'Thay đổi vai trò người dùng',
        'Cập nhật quyền truy cập',
        'Thu hồi quyền do vi phạm',
        'Cấp quyền tạm thời'
      ]),
      temporary: Math.random() > 0.7,
      expiresAt: Math.random() > 0.7 ? addDays(new Date(), randomInt(7, 30)).toISOString() : undefined,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    audits.push(audit);
  }

  return audits;
};

/**
 * Generate training credits
 */
export const generateTrainingCredits = (students: Student[], sessions: Session[], classes: Class[], management: Management[]): TrainingCredit[] => {
  const credits: TrainingCredit[] = [];
  const semesters = ['2024-2025-1', '2024-2025-2', '2023-2024-2'];

  // Award credits to some students
  students.slice(0, 10).forEach(student => {
    if (Math.random() > 0.5) {
      const session = randomItem(sessions.filter(s => s.studentIds?.includes(student.id) && s.status === SessionStatus.COMPLETED));
      const semester = randomItem(semesters);
      const creditAmount = randomInt(1, 3);

      const credit: TrainingCredit = {
        id: generateId('credit'),
        studentId: student.id,
        sessionId: session?.id,
        classId: session?.classId,
        semester,
        credits: creditAmount,
        reason: randomItem([
          'Hoàn thành session với attendance rate >= 80%',
          'Tham gia đầy đủ các buổi học trong semester',
          'Performance tốt trong các sessions',
          'Đạt yêu cầu về số lượng sessions completed'
        ]),
        awardedBy: randomItem(management).id,
        awardedAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        metadata: {
          attendanceRate: randomInt(80, 100),
          performanceScore: randomInt(7, 10),
          completionRate: randomInt(80, 100)
        }
      };
      credits.push(credit);
    }
  });

  return credits;
};

/**
 * Generate documents
 */
export const generateDocuments = (allUsers: User[]): Document[] => {
  const documents: Document[] = [];
  const categories: ('academic' | 'administrative' | 'reference' | 'other')[] = ['academic', 'administrative', 'reference', 'other'];
  const fileTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
  const subjects = ['Toán cao cấp', 'Vật lý đại cương', 'Lập trình C/C++', 'Tiếng Anh'];

  for (let i = 0; i < 15; i++) {
    const uploader = randomItem(allUsers);
    const category = randomItem(categories);
    const fileType = randomItem(fileTypes);
    const fileSize = randomInt(100000, 5000000); // 100KB to 5MB

    const document: Document = {
      id: generateId('doc'),
      title: randomItem([
        'Hướng dẫn sử dụng hệ thống',
        'Tài liệu học tập môn học',
        'Quy định và chính sách',
        'Báo cáo thống kê',
        'Tài liệu tham khảo'
      ]),
      description: `Tài liệu ${category} được upload bởi ${uploader.name}`,
      fileName: `document-${i + 1}.${fileType.includes('pdf') ? 'pdf' : fileType.includes('word') ? 'docx' : 'txt'}`,
      fileUrl: `https://storage.example.com/documents/${generateId()}`,
      fileSize,
      fileType,
      category,
      subject: category === 'academic' ? randomItem(subjects) : undefined,
      tags: randomItems(['hướng dẫn', 'tài liệu', 'tham khảo', 'chính sách'], randomInt(1, 3)),
      uploadedBy: uploader.id,
      uploadedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      isPublic: Math.random() > 0.5,
      isEncrypted: Math.random() > 0.8,
      accessLevel: Math.random() > 0.5 ? 'public' : Math.random() > 0.5 ? 'private' : 'restricted',
      downloadCount: randomInt(0, 50),
      viewCount: randomInt(0, 100),
      metadata: {
        author: uploader.name,
        version: '1.0',
        language: 'vi',
        pages: randomInt(1, 50)
      }
    };
    documents.push(document);
  }

  return documents;
};

/**
 * Generate community resources
 */
export const generateCommunityResources = (allUsers: User[]): CommunityResource[] => {
  const resources: CommunityResource[] = [];
  const types: ('document' | 'link' | 'video' | 'other')[] = ['document', 'link', 'video', 'other'];
  const categories: ('academic' | 'administrative' | 'reference' | 'event' | 'other')[] = ['academic', 'administrative', 'reference', 'event', 'other'];

  for (let i = 0; i < 10; i++) {
    const sharer = randomItem(allUsers);
    const type = randomItem(types);
    const category = randomItem(categories);

    const resource: CommunityResource = {
      id: generateId('resource'),
      title: randomItem([
        'Tài liệu học tập chung',
        'Video hướng dẫn',
        'Link tham khảo',
        'Tài nguyên cộng đồng'
      ]),
      description: `Tài nguyên ${type} được chia sẻ bởi ${sharer.name}`,
      type,
      url: type === 'link' ? `https://example.com/resource-${i + 1}` : undefined,
      fileUrl: type === 'document' || type === 'video' ? `https://storage.example.com/resources/${generateId()}` : undefined,
      thumbnail: type === 'video' ? `https://storage.example.com/thumbnails/${generateId()}.jpg` : undefined,
      category,
      subject: category === 'academic' ? randomItem(['Toán', 'Lý', 'Hóa', 'Anh']) : undefined,
      tags: randomItems(['học tập', 'tham khảo', 'cộng đồng'], randomInt(1, 3)),
      sharedBy: sharer.id,
      sharedAt: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString(),
      isPublic: Math.random() > 0.4,
      isEncrypted: Math.random() > 0.8,
      accessLevel: Math.random() > 0.5 ? 'public' : 'private',
      restrictedTo: Math.random() > 0.7 ? [randomItem(allUsers).id] : undefined,
      downloadCount: randomInt(0, 30),
      viewCount: randomInt(0, 80),
      likes: randomItems(allUsers.map(u => u.id), randomInt(0, 5)),
      createdAt: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString()
    };
    resources.push(resource);
  }

  return resources;
};

/**
 * Generate community events
 */
export const generateCommunityEvents = (management: Management[]): CommunityEvent[] => {
  const events: CommunityEvent[] = [];
  const types: ('webinar' | 'workshop' | 'meeting' | 'seminar' | 'other')[] = ['webinar', 'workshop', 'meeting', 'seminar', 'other'];
  const statuses: ('scheduled' | 'ongoing' | 'completed' | 'cancelled')[] = ['scheduled', 'ongoing', 'completed', 'cancelled'];

  for (let i = 0; i < 5; i++) {
    const organizer = randomItem(management);
    const type = randomItem(types);
    const status = randomItem(statuses);
    const daysFromNow = randomInt(-10, 30);
    const startTime = addDays(new Date(), daysFromNow);
    startTime.setHours(randomInt(9, 17), 0, 0, 0);
    const endTime = new Date(startTime.getTime() + randomInt(1, 3) * 60 * 60 * 1000);

    const event: CommunityEvent = {
      id: generateId('event'),
      title: randomItem([
        'Workshop về phương pháp học tập hiệu quả',
        'Webinar chia sẻ kinh nghiệm',
        'Hội thảo chuyên đề',
        'Buổi gặp mặt cộng đồng'
      ]),
      description: `Sự kiện ${type} được tổ chức bởi ${organizer.name}`,
      type,
      organizerId: organizer.id,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      location: Math.random() > 0.5 ? 'Phòng A101' : undefined,
      meetingLink: Math.random() > 0.5 ? `https://meet.google.com/${generateId()}` : undefined,
      isOnline: Math.random() > 0.5,
      maxParticipants: randomInt(20, 100),
      participants: [],
      status,
      category: randomItem(['Học tập', 'Giao lưu', 'Chuyên đề', 'Khác']),
      tags: randomItems(['workshop', 'webinar', 'cộng đồng'], randomInt(1, 2)),
      resources: [],
      registrationRequired: Math.random() > 0.5,
      registrationDeadline: Math.random() > 0.5 ? addDays(startTime, -1).toISOString() : undefined,
      metadata: {
        agenda: 'Chương trình chi tiết sẽ được cập nhật',
        speakers: [organizer.name],
        recordingUrl: status === 'completed' && Math.random() > 0.5 ? `https://storage.example.com/recordings/${generateId()}` : undefined
      },
      createdAt: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString()
    };
    events.push(event);
  }

  return events;
};

/**
 * Generate all mock data
 */
export const generateAllMockData = async () => {
  console.log('🎭 Generating mock data...');

  const students = await generateStudents(20);
  const tutors = await generateTutors(15);
  const management = await generateManagement(5);
  const allUsers = [...students, ...tutors, ...management];

  const sessions = generateSessions(students, tutors, 50);
  const evaluations = generateEvaluations(sessions);
  const progressEntries = generateProgressEntries(students, tutors, sessions);
  const libraryResources = generateLibraryResources(30);
  const forumPosts = generateForumPosts(allUsers, 20);
  const forumComments = generateForumComments(forumPosts, allUsers, 50);
  const notifications = generateNotifications(allUsers, sessions);
  const availability = generateAvailability(tutors);
  const approvalRequests = generateApprovalRequests(tutors, management, sessions);
  
  // Generate classes and enrollments
  const classes = generateClasses(tutors, availability);
  const enrollments = generateEnrollments(students, classes);

  // Generate LMS content
  const courseContents = generateCourseContents(sessions, classes, tutors);
  const quizzes = generateQuizzes(sessions, classes);
  const assignments = generateAssignments(sessions, classes);
  const grades = generateGrades(sessions, classes, quizzes, assignments, students, enrollments);
  const quizSubmissions = generateQuizSubmissions(quizzes, sessions, enrollments);
  const assignmentSubmissions = generateAssignmentSubmissions(assignments, sessions, enrollments);

  // Generate session requests (include both individual and class sessions)
  const allSessions = [...sessions]; // Individual sessions already generated
  // Note: Class sessions would be generated separately via generate-sessions endpoint
  // For seed data, we'll use individual sessions and some sessions with classId
  const sessionRequests = generateSessionRequests(allSessions, 25);

  // Generate management module data
  const permissionAudits = generatePermissionAudits(management, allUsers);
  const trainingCredits = generateTrainingCredits(students, sessions, classes, management);
  const documents = generateDocuments(allUsers);
  const communityResources = generateCommunityResources(allUsers);
  const communityEvents = generateCommunityEvents(management);

  return {
    users: allUsers,
    sessions,
    evaluations,
    progress: progressEntries,
    library: libraryResources,
    forum: { posts: forumPosts, comments: forumComments },
    notifications,
    availability,
    approvals: approvalRequests,
    classes,
    enrollments,
    courseContents,
    quizzes,
    assignments,
    grades,
    quizSubmissions,
    assignmentSubmissions,
    sessionRequests,
    // Management module data
    permissionAudits,
    trainingCredits,
    documents,
    communityResources,
    communityEvents
  };
};

