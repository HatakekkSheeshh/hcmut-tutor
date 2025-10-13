# 🚀 HCMUT Tutor - Simple Backend với JSON Data

## 🎯 Mục tiêu
Tạo backend đơn giản sử dụng JSON files làm database, phù hợp cho:
- ✅ Prototype nhanh
- ✅ Học backend cơ bản
- ✅ Không cần setup database phức tạp
- ✅ Deploy dễ dàng

---

## 🛠️ Tech Stack Đơn giản

```yaml
Backend: Node.js + Express.js
Data Storage: JSON Files
Authentication: JWT (Simple)
File Upload: Multer
CORS: Enable cho Frontend
Deployment: Railway / Render
```

---

## 📁 Project Structure

```
hcmut-tutor-backend/
├── src/
│   ├── controllers/          # API Logic
│   ├── middleware/           # Auth, Validation
│   ├── routes/              # API Routes
│   ├── services/            # Business Logic
│   └── utils/               # Helper Functions
├── data/                    # JSON Data Files
│   ├── users.json
│   ├── sessions.json
│   ├── subjects.json
│   └── notifications.json
├── uploads/                 # File Uploads
├── package.json
├── server.js               # Entry Point
└── .env
```

---

## 📊 JSON Data Structure

### **data/users.json**
```json
{
  "users": [
    {
      "id": "1",
      "email": "student@hcmut.edu.vn",
      "password": "hashed_password_here",
      "firstName": "Nguyễn",
      "lastName": "Văn A",
      "role": "student",
      "university": "HCMUT",
      "major": "Computer Science",
      "avatar": "/uploads/avatar1.jpg",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": "2",
      "email": "tutor@hcmut.edu.vn",
      "password": "hashed_password_here",
      "firstName": "Trần",
      "lastName": "Thị B",
      "role": "tutor",
      "university": "HCMUT",
      "major": "Mathematics",
      "specialties": ["Calculus", "Algebra", "Statistics"],
      "rating": 4.8,
      "pricePerHour": 50,
      "avatar": "/uploads/avatar2.jpg",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### **data/sessions.json**
```json
{
  "sessions": [
    {
      "id": "1",
      "studentId": "1",
      "tutorId": "2",
      "subjectId": "1",
      "title": "Calculus Fundamentals",
      "description": "Basic calculus concepts and applications",
      "scheduledAt": "2024-01-15T10:00:00Z",
      "duration": 60,
      "type": "online",
      "meetingLink": "https://meet.google.com/abc-defg-hij",
      "status": "scheduled",
      "price": 50,
      "paymentStatus": "pending",
      "createdAt": "2024-01-10T00:00:00Z"
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
      "description": "Advanced mathematics topics",
      "category": "STEM",
      "tutors": ["2", "3"],
      "createdAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": "2",
      "name": "Physics",
      "description": "Physics fundamentals and applications",
      "category": "STEM",
      "tutors": ["4"],
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### **data/notifications.json**
```json
{
  "notifications": [
    {
      "id": "1",
      "userId": "1",
      "title": "Session Booked",
      "message": "Your session with Dr. Smith has been confirmed",
      "type": "success",
      "isRead": false,
      "createdAt": "2024-01-10T00:00:00Z"
    }
  ]
}
```

---

## 🚀 Setup Project

### **1. Initialize Project**
```bash
# Tạo thư mục backend
mkdir hcmut-tutor-backend
cd hcmut-tutor-backend

# Initialize npm
npm init -y

# Install dependencies
npm install express cors helmet morgan dotenv jsonwebtoken bcryptjs multer
npm install -D nodemon @types/node typescript ts-node
```

### **2. Create package.json scripts**
```json
{
  "scripts": {
    "start": "node dist/server.js",
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "test": "jest"
  }
}
```

### **3. Setup TypeScript**
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

---

## 🔧 Core Implementation

### **server.js (Entry Point)**
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const sessionRoutes = require('./routes/sessions');
const subjectRoutes = require('./routes/subjects');
const notificationRoutes = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

### **utils/dataManager.js (JSON Data Handler)**
```javascript
const fs = require('fs').promises;
const path = require('path');

class DataManager {
  constructor(dataDir = './data') {
    this.dataDir = dataDir;
  }

  async readData(filename) {
    try {
      const filePath = path.join(this.dataDir, filename);
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${filename}:`, error);
      return null;
    }
  }

  async writeData(filename, data) {
    try {
      const filePath = path.join(this.dataDir, filename);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Error writing ${filename}:`, error);
      return false;
    }
  }

  async addRecord(filename, record) {
    const data = await this.readData(filename);
    if (!data) return false;

    // Generate ID
    const id = Date.now().toString();
    record.id = id;
    record.createdAt = new Date().toISOString();

    data[Object.keys(data)[0]].push(record);
    return await this.writeData(filename, data);
  }

  async updateRecord(filename, id, updates) {
    const data = await this.readData(filename);
    if (!data) return false;

    const key = Object.keys(data)[0];
    const records = data[key];
    const index = records.findIndex(record => record.id === id);
    
    if (index === -1) return false;

    records[index] = { ...records[index], ...updates, updatedAt: new Date().toISOString() };
    return await this.writeData(filename, data);
  }

  async deleteRecord(filename, id) {
    const data = await this.readData(filename);
    if (!data) return false;

    const key = Object.keys(data)[0];
    data[key] = data[key].filter(record => record.id !== id);
    return await this.writeData(filename, data);
  }
}

module.exports = new DataManager();
```

### **middleware/auth.js**
```javascript
const jwt = require('jsonwebtoken');
const dataManager = require('../utils/dataManager');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from JSON data
    const userData = await dataManager.readData('users.json');
    const user = userData.users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

module.exports = { authenticateToken, requireRole };
```

### **routes/auth.js**
```javascript
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dataManager = require('../utils/dataManager');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const userData = await dataManager.readData('users.json');
    const user = userData.users.find(u => u.email === email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // In real app, compare hashed password
    // const validPassword = await bcrypt.compare(password, user.password);
    // For demo, just check if password matches
    if (password !== 'password123') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
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
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, university, major } = req.body;

    const userData = await dataManager.readData('users.json');
    const existingUser = userData.users.find(u => u.email === email);

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const newUser = {
      email,
      password: await bcrypt.hash(password, 10),
      firstName,
      lastName,
      role: role || 'student',
      university,
      major,
      isActive: true
    };

    const success = await dataManager.addRecord('users.json', newUser);
    
    if (success) {
      res.status(201).json({ message: 'User created successfully' });
    } else {
      res.status(500).json({ error: 'Failed to create user' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

module.exports = router;
```

### **routes/sessions.js**
```javascript
const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const dataManager = require('../utils/dataManager');

const router = express.Router();

// Get all sessions (with filters)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, type, studentId, tutorId } = req.query;
    const sessionData = await dataManager.readData('sessions.json');
    let sessions = sessionData.sessions;

    // Apply filters
    if (status) sessions = sessions.filter(s => s.status === status);
    if (type) sessions = sessions.filter(s => s.type === type);
    if (studentId) sessions = sessions.filter(s => s.studentId === studentId);
    if (tutorId) sessions = sessions.filter(s => s.tutorId === tutorId);

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Create new session
router.post('/', authenticateToken, async (req, res) => {
  try {
    const sessionData = req.body;
    sessionData.studentId = req.user.id;
    sessionData.status = 'scheduled';
    sessionData.paymentStatus = 'pending';

    const success = await dataManager.addRecord('sessions.json', sessionData);
    
    if (success) {
      res.status(201).json({ message: 'Session created successfully' });
    } else {
      res.status(500).json({ error: 'Failed to create session' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Update session
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const success = await dataManager.updateRecord('sessions.json', id, updates);
    
    if (success) {
      res.json({ message: 'Session updated successfully' });
    } else {
      res.status(404).json({ error: 'Session not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update session' });
  }
});

module.exports = router;
```

---

## 🔧 Environment Setup

### **.env file**
```env
PORT=3001
JWT_SECRET=your_super_secret_jwt_key_here
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

---

## 🚀 Quick Start Commands

```bash
# 1. Setup project
npm init -y
npm install express cors helmet morgan dotenv jsonwebtoken bcryptjs multer
npm install -D nodemon

# 2. Create data directory and JSON files
mkdir data
# Copy JSON data structures above

# 3. Start development server
npm run dev

# 4. Test API
curl http://localhost:3001/api/health
```

---

## 📱 Frontend Integration

### **Update Frontend API calls**
```javascript
// utils/api.js
const API_BASE = 'http://localhost:3001/api';

export const api = {
  // Auth
  login: (credentials) => fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  }),
  
  // Sessions
  getSessions: (token) => fetch(`${API_BASE}/sessions`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }),
  
  createSession: (sessionData, token) => fetch(`${API_BASE}/sessions`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(sessionData)
  })
};
```

---

## 🎯 Advantages của JSON Approach

### **✅ Pros:**
- **Đơn giản**: Không cần setup database
- **Nhanh**: Prototype và test ngay lập tức
- **Portable**: Dễ backup và migrate
- **Learning**: Tập trung vào API logic thay vì database

### **⚠️ Cons:**
- **Performance**: Chậm hơn database thật
- **Concurrency**: Không handle được nhiều user cùng lúc
- **Scalability**: Không scale được
- **Data Integrity**: Không có constraints

---

## 🚀 Next Steps

1. **Implement JSON Backend** theo guide trên
2. **Test API** với Postman/Thunder Client
3. **Connect Frontend** với backend APIs
4. **Add more features** (file upload, real-time, etc.)
5. **Migrate to Database** khi cần thiết

---

*Perfect cho learning và prototyping! 🎉*
