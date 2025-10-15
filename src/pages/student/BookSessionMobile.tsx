import React, { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '@mui/material'
import { 
  CalendarToday, 
  Schedule, 
  Person, 
  Payment,
  Menu as MenuIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  VideoCall as VideoCallIcon,
  Chat as ChatIcon,
  LocationOn as LocationOnIcon,
  Close as CloseIcon,
  Star,
  CreditCard as CreditCardIcon,
  AccountBalance as AccountBalanceIcon,
  Dashboard as DashboardIcon,
  PersonSearch,
  School as SchoolIcon,
  BarChart as BarChartIcon,
  Class,
  SmartToy as SmartToyIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon
} from '@mui/icons-material'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const BookSessionMobile: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
  const [selectedTutor, setSelectedTutor] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [sessionType, setSessionType] = useState('')
  const [duration, setDuration] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [activeMenu, setActiveMenu] = useState('book-session')

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
    { id: 'book-session', label: 'Book Session', icon: <SchoolIcon />, path: '/student/book' },
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

  const steps = [
    { label: 'Select Tutor', icon: <Person />, shortLabel: 'Tutor' },
    { label: 'Choose Date & Time', icon: <CalendarToday />, shortLabel: 'Time' },
    { label: 'Session Details', icon: <Schedule />, shortLabel: 'Details' },
    { label: 'Payment', icon: <Payment />, shortLabel: 'Payment' },
  ]

  const tutors = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      subject: 'Mathematics',
      rating: 4.9,
      price: 50,
      image: '/api/placeholder/100/100',
      specialties: ['Calculus', 'Algebra'],
      experience: '5 years',
      students: 120
    },
    {
      id: 2,
      name: 'Prof. Michael Chen',
      subject: 'Physics',
      rating: 4.8,
      price: 45,
      image: '/api/placeholder/100/100',
      specialties: ['Quantum Physics', 'Mechanics'],
      experience: '8 years',
      students: 95
    },
    {
      id: 3,
      name: 'Dr. Emily Rodriguez',
      subject: 'Chemistry',
      rating: 4.9,
      price: 55,
      image: '/api/placeholder/100/100',
      specialties: ['Organic Chemistry', 'Biochemistry'],
      experience: '6 years',
      students: 150
    }
  ]

  const availableSlots = [
    { date: '2024-01-15', time: '10:00 AM', available: true },
    { date: '2024-01-15', time: '2:00 PM', available: true },
    { date: '2024-01-16', time: '9:00 AM', available: true },
    { date: '2024-01-16', time: '3:00 PM', available: false },
    { date: '2024-01-17', time: '11:00 AM', available: true },
    { date: '2024-01-17', time: '4:00 PM', available: true },
  ]

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const handleReset = () => {
    setActiveStep(0)
  }

  const renderStepContent = (step: number) => {
    if (step < 0 || step >= steps.length) {
      return (
        <div className="text-center py-8">
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Invalid step. Please refresh the page.
          </p>
        </div>
      )
    }
    
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Choose a Tutor
            </h2>
            <div className="space-y-3">
              {tutors.map((tutor) => (
                <div
                  key={tutor.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedTutor === tutor.id.toString()
                      ? 'border-blue-500 bg-blue-50'
                      : `${theme === 'dark' ? 'border-gray-600 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300'}`
                  }`}
                  onClick={() => setSelectedTutor(tutor.id.toString())}
                >
                  <div className="flex items-start">
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: getAvatarColor(tutor.name),
                        fontSize: '1rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {getInitials(tutor.name)}
                    </Avatar>
                    <div className="ml-3 flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className={`font-semibold text-sm ${
                          selectedTutor === tutor.id.toString()
                            ? 'text-blue-900'
                            : theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {tutor.name}
                        </h3>
                        <div className="flex items-center">
                          <Star className="w-3 h-3 text-yellow-400 mr-1" />
                          <span className={`text-xs font-medium ${
                            selectedTutor === tutor.id.toString()
                              ? 'text-blue-700'
                              : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            {tutor.rating}
                          </span>
                        </div>
                      </div>
                      <p className={`text-xs mb-2 ${
                        selectedTutor === tutor.id.toString()
                          ? 'text-blue-700'
                          : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {tutor.subject} • ${tutor.price}/hour
                      </p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {tutor.specialties.map((specialty, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {tutor.experience} experience
                        </span>
                        <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {tutor.students} students
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-4">
            <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Select Date & Time
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {availableSlots.map((slot, index) => (
                <div
                  key={index}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedDate === slot.date && selectedTime === slot.time
                      ? 'border-blue-500 bg-blue-50'
                      : slot.available
                      ? `${theme === 'dark' ? 'border-gray-600 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300'}`
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => {
                    if (slot.available) {
                      setSelectedDate(slot.date)
                      setSelectedTime(slot.time)
                    }
                  }}
                >
                  <div className="text-center">
                    <p className={`font-medium text-sm ${
                      selectedDate === slot.date && selectedTime === slot.time
                        ? 'text-blue-900'
                        : theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {new Date(slot.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    <p className={`text-xs ${
                      selectedDate === slot.date && selectedTime === slot.time
                        ? 'text-blue-700'
                        : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {slot.time}
                    </p>
                    {!slot.available && (
                      <span className="inline-block mt-1 px-1 py-0.5 bg-red-100 text-red-800 text-xs rounded">
                        Unavailable
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Session Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Session Type
                </label>
                <div className="space-y-3">
                  <label className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                    sessionType === 'online' 
                      ? 'border-blue-500 bg-blue-50' 
                      : theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                  }`}>
                    <input
                      type="radio"
                      name="sessionType"
                      value="online"
                      checked={sessionType === 'online'}
                      onChange={(e) => setSessionType(e.target.value)}
                      className="mr-3"
                    />
                    <VideoCallIcon className="mr-3 w-5 h-5 text-blue-600" />
                    <div>
                      <span className={`font-medium ${
                        sessionType === 'online' 
                          ? 'text-blue-900' 
                          : theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        Online Video Call
                      </span>
                      <p className={`text-xs ${
                        sessionType === 'online' 
                          ? 'text-blue-700' 
                          : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Join from anywhere
                      </p>
                    </div>
                  </label>
                  <label className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                    sessionType === 'in-person' 
                      ? 'border-blue-500 bg-blue-50' 
                      : theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                  }`}>
                    <input
                      type="radio"
                      name="sessionType"
                      value="in-person"
                      checked={sessionType === 'in-person'}
                      onChange={(e) => setSessionType(e.target.value)}
                      className="mr-3"
                    />
                    <LocationOnIcon className="mr-3 w-5 h-5 text-green-600" />
                    <div>
                      <span className={`font-medium ${
                        sessionType === 'in-person' 
                          ? 'text-blue-900' 
                          : theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        In-Person Meeting
                      </span>
                      <p className={`text-xs ${
                        sessionType === 'in-person' 
                          ? 'text-blue-700' 
                          : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Meet at our center
                      </p>
                    </div>
                  </label>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className={`w-full px-3 py-3 border rounded-lg ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Select duration</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Additional Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Any specific topics you'd like to focus on?"
                  className={`w-full px-3 py-3 border rounded-lg ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Payment Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Payment Method
                </label>
                <div className="space-y-3">
                  <label className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                    paymentMethod === 'card' 
                      ? 'border-blue-500 bg-blue-50' 
                      : theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <CreditCardIcon className="mr-3 w-5 h-5 text-blue-600" />
                    <span className={`font-medium ${
                      paymentMethod === 'card' 
                        ? 'text-blue-900' 
                        : theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Credit/Debit Card
                    </span>
                  </label>
                  <label className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                    paymentMethod === 'paypal' 
                      ? 'border-blue-500 bg-blue-50' 
                      : theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <CreditCardIcon className="mr-3 w-5 h-5 text-blue-600" />
                    <span className={`font-medium ${
                      paymentMethod === 'paypal' 
                        ? 'text-blue-900' 
                        : theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      PayPal
                    </span>
                  </label>
                  <label className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                    paymentMethod === 'bank' 
                      ? 'border-blue-500 bg-blue-50' 
                      : theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank"
                      checked={paymentMethod === 'bank'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <AccountBalanceIcon className="mr-3 w-5 h-5 text-green-600" />
                    <span className={`font-medium ${
                      paymentMethod === 'bank' 
                        ? 'text-blue-900' 
                        : theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Bank Transfer
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return 'Unknown step'
    }
  }

  const renderSummary = () => {
    const selectedTutorData = tutors.find(t => t.id.toString() === selectedTutor)
    
    return (
      <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Session Summary
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Tutor:</span>
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {selectedTutorData?.name || 'Not selected'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Date:</span>
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {selectedDate || 'Not selected'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Time:</span>
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {selectedTime || 'Not selected'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Duration:</span>
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {duration ? `${duration} minutes` : 'Not selected'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Type:</span>
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {sessionType || 'Not selected'}
            </span>
          </div>
          <div className="border-t pt-2 mt-3">
            <div className="flex justify-between">
              <span className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Total:
              </span>
              <span className={`text-lg font-semibold text-blue-600`}>
                ${selectedTutorData?.price || 0}.00
              </span>
            </div>
          </div>
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
                Book Session
              </h1>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Step {activeStep + 1} of {steps.length}
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

        {/* Progress Steps - Mobile */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                  index < activeStep ? 'bg-green-500 text-white' : 
                  index === activeStep ? 'bg-blue-500 text-white' :
                  'bg-gray-300 text-gray-600'
                }`}>
                  {index < activeStep ? <CheckCircleIcon className="w-4 h-4" /> : 
                   <span className="text-xs font-bold">{index + 1}</span>}
                </div>
                <span className={`text-xs text-center ${
                  index <= activeStep 
                    ? theme === 'dark' ? 'text-white' : 'text-gray-900'
                    : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {step.shortLabel}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 pb-20">
        {/* Step Content */}
        {activeStep < steps.length && (
          <div className="space-y-4">
            <Card 
              className={`border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4`}
              style={{
                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                boxShadow: 'none !important'
              }}
            >
              {renderStepContent(activeStep)}
            </Card>

            {/* Session Summary - Mobile */}
            <div className="lg:hidden">
              {renderSummary()}
            </div>

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
                    <button className={`flex flex-col items-center p-3 rounded-lg border ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}>
                      <ChatIcon className="w-6 h-6 text-blue-600 mb-2" />
                      <span className={`text-xs font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Support
                      </span>
                    </button>
                    <button className={`flex flex-col items-center p-3 rounded-lg border ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}>
                      <VideoCallIcon className="w-6 h-6 text-green-600 mb-2" />
                      <span className={`text-xs font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Tutorial
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Completion Message */}
        {activeStep >= steps.length && (
          <div className="space-y-4">
            <Card 
              className={`border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 text-center`}
              style={{
                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                boxShadow: 'none !important'
              }}
            >
              <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Booking Complete!
              </h2>
              <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Your session has been successfully booked. You'll receive a confirmation email shortly.
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={handleReset} 
                  className="w-full"
                  style={{
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    borderColor: '#000000',
                    textTransform: 'none',
                    fontWeight: '500'
                  }}
                >
                  Book Another Session
                </Button>
                <Button 
                  onClick={() => navigate('/student')} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Go to Dashboard
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Bottom Navigation - Mobile */}
      {activeStep < steps.length && (
        <div className={`fixed bottom-0 left-0 right-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} p-4`}>
          <div className="flex justify-between">
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
              variant="outlined"
              className="flex items-center"
              style={{
                backgroundColor: activeStep === 0 ? 'transparent' : '#ffffff',
                color: activeStep === 0 ? '#9ca3af' : '#000000',
                borderColor: activeStep === 0 ? '#9ca3af' : '#000000',
                textTransform: 'none',
                fontWeight: '500',
                opacity: activeStep === 0 ? 0.5 : 1
              }}
            >
              <ArrowBackIcon className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white"
            >
              {activeStep === steps.length - 1 ? 'Complete Booking' : 'Continue'}
              <ArrowForwardIcon className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

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

                {/* Mobile Progress Steps */}
                <div className="mb-8">
                  <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    BOOKING PROGRESS
                  </h3>
                  <div className="space-y-3">
                    {steps.map((step, index) => (
                      <div
                        key={index}
                        className={`flex items-center p-3 rounded-lg ${
                          index <= activeStep
                            ? 'bg-blue-100 text-blue-700'
                            : `${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                          index < activeStep ? 'bg-blue-600 text-white' : 
                          index === activeStep ? 'bg-blue-100 text-blue-600' :
                          'bg-gray-200 text-gray-400'
                        }`}>
                          {index < activeStep ? <CheckCircleIcon className="w-5 h-5" /> : 
                           index === activeStep ? <span className="text-sm font-bold">{index + 1}</span> :
                           <span className="text-sm font-bold">{index + 1}</span>}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{step.label}</p>
                          {index === activeStep && (
                            <p className="text-xs opacity-75">Current step</p>
                          )}
                        </div>
                      </div>
                    ))}
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

export default BookSessionMobile
