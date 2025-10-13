import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import StudentDashboard from './pages/student/StudentDashboard.tsx'
import SearchTutors from './pages/student/SearchTutors.tsx'
import BookSession from './pages/student/BookSession.tsx'
import SessionDetail from './pages/student/SessionDetail.tsx'
import EvaluateSession from './pages/student/EvaluateSession.tsx'
import ViewProgress from './pages/student/ViewProgress.tsx'
import ChatbotSupport from './pages/student/ChatbotSupport.tsx'
import TutorDashboard from './pages/tutor/TutorDashboard.tsx'
import SetAvailability from './pages/tutor/SetAvailability.tsx'
import ManageSessions from './pages/tutor/ManageSessions.tsx'
import HandleCancelReschedule from './pages/tutor/HandleCancelReschedule.tsx'
import TrackStudentProgress from './pages/tutor/TrackStudentProgress.tsx'
import ManagementDashboard from './pages/management/ManagementDashboard.tsx'
import ApprovalRequests from './pages/management/ApprovalRequests.tsx'
import ReportsAnalytics from './pages/management/ReportsAnalytics.tsx'
import AwardCredits from './pages/management/AwardCredits.tsx'
import Login from './pages/common/Login.tsx'
import ProfileManagement from './pages/common/ProfileManagement.tsx'
import DigitalLibraryAccess from './pages/common/DigitalLibraryAccess.tsx'
import OnlineCommunityForum from './pages/common/OnlineCommunityForum.tsx'
import NotificationsCenter from './pages/common/NotificationsCenter.tsx'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
        {/* Student Routes */}
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/search" element={<SearchTutors />} />
        <Route path="/student/book" element={<BookSession />} />
        <Route path="/student/session" element={<SessionDetail />} />
        <Route path="/student/session/:id" element={<SessionDetail />} />
        <Route path="/student/evaluate" element={<EvaluateSession />} />
        <Route path="/student/evaluate/:id" element={<EvaluateSession />} />
        <Route path="/student/progress" element={<ViewProgress />} />
        <Route path="/student/chatbot" element={<ChatbotSupport />} />
        
        {/* Tutor Routes */}
        <Route path="/tutor" element={<TutorDashboard />} />
        <Route path="/tutor/availability" element={<SetAvailability />} />
        <Route path="/tutor/sessions" element={<ManageSessions />} />
        <Route path="/tutor/cancel-reschedule" element={<HandleCancelReschedule />} />
        <Route path="/tutor/track-progress" element={<TrackStudentProgress />} />
        
        {/* Management Routes */}
        <Route path="/management" element={<ManagementDashboard />} />
        <Route path="/management/approval" element={<ApprovalRequests />} />
        <Route path="/management/reports" element={<ReportsAnalytics />} />
        <Route path="/management/awards" element={<AwardCredits />} />
        
        {/* Common Screens Routes */}
        <Route path="/common" element={<Login />} />
        <Route path="/common/profile" element={<ProfileManagement />} />
        <Route path="/common/library" element={<DigitalLibraryAccess />} />
        <Route path="/common/forum" element={<OnlineCommunityForum />} />
        <Route path="/common/notifications" element={<NotificationsCenter />} />
        
        {/* Default redirect to login */}
        <Route path="/" element={<Login />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
