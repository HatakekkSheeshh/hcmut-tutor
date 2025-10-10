import React, { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { 
  CalendarToday, 
  Schedule, 
  Person, 
  Payment,
  Search as SearchIcon,
  Menu as MenuIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  VideoCall as VideoCallIcon,
  Chat as ChatIcon,
  LocationOn as LocationOnIcon
} from '@mui/icons-material'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'

const BookSession: React.FC = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
  const [selectedTutor, setSelectedTutor] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [sessionType, setSessionType] = useState('')
  const [duration, setDuration] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const steps = [
    { label: 'Select Tutor', icon: <Person /> },
    { label: 'Choose Date & Time', icon: <CalendarToday /> },
    { label: 'Session Details', icon: <Schedule /> },
    { label: 'Payment', icon: <Payment /> },
  ]

  const tutors = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      subject: 'Mathematics',
      rating: 4.9,
      price: 50,
      image: '/api/placeholder/100/100',
      specialties: ['Calculus', 'Algebra']
    },
    {
      id: 2,
      name: 'Prof. Michael Chen',
      subject: 'Physics',
      rating: 4.8,
      price: 45,
      image: '/api/placeholder/100/100',
      specialties: ['Quantum Physics', 'Mechanics']
    }
  ]

  const availableSlots = [
    { date: '2024-01-15', time: '10:00 AM', available: true },
    { date: '2024-01-15', time: '2:00 PM', available: true },
    { date: '2024-01-16', time: '9:00 AM', available: true },
    { date: '2024-01-16', time: '3:00 PM', available: false },
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
    switch (step) {
      case 0:
        return (
          <div>
            <h2 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Choose a Tutor
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="flex items-center mb-3">
                      <Avatar src={tutor.image} name={tutor.name} size="large" />
                    <div className="ml-3">
                      <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {tutor.name}
                      </h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {tutor.subject} • ${tutor.price}/hour
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                      {tutor.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 1:
        return (
          <div>
            <h2 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Select Date & Time
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {availableSlots.map((slot, index) => (
                <div
                  key={index}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
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
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {slot.date}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {slot.time}
                    </p>
                    {!slot.available && (
                      <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
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
          <div>
            <h2 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Session Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Session Type
                </label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="sessionType"
                      value="online"
                      checked={sessionType === 'online'}
                      onChange={(e) => setSessionType(e.target.value)}
                      className="mr-3"
                    />
                    <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Online Video Call
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="sessionType"
                      value="in-person"
                      checked={sessionType === 'in-person'}
                    onChange={(e) => setSessionType(e.target.value)}
                      className="mr-3"
                    />
                    <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      In-Person Meeting
                    </span>
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
                  className={`w-full px-3 py-2 border rounded-lg ${
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
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Additional Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Any specific topics you'd like to focus on?"
                  className={`w-full px-3 py-2 border rounded-lg ${
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
          <div>
            <h2 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Payment Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Payment Method
                </label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Credit/Debit Card
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      PayPal
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank"
                      checked={paymentMethod === 'bank'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Bank Transfer
                    </span>
                  </label>
                </div>
              </div>
              <div>
                <div className={`p-4 border rounded-lg ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Session Summary
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Tutor:</span>
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Dr. Sarah Johnson
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Date:</span>
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {selectedDate}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Time:</span>
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {selectedTime}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Duration:</span>
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {duration} minutes
                      </span>
                    </div>
                    <div className="border-t pt-2 mt-4">
                      <div className="flex justify-between">
                        <span className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          Total:
                        </span>
                        <span className={`text-lg font-semibold text-blue-600`}>
                          $50.00
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return 'Unknown step'
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

            {/* Progress Steps */}
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

            {/* Quick Actions */}
            <div>
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                QUICK ACTIONS
              </h3>
              <div className="space-y-2">
                <button 
                  onClick={() => navigate('/student/search')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <SearchIcon className="mr-3 w-4 h-4" />
                  Search Tutors
                </button>
                <button 
                  onClick={() => navigate('/student/progress')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <CheckCircleIcon className="mr-3 w-4 h-4" />
                  View Progress
                </button>
                <button 
                  onClick={() => navigate('/student')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <ArrowBackIcon className="mr-3 w-4 h-4" />
                  Back to Dashboard
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
                <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Book a Session
                </h1>
                <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Find the perfect tutor for your learning needs
                </p>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={handleBack}
                  disabled={activeStep === 0}
                  className={`p-2 rounded-lg ${activeStep === 0 ? 'opacity-50 cursor-not-allowed' : theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  <ArrowBackIcon className="w-4 h-4" />
                </button>
                <button 
                      onClick={handleNext}
                  disabled={activeStep === steps.length - 1}
                  className={`p-2 rounded-lg ${activeStep === steps.length - 1 ? 'opacity-50 cursor-not-allowed' : theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  <ArrowForwardIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Step {activeStep + 1} of {steps.length}: {steps[activeStep].label}
            </p>
          </div>

          {/* Step Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6`}>
                {renderStepContent(activeStep)}
              </Card>
            </div>

            {/* Sidebar Content */}
            <div className="space-y-6">
              {/* Session Summary */}
              <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6`}>
                <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Session Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Tutor:</span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedTutor ? tutors.find(t => t.id.toString() === selectedTutor)?.name || 'Not selected' : 'Not selected'}
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
                </div>
              </Card>

              {/* Help Section */}
              <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6`}>
                <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Need Help?
                </h3>
                <div className="space-y-3">
                  <button className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                    <ChatIcon className="mr-3 w-4 h-4" />
                    Contact Support
                  </button>
                  <button className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                    <VideoCallIcon className="mr-3 w-4 h-4" />
                    Video Tutorial
                  </button>
                  <button className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                    <LocationOnIcon className="mr-3 w-4 h-4" />
                    Find Centers
                  </button>
                </div>
              </Card>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
                      onClick={handleBack}
              disabled={activeStep === 0}
              variant="outlined"
              className="flex items-center"
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

          {/* Completion Message */}
          {activeStep === steps.length && (
            <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-8 text-center`}>
              <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Booking Complete!
              </h2>
              <p className={`text-lg mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Your session has been successfully booked. You'll receive a confirmation email shortly.
              </p>
              <div className="flex justify-center space-x-4">
                <Button onClick={handleReset} variant="outlined">
                  Book Another Session
                </Button>
                <Button onClick={() => navigate('/student')} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Go to Dashboard
                </Button>
              </div>
            </Card>
          )}
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

              {/* Mobile Progress Steps */}
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
          </div>
        </div>
      )}
    </div>
  )
}

export default BookSession
