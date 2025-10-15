import React, { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button as MuiButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar
} from '@mui/material'
import { 
  Search, 
  VideoCall, 
  Chat, 
  Edit, 
  Schedule,
  Star,
  Assignment,
  Menu as MenuIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  FilterList as FilterListIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Add as AddIcon,
  Dashboard as DashboardIcon,
  Autorenew as AutorenewIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const ManageSessionsMobile: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [activeMenu, setActiveMenu] = useState('sessions')

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleThemeToggle = () => {
    toggleTheme()
  }

  const handleMenuClick = (item: any) => {
    setActiveMenu(item.id)
    if (item.path) {
      navigate(item.path)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      
      if (showFilterDropdown && !target.closest('.filter-dropdown-container')) {
        setShowFilterDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showFilterDropdown])

  // Filter options
  const filterOptions = [
    { value: 'all', label: 'All Sessions' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  const getSelectedFilter = () => {
    return filterOptions.find(option => option.value === filterStatus) || filterOptions[0]
  }

  // Menu items for navigation
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, path: '/tutor' },
    { id: 'availability', label: 'Set Availability', icon: <Schedule className="w-4 h-4" />, path: '/tutor/availability' },
    { id: 'sessions', label: 'Manage Sessions', icon: <Assignment className="w-4 h-4" />, path: '/tutor/sessions' },
    { id: 'progress', label: 'Track Progress', icon: <BarChartIcon className="w-4 h-4" />, path: '/tutor/track-progress' },
    { id: 'cancel-reschedule', label: 'Cancel/Reschedule', icon: <AutorenewIcon className="w-4 h-4" />, path: '/tutor/cancel-reschedule' },
    { id: 'messages', label: 'Messages', icon: <Chat className="w-4 h-4" />, path: '/tutor/messages' }
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

  const sessions = [
    {
      id: 1,
      student: 'John Smith',
      subject: 'Mathematics',
      date: '2024-01-15',
      time: '10:00 AM',
      duration: '60 min',
      status: 'confirmed',
      rating: 4.8,
      avatar: '/api/placeholder/40/40',
      topic: 'Calculus Derivatives',
      notes: 'Focus on chain rule and product rule'
    },
    {
      id: 2,
      student: 'Sarah Johnson',
      subject: 'Physics',
      date: '2024-01-15',
      time: '2:00 PM',
      duration: '90 min',
      status: 'pending',
      rating: 4.6,
      avatar: '/api/placeholder/40/40',
      topic: 'Quantum Mechanics',
      notes: 'Review wave functions and probability'
    },
    {
      id: 3,
      student: 'Mike Chen',
      subject: 'Chemistry',
      date: '2024-01-16',
      time: '9:00 AM',
      duration: '60 min',
      status: 'completed',
      rating: 4.9,
      avatar: '/api/placeholder/40/40',
      topic: 'Organic Reactions',
      notes: 'SN1 and SN2 mechanisms'
    },
    {
      id: 4,
      student: 'Alice Brown',
      subject: 'Mathematics',
      date: '2024-01-16',
      time: '3:00 PM',
      duration: '60 min',
      status: 'cancelled',
      rating: 4.7,
      avatar: '/api/placeholder/40/40',
      topic: 'Linear Algebra',
      notes: 'Matrix operations and determinants'
    }
  ]

  const filteredSessions = sessions.filter(session => {
    const matchesStatus = filterStatus === 'all' || session.status === filterStatus
    const matchesSearch = session.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.subject.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const handleEditSession = (session: any) => {
    setSelectedSession(session)
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    // In a real app, this would save changes to the backend
    console.log('Session updated:', selectedSession)
    setIsEditDialogOpen(false)
  }

  const stats = [
    { title: 'Total Sessions', value: sessions.length, color: 'blue' },
    { title: 'Confirmed', value: sessions.filter(s => s.status === 'confirmed').length, color: 'green' },
    { title: 'Completed', value: sessions.filter(s => s.status === 'completed').length, color: 'blue' },
    { title: 'Avg Rating', value: (sessions.reduce((acc, s) => acc + s.rating, 0) / sessions.length).toFixed(1), color: 'yellow' }
  ]

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Mobile Header */}
      <div className={`sticky top-0 z-40 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/tutor')}
              className={`p-2 rounded-lg mr-3 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              <ArrowBackIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Manage Sessions
              </h1>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                View and manage all sessions
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              <FilterListIcon className="w-5 h-5" />
            </button>
            <button
              onClick={handleThemeToggle}
              className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
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

      {/* Main Content */}
      <div className="p-4 pb-20">
        {/* Stats Cards - Mobile Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className={`p-3 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
              style={{
                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                boxShadow: 'none !important'
              }}
            >
              <div className="text-center">
                <div className={`text-2xl font-bold mb-1 ${
                  stat.color === 'blue' ? 'text-blue-500' :
                  stat.color === 'green' ? 'text-green-500' :
                  stat.color === 'yellow' ? 'text-yellow-500' :
                  'text-gray-500'
                }`}>
                  {stat.value}
                </div>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stat.title}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Filters Section - Mobile with Toggle */}
        {showFilters && (
          <Card
            className={`border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 mb-4 overflow-visible`}
            style={{
              borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
              backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
              boxShadow: 'none !important',
              overflow: 'visible'
            }}
          >
            <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Search & Filters
            </h3>
            <div className="space-y-3 overflow-visible">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search sessions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full px-4 py-2 pl-10 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              <div className="relative filter-dropdown-container">
                {/* Custom Filter Dropdown Button */}
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className={`w-full px-3 py-2 border rounded-xl flex items-center justify-between transition-all duration-200 ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                      : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <div className="flex items-center">
                    <span className="font-medium">{getSelectedFilter().label}</span>
                  </div>
                  <div className={`transform transition-transform duration-200 ${showFilterDropdown ? 'rotate-180' : ''}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Custom Filter Dropdown Options */}
                {showFilterDropdown && (
                  <div className="absolute top-full left-0 right-0 z-[9999] mt-1">
                    <div className={`rounded-xl shadow-xl border overflow-hidden ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-white border-gray-200'
                    }`}>
                      {filterOptions.map((option, index) => {
                        return (
                        <button
                          key={option.value}
                          onClick={() => {
                            setFilterStatus(option.value)
                            setShowFilterDropdown(false)
                          }}
                          className={`w-full px-4 py-3 text-left flex items-center transition-colors duration-150 ${
                            option.value === filterStatus
                              ? theme === 'dark'
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-100 text-blue-700'
                              : theme === 'dark'
                                ? 'text-gray-300 hover:bg-gray-600'
                                : 'text-gray-700 hover:bg-gray-50'
                          } ${index !== filterOptions.length - 1 ? 'border-b border-gray-200 dark:border-gray-600' : ''}`}
                        >
                          <span className="font-medium">{option.label}</span>
                          {option.value === filterStatus && (
                            <div className="ml-auto">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="mb-4">
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => {
              // Handle new session
              console.log('Create new session')
            }}
          >
            <AddIcon className="w-4 h-4 mr-2" />
            New Session
          </Button>
        </div>

        {/* Sessions List */}
        <div className="space-y-4">
          {filteredSessions.map((session) => (
            <Card 
              key={session.id} 
              className={`border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4`}
              style={{
                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                boxShadow: 'none !important'
              }}
            >
              {/* Session Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: getAvatarColor(session.student),
                      fontSize: '0.875rem',
                      fontWeight: 'bold',
                      mr: 2
                    }}
                  >
                    {getInitials(session.student)}
                  </Avatar>
                  <div>
                    <h3 className={`font-semibold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {session.student}
                    </h3>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {session.subject}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  session.status === 'confirmed' 
                    ? 'bg-green-100 text-green-800' 
                    : session.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : session.status === 'completed'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {session.status}
                </span>
              </div>

              {/* Session Details */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center">
                  <Schedule className="w-4 h-4 text-gray-400 mr-2" />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {session.date} at {session.time}
                  </span>
                </div>
                <div className="flex items-center">
                  <Assignment className="w-4 h-4 text-gray-400 mr-2" />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {session.topic}
                  </span>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 mr-2" />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Rating: {session.rating}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Duration: {session.duration}
                  </span>
                </div>
              </div>

              {/* Session Notes */}
              <div className="mb-3">
                <p className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Notes:
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {session.notes}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  size="small" 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <VideoCall className="w-4 h-4 mr-1" />
                  Join
                </Button>
                <Button 
                  size="small" 
                  variant="outlined"
                  style={{
                    backgroundColor: theme === 'dark' ? '#000000' : '#ffffff',
                    color: theme === 'dark' ? '#ffffff' : '#000000',
                    borderColor: theme === 'dark' ? '#000000' : '#d1d5db',
                    textTransform: 'none',
                    fontWeight: '500'
                  }}
                >
                  <Chat className="w-4 h-4 mr-1" />
                  Chat
                </Button>
                <Button 
                  size="small" 
                  variant="outlined"
                  onClick={() => handleEditSession(session)}
                  style={{
                    backgroundColor: theme === 'dark' ? '#000000' : '#ffffff',
                    color: theme === 'dark' ? '#ffffff' : '#000000',
                    borderColor: theme === 'dark' ? '#000000' : '#d1d5db',
                    textTransform: 'none',
                    fontWeight: '500'
                  }}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  size="small" 
                  variant="outlined"
                  style={{
                    backgroundColor: theme === 'dark' ? '#000000' : '#ffffff',
                    color: theme === 'dark' ? '#ffffff' : '#000000',
                    borderColor: theme === 'dark' ? '#000000' : '#d1d5db',
                    textTransform: 'none',
                    fontWeight: '500'
                  }}
                >
                  <Assignment className="w-4 h-4 mr-1" />
                  Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleDrawerToggle}></div>
          <div className={`fixed left-0 top-0 h-full w-80 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
            <div className="p-6">
              {/* Mobile Header */}
              <div className="flex items-center justify-between mb-8">
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

              {/* Quick Actions - Moved to top */}
              <div className="mb-8">
                <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  QUICK ACTIONS
                </h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => {
                      navigate('/tutor')
                      setMobileOpen(false)
                    }}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-left bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors`}
                  >
                    <ArrowBackIcon className="mr-3 w-4 h-4" />
                    Back to Dashboard
                  </button>
                </div>
              </div>

              {/* Mobile Session Stats */}
              <div className="mb-8">
                <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  SESSION STATS
                </h3>
                <div className="space-y-3">
                  {stats.map((stat, index) => (
                    <div key={index} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{stat.title}:</span>
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {stat.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Navigation */}
              <div className="flex-1 space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleMenuClick(item)
                      setMobileOpen(false)
                    }}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                      activeMenu === item.id
                        ? 'bg-yellow-100 text-yellow-700'
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
      )}

      {/* Edit Session Dialog */}
      <Dialog 
        open={isEditDialogOpen} 
        onClose={() => setIsEditDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            color: theme === 'dark' ? '#ffffff' : '#000000'
          }
        }}
      >
        <DialogTitle style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>
          Edit Session
        </DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={selectedSession?.date || ''}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: theme === 'dark' ? '#ffffff' : '#000000',
                    backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                    '& fieldset': {
                      borderColor: theme === 'dark' ? '#6b7280' : '#d1d5db'
                    },
                    '&:hover fieldset': {
                      borderColor: theme === 'dark' ? '#9ca3af' : '#9ca3af'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme === 'dark' ? '#3b82f6' : '#3b82f6'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: theme === 'dark' ? '#9ca3af' : '#6b7280'
                  }
                }}
              />
              </div>
              <div>
              <TextField
                fullWidth
                label="Time"
                type="time"
                value={selectedSession?.time || ''}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: theme === 'dark' ? '#ffffff' : '#000000',
                    backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                    '& fieldset': {
                      borderColor: theme === 'dark' ? '#6b7280' : '#d1d5db'
                    },
                    '&:hover fieldset': {
                      borderColor: theme === 'dark' ? '#9ca3af' : '#9ca3af'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme === 'dark' ? '#3b82f6' : '#3b82f6'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: theme === 'dark' ? '#9ca3af' : '#6b7280'
                  }
                }}
              />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
              <FormControl fullWidth>
                <InputLabel sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>Status</InputLabel>
                <Select
                  value={selectedSession?.status || ''}
                  label="Status"
                  sx={{
                    color: theme === 'dark' ? '#ffffff' : '#000000',
                    backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme === 'dark' ? '#6b7280' : '#d1d5db'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme === 'dark' ? '#9ca3af' : '#9ca3af'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme === 'dark' ? '#3b82f6' : '#3b82f6'
                    }
                  }}
                >
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
              </div>
              <div>
              <TextField
                fullWidth
                label="Duration"
                value={selectedSession?.duration || ''}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: theme === 'dark' ? '#ffffff' : '#000000',
                    backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                    '& fieldset': {
                      borderColor: theme === 'dark' ? '#6b7280' : '#d1d5db'
                    },
                    '&:hover fieldset': {
                      borderColor: theme === 'dark' ? '#9ca3af' : '#9ca3af'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme === 'dark' ? '#3b82f6' : '#3b82f6'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: theme === 'dark' ? '#9ca3af' : '#6b7280'
                  }
                }}
              />
              </div>
            </div>
            <div>
              <TextField
                fullWidth
                label="Topic"
                value={selectedSession?.topic || ''}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: theme === 'dark' ? '#ffffff' : '#000000',
                    backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                    '& fieldset': {
                      borderColor: theme === 'dark' ? '#6b7280' : '#d1d5db'
                    },
                    '&:hover fieldset': {
                      borderColor: theme === 'dark' ? '#9ca3af' : '#9ca3af'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme === 'dark' ? '#3b82f6' : '#3b82f6'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: theme === 'dark' ? '#9ca3af' : '#6b7280'
                  }
                }}
              />
            </div>
            <div>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={selectedSession?.notes || ''}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: theme === 'dark' ? '#ffffff' : '#000000',
                    backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                    '& fieldset': {
                      borderColor: theme === 'dark' ? '#6b7280' : '#d1d5db'
                    },
                    '&:hover fieldset': {
                      borderColor: theme === 'dark' ? '#9ca3af' : '#9ca3af'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme === 'dark' ? '#3b82f6' : '#3b82f6'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: theme === 'dark' ? '#9ca3af' : '#6b7280'
                  }
                }}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <MuiButton 
            onClick={() => setIsEditDialogOpen(false)}
            style={{
              backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
              color: theme === 'dark' ? '#ffffff' : '#000000',
              borderColor: theme === 'dark' ? '#6b7280' : '#d1d5db'
            }}
          >
            Cancel
          </MuiButton>
          <MuiButton 
            onClick={handleSaveEdit} 
            variant="outlined"
            style={{
              backgroundColor: theme === 'dark' ? '#000000' : '#3b82f6',
              color: theme === 'dark' ? '#ffffff' : '#ffffff',
              borderColor: theme === 'dark' ? '#3b82f6' : '#3b82f6',
              textTransform: 'none',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1e40af' : '#2563eb'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme === 'dark' ? '#000000' : '#3b82f6'
            }}
          >
            Save Changes
          </MuiButton>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default ManageSessionsMobile
