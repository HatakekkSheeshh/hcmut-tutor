import React, { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'
import {
  Typography,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  FilterList as FilterListIcon,
  Add as AddIcon
} from '@mui/icons-material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import CalendarCell from '../../components/calendar/CalendarCell'
import DayView from '../../components/calendar/DayView'
import SessionDetailModal from '../../components/calendar/SessionDetailModal'
import SessionFormModal from '../../components/calendar/SessionFormModal'
import MiniMonth from '../../components/calendar/MiniMonth'
import { Session, CalendarFilters } from '../../types/calendar'
import { subjects, tutors, getSessionsForWeek } from '../../data/studentSessions'

const Calendar: React.FC = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  
  // State
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week')
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState<CalendarFilters>({})
  const [sessions, setSessions] = useState<Session[]>([])
  const [weekSessions, setWeekSessions] = useState<{[key: string]: Session[]}>({})

  // Time slots from 7 AM to 6 PM with 50-minute ranges
  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = 7 + i
    const startTime = `${hour.toString().padStart(2, '0')}:00`
    const endTime = `${hour.toString().padStart(2, '0')}:50`
    return {
      start: startTime,
      end: endTime,
      display: `${startTime}-${endTime}`
    }
  })

  // Days of the week
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  // Get week start date (Monday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff))
  }

  // Get week dates
  const getWeekDates = (startDate: Date) => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      return date.toISOString().split('T')[0]
    })
  }

  // Filter sessions
  const filterSessions = (sessions: Session[], filters: CalendarFilters) => {
    return sessions.filter(session => {
      if (filters.subject && session.subject !== filters.subject) return false
      if (filters.tutor && session.tutor?.id !== filters.tutor) return false
      if (filters.status && session.status !== filters.status) return false
      return true
    })
  }

  // Load sessions for current week
  useEffect(() => {
    const weekStart = getWeekStart(currentWeek)
    const weekDates = getWeekDates(weekStart)
    const weekSessionsData = getSessionsForWeek(weekStart.toISOString().split('T')[0])
    
    // Merge mock data with sessions from state
    const allSessions = [...weekSessionsData, ...sessions]
    const filteredSessions = filterSessions(allSessions, filters)
    
    // Group sessions by date and time
    const groupedSessions: {[key: string]: Session[]} = {}
    weekDates.forEach(date => {
      groupedSessions[date] = filteredSessions.filter(session => session.date === date)
    })
    
    console.log('Current week dates:', weekDates)
    console.log('All sessions:', allSessions)
    console.log('Filtered sessions:', filteredSessions)
    console.log('Grouped sessions:', groupedSessions)
    
    setWeekSessions(groupedSessions)
  }, [currentWeek, filters])

  // Navigation handlers
  const handlePreviousWeek = () => {
    if (viewMode === 'day') {
      const d = new Date(selectedDate)
      d.setDate(d.getDate() - 1)
      setSelectedDate(d.toISOString().split('T')[0])
      setCurrentWeek(d)
    } else {
      const newWeek = new Date(currentWeek)
      newWeek.setDate(newWeek.getDate() - 7)
      setCurrentWeek(newWeek)
    }
  }

  const handleNextWeek = () => {
    if (viewMode === 'day') {
      const d = new Date(selectedDate)
      d.setDate(d.getDate() + 1)
      setSelectedDate(d.toISOString().split('T')[0])
      setCurrentWeek(d)
    } else {
      const newWeek = new Date(currentWeek)
      newWeek.setDate(newWeek.getDate() + 7)
      setCurrentWeek(newWeek)
    }
  }

  const handleToday = () => {
    const now = new Date()
    setCurrentWeek(now)
    setSelectedDate(now.toISOString().split('T')[0])
  }

  // Session handlers
  const handleSessionClick = (session: Session) => {
    setSelectedSession(session)
    setIsDetailModalOpen(true)
  }

  const handleEditSession = (session: Session) => {
    setSelectedSession(session)
    setIsFormModalOpen(true)
  }

  const handleCancelSession = (session: Session) => {
    console.log('Cancel session:', session.id)
    // Implement cancel logic
  }

  const handleRescheduleSession = (session: Session) => {
    console.log('Reschedule session:', session.id)
    // Implement reschedule logic
  }

  const handleJoinSession = (session: Session) => {
    if (session.location.meetingLink) {
      window.open(session.location.meetingLink, '_blank')
    }
  }

  const handleCreateSession = () => {
    setSelectedSession(null)
    setIsFormModalOpen(true)
  }

  const handleSaveSession = (sessionData: Partial<Session>) => {
    console.log('Save session:', sessionData)
    
    // Create new session with unique ID
    const newSession: Session = {
      id: `session_${Date.now()}`,
      subject: sessionData.subject || '',
      tutor: sessionData.tutor || tutors[0],
      date: sessionData.date || '',
      startTime: sessionData.startTime || '',
      endTime: sessionData.endTime || '',
      location: sessionData.location || { type: 'online', address: '', meetingLink: '' },
      status: sessionData.status || 'scheduled',
      notes: sessionData.notes || '',
      color: sessionData.color || '#3b82f6',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Add new session to sessions state
    setSessions(prevSessions => [...prevSessions, newSession])
    
    // Update weekSessions to include the new session
    setWeekSessions(prevWeekSessions => {
      const dateKey = newSession.date
      const existingSessions = prevWeekSessions[dateKey] || []
      return {
        ...prevWeekSessions,
        [dateKey]: [...existingSessions, newSession]
      }
    })
    
    setIsFormModalOpen(false)
  }

  // Helper function to get sessions for specific date and time
  const getSessionsForDateTime = (date: string, time: string) => {
    const daySessions = weekSessions[date] || []
    const filteredSessions = daySessions.filter(session => {
      const sessionStart = session.startTime
      const sessionEnd = session.endTime
      
      // Check if session overlaps with this time slot
      return sessionStart <= time && sessionEnd > time
    })
    
    if (filteredSessions.length > 0) {
      console.log(`Sessions for ${date} at ${time}:`, filteredSessions)
    }
    
    return filteredSessions
  }

  // Filter handlers
  const handleFilterChange = (field: keyof CalendarFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const clearFilters = () => {
    setFilters({})
  }


  // Format week display
  const formatWeekDisplay = (date: Date) => {
    const weekStart = getWeekStart(date)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    
    return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex">
          {/* Sidebar */}
          <div className={`w-80 h-screen ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-r ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} overflow-y-auto`}>
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <IconButton
                    onClick={() => navigate('/student')}
                    sx={{ mr: 1, color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                  <Typography
                    variant="h6"
                    sx={{
                      color: theme === 'dark' ? '#ffffff' : '#111827',
                      fontWeight: 600
                    }}
                  >
                    Calendar
                  </Typography>
                </div>
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  size="small"
                  sx={{
                    borderColor: theme === 'dark' ? '#374151' : '#d1d5db',
                    color: theme === 'dark' ? '#ffffff' : '#111827',
                    '&:hover': {
                      borderColor: theme === 'dark' ? '#4b5563' : '#9ca3af',
                      backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb'
                    }
                  }}
                >
                  Filters
                </Button>
              </div>

              {/* Week/Day Navigation + Mini Month */}
              <Card
                sx={{
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                  border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '12px',
                  mb: 3
                }}
              >
                <CardContent sx={{ p: 2 }}>
              <div className="flex items-center justify-between mb-3">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handlePreviousWeek}
                      sx={{
                        borderColor: theme === 'dark' ? '#374151' : '#d1d5db',
                        color: theme === 'dark' ? '#ffffff' : '#111827',
                        minWidth: 'auto',
                        px: 1
                      }}
                    >
                      <ChevronLeftIcon />
                    </Button>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: theme === 'dark' ? '#ffffff' : '#111827',
                        fontWeight: 600,
                        textAlign: 'center'
                      }}
                    >
                      {formatWeekDisplay(currentWeek)}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleNextWeek}
                      sx={{
                        borderColor: theme === 'dark' ? '#374151' : '#d1d5db',
                        color: theme === 'dark' ? '#ffffff' : '#111827',
                        minWidth: 'auto',
                        px: 1
                      }}
                    >
                      <ChevronRightIcon />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleToday}
                    size="small"
                    sx={{
                      backgroundColor: '#3b82f6',
                      '&:hover': {
                        backgroundColor: '#2563eb'
                      }
                    }}
                  >
                    Today
                  </Button>
                  <ToggleButtonGroup
                    size="small"
                    exclusive
                    value={viewMode}
                    onChange={(_, v) => v && setViewMode(v)}
                    aria-label="Calendar view switcher"
                    sx={{
                      backgroundColor: theme==='dark' ? '#0b1220' : '#fff',
                      border: `1px solid ${theme==='dark' ? '#374151' : '#d1d5db'}`,
                      borderRadius: '12px',
                      p: 0.5,
                      '& .MuiToggleButton-root': {
                        color: `${theme==='dark' ? '#cbd5e1' : '#111827'} !important`,
                        border: 'none',
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: '10px',
                        backgroundColor: theme==='dark' ? '#111827' : '#fff'
                      },
                      '& .MuiToggleButton-root:hover': {
                        backgroundColor: theme==='dark' ? '#1f2937' : '#f3f4f6'
                      },
                      '& .MuiToggleButton-root.Mui-selected': {
                        backgroundColor: theme==='dark' ? '#1e40af' : '#3b82f6',
                        color: '#ffffff !important'
                      }
                    }}
                  >
                    <ToggleButton value="week" aria-label="Week view">Week</ToggleButton>
                    <ToggleButton value="day" aria-label="Day view">Day</ToggleButton>
                  </ToggleButtonGroup>
                  </div>
                </CardContent>
              </Card>

              {/* Mini Month */}
              <MiniMonth
                date={new Date(selectedDate)}
                onChange={(d) => { setSelectedDate(d.toISOString().split('T')[0]); setCurrentWeek(d); setViewMode('day') }}
              />

              {/* Filters */}
              {isFilterOpen && (
                <Card
                  sx={{
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '12px',
                    mb: 3
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: theme === 'dark' ? '#ffffff' : '#111827',
                        fontWeight: 600,
                        mb: 2
                      }}
                    >
                      Filters
                    </Typography>
                    
                    <div className="space-y-3">
                      <FormControl fullWidth size="small">
                        <InputLabel 
                          sx={{ 
                            color: theme === 'dark' ? '#d1d5db' : '#374151',
                            '&.Mui-focused': {
                              color: theme === 'dark' ? '#ffffff' : '#111827'
                            }
                          }}
                        >
                          Subject
                        </InputLabel>
                        <Select
                          value={filters.subject || ''}
                          onChange={(e) => handleFilterChange('subject', e.target.value)}
                          label="Subject"
                          sx={{
                            color: theme === 'dark' ? '#ffffff' : '#111827',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme === 'dark' ? '#6b7280' : '#9ca3af',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme === 'dark' ? '#3b82f6' : '#3b82f6',
                            },
                            '& .MuiSelect-icon': {
                              color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                            }
                          }}
                        >
                          <MenuItem value="">All Subjects</MenuItem>
                          {subjects.map((subject) => (
                            <MenuItem key={subject.id} value={subject.name}>
                              {subject.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth size="small">
                        <InputLabel 
                          sx={{ 
                            color: theme === 'dark' ? '#d1d5db' : '#374151',
                            '&.Mui-focused': {
                              color: theme === 'dark' ? '#ffffff' : '#111827'
                            }
                          }}
                        >
                          Tutor
                        </InputLabel>
                        <Select
                          value={filters.tutor || ''}
                          onChange={(e) => handleFilterChange('tutor', e.target.value)}
                          label="Tutor"
                          sx={{
                            color: theme === 'dark' ? '#ffffff' : '#111827',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme === 'dark' ? '#6b7280' : '#9ca3af',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme === 'dark' ? '#3b82f6' : '#3b82f6',
                            },
                            '& .MuiSelect-icon': {
                              color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                            }
                          }}
                        >
                          <MenuItem value="">All Tutors</MenuItem>
                          {tutors.map((tutor) => (
                            <MenuItem key={tutor.id} value={tutor.id}>
                              {tutor.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth size="small">
                        <InputLabel 
                          sx={{ 
                            color: theme === 'dark' ? '#d1d5db' : '#374151',
                            '&.Mui-focused': {
                              color: theme === 'dark' ? '#ffffff' : '#111827'
                            }
                          }}
                        >
                          Status
                        </InputLabel>
                        <Select
                          value={filters.status || ''}
                          onChange={(e) => handleFilterChange('status', e.target.value)}
                          label="Status"
                          sx={{
                            color: theme === 'dark' ? '#ffffff' : '#111827',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme === 'dark' ? '#6b7280' : '#9ca3af',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme === 'dark' ? '#3b82f6' : '#3b82f6',
                            },
                            '& .MuiSelect-icon': {
                              color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                            }
                          }}
                        >
                          <MenuItem value="">All Status</MenuItem>
                          <MenuItem value="scheduled">Scheduled</MenuItem>
                          <MenuItem value="completed">Completed</MenuItem>
                          <MenuItem value="cancelled">Cancelled</MenuItem>
                          <MenuItem value="rescheduled">Rescheduled</MenuItem>
                        </Select>
                      </FormControl>

                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={clearFilters}
                        size="small"
                        sx={{
                          borderColor: theme === 'dark' ? '#374151' : '#d1d5db',
                          color: theme === 'dark' ? '#ffffff' : '#111827'
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Stats */}
              <Card
                sx={{
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                  border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '12px'
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: theme === 'dark' ? '#ffffff' : '#111827',
                      fontWeight: 600,
                      mb: 2
                    }}
                  >
                    {viewMode === 'day' ? 'Today' : 'This Week'}
                  </Typography>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        Total Sessions:
                      </span>
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {sessions.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        Scheduled:
                      </span>
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {sessions.filter(s => s.status === 'scheduled').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        Completed:
                      </span>
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {sessions.filter(s => s.status === 'completed').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Calendar */}
          <div className="flex-1 p-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Calendar Header */}
              <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <Typography
                    variant="h6"
                    sx={{
                      color: theme === 'dark' ? '#ffffff' : '#111827',
                      fontWeight: 600
                    }}
                  >
                    {viewMode === 'day' ? 'Day Schedule' : 'Weekly Schedule'}
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateSession}
                    sx={{
                      backgroundColor: '#3b82f6',
                      '&:hover': {
                        backgroundColor: '#2563eb'
                      }
                    }}
                  >
                    Book Session
                  </Button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="overflow-x-auto">
                {viewMode === 'day' ? (
                  <DayView
                    date={selectedDate}
                    timeSlots={timeSlots}
                    sessions={weekSessions[selectedDate] || []}
                    onSessionClick={handleSessionClick}
                    showTutor={true}
                    showStudent={false}
                  />
                ) : (
                <div className="min-w-full">
                  {/* Days Header */}
                  <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700">
                    <div className={`p-3 text-center font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Time
                    </div>
                    {days.map((day, index) => {
                      const date = new Date(getWeekStart(currentWeek))
                      date.setDate(date.getDate() + index)
                      const isToday = date.toDateString() === new Date().toDateString()
                      
                      return (
                        <div
                          key={day}
                          className={`p-3 text-center border-l border-gray-200 dark:border-gray-700 ${
                            isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                        >
                          <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {day}
                          </div>
                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {date.getDate()}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Time Slots */}
                  {timeSlots.map((timeSlot) => (
                    <div key={timeSlot.start} className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700">
                      <div className={`time-range-display ${theme === 'dark' ? 'dark' : ''}`}>
                        {timeSlot.display}
                      </div>
                      {days.map((_, dayIndex) => {
                        const date = new Date(getWeekStart(currentWeek))
                        date.setDate(date.getDate() + dayIndex)
                        const dateString = date.toISOString().split('T')[0]
                        const cellSessions = getSessionsForDateTime(dateString, timeSlot.start)
                        
                        return (
                          <CalendarCell
                            key={`${dateString}-${timeSlot.start}`}
                            time={timeSlot.start}
                            sessions={cellSessions}
                            onSessionClick={handleSessionClick}
                            isToday={date.toDateString() === new Date().toDateString()}
                            isCurrentHour={timeSlot.start === new Date().getHours().toString().padStart(2, '0') + ':00'}
                            showTutor={true}
                            showStudent={false}
                          />
                        )
                      })}
                    </div>
                  ))}
                </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <SessionDetailModal
          open={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          session={selectedSession}
          onEdit={handleEditSession}
          onCancel={handleCancelSession}
          onReschedule={handleRescheduleSession}
          onJoin={handleJoinSession}
          showTutor={true}
          showStudent={false}
        />

        <SessionFormModal
          open={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSave={handleSaveSession}
          session={selectedSession}
          tutors={tutors}
          students={[]}
          subjects={subjects}
          showTutor={true}
          showStudent={false}
        />
      </div>
    </LocalizationProvider>
  )
}

export default Calendar
