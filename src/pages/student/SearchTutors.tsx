import React, { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { 
  Search, 
  Star, 
  LocationOn, 
  Schedule,
  Menu as MenuIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  VideoCall as VideoCallIcon,
  Chat as ChatIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'

const SearchTutors: React.FC = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [subject, setSubject] = useState('')
  const [rating, setRating] = useState('')
  const [availability, setAvailability] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const tutors = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      subject: 'Mathematics',
      rating: 4.9,
      reviews: 127,
      price: 50,
      experience: '8 years',
      location: 'New York, NY',
      availability: 'Available',
      image: '/api/placeholder/100/100',
      specialties: ['Calculus', 'Algebra', 'Statistics'],
      nextAvailable: 'Today at 2:00 PM'
    },
    {
      id: 2,
      name: 'Prof. Michael Chen',
      subject: 'Physics',
      rating: 4.8,
      reviews: 89,
      price: 45,
      experience: '12 years',
      location: 'San Francisco, CA',
      availability: 'Available',
      image: '/api/placeholder/100/100',
      specialties: ['Quantum Physics', 'Mechanics', 'Thermodynamics'],
      nextAvailable: 'Tomorrow at 10:00 AM'
    },
    {
      id: 3,
      name: 'Dr. Emily Davis',
      subject: 'Chemistry',
      rating: 4.7,
      reviews: 156,
      price: 55,
      experience: '6 years',
      location: 'Boston, MA',
      availability: 'Busy',
      image: '/api/placeholder/100/100',
      specialties: ['Organic Chemistry', 'Biochemistry', 'Analytical Chemistry'],
      nextAvailable: 'Next week'
    },
    {
      id: 4,
      name: 'Dr. James Wilson',
      subject: 'Biology',
      rating: 4.9,
      reviews: 203,
      price: 48,
      experience: '10 years',
      location: 'Chicago, IL',
      availability: 'Available',
      image: '/api/placeholder/100/100',
      specialties: ['Cell Biology', 'Genetics', 'Ecology'],
      nextAvailable: 'Today at 4:00 PM'
    }
  ]

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English']

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

            {/* Search Filters */}
            <div className="mb-8">
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                SEARCH FILTERS
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Subject
                  </label>
                  <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                    <option value="">All Subjects</option>
                {subjects.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Rating
                  </label>
                  <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">Any Rating</option>
                    <option value="4+">4+ Stars</option>
                    <option value="4.5+">4.5+ Stars</option>
                    <option value="5">5 Stars</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Availability
                  </label>
                  <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">Any Time</option>
                    <option value="available">Available Now</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                  </select>
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
                  onClick={() => navigate('/student/book')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <CheckCircleIcon className="mr-3 w-4 h-4" />
                  Book Session
                </button>
                <button 
                  onClick={() => navigate('/student/progress')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <TrendingUpIcon className="mr-3 w-4 h-4" />
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
            <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Search Tutors
            </h1>
            <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Find the perfect tutor for your learning needs
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search tutors by name, subject, or expertise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full px-4 py-3 pl-10 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3">
                Search
              </Button>
            </div>
          </div>

          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Available Tutors ({tutors.length})
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

      {/* Tutors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutors.map((tutor) => (
              <Card key={tutor.id} className={`overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="p-6">
                  {/* Tutor Header */}
                  <div className="flex items-center mb-4">
                    <Avatar 
                      src={tutor.image} 
                      name={tutor.name}
                      size="large"
                    />
                    <div className="ml-3 flex-1">
                      <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {tutor.name}
                      </h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {tutor.subject} • {tutor.experience} experience
                      </p>
                    </div>
                  </div>

                  {/* Rating & Price */}
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.floor(tutor.rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className={`text-sm ml-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {tutor.rating} ({tutor.reviews} reviews)
                      </span>
                    </div>
                    <p className={`text-lg font-semibold text-blue-600`}>
                      ${tutor.price}/hour
                    </p>
                  </div>

                  {/* Location & Availability */}
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center">
                      <LocationOn className="w-4 h-4 text-gray-400 mr-2" />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {tutor.location}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Schedule className="w-4 h-4 text-gray-400 mr-2" />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Next: {tutor.nextAvailable}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Status:
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        tutor.availability === 'Available' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {tutor.availability}
                      </span>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div className="mb-4">
                    <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Specialties:
                    </p>
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

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button 
                      size="small" 
                      variant="outlined"
                      className="flex-1"
                    >
                    View Profile
                  </Button>
                  <Button 
                    size="small" 
                    variant="contained"
                    disabled={tutor.availability === 'Busy'}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Book Session
                  </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className={`w-full lg:w-80 h-auto lg:h-screen ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-l ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} mt-6 lg:mt-0`}>
          <div className="p-6">
            {/* Search Tips */}
            <div className="mb-8">
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Search Tips
              </h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                  <div>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Use specific subjects
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Search for "Calculus" or "Physics" for better results
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                  <div>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Check availability
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Look for tutors marked as "Available Now"
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                  <div>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Read reviews
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Check ratings and reviews before booking
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Popular Subjects */}
            <div className="mb-8">
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Popular Subjects
              </h3>
              <div className="flex flex-wrap gap-2">
                {subjects.slice(0, 6).map((subject, index) => (
                  <button
                    key={index}
                    onClick={() => setSubject(subject)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      subject === subject
                        ? 'bg-blue-100 text-blue-800'
                        : `${theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>

            {/* Help Section */}
            <div>
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
                  <PersonIcon className="mr-3 w-4 h-4" />
                  Find Centers
                </button>
              </div>
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

              {/* Mobile Search Filters */}
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Subject
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">All Subjects</option>
                    {subjects.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Rating
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">Any Rating</option>
                    <option value="4+">4+ Stars</option>
                    <option value="4.5+">4.5+ Stars</option>
                    <option value="5">5 Stars</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Availability
                  </label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">Any Time</option>
                    <option value="available">Available Now</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchTutors
