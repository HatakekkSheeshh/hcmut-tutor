# HCMUT Learning Management System

A comprehensive online learning management system with modern interface, built with React + Vite + TypeScript, integrated with Material-UI and Tailwind CSS. The system has been developed to near completion with full features for Students, Tutors, and Management roles.

## Overview

The HCMUT Learning Management System is a full-stack web application designed to facilitate online tutoring and learning management. It provides separate interfaces for students, tutors, and administrative staff, with real-time communication capabilities, comprehensive session management, and advanced administrative features.

## Core Features

### Student Features

- **Dashboard**: Overview of learning progress, session history, personal statistics, and weather widget
- **Search Tutors**: Advanced search and filtering of tutors by subject, rating, availability, and time slots
- **Book Session**: Schedule learning sessions with tutors through a step-by-step wizard (supports individual and group sessions)
- **Session Detail**: Detailed session information including course materials, assignments, quizzes, and grades
- **Evaluate Session**: Post-session evaluation and feedback with comprehensive rating system
- **View Progress**: Track learning progress, goals, and achievements with detailed analytics
- **AI Chatbot**: Intelligent AI chatbot for learning support
- **Messages**: Real-time chat with tutors and other students using WebSocket technology
- **Calendar**: Personal learning calendar with calendar view
- **Sessions List**: Complete list of all sessions with advanced filtering and search capabilities

### Tutor Features

- **Dashboard**: Overview of students, teaching schedule, earnings, and statistics
- **Set Availability**: Manage free time slots, teaching hours, and recurring schedules
- **Manage Sessions**: Comprehensive session management including editing information and viewing details
- **Tutor Session Detail**: Detailed session view with course contents, quizzes, and assignments
- **Handle Cancel/Reschedule**: Process cancellation and rescheduling requests from students
- **Track Student Progress**: Detailed tracking of student progress, strengths, and weaknesses
- **Messages**: Real-time chat with students using WebSocket technology
- **Calendar**: Teaching schedule calendar view
- **Tutor LMS**: Course content management, quiz creation, and assignment management
- **Quiz Results View**: View and analyze student quiz results
- **Assignment Submissions View**: Review and grade student assignment submissions

### Management Features

- **Management Dashboard**: System overview, comprehensive statistics, and alerts
- **Approval Requests**: Approve requests from students and tutors (session changes, resource allocation, content moderation)
- **Reports & Analytics**: Detailed data reports and analytics with performance analysis
- **Award Training Credits**: Manage and award training credits to students
- **User Management**: Comprehensive user management for students, tutors, and management staff
- **Resource Allocation**: Optimize resource allocation (rooms, equipment) with automated optimization
- **Permissions Management**: Manage user access permissions and roles
- **Document Management**: Manage documents and sharing capabilities
- **Community Management**: Manage forum, events, and community resources

### Common Features

- **Login/Register**: JWT-based authentication with email registration and login
- **Profile Management**: Manage personal information, academic details, interests, and avatar
- **Digital Library Access**: Access digital library, learning materials, and search resources
- **Online Community Forum**: Community forum for knowledge sharing with posts and comments
- **Notifications Center**: Notification center with queue-based system (5-minute delay) for managing alerts

## Technology Stack

### Frontend

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 4.5.0 (fast build performance)
- **UI Libraries**: 
  - Material-UI (MUI) v7.2.0 - Icons, Components, Form controls
  - Tailwind CSS 3.3.5 - Styling and responsive design
- **Routing**: React Router DOM v6.20.1
- **State Management**: React Context API with Hooks
- **Theme**: Custom ThemeContext with Dark/Light mode support
- **Icons**: Material-UI Icons (@mui/icons-material)
- **Date Handling**: date-fns v4.1.0
- **Animations**: GSAP v3.13.0 with @gsap/react
- **Charts**: @mui/x-charts v8.14.0
- **Date Pickers**: @mui/x-date-pickers v8.14.1
- **Emoji Picker**: emoji-picker-react v4.15.0
- **Real-time Communication**: Socket.IO Client v4.7.5

### Backend

- **Runtime**: Node.js with TypeScript (tsx)
- **Framework**: Express v5.1.0
- **Authentication**: JWT (jsonwebtoken v9.0.2)
- **Password Hashing**: bcryptjs v3.0.2
- **Storage**: JSON file-based storage system
- **Real-time Communication**: Socket.IO Server v4.7.5
- **CORS**: cors v2.8.5
- **Validation**: zod v4.1.12

### Infrastructure

- **Frontend Hosting**: Vercel (Serverless Functions)
- **WebSocket Server**: Railway/Render (separate server deployment)
- **File Storage**: Vercel Blob Storage (@vercel/blob v2.0.0)

## Project Structure

```
├── src/                          # Frontend source code
│   ├── components/
│   │   ├── ui/                   # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── ...
│   │   ├── EmojiPicker.tsx       # Emoji picker component
│   │   └── DeviceDetector.tsx    # Device detection
│   ├── contexts/
│   │   └── ThemeContext.tsx      # Theme management
│   ├── hooks/
│   │   ├── useLongPolling.ts     # Real-time chat hook
│   │   └── useOnlineStatus.ts    # Online status tracking
│   ├── lib/
│   │   └── api.ts                 # API client
│   ├── pages/
│   │   ├── student/              # Student pages (10+ pages)
│   │   ├── tutor/                # Tutor pages (10+ pages)
│   │   ├── management/           # Management pages (8+ pages)
│   │   └── common/               # Common pages (6 pages)
│   ├── App.tsx                   # Main app with routing
│   ├── main.tsx                  # Entry point
│   └── env.ts                    # Environment configuration
├── routes/                       # Backend API routes
│   ├── auth/                     # Authentication APIs
│   ├── users/                    # User management APIs
│   ├── sessions/                 # Session APIs
│   ├── conversations/            # Chat/Messages APIs
│   ├── notifications/            # Notification APIs
│   ├── forum/                    # Forum APIs
│   ├── library/                  # Library APIs
│   ├── management/               # Management APIs
│   └── ...
├── lib/                          # Backend libraries
│   ├── storage.ts                # JSON file storage
│   ├── middleware.ts             # Authentication middleware
│   ├── notification.ts           # Notification creation
│   ├── services/
│   │   ├── notificationQueue.ts  # Notification queue service
│   │   └── resourceOptimizer.ts  # Resource optimization
│   └── cron/
│       └── notificationCron.ts  # Cron job processor
├── ws-server/                    # WebSocket server
│   └── index.ts                  # Socket.IO server implementation
├── data/                         # JSON data files
│   ├── users.json
│   ├── sessions.json
│   ├── conversations.json
│   ├── messages.json
│   ├── notifications.json
│   └── notification_queue.json
├── docs/                         # Documentation
│   ├── NOTIFICATIONS_SYSTEM.md   # Notification system documentation
│   ├── WEBSOCKET_SETUP.md        # WebSocket setup guide
│   ├── API_DOCS.md               # API reference
│   ├── BACKEND_README.md         # Backend architecture
│   └── ...
├── server.ts                     # Express API server
└── package.json
```

## Design System

### UI/UX Patterns

- **Three-Column Layout**: Sidebar + Main Content + Right Panel (desktop view)
- **Mobile-First Approach**: Responsive design with mobile drawer navigation
- **Consistent Navigation**: Sidebar navigation with quick action buttons
- **Dark/Light Theme**: Theme toggle with persistent user preference
- **Real-time Updates**: WebSocket integration for chat and online status

### Component Architecture

- **Reusable UI Components**: Button, Card, Input, Modal, Table components
- **Theme Integration**: Consistent styling with Tailwind CSS
- **Responsive Design**: Mobile drawer, adaptive layouts for all screen sizes
- **Accessibility**: Keyboard navigation and screen reader support
- **Emoji Picker**: Production-ready emoji picker component (Messenger/Discord style)

## Installation and Setup

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager

### Installation Steps

1. **Clone repository and install dependencies:**
```bash
git clone <repository-url>
cd v1
npm install
```

2. **Configure environment variables:**
Create a `.env` file in the root directory:
```env
# JWT Secret
JWT_SECRET=your-secret-key-here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# WebSocket Server URL (for production)
VITE_WEBSOCKET_URL=wss://your-ws-server.railway.app
```

3. **Start development servers:**

**Terminal 1 - Frontend (Vite):**
```bash
npm run dev
```
Frontend will be available at: `http://localhost:5173`

**Terminal 2 - Backend API (Express):**
```bash
npm run dev:api
# or
npm run api
```
API server will be available at: `http://localhost:3000`

**Terminal 3 - WebSocket Server (Socket.IO):**
```bash
npm run dev:ws
# or
npm run ws
```
WebSocket server will be available at: `http://localhost:3001`

### Development Scripts

```bash
# Frontend
npm run dev              # Start Vite development server
npm run build            # Build for production
npm run preview          # Preview production build

# Backend
npm run api              # Start API server
npm run dev:api          # Start API server with watch mode
npm run ws               # Start WebSocket server
npm run dev:ws           # Start WebSocket server with watch mode

# Database
npm run seed             # Seed initial data
npm run seed:clean       # Clean and reseed data
npm run validate         # Validate data integrity
npm run stats            # Generate data statistics

# Testing
npm test                 # Run all unit tests (Vitest)
npm run test:ui          # Run tests with UI interface
npm run test:coverage    # Run tests with coverage report
npm run test:api         # Test API endpoints
npm run test:management # Test management APIs
```

## Key Features

### Modern UI/UX

- **Consistent Design**: All pages follow the same UI/UX pattern
- **HCMUT Branding**: Unified HCMUT logo across all pages
- **Professional Appearance**: Professional and modern interface design
- **Intuitive Navigation**: User-friendly navigation system
- **Emoji Picker**: Production-ready emoji picker similar to Messenger/Discord

### Responsive Design

- **Mobile-First**: Mobile-optimized design approach
- **Adaptive Layouts**: Automatic adjustment for all device sizes
- **Touch-Friendly**: Optimized for touch interactions
- **Mobile Drawer**: Navigation drawer for mobile devices
- **Mobile Versions**: All pages have dedicated mobile versions

### Dark Mode Support

- **Theme Toggle**: Seamless light/dark theme switching
- **Persistent Preference**: Theme preference saved in localStorage
- **Smooth Transitions**: Smooth theme transition animations
- **Consistent Styling**: Consistent styling across both themes

### Performance Optimization

- **Fast Build**: Vite build tool for rapid development
- **Optimized Bundle**: Optimized bundle size
- **Lazy Loading**: Component lazy loading when needed
- **Code Splitting**: Route-based code splitting

### Real-time Features

- **WebSocket Chat**: Real-time messaging with Socket.IO
- **Online Status**: Track online/offline status of users
- **Message Synchronization**: Synchronized messages between frontend and backend
- **Room-based Messaging**: Conversation-based room management

### Notification System

- **Queue-based**: Delay notifications with queue system (5-minute default delay)
- **Cron Job**: Automatic notification processing every 1 minute
- **Multiple Types**: 12+ different notification types
- **Batch Notifications**: Support for sending to multiple users simultaneously
- **Pagination**: Pagination and filtering support

## Color Palette and Theming

### Light Theme
- **Primary**: Blue (#3B82F6)
- **Secondary**: Gray (#6B7280)
- **Success**: Green (#10B981)
- **Warning**: Orange (#F59E0B)
- **Error**: Red (#EF4444)
- **Background**: Gray-50 (#F9FAFB)
- **Text**: Gray-900 (#111827)

### Dark Theme
- **Primary**: Blue (#60A5FA)
- **Secondary**: Gray (#9CA3AF)
- **Success**: Green (#34D399)
- **Warning**: Orange (#FBBF24)
- **Error**: Red (#F87171)
- **Background**: Gray-900 (#111827)
- **Text**: White (#FFFFFF)

## System Architecture

### User Roles and Permissions

- **Student**: 10+ pages for learning functionality
- **Tutor**: 10+ pages for teaching management
- **Management**: 8+ pages for system administration
- **Common**: 6 pages shared across all roles

### Navigation Structure

```
/student/*          # Student pages
/tutor/*            # Tutor pages  
/management/*       # Management pages
/common/*           # Common screens
```

### Backend API Structure

```
/api/auth/*                    # Authentication endpoints
/api/users/*                   # User management endpoints
/api/sessions/*                # Session management endpoints
/api/conversations/*           # Chat/Messages endpoints
/api/notifications/*           # Notification endpoints
/api/forum/*                   # Forum endpoints
/api/library/*                 # Digital library endpoints
/api/management/*              # Management API endpoints
/api/classes/*                 # Class management endpoints
/api/enrollments/*             # Enrollment management endpoints
/api/session-requests/*        # Session request endpoints
/api/progress/*                # Progress tracking endpoints
/api/evaluations/*             # Evaluation endpoints
/api/availability/*            # Availability management endpoints
/api/rooms/*                   # Room management endpoints
```

## Backend Architecture

### API Server (Express)

- **Port**: 3000 (development environment)
- **Authentication**: JWT-based authentication system
- **Storage**: JSON file-based storage (can be migrated to database)
- **CORS**: Enabled for frontend communication
- **Middleware**: Authentication, Authorization, and Validation middleware

### WebSocket Server (Socket.IO)

- **Port**: 3001 (development environment)
- **Purpose**: Real-time chat and online status tracking
- **Authentication**: JWT token in handshake
- **Features**: 
  - Room-based messaging system
  - Online user tracking
  - Message broadcasting
  - Comprehensive error handling

### Notification System

- **Queue-based**: 5-minute delay (configurable)
- **Cron Job**: Runs every 1 minute to process queue
- **Storage**: 
  - `notifications.json` - Created notifications
  - `notification_queue.json` - Pending jobs awaiting processing
- **Types**: 12+ different notification types

## Testing

The project includes comprehensive unit tests for all API endpoints using Vitest. Tests are organized by feature area and cover authentication, user management, sessions, classes, notifications, conversations, forum, management features, library, progress tracking, and integration scenarios.

### Test Structure

Tests are located in the `testcase/` directory:

```
testcase/
├── 01-authentication.test.ts        # Authentication API tests
├── 02-user-management.test.ts       # User management tests
├── 03-session-management.test.ts    # Session management tests
├── 04-class-enrollment.test.ts      # Class & enrollment tests
├── 05-notifications.test.ts         # Notification system tests
├── 06-conversations.test.ts         # Chat & messaging tests
├── 07-forum.test.ts                 # Forum feature tests
├── 08-management.test.ts            # Management feature tests
├── 09-library-progress.test.ts      # Library & progress tests
└── 10-integration.test.ts           # Integration workflow tests
```

### Running Tests

**Run all tests:**
```bash
npm test
```

**Run tests with UI (interactive):**
```bash
npm run test:ui
```

**Run tests with coverage report:**
```bash
npm run test:coverage
```

**Run specific test file:**
```bash
# Syntax
npx vitest testcase/<file_name>.test.ts

# Example
npx vitest testcase/02-user-management.test.ts
```

**Run tests in watch mode:**
```bash
npx vitest --watch
```

**Run tests matching a pattern:**
```bash
npx vitest --grep "authentication"
```

### Test Coverage

The test suite covers:

- **Authentication**: Login, registration, token refresh, logout (15 test cases)
- **User Management**: CRUD operations, authorization, filtering (18 test cases)
- **Session Management**: Booking, cancellation, rescheduling, conflicts (12 test cases)
- **Class & Enrollment**: Class management, enrollment workflow (10 test cases)
- **Notifications**: Notification delivery, read status, filtering (6 test cases)
- **Conversations**: Chat creation, messaging, file sharing (9 test cases)
- **Forum**: Post creation, comments, moderation (9 test cases)
- **Management**: Approvals, permissions, analytics, credits (12 test cases)
- **Library & Progress**: Resource search, progress tracking, evaluations (10 test cases)
- **Integration**: End-to-end workflows, data consistency (6 test cases)

**Total**: 107+ test cases covering all major features and edge cases.

### Test Configuration

Tests are configured in `vitest.config.ts`:
- **Environment**: Node.js
- **Framework**: Vitest
- **Coverage**: v8 provider with HTML, JSON, and text reports
- **Test Pattern**: `testcase/**/*.test.ts`

### Writing New Tests

When adding new features, follow these patterns:

1. **Create test file** in `testcase/` directory following naming convention
2. **Mock dependencies** using Vitest's `vi.mock()`
3. **Use helper functions** for creating mock requests/responses
4. **Test success cases, error cases, and authorization**
5. **Follow naming convention**: `TC-FEATURE-XXX: Test Description`

Example test structure:
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handlerFunction } from '../routes/feature/handler.js';
import * as storageModule from '../lib/storage.js';

vi.mock('../lib/storage.js', () => ({
  storage: {
    find: vi.fn(),
    findById: vi.fn(),
    // ... other methods
  }
}));

describe('Feature API Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle success case', async () => {
    // Test implementation
  });

  it('should handle error case', async () => {
    // Test implementation
  });
});
```

### Test Best Practices

- ✅ Mock external dependencies (storage, services)
- ✅ Test both success and error scenarios
- ✅ Verify authorization and permissions
- ✅ Test input validation
- ✅ Clean up mocks between tests
- ✅ Use descriptive test names
- ✅ Group related tests with `describe` blocks

## Documentation

Detailed documentation is available in the `docs/` directory:

- **NOTIFICATIONS_SYSTEM.md** - Complete notification system documentation
- **WEBSOCKET_SETUP.md** - WebSocket server setup guide
- **API_DOCS.md** - Complete API reference
- **BACKEND_README.md** - Backend architecture and setup guide
- **CLASS_ENROLLMENT_API_DOCS.md** - Class and Enrollment API documentation
- **DEPLOYMENT.md** - Deployment guide for Vercel
- **FLOW_DOCUMENTATION.md** - System flow and architecture documentation
- **HUONG_DAN_SU_DUNG.md** - User guide
- **QUICK_REFERENCE.md** - Quick reference guide
- **SCHEMAS_REFERENCE.md** - Data schemas reference
- **TYPES_REFERENCE.md** - TypeScript types reference
- **APPROVAL_REQUESTS_SUMMARY.md** - Approval system documentation
- **SESSION_CHANGE_APPROVAL.md** - Session change workflow documentation

## Deployment

### Frontend Deployment (Vercel)

1. Connect GitHub repository to Vercel
2. Build command: `npm run build`
3. Output directory: `dist`
4. Configure environment variables: `VITE_WEBSOCKET_URL`

### Backend API Deployment (Vercel Serverless)

- Deploy as Vercel Serverless Functions
- API routes automatically exposed at `/api/*`

### WebSocket Server Deployment (Railway/Render)

- Deploy separately as Vercel does not support persistent WebSocket connections
- See detailed instructions in `docs/WEBSOCKET_SETUP.md`

## Completed Features

### Core Features

- [x] Authentication and Authorization (JWT)
- [x] User Management (CRUD operations)
- [x] Session Management (Individual and Group sessions)
- [x] Class and Enrollment System
- [x] Real-time Chat (WebSocket)
- [x] Notification System (Queue-based)
- [x] Forum System
- [x] Digital Library
- [x] Progress Tracking
- [x] Evaluation System
- [x] Approval Workflow
- [x] Resource Allocation
- [x] Analytics and Reports
- [x] Training Credits Management

### UI/UX Features

- [x] Dark/Light Theme
- [x] Responsive Design (Mobile and Desktop)
- [x] Emoji Picker (Production-ready)
- [x] Real-time Online Status
- [x] File Upload (Vercel Blob)
- [x] Calendar View
- [x] Search and Filter
- [x] Pagination
- [x] Loading States
- [x] Error Handling

### Advanced Features

- [x] Session Requests (Cancel/Reschedule)
- [x] Approval Requests (Multi-level approval system)
- [x] Resource Optimization
- [x] Performance Analytics
- [x] Document Management
- [x] Community Management
- [x] Permission Management
- [x] Batch Operations

## Future Enhancements

- [ ] Video call integration (WebRTC)
- [ ] Payment processing (Stripe/PayPal)
- [ ] Push notifications (FCM, APNS)
- [ ] Email notifications
- [ ] Advanced search with Elasticsearch
- [ ] Real-time collaboration tools
- [ ] Mobile app (React Native)
- [ ] Multi-language support (i18n) - i18next already integrated
- [ ] AI-powered recommendations
- [ ] Advanced reporting dashboard
- [ ] Database migration (PostgreSQL/MongoDB)
- [ ] Caching layer (Redis)
- [ ] Rate limiting
- [ ] API versioning

## Architecture Decisions

### React and TypeScript

- **Type Safety**: Compile-time error detection
- **Developer Experience**: IntelliSense and auto-completion
- **Maintainability**: Easy to maintain and extend
- **Performance**: Virtual DOM with optimized rendering

### Vite Build Tool

- **Fast Development**: Rapid hot module replacement
- **Modern Build**: ES modules and native ESM support
- **Optimized Production**: Tree shaking and code splitting
- **Developer Experience**: Simple configuration and fast builds

### Tailwind CSS

- **Utility-First**: Fast and consistent styling approach
- **Responsive**: Built-in responsive utilities
- **Dark Mode**: Native dark mode support
- **Performance**: Purged CSS with small bundle size

### JSON File Storage

- **Simplicity**: Easy setup and development
- **No Database Required**: No database setup needed
- **Portable**: Easy backup and migration
- **Note**: Can be migrated to database when scaling

### Separate WebSocket Server

- **Vercel Limitation**: Vercel does not support persistent WebSocket connections
- **Scalability**: WebSocket server can scale independently
- **Flexibility**: Can be deployed on Railway/Render/Heroku

## Quick Start Guide

### Development Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Start all servers (3 terminals required):**

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend API:**
```bash
npm run dev:api
```

**Terminal 3 - WebSocket Server:**
```bash
npm run dev:ws
```

### Seed Data

```bash
# Seed initial data
npm run seed

# Clean and reseed
npm run seed:clean
```

### Access Points

- Frontend: http://localhost:5173
- API Server: http://localhost:3000/api
- WebSocket Server: ws://localhost:3001
- Health Check: http://localhost:3001/health

### Default Credentials

Refer to `lib/seed.ts` or `data/users.json` for default user credentials.

## Support

For issues or questions:

1. Check documentation in the `docs/` directory
2. Create an issue on the GitHub repository
3. Review logs in console (browser and server)

## Acknowledgments

- Material-UI team for the excellent component library
- Tailwind CSS team for the utility-first CSS framework
- React team for the powerful framework
- Vite team for the fast build tool
- Socket.IO team for real-time communication capabilities
- Emoji Picker React team for the emoji picker component

## License

MIT License - See LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**HCMUT Learning Management System** - A modern and comprehensive online learning management system.

**Version**: 1.0  
**Status**: Near Completion - Production Ready  
**Last Updated**: November 2025
