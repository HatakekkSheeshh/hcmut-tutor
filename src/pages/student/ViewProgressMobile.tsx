import React, { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { 
  TrendingUp, 
  School, 
  Schedule, 
  Star,
  Assignment,
  Menu as MenuIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  BarChart as BarChartIcon,
  Close as CloseIcon,
  ArrowForward as ArrowForwardIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  PersonSearch,
  Class,
  SmartToy as SmartToyIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Chat as ChatIcon
} from '@mui/icons-material'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const ViewProgressMobile: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [timeRange, setTimeRange] = useState('3months')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showTimeRangeDropdown, setShowTimeRangeDropdown] = useState(false)
  const [activeMenu, setActiveMenu] = useState('view-progress')

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

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      
      if (showTimeRangeDropdown && !target.closest('.time-range-dropdown-container')) {
        setShowTimeRangeDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showTimeRangeDropdown])

  // Time range options
  const timeRangeOptions = [
    { value: '1month', label: 'Last Month' },
    { value: '3months', label: 'Last 3 Months' },
    { value: '6months', label: 'Last 6 Months' },
    { value: '1year', label: 'Last Year' }
  ]

  const getSelectedTimeRange = () => {
    return timeRangeOptions.find(option => option.value === timeRange) || timeRangeOptions[1]
  }


  const progressData = {
    overallProgress: 85,
    subjects: [
      {
        name: 'Mathematics',
        progress: 90,
        sessionsCompleted: 12,
        averageRating: 4.8,
        lastSession: '2024-01-10',
        topics: ['Calculus', 'Algebra', 'Statistics']
      },
      {
        name: 'Physics',
        progress: 75,
        sessionsCompleted: 8,
        averageRating: 4.6,
        lastSession: '2024-01-08',
        topics: ['Mechanics', 'Thermodynamics', 'Quantum Physics']
      },
      {
        name: 'Chemistry',
        progress: 80,
        sessionsCompleted: 6,
        averageRating: 4.7,
        lastSession: '2024-01-05',
        topics: ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry']
      }
    ],
    achievements: [
      { title: 'First Session', description: 'Completed your first tutoring session', date: '2023-10-15', icon: <Star /> },
      { title: 'Math Master', description: 'Completed 10 Mathematics sessions', date: '2023-12-20', icon: <School /> },
      { title: 'Consistent Learner', description: 'Attended sessions for 3 consecutive months', date: '2024-01-01', icon: <TrendingUp /> },
      { title: 'Top Performer', description: 'Achieved 90%+ in Mathematics', date: '2024-01-10', icon: <Assignment /> }
    ],
    recentSessions: [
      {
        date: '2024-01-10',
        subject: 'Mathematics',
        tutor: 'Dr. Sarah Johnson',
        duration: '60 min',
        rating: 5,
        topic: 'Advanced Calculus'
      },
      {
        date: '2024-01-08',
        subject: 'Physics',
        tutor: 'Prof. Michael Chen',
        duration: '90 min',
        rating: 4,
        topic: 'Quantum Mechanics'
      },
      {
        date: '2024-01-05',
        subject: 'Chemistry',
        tutor: 'Dr. Emily Davis',
        duration: '60 min',
        rating: 5,
        topic: 'Organic Reactions'
      }
    ],
    goals: [
      { subject: 'Mathematics', target: 95, current: 90, deadline: '2024-02-15' },
      { subject: 'Physics', target: 85, current: 75, deadline: '2024-03-01' },
      { subject: 'Chemistry', target: 90, current: 80, deadline: '2024-02-28' }
    ]
  }

  const stats = [
    { title: 'Total Sessions', value: '26', icon: <Schedule />, color: 'primary' },
    { title: 'Average Rating', value: '4.7', icon: <Star />, color: 'secondary' },
    { title: 'Subjects Studied', value: '3', icon: <School />, color: 'success' },
    { title: 'Achievements', value: '4', icon: <TrendingUp />, color: 'info' },
  ]

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
                Learning Progress
              </h1>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Track your learning journey
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
        {/* Time Range Selector */}
        <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} overflow-visible`} style={{ overflow: 'visible' }}>
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Time Range
            </h3>
            <div className="relative time-range-dropdown-container">
              {/* Custom Time Range Dropdown Button */}
              <button
                onClick={() => setShowTimeRangeDropdown(!showTimeRangeDropdown)}
                className={`px-3 py-2 border rounded-xl text-sm flex items-center justify-between transition-all duration-200 ${
                theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                    : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
                <div className="flex items-center">
                  <span className="font-medium">{getSelectedTimeRange().label}</span>
                </div>
                <div className={`transform transition-transform duration-200 ml-2 ${showTimeRangeDropdown ? 'rotate-180' : ''}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Custom Time Range Dropdown Options */}
              {showTimeRangeDropdown && (
                <div className="absolute top-full right-0 z-[9999] mt-1 min-w-[200px]">
                  <div className={`rounded-xl shadow-xl border overflow-hidden ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white border-gray-200'
                  }`}>
                    {timeRangeOptions.map((option, index) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setTimeRange(option.value)
                          setShowTimeRangeDropdown(false)
                        }}
                        className={`w-full px-4 py-3 text-left flex items-center transition-colors duration-150 ${
                          option.value === timeRange
                            ? theme === 'dark'
                              ? 'bg-blue-600 text-white'
                              : 'bg-blue-100 text-blue-700'
                            : theme === 'dark'
                              ? 'text-gray-300 hover:bg-gray-600'
                              : 'text-gray-700 hover:bg-gray-50'
                        } ${index !== timeRangeOptions.length - 1 ? 'border-b border-gray-200 dark:border-gray-600' : ''}`}
                      >
                        <span className="font-medium">{option.label}</span>
                        {option.value === timeRange && (
                          <div className="ml-auto">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        <Card
          className={`border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4`}
          style={{
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            boxShadow: 'none !important'
          }}
        >
          <div className="text-center mb-4">
            <div className={`text-3xl font-bold text-blue-600 mb-2`}>
              {progressData.overallProgress}%
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Overall Learning Progress
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressData.overallProgress}%` }}
            ></div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => (
            <Card
              key={index} 
              className={`border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-3`}
              style={{
                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                boxShadow: 'none !important'
              }}
            >
              <div className="text-center">
                <div className="text-2xl text-blue-600 mb-1">{stat.icon}</div>
                <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stat.value}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stat.title}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Subject Progress */}
        <Card
          className={`border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4`}
          style={{
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            boxShadow: 'none !important'
          }}
        >
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Subject Progress
          </h3>
          <div className="space-y-4">
            {progressData.subjects.map((subject, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {subject.name}
                  </span>
                  <span className="text-blue-600 font-semibold">
                    {subject.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${subject.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {subject.sessionsCompleted} sessions
                  </span>
                  <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Avg: {subject.averageRating}★
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Learning Goals */}
        <Card
          className={`border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4`}
          style={{
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            boxShadow: 'none !important'
          }}
        >
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Learning Goals
          </h3>
          <div className="space-y-3">
            {progressData.goals.map((goal, index) => (
              <div key={index} className={`p-3 border rounded-lg ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {goal.subject}
                  </span>
                  <span className="text-blue-600 font-semibold">
                    {goal.current}/{goal.target}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(goal.current / goal.target) * 100}%` }}
                  ></div>
                </div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Target: {goal.target}% by {goal.deadline}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Sessions */}
        <Card
          className={`border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4`}
          style={{
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            boxShadow: 'none !important'
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Recent Sessions
            </h3>
            <Button 
              size="small" 
              variant="outlined"
              style={{
                backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                color: theme === 'dark' ? '#ffffff' : '#000000',
                borderColor: theme === 'dark' ? '#6b7280' : '#d1d5db',
                textTransform: 'none',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? '#4b5563' : '#f3f4f6'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#ffffff'
              }}
            >
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {progressData.recentSessions.map((session, index) => (
              <div key={index} className={`p-3 border rounded-lg ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {session.subject}
                  </span>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {session.rating}
                    </span>
                  </div>
                </div>
                <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {session.tutor} • {session.topic}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  {session.date} • {session.duration}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Achievements */}
        <Card
          className={`border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4`}
          style={{
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            boxShadow: 'none !important'
          }}
        >
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Achievements
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {progressData.achievements.map((achievement, index) => (
              <div 
                key={index} 
                className={`text-center p-3 border rounded-lg ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-white border-gray-200'
                }`}
                style={{
                  borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                  backgroundColor: theme === 'dark' ? '#374151' : '#ffffff'
                }}
              >
                <div className="text-blue-600 mb-2">
                  {achievement.icon}
                </div>
                <h4 className={`font-semibold mb-1 text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {achievement.title}
                </h4>
                <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {achievement.description}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  {achievement.date}
                </p>
              </div>
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
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/student/book')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'} transition-colors`}
                >
                  <CheckCircleIcon className="mr-3 w-4 h-4" />
                  Book New Session
                </button>
                <button 
                  onClick={() => navigate('/student/search')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'} transition-colors`}
                >
                  <BarChartIcon className="mr-3 w-4 h-4" />
                  Find Tutors
                </button>
                <button 
                  onClick={() => navigate('/student/chatbot')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'} transition-colors`}
                >
                  <PersonIcon className="mr-3 w-4 h-4" />
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

                {/* Mobile Progress Overview */}
                <div className="mb-8">
                  <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    PROGRESS OVERVIEW
                  </h3>
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="text-center mb-3">
                      <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {progressData.overallProgress}%
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Overall Progress
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${progressData.overallProgress}%` }}
                      ></div>
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

export default ViewProgressMobile
