# 🔍 Use Case Analysis: Search Available Tutors (UC-St1)

## 📋 Use Case Overview

**Use Case ID:** UC-St1  
**Use Case Name:** Search Available Tutors  
**Primary Actor:** Student (A1)  
**Secondary Actors:** HCMUT_SSO (A8)  

---

## ✅ Frontend Implementation Analysis

### **Current Status: PARTIALLY IMPLEMENTED** 

#### **✅ What's Working in Frontend:**

1. **Search Interface** ✅
   - Search bar with placeholder text
   - Filter options (Subject, Rating, Availability)
   - Clean, responsive UI design

2. **Filter System** ✅
   - Subject dropdown (Mathematics, Physics, Chemistry, etc.)
   - Rating filter (4+, 4.5+, 5 stars)
   - Availability filter (Available Now, Today, This Week)
   - Real-time filter state management

3. **Results Display** ✅
   - Tutor cards with comprehensive information
   - Rating display with stars
   - Price, location, availability status
   - Specialties tags
   - Action buttons (View Profile, Book Session)

4. **UI/UX Features** ✅
   - Responsive design (mobile/desktop)
   - Dark/Light theme support
   - Pagination controls (UI ready)
   - Search tips and help section

#### **❌ What's Missing/Not Working:**

1. **No Backend Integration** ❌
   - All data is hardcoded mock data
   - No API calls to fetch real tutors
   - Filters don't actually filter data
   - Search functionality is non-functional

2. **No Authentication** ❌
   - No HCMUT_SSO integration
   - No user session management
   - No role-based access control

3. **No AI Matching** ❌
   - No AI algorithm for tutor matching
   - No ranking based on student preferences
   - No personalized recommendations

4. **No Data Persistence** ❌
   - No search history saving
   - No analytics logging
   - No search criteria persistence

---

## 🎯 Backend Requirements Analysis

### **Required APIs for Full Implementation:**

#### **1. Authentication APIs**
```typescript
POST /api/auth/hcmut-sso/login
GET  /api/auth/verify-token
POST /api/auth/logout
```

#### **2. Tutor Search APIs**
```typescript
GET  /api/tutors/search?subject=math&rating=4+&availability=today
GET  /api/tutors/:id
GET  /api/tutors/:id/availability
GET  /api/tutors/:id/reviews
```

#### **3. Subject & Category APIs**
```typescript
GET  /api/subjects
GET  /api/subjects/:id/tutors
GET  /api/categories
```

#### **4. AI Matching APIs**
```typescript
POST /api/ai/match-tutors
GET  /api/ai/recommendations/:studentId
```

#### **5. Analytics APIs**
```typescript
POST /api/analytics/search-log
GET  /api/analytics/search-history/:userId
```

---

## 🗄️ Database Schema Requirements

### **Core Tables Needed:**

```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  role ENUM('student', 'tutor', 'admin'),
  hcmut_id VARCHAR(50) UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  university VARCHAR(200),
  major VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tutors Table (extends users)
CREATE TABLE tutors (
  id UUID PRIMARY KEY REFERENCES users(id),
  specialties TEXT[],
  rating DECIMAL(3,2),
  total_reviews INTEGER DEFAULT 0,
  price_per_hour DECIMAL(10,2),
  experience_years INTEGER,
  bio TEXT,
  is_verified BOOLEAN DEFAULT FALSE
);

-- Subjects Table
CREATE TABLE subjects (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  description TEXT
);

-- Tutor Subjects (Many-to-Many)
CREATE TABLE tutor_subjects (
  tutor_id UUID REFERENCES tutors(id),
  subject_id UUID REFERENCES subjects(id),
  PRIMARY KEY (tutor_id, subject_id)
);

-- Availability Table
CREATE TABLE tutor_availability (
  id UUID PRIMARY KEY,
  tutor_id UUID REFERENCES tutors(id),
  day_of_week INTEGER, -- 0=Sunday, 1=Monday, etc.
  start_time TIME,
  end_time TIME,
  is_recurring BOOLEAN DEFAULT TRUE
);

-- Search History Table
CREATE TABLE search_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  search_query TEXT,
  filters JSONB,
  results_count INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🤖 AI Matching Algorithm Requirements

### **Matching Criteria:**

1. **Subject Match** (40% weight)
   - Exact subject match
   - Related subjects
   - Specialties alignment

2. **Availability Match** (25% weight)
   - Time slot compatibility
   - Recurring availability
   - Timezone considerations

3. **Rating & Reviews** (20% weight)
   - Overall rating
   - Review sentiment
   - Student feedback

4. **Student Profile** (15% weight)
   - Learning style preferences
   - Academic level
   - Previous tutor experiences

### **AI Implementation:**
```typescript
interface MatchingAlgorithm {
  calculateMatchScore(
    student: StudentProfile,
    tutor: TutorProfile,
    criteria: SearchCriteria
  ): number;
  
  rankTutors(
    tutors: Tutor[],
    student: StudentProfile
  ): RankedTutor[];
}
```

---

## 📊 Implementation Plan

### **Phase 1: Basic Backend (Week 1-2)**
- [ ] Setup Next.js API routes
- [ ] Create JSON data files
- [ ] Implement basic authentication
- [ ] Create tutor search API
- [ ] Connect frontend to backend

### **Phase 2: Advanced Features (Week 3-4)**
- [ ] Implement AI matching algorithm
- [ ] Add search history and analytics
- [ ] Create availability management
- [ ] Add real-time updates

### **Phase 3: Optimization (Week 5-6)**
- [ ] Performance optimization
- [ ] Caching implementation
- [ ] Advanced filtering
- [ ] Mobile optimization

---

## 🚀 Quick Implementation with JSON Backend

### **Immediate Steps:**

1. **Create JSON Data Files:**
```json
// data/tutors.json
{
  "tutors": [
    {
      "id": "1",
      "name": "Dr. Sarah Johnson",
      "email": "sarah.johnson@hcmut.edu.vn",
      "subject": "Mathematics",
      "specialties": ["Calculus", "Algebra", "Statistics"],
      "rating": 4.9,
      "reviews": 127,
      "price": 50,
      "experience": "8 years",
      "location": "Ho Chi Minh City",
      "availability": "Available",
      "nextAvailable": "Today at 2:00 PM",
      "isVerified": true
    }
  ]
}
```

2. **Create Search API:**
```typescript
// app/api/tutors/search/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const subject = searchParams.get('subject');
  const rating = searchParams.get('rating');
  const availability = searchParams.get('availability');
  
  // Filter tutors based on criteria
  // Return paginated results
}
```

3. **Update Frontend:**
```typescript
// Replace mock data with API calls
const fetchTutors = async (filters) => {
  const response = await fetch(`/api/tutors/search?${new URLSearchParams(filters)}`);
  return response.json();
};
```

---

## ✅ Conclusion

### **Current Status:**
- **Frontend:** 80% complete, UI/UX ready
- **Backend:** 0% complete, needs full implementation
- **Integration:** 0% complete, no API connections

### **Recommendation:**
**Start with JSON Backend approach** from `NEXTJS_BACKEND_GUIDE.md` to quickly get the search functionality working, then gradually add advanced features like AI matching and database integration.

### **Estimated Timeline:**
- **Basic functionality:** 1-2 weeks
- **Full AI matching:** 3-4 weeks  
- **Production ready:** 6-8 weeks

---

*The frontend is well-designed and ready for backend integration! 🎉*
