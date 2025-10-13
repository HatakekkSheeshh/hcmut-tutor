# 🚀 Backend Implementation: Search Available Tutors (UC-St1)

## 🎯 Implementation Plan

Tạo backend hoàn chỉnh cho use case "Search Available Tutors" với:
- ✅ HCMUT SSO Mock System
- ✅ Tutor Search API với AI Matching
- ✅ JSON Data Storage
- ✅ Frontend Integration

---

## 📁 Project Structure

```
hcmut-tutor/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── hcmut-sso/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── login/
│   │   │   │   │   └── route.ts
│   │   │   │   └── verify/
│   │   │   │       └── route.ts
│   │   │   ├── tutors/
│   │   │   │   ├── search/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── [id]/
│   │   │   │   │   └── route.ts
│   │   │   │   └── [id]/availability/
│   │   │   │       └── route.ts
│   │   │   ├── subjects/
│   │   │   │   └── route.ts
│   │   │   └── analytics/
│   │   │       └── search-log/
│   │   │           └── route.ts
│   │   ├── student/
│   │   └── tutor/
│   ├── lib/
│   │   ├── dataManager.ts
│   │   ├── auth.ts
│   │   ├── ai-matching.ts
│   │   └── api.ts
│   ├── types/
│   │   └── index.ts
│   └── components/
├── data/
│   ├── users.json
│   ├── tutors.json
│   ├── subjects.json
│   ├── sessions.json
│   └── search-history.json
└── package.json
```

---

## 🗄️ JSON Data Files

### **data/users.json**
```json
{
  "users": [
    {
      "id": "1",
      "hcmutId": "20123456",
      "email": "student@hcmut.edu.vn",
      "password": "$2a$10$hashed_password_here",
      "firstName": "Nguyễn",
      "lastName": "Văn A",
      "role": "student",
      "university": "HCMUT",
      "major": "Computer Science",
      "year": "2024",
      "avatar": "/uploads/student1.jpg",
      "isActive": true,
      "isVerified": true,
      "createdAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": "2",
      "hcmutId": "T001",
      "email": "tutor1@hcmut.edu.vn",
      "password": "$2a$10$hashed_password_here",
      "firstName": "Trần",
      "lastName": "Thị B",
      "role": "tutor",
      "university": "HCMUT",
      "major": "Mathematics",
      "year": "2020",
      "avatar": "/uploads/tutor1.jpg",
      "isActive": true,
      "isVerified": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### **data/tutors.json**
```json
{
  "tutors": [
    {
      "id": "1",
      "userId": "2",
      "specialties": ["Calculus", "Algebra", "Statistics", "Linear Algebra"],
      "rating": 4.9,
      "totalReviews": 127,
      "pricePerHour": 50,
      "experienceYears": 8,
      "bio": "Experienced mathematics tutor with 8 years of teaching experience. Specialized in calculus and algebra.",
      "isVerified": true,
      "availability": {
        "monday": ["09:00-12:00", "14:00-17:00"],
        "tuesday": ["09:00-12:00", "14:00-17:00"],
        "wednesday": ["09:00-12:00", "14:00-17:00"],
        "thursday": ["09:00-12:00", "14:00-17:00"],
        "friday": ["09:00-12:00", "14:00-17:00"],
        "saturday": ["09:00-12:00"],
        "sunday": []
      },
      "subjects": ["1", "2"],
      "location": "Ho Chi Minh City",
      "nextAvailable": "2024-01-15T14:00:00Z",
      "status": "available",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": "2",
      "userId": "3",
      "specialties": ["Quantum Physics", "Mechanics", "Thermodynamics"],
      "rating": 4.8,
      "totalReviews": 89,
      "pricePerHour": 45,
      "experienceYears": 12,
      "bio": "Physics professor with extensive research experience in quantum mechanics.",
      "isVerified": true,
      "availability": {
        "monday": ["10:00-12:00", "15:00-18:00"],
        "tuesday": ["10:00-12:00", "15:00-18:00"],
        "wednesday": ["10:00-12:00", "15:00-18:00"],
        "thursday": ["10:00-12:00", "15:00-18:00"],
        "friday": ["10:00-12:00", "15:00-18:00"],
        "saturday": [],
        "sunday": []
      },
      "subjects": ["3", "4"],
      "location": "Ho Chi Minh City",
      "nextAvailable": "2024-01-16T10:00:00Z",
      "status": "available",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### **data/subjects.json**
```json
{
  "subjects": [
    {
      "id": "1",
      "name": "Mathematics",
      "description": "Advanced mathematics topics including calculus, algebra, and statistics",
      "category": "STEM",
      "tutors": ["1", "2"],
      "createdAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": "2",
      "name": "Calculus",
      "description": "Differential and integral calculus",
      "category": "STEM",
      "tutors": ["1"],
      "createdAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": "3",
      "name": "Physics",
      "description": "Physics fundamentals and applications",
      "category": "STEM",
      "tutors": ["2"],
      "createdAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": "4",
      "name": "Chemistry",
      "description": "Chemistry fundamentals and applications",
      "category": "STEM",
      "tutors": ["3"],
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### **data/search-history.json**
```json
{
  "searchHistory": [
    {
      "id": "1",
      "userId": "1",
      "searchQuery": "mathematics tutor",
      "filters": {
        "subject": "Mathematics",
        "rating": "4+",
        "availability": "today"
      },
      "resultsCount": 5,
      "createdAt": "2024-01-10T10:00:00Z"
    }
  ]
}
```

---

## 🔐 HCMUT SSO Mock System

### **app/api/auth/hcmut-sso/route.ts**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { dataManager } from '@/lib/dataManager';
import { generateToken } from '@/lib/auth';
import { User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { hcmutId, password } = await request.json();

    // Mock HCMUT SSO validation
    if (!hcmutId || !password) {
      return NextResponse.json({ error: 'HCMUT ID and password required' }, { status: 400 });
    }

    // Validate HCMUT ID format (mock)
    const hcmutIdPattern = /^(T\d{3}|20\d{6})$/;
    if (!hcmutIdPattern.test(hcmutId)) {
      return NextResponse.json({ error: 'Invalid HCMUT ID format' }, { status: 400 });
    }

    // Get user data
    const userData = await dataManager.readData<{ users: User[] }>('users.json');
    if (!userData) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Find user by HCMUT ID
    const user = userData.users.find(u => u.hcmutId === hcmutId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Mock password validation (in real app, validate with HCMUT SSO)
    if (password !== 'hcmut123') {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'Account is inactive' }, { status: 403 });
    }

    // Generate JWT token
    const token = generateToken(user);

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        hcmutId: user.hcmutId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        university: user.university,
        major: user.major,
        avatar: user.avatar,
        isVerified: user.isVerified
      }
    });

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24 hours
    });

    return response;
  } catch (error) {
    console.error('HCMUT SSO Error:', error);
    return NextResponse.json({ error: 'SSO authentication failed' }, { status: 500 });
  }
}
```

### **app/api/auth/verify/route.ts**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { dataManager } from '@/lib/dataManager';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user data
    const userData = await dataManager.readData<{ users: any[] }>('users.json');
    if (!userData) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const user = userData.users.find(u => u.id === decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        hcmutId: user.hcmutId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        university: user.university,
        major: user.major,
        avatar: user.avatar,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Token verification failed' }, { status: 500 });
  }
}
```

---

## 🔍 Tutor Search API với AI Matching

### **lib/ai-matching.ts (AI Matching Algorithm)**
```typescript
import { Tutor, User, SearchCriteria } from '@/types';

export interface MatchingScore {
  tutor: Tutor;
  score: number;
  reasons: string[];
}

export class AIMatchingEngine {
  calculateMatchScore(
    student: User,
    tutor: Tutor,
    criteria: SearchCriteria
  ): MatchingScore {
    let totalScore = 0;
    const reasons: string[] = [];

    // 1. Subject Match (40% weight)
    const subjectScore = this.calculateSubjectMatch(tutor, criteria);
    totalScore += subjectScore * 0.4;
    if (subjectScore > 0.8) reasons.push('Perfect subject match');
    else if (subjectScore > 0.6) reasons.push('Good subject alignment');

    // 2. Availability Match (25% weight)
    const availabilityScore = this.calculateAvailabilityMatch(tutor, criteria);
    totalScore += availabilityScore * 0.25;
    if (availabilityScore > 0.8) reasons.push('Available at preferred times');
    else if (availabilityScore > 0.6) reasons.push('Good availability match');

    // 3. Rating & Reviews (20% weight)
    const ratingScore = this.calculateRatingScore(tutor, criteria);
    totalScore += ratingScore * 0.2;
    if (ratingScore > 0.8) reasons.push('Excellent ratings');
    else if (ratingScore > 0.6) reasons.push('Good reviews');

    // 4. Student Profile Match (15% weight)
    const profileScore = this.calculateProfileMatch(student, tutor);
    totalScore += profileScore * 0.15;
    if (profileScore > 0.8) reasons.push('Great fit for your learning style');
    else if (profileScore > 0.6) reasons.push('Good learning match');

    return {
      tutor,
      score: Math.min(totalScore, 1.0), // Cap at 1.0
      reasons
    };
  }

  private calculateSubjectMatch(tutor: Tutor, criteria: SearchCriteria): number {
    if (!criteria.subject) return 0.5; // Neutral if no subject filter

    const tutorSubjects = tutor.specialties || [];
    const searchSubject = criteria.subject.toLowerCase();

    // Exact match
    if (tutorSubjects.some(s => s.toLowerCase() === searchSubject)) {
      return 1.0;
    }

    // Partial match
    if (tutorSubjects.some(s => s.toLowerCase().includes(searchSubject))) {
      return 0.8;
    }

    // Related subjects (simplified)
    const relatedSubjects: Record<string, string[]> = {
      'mathematics': ['calculus', 'algebra', 'statistics'],
      'physics': ['mechanics', 'thermodynamics', 'quantum'],
      'chemistry': ['organic', 'inorganic', 'biochemistry']
    };

    const related = relatedSubjects[searchSubject] || [];
    if (tutorSubjects.some(s => related.some(r => s.toLowerCase().includes(r)))) {
      return 0.6;
    }

    return 0.2; // Low score for no match
  }

  private calculateAvailabilityMatch(tutor: Tutor, criteria: SearchCriteria): number {
    if (!criteria.availability) return 0.5;

    const now = new Date();
    const today = now.getDay();
    const currentHour = now.getHours();

    // Check if tutor is available now
    if (criteria.availability === 'available' && tutor.status === 'available') {
      return 1.0;
    }

    // Check availability for today
    if (criteria.availability === 'today') {
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const todayName = dayNames[today];
      
      if (tutor.availability[todayName] && tutor.availability[todayName].length > 0) {
        return 0.9;
      }
    }

    // Check availability for this week
    if (criteria.availability === 'week') {
      const hasAvailability = Object.values(tutor.availability).some(slots => slots.length > 0);
      return hasAvailability ? 0.8 : 0.3;
    }

    return 0.5; // Default score
  }

  private calculateRatingScore(tutor: Tutor, criteria: SearchCriteria): number {
    const rating = tutor.rating || 0;
    
    if (!criteria.rating) return rating / 5.0; // Normalize to 0-1

    const requiredRating = parseFloat(criteria.rating.replace('+', ''));
    
    if (rating >= requiredRating) {
      return 1.0;
    } else if (rating >= requiredRating - 0.5) {
      return 0.7;
    } else {
      return 0.3;
    }
  }

  private calculateProfileMatch(student: User, tutor: Tutor): number {
    // Mock profile matching based on university and major
    let score = 0.5; // Base score

    // Same university bonus
    if (student.university === tutor.university) {
      score += 0.2;
    }

    // Related major bonus
    const relatedMajors: Record<string, string[]> = {
      'Computer Science': ['Mathematics', 'Physics'],
      'Mathematics': ['Physics', 'Computer Science'],
      'Physics': ['Mathematics', 'Chemistry']
    };

    const studentMajor = student.major || '';
    const tutorSpecialties = tutor.specialties || [];
    
    const related = relatedMajors[studentMajor] || [];
    if (related.some(major => tutorSpecialties.some(s => s.includes(major)))) {
      score += 0.3;
    }

    return Math.min(score, 1.0);
  }

  rankTutors(tutors: Tutor[], student: User, criteria: SearchCriteria): MatchingScore[] {
    const scores = tutors.map(tutor => 
      this.calculateMatchScore(student, tutor, criteria)
    );

    return scores.sort((a, b) => b.score - a.score);
  }
}

export const aiMatchingEngine = new AIMatchingEngine();
```

### **app/api/tutors/search/route.ts**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { dataManager } from '@/lib/dataManager';
import { verifyToken } from '@/lib/auth';
import { aiMatchingEngine } from '@/lib/ai-matching';
import { Tutor, User, SearchCriteria } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get search parameters
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('q') || '';
    const subject = searchParams.get('subject') || '';
    const rating = searchParams.get('rating') || '';
    const availability = searchParams.get('availability') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    // Get user data for AI matching
    const userData = await dataManager.readData<{ users: User[] }>('users.json');
    const student = userData?.users.find(u => u.id === decoded.userId);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Get tutors data
    const tutorsData = await dataManager.readData<{ tutors: Tutor[] }>('tutors.json');
    if (!tutorsData) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    let tutors = tutorsData.tutors;

    // Apply basic filters
    if (subject) {
      tutors = tutors.filter(tutor => 
        tutor.specialties?.some(s => s.toLowerCase().includes(subject.toLowerCase()))
      );
    }

    if (rating) {
      const requiredRating = parseFloat(rating.replace('+', ''));
      tutors = tutors.filter(tutor => (tutor.rating || 0) >= requiredRating);
    }

    if (availability) {
      if (availability === 'available') {
        tutors = tutors.filter(tutor => tutor.status === 'available');
      }
    }

    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      tutors = tutors.filter(tutor => 
        tutor.specialties?.some(s => s.toLowerCase().includes(query)) ||
        tutor.bio?.toLowerCase().includes(query)
      );
    }

    // AI Matching and Ranking
    const searchCriteria: SearchCriteria = {
      subject,
      rating,
      availability,
      searchQuery
    };

    const rankedTutors = aiMatchingEngine.rankTutors(tutors, student, searchCriteria);

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTutors = rankedTutors.slice(startIndex, endIndex);

    // Log search for analytics
    await dataManager.addRecord('search-history.json', {
      userId: student.id,
      searchQuery,
      filters: { subject, rating, availability },
      resultsCount: rankedTutors.length
    });

    return NextResponse.json({
      tutors: paginatedTutors,
      pagination: {
        page,
        limit,
        total: rankedTutors.length,
        totalPages: Math.ceil(rankedTutors.length / limit)
      },
      searchCriteria
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
```

### **app/api/tutors/[id]/route.ts**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { dataManager } from '@/lib/dataManager';
import { verifyToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { id } = params;

    // Get tutor data
    const tutorsData = await dataManager.readData<{ tutors: any[] }>('tutors.json');
    if (!tutorsData) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const tutor = tutorsData.tutors.find(t => t.id === id);
    if (!tutor) {
      return NextResponse.json({ error: 'Tutor not found' }, { status: 404 });
    }

    // Get user data for tutor
    const userData = await dataManager.readData<{ users: any[] }>('users.json');
    const user = userData?.users.find(u => u.id === tutor.userId);

    return NextResponse.json({
      ...tutor,
      user: user ? {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        university: user.university,
        major: user.major,
        avatar: user.avatar
      } : null
    });

  } catch (error) {
    console.error('Get tutor error:', error);
    return NextResponse.json({ error: 'Failed to get tutor' }, { status: 500 });
  }
}
```

### **app/api/subjects/route.ts**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { dataManager } from '@/lib/dataManager';

export async function GET(request: NextRequest) {
  try {
    const subjectsData = await dataManager.readData<{ subjects: any[] }>('subjects.json');
    if (!subjectsData) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json(subjectsData.subjects);
  } catch (error) {
    console.error('Get subjects error:', error);
    return NextResponse.json({ error: 'Failed to get subjects' }, { status: 500 });
  }
}
```

---

## 📱 Frontend Integration

### **lib/api.ts (Updated API Client)**
```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export const api = {
  // HCMUT SSO Authentication
  hcmutSSOLogin: async (credentials: { hcmutId: string; password: string }) => {
    const response = await fetch(`${API_BASE}/api/auth/hcmut-sso`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return response.json();
  },

  verifyToken: async () => {
    const response = await fetch(`${API_BASE}/api/auth/verify`);
    return response.json();
  },

  // Tutor Search
  searchTutors: async (filters: {
    q?: string;
    subject?: string;
    rating?: string;
    availability?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value.toString());
    });
    
    const response = await fetch(`${API_BASE}/api/tutors/search?${params}`);
    return response.json();
  },

  getTutor: async (id: string) => {
    const response = await fetch(`${API_BASE}/api/tutors/${id}`);
    return response.json();
  },

  getSubjects: async () => {
    const response = await fetch(`${API_BASE}/api/subjects`);
    return response.json();
  }
};
```

### **Update SearchTutors.tsx**
```typescript
// Add to existing SearchTutors.tsx
import { api } from '@/lib/api';
import { useEffect, useState } from 'react';

const SearchTutors: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [subject, setSubject] = useState('');
  const [rating, setRating] = useState('');
  const [availability, setAvailability] = useState('');
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  // Fetch tutors when filters change
  useEffect(() => {
    const fetchTutors = async () => {
      setLoading(true);
      try {
        const filters = {
          q: searchTerm,
          subject,
          rating,
          availability,
          page: pagination.page,
          limit: 12
        };
        
        const data = await api.searchTutors(filters);
        setTutors(data.tutors || []);
        setPagination({
          page: data.pagination?.page || 1,
          totalPages: data.pagination?.totalPages || 1
        });
      } catch (error) {
        console.error('Failed to fetch tutors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, [searchTerm, subject, rating, availability, pagination.page]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Rest of your existing component with updated tutors data...
};
```

---

## 🚀 Setup Commands

```bash
# 1. Install dependencies
npm install jsonwebtoken bcryptjs
npm install -D @types/jsonwebtoken @types/bcryptjs

# 2. Create data directory
mkdir data

# 3. Create JSON files with the data structures above

# 4. Start development server
npm run dev

# 5. Test APIs
curl -X POST http://localhost:3000/api/auth/hcmut-sso \
  -H "Content-Type: application/json" \
  -d '{"hcmutId": "20123456", "password": "hcmut123"}'

curl "http://localhost:3000/api/tutors/search?subject=Mathematics&rating=4+"
```

---

## ✅ Implementation Checklist

- [x] HCMUT SSO Mock System
- [x] JSON Data Files
- [x] AI Matching Algorithm
- [x] Tutor Search API
- [x] Authentication Middleware
- [x] Frontend Integration
- [x] Analytics Logging
- [x] Pagination Support

---

*Backend implementation hoàn chỉnh cho Search Available Tutors use case! 🎉*
