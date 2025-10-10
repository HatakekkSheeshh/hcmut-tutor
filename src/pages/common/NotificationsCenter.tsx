import React, { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { 
  Notifications,
  MarkAsUnread,
  Delete,
  FilterList,
  Search,
  Schedule,
  Person,
  School,
  CheckCircle,
  Info,
  Menu as MenuIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  LibraryBooks as LibraryIcon,
  Forum as ForumIcon
} from '@mui/icons-material'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const NotificationsCenter: React.FC = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const notifications = [
    {
      id: 1,
      title: 'New session booking request',
      message: 'Sarah Johnson has requested a tutoring session for Mathematics on Friday at 2:00 PM.',
      type: 'booking',
      priority: 'high',
      isRead: false,
      timestamp: '5 minutes ago',
      sender: 'System',
      action: 'Review Request'
    },
    {
      id: 2,
      title: 'Assignment graded',
      message: 'Your Calculus assignment has been graded. You received 95/100 points.',
      type: 'academic',
      priority: 'medium',
      isRead: false,
      timestamp: '1 hour ago',
      sender: 'Dr. Mike Chen',
      action: 'View Grade'
    },
    {
      id: 3,
      title: 'Study group invitation',
      message: 'Alice Brown has invited you to join a Physics study group.',
      type: 'social',
      priority: 'low',
      isRead: true,
      timestamp: '3 hours ago',
      sender: 'Alice Brown',
      action: 'Join Group'
    },
    {
      id: 4,
      title: 'System maintenance scheduled',
      message: 'The platform will undergo maintenance on Sunday from 2:00 AM to 4:00 AM EST.',
      type: 'system',
      priority: 'medium',
      isRead: true,
      timestamp: '1 day ago',
      sender: 'Admin',
      action: 'View Details'
    },
    {
      id: 5,
      title: 'Payment received',
      message: 'Payment of $150 has been received for your tutoring services.',
      type: 'financial',
      priority: 'high',
      isRead: false,
      timestamp: '2 days ago',
      sender: 'Payment System',
      action: 'View Transaction'
    },
    {
      id: 6,
      title: 'New forum post',
      message: 'There\'s a new discussion in the Mathematics forum that might interest you.',
      type: 'social',
      priority: 'low',
      isRead: true,
      timestamp: '3 days ago',
      sender: 'Community',
      action: 'View Post'
    }
  ]

  const filterOptions = [
    { name: 'All Notifications', value: 'all' },
    { name: 'Unread Only', value: 'unread' },
    { name: 'Read Only', value: 'read' }
  ]

  const typeOptions = [
    { name: 'All Types', value: 'all' },
    { name: 'Academic', value: 'academic' },
    { name: 'Booking', value: 'booking' },
    { name: 'Social', value: 'social' },
    { name: 'System', value: 'system' },
    { name: 'Financial', value: 'financial' }
  ]

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        notification.sender.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'unread' && !notification.isRead) ||
                         (selectedFilter === 'read' && notification.isRead)
    const matchesType = selectedType === 'all' || notification.type === selectedType
    return matchesSearch && matchesFilter && matchesType
  })

  const handleMarkAsRead = (notificationId: number) => {
    console.log('Mark as read:', notificationId)
  }

  const handleDelete = (notificationId: number) => {
    console.log('Delete notification:', notificationId)
  }

  const handleMarkAllAsRead = () => {
    console.log('Mark all as read')
  }

  const handleDeleteAll = () => {
    console.log('Delete all notifications')
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking': return <Schedule />
      case 'academic': return <School />
      case 'social': return <Person />
      case 'system': return <Info />
      case 'financial': return <CheckCircle />
      default: return <Notifications />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'booking': return 'bg-blue-100 text-blue-800'
      case 'academic': return 'bg-purple-100 text-purple-800'
      case 'social': return 'bg-green-100 text-green-800'
      case 'system': return 'bg-gray-100 text-gray-800'
      case 'financial': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <div className={`w-full lg:w-60 h-auto lg:h-screen ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-r ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} lg:block`}>
          <div className="p-6">
            {/* Logo */}
            <div className="flex items-center mb-8">
              <div className="w-10 h-10 flex items-center justify-center mr-3">
                <img src="/HCMCUT.svg" alt="HCMUT Logo" className="w-10 h-10" />
              </div>
              <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                HCMUT
              </span>
            </div>

            {/* Notification Stats */}
            <div className="mb-8">
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                NOTIFICATION STATS
              </h3>
              <div className="space-y-3">
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Total:</span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {notifications.length}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Unread:</span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {notifications.filter(n => !n.isRead).length}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>High Priority:</span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {notifications.filter(n => n.priority === 'high').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                QUICK ACTIONS
              </h3>
              <div className="space-y-2">
                <button 
                  onClick={() => navigate('/common')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <ArrowBackIcon className="mr-3 w-4 h-4" />
                  Back to Login
                </button>
                <button 
                  onClick={() => navigate('/common/profile')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <PersonIcon className="mr-3 w-4 h-4" />
                  Profile Management
                </button>
                <button 
                  onClick={() => navigate('/common/library')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <LibraryIcon className="mr-3 w-4 h-4" />
                  Digital Library
                </button>
                <button 
                  onClick={() => navigate('/common/forum')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <ForumIcon className="mr-3 w-4 h-4" />
                  Community Forum
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-6">
          {/* Mobile Menu Button */}
          <div className="lg:hidden mb-4">
            <button
              onClick={handleDrawerToggle}
              className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <MenuIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Notifications Center
                </h1>
                <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Stay updated with your latest notifications and alerts
                </p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={handleMarkAllAsRead}
                  variant="outlined"
                  className="border-blue-500 text-blue-500 hover:bg-blue-50"
                >
                  <MarkAsUnread className="w-4 h-4 mr-2" />
                  Mark All Read
                </Button>
                <Button 
                  onClick={handleDeleteAll}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Delete className="w-4 h-4 mr-2" />
                  Delete All
                </Button>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Search */}
            <div className="lg:col-span-2">
              <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6`}>
                <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Search & Filter Notifications
                </h3>
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full px-4 py-3 pl-10 rounded-lg border ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Search className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <select
                      value={selectedFilter}
                      onChange={(e) => setSelectedFilter(e.target.value)}
                      className={`w-full px-3 py-3 border rounded-lg ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      {filterOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className={`w-full px-3 py-3 border rounded-lg ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      {typeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6`}>
                <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button className={`w-full flex items-center px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  } transition-colors`}>
                    <MarkAsUnread className="mr-3 w-4 h-4" />
                    Mark All Read
                  </button>
                  <button className={`w-full flex items-center px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  } transition-colors`}>
                    <Delete className="mr-3 w-4 h-4" />
                    Clear All
                  </button>
                  <button className={`w-full flex items-center px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  } transition-colors`}>
                    <FilterList className="mr-3 w-4 h-4" />
                    Filter Settings
                  </button>
                </div>
              </Card>
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <Card key={notification.id} className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} overflow-hidden ${
                !notification.isRead ? 'border-l-4 border-blue-500' : ''
              }`}>
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Notification Icon */}
                    <div className={`p-3 rounded-full ${
                      notification.isRead 
                        ? 'bg-gray-100 text-gray-600' 
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className={`font-semibold text-lg mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {notification.title}
                          </h3>
                          <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-4 mb-3">
                            <div className="flex items-center">
                              <Person className="w-4 h-4 text-gray-400 mr-2" />
                              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                {notification.sender}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Schedule className="w-4 h-4 text-gray-400 mr-2" />
                              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                {notification.timestamp}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(notification.priority)}`}>
                              {notification.priority}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(notification.type)}`}>
                              {notification.type}
                            </span>
                            {!notification.isRead && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2 mt-4">
                        <Button 
                          size="small" 
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {notification.action}
                        </Button>
                        {!notification.isRead && (
                          <Button 
                            size="small" 
                            variant="outlined"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="border-green-500 text-green-500 hover:bg-green-50"
                          >
                            <MarkAsUnread className="w-4 h-4 mr-1" />
                            Mark Read
                          </Button>
                        )}
                        <Button 
                          size="small" 
                          variant="outlined"
                          onClick={() => handleDelete(notification.id)}
                          className="border-red-500 text-red-500 hover:bg-red-50"
                        >
                          <Delete className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
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
                  <MenuIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Notification Stats */}
              <div className="mb-8">
                <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  NOTIFICATION STATS
                </h3>
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Total:</span>
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {notifications.length}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Unread:</span>
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {notifications.filter(n => !n.isRead).length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Quick Actions */}
              <div className="space-y-2">
                <button 
                  onClick={() => {
                    navigate('/common')
                    setMobileOpen(false)
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <ArrowBackIcon className="mr-3 w-4 h-4" />
                  Back to Login
                </button>
                <button 
                  onClick={() => {
                    navigate('/common/profile')
                    setMobileOpen(false)
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <PersonIcon className="mr-3 w-4 h-4" />
                  Profile Management
                </button>
                <button 
                  onClick={() => {
                    navigate('/common/library')
                    setMobileOpen(false)
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <LibraryIcon className="mr-3 w-4 h-4" />
                  Digital Library
                </button>
                <button 
                  onClick={() => {
                    navigate('/common/forum')
                    setMobileOpen(false)
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <ForumIcon className="mr-3 w-4 h-4" />
                  Community Forum
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationsCenter
