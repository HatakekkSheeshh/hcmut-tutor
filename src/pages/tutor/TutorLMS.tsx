import React, { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { 
  Search, 
  Schedule,
  Assignment,
  Menu as MenuIcon,
  ArrowBack as ArrowBackIcon,
  School as SchoolIcon,
  Class as ClassIcon
} from '@mui/icons-material'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import api from '../../lib/api'

const TutorLMS: React.FC = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [filterType, setFilterType] = useState<'all' | 'sessions' | 'classes'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  // Load sessions and classes on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        // Get user from localStorage
        const userStr = localStorage.getItem('user')
        if (!userStr) {
          navigate('/common/login')
          return
        }
        const userData = JSON.parse(userStr)
        setUser(userData)

        // Load sessions and classes in parallel
        const [sessionsResponse, classesResponse] = await Promise.all([
          api.sessions.list({ tutorId: userData.id, limit: 1000 }),
          api.classes.list({ tutorId: userData.id, limit: 1000 })
        ])
        
        if (sessionsResponse.data && Array.isArray(sessionsResponse.data)) {
          setSessions(sessionsResponse.data)
        }
        
        if (classesResponse.success && classesResponse.data && Array.isArray(classesResponse.data)) {
          setClasses(classesResponse.data)
        }
      } catch (err: any) {
        console.error('Error loading data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [navigate])

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  // Format date and time
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }

  const getStatusColor = (status: string) => {
    const colorMap: any = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      rescheduled: 'bg-orange-100 text-orange-800',
      inactive: 'bg-gray-100 text-gray-800',
      full: 'bg-orange-100 text-orange-800'
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
  }

  // Filter sessions
  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.topic?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  // Filter classes
  const filteredClasses = classes.filter(classItem => {
    const matchesSearch = classItem.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classItem.code?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  // Show loading state
  if (loading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Loading LMS...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar - Sticky */}
        <div className={`w-full lg:w-60 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-r ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} lg:block`}>
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

            {/* LMS Stats */}
            <div className="mb-8">
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                LMS STATS
              </h3>
              <div className="space-y-3">
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Sessions:</span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {sessions.length}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Classes:</span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {classes.length}
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
                  onClick={() => navigate('/tutor')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors`}
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
                <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  LMS Management
                </h1>
                <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Manage course materials, grades, and students for your sessions and classes
                </p>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="mb-8">
            <Card 
              className={`border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6`}
              style={{
                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                boxShadow: 'none !important'
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search sessions or classes..."
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
                </div>
                <div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className={`w-full px-3 py-3 border rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="all">All</option>
                    <option value="sessions">Sessions</option>
                    <option value="classes">Classes</option>
                  </select>
                </div>
              </div>
            </Card>
          </div>

          {/* Sessions Section */}
          {(filterType === 'all' || filterType === 'sessions') && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Sessions ({filteredSessions.length})
                </h2>
              </div>
              {filteredSessions.length === 0 ? (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Assignment className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No sessions found</h3>
                  <p>You don't have any sessions matching the search criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSessions.map((session) => (
                    <Card
                      key={session.id} 
                      className={`border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} overflow-hidden cursor-pointer hover:shadow-lg transition-shadow`}
                      style={{
                        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                        boxShadow: 'none !important'
                      }}
                      onClick={() => navigate(`/tutor/session/${session.id}`)}
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <SchoolIcon className={`w-5 h-5 mr-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {session.subject}
                            </h3>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(session.status)}`}>
                            {session.status}
                          </span>
                        </div>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center">
                            <Schedule className="w-4 h-4 text-gray-400 mr-2" />
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                              {formatDate(session.startTime)} at {formatTime(session.startTime)}
                            </span>
                          </div>
                          {session.topic && (
                            <div className="flex items-center">
                              <Assignment className="w-4 h-4 text-gray-400 mr-2" />
                              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                {session.topic}
                              </span>
                            </div>
                          )}
                        </div>
                        <Button 
                          fullWidth
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/tutor/session/${session.id}`)
                          }}
                        >
                          Open LMS
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Classes Section */}
          {(filterType === 'all' || filterType === 'classes') && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Classes ({filteredClasses.length})
                </h2>
              </div>
              {filteredClasses.length === 0 ? (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  <ClassIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No classes found</h3>
                  <p>You don't have any classes matching the search criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredClasses.map((classItem) => (
                    <Card
                      key={classItem.id} 
                      className={`border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} overflow-hidden cursor-pointer hover:shadow-lg transition-shadow`}
                      style={{
                        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                        boxShadow: 'none !important'
                      }}
                      onClick={() => navigate(`/tutor/class/${classItem.id}`)}
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <ClassIcon className={`w-5 h-5 mr-2 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                            <div>
                              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {classItem.code}
                              </h3>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {classItem.subject}
                              </p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(classItem.status)}`}>
                            {classItem.status}
                          </span>
                        </div>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center">
                            <Schedule className="w-4 h-4 text-gray-400 mr-2" />
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                              {classItem.day.charAt(0).toUpperCase() + classItem.day.slice(1)} • {classItem.startTime} - {classItem.endTime}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                              {classItem.currentEnrollment || 0} / {classItem.maxStudents} students
                            </span>
                          </div>
                        </div>
                        <Button 
                          fullWidth
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/tutor/class/${classItem.id}`)
                          }}
                        >
                          Open LMS
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
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

              {/* Mobile Quick Actions */}
              <div className="space-y-2">
                <button 
                  onClick={() => {
                    navigate('/tutor')
                    setMobileOpen(false)
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <ArrowBackIcon className="mr-3 w-4 h-4" />
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TutorLMS

