/**
 * Google Gemini AI Service
 * Handles all AI interactions using Google Gemini API
 */

// Ensure environment variables are loaded
import 'dotenv/config';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { User, Session, ProgressEntry, Class, Enrollment, Tutor } from '../types.js';
import { storage } from '../storage.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface ChatContext {
  user: User;
  sessions: Session[];
  progress: ProgressEntry[];
  classes: Class[];
  enrollments: Enrollment[];
  tutors: Tutor[]; // Tutors from enrolled classes and sessions
  allAvailableClasses: Class[]; // All available classes for booking
  allAvailableTutors: Tutor[]; // All available tutors for booking
}

/**
 * Format date to Vietnamese format
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const dayName = days[date.getDay()];
  return `${dayName}, ${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
}

/**
 * Build system prompt with user context
 */
function buildSystemPrompt(context: ChatContext): string {
  const { user, sessions, progress, classes, enrollments, tutors, allAvailableClasses, allAvailableTutors } = context;

  // Filter sessions
  const upcomingSessions = sessions
    .filter(s => 
      new Date(s.startTime) > new Date() && 
      (s.status === 'confirmed' || s.status === 'pending')
    )
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 10); // Limit to 10 upcoming sessions

  const completedSessions = sessions.filter(s => s.status === 'completed');
  
  // Get student info if user is a student
  const studentInfo = user.role === 'student' ? user : null;
  
  // Build enrolled classes details
  const enrolledClassesDetails = classes.map(cls => {
    const enrollment = enrollments.find(e => e.classId === cls.id);
    const tutor = tutors.find(t => t.id === cls.tutorId);
    return {
      code: cls.code,
      subject: cls.subject,
      day: cls.day,
      time: `${cls.startTime} - ${cls.endTime}`,
      tutor: tutor?.name || 'N/A',
      status: enrollment?.status || 'N/A',
      location: cls.isOnline ? 'Online' : cls.location || 'N/A'
    };
  });

  // Build upcoming sessions details
  const upcomingSessionsDetails = upcomingSessions.map(session => {
    const tutor = tutors.find(t => t.id === session.tutorId);
    return {
      subject: session.subject,
      topic: session.topic || 'Không có',
      tutor: tutor?.name || 'N/A',
      time: formatDate(session.startTime),
      duration: `${session.duration} phút`,
      location: session.isOnline ? 'Online' : session.location || 'N/A',
      status: session.status
    };
  });

  // Get available subjects from all classes
  const availableSubjects = [...new Set(allAvailableClasses.map(c => c.subject))].sort();
  
  // Get available tutors info
  const availableTutorsInfo = allAvailableTutors.slice(0, 20).map(tutor => ({
    name: tutor.name,
    subjects: tutor.subjects.join(', '),
    rating: tutor.rating,
    totalSessions: tutor.totalSessions
  }));

  // Build progress summary
  const progressSummary = progress.length > 0 
    ? progress.slice(-5).map(p => ({
        subject: p.subject || 'N/A',
        score: p.score !== undefined ? `${p.score}/10` : 'Chưa có điểm',
        date: new Date(p.createdAt).toLocaleDateString('vi-VN')
      }))
    : [];

  let prompt = `Bạn là trợ lý AI học tập thông minh cho hệ thống gia sư HCMUT (Đại học Bách Khoa TP.HCM).

THÔNG TIN NGƯỜI DÙNG:
- Tên: ${user.name || 'Sinh viên'}
- Vai trò: ${user.role === 'student' ? 'Sinh viên' : user.role === 'tutor' ? 'Gia sư' : 'Quản lý'}
- Mã HCMUT: ${user.hcmutId}
- Email: ${user.email}`;

  // Add student-specific info
  if (studentInfo) {
    if (studentInfo.major) prompt += `\n- Ngành học: ${studentInfo.major}`;
    if (studentInfo.year) prompt += `\n- Năm học: Năm ${studentInfo.year}`;
    if (studentInfo.interests && studentInfo.interests.length > 0) {
      prompt += `\n- Sở thích: ${studentInfo.interests.join(', ')}`;
    }
    if (studentInfo.preferredSubjects && studentInfo.preferredSubjects.length > 0) {
      prompt += `\n- Môn học quan tâm: ${studentInfo.preferredSubjects.join(', ')}`;
    }
  }

  prompt += `\n\nTÌNH TRẠNG HỌC TẬP:
- Số buổi học sắp tới: ${upcomingSessions.length}
- Số buổi học đã hoàn thành: ${completedSessions.length}
- Số lớp đã đăng ký: ${enrollments.length}
- Số bản ghi tiến độ: ${progress.length}`;

  // Add enrolled classes details
  if (enrolledClassesDetails.length > 0) {
    prompt += `\n\nCÁC LỚP ĐÃ ĐĂNG KÝ:`;
    enrolledClassesDetails.forEach((cls, idx) => {
      prompt += `\n${idx + 1}. ${cls.code} - ${cls.subject}
   - Thời gian: ${cls.day}, ${cls.time}
   - Gia sư: ${cls.tutor}
   - Địa điểm: ${cls.location}
   - Trạng thái: ${cls.status}`;
    });
  }

  // Add upcoming sessions details
  if (upcomingSessionsDetails.length > 0) {
    prompt += `\n\nLỊCH HỌC SẮP TỚI:`;
    upcomingSessionsDetails.forEach((session, idx) => {
      prompt += `\n${idx + 1}. ${session.subject}${session.topic !== 'Không có' ? ` - ${session.topic}` : ''}
   - Gia sư: ${session.tutor}
   - Thời gian: ${session.time}
   - Thời lượng: ${session.duration}
   - Địa điểm: ${session.location}
   - Trạng thái: ${session.status}`;
    });
  }

  // Add progress summary
  if (progressSummary.length > 0) {
    prompt += `\n\nTIẾN ĐỘ HỌC TẬP GẦN ĐÂY:`;
    progressSummary.forEach((p, idx) => {
      prompt += `\n${idx + 1}. ${p.subject}: ${p.score} (${p.date})`;
    });
  }

  // Add available subjects and tutors for booking
  if (availableSubjects.length > 0) {
    prompt += `\n\nCÁC MÔN HỌC CÓ THỂ ĐĂNG KÝ: ${availableSubjects.join(', ')}`;
  }

  if (availableTutorsInfo.length > 0) {
    prompt += `\n\nGIA SƯ CÓ SẴN (một số ví dụ):`;
    availableTutorsInfo.slice(0, 5).forEach((tutor, idx) => {
      prompt += `\n${idx + 1}. ${tutor.name} - Môn: ${tutor.subjects} - Đánh giá: ${tutor.rating}/5 (${tutor.totalSessions} buổi học)`;
    });
  }

  prompt += `\n\nKHẢ NĂNG CỦA BẠN:
1. Hỗ trợ sinh viên đặt lịch học với gia sư (có thể đề xuất gia sư và môn học phù hợp)
2. Trả lời câu hỏi về môn học, gia sư, và lịch học (sử dụng thông tin chi tiết ở trên)
3. Cung cấp lời khuyên học tập và mẹo học hiệu quả
4. Hỗ trợ theo dõi tiến độ học tập và xem điểm số
5. Hỗ trợ đổi lịch/hủy buổi học
6. Gợi ý các lớp học phù hợp dựa trên sở thích và môn học quan tâm
7. Trả lời câu hỏi về các tính năng của hệ thống
8. Hướng dẫn sử dụng các chức năng của hệ thống

HƯỚNG DẪN TRẢ LỜI:
- Luôn trả lời bằng tiếng Việt (hoặc tiếng Anh nếu người dùng hỏi bằng tiếng Anh)
- Thân thiện, nhiệt tình, và hữu ích
- Ngắn gọn nhưng đầy đủ thông tin
- SỬ DỤNG THÔNG TIN CHI TIẾT Ở TRÊN để trả lời câu hỏi về lịch học, môn học, và gia sư
- Khi sinh viên muốn book session, đề xuất các môn học và gia sư phù hợp dựa trên:
  * Môn học đã đăng ký
  * Sở thích và môn học quan tâm
  * Lịch học hiện tại để tránh trùng lặp
- Nếu không chắc chắn, hãy hỏi lại để làm rõ
- Khuyến khích người dùng sử dụng các tính năng của hệ thống

Hãy trả lời câu hỏi của người dùng một cách tự nhiên và hữu ích, sử dụng tất cả thông tin ngữ cảnh có sẵn.`;

  return prompt;
}

/**
 * Get user context for chatbot
 */
export async function getUserContext(userId: string): Promise<ChatContext> {
  const [user, allSessions, allProgress, allClasses, allEnrollments, allUsers] = await Promise.all([
    storage.findById<User>('users.json', userId),
    storage.read<Session>('sessions.json'),
    storage.read<ProgressEntry>('progress.json'),
    storage.read<Class>('classes.json'),
    storage.read<Enrollment>('enrollments.json'),
    storage.read<User>('users.json')
  ]);

  if (!user) {
    throw new Error('User not found');
  }

  // Filter user-specific data
  const userSessions = allSessions.filter(s => 
    s.studentIds.includes(userId) || s.tutorId === userId
  );
  
  const userProgress = allProgress.filter(p => p.studentId === userId);
  
  const userEnrollments = allEnrollments.filter(e => e.studentId === userId);
  const enrolledClassIds = userEnrollments.map(e => e.classId);
  const userClasses = allClasses.filter(c => enrolledClassIds.includes(c.id));

  // Get tutors from enrolled classes and sessions
  const tutorIdsFromClasses = [...new Set(userClasses.map(c => c.tutorId))];
  const tutorIdsFromSessions = [...new Set(userSessions.map(s => s.tutorId))];
  const allTutorIds = [...new Set([...tutorIdsFromClasses, ...tutorIdsFromSessions])];
  
  const tutors = allUsers
    .filter(u => u.role === 'tutor' && allTutorIds.includes(u.id))
    .map(u => u as Tutor);

  // Get all available classes (for booking suggestions)
  const allAvailableClasses = allClasses.filter(c => 
    c.status === 'active' && c.currentEnrollment < c.maxStudents
  );

  // Get all available tutors (for booking suggestions)
  const allAvailableTutors = allUsers
    .filter(u => u.role === 'tutor')
    .map(u => u as Tutor)
    .sort((a, b) => b.rating - a.rating); // Sort by rating

  return {
    user,
    sessions: userSessions,
    progress: userProgress,
    classes: userClasses,
    enrollments: userEnrollments,
    tutors,
    allAvailableClasses,
    allAvailableTutors
  };
}

/**
 * Generate AI response using Gemini
 */
export async function generateAIResponse(
  message: string,
  userId: string,
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  try {
    // Get user context
    const context = await getUserContext(userId);
    const systemPrompt = buildSystemPrompt(context);

    // Initialize model
    // Using Gemini 2.5 Flash-Lite: Best balance for free tier
    // - RPM: 15 requests/minute (good for concurrent users)
    // - TPM: 250,000 tokens/minute (more than enough for chat)
    // - RPD: 1,000 requests/day (highest among free models)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-lite',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 500,
      }
    });

    // Build conversation history
    let fullPrompt = systemPrompt + '\n\n';
    
    if (conversationHistory && conversationHistory.length > 0) {
      // Add last 5 messages for context (to avoid token limit)
      const recentHistory = conversationHistory.slice(-5);
      for (const msg of recentHistory) {
        fullPrompt += `${msg.role === 'user' ? 'Người dùng' : 'Trợ lý'}: ${msg.content}\n`;
      }
    }
    
    fullPrompt += `Người dùng: ${message}\nTrợ lý:`;

    // Generate response
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return text.trim();
  } catch (error: any) {
    console.error('Gemini API error:', error);
    
    // Fallback response
    if (error.message?.includes('API_KEY')) {
      throw new Error('Lỗi cấu hình API. Vui lòng kiểm tra GEMINI_API_KEY.');
    }
    
    if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      throw new Error('Đã vượt quá giới hạn API. Vui lòng thử lại sau.');
    }
    
    throw new Error('Lỗi khi xử lý câu hỏi. Vui lòng thử lại sau.');
  }
}

/**
 * Check if Gemini API is configured
 */
export function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 0;
}

