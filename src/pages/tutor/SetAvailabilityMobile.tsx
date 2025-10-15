import React, { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { 
  Add, 
  Delete,
  Save,
  Menu as MenuIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  BarChart as BarChartIcon,
  Assignment as AssignmentIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Close as CloseIcon,
  Dashboard as DashboardIcon,
  Schedule as ScheduleIcon,
  Autorenew as AutorenewIcon,
  Chat as ChatIcon,
} from '@mui/icons-material'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

interface TimeSlot {
  id: string
  day: string
  startTime: string
  endTime: string
  isAvailable: boolean
}

const SetAvailabilityMobile: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState('availability')
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [selectedWeek, setSelectedWeek] = useState('current')
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    {
      id: '1',
      day: 'Monday',
      startTime: '09:00',
      endTime: '17:00',
      isAvailable: true
    },
    {
      id: '2',
      day: 'Tuesday',
      startTime: '09:00',
      endTime: '17:00',
      isAvailable: true
    },
    {
      id: '3',
      day: 'Wednesday',
      startTime: '09:00',
      endTime: '17:00',
      isAvailable: true
    },
    {
      id: '4',
      day: 'Thursday',
      startTime: '09:00',
      endTime: '17:00',
      isAvailable: true
    },
    {
      id: '5',
      day: 'Friday',
      startTime: '09:00',
      endTime: '17:00',
      isAvailable: true
    },
    {
      id: '6',
      day: 'Saturday',
      startTime: '10:00',
      endTime: '15:00',
      isAvailable: false
    },
    {
      id: '7',
      day: 'Sunday',
      startTime: '10:00',
      endTime: '15:00',
      isAvailable: false
    }
  ])

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, path: '/tutor' },
    { id: 'availability', label: 'Set Availability', icon: <ScheduleIcon />, path: '/tutor/availability' },
    { id: 'sessions', label: 'Manage Sessions', icon: <AssignmentIcon />, path: '/tutor/sessions' },
    { id: 'progress', label: 'Track Progress', icon: <BarChartIcon />, path: '/tutor/track-progress' },
    { id: 'cancel-reschedule', label: 'Cancel/Reschedule', icon: <AutorenewIcon />, path: '/tutor/cancel-reschedule' },
    { id: 'messages', label: 'Messages', icon: <ChatIcon />, path: '/tutor/messages' }
  ]


  const [sessionDuration, setSessionDuration] = useState('60')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showDurationDropdown, setShowDurationDropdown] = useState(false)
  const [showWeekDropdown, setShowWeekDropdown] = useState(false)
  
  const handleMenuClick = (item: any) => {
    setActiveMenu(item.id)
    if (item.path) {
      navigate(item.path)
    }
  }

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
      
      if (showDurationDropdown && !target.closest('.duration-dropdown-container')) {
        setShowDurationDropdown(false)
      }
      
      if (showWeekDropdown && !target.closest('.week-dropdown-container')) {
        setShowWeekDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDurationDropdown, showWeekDropdown])

  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ]

  const handleToggleAvailability = (id: string) => {
    setTimeSlots(prev => 
      prev.map(slot => 
        slot.id === id 
          ? { ...slot, isAvailable: !slot.isAvailable }
          : slot
      )
    )
  }

  const handleTimeChange = (id: string, field: 'startTime' | 'endTime', value: string) => {
    setTimeSlots(prev => 
      prev.map(slot => 
        slot.id === id 
          ? { ...slot, [field]: value }
          : slot
      )
    )
  }

  const handleAddTimeSlot = (day: string) => {
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      day,
      startTime: '09:00',
      endTime: '17:00',
      isAvailable: true
    }
    setTimeSlots(prev => [...prev, newSlot])
  }

  const handleRemoveTimeSlot = (id: string) => {
    setTimeSlots(prev => prev.filter(slot => slot.id !== id))
  }

  const handleSaveAvailability = () => {
    // In a real app, this would save to the backend
    console.log('Availability saved:', {
      timeSlots,
      sessionDuration
    })
  }

  const getDaySlots = (day: string) => {
    return timeSlots.filter(slot => slot.day === day)
  }

  // Duration options with better labels
  const durationOptions = [
    { value: '30', label: '30 minutes' },
    { value: '60', label: '1 hour' },
    { value: '90', label: '1.5 hours' },
    { value: '120', label: '2 hours' }
  ]

  // Week view options
  const weekOptions = [
    { value: 'current', label: 'Current Week' },
    { value: 'next', label: 'Next Week' },
    { value: 'custom', label: 'Custom Range' }
  ]

  const getSelectedDuration = () => {
    return durationOptions.find(option => option.value === sessionDuration) || durationOptions[1]
  }

  const getSelectedWeek = () => {
    return weekOptions.find(option => option.value === selectedWeek) || weekOptions[0]
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} pb-16`}>
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
                Set Availability
              </h1>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Manage your teaching schedule
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

        {/* Quick Settings - Mobile */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative week-dropdown-container">
            <label className={`block text-xs font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Week View
            </label>
            
            {/* Custom Week Dropdown Button */}
            <button
              onClick={() => setShowWeekDropdown(!showWeekDropdown)}
              className={`w-full px-3 py-3 text-sm border rounded-xl flex items-center justify-between transition-all duration-200 ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                  : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <div className="flex items-center">
                <span className="font-medium">{getSelectedWeek().label}</span>
              </div>
              <div className={`transform transition-transform duration-200 ${showWeekDropdown ? 'rotate-180' : ''}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Custom Week Dropdown Options */}
            {showWeekDropdown && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1">
                <div className={`rounded-xl shadow-lg border overflow-hidden ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-white border-gray-200'
                }`}>
                  {weekOptions.map((option, index) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSelectedWeek(option.value)
                        setShowWeekDropdown(false)
                      }}
                      className={`w-full px-4 py-3 text-left flex items-center transition-colors duration-150 ${
                        option.value === selectedWeek
                          ? theme === 'dark'
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-100 text-blue-700'
                          : theme === 'dark'
                            ? 'text-gray-300 hover:bg-gray-600'
                            : 'text-gray-700 hover:bg-gray-50'
                      } ${index !== weekOptions.length - 1 ? 'border-b border-gray-200 dark:border-gray-600' : ''}`}
                    >
                      <span className="font-medium">{option.label}</span>
                      {option.value === selectedWeek && (
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
          <div className="relative duration-dropdown-container">
            <label className={`block text-xs font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Session Duration
            </label>
            
            {/* Custom Dropdown Button */}
            <button
              onClick={() => setShowDurationDropdown(!showDurationDropdown)}
              className={`w-full px-3 py-3 text-sm border rounded-xl flex items-center justify-between transition-all duration-200 ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                  : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <div className="flex items-center">
                <span className="font-medium">{getSelectedDuration().label}</span>
              </div>
              <div className={`transform transition-transform duration-200 ${showDurationDropdown ? 'rotate-180' : ''}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Custom Dropdown Options */}
            {showDurationDropdown && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1">
                <div className={`rounded-xl shadow-lg border overflow-hidden ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-white border-gray-200'
                }`}>
                  {durationOptions.map((option, index) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSessionDuration(option.value)
                        setShowDurationDropdown(false)
                      }}
                      className={`w-full px-4 py-3 text-left flex items-center transition-colors duration-150 ${
                        option.value === sessionDuration
                          ? theme === 'dark'
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-100 text-blue-700'
                          : theme === 'dark'
                            ? 'text-gray-300 hover:bg-gray-600'
                            : 'text-gray-700 hover:bg-gray-50'
                      } ${index !== durationOptions.length - 1 ? 'border-b border-gray-200 dark:border-gray-600' : ''}`}
                    >
                      <span className="font-medium">{option.label}</span>
                      {option.value === sessionDuration && (
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

        {/* Weekly Schedule - Mobile */}
        <div className="space-y-4">
          {daysOfWeek.map((day) => (
            <Card
              key={day}
              className={`p-4 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
              style={{
                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                boxShadow: 'none !important'
              }}
            >
              <h4 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {day}
              </h4>
              
              <div className="space-y-3">
                {getDaySlots(day).map((slot) => (
                  <div key={slot.id} className={`p-3 border rounded-lg ${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={slot.isAvailable}
                          onChange={() => handleToggleAvailability(slot.id)}
                          className="w-4 h-4 text-blue-600 rounded mr-2"
                        />
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          Available
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveTimeSlot(slot.id)}
                        className={`p-1 rounded ${theme === 'dark' ? 'text-red-400 hover:bg-gray-600' : 'text-red-600 hover:bg-gray-100'}`}
                      >
                        <Delete className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => handleTimeChange(slot.id, 'startTime', e.target.value)}
                          className={`w-full px-2 py-1 text-sm border rounded ${
                            theme === 'dark'
                              ? 'bg-gray-600 border-gray-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          End Time
                        </label>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => handleTimeChange(slot.id, 'endTime', e.target.value)}
                          className={`w-full px-2 py-1 text-sm border rounded ${
                            theme === 'dark'
                              ? 'bg-gray-600 border-gray-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={() => handleAddTimeSlot(day)}
                  className={`w-full flex items-center justify-center px-3 py-2 border-2 border-dashed rounded-lg text-sm ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700'
                  } transition-colors`}
                >
                  <Add className="w-4 h-4 mr-2" />
                  Add Time Slot
                </button>
              </div>
            </Card>
          ))}
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
                <button 
                  onClick={() => navigate('/tutor/sessions')}
                  className={`flex flex-col items-center p-3 rounded-lg border ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                >
                  <AssignmentIcon className="w-6 h-6 text-blue-600 mb-2" />
                  <span className={`text-xs font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Manage Sessions
                  </span>
                </button>
                <button 
                  onClick={() => navigate('/tutor/track-progress')}
                  className={`flex flex-col items-center p-3 rounded-lg border ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                >
                  <BarChartIcon className="w-6 h-6 text-green-600 mb-2" />
                  <span className={`text-xs font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Track Progress
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Save Button - Mobile */}
        <div className="sticky bottom-4">
          <Button 
            onClick={handleSaveAvailability}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
            style={{
              backgroundColor: theme === 'dark' ? '#10b981' : '#16a34a',
              color: '#ffffff',
              textTransform: 'none',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme === 'dark' ? '#059669' : '#15803d'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme === 'dark' ? '#10b981' : '#16a34a'
            }}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Availability
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleDrawerToggle}></div>
          <div className={`fixed left-0 top-0 h-full w-80 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
            <div className="p-6 h-full flex flex-col">
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
                        ? 'bg-green-100 text-green-700'
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

export default SetAvailabilityMobile
