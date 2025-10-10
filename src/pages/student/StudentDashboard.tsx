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
  List as ListIcon,
  BarChart as BarChartIcon,
  WorkspacePremium as WorkspacePremiumIcon,
  Download as DownloadIcon
} from '@mui/icons-material'

const StudentDashboard: React.FC = () => {
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

  // Mock data
  const stats = [
    { title: 'Total Courses', value: '24', icon: <SchoolIcon /> },
    { title: 'Completed', value: '18', icon: <CheckCircleIcon /> },
    { title: 'In Progress', value: '6', icon: <AutorenewIcon /> }
  ]

  const continueWatching = [
    {
      id: 1,
      title: 'Advanced React Patterns',
      instructor: 'John Doe',
      progress: 75,
      thumbnail: '/api/placeholder/268/258',
      duration: '2h 30m'
    },
    {
      id: 2,
      title: 'TypeScript Fundamentals',
      instructor: 'Jane Smith',
      progress: 45,
      thumbnail: '/api/placeholder/268/258',
      duration: '3h 15m'
    },
    {
      id: 3,
      title: 'Node.js Backend Development',
      instructor: 'Mike Johnson',
      progress: 90,
      thumbnail: '/api/placeholder/268/258',
      duration: '4h 20m'
    }
  ]

  const mentors = [
    { name: 'Sarah Wilson', course: 'Web Development', status: 'Online' },
    { name: 'David Chen', course: 'Data Science', status: 'Offline' },
    { name: 'Emily Brown', course: 'UI/UX Design', status: 'Online' },
    { name: 'Alex Taylor', course: 'Mobile Development', status: 'Online' }
  ]

  const friends = [
    { name: 'Alice Johnson', course: 'React Mastery' },
    { name: 'Bob Smith', course: 'Python Basics' },
    { name: 'Carol Davis', course: 'JavaScript ES6' }
  ]

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, path: '/student' },
    { id: 'search-tutors', label: 'Find Tutors', icon: <SchoolIcon />, path: '/student/search' },
    { id: 'book-session', label: 'Book Session', icon: <ListIcon />, path: '/student/book' },
    { id: 'view-progress', label: 'View Progress', icon: <BarChartIcon />, path: '/student/progress' },
    { id: 'evaluate-session', label: 'Evaluate Session', icon: <StarIcon />, path: '/student/evaluate' },
    { id: 'session-detail', label: 'Session Details', icon: <WorkspacePremiumIcon />, path: '/student/session' },
    { id: 'chatbot-support', label: 'AI Support', icon: <DownloadIcon />, path: '/student/chatbot' }
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

            {/* Friends Section */}
            <div className="mb-8">
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                FRIENDS
              </h3>
              <div className="space-y-3">
                {friends.map((friend, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-8 h-8 bg-gray-300 rounded-full mr-3"></div>
                    <div>
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {friend.name}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {friend.course}
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
            <div className="mt-8 p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-2">
                  <StarIcon className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-white font-semibold text-sm">Unlock Premium Resources & Features</h3>
              </div>
              <Button className="w-full bg-white text-blue-600 hover:bg-gray-100 text-sm font-medium">
                Upgrade
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
                  placeholder="Search courses, instructors, or topics..."
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
          <div className={`relative rounded-2xl p-4 sm:p-8 mb-8 overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-gradient-to-r from-blue-600 to-blue-600'}`}>
            <div className="relative z-10">
              <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-blue-100'}`}>
                Online Course
              </p>
              <h1 className={`text-2xl sm:text-3xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-white'}`}>
                Sharpen Your Skills With Professional Online Courses
              </h1>
              <Button className="bg-white text-blue-600 hover:bg-gray-100">
                Start Learning
              </Button>
            </div>
            {/* Decorative stars */}
            <div className="absolute top-4 right-4 text-yellow-400 text-4xl sm:text-6xl opacity-20">
              <StarIcon className="w-12 h-12 sm:w-16 sm:h-16" />
            </div>
            <div className="absolute bottom-4 right-8 text-yellow-400 text-2xl sm:text-4xl opacity-20">
              <StarIcon className="w-8 h-8 sm:w-12 sm:h-12" />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                  <div className="text-3xl text-blue-600">{stat.icon}</div>
                </div>
              </Card>
            ))}
          </div>

          {/* Continue Watching Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Continue watching
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
              {continueWatching.map((course) => (
                <Card key={course.id} className={`overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="relative">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-black bg-opacity-50 rounded-lg p-2">
                        <div className="w-full bg-gray-300 rounded-full h-2 mb-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                        <p className="text-white text-sm">{course.progress}% Complete</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {course.title}
                    </h3>
                    <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {course.instructor}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {course.duration}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Your Mentor Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Your Mentor
              </h2>
              <button className={`text-sm ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}>
                See All
              </button>
            </div>

            <div className={`rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} overflow-hidden`}>
              {/* Table Header - Hidden on mobile */}
              <div className={`px-6 py-3 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} hidden lg:block`}>
                <div className="grid grid-cols-4 gap-4 text-sm font-medium">
                  <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Instructor & Date</div>
                  <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>COURSE TYPE</div>
                  <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>COURSE TITLE</div>
                  <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>ACTIONS</div>
                </div>
              </div>

              {/* Table Rows */}
              {mentors.map((mentor, index) => (
                <div key={index} className={`px-4 lg:px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} last:border-b-0`}>
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-300 rounded-full mr-3"></div>
                      <div>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {mentor.name}
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {mentor.course}
                        </p>
                      </div>
                    </div>
                    <div className="hidden lg:block">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        mentor.status === 'Online' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {mentor.status}
                      </span>
                    </div>
                    <div className={`hidden lg:block ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {mentor.course}
                    </div>
                    <div className="flex justify-end lg:justify-start">
                      <Button size="small" variant="outlined">
                        View
                      </Button>
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
                Good Morning Prashant
              </h4>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Continue your journey and achieve Your Target
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
                Your Progress
              </h4>
              <div className="flex items-end space-x-2 h-20">
                {[40, 70, 90, 100, 85].map((height, index) => (
                  <div
                    key={index}
                    className="bg-blue-500 rounded-t"
                    style={{ height: `${height}%`, width: '20%' }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Mentor List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Your Mentor
                </h4>
                <button className="text-sm text-blue-600">
                  <MoreVertIcon className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-3">
                {mentors.slice(0, 4).map((mentor, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-8 h-8 bg-gray-300 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {mentor.name}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {mentor.course}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="w-full mt-4" variant="outlined">
                View All Mentors
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

export default StudentDashboard
