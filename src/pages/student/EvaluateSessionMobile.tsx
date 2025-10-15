import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { 
  Rating,
  Avatar
} from '@mui/material'
import { 
  School, 
  Person,
  Menu as MenuIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  BarChart as BarChartIcon,
  ThumbUpAlt as ThumbUpAltIcon,
  Close as CloseIcon,
  ArrowForward as ArrowForwardIcon,
  Dashboard as DashboardIcon,
  PersonSearch,
  Class,
  SmartToy as SmartToyIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Chat as ChatIcon,
  Star
} from '@mui/icons-material'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const EvaluateSessionMobile: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const { id } = useParams()
  const [overallRating, setOverallRating] = useState(0)
  const [tutorRating, setTutorRating] = useState(0)
  const [contentRating, setContentRating] = useState(0)
  const [communicationRating, setCommunicationRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [recommend, setRecommend] = useState(false)
  const [improvements, setImprovements] = useState<string[]>([])
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [activeMenu, setActiveMenu] = useState('evaluate-session')

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
    { id: 'book-session', label: 'Book Session', icon: <School />, path: '/student/book' },
    { id: 'view-progress', label: 'View Progress', icon: <BarChartIcon />, path: '/student/progress' },
    { id: 'evaluate-session', label: 'Evaluate Session', icon: <Star />, path: '/student/evaluate' },
    { id: 'session-detail', label: 'Session Details', icon: <Class />, path: '/student/session' },
    { id: 'chatbot-support', label: 'AI Support', icon: <SmartToyIcon />, path: '/student/chatbot' },
    { id: 'messages', label: 'Messages', icon: <ChatIcon />, path: '/student/messages' }
  ]

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

  // Mock session data
  const session = {
    id: id,
    tutor: {
      name: 'Dr. Sarah Johnson',
      subject: 'Mathematics',
      image: '/api/placeholder/100/100',
      specialties: ['Calculus', 'Algebra']
    },
    date: '2024-01-15',
    time: '10:00 AM - 11:00 AM',
    topic: 'Derivatives and Integration',
    duration: '60 minutes'
  }

  const improvementOptions = [
    'More practice problems',
    'Clearer explanations',
    'Better pacing',
    'More visual aids',
    'Interactive activities',
    'Homework assignments',
    'Follow-up materials'
  ]

  const handleImprovementChange = (improvement: string) => {
    setImprovements(prev => 
      prev.includes(improvement) 
        ? prev.filter(item => item !== improvement)
        : [...prev, improvement]
    )
  }

  const handleSubmit = () => {
    // In a real app, this would submit the evaluation to the backend
    console.log('Evaluation submitted:', {
      overallRating,
      tutorRating,
      contentRating,
      communicationRating,
      feedback,
      recommend,
      improvements
    })
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} pb-16`}>
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
                  Evaluation Complete
                </h1>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Thank you for your feedback
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="p-4">
          <Card 
            className={`border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 text-center`}
            style={{
              borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
              backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
              boxShadow: 'none !important'
            }}
          >
            <div className="mb-6">
              <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Thank you for your feedback!
              </h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Your evaluation has been submitted successfully.
              </p>
            </div>
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/student')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Back to Dashboard
              </Button>
              <Button 
                onClick={() => navigate('/student/book')}
                variant="outlined"
                className="w-full"
                style={{
                  backgroundColor: 'transparent',
                  color: theme === 'dark' ? '#ffffff' : '#000000',
                  borderColor: theme === 'dark' ? '#ffffff' : '#000000',
                  textTransform: 'none',
                  fontWeight: '500'
                }}
              >
                Book Another Session
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} pb-16`}>
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
                Evaluate Session
              </h1>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Session #{id} • Share your feedback
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
        {/* Session Summary - Mobile */}
        <Card 
          className={`border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4`}
          style={{
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            boxShadow: 'none !important'
          }}
        >
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Session Summary
          </h3>
          <div className="flex items-center mb-4">
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: getAvatarColor(session.tutor.name),
                fontSize: '1.125rem',
                fontWeight: 'bold'
              }}
            >
              {getInitials(session.tutor.name)}
            </Avatar>
            <div className="ml-3">
              <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {session.tutor.name}
              </h4>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {session.tutor.subject}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Date:</span>
              <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{session.date}</span>
            </div>
            <div className="flex justify-between">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Time:</span>
              <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{session.time}</span>
            </div>
            <div className="flex justify-between">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Topic:</span>
              <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{session.topic}</span>
            </div>
            <div className="flex justify-between">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Duration:</span>
              <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{session.duration}</span>
            </div>
          </div>
        </Card>

        {/* Overall Rating - Mobile */}
        <Card 
          className={`border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4`}
          style={{
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            boxShadow: 'none !important'
          }}
        >
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Overall Session Rating
          </h3>
          <div className="flex items-center justify-center mb-4">
            <Rating
              value={overallRating}
              onChange={(_, newValue) => setOverallRating(newValue || 0)}
              size="large"
              sx={{
                '& .MuiRating-iconEmpty': {
                  color: theme === 'dark' ? '#6b7280' : '#d1d5db',
                },
                '& .MuiRating-iconFilled': {
                  color: '#fbbf24',
                },
                '& .MuiRating-iconHover': {
                  color: '#f59e0b',
                }
              }}
            />
          </div>
          <p className={`text-center text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {overallRating > 0 ? `${overallRating}/5` : 'Rate this session'}
          </p>
        </Card>

        {/* Detailed Ratings - Mobile */}
        <Card 
          className={`border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4`}
          style={{
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            boxShadow: 'none !important'
          }}
        >
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Detailed Ratings
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center mb-2">
                <Person className="w-4 h-4 text-blue-600 mr-2" />
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Tutor Performance
                </span>
              </div>
              <Rating
                value={tutorRating}
                onChange={(_, newValue) => setTutorRating(newValue || 0)}
                sx={{
                  '& .MuiRating-iconEmpty': {
                    color: theme === 'dark' ? '#6b7280' : '#d1d5db',
                  },
                  '& .MuiRating-iconFilled': {
                    color: '#fbbf24',
                  },
                  '& .MuiRating-iconHover': {
                    color: '#f59e0b',
                  }
                }}
              />
            </div>

            <div>
              <div className="flex items-center mb-2">
                <School className="w-4 h-4 text-blue-600 mr-2" />
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Content Quality
                </span>
              </div>
              <Rating
                value={contentRating}
                onChange={(_, newValue) => setContentRating(newValue || 0)}
                sx={{
                  '& .MuiRating-iconEmpty': {
                    color: theme === 'dark' ? '#6b7280' : '#d1d5db',
                  },
                  '& .MuiRating-iconFilled': {
                    color: '#fbbf24',
                  },
                  '& .MuiRating-iconHover': {
                    color: '#f59e0b',
                  }
                }}
              />
            </div>

            <div>
              <div className="flex items-center mb-2">
                <ThumbUpAltIcon className="w-4 h-4 text-blue-600 mr-2" />
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Communication
                </span>
              </div>
              <Rating
                value={communicationRating}
                onChange={(_, newValue) => setCommunicationRating(newValue || 0)}
                sx={{
                  '& .MuiRating-iconEmpty': {
                    color: theme === 'dark' ? '#6b7280' : '#d1d5db',
                  },
                  '& .MuiRating-iconFilled': {
                    color: '#fbbf24',
                  },
                  '& .MuiRating-iconHover': {
                    color: '#f59e0b',
                  }
                }}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={recommend}
                onChange={(e) => setRecommend(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded mr-2"
              />
              <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Would you recommend this tutor?
              </span>
            </div>
          </div>
        </Card>

        {/* Feedback - Mobile */}
        <Card 
          className={`border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4`}
          style={{
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            boxShadow: 'none !important'
          }}
        >
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Additional Comments
          </h3>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your thoughts about the session..."
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </Card>

        {/* Improvements - Mobile */}
        <Card 
          className={`border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4`}
          style={{
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            boxShadow: 'none !important'
          }}
        >
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            What could be improved?
          </h3>
          <div className="flex flex-wrap gap-2">
            {improvementOptions.map((option) => (
              <button
                key={option}
                onClick={() => handleImprovementChange(option)}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  improvements.includes(option)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {option}
              </button>
            ))}
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
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => navigate('/student/progress')}
                  className={`flex flex-col items-center p-3 rounded-lg border ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                >
                  <BarChartIcon className="w-6 h-6 text-blue-600 mb-2" />
                  <span className={`text-xs font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Progress
                  </span>
                </button>
                <button 
                  onClick={() => navigate('/student/book')}
                  className={`flex flex-col items-center p-3 rounded-lg border ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                >
                  <CheckCircleIcon className="w-6 h-6 text-green-600 mb-2" />
                  <span className={`text-xs font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Book Session
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation - Mobile */}
      <div className={`fixed bottom-0 left-0 right-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} p-4`}>
        <Button
          onClick={handleSubmit}
          disabled={overallRating === 0}
          className="w-full"
          style={{
            backgroundColor: overallRating > 0 ? '#2563eb' : (theme === 'dark' ? '#374151' : '#d1d5db'),
            color: overallRating > 0 ? '#ffffff' : (theme === 'dark' ? '#9ca3af' : '#6b7280'),
            borderColor: overallRating > 0 ? '#2563eb' : (theme === 'dark' ? '#374151' : '#d1d5db'),
            textTransform: 'none',
            fontWeight: '500'
          }}
        >
          Submit Evaluation
        </Button>
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

                {/* Session Info */}
                <div className="mb-8">
                  <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    SESSION INFO
                  </h3>
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                        <Person className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {session.tutor.name}
                        </p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {session.tutor.subject}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        📅 {session.date}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        ⏰ {session.time}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        📚 {session.topic}
                      </p>
                    </div>
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
    </div>
  )
}

export default EvaluateSessionMobile
