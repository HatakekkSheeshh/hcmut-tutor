import React, { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { 
  Typography, 
  TextField,
  Button as MuiButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar
} from '@mui/material'
import { 
  Dashboard as DashboardIcon,
  Schedule as ScheduleIcon,
  Autorenew as AutorenewIcon,
  Chat as ChatIcon,
  Cancel, 
  Schedule, 
  CheckCircle,
  Info,
  Menu as MenuIcon,
  ArrowBack as ArrowBackIcon,
  BarChart as BarChartIcon,
  Assignment as AssignmentIcon,
  Close as CloseIcon,
  ChevronRight as ChevronRightIcon,
  FilterList as FilterListIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon
} from '@mui/icons-material'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const HandleCancelRescheduleMobile: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [filterType, setFilterType] = useState('all')
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState('')
  const [reason, setReason] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleThemeToggle = () => {
    toggleTheme()
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
    { value: 'all', label: 'All Requests' },
    { value: 'cancel', label: 'Cancellation' },
    { value: 'reschedule', label: 'Reschedule' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ]

  const getSelectedFilter = () => {
    return filterOptions.find(option => option.value === filterType) || filterOptions[0]
  }

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

  const requests = [
    {
      id: 1,
      student: 'John Smith',
      subject: 'Mathematics',
      originalDate: '2024-01-15',
      originalTime: '10:00 AM',
      requestType: 'cancel',
      reason: 'Family emergency',
      requestDate: '2024-01-14',
      status: 'pending',
      avatar: '/api/placeholder/40/40',
      sessionId: 'SES-001',
      urgency: 'high'
    },
    {
      id: 2,
      student: 'Sarah Johnson',
      subject: 'Physics',
      originalDate: '2024-01-16',
      originalTime: '2:00 PM',
      requestType: 'reschedule',
      reason: 'Conflicting exam',
      requestDate: '2024-01-15',
      status: 'pending',
      avatar: '/api/placeholder/40/40',
      sessionId: 'SES-002',
      urgency: 'medium',
      preferredDate: '2024-01-17',
      preferredTime: '3:00 PM'
    },
    {
      id: 3,
      student: 'Mike Chen',
      subject: 'Chemistry',
      originalDate: '2024-01-18',
      originalTime: '9:00 AM',
      requestType: 'cancel',
      reason: 'Illness',
      requestDate: '2024-01-17',
      status: 'approved',
      avatar: '/api/placeholder/40/40',
      sessionId: 'SES-003',
      urgency: 'high'
    },
    {
      id: 4,
      student: 'Alice Brown',
      subject: 'Mathematics',
      originalDate: '2024-01-19',
      originalTime: '3:00 PM',
      requestType: 'reschedule',
      reason: 'Schedule conflict',
      requestDate: '2024-01-18',
      status: 'rejected',
      avatar: '/api/placeholder/40/40',
      sessionId: 'SES-004',
      urgency: 'low'
    }
  ]

  const filteredRequests = requests.filter(request => {
    if (filterType === 'all') return true
    return request.requestType === filterType || request.status === filterType
  })

  const handleAction = (request: any, type: string) => {
    setSelectedRequest(request)
    setActionType(type)
    setIsActionDialogOpen(true)
  }

  const handleSubmitAction = () => {
    // In a real app, this would process the action
    console.log('Action submitted:', {
      request: selectedRequest,
      action: actionType,
      reason,
      newDate,
      newTime
    })
    setIsActionDialogOpen(false)
    setReason('')
    setNewDate('')
    setNewTime('')
  }

  const stats = [
    { title: 'Pending', value: requests.filter(r => r.status === 'pending').length, color: 'yellow' },
    { title: 'Approved', value: requests.filter(r => r.status === 'approved').length, color: 'green' },
    { title: 'Rejected', value: requests.filter(r => r.status === 'rejected').length, color: 'red' },
    { title: 'Total', value: requests.length, color: 'blue' }
  ]

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, path: '/tutor' },
    { id: 'availability', label: 'Set Availability', icon: <ScheduleIcon />, path: '/tutor/availability' },
    { id: 'sessions', label: 'Manage Sessions', icon: <AssignmentIcon />, path: '/tutor/sessions' },
    { id: 'progress', label: 'Track Progress', icon: <BarChartIcon />, path: '/tutor/track-progress' },
    { id: 'cancel-reschedule', label: 'Cancel/Reschedule', icon: <AutorenewIcon />, path: '/tutor/cancel-reschedule' },
    { id: 'messages', label: 'Messages', icon: <ChatIcon />, path: '/tutor/messages' }
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
                Cancel/Reschedule
              </h1>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Manage student requests
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
                  stat.color === 'yellow' ? 'text-yellow-500' :
                  stat.color === 'green' ? 'text-green-500' :
                  stat.color === 'red' ? 'text-red-500' :
                  'text-blue-500'
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
              Filters
            </h3>
            <div className="space-y-3 overflow-visible">
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
                      {filterOptions.map((option, index) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setFilterType(option.value)
                            setShowFilterDropdown(false)
                          }}
                          className={`w-full px-4 py-3 text-left flex items-center transition-colors duration-150 ${
                            option.value === filterType
                              ? theme === 'dark'
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-100 text-blue-700'
                              : theme === 'dark'
                                ? 'text-gray-300 hover:bg-gray-600'
                                : 'text-gray-700 hover:bg-gray-50'
                          } ${index !== filterOptions.length - 1 ? 'border-b border-gray-200 dark:border-gray-600' : ''}`}
                        >
                          <span className="font-medium">{option.label}</span>
                          {option.value === filterType && (
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
              <div className="flex flex-wrap gap-2">
                <span className={`px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full`}>
                  Pending: {requests.filter(r => r.status === 'pending').length}
                </span>
                <span className={`px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full`}>
                  Approved: {requests.filter(r => r.status === 'approved').length}
                </span>
                <span className={`px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full`}>
                  Rejected: {requests.filter(r => r.status === 'rejected').length}
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => {
              // Handle bulk approve
              console.log('Bulk approve all pending')
            }}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve All
          </Button>
          <Button 
            variant="outlined"
            style={{
              backgroundColor: theme === 'dark' ? '#000000' : '#ffffff',
              color: theme === 'dark' ? '#ffffff' : '#dc2626',
              borderColor: theme === 'dark' ? '#000000' : '#dc2626',
              textTransform: 'none',
              fontWeight: '500'
            }}
            onClick={() => {
              // Handle bulk reject
              console.log('Bulk reject all pending')
            }}
          >
            <Cancel className="w-4 h-4 mr-2" />
            Reject All
          </Button>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card 
              key={request.id} 
              className={`border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4`}
              style={{
                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                boxShadow: 'none !important'
              }}
            >
              {/* Request Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: getAvatarColor(request.student),
                      fontSize: '0.875rem',
                      fontWeight: 'bold',
                      mr: 2
                    }}
                  >
                    {getInitials(request.student)}
                  </Avatar>
                  <div>
                    <h3 className={`font-semibold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {request.student}
                    </h3>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {request.subject} • {request.sessionId}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  request.status === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : request.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {request.status}
                </span>
              </div>

              {/* Request Type and Urgency */}
              <div className="flex space-x-2 mb-3">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  request.requestType === 'cancel' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {request.requestType}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  request.urgency === 'high' 
                    ? 'bg-red-100 text-red-800' 
                    : request.urgency === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {request.urgency}
                </span>
              </div>

              {/* Session Details */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center">
                  <Schedule className="w-4 h-4 text-gray-400 mr-2" />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Original: {request.originalDate} at {request.originalTime}
                  </span>
                </div>
                {request.requestType === 'reschedule' && request.preferredDate && (
                  <div className="flex items-center">
                    <Schedule className="w-4 h-4 text-gray-400 mr-2" />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      Preferred: {request.preferredDate} at {request.preferredTime}
                    </span>
                  </div>
                )}
                <div className="flex items-center">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Requested: {request.requestDate}
                  </span>
                </div>
              </div>

              {/* Reason */}
              <div className="mb-3">
                <h4 className={`text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Reason:
                </h4>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {request.reason}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                {request.status === 'pending' ? (
                  <>
                    <Button 
                      size="small" 
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleAction(request, 'approve')}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      className="flex-1"
                      style={{
                        backgroundColor: theme === 'dark' ? '#000000' : '#ffffff',
                        color: theme === 'dark' ? '#ffffff' : '#dc2626',
                        borderColor: theme === 'dark' ? '#000000' : '#dc2626',
                        textTransform: 'none',
                        fontWeight: '500'
                      }}
                      onClick={() => handleAction(request, 'reject')}
                    >
                      <Cancel className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </>
                ) : (
                  <Button 
                    size="small" 
                    variant="outlined"
                    className="flex-1"
                    style={{
                      backgroundColor: theme === 'dark' ? '#000000' : '#ffffff',
                      color: theme === 'dark' ? '#ffffff' : '#000000',
                      borderColor: theme === 'dark' ? '#000000' : '#d1d5db',
                      textTransform: 'none',
                      fontWeight: '500'
                    }}
                  >
                    <Info className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                )}
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

              {/* Mobile Request Stats */}
              <div className="mb-8">
                <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  REQUEST STATS
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
              <div className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate(item.path)
                      setMobileOpen(false)
                    }}
                    className={`w-full flex items-center px-3 py-3 rounded-lg text-left transition-colors ${
                      item.id === 'cancel-reschedule'
                        ? 'bg-orange-100 text-orange-700'
                        : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                    <ChevronRightIcon className="ml-auto w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Dialog */}
      <Dialog open={isActionDialogOpen} onClose={() => setIsActionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
        </DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-4">
            <div>
              <Typography variant="body1" gutterBottom>
                Student: {selectedRequest?.student}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Session: {selectedRequest?.subject} - {selectedRequest?.originalDate} at {selectedRequest?.originalTime}
              </Typography>
            </div>

            {actionType === 'approve' && selectedRequest?.requestType === 'reschedule' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <TextField
                    fullWidth
                    label="New Date"
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </div>
                <div>
                  <TextField
                    fullWidth
                    label="New Time"
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </div>
              </div>
            )}

            <div>
              <TextField
                fullWidth
                label="Response Message"
                multiline
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={
                  actionType === 'approve' 
                    ? 'Message to send to student about approval...'
                    : 'Reason for rejection...'
                }
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setIsActionDialogOpen(false)}>Cancel</MuiButton>
          <MuiButton 
            onClick={handleSubmitAction} 
            variant="contained"
            color={actionType === 'approve' ? 'success' : 'error'}
          >
            {actionType === 'approve' ? 'Approve' : 'Reject'}
          </MuiButton>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default HandleCancelRescheduleMobile
