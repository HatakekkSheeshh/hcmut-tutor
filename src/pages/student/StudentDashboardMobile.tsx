import React, { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/ui/Card'
import { Avatar } from '@mui/material'
import '../../styles/weather-animations.css'
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Autorenew as AutorenewIcon,
  Star as StarIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  Menu as MenuIcon,
  BarChart as BarChartIcon,
  SmartToy as SmartToyIcon,
  Palette as PaletteIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  LocationOn as LocationOnIcon,
  AccessTime as AccessTimeIcon,
  WbSunny as WbSunnyIcon,
  Cloud as CloudIcon,
  Thunderstorm as ThunderstormIcon,
  AcUnit as AcUnitIcon,
  PersonSearch,
  Class,
  Chat as ChatIcon,
  Home as HomeIcon,
  TrendingUp as TrendingUpIcon,
  Bookmark as BookmarkIcon,
  CalendarMonth,
  Close as CloseIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material'

const StudentDashboardMobile: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showThemeOptions, setShowThemeOptions] = useState(false)
  const [currentTab, setCurrentTab] = useState('home')
  
  // Time and weather states
  const [currentTime, setCurrentTime] = useState(new Date())
  const [weather, setWeather] = useState<any>(null)
  const [weatherLoading, setWeatherLoading] = useState(true)

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
    setShowThemeOptions(false)
  }

  // Weather API function
  const fetchWeather = async () => {
    try {
      setWeatherLoading(true)
      const API_KEY = 'd055198c2320f9b77049b5b9a1db7205'
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=Ho%20Chi%20Minh%20City&appid=${API_KEY}&units=metric`
      )
      const data = await response.json()
      setWeather(data)
    } catch (error) {
      console.error('Error fetching weather:', error)
      setWeather({
        main: { temp: 28, humidity: 75 },
        weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
        name: 'Ho Chi Minh City'
      })
    } finally {
      setWeatherLoading(false)
    }
  }

  // Get weather icon with time consideration
  const getWeatherIcon = (weatherMain: string) => {
    const hour = currentTime.getHours()
    const isNight = hour >= 18 || hour <= 6
    
    switch (weatherMain.toLowerCase()) {
      case 'clear':
        if (isNight) {
          return <WbSunnyIcon className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-400'}`} />
        } else {
          return <WbSunnyIcon className={`w-5 h-5 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'}`} />
        }
      case 'clouds':
        return <CloudIcon className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
      case 'rain':
      case 'drizzle':
        return <ThunderstormIcon className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
      case 'snow':
        return <AcUnitIcon className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-500'}`} />
      default:
        if (isNight) {
          return <WbSunnyIcon className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-400'}`} />
        } else {
          return <WbSunnyIcon className={`w-5 h-5 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'}`} />
        }
    }
  }

  // Get weather background class
  const getWeatherBackground = (weatherMain: string) => {
    switch (weatherMain.toLowerCase()) {
      case 'clear':
        return 'weather-sunny'
      case 'clouds':
        return 'weather-cloudy'
      case 'rain':
      case 'drizzle':
        return 'weather-rainy'
      case 'snow':
        return 'weather-snowy'
      default:
        return 'weather-sunny'
    }
  }

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Get greeting based on time
  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  // useEffect for time and weather
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    fetchWeather()
    const weatherInterval = setInterval(fetchWeather, 10 * 60 * 1000)

    return () => {
      clearInterval(timeInterval)
      clearInterval(weatherInterval)
    }
  }, [])

  // Mock data
  const stats = [
    { title: 'Total Courses', value: '24', icon: <SchoolIcon /> },
    { title: 'Completed', value: '18', icon: <CheckCircleIcon /> },
    { title: 'In Progress', value: '6', icon: <AutorenewIcon /> }
  ]

  const registeredCourses = [
    {
      id: 1,
      title: 'Advanced React Patterns',
      instructor: 'John Doe',
      subject: 'Computer Science',
      progress: 75,
      duration: '2h 30m',
      nextSession: '2024-01-15T14:00:00Z',
      totalSessions: 12,
      completedSessions: 9,
      rating: 4.8,
      status: 'active'
    },
    {
      id: 2,
      title: 'TypeScript Fundamentals',
      instructor: 'Jane Smith',
      subject: 'Programming',
      progress: 45,
      duration: '3h 15m',
      nextSession: '2024-01-16T10:00:00Z',
      totalSessions: 8,
      completedSessions: 4,
      rating: 4.9,
      status: 'active'
    },
    {
      id: 3,
      title: 'Node.js Backend Development',
      instructor: 'Mike Johnson',
      subject: 'Backend Development',
      progress: 90,
      duration: '4h 20m',
      nextSession: '2024-01-17T16:00:00Z',
      totalSessions: 10,
      completedSessions: 9,
      rating: 4.7,
      status: 'active'
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

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, path: '/student' },
    { id: 'search-tutors', label: 'Find Tutors', icon: <PersonSearch />, path: '/student/search' },
    { id: 'book-session', label: 'Book Session', icon: <SchoolIcon />, path: '/student/book' },
    { id: 'calendar', label: 'Calendar', icon: <CalendarMonth />, path: '/student/calendar' },
    { id: 'view-progress', label: 'View Progress', icon: <BarChartIcon />, path: '/student/progress' },
    { id: 'evaluate-session', label: 'Evaluate Session', icon: <StarIcon />, path: '/student/evaluate' },
    { id: 'session-detail', label: 'Session Details', icon: <Class />, path: '/student/session' },
    { id: 'chatbot-support', label: 'AI Support', icon: <SmartToyIcon />, path: '/student/chatbot' },
    { id: 'messages', label: 'Messages', icon: <ChatIcon />, path: '/student/messages' }
  ]

  const bottomNavItems = [
    { id: 'home', label: 'Home', icon: <HomeIcon /> },
    { id: 'courses', label: 'Courses', icon: <BookmarkIcon /> },
    { id: 'progress', label: 'Progress', icon: <TrendingUpIcon /> },
    { id: 'profile', label: 'Profile', icon: <PersonIcon /> }
  ]

  const renderHomeTab = () => (
    <div className="space-y-4">
      {/* Time & Weather Widget - Mobile Optimized */}
      <div className={`rounded-xl p-4 shadow-lg relative overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} ${weather ? getWeatherBackground(weather.weather[0].main) : 'weather-sunny'}`}>
        {/* Weather Background Effects */}
        {weather && (
          <>
            {weather.weather[0].main.toLowerCase() === 'clear' && (
              <div className="absolute inset-0 opacity-20">
                <div className="sun-animation absolute top-2 right-2 w-12 h-12 bg-yellow-400 rounded-full"></div>
                <div className="sun-rays absolute top-0 right-0 w-16 h-16">
                  <div className="ray ray-1"></div>
                  <div className="ray ray-2"></div>
                  <div className="ray ray-3"></div>
                  <div className="ray ray-4"></div>
                  <div className="ray ray-5"></div>
                  <div className="ray ray-6"></div>
                  <div className="ray ray-7"></div>
                  <div className="ray ray-8"></div>
                </div>
              </div>
            )}
            
            {weather.weather[0].main.toLowerCase() === 'clouds' && (
              <div className="absolute inset-0 opacity-30">
                <div className="cloud cloud-1"></div>
                <div className="cloud cloud-2"></div>
                <div className="cloud cloud-3"></div>
              </div>
            )}
            
            {(weather.weather[0].main.toLowerCase() === 'rain' || weather.weather[0].main.toLowerCase() === 'drizzle') && (
              <div className="absolute inset-0 opacity-40">
                <div className="rain">
                  <div className="drop drop-1"></div>
                  <div className="drop drop-2"></div>
                  <div className="drop drop-3"></div>
                  <div className="drop drop-4"></div>
                  <div className="drop drop-5"></div>
                  <div className="drop drop-6"></div>
                  <div className="drop drop-7"></div>
                  <div className="drop drop-8"></div>
                  <div className="drop drop-9"></div>
                  <div className="drop drop-10"></div>
                </div>
              </div>
            )}
            
            {weather.weather[0].main.toLowerCase() === 'snow' && (
              <div className="absolute inset-0 opacity-30">
                <div className="snow">
                  <div className="flake flake-1"></div>
                  <div className="flake flake-2"></div>
                  <div className="flake flake-3"></div>
                  <div className="flake flake-4"></div>
                  <div className="flake flake-5"></div>
                  <div className="flake flake-6"></div>
                </div>
              </div>
            )}
          </>
        )}
        
        <div className="relative z-10">
          {/* Time Section */}
          <div className="mb-3">
            <div className="flex items-center mb-1">
              <AccessTimeIcon className={`w-4 h-4 mr-1 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Current Time</span>
            </div>
            <div className={`text-2xl font-bold mb-1 font-mono ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {formatTime(currentTime)}
            </div>
            <div className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              {formatDate(currentTime)}
            </div>
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {getGreeting()}, Prashant
            </div>
          </div>

          {/* Weather Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <LocationOnIcon className={`w-4 h-4 mr-1 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Ho Chi Minh City</span>
            </div>
            
            {weatherLoading ? (
              <div className="flex items-center">
                <div className={`animate-spin rounded-full h-5 w-5 border-b-2 ${theme === 'dark' ? 'border-blue-400' : 'border-blue-600'}`}></div>
                <span className={`ml-1 text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Loading...</span>
              </div>
            ) : weather ? (
              <div className="flex items-center">
                {getWeatherIcon(weather.weather[0].main)}
                <div className="ml-2">
                  <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {Math.round(weather.main.temp)}°C
                  </div>
                  <div className={`text-xs capitalize ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {weather.weather[0].description}
                  </div>
                </div>
              </div>
            ) : (
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Weather unavailable</div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards - Mobile Grid */}
      <div className="grid grid-cols-3 gap-3">
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

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        {menuItems.slice(1, 5).map((item) => (
          <button
            key={item.id}
            onClick={() => handleMenuClick(item)}
            className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-50'} transition-colors`}
          >
            <div className="flex items-center">
              <span className="mr-3 text-blue-600">{item.icon}</span>
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {item.label}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Recent Courses */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            My Courses
          </h2>
          <button className={`text-sm ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
            See All
          </button>
        </div>

        <div className="space-y-3">
          {registeredCourses.slice(0, 2).map((course) => (
            <div 
              key={course.id}
              className={`p-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
              onClick={() => navigate(`/student/session/${course.id}`)}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className={`font-semibold text-sm line-clamp-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {course.title}
                </h3>
                <div className="flex items-center flex-shrink-0 ml-2">
                  <StarIcon className="w-3 h-3 text-yellow-400 mr-1" />
                  <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {course.rating}
                  </span>
                </div>
              </div>
              
              <div className="mb-2">
                <p className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {course.instructor}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {course.subject}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {course.completedSessions}/{course.totalSessions} sessions
                  </p>
                </div>
                <div className={`text-xs font-medium ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                  {course.progress}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderCoursesTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          All Courses
        </h2>
        <button className={`text-sm ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
          Filter
        </button>
      </div>

      <div className="space-y-3">
        {registeredCourses.map((course) => (
          <div 
            key={course.id}
            className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
            onClick={() => navigate(`/student/session/${course.id}`)}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className={`font-semibold text-sm line-clamp-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {course.title}
              </h3>
              <div className="flex items-center flex-shrink-0 ml-2">
                <StarIcon className="w-3 h-3 text-yellow-400 mr-1" />
                <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {course.rating}
                </span>
              </div>
            </div>
            
            <div className="mb-2">
              <p className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {course.instructor}
              </p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {course.subject}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {course.completedSessions}/{course.totalSessions} sessions
                </p>
              </div>
              <div className={`text-xs font-medium ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                {course.progress}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderProgressTab = () => (
    <div className="space-y-4">
      <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Your Progress
      </h2>

      {/* Progress Chart */}
      <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Weekly Progress
        </h3>
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
        <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Your Mentors
        </h3>
        
        <div className="space-y-3">
          {mentors.slice(0, 3).map((mentor, index) => (
            <div key={index} className={`flex items-center p-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: getAvatarColor(mentor.name),
                  fontSize: '0.875rem',
                  fontWeight: 'bold'
                }}
              >
                {getInitials(mentor.name)}
              </Avatar>
              <div className="flex-1 ml-3">
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {mentor.name}
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {mentor.course}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                mentor.status === 'Online' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {mentor.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderProfileTab = () => (
    <div className="space-y-4">
      {/* Profile Header */}
      <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center mb-4">
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: getAvatarColor('Prashant'),
              fontSize: '1.5rem',
              fontWeight: 'bold',
              mr: 3
            }}
          >
            {getInitials('Prashant')}
          </Avatar>
          <div>
            <h4 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Prashant
            </h4>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Student
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => navigate('/common/profile')}
            className={`p-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'} transition-colors`}
          >
            <PersonIcon className="w-4 h-4 text-blue-600 mb-1" />
            <p className={`text-xs font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Profile
            </p>
          </button>
          <button 
            onClick={() => navigate('/common/notifications')}
            className={`p-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'} transition-colors`}
          >
            <NotificationsIcon className="w-4 h-4 text-blue-600 mb-1" />
            <p className={`text-xs font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Notifications
            </p>
          </button>
        </div>
      </div>

      {/* Social Links */}
      <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Social Links
        </h3>
        <div className="flex justify-center space-x-4">
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
      </div>

      {/* Friends */}
      <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Friends
        </h3>
        <div className="space-y-3">
          {friends.map((friend, index) => (
            <div key={index} className="flex items-center">
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: getAvatarColor(friend.name),
                  fontSize: '0.875rem',
                  fontWeight: 'bold'
                }}
              >
                {getInitials(friend.name)}
              </Avatar>
              <div className="ml-3">
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
    </div>
  )

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Mobile Header */}
      <div className={`sticky top-0 z-40 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 flex items-center justify-center mr-3">
              <img src="/HCMCUT.svg" alt="HCMUT Logo" className="w-8 h-8" />
            </div>
            <span className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              HCMUT
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleThemeToggle}
              className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <LightModeIcon className="w-5 h-5 text-yellow-400" /> : <DarkModeIcon className="w-5 h-5" />}
            </button>
            <button
              onClick={handleDrawerToggle}
              className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
            >
              <MenuIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 pb-20">
        {currentTab === 'home' && renderHomeTab()}
        {currentTab === 'courses' && renderCoursesTab()}
        {currentTab === 'progress' && renderProgressTab()}
        {currentTab === 'profile' && renderProfileTab()}
      </div>

      {/* Bottom Navigation */}
      <div className={`fixed bottom-0 left-0 right-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex">
          {bottomNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex-1 flex flex-col items-center py-2 px-1 ${
                currentTab === item.id
                  ? `${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`
                  : `${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`
              }`}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
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

              {/* Mobile Navigation */}
              <div className="space-y-2">
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
                    <ChevronRightIcon className="ml-auto w-4 h-4" />
                  </button>
                ))}
                
                {/* Mobile Settings */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    SETTINGS
                  </h3>
                  <div className="space-y-2">
                    <button 
                      onClick={() => {
                        navigate('/common/profile')
                        setMobileOpen(false)
                      }}
                      className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <PersonIcon className="mr-3 w-4 h-4" />
                      Profile
                    </button>
                    <button 
                      onClick={() => {
                        navigate('/common/notifications')
                        setMobileOpen(false)
                      }}
                      className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <NotificationsIcon className="mr-3 w-4 h-4" />
                      Notifications
                    </button>
                    <button 
                      onClick={() => setShowThemeOptions(!showThemeOptions)}
                      className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <PaletteIcon className="mr-3 w-4 h-4" />
                      Theme
                    </button>
                  </div>

                  {/* Mobile Theme Options */}
                  {showThemeOptions && (
                    <div className={`mt-2 ml-4 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div className="space-y-2">
                        <button 
                          onClick={() => {
                            handleThemeToggle()
                            setMobileOpen(false)
                          }}
                          className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                            theme === 'light' 
                              ? 'bg-blue-100 text-blue-700' 
                              : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-200'}`
                          }`}
                        >
                          {theme === 'dark' ? <LightModeIcon className="mr-3 w-4 h-4" /> : <DarkModeIcon className="mr-3 w-4 h-4" />}
                          {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                        </button>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} px-3 py-1`}>
                          Current: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentDashboardMobile
