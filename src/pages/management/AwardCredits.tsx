import React, { useState, useEffect, useCallback } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button as MuiButton,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  Alert,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Autocomplete,
  Tabs,
  Tab,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material'
import { 
  Search, 
  Add,
  Remove,
  Person,
  Assignment,
  Menu as MenuIcon,
  ArrowBack as ArrowBackIcon,
  TrendingUp,
  BarChart as BarChartIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  History as HistoryIcon,
  Block as BlockIcon,
  Star as StarIcon
} from '@mui/icons-material'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import api from '../../lib/api'

interface CreditEligibility {
  studentId: string
  studentName: string
  eligible: boolean
  reason: string
  sessionId?: string
  classId?: string
  semester?: string
  criteria: {
    attendanceRate: number
    minAttendanceRequired: number
    sessionsCompleted: number
    minSessionsRequired: number
    performanceScore?: number
    minPerformanceRequired?: number
  }
}

interface TrainingCredit {
  id: string
  studentId: string
  sessionId?: string
  classId?: string
  semester?: string
  credits: number
  reason: string
  awardedBy: string
  awardedAt: string
  revokedAt?: string
  revokedBy?: string
  revokeReason?: string
  status: 'active' | 'revoked'
  metadata?: {
    attendanceRate?: number
    performanceScore?: number
    completionRate?: number
  }
  student?: {
    id: string
    name: string
    email: string
  }
  awarder?: {
    id: string
    name: string
    email: string
  }
}

const AwardCredits: React.FC = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isAwardDialogOpen, setIsAwardDialogOpen] = useState(false)
  const [isBulkAwardDialogOpen, setIsBulkAwardDialogOpen] = useState(false)
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false)
  const [creditAmount, setCreditAmount] = useState('')
  const [awardReason, setAwardReason] = useState('')
  const [revokeReason, setRevokeReason] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(0) // 0: Eligible Students, 1: Credit History

  // Data state
  const [eligibleStudents, setEligibleStudents] = useState<CreditEligibility[]>([])
  const [creditHistory, setCreditHistory] = useState<TrainingCredit[]>([])
  const [loading, setLoading] = useState(false)
  const [creditHistoryLoading, setCreditHistoryLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [awarding, setAwarding] = useState(false)

  // Filters
  const [filters, setFilters] = useState({
    sessionId: '',
    classId: '',
    semester: '',
    minAttendance: undefined as number | undefined,
    minSessions: undefined as number | undefined,
    minPerformance: undefined as number | undefined
  })

  // Options for filters
  const [sessionsList, setSessionsList] = useState<any[]>([])
  const [classesList, setClassesList] = useState<any[]>([])
  const [semestersList, setSemestersList] = useState<string[]>([])
  
  // Selected students for bulk award
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
  const [creditToRevoke, setCreditToRevoke] = useState<TrainingCredit | null>(null)

  // Credit history pagination
  const [creditHistoryPage, setCreditHistoryPage] = useState(1)
  const [creditHistoryLimit] = useState(20)
  const [creditHistoryPagination, setCreditHistoryPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  // Load sessions and classes for filters
  const loadSessionsAndClasses = useCallback(async () => {
    try {
      // Load sessions
      const sessionsResponse = await api.sessions.list({ limit: 1000 })
      let sessions: any[] = []
      if (sessionsResponse && sessionsResponse.data && Array.isArray(sessionsResponse.data)) {
        sessions = sessionsResponse.data
      } else if (Array.isArray(sessionsResponse.data)) {
        sessions = sessionsResponse.data
      }
      setSessionsList(sessions)

      // Load classes
      const classesResponse = await api.classes.list({ limit: 1000 })
      let classes: any[] = []
      if (classesResponse && classesResponse.success && classesResponse.data && Array.isArray(classesResponse.data)) {
        classes = classesResponse.data
      } else if (Array.isArray(classesResponse.data)) {
        classes = classesResponse.data
      }
      setClassesList(classes)

      // Generate semester list from classes
      const semestersSet = new Set<string>()
      classes.forEach((cls: any) => {
        if (cls.semesterStart) {
          const startDate = new Date(cls.semesterStart)
          const year = startDate.getFullYear()
          const month = startDate.getMonth() + 1
          // Determine semester: 1 (Jan-May), 2 (Jun-Sep), 3 (Oct-Dec)
          const semester = month <= 5 ? 1 : month <= 9 ? 2 : 3
          const nextYear = semester === 3 ? year + 1 : year
          const semesterStr = `${year}-${nextYear}-${semester}`
          semestersSet.add(semesterStr)
        }
      })
      
      // Also generate current and next semesters
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth() + 1
      const currentSemester = currentMonth <= 5 ? 1 : currentMonth <= 9 ? 2 : 3
      const nextYear = currentSemester === 3 ? currentYear + 1 : currentYear
      semestersSet.add(`${currentYear}-${nextYear}-${currentSemester}`)
      semestersSet.add(`${currentYear}-${nextYear}-${currentSemester + 1 > 3 ? 1 : currentSemester + 1}`)
      
      setSemestersList(Array.from(semestersSet).sort().reverse())
    } catch (error: any) {
      console.error('Error loading sessions and classes:', error)
    }
  }, [])

  // Load eligible students
  const loadEligibleStudents = useCallback(async () => {
    try {
      setLoading(true)
      setErrorMessage(null)

      const params: any = {}
      if (filters.sessionId) {
        params.sessionId = filters.sessionId
      }
      if (filters.classId) {
        params.classId = filters.classId
      }
      if (filters.semester) {
        params.semester = filters.semester
      }
      if (filters.minAttendance !== undefined) {
        params.minAttendance = filters.minAttendance.toString()
      }
      if (filters.minSessions !== undefined) {
        params.minSessions = filters.minSessions.toString()
      }
      if (filters.minPerformance !== undefined) {
        params.minPerformance = filters.minPerformance.toString()
      }

      const response = await api.management.credits.getEligible(params)
      if (response && response.success && response.data) {
        setEligibleStudents(response.data)
      } else if (response && Array.isArray(response.data)) {
        setEligibleStudents(response.data)
      } else {
        setEligibleStudents([])
        setErrorMessage('Không thể tải danh sách học sinh đủ điều kiện')
      }
    } catch (error: any) {
      console.error('Error loading eligible students:', error)
      setErrorMessage('Lỗi tải danh sách học sinh đủ điều kiện: ' + (error.message || 'Unknown error'))
      setEligibleStudents([])
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Load credit history
  const loadCreditHistory = useCallback(async () => {
    try {
      setCreditHistoryLoading(true)
      setErrorMessage(null)

      const params: any = {
        page: creditHistoryPage,
        limit: creditHistoryLimit
      }

      const response = await api.management.credits.getHistory(params)
      if (response && response.success && response.data) {
        if (response.data.data && Array.isArray(response.data.data)) {
          setCreditHistory(response.data.data)
          if (response.data.pagination) {
            setCreditHistoryPagination(response.data.pagination)
          }
        } else if (Array.isArray(response.data)) {
          setCreditHistory(response.data)
        } else {
          setCreditHistory([])
        }
      } else if (response && Array.isArray(response.data)) {
        setCreditHistory(response.data)
      } else {
        setCreditHistory([])
      }
    } catch (error: any) {
      console.error('Error loading credit history:', error)
      setErrorMessage('Lỗi tải lịch sử trao tín chỉ: ' + (error.message || 'Unknown error'))
      setCreditHistory([])
    } finally {
      setCreditHistoryLoading(false)
    }
  }, [creditHistoryPage, creditHistoryLimit])

  // Load data on mount and when filters change
  useEffect(() => {
    loadSessionsAndClasses()
  }, [loadSessionsAndClasses])

  useEffect(() => {
    if (activeTab === 0) {
      loadEligibleStudents()
    } else if (activeTab === 1) {
      loadCreditHistory()
    }
  }, [activeTab, loadEligibleStudents, loadCreditHistory])

  // Reload when filters change
  useEffect(() => {
    if (activeTab === 0) {
      loadEligibleStudents()
    }
  }, [filters, activeTab, loadEligibleStudents])

  // Filter eligible students by search term
  const filteredEligibleStudents = eligibleStudents.filter(student =>
    student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle award credits (single)
  const handleAwardCredits = (eligibility: CreditEligibility) => {
    setSelectedUser({
      id: eligibility.studentId,
      name: eligibility.studentName,
      eligibility
    })
    setIsAwardDialogOpen(true)
    setCreditAmount('')
    setAwardReason('')
  }

  // Handle bulk award
  const handleBulkAward = () => {
    if (selectedStudentIds.length === 0) {
      setErrorMessage('Vui lòng chọn ít nhất một học sinh')
      return
    }
    setIsBulkAwardDialogOpen(true)
    setCreditAmount('')
    setAwardReason('')
  }

  // Submit award (single)
  const handleSubmitAward = async () => {
    if (!creditAmount || parseFloat(creditAmount) <= 0) {
      setErrorMessage('Vui lòng nhập số tín chỉ hợp lệ')
      return
    }
    if (!awardReason || awardReason.trim().length < 10) {
      setErrorMessage('Vui lòng nhập lý do trao tín chỉ (ít nhất 10 ký tự)')
      return
    }

    try {
      setAwarding(true)
      setErrorMessage(null)
      setSuccessMessage(null)

      const awardData = {
        studentIds: [selectedUser.id],
        credits: parseFloat(creditAmount),
        reason: awardReason.trim(),
        sessionId: filters.sessionId || undefined,
        classId: filters.classId || undefined,
        semester: filters.semester || undefined
      }

      const response = await api.management.credits.award(awardData)
      if (response && response.success) {
        setSuccessMessage(`Đã trao ${creditAmount} tín chỉ cho ${selectedUser.name}`)
        setIsAwardDialogOpen(false)
        setCreditAmount('')
        setAwardReason('')
        // Reload eligible students
        await loadEligibleStudents()
        // Reload credit history if on history tab
        if (activeTab === 1) {
          await loadCreditHistory()
        }
      } else {
        setErrorMessage(response?.error || 'Lỗi trao tín chỉ')
      }
    } catch (error: any) {
      console.error('Error awarding credits:', error)
      setErrorMessage('Lỗi trao tín chỉ: ' + (error.message || 'Unknown error'))
    } finally {
      setAwarding(false)
    }
  }

  // Submit bulk award
  const handleSubmitBulkAward = async () => {
    if (!creditAmount || parseFloat(creditAmount) <= 0) {
      setErrorMessage('Vui lòng nhập số tín chỉ hợp lệ')
      return
    }
    if (!awardReason || awardReason.trim().length < 10) {
      setErrorMessage('Vui lòng nhập lý do trao tín chỉ (ít nhất 10 ký tự)')
      return
    }
    if (selectedStudentIds.length === 0) {
      setErrorMessage('Vui lòng chọn ít nhất một học sinh')
      return
    }

    try {
      setAwarding(true)
      setErrorMessage(null)
      setSuccessMessage(null)

      const awardData = {
        studentIds: selectedStudentIds,
        credits: parseFloat(creditAmount),
        reason: awardReason.trim(),
        sessionId: filters.sessionId || undefined,
        classId: filters.classId || undefined,
        semester: filters.semester || undefined
      }

      const response = await api.management.credits.award(awardData)
      if (response && response.success) {
        setSuccessMessage(`Đã trao ${creditAmount} tín chỉ cho ${selectedStudentIds.length} học sinh`)
        setIsBulkAwardDialogOpen(false)
        setCreditAmount('')
        setAwardReason('')
        setSelectedStudentIds([])
        // Reload eligible students
        await loadEligibleStudents()
        // Reload credit history if on history tab
        if (activeTab === 1) {
          await loadCreditHistory()
        }
      } else {
        setErrorMessage(response?.error || 'Lỗi trao tín chỉ')
      }
    } catch (error: any) {
      console.error('Error awarding credits:', error)
      setErrorMessage('Lỗi trao tín chỉ: ' + (error.message || 'Unknown error'))
    } finally {
      setAwarding(false)
    }
  }

  // Handle revoke credits
  const handleRevokeCredits = (credit: TrainingCredit) => {
    setCreditToRevoke(credit)
    setIsRevokeDialogOpen(true)
    setRevokeReason('')
  }

  const handleSubmitRevoke = async () => {
    if (!revokeReason || revokeReason.trim().length < 10) {
      setErrorMessage('Vui lòng nhập lý do thu hồi (ít nhất 10 ký tự)')
      return
    }
    if (!creditToRevoke) {
      setErrorMessage('Không tìm thấy tín chỉ để thu hồi')
      return
    }

    try {
      setAwarding(true)
      setErrorMessage(null)
      setSuccessMessage(null)

      const response = await api.management.credits.revoke(creditToRevoke.id, {
        reason: revokeReason.trim()
      })
      if (response && response.success) {
        setSuccessMessage('Đã thu hồi tín chỉ thành công')
        setIsRevokeDialogOpen(false)
        setRevokeReason('')
        setCreditToRevoke(null)
        // Reload credit history
        await loadCreditHistory()
        // Reload eligible students if on eligible tab
        if (activeTab === 0) {
          await loadEligibleStudents()
        }
      } else {
        setErrorMessage(response?.error || 'Lỗi thu hồi tín chỉ')
      }
    } catch (error: any) {
      console.error('Error revoking credits:', error)
      setErrorMessage('Lỗi thu hồi tín chỉ: ' + (error.message || 'Unknown error'))
    } finally {
      setAwarding(false)
    }
  }

  // Toggle student selection for bulk award
  const handleToggleStudentSelection = (studentId: string) => {
    if (selectedStudentIds.includes(studentId)) {
      setSelectedStudentIds(selectedStudentIds.filter(id => id !== studentId))
    } else {
      setSelectedStudentIds([...selectedStudentIds, studentId])
    }
  }

  // Select all eligible students
  const handleSelectAll = () => {
    if (selectedStudentIds.length === filteredEligibleStudents.length) {
      setSelectedStudentIds([])
    } else {
      setSelectedStudentIds(filteredEligibleStudents.map(s => s.studentId))
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Student': return 'bg-blue-100 text-blue-800'
      case 'Tutor': return 'bg-green-100 text-green-800'
      case 'Admin': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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


  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar - Sticky */}
        <div className={`w-full lg:w-60 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-r ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} lg:block`}>
          <div className="p-6">
            {/* Logo */}
            <div 
              className="flex items-center mb-8 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/management')}
            >
              <div className="w-10 h-10 flex items-center justify-center mr-3">
                <img src="/HCMCUT.png" alt="HCMUT Logo" className="w-10 h-10" />
              </div>
              <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                HCMUT
              </span>
            </div>

            {/* Credit Stats */}
            <div className="mb-8">
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                CREDIT STATS
              </h3>
              <div className="space-y-3">
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Eligible Students:</span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {eligibleStudents.length}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Selected:</span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedStudentIds.length}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Credit History:</span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {creditHistoryPagination.total}
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
                  onClick={() => navigate('/management')}
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
                  Award Training Credits
                </h1>
                <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Manage and award training credits to eligible students
                </p>
              </div>
              <div className="flex space-x-2">
                {activeTab === 0 && selectedStudentIds.length > 0 && (
                  <MuiButton
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleBulkAward}
                    sx={{
                      backgroundColor: '#10b981',
                      '&:hover': {
                        backgroundColor: '#059669'
                      }
                    }}
                  >
                    Bulk Award ({selectedStudentIds.length})
                  </MuiButton>
                )}
                <MuiButton
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => {
                    if (activeTab === 0) {
                      loadEligibleStudents()
                    } else {
                      loadCreditHistory()
                    }
                  }}
                  disabled={loading || creditHistoryLoading}
                  sx={{
                    color: theme === 'dark' ? '#ffffff' : '#111827',
                    borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                    '&:hover': {
                      borderColor: theme === 'dark' ? '#6b7280' : '#9ca3af',
                      backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6'
                    }
                  }}
                >
                  Refresh
                </MuiButton>
              </div>
            </div>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
              <Tabs 
                value={activeTab} 
                onChange={(e, newValue) => setActiveTab(newValue)}
                sx={{
                  '& .MuiTab-root': {
                    color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                    '&.Mui-selected': {
                      color: theme === 'dark' ? '#ffffff' : '#111827'
                    }
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#3b82f6'
                  }
                }}
              >
                <Tab label="Eligible Students" />
                <Tab label="Credit History" />
              </Tabs>
            </Box>

            {/* Error/Success Messages */}
            {errorMessage && (
              <Alert 
                severity="error" 
                onClose={() => setErrorMessage(null)}
                sx={{ mb: 2 }}
              >
                {errorMessage}
              </Alert>
            )}
            {successMessage && (
              <Alert 
                severity="success" 
                onClose={() => setSuccessMessage(null)}
                sx={{ mb: 2 }}
              >
                {successMessage}
              </Alert>
            )}
          </div>

          {/* Content based on active tab */}
          {activeTab === 0 ? (
            /* Eligible Students Tab */
            <>
              {/* Filters */}
              <Card 
                className={`p-6 border mb-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                style={{
                  borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                  boxShadow: 'none !important'
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <FilterListIcon className="inline-block mr-2" />
                    Filters
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Session Filter */}
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                      Session
                    </InputLabel>
                    <Select
                      value={filters.sessionId}
                      onChange={(e) => setFilters({ ...filters, sessionId: e.target.value })}
                      sx={{
                        color: theme === 'dark' ? '#ffffff' : '#111827',
                        backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db'
                        }
                      }}
                    >
                      <MenuItem value="">All Sessions</MenuItem>
                      {sessionsList.map((session) => (
                        <MenuItem key={session.id} value={session.id}>
                          {session.subject} - {new Date(session.startTime).toLocaleDateString('vi-VN')}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Class Filter */}
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                      Class
                    </InputLabel>
                    <Select
                      value={filters.classId}
                      onChange={(e) => setFilters({ ...filters, classId: e.target.value })}
                      sx={{
                        color: theme === 'dark' ? '#ffffff' : '#111827',
                        backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db'
                        }
                      }}
                    >
                      <MenuItem value="">All Classes</MenuItem>
                      {classesList.map((cls) => (
                        <MenuItem key={cls.id} value={cls.id}>
                          {cls.code} - {cls.subject}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Semester Filter */}
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                      Semester
                    </InputLabel>
                    <Select
                      value={filters.semester}
                      onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                      sx={{
                        color: theme === 'dark' ? '#ffffff' : '#111827',
                        backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db'
                        }
                      }}
                    >
                      <MenuItem value="">All Semesters</MenuItem>
                      {semestersList.map((semester) => (
                        <MenuItem key={semester} value={semester}>
                          {semester}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Min Attendance Filter */}
                  <TextField
                    fullWidth
                    label="Min Attendance (%)"
                    type="number"
                    value={filters.minAttendance || ''}
                    onChange={(e) => setFilters({
                      ...filters,
                      minAttendance: e.target.value ? parseFloat(e.target.value) : undefined
                    })}
                    inputProps={{ min: 0, max: 100, step: 1 }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: theme === 'dark' ? '#ffffff' : '#111827',
                        backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                        '& fieldset': {
                          borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db'
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: theme === 'dark' ? '#9ca3af' : '#6b7280'
                      }
                    }}
                  />

                  {/* Min Sessions Filter */}
                  <TextField
                    fullWidth
                    label="Min Sessions"
                    type="number"
                    value={filters.minSessions || ''}
                    onChange={(e) => setFilters({
                      ...filters,
                      minSessions: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                    inputProps={{ min: 0, step: 1 }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: theme === 'dark' ? '#ffffff' : '#111827',
                        backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                        '& fieldset': {
                          borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db'
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: theme === 'dark' ? '#9ca3af' : '#6b7280'
                      }
                    }}
                  />

                  {/* Min Performance Filter */}
                  <TextField
                    fullWidth
                    label="Min Performance"
                    type="number"
                    value={filters.minPerformance || ''}
                    onChange={(e) => setFilters({
                      ...filters,
                      minPerformance: e.target.value ? parseFloat(e.target.value) : undefined
                    })}
                    inputProps={{ min: 0, max: 10, step: 0.1 }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: theme === 'dark' ? '#ffffff' : '#111827',
                        backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                        '& fieldset': {
                          borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db'
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: theme === 'dark' ? '#9ca3af' : '#6b7280'
                      }
                    }}
                  />
                </div>
              </Card>

              {/* Search */}
              <Card 
                className={`p-6 border mb-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                style={{
                  borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                  boxShadow: 'none !important'
                }}
              >
                <div className="relative">
                  <TextField
                    fullWidth
                    placeholder="Search by student name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <Search className="mr-2 text-gray-400" />
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: theme === 'dark' ? '#ffffff' : '#111827',
                        backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                        '& fieldset': {
                          borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db'
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: theme === 'dark' ? '#9ca3af' : '#6b7280'
                      }
                    }}
                  />
                </div>
              </Card>

              {/* Loading State */}
              {loading && (
                <div className="text-center py-8 mb-8">
                  <LinearProgress className="mb-4" />
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Đang tải danh sách học sinh đủ điều kiện...
                  </p>
                </div>
              )}

              {/* Eligible Students List */}
              {!loading && filteredEligibleStudents.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <Typography variant="h6" sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                      Eligible Students ({filteredEligibleStudents.length})
                    </Typography>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedStudentIds.length === filteredEligibleStudents.length && filteredEligibleStudents.length > 0}
                          indeterminate={selectedStudentIds.length > 0 && selectedStudentIds.length < filteredEligibleStudents.length}
                          onChange={handleSelectAll}
                          sx={{
                            color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                            '&.Mui-checked': {
                              color: '#3b82f6'
                            }
                          }}
                        />
                      }
                      label="Select All"
                      sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredEligibleStudents.map((eligibility) => (
                      <Card 
                        key={eligibility.studentId} 
                        className={`overflow-hidden border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                        style={{
                          borderColor: selectedStudentIds.includes(eligibility.studentId) 
                            ? '#3b82f6' 
                            : theme === 'dark' ? '#374151' : '#e5e7eb',
                          backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                          boxShadow: selectedStudentIds.includes(eligibility.studentId) 
                            ? '0 0 0 2px #3b82f6' 
                            : 'none'
                        }}
                      >
                        <div className="p-6">
                          {/* Student Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center flex-1">
                              <Checkbox
                                checked={selectedStudentIds.includes(eligibility.studentId)}
                                onChange={() => handleToggleStudentSelection(eligibility.studentId)}
                                sx={{
                                  color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                                  '&.Mui-checked': {
                                    color: '#3b82f6'
                                  },
                                  mr: 2
                                }}
                              />
                              <Avatar
                                sx={{
                                  width: 48,
                                  height: 48,
                                  bgcolor: getAvatarColor(eligibility.studentName),
                                  fontSize: '1.25rem',
                                  fontWeight: 'bold',
                                  mr: 2
                                }}
                              >
                                {getInitials(eligibility.studentName)}
                              </Avatar>
                              <div className="flex-1">
                                <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {eligibility.studentName}
                                </h3>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  ID: {eligibility.studentId}
                                </p>
                                <Chip
                                  label="Eligible"
                                  size="small"
                                  color="success"
                                  sx={{
                                    mt: 1,
                                    fontSize: '0.75rem',
                                    height: '20px'
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Eligibility Criteria */}
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between items-center">
                              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Attendance Rate:
                              </span>
                              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {eligibility.criteria.attendanceRate.toFixed(1)}% / {eligibility.criteria.minAttendanceRequired}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Sessions Completed:
                              </span>
                              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {eligibility.criteria.sessionsCompleted} / {eligibility.criteria.minSessionsRequired}
                              </span>
                            </div>
                            {eligibility.criteria.performanceScore !== undefined && (
                              <div className="flex justify-between items-center">
                                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  Performance Score:
                                </span>
                                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {eligibility.criteria.performanceScore.toFixed(1)}
                                  {eligibility.criteria.minPerformanceRequired !== undefined && 
                                    ` / ${eligibility.criteria.minPerformanceRequired}`
                                  }
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex space-x-2">
                            <Button 
                              size="small" 
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleAwardCredits(eligibility)}
                            >
                              <Add className="w-4 h-4 mr-1" />
                              Award Credits
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!loading && filteredEligibleStudents.length === 0 && (
                <Card 
                  className={`p-8 border text-center ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                  style={{
                    borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    boxShadow: 'none !important'
                  }}
                >
                  <CheckCircleIcon className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                  <Typography variant="h6" sx={{ mb: 2, color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                    Không có học sinh đủ điều kiện
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 4, color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                    Thử thay đổi filters hoặc kiểm tra lại tiêu chí đủ điều kiện
                  </Typography>
                </Card>
              )}
            </>
          ) : (
            /* Credit History Tab */
            <>
              {/* Loading State */}
              {creditHistoryLoading && (
                <div className="text-center py-8 mb-8">
                  <LinearProgress className="mb-4" />
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Đang tải lịch sử trao tín chỉ...
                  </p>
                </div>
              )}

              {/* Credit History Table */}
              {!creditHistoryLoading && creditHistory.length > 0 && (
                <Card
                  className={`p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                  style={{
                    borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    boxShadow: 'none !important'
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 3, color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                    Credit History ({creditHistoryPagination.total})
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ color: theme === 'dark' ? '#ffffff' : '#111827', fontWeight: 600 }}>
                            Student
                          </TableCell>
                          <TableCell sx={{ color: theme === 'dark' ? '#ffffff' : '#111827', fontWeight: 600 }}>
                            Credits
                          </TableCell>
                          <TableCell sx={{ color: theme === 'dark' ? '#ffffff' : '#111827', fontWeight: 600 }}>
                            Reason
                          </TableCell>
                          <TableCell sx={{ color: theme === 'dark' ? '#ffffff' : '#111827', fontWeight: 600 }}>
                            Semester
                          </TableCell>
                          <TableCell sx={{ color: theme === 'dark' ? '#ffffff' : '#111827', fontWeight: 600 }}>
                            Awarded By
                          </TableCell>
                          <TableCell sx={{ color: theme === 'dark' ? '#ffffff' : '#111827', fontWeight: 600 }}>
                            Awarded At
                          </TableCell>
                          <TableCell sx={{ color: theme === 'dark' ? '#ffffff' : '#111827', fontWeight: 600 }}>
                            Status
                          </TableCell>
                          <TableCell sx={{ color: theme === 'dark' ? '#ffffff' : '#111827', fontWeight: 600 }}>
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {creditHistory.map((credit) => (
                          <TableRow key={credit.id}>
                            <TableCell sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                              {credit.student?.name || credit.studentId}
                            </TableCell>
                            <TableCell sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                              <Chip
                                label={credit.credits}
                                size="small"
                                color="primary"
                                sx={{
                                  fontSize: '0.75rem',
                                  height: '24px'
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ color: theme === 'dark' ? '#ffffff' : '#111827', maxWidth: 200 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  color: theme === 'dark' ? '#9ca3af' : '#6b7280'
                                }}
                                title={credit.reason}
                              >
                                {credit.reason}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                              {credit.semester || 'N/A'}
                            </TableCell>
                            <TableCell sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                              {credit.awarder?.name || credit.awardedBy}
                            </TableCell>
                            <TableCell sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                              {new Date(credit.awardedAt).toLocaleDateString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={credit.status === 'active' ? 'Active' : 'Revoked'}
                                size="small"
                                color={credit.status === 'active' ? 'success' : 'error'}
                                sx={{
                                  fontSize: '0.75rem',
                                  height: '24px'
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              {credit.status === 'active' && (
                                <MuiButton
                                  size="small"
                                  startIcon={<BlockIcon />}
                                  onClick={() => handleRevokeCredits(credit)}
                                  sx={{
                                    color: theme === 'dark' ? '#ffffff' : '#111827',
                                    '&:hover': {
                                      backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6'
                                    }
                                  }}
                                >
                                  Revoke
                                </MuiButton>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Pagination */}
                  {creditHistoryPagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <Typography variant="body2" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                        Page {creditHistoryPagination.page} of {creditHistoryPagination.totalPages} ({creditHistoryPagination.total} total)
                      </Typography>
                      <div className="flex space-x-2">
                        <MuiButton
                          size="small"
                          onClick={() => setCreditHistoryPage(prev => Math.max(1, prev - 1))}
                          disabled={creditHistoryPage === 1}
                          sx={{
                            color: theme === 'dark' ? '#ffffff' : '#111827',
                            '&:disabled': {
                              color: theme === 'dark' ? '#4b5563' : '#9ca3af'
                            }
                          }}
                        >
                          Previous
                        </MuiButton>
                        <MuiButton
                          size="small"
                          onClick={() => setCreditHistoryPage(prev => Math.min(creditHistoryPagination.totalPages, prev + 1))}
                          disabled={creditHistoryPage === creditHistoryPagination.totalPages}
                          sx={{
                            color: theme === 'dark' ? '#ffffff' : '#111827',
                            '&:disabled': {
                              color: theme === 'dark' ? '#4b5563' : '#9ca3af'
                            }
                          }}
                        >
                          Next
                        </MuiButton>
                      </div>
                    </div>
                  )}
                </Card>
              )}

              {/* Empty State */}
              {!creditHistoryLoading && creditHistory.length === 0 && (
                <Card 
                  className={`p-8 border text-center ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                  style={{
                    borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    boxShadow: 'none !important'
                  }}
                >
                  <HistoryIcon className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                  <Typography variant="h6" sx={{ mb: 2, color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                    Chưa có lịch sử trao tín chỉ
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 4, color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                    Lịch sử trao tín chỉ sẽ được hiển thị ở đây
                  </Typography>
                </Card>
              )}
            </>
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
                    <img src="/HCMCUT.png" alt="HCMUT Logo" className="w-8 h-8" />
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

              {/* Mobile Credit Stats */}
              <div className="mb-8">
                <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  CREDIT STATS
                </h3>
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Eligible Students:</span>
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {eligibleStudents.length}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Selected:</span>
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {selectedStudentIds.length}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Credit History:</span>
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {creditHistoryPagination.total}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Quick Actions */}
              <div className="space-y-2">
                <button 
                  onClick={() => {
                    navigate('/management/approval')
                    setMobileOpen(false)
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Assignment className="mr-3 w-4 h-4" />
                  Approval Requests
                </button>
                <button 
                  onClick={() => {
                    navigate('/management/reports')
                    setMobileOpen(false)
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <BarChartIcon className="mr-3 w-4 h-4" />
                  Reports
                </button>
                <button 
                  onClick={() => {
                    navigate('/management')
                    setMobileOpen(false)
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <ArrowBackIcon className="mr-3 w-4 h-4" />
                  Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Award Credits Dialog */}
      <Dialog 
        open={isAwardDialogOpen} 
        onClose={() => setIsAwardDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            color: theme === 'dark' ? '#ffffff' : '#111827',
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff'
          }}
        >
          Award Credits to {selectedUser?.name}
        </DialogTitle>
        <DialogContent 
          sx={{ 
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff'
          }}
        >
          <div className="space-y-4 mt-4">
            {selectedUser?.eligibility && (
              <div className="mb-4">
                <Typography 
                  variant="body1" 
                  gutterBottom
                  sx={{ 
                    color: theme === 'dark' ? '#ffffff' : '#111827',
                    fontWeight: '500'
                  }}
                >
                  Student: {selectedUser.name}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: theme === 'dark' ? '#d1d5db' : '#6b7280',
                    fontWeight: '400'
                  }}
                >
                  ID: {selectedUser.id}
                </Typography>
                <div className="mt-3 space-y-2">
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: theme === 'dark' ? '#9ca3af' : '#6b7280'
                    }}
                  >
                    Attendance: {selectedUser.eligibility.criteria.attendanceRate.toFixed(1)}% (Min: {selectedUser.eligibility.criteria.minAttendanceRequired}%)
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: theme === 'dark' ? '#9ca3af' : '#6b7280'
                    }}
                  >
                    Sessions Completed: {selectedUser.eligibility.criteria.sessionsCompleted} / {selectedUser.eligibility.criteria.minSessionsRequired}
                  </Typography>
                  {selectedUser.eligibility.criteria.performanceScore !== undefined && (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: theme === 'dark' ? '#9ca3af' : '#6b7280'
                      }}
                    >
                      Performance: {selectedUser.eligibility.criteria.performanceScore.toFixed(1)}
                      {selectedUser.eligibility.criteria.minPerformanceRequired !== undefined && 
                        ` / ${selectedUser.eligibility.criteria.minPerformanceRequired}`
                      }
                    </Typography>
                  )}
                </div>
              </div>
            )}

            <div>
              <TextField
                fullWidth
                label="Credit Amount"
                type="number"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                placeholder="Enter number of credits to award"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: theme === 'dark' ? '#ffffff' : '#111827',
                    backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                    '& fieldset': {
                      borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                    },
                    '&:hover fieldset': {
                      borderColor: theme === 'dark' ? '#6b7280' : '#9ca3af',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme === 'dark' ? '#3b82f6' : '#3b82f6',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: theme === 'dark' ? '#3b82f6' : '#3b82f6',
                  },
                }}
              />
            </div>

            <div>
              <TextField
                fullWidth
                label="Reason for Award"
                multiline
                rows={3}
                value={awardReason}
                onChange={(e) => setAwardReason(e.target.value)}
                placeholder="Enter reason for awarding credits..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: theme === 'dark' ? '#ffffff' : '#111827',
                    backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                    '& fieldset': {
                      borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                    },
                    '&:hover fieldset': {
                      borderColor: theme === 'dark' ? '#6b7280' : '#9ca3af',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme === 'dark' ? '#3b82f6' : '#3b82f6',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: theme === 'dark' ? '#3b82f6' : '#3b82f6',
                  },
                }}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions 
          sx={{ 
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            padding: '16px 24px'
          }}
        >
          <MuiButton 
            onClick={() => setIsAwardDialogOpen(false)}
            sx={{
              color: theme === 'dark' ? '#ffffff' : '#111827',
              '&:hover': {
                backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6'
              }
            }}
          >
            Cancel
          </MuiButton>
          <MuiButton 
            onClick={handleSubmitAward} 
            variant="contained"
            color="success"
            disabled={awarding}
            sx={{
              backgroundColor: '#10b981',
              '&:hover': {
                backgroundColor: '#059669'
              },
              '&:disabled': {
                backgroundColor: '#6b7280'
              }
            }}
          >
            {awarding ? 'Awarding...' : 'Award Credits'}
          </MuiButton>
        </DialogActions>
      </Dialog>

      {/* Bulk Award Dialog */}
      <Dialog 
        open={isBulkAwardDialogOpen} 
        onClose={() => setIsBulkAwardDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            color: theme === 'dark' ? '#ffffff' : '#111827',
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff'
          }}
        >
          Bulk Award Credits to {selectedStudentIds.length} Students
        </DialogTitle>
        <DialogContent 
          sx={{ 
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff'
          }}
        >
          <div className="space-y-4 mt-4">
            <div>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme === 'dark' ? '#d1d5db' : '#6b7280',
                  fontWeight: '400',
                  mb: 2
                }}
              >
                Selected Students: {selectedStudentIds.length}
              </Typography>
            </div>

            <div>
              <TextField
                fullWidth
                label="Credit Amount"
                type="number"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                placeholder="Enter number of credits to award"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: theme === 'dark' ? '#ffffff' : '#111827',
                    backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                    '& fieldset': {
                      borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                    },
                    '&:hover fieldset': {
                      borderColor: theme === 'dark' ? '#6b7280' : '#9ca3af',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme === 'dark' ? '#3b82f6' : '#3b82f6',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: theme === 'dark' ? '#3b82f6' : '#3b82f6',
                  },
                }}
              />
            </div>

            <div>
              <TextField
                fullWidth
                label="Reason for Award"
                multiline
                rows={3}
                value={awardReason}
                onChange={(e) => setAwardReason(e.target.value)}
                placeholder="Enter reason for awarding credits..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: theme === 'dark' ? '#ffffff' : '#111827',
                    backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                    '& fieldset': {
                      borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                    },
                    '&:hover fieldset': {
                      borderColor: theme === 'dark' ? '#6b7280' : '#9ca3af',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme === 'dark' ? '#3b82f6' : '#3b82f6',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: theme === 'dark' ? '#3b82f6' : '#3b82f6',
                  },
                }}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions 
          sx={{ 
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            padding: '16px 24px'
          }}
        >
          <MuiButton 
            onClick={() => setIsBulkAwardDialogOpen(false)}
            sx={{
              color: theme === 'dark' ? '#ffffff' : '#111827',
              '&:hover': {
                backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6'
              }
            }}
          >
            Cancel
          </MuiButton>
          <MuiButton 
            onClick={handleSubmitBulkAward} 
            variant="contained"
            color="success"
            disabled={awarding}
            sx={{
              backgroundColor: '#10b981',
              '&:hover': {
                backgroundColor: '#059669'
              },
              '&:disabled': {
                backgroundColor: '#6b7280'
              }
            }}
          >
            {awarding ? 'Awarding...' : 'Award Credits'}
          </MuiButton>
        </DialogActions>
      </Dialog>

      {/* Revoke Credits Dialog */}
      <Dialog 
        open={isRevokeDialogOpen} 
        onClose={() => setIsRevokeDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            color: theme === 'dark' ? '#ffffff' : '#111827',
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff'
          }}
        >
          Revoke Credits
        </DialogTitle>
        <DialogContent 
          sx={{ 
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff'
          }}
        >
          <div className="space-y-4 mt-4">
            {creditToRevoke && (
              <div className="mb-4">
                <Typography 
                  variant="body1" 
                  gutterBottom
                  sx={{ 
                    color: theme === 'dark' ? '#ffffff' : '#111827',
                    fontWeight: '500'
                  }}
                >
                  Student: {creditToRevoke.student?.name || creditToRevoke.studentId}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: theme === 'dark' ? '#d1d5db' : '#6b7280',
                    fontWeight: '400'
                  }}
                >
                  Credits: {creditToRevoke.credits}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: theme === 'dark' ? '#d1d5db' : '#6b7280',
                    fontWeight: '400',
                    mt: 1
                  }}
                >
                  Reason: {creditToRevoke.reason}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: theme === 'dark' ? '#d1d5db' : '#6b7280',
                    fontWeight: '400',
                    mt: 1
                  }}
                >
                  Awarded: {new Date(creditToRevoke.awardedAt).toLocaleDateString('vi-VN')}
                </Typography>
              </div>
            )}

            <div>
              <TextField
                fullWidth
                label="Revoke Reason"
                multiline
                rows={3}
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="Enter reason for revoking credits (at least 10 characters)..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: theme === 'dark' ? '#ffffff' : '#111827',
                    backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                    '& fieldset': {
                      borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                    },
                    '&:hover fieldset': {
                      borderColor: theme === 'dark' ? '#6b7280' : '#9ca3af',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme === 'dark' ? '#3b82f6' : '#3b82f6',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: theme === 'dark' ? '#3b82f6' : '#3b82f6',
                  },
                }}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions 
          sx={{ 
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            padding: '16px 24px'
          }}
        >
          <MuiButton 
            onClick={() => setIsRevokeDialogOpen(false)}
            sx={{
              color: theme === 'dark' ? '#ffffff' : '#111827',
              '&:hover': {
                backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6'
              }
            }}
          >
            Cancel
          </MuiButton>
          <MuiButton 
            onClick={handleSubmitRevoke} 
            variant="contained"
            color="error"
            disabled={awarding}
            sx={{
              backgroundColor: '#ef4444',
              '&:hover': {
                backgroundColor: '#dc2626'
              },
              '&:disabled': {
                backgroundColor: '#6b7280'
              }
            }}
          >
            {awarding ? 'Revoking...' : 'Revoke Credits'}
          </MuiButton>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default AwardCredits
