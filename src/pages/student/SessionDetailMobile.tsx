import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import api from '../../lib/api'
import { 
  Typography, 
  Button as MuiButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Avatar
} from '@mui/material'
import { 
  VideoCall, 
  Chat, 
  Share, 
  Download, 
  Star,
  Schedule,
  Person,
  Menu as MenuIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Close as CloseIcon,
  ArrowForward as ArrowForwardIcon,
  Dashboard as DashboardIcon,
  PersonSearch,
  Class,
  SmartToy as SmartToyIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Chat as ChatIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const SessionDetailMobile: React.FC = () => {
  const { id } = useParams()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [activeMenu, setActiveMenu] = useState('session-detail')
  
  // Backend data states
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)
  const [tutor, setTutor] = useState<any>(null)
  const [mySessions, setMySessions] = useState<any[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(true)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleMenuClick = (item: any) => {
    setActiveMenu(item.id)
    if (item.path) {
      navigate(item.path)
    }
    setMobileOpen(false)
  }

  const handleThemeToggle = () => {
    toggleTheme()
  }

  // Menu items for navigation
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, path: '/student' },
    { id: 'search-tutors', label: 'Find Tutors', icon: <PersonSearch />, path: '/student/search' },
    { id: 'book-session', label: 'Book Session', icon: <Schedule />, path: '/student/book' },
    { id: 'view-progress', label: 'View Progress', icon: <BarChartIcon />, path: '/student/progress' },
    { id: 'evaluate-session', label: 'Evaluate Session', icon: <Star />, path: '/student/evaluate' },
    { id: 'session-detail', label: 'Session Details', icon: <Class />, path: '/student/session' },
    { id: 'chatbot-support', label: 'AI Support', icon: <SmartToyIcon />, path: '/student/chatbot' },
    { id: 'messages', label: 'Messages', icon: <ChatIcon />, path: '/student/messages' }
  ]

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Helper function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Helper function to generate avatar color based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
      '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
      '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800',
      '#ff5722', '#795548', '#607d8b'
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  // Load my sessions list
  useEffect(() => {
    const loadMySessions = async () => {
      try {
        setSessionsLoading(true)
        const userStr = localStorage.getItem('user')
        if (!userStr) return
        
        const user = JSON.parse(userStr)
        const response = await api.sessions.list({ studentId: user.id || user.userId, limit: 1000 })
        
        if (response.data && Array.isArray(response.data)) {
          setMySessions(response.data)
        }
      } catch (error) {
        console.error('Failed to load sessions list:', error)
      } finally {
        setSessionsLoading(false)
      }
    }

    loadMySessions()
  }, [])

  // Load session data
  useEffect(() => {
    const loadSessionData = async () => {
      if (!id) {
        console.log('No session ID provided')
        setLoading(false)
        return
      }
      
      try {
        setLoading(true)
        console.log('Fetching session:', id)
        
        // Fetch session data
        const sessionResponse = await api.sessions.get(id)
        console.log('Session response:', sessionResponse)
        
        if (sessionResponse.success && sessionResponse.data) {
          setSession(sessionResponse.data)
          console.log('Session data loaded:', sessionResponse.data)
          
          // Fetch tutor data
          console.log('Fetching tutor:', sessionResponse.data.tutorId)
          const tutorResponse = await api.users.get(sessionResponse.data.tutorId)
          console.log('Tutor response:', tutorResponse)
          
          if (tutorResponse.success && tutorResponse.data) {
            setTutor(tutorResponse.data)
            console.log('Tutor data loaded:', tutorResponse.data)
          } else {
            console.error('Failed to load tutor:', tutorResponse)
          }
        } else {
          console.error('Session not found or failed:', sessionResponse)
        }
      } catch (error) {
        console.error('Failed to load session data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSessionData()
  }, [id])

  // Format date and time
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleString('vi-VN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusLabel = (status: string) => {
    const statusMap: any = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      completed: 'Completed',
      cancelled: 'Cancelled',
      rescheduled: 'Rescheduled'
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: string) => {
    const colorMap: any = {
      pending: 'bg-yellow-500',
      confirmed: 'bg-green-500',
      completed: 'bg-blue-500',
      cancelled: 'bg-red-500',
      rescheduled: 'bg-orange-500'
    }
    return colorMap[status] || 'bg-gray-500'
  }

  const handleJoinSession = () => {
    setIsJoinDialogOpen(true)
  }

  const handleStartSession = () => {
    // In a real app, this would open the video call
    if (session?.meetingLink) {
    window.open(session.meetingLink, '_blank')
    }
    setIsJoinDialogOpen(false)
  }

  const handleEndSession = () => {
    setIsFeedbackDialogOpen(true)
  }

  const handleSubmitFeedback = () => {
    // In a real app, this would submit feedback to the backend
    console.log('Feedback submitted:', { rating, feedback })
    setIsFeedbackDialogOpen(false)
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading session...
          </p>
        </div>
      </div>
    )
  }

  if (!session || !tutor) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center p-4">
          <p className={`text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
            Session not found
          </p>
          <Button
            onClick={() => navigate('/student')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Mobile Header */}
      <div className={`sticky top-0 z-40 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/student')}
              className={`p-2 rounded-lg mr-3 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              <ArrowBackIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Session Details
              </h1>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Session #{id || 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleThemeToggle}
              className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <LightModeIcon className="w-5 h-5 text-yellow-400" /> : <DarkModeIcon className="w-5 h-5" />}
            </button>
            <button
              onClick={handleDrawerToggle}
              className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              <MenuIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="p-4 space-y-4">
        {/* Session Status */}
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {session.status === 'upcoming' ? 'Upcoming' : 'Active'}
              </span>
            </div>
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              ID: {session.id}
            </span>
          </div>
        </div>

        {/* Tutor Info */}
        <Card
          className={`border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4`}
          style={{
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            boxShadow: 'none !important'
          }}
        >
          <div className="flex items-center mb-4">
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: getAvatarColor(tutor.name),
                fontSize: '1.25rem',
                fontWeight: 'bold'
              }}
            >
              {getInitials(tutor.name)}
            </Avatar>
            <div className="ml-4 flex-1">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {tutor.name}
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {session.subject}
              </p>
              <div className="flex items-center mt-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < Math.floor(tutor.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <span className={`text-sm ml-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {tutor.rating?.toFixed(1) || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Session Details */}
          <div className="space-y-3">
            <div className="flex items-center">
              <Schedule className="w-4 h-4 text-gray-400 mr-3" />
              <div>
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatDateTime(session.startTime)}
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Duration: {session.duration} minutes
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <Person className="w-4 h-4 text-gray-400 mr-3" />
              <div>
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {session.isOnline ? 'Online Video Call' : 'In-Person Meeting'}
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {session.isOnline ? 'Virtual' : 'Physical Location'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Session Actions */}
        <Card
          className={`border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4`}
          style={{
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            boxShadow: 'none !important'
          }}
        >
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Session Actions
          </h3>
          <div className="space-y-3">
            <Button 
              fullWidth 
              variant="contained" 
              startIcon={<VideoCall />}
              onClick={handleJoinSession}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Join Video Call
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outlined" 
                startIcon={<Chat />}
                style={{
                  backgroundColor: theme === 'dark' ? '#000000' : '#ffffff',
                  color: theme === 'dark' ? '#ffffff' : '#000000',
                  borderColor: theme === 'dark' ? '#000000' : '#d1d5db',
                  textTransform: 'none',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1f2937' : '#f3f4f6'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme === 'dark' ? '#000000' : '#ffffff'
                }}
              >
                Chat
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<Share />}
                style={{
                  backgroundColor: theme === 'dark' ? '#000000' : '#ffffff',
                  color: theme === 'dark' ? '#ffffff' : '#000000',
                  borderColor: theme === 'dark' ? '#000000' : '#d1d5db',
                  textTransform: 'none',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1f2937' : '#f3f4f6'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme === 'dark' ? '#000000' : '#ffffff'
                }}
              >
                Share
              </Button>
            </div>
            <Button 
              fullWidth 
              variant="outlined" 
              startIcon={<Download />}
              style={{
                backgroundColor: theme === 'dark' ? '#000000' : '#ffffff',
                color: theme === 'dark' ? '#ffffff' : '#000000',
                borderColor: theme === 'dark' ? '#000000' : '#d1d5db',
                textTransform: 'none',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1f2937' : '#f3f4f6'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? '#000000' : '#ffffff'
              }}
            >
              Download Materials
            </Button>
            <Button 
              fullWidth 
              variant="outlined" 
              startIcon={<Star />}
              onClick={handleEndSession}
              style={{
                backgroundColor: theme === 'dark' ? '#000000' : '#ffffff',
                color: theme === 'dark' ? '#ffffff' : '#000000',
                borderColor: theme === 'dark' ? '#000000' : '#d1d5db',
                textTransform: 'none',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1f2937' : '#f3f4f6'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? '#000000' : '#ffffff'
              }}
            >
              End Session & Rate
            </Button>
          </div>
        </Card>

        {/* Session Notes */}
        <Card
          className={`border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4`}
          style={{
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            boxShadow: 'none !important'
          }}
        >
          <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Session Notes
          </h3>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {session.notes}
          </p>
        </Card>

        {/* Tutor Specialties */}
        {tutor.subjects && tutor.subjects.length > 0 && (
        <Card
          className={`border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4`}
          style={{
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            boxShadow: 'none !important'
          }}
        >
          <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Tutor Specialties
          </h3>
          <div className="flex flex-wrap gap-2">
              {tutor.subjects.map((subject: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                  {subject}
              </span>
            ))}
          </div>
        </Card>
        )}

        {/* Session Materials - Commented out: not in backend yet */}
        {/* <Card
          className={`border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4`}
          style={{
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            boxShadow: 'none !important'
          }}
        >
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Session Materials
          </h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            No materials uploaded yet
          </p>
        </Card> */}

        {/* Session Info */}
        <Card 
          className={`border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4`}
          style={{
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            boxShadow: 'none !important'
          }}
        >
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Session Details
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Status:</span>
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {session.status === 'upcoming' ? 'Upcoming' : 'Active'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Price:</span>
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                ${session.price}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Type:</span>
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {session.type}
              </span>
            </div>
          </div>
        </Card>

        {/* Help Section - Mobile with Toggle */}
        <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <button 
            onClick={() => setShowHelp(!showHelp)}
            className={`w-full flex items-center justify-between p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
          >
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Need Help?
            </h3>
            <div className={`transform transition-transform ${showHelp ? 'rotate-180' : ''}`}>
              <ArrowForwardIcon className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
          </button>
          
          {showHelp && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/student/book')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'} transition-colors`}
                >
                  <CheckCircleIcon className="mr-3 w-4 h-4" />
                  Book Another Session
                </button>
                <button 
                  onClick={() => navigate('/student/progress')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'} transition-colors`}
                >
                  <TrendingUpIcon className="mr-3 w-4 h-4" />
                  View Progress
                </button>
                <button 
                  onClick={() => navigate('/student/chatbot')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'} transition-colors`}
                >
                  <Chat className="mr-3 w-4 h-4" />
                  AI Support
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleDrawerToggle}></div>
          <div className={`fixed left-0 top-0 h-full w-80 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
            <div className="p-6 h-full flex flex-col overflow-hidden">
              {/* Mobile Header */}
              <div className="flex items-center justify-between mb-8 flex-shrink-0">
                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center mr-3">
                    <img src="/HCMCUT.svg" alt="HCMUT Logo" className="w-8 h-8" />
                  </div>
                  <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    HCMUT
                  </span>
                </div>
                <button
                  onClick={handleDrawerToggle}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <CloseIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto">
                {/* Quick Actions - Moved to top */}
                <div className="mb-8">
                  <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    QUICK ACTIONS
                  </h3>
                  <div className="space-y-2">
                    <button 
                      onClick={() => {
                        navigate('/student')
                        setMobileOpen(false)
                      }}
                      className={`w-full flex items-center px-3 py-2 rounded-lg text-left bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors`}
                    >
                      <ArrowBackIcon className="mr-3 w-4 h-4" />
                      Back to Dashboard
                    </button>
                  </div>
                </div>

                {/* My Sessions */}
                <div className="mb-8">
                  <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    MY SESSIONS ({mySessions.length})
                  </h3>
                  {sessionsLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                  ) : mySessions.length === 0 ? (
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      No sessions found
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {mySessions.map((sess: any) => (
                        <button
                          key={sess.id}
                          onClick={() => {
                            navigate(`/student/session/${sess.id}`)
                            setMobileOpen(false)
                          }}
                          className={`w-full px-3 py-2 rounded-lg text-left transition-colors ${
                            sess.id === id
                              ? 'bg-blue-600 text-white'
                              : theme === 'dark'
                              ? 'bg-gray-700 hover:bg-gray-600 text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold truncate">
                              {sess.subject}
                            </span>
                            <span className={`w-2 h-2 rounded-full ${getStatusColor(sess.status)}`}></span>
                          </div>
                          <p className={`text-xs ${sess.id === id ? 'text-blue-100' : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {formatTime(sess.startTime)}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mobile Session Status */}
                <div className="mb-8">
                  <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    SESSION STATUS
                  </h3>
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {session.status === 'upcoming' ? 'Upcoming' : 'Active'}
                      </span>
                    </div>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Session ID: {session.id}
                    </p>
                  </div>
                </div>

                {/* Mobile Navigation */}
                <div className="space-y-2 mb-8">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleMenuClick(item)}
                      className={`w-full flex items-center px-3 py-3 rounded-lg text-left transition-colors ${
                        activeMenu === item.id
                          ? 'bg-blue-100 text-blue-700'
                          : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
                      }`}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* Join Session Dialog */}
      <Dialog open={isJoinDialogOpen} onClose={() => setIsJoinDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Join Session</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            You are about to join the session with {tutor?.name}.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Session: {session?.subject} - {formatDateTime(session?.startTime || '')}
          </Typography>
          <div className="mt-4">
            <TextField
              fullWidth
              label="Meeting Link"
              value={session?.meetingLink || 'No meeting link available'}
              InputProps={{ readOnly: true }}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <MuiButton 
            onClick={() => setIsJoinDialogOpen(false)}
            style={{
              backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
              color: theme === 'dark' ? '#ffffff' : '#000000',
              textTransform: 'none',
              fontWeight: '500'
            }}
          >
            Cancel
          </MuiButton>
          <MuiButton 
            onClick={handleStartSession} 
            variant="contained"
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              textTransform: 'none',
              fontWeight: '500'
            }}
          >
            Join Now
          </MuiButton>
        </DialogActions>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={isFeedbackDialogOpen} onClose={() => setIsFeedbackDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Rate Your Session</DialogTitle>
        <DialogContent>
          <div className="mt-4">
            <Typography variant="h6" gutterBottom>
              How would you rate this session?
            </Typography>
            <Rating
              value={rating}
              onChange={(_, newValue) => setRating(newValue || 0)}
              size="large"
            />
          </div>
          <div className="mt-4">
            <TextField
              fullWidth
              label="Additional Feedback"
              multiline
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your thoughts about the session..."
            />
          </div>
        </DialogContent>
        <DialogActions>
          <MuiButton 
            onClick={() => setIsFeedbackDialogOpen(false)}
            style={{
              backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
              color: theme === 'dark' ? '#ffffff' : '#000000',
              textTransform: 'none',
              fontWeight: '500'
            }}
          >
            Cancel
          </MuiButton>
          <MuiButton 
            onClick={handleSubmitFeedback} 
            variant="contained"
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              textTransform: 'none',
              fontWeight: '500'
            }}
          >
            Submit Feedback
          </MuiButton>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default SessionDetailMobile
