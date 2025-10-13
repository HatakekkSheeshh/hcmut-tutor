# 🚀 HCMUT Tutor - Backend Development Roadmap

## 📋 Tổng quan dự án

Dự án HCMUT Tutor là một nền tảng học tập trực tuyến với 3 vai trò chính:
- **Student**: Học viên đặt lịch học, theo dõi tiến độ
- **Tutor**: Giảng viên quản lý lịch dạy, theo dõi học viên  
- **Management**: Quản lý hệ thống, phê duyệt, báo cáo

## 🎯 Mục tiêu Backend

Tạo một RESTful API hoàn chỉnh để:
- Xác thực và phân quyền người dùng
- Quản lý dữ liệu học tập và giảng dạy
- Tích hợp thanh toán và thông báo
- Hỗ trợ real-time communication

---

## 🛠️ Tech Stack Đề xuất

### **Option 1: Node.js + Express (Khuyến nghị cho người mới)**

```yaml
Backend Framework: Node.js + Express.js
Database: PostgreSQL + Prisma ORM
Authentication: JWT + Passport.js
Real-time: Socket.io
File Storage: AWS S3 / Cloudinary
Email: SendGrid / Nodemailer
Payment: Stripe / PayPal
Deployment: Railway / Render / DigitalOcean
```

**Ưu điểm:**
- ✅ Dễ học, tài liệu phong phú
- ✅ Cộng đồng lớn, nhiều package
- ✅ Tương thích tốt với React frontend
- ✅ Chi phí hosting thấp

### **Option 2: Python + FastAPI (Hiệu suất cao)**

```yaml
Backend Framework: Python + FastAPI
Database: PostgreSQL + SQLAlchemy
Authentication: JWT + OAuth2
Real-time: WebSockets
File Storage: AWS S3
Email: SendGrid
Payment: Stripe
Deployment: Railway / Render
```

**Ưu điểm:**
- ✅ Hiệu suất cao, tự động generate API docs
- ✅ Type hints, code quality tốt
- ✅ Machine Learning integration dễ dàng

### **Option 3: Next.js Full-Stack (All-in-One)**

```yaml
Framework: Next.js 14 (App Router)
Database: PostgreSQL + Prisma
Authentication: NextAuth.js
Real-time: Server-Sent Events
File Storage: Vercel Blob
Email: Resend
Payment: Stripe
Deployment: Vercel
```

**Ưu điểm:**
- ✅ Cùng tech stack với frontend
- ✅ Server Actions, không cần API routes
- ✅ Deploy dễ dàng trên Vercel

---

## 📊 Database Schema

### **Core Entities**

```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role ENUM('student', 'tutor', 'admin') NOT NULL,
  avatar_url VARCHAR(500),
  phone VARCHAR(20),
  university VARCHAR(200),
  major VARCHAR(100),
  graduation_year INTEGER,
  bio TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Subjects Table
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sessions Table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id),
  tutor_id UUID REFERENCES users(id),
  subject_id UUID REFERENCES subjects(id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP NOT NULL,
  duration_minutes INTEGER NOT NULL,
  session_type ENUM('online', 'offline') NOT NULL,
  meeting_link VARCHAR(500),
  location VARCHAR(200),
  status ENUM('scheduled', 'ongoing', 'completed', 'cancelled') DEFAULT 'scheduled',
  price DECIMAL(10,2),
  payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Reviews Table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id),
  reviewer_id UUID REFERENCES users(id),
  reviewee_id UUID REFERENCES users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info', 'warning', 'success', 'error') DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔄 API Endpoints Structure

### **Authentication & Users**

```typescript
// Authentication
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/forgot-password
POST   /api/auth/reset-password

// SSO Integration
GET    /api/auth/google
GET    /api/auth/facebook
GET    /api/auth/microsoft

// User Management
GET    /api/users/profile
PUT    /api/users/profile
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
```

### **Sessions & Booking**

```typescript
// Session Management
GET    /api/sessions
POST   /api/sessions
GET    /api/sessions/:id
PUT    /api/sessions/:id
DELETE /api/sessions/:id

// Booking Flow
GET    /api/sessions/available
POST   /api/sessions/book
PUT    /api/sessions/:id/cancel
PUT    /api/sessions/:id/reschedule

// Tutor Availability
GET    /api/tutors/:id/availability
POST   /api/tutors/:id/availability
PUT    /api/tutors/:id/availability/:slotId
DELETE /api/tutors/:id/availability/:slotId
```

### **Search & Discovery**

```typescript
// Tutor Search
GET    /api/tutors/search
GET    /api/tutors/:id
GET    /api/tutors/:id/reviews

// Subject Management
GET    /api/subjects
POST   /api/subjects
GET    /api/subjects/:id
PUT    /api/subjects/:id
DELETE /api/subjects/:id
```

### **Progress & Analytics**

```typescript
// Student Progress
GET    /api/students/:id/progress
GET    /api/students/:id/sessions
GET    /api/students/:id/achievements

// Tutor Analytics
GET    /api/tutors/:id/analytics
GET    /api/tutors/:id/students
GET    /api/tutors/:id/earnings

// Management Reports
GET    /api/admin/analytics
GET    /api/admin/users
GET    /api/admin/sessions
GET    /api/admin/revenue
```

### **Communication**

```typescript
// Notifications
GET    /api/notifications
POST   /api/notifications
PUT    /api/notifications/:id/read
DELETE /api/notifications/:id

// Chat Support
GET    /api/chat/messages
POST   /api/chat/messages
GET    /api/chat/support
```

### **Payment & Billing**

```typescript
// Payment Processing
POST   /api/payments/create-intent
POST   /api/payments/confirm
GET    /api/payments/history

// Credits & Rewards
GET    /api/credits/balance
POST   /api/credits/purchase
POST   /api/credits/transfer
```

---

## 🏗️ Implementation Roadmap

### **Phase 1: Foundation (Tuần 1-2)**

#### **Week 1: Project Setup**
```bash
# 1. Initialize Backend Project
mkdir hcmut-tutor-backend
cd hcmut-tutor-backend
npm init -y

# 2. Install Core Dependencies
npm install express cors helmet morgan dotenv
npm install -D nodemon @types/node typescript ts-node

# 3. Setup Database
npm install prisma @prisma/client
npx prisma init

# 4. Setup Authentication
npm install jsonwebtoken bcryptjs passport passport-jwt
npm install -D @types/jsonwebtoken @types/bcryptjs @types/passport-jwt
```

#### **Week 2: Database & Basic Auth**
- [ ] Setup PostgreSQL database
- [ ] Design and implement database schema
- [ ] Create Prisma models and migrations
- [ ] Implement user registration/login
- [ ] Setup JWT authentication middleware
- [ ] Create basic user management APIs

### **Phase 2: Core Features (Tuần 3-4)**

#### **Week 3: Session Management**
- [ ] Implement session CRUD operations
- [ ] Create booking system
- [ ] Add tutor availability management
- [ ] Implement session status tracking
- [ ] Add session search and filtering

#### **Week 4: User Roles & Permissions**
- [ ] Implement role-based access control
- [ ] Create student-specific APIs
- [ ] Create tutor-specific APIs
- [ ] Create admin management APIs
- [ ] Add user profile management

### **Phase 3: Advanced Features (Tuần 5-6)**

#### **Week 5: Communication & Notifications**
- [ ] Setup Socket.io for real-time features
- [ ] Implement notification system
- [ ] Add chat support functionality
- [ ] Create email notification service
- [ ] Add push notification support

#### **Week 6: Payment Integration**
- [ ] Integrate Stripe payment gateway
- [ ] Implement credit system
- [ ] Add payment history tracking
- [ ] Create refund management
- [ ] Add earnings tracking for tutors

### **Phase 4: Analytics & Optimization (Tuần 7-8)**

#### **Week 7: Analytics & Reporting**
- [ ] Implement progress tracking
- [ ] Create analytics dashboard APIs
- [ ] Add session performance metrics
- [ ] Create revenue reporting
- [ ] Add user engagement analytics

#### **Week 8: Testing & Deployment**
- [ ] Write comprehensive tests
- [ ] Setup CI/CD pipeline
- [ ] Deploy to production
- [ ] Performance optimization
- [ ] Security audit and fixes

---

## 🛡️ Security Best Practices

### **Authentication & Authorization**
```typescript
// JWT Token Structure
interface JWTPayload {
  userId: string;
  email: string;
  role: 'student' | 'tutor' | 'admin';
  iat: number;
  exp: number;
}

// Role-based Middleware
const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

### **Data Validation**
```typescript
// Input Validation with Joi
const sessionSchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  description: Joi.string().max(1000),
  scheduled_at: Joi.date().greater('now').required(),
  duration_minutes: Joi.number().min(30).max(480).required(),
  session_type: Joi.string().valid('online', 'offline').required()
});
```

### **Rate Limiting**
```typescript
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later'
});
```

---

## 🚀 Deployment Strategy

### **Development Environment**
```yaml
Database: PostgreSQL (Docker)
Backend: Node.js (Local)
Frontend: React (Local)
```

### **Staging Environment**
```yaml
Database: PostgreSQL (Railway)
Backend: Node.js (Railway)
Frontend: React (Vercel)
Domain: staging.hcmut-tutor.com
```

### **Production Environment**
```yaml
Database: PostgreSQL (AWS RDS)
Backend: Node.js (Railway/DigitalOcean)
Frontend: React (Vercel)
CDN: Cloudflare
Domain: hcmut-tutor.com
```

---

## 📚 Learning Resources

### **Node.js + Express**
- [Express.js Official Docs](https://expressjs.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Prisma Documentation](https://www.prisma.io/docs/)

### **Database Design**
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)
- [Database Design Patterns](https://www.vertabelo.com/blog/database-design-patterns/)

### **Authentication & Security**
- [JWT.io](https://jwt.io/)
- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)

### **Testing**
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest for API Testing](https://github.com/visionmedia/supertest)

---

## 🎯 Success Metrics

### **Technical Metrics**
- [ ] API response time < 200ms
- [ ] 99.9% uptime
- [ ] Zero security vulnerabilities
- [ ] 90%+ test coverage

### **Business Metrics**
- [ ] Support 1000+ concurrent users
- [ ] Process 100+ sessions per day
- [ ] Handle $10,000+ in transactions monthly
- [ ] Maintain 4.5+ user rating

---

## 🔄 Next Steps

1. **Choose Tech Stack**: Quyết định giữa Node.js, Python, hoặc Next.js
2. **Setup Development Environment**: Cài đặt tools và dependencies
3. **Design Database Schema**: Tạo ERD và implement với Prisma
4. **Start with Authentication**: Implement user registration/login
5. **Build Core APIs**: Session management, booking system
6. **Add Advanced Features**: Real-time, payments, analytics
7. **Testing & Deployment**: Comprehensive testing và production deployment

---

## 📞 Support & Community

- **GitHub Repository**: [hcmut-tutor-backend](https://github.com/your-username/hcmut-tutor-backend)
- **Documentation**: [API Docs](https://api.hcmut-tutor.com/docs)
- **Discord Community**: [HCMUT Tutor Devs](https://discord.gg/hcmut-tutor)
- **Email Support**: dev@hcmut-tutor.com

---

*Cập nhật lần cuối: Tháng 1, 2024*
*Phiên bản: 1.0.0*
