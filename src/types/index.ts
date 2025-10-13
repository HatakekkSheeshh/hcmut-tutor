export interface User {
  id: string;
  hcmutId: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'tutor' | 'admin';
  university?: string;
  major?: string;
  year?: string;
  avatar?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Tutor {
  id: string;
  userId: string;
  specialties: string[];
  rating: number;
  totalReviews: number;
  pricePerHour: number;
  experienceYears: number;
  bio: string;
  isVerified: boolean;
  availability: {
    monday: string[];
    tuesday: string[];
    wednesday: string[];
    thursday: string[];
    friday: string[];
    saturday: string[];
    sunday: string[];
  };
  subjects: string[];
  location: string;
  nextAvailable: string;
  status: 'available' | 'busy' | 'offline';
  createdAt: string;
  updatedAt?: string;
}

export interface Session {
  id: string;
  studentId: string;
  tutorId: string;
  subjectId: string;
  title: string;
  description?: string;
  scheduledAt: string;
  duration: number;
  type: 'online' | 'offline';
  meetingLink?: string;
  location?: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  price: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  updatedAt?: string;
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  category: string;
  tutors: string[];
  createdAt: string;
}

export interface SearchHistory {
  id: string;
  userId: string;
  searchQuery: string;
  filters: {
    subject?: string;
    rating?: string;
    availability?: string;
  };
  resultsCount: number;
  createdAt: string;
}

export interface SearchCriteria {
  subject?: string;
  rating?: string;
  availability?: string;
  searchQuery?: string;
}

export interface MatchingScore {
  tutor: Tutor;
  score: number;
  reasons: string[];
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: Omit<User, 'password'>;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export interface SearchResponse {
  tutors: MatchingScore[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  searchCriteria: SearchCriteria;
}
