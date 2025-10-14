import React, { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { Avatar } from '@mui/material'
import '../../styles/weather-animations.css'
import {
  Dashboard as DashboardIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
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
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  LocationOn as LocationOnIcon,
  AccessTime as AccessTimeIcon,
  WbSunny as WbSunnyIcon,
  Cloud as CloudIcon,
  Thunderstorm as ThunderstormIcon,
  AcUnit as AcUnitIcon,
  Palette as PaletteIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon
} from '@mui/icons-material'

const ManagementDashboard: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showThemeOptions, setShowThemeOptions] = useState(false)
  
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
  }

  const handleThemeToggle = () => {
    toggleTheme()
    setShowThemeOptions(false)
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

  // Weather API function
  const fetchWeather = async () => {
    try {
      setWeatherLoading(true)
      // Using OpenWeatherMap API (free tier)
      const API_KEY = 'd055198c2320f9b77049b5b9a1db7205' // Bạn cần đăng ký tại openweathermap.org
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=Ho%20Chi%20Minh%20City&appid=${API_KEY}&units=metric`
      )
      const data = await response.json()
      setWeather(data)
    } catch (error) {
      console.error('Error fetching weather:', error)
      // Fallback data nếu API không hoạt động
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
    const isNight = hour >= 18 || hour <= 6 // 6 PM to 6 AM is considered night
    
    switch (weatherMain.toLowerCase()) {
      case 'clear':
        if (isNight) {
          return <WbSunnyIcon className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-400'}`} />
        } else {
          return <WbSunnyIcon className={`w-6 h-6 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'}`} />
        }
      case 'clouds':
        return <CloudIcon className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
      case 'rain':
      case 'drizzle':
        return <ThunderstormIcon className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
      case 'snow':
        return <AcUnitIcon className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-500'}`} />
      default:
        if (isNight) {
          return <WbSunnyIcon className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-400'}`} />
        } else {
          return <WbSunnyIcon className={`w-6 h-6 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'}`} />
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
    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Fetch weather on component mount
    fetchWeather()

    // Refresh weather every 10 minutes
    const weatherInterval = setInterval(fetchWeather, 10 * 60 * 1000)

    return () => {
      clearInterval(timeInterval)
      clearInterval(weatherInterval)
    }
  }, [])

  // Mock data for management
  const stats = [
    { title: 'Total Users', value: '1,247', icon: <PeopleIcon /> },
    { title: 'Active Sessions', value: '89', icon: <CheckCircleIcon /> },
    { title: 'Pending Requests', value: '23', icon: <AutorenewIcon /> },
    { title: 'System Health', value: '99.8%', icon: <TrendingUpIcon /> }
  ]

  const recentRequests = [
    {
      id: 1,
      user: 'John Smith',
      type: 'Session Booking',
      status: 'pending',
      date: '2024-01-15',
      time: '10:30 AM',
      priority: 'high'
    },
    {
      id: 2,
      user: 'Sarah Johnson',
      type: 'Credit Request',
      status: 'approved',
      date: '2024-01-15',
      time: '09:15 AM',
      priority: 'medium'
    },
    {
      id: 3,
      user: 'Mike Chen',
      type: 'Tutor Application',
      status: 'pending',
      date: '2024-01-14',
      time: '2:45 PM',
      priority: 'high'
    }
  ]

  const systemAlerts = [
    { message: 'High server load detected', time: '5 minutes ago', type: 'warning' },
    { message: 'New user registration spike', time: '1 hour ago', type: 'info' },
    { message: 'Payment system maintenance scheduled', time: '2 hours ago', type: 'info' },
    { message: 'Database backup completed', time: '3 hours ago', type: 'success' }
  ]

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, path: '/management' },
    { id: 'approval-requests', label: 'Approval Requests', icon: <AssignmentIcon />, path: '/management/approval' },
    { id: 'reports-analytics', label: 'Reports & Analytics', icon: <BarChartIcon />, path: '/management/reports' },
    { id: 'award-credits', label: 'Award Credits', icon: <StarIcon />, path: '/management/awards' },
    { id: 'user-management', label: 'User Management', icon: <PeopleIcon />, path: '/management/users' },
    { id: 'system-settings', label: 'System Settings', icon: <SettingsIcon />, path: '/management/settings' },
    { id: 'security', label: 'Security', icon: <SecurityIcon />, path: '/management/security' },
    { id: 'notifications', label: 'Notifications', icon: <NotificationsIcon />, path: '/management/notifications' }
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

            {/* System Status */}
            <div className="mb-8">
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                SYSTEM STATUS
              </h3>
              <div className="space-y-3">
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Server Status:</span>
                    <span className="text-sm font-medium text-green-600">Online</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Database:</span>
                    <span className="text-sm font-medium text-green-600">Healthy</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>API Response:</span>
                    <span className="text-sm font-medium text-green-600">Fast</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div>
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                SETTINGS
              </h3>
              <div className="space-y-2">
                <button 
                  onClick={() => setShowThemeOptions(!showThemeOptions)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <PaletteIcon className="mr-3 w-4 h-4" />
                  Theme
                </button>
                <button className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <PersonIcon className="mr-3 w-4 h-4" />
                  User Management
                </button>
                <button className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <NotificationsIcon className="mr-3 w-4 h-4" />
                  System Alerts
                </button>
              </div>

              {/* Theme Options */}
              {showThemeOptions && (
                <div className={`mt-2 ml-4 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="space-y-2">
                    <button 
                      onClick={handleThemeToggle}
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

            {/* Upgrade Section */}
            <div className="mt-8 p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-2">
                  <StarIcon className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-white font-semibold text-sm">Admin Pro Features</h3>
              </div>
              <Button className="w-full bg-white text-purple-600 hover:bg-gray-100 text-sm font-medium">
                Upgrade Plan
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-6">
          {/* Mobile Menu Button & Theme Toggle */}
          <div className="lg:hidden mb-4 flex items-center justify-between">
            <button
              onClick={handleDrawerToggle}
              className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <MenuIcon className="w-6 h-6" />
            </button>
            
            {/* Mobile Theme Toggle */}
            <button
              onClick={handleThemeToggle}
              className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} transition-colors`}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <LightModeIcon className="w-6 h-6 text-yellow-400" /> : <DarkModeIcon className="w-6 h-6" />}
            </button>
          </div>

          {/* Search Bar & Desktop Theme Toggle */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search users, requests, or system logs..."
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
              <div className="flex items-center gap-2">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3">
                  Search
                </Button>
                
                {/* Desktop Theme Toggle */}
                <button
                  onClick={handleThemeToggle}
                  className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} transition-colors`}
                  title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                >
                  {theme === 'dark' ? <LightModeIcon className="w-5 h-5 text-yellow-400" /> : <DarkModeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Time & Weather Widget */}
          <div className="mb-8">
            <div className={`rounded-xl p-6 shadow-lg relative overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} ${weather ? getWeatherBackground(weather.weather[0].main) : 'weather-sunny'}`}>
              {/* Weather Background Effects */}
              {weather && (
                <>
                  {/* Sunny Effect */}
                  {weather.weather[0].main.toLowerCase() === 'clear' && (
                    <div className="absolute inset-0 opacity-20">
                      <div className="sun-animation absolute top-4 right-4 w-16 h-16 bg-yellow-400 rounded-full"></div>
                      <div className="sun-rays absolute top-0 right-0 w-20 h-20">
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
                  
                  {/* Cloudy Effect */}
                  {weather.weather[0].main.toLowerCase() === 'clouds' && (
                    <div className="absolute inset-0 opacity-30">
                      <div className="cloud cloud-1"></div>
                      <div className="cloud cloud-2"></div>
                      <div className="cloud cloud-3"></div>
                    </div>
                  )}
                  
                  {/* Rainy Effect */}
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
                  
                  {/* Snowy Effect */}
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
              
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between relative z-10">
                {/* Time Section */}
                <div className="flex-1 mb-4 lg:mb-0">
                  <div className="flex items-center mb-2">
                    <AccessTimeIcon className={`w-5 h-5 mr-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Current Time</span>
                  </div>
                  <div className={`text-3xl lg:text-4xl font-bold mb-1 font-mono ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formatTime(currentTime)}
                  </div>
                  <div className={`text-lg mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {formatDate(currentTime)}
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {getGreeting()}, Admin
                  </div>
                </div>

                {/* Weather Section */}
                <div className="flex-1 lg:ml-8">
                  <div className="flex items-center mb-2">
                    <LocationOnIcon className={`w-5 h-5 mr-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Ho Chi Minh City</span>
                  </div>
                  
                  {weatherLoading ? (
                    <div className="flex items-center">
                      <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${theme === 'dark' ? 'border-blue-400' : 'border-blue-600'}`}></div>
                      <span className={`ml-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Loading weather...</span>
                    </div>
                  ) : weather ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getWeatherIcon(weather.weather[0].main)}
                        <div className="ml-3">
                          <div className={`text-2xl lg:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {Math.round(weather.main.temp)}°C
                          </div>
                          <div className={`text-sm capitalize ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            {weather.weather[0].description}
                          </div>
                        </div>
                      </div>
                      <div className={`text-right text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        <div>Humidity: {weather.main.humidity}%</div>
                        <div>Feels like: {Math.round(weather.main.feels_like)}°C</div>
                      </div>
                    </div>
                  ) : (
                    <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Weather unavailable</div>
                  )}
                </div>
              </div>
            </div>
          </div>
      
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card 
                key={index} 
                className={`p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                style={{
                  borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                  boxShadow: 'none !important'
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {stat.value}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {stat.title}
                    </p>
                  </div>
                  <div className="text-3xl text-purple-600">{stat.icon}</div>
                </div>
              </Card>
            ))}
          </div>

          {/* Recent Requests Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Recent Requests
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
              {recentRequests.map((request) => (
                <Card 
                  key={request.id} 
                  className={`overflow-hidden border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                  style={{
                    borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    boxShadow: 'none !important'
                  }}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {request.user}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        request.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {request.type}
                    </p>
                    <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {request.date} at {request.time}
                    </p>
                    <div className="flex space-x-2">
                      <Button 
                        size="small" 
                        variant="outlined" 
                        startIcon={<CheckCircleIcon />}
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
                        Approve
                      </Button>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        startIcon={<AssignmentIcon />}
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
                        Review
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* System Alerts Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                System Alerts
              </h2>
              <button className={`text-sm ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}>
                See All
              </button>
            </div>

            <div 
              className={`rounded-lg border overflow-hidden ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
              style={{
                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                boxShadow: 'none !important'
              }}
            >
              {/* Table Header - Hidden on mobile */}
              <div className={`px-6 py-3 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} hidden lg:block`}>
                <div className="grid grid-cols-3 gap-4 text-sm font-medium">
                  <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>ALERT MESSAGE</div>
                  <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>TYPE</div>
                  <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>TIME</div>
                </div>
              </div>

              {/* Table Rows */}
              {systemAlerts.map((alert, index) => (
                <div key={index} className={`px-4 lg:px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} last:border-b-0`}>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                      <div>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {alert.message}
                        </p>
                      </div>
                    </div>
                    <div className="hidden lg:block">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        alert.type === 'warning' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : alert.type === 'info'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {alert.type}
                      </span>
                    </div>
                    <div className={`hidden lg:block ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {alert.time}
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
                Admin Profile
              </h3>
              <button className="p-1">
                <MoreVertIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* User Profile */}
            <div className="text-center mb-8">
              <Avatar
                sx={{
                  width: 96,
                  height: 96,
                  bgcolor: getAvatarColor('Admin User'),
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  mx: 'auto',
                  mb: 2
                }}
              >
                {getInitials('Admin User')}
              </Avatar>
              <h4 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Good Morning Admin
              </h4>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Manage and monitor the entire system
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

            {/* System Performance Chart */}
            <div className="mb-8">
              <h4 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                System Performance
              </h4>
              <div className="flex items-end space-x-2 h-20">
                {[95, 88, 92, 98, 90].map((height, index) => (
                  <div
                    key={index}
                    className="bg-purple-500 rounded-t"
                    style={{ height: `${height}%`, width: '20%' }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Recent Activity
                </h4>
                <button className="text-sm text-blue-600">
                  <MoreVertIcon className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {systemAlerts.slice(0, 4).map((alert, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {alert.message}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {alert.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Button 
                className="w-full mt-4" 
                variant="outlined"
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
                View All Activity
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
                
                {/* Mobile Settings */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    SETTINGS
                  </h3>
                  <div className="space-y-2">
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

export default ManagementDashboard
