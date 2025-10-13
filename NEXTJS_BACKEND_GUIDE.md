# 🚀 HCMUT Tutor - Next.js Full-Stack với JSON Data

## 🎯 Mục tiêu
Tạo backend sử dụng **Next.js API Routes** + JSON files, cùng tech stack với frontend:
- ✅ Cùng ngôn ngữ TypeScript/JavaScript
- ✅ Không cần setup Express riêng
- ✅ Deploy cùng với frontend trên Vercel
- ✅ Server Actions cho real-time updates

---

## 🛠️ Tech Stack Next.js

```yaml
Framework: Next.js 14 (App Router)
API: Next.js API Routes + Server Actions
Data Storage: JSON Files
Authentication: NextAuth.js + JWT
File Upload: Next.js API Routes
Real-time: Server-Sent Events
Deployment: Vercel (All-in-One)
```

---

## 📁 Project Structure

```
hcmut-tutor/                    # Current Frontend Project
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── auth/
│   │   │   ├── sessions/
│   │   │   ├── users/
│   │   │   └── subjects/
│   │   ├── (auth)/            # Auth Pages
│   │   ├── student/           # Student Pages
│   │   ├── tutor/             # Tutor Pages
│   │   └── management/        # Management Pages
│   ├── components/            # Existing Components
│   ├── lib/                   # Utilities & Data Manager
│   └── types/                 # TypeScript Types
├── data/                      # JSON Data Files
│   ├── users.json
│   ├── sessions.json
│   ├── subjects.json
│   └── notifications.json
├── public/
├── package.json
└── next.config.js
```

---

## 🚀 Setup Next.js Backend

### **1. Update package.json**
```json
{
  "name": "hcmut-tutor",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "next-auth": "^4.24.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "multer": "^1.4.5-lts.1",
    "@types/jsonwebtoken": "^9.0.0",
    "@types/bcryptjs": "^2.4.0",
    "@types/multer": "^1.4.0"
  }
}
```

### **2. Create Next.js API Routes Structure**

#### **lib/dataManager.ts (JSON Data Handler)**
```typescript
import fs from 'fs/promises';
import path from 'path';

export class DataManager {
  private dataDir: string;

  constructor(dataDir = './data') {
    this.dataDir = dataDir;
  }

  async readData<T>(filename: string): Promise<T | null> {
    try {
      const filePath = path.join(this.dataDir, filename);
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${filename}:`, error);
      return null;
    }
  }

  async writeData<T>(filename: string, data: T): Promise<boolean> {
    try {
      const filePath = path.join(this.dataDir, filename);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Error writing ${filename}:`, error);
      return false;
    }
  }

  async addRecord<T extends { id?: string; createdAt?: string }>(
    filename: string, 
    record: Omit<T, 'id' | 'createdAt'>
  ): Promise<boolean> {
    const data = await this.readData<Record<string, T[]>>(filename);
    if (!data) return false;

    const key = Object.keys(data)[0];
    const id = Date.now().toString();
    const newRecord = {
      ...record,
      id,
      createdAt: new Date().toISOString()
    } as T;

    data[key].push(newRecord);
    return await this.writeData(filename, data);
  }

  async updateRecord<T extends { id: string }>(
    filename: string, 
    id: string, 
    updates: Partial<T>
  ): Promise<boolean> {
    const data = await this.readData<Record<string, T[]>>(filename);
    if (!data) return false;

    const key = Object.keys(data)[0];
    const records = data[key];
    const index = records.findIndex(record => record.id === id);
    
    if (index === -1) return false;

    records[index] = { 
      ...records[index], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    } as T;
    
    return await this.writeData(filename, data);
  }

  async deleteRecord<T extends { id: string }>(
    filename: string, 
    id: string
  ): Promise<boolean> {
    const data = await this.readData<Record<string, T[]>>(filename);
    if (!data) return false;

    const key = Object.keys(data)[0];
    data[key] = data[key].filter(record => record.id !== id);
    return await this.writeData(filename, data);
  }
}

export const dataManager = new DataManager();
```

#### **types/index.ts (TypeScript Types)**
```typescript
export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'tutor' | 'admin';
  university?: string;
  major?: string;
  specialties?: string[];
  rating?: number;
  pricePerHour?: number;
  avatar?: string;
  isActive: boolean;
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

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password'>;
}
```

---

## 🔐 Authentication Setup

### **lib/auth.ts (JWT Helper)**
```typescript
import jwt from 'jsonwebtoken';
import { User } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export const generateToken = (user: User): string => {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
};

export const hashPassword = async (password: string): Promise<string> => {
  const bcrypt = await import('bcryptjs');
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(password, hash);
};
```

### **middleware.ts (Next.js Middleware)**
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  
  // Protect API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    if (!token && !request.nextUrl.pathname.startsWith('/api/auth/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/student') || 
      request.nextUrl.pathname.startsWith('/tutor') ||
      request.nextUrl.pathname.startsWith('/management')) {
    if (!token) {
      return NextResponse.redirect(new URL('/common', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/student/:path*', '/tutor/:path*', '/management/:path*']
};
```

---

## 🔗 API Routes Implementation

### **app/api/auth/login/route.ts**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { dataManager } from '@/lib/dataManager';
import { generateToken, comparePassword } from '@/lib/auth';
import { User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const userData = await dataManager.readData<{ users: User[] }>('users.json');
    if (!userData) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const user = userData.users.find(u => u.email === email);
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // For demo, use simple password check
    // In production: const validPassword = await comparePassword(password, user.password);
    if (password !== 'password123') {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = generateToken(user);

    const response = NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar
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
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
```

### **app/api/auth/register/route.ts**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { dataManager } from '@/lib/dataManager';
import { hashPassword } from '@/lib/auth';
import { User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, role, university, major } = await request.json();

    const userData = await dataManager.readData<{ users: User[] }>('users.json');
    if (!userData) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const existingUser = userData.users.find(u => u.email === email);
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const newUser = {
      email,
      password: await hashPassword(password),
      firstName,
      lastName,
      role: role || 'student',
      university,
      major,
      isActive: true
    };

    const success = await dataManager.addRecord('users.json', newUser);
    
    if (success) {
      return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
    } else {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
```

### **app/api/sessions/route.ts**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { dataManager } from '@/lib/dataManager';
import { verifyToken } from '@/lib/auth';
import { Session } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const studentId = searchParams.get('studentId');
    const tutorId = searchParams.get('tutorId');

    const sessionData = await dataManager.readData<{ sessions: Session[] }>('sessions.json');
    if (!sessionData) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    let sessions = sessionData.sessions;

    // Apply filters
    if (status) sessions = sessions.filter(s => s.status === status);
    if (type) sessions = sessions.filter(s => s.type === type);
    if (studentId) sessions = sessions.filter(s => s.studentId === studentId);
    if (tutorId) sessions = sessions.filter(s => s.tutorId === tutorId);

    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const sessionData = await request.json();
    sessionData.studentId = decoded.userId;
    sessionData.status = 'scheduled';
    sessionData.paymentStatus = 'pending';

    const success = await dataManager.addRecord('sessions.json', sessionData);
    
    if (success) {
      return NextResponse.json({ message: 'Session created successfully' }, { status: 201 });
    } else {
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
```

### **app/api/sessions/[id]/route.ts**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { dataManager } from '@/lib/dataManager';
import { verifyToken } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { id } = params;
    const updates = await request.json();

    const success = await dataManager.updateRecord('sessions.json', id, updates);
    
    if (success) {
      return NextResponse.json({ message: 'Session updated successfully' });
    } else {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { id } = params;
    const success = await dataManager.deleteRecord('sessions.json', id);
    
    if (success) {
      return NextResponse.json({ message: 'Session deleted successfully' });
    } else {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
  }
}
```

---

## 🎯 Server Actions (Next.js 14)

### **lib/actions.ts (Server Actions)**
```typescript
'use server';

import { dataManager } from '@/lib/dataManager';
import { Session, User } from '@/types';

export async function createSession(formData: FormData) {
  const sessionData = {
    tutorId: formData.get('tutorId') as string,
    subjectId: formData.get('subjectId') as string,
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    scheduledAt: formData.get('scheduledAt') as string,
    duration: parseInt(formData.get('duration') as string),
    type: formData.get('type') as 'online' | 'offline',
    price: parseFloat(formData.get('price') as string)
  };

  const success = await dataManager.addRecord('sessions.json', sessionData);
  return { success, message: success ? 'Session created' : 'Failed to create session' };
}

export async function updateSessionStatus(sessionId: string, status: string) {
  const success = await dataManager.updateRecord('sessions.json', sessionId, { status });
  return { success, message: success ? 'Session updated' : 'Failed to update session' };
}

export async function getUserSessions(userId: string, role: string) {
  const sessionData = await dataManager.readData<{ sessions: Session[] }>('sessions.json');
  if (!sessionData) return [];

  if (role === 'student') {
    return sessionData.sessions.filter(s => s.studentId === userId);
  } else if (role === 'tutor') {
    return sessionData.sessions.filter(s => s.tutorId === userId);
  }
  
  return sessionData.sessions;
}
```

---

## 📱 Frontend Integration

### **lib/api.ts (API Client)**
```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export const api = {
  // Auth
  login: async (credentials: { email: string; password: string }) => {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return response.json();
  },

  register: async (userData: any) => {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  },

  // Sessions
  getSessions: async (filters?: Record<string, string>) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE}/api/sessions?${params}`);
    return response.json();
  },

  createSession: async (sessionData: any) => {
    const response = await fetch(`${API_BASE}/api/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionData)
    });
    return response.json();
  },

  updateSession: async (id: string, updates: any) => {
    const response = await fetch(`${API_BASE}/api/sessions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return response.json();
  }
};
```

### **Update existing components to use API**

#### **Example: StudentDashboard.tsx**
```typescript
// Add to existing StudentDashboard.tsx
import { api } from '@/lib/api';
import { useEffect, useState } from 'react';

const StudentDashboard: React.FC = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await api.getSessions({ studentId: '1' });
        setSessions(data);
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  // Rest of your existing component...
};
```

---

## 🚀 Environment Setup

### **.env.local**
```env
JWT_SECRET=your_super_secret_jwt_key_here
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
```

### **next.config.js**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig
```

---

## 🎯 Advantages của Next.js Approach

### **✅ Pros:**
- **Same Language**: Cùng TypeScript với frontend
- **Unified Deployment**: Deploy cùng một project
- **Server Actions**: Real-time updates không cần API calls
- **Built-in Optimization**: Next.js tự optimize
- **Type Safety**: End-to-end TypeScript

### **⚠️ Cons:**
- **Learning Curve**: Cần học Next.js App Router
- **Vercel Lock-in**: Tối ưu cho Vercel deployment
- **File-based Routing**: API routes theo file structure

---

## 🚀 Quick Start Commands

```bash
# 1. Install dependencies
npm install next-auth jsonwebtoken bcryptjs multer
npm install -D @types/jsonwebtoken @types/bcryptjs @types/multer

# 2. Create data directory and JSON files
mkdir data
# Copy JSON data structures from SIMPLE_BACKEND_GUIDE.md

# 3. Start development server
npm run dev

# 4. Test API
curl http://localhost:3000/api/health
```

---

## 🎯 Next Steps

1. **Setup Next.js API Routes** theo guide trên
2. **Create JSON data files** trong thư mục `data/`
3. **Update existing components** để sử dụng API
4. **Add Server Actions** cho real-time features
5. **Deploy to Vercel** - tất cả trong một project!

---

*Perfect cho full-stack development với cùng tech stack! 🎉*
