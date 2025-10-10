import React, { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import {
  Dashboard as DashboardIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Autorenew as AutorenewIcon,
  Star as StarIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  MoreVert as MoreVertIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Menu as MenuIcon,
  BarChart as BarChartIcon,
  Folder as FolderIcon,
  Download as DownloadIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  VideoCall as VideoCallIcon,
  Chat as ChatIcon
} from '@mui/icons-material'

const TutorDashboard: React.FC = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleMenuClick = (item: any) => {
    setActiveMenu(item.id)
    if (item.path) {
      navigate(item.path)
    }
  }

  // Mock data for tutor
  const stats = [
    { title: 'Total Students', value: '24', icon: <PeopleIcon /> },
    { title: 'Sessions This Month', value: '18', icon: <CheckCircleIcon /> },
    { title: 'Average Rating', value: '4.9', icon: <StarIcon /> },
    { title: 'Earnings', value: '$2,400', icon: <TrendingUpIcon /> }
  ]

  const upcomingSessions = [
    {
      id: 1,
      student: 'John Smith',
      subject: 'Mathematics',
      date: '2024-01-15',
      time: '10:00 AM',
      duration: '60 min',
      status: 'confirmed',
      progress: 75
    },
    {
      id: 2,
      student: 'Sarah Johnson',
      subject: 'Physics',
      date: '2024-01-15',
      time: '2:00 PM',
      duration: '90 min',
      status: 'pending',
      progress: 45
    },
    {
      id: 3,
      student: 'Mike Chen',
      subject: 'Chemistry',
      date: '2024-01-16',
      time: '9:00 AM',
      duration: '60 min',
      status: 'confirmed',
      progress: 90
    }
  ]

  const recentStudents = [
    { name: 'Alice Brown', subject: 'Mathematics', lastSession: '2024-01-10', progress: 85, rating: 5 },
    { name: 'David Wilson', subject: 'Physics', lastSession: '2024-01-08', progress: 78, rating: 4 },
    { name: 'Emma Davis', subject: 'Chemistry', lastSession: '2024-01-05', progress: 92, rating: 5 },
    { name: 'Tom Anderson', subject: 'Biology', lastSession: '2024-01-03', progress: 88, rating: 5 }
  ]

  const notifications = [
    { message: 'New session request from John Smith', time: '2 hours ago', type: 'session' },
    { message: 'Student feedback received from Alice Brown', time: '1 day ago', type: 'feedback' },
    { message: 'Payment received for session with Mike Chen', time: '2 days ago', type: 'payment' },
    { message: 'Schedule change request from Sarah Johnson', time: '3 days ago', type: 'schedule' }
  ]

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, path: '/tutor' },
    { id: 'availability', label: 'Set Availability', icon: <ScheduleIcon />, path: '/tutor/availability' },
    { id: 'sessions', label: 'Manage Sessions', icon: <AssignmentIcon />, path: '/tutor/sessions' },
    { id: 'progress', label: 'Track Progress', icon: <BarChartIcon />, path: '/tutor/track-progress' },
    { id: 'cancel-reschedule', label: 'Cancel/Reschedule', icon: <AutorenewIcon />, path: '/tutor/cancel-reschedule' },
    { id: 'messages', label: 'Messages', icon: <ChatIcon />, path: '/tutor/messages' },
    { id: 'reports', label: 'Reports', icon: <FolderIcon />, path: '/tutor/reports' },
    { id: 'settings', label: 'Settings', icon: <DownloadIcon />, path: '/tutor/settings' }
  ]

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

            {/* Navigation Menu */}
            <div className="mb-8">
              <div className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item)}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
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

            {/* Students Section */}
            <div className="mb-8">
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                RECENT STUDENTS
              </h3>
              <div className="space-y-3">
                {recentStudents.slice(0, 3).map((student, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-8 h-8 bg-gray-300 rounded-full mr-3"></div>
                    <div>
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {student.name}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {student.subject}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div>
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                SETTINGS
              </h3>
              <div className="space-y-2">
                <button className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <PersonIcon className="mr-3 w-4 h-4" />
                  Profile
                </button>
                <button className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <NotificationsIcon className="mr-3 w-4 h-4" />
                  Notifications
                </button>
              </div>
            </div>

            {/* Upgrade Section */}
            <div className="mt-8 p-4 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-2">
                  <StarIcon className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-white font-semibold text-sm">Premium Tutor Features</h3>
              </div>
              <Button className="w-full bg-white text-green-600 hover:bg-gray-100 text-sm font-medium">
                Upgrade Now
              </Button>
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

          {/* Search Bar */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search students, sessions, or topics..."
                  className={`w-full px-4 py-3 pl-10 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <SearchIcon className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3">
                Search
              </Button>
            </div>
          </div>

          {/* Hero Section */}
          <div className={`relative rounded-2xl p-4 sm:p-8 mb-8 overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-gradient-to-r from-green-600 to-blue-600'}`}>
            <div className="relative z-10">
              <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-green-100'}`}>
                Teaching Platform
              </p>
              <h1 className={`text-2xl sm:text-3xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-white'}`}>
                Empower Students With Your Knowledge
              </h1>
              <Button className="bg-white text-green-600 hover:bg-gray-100">
                Start Teaching
              </Button>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 text-yellow-400 text-4xl sm:text-6xl opacity-20">
              <SchoolIcon className="w-12 h-12 sm:w-16 sm:h-16" />
            </div>
            <div className="absolute bottom-4 right-8 text-yellow-400 text-2xl sm:text-4xl opacity-20">
              <PeopleIcon className="w-8 h-8 sm:w-12 sm:h-12" />
            </div>
          </div>
      
      {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
              <Card key={index} className={`p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stat.value}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {stat.title}
                    </p>
                  </div>
                  <div className="text-3xl text-green-600">{stat.icon}</div>
                </div>
            </Card>
            ))}
          </div>

          {/* Upcoming Sessions Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Upcoming Sessions
              </h2>
              <div className="flex space-x-2">
                <button className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
                  <ArrowBackIcon className="w-4 h-4" />
                </button>
                <button className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
                  <ArrowForwardIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingSessions.map((session) => (
                <Card key={session.id} className={`overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {session.student}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        session.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                    <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {session.subject}
                    </p>
                    <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {session.date} at {session.time} • {session.duration}
                    </p>
                    <div className="flex space-x-2">
                      <Button size="small" variant="outlined" startIcon={<VideoCallIcon />}>
                    Join
                  </Button>
                      <Button size="small" variant="outlined" startIcon={<ChatIcon />}>
                    Message
                  </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Students Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Recent Students
              </h2>
              <button className={`text-sm ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}>
                See All
              </button>
            </div>

            <div className={`rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} overflow-hidden`}>
              {/* Table Header - Hidden on mobile */}
              <div className={`px-6 py-3 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} hidden lg:block`}>
                <div className="grid grid-cols-4 gap-4 text-sm font-medium">
                  <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Student & Subject</div>
                  <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>LAST SESSION</div>
                  <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>PROGRESS</div>
                  <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>RATING</div>
                </div>
              </div>

              {/* Table Rows */}
            {recentStudents.map((student, index) => (
                <div key={index} className={`px-4 lg:px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} last:border-b-0`}>
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-300 rounded-full mr-3"></div>
                      <div>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {student.name}
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {student.subject}
                        </p>
                      </div>
                    </div>
                    <div className={`hidden lg:block ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {student.lastSession}
                    </div>
                    <div className="hidden lg:block">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${student.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">{student.progress}%</span>
                    </div>
                    <div className="flex justify-end lg:justify-start">
                      <div className="flex items-center">
                        <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="text-sm">{student.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Profile Panel */}
        <div className={`w-full lg:w-80 h-auto lg:h-screen ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-l ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} mt-6 lg:mt-0`}>
          <div className="p-6">
            {/* Profile Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Your Profile
              </h3>
              <button className="p-1">
                <MoreVertIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* User Profile */}
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
              <h4 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Good Morning Dr. Smith
              </h4>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Continue inspiring students and sharing your knowledge
              </p>
            </div>

            {/* Social Links */}
            <div className="flex justify-center space-x-4 mb-8">
              <button className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                <FacebookIcon className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center text-white hover:bg-blue-500 transition-colors">
                <TwitterIcon className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white hover:bg-pink-600 transition-colors">
                <InstagramIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Chart */}
            <div className="mb-8">
              <h4 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Teaching Performance
              </h4>
              <div className="flex items-end space-x-2 h-20">
                {[85, 92, 88, 95, 90].map((height, index) => (
                  <div
                    key={index}
                    className="bg-green-500 rounded-t"
                    style={{ height: `${height}%`, width: '20%' }}
                  ></div>
                ))}
              </div>
            </div>

        {/* Notifications */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Recent Notifications
                </h4>
                <button className="text-sm text-blue-600">
                  <MoreVertIcon className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {notifications.slice(0, 4).map((notification, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {notification.message}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {notification.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="w-full mt-4" variant="outlined">
                View All Notifications
              </Button>
            </div>
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

              {/* Mobile Navigation */}
              <div className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleMenuClick(item)
                      setMobileOpen(false)
                    }}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
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
      )}
    </div>
  )
}

export default TutorDashboard
