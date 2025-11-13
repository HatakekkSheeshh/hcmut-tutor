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
  Chip,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Autocomplete
} from '@mui/material'
import { 
  TrendingUp,
  People,
  Schedule,
  Star,
  Menu as MenuIcon,
  ArrowBack as ArrowBackIcon,
  Assignment as AssignmentIcon,
  Download as DownloadIcon,
  FilterList as FilterListIcon,
  DateRange as DateRangeIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  PictureAsPdf as PdfIcon,
  TableChart as CsvIcon,
  Description as JsonIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material'
import { Avatar } from '@mui/material'
import { LineChart } from '@mui/x-charts/LineChart'
import { axisClasses } from '@mui/x-charts/ChartsAxis'
import { legendClasses } from '@mui/x-charts/ChartsLegend'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import api from '../../lib/api'

interface ProgressReport {
  id: string
  title: string
  type: 'student' | 'tutor' | 'department' | 'subject' | 'custom'
  scope: {
    studentIds?: string[]
    tutorIds?: string[]
    department?: string
    subject?: string
    timeRange: {
      startDate: string
      endDate: string
    }
  }
  data: {
    students?: StudentProgressData[]
    tutors?: TutorProgressData[]
    summary: ProgressReportSummary
  }
  filters?: {
    minScore?: number
    minAttendance?: number
    subjects?: string[]
  }
  createdBy: string
  createdAt: string
  updatedAt: string
  creator?: {
    id: string
    name: string
    email: string
  }
}

interface StudentProgressData {
  studentId: string
  studentName: string
  sessionsCompleted: number
  sessionsTotal: number
  attendanceRate: number
  averageScore: number
  subjects: {
    subject: string
    sessions: number
    averageScore: number
    attendanceRate: number
  }[]
  improvements: string[]
  challenges: string[]
}

interface TutorProgressData {
  tutorId: string
  tutorName: string
  studentsCount: number
  sessionsCompleted: number
  sessionsTotal: number
  averageRating: number
  attendanceRate: number
  subjects: string[]
  performanceMetrics: {
    communication: number
    knowledge: number
    helpfulness: number
    punctuality: number
  }
}

interface ProgressReportSummary {
  totalStudents: number
  totalTutors: number
  totalSessions: number
  completedSessions: number
  averageAttendanceRate: number
  averageScore: number
  averageRating: number
}

const ReportsAnalytics: React.FC = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('all')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(0) // 0: Analytics, 1: Progress Reports, 2: Performance Analysis

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalUsers: 0,
      activeUsers: 0,
      totalSessions: 0
    },
    userGrowth: [] as { month: string; users: number; growth: number }[],
    sessionStats: [] as { subject: string; sessions: number; completion: number; rating: number }[],
    topPerformers: [] as { name: string; subject: string; sessions: number; rating: number; students: number }[]
  })
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  // Progress Reports state
  const [reports, setReports] = useState<ProgressReport[]>([])
  const [reportsLoading, setReportsLoading] = useState(false)
  const [selectedReport, setSelectedReport] = useState<ProgressReport | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [exportLoading, setExportLoading] = useState<string | null>(null)

  // Create report form state
  const [reportForm, setReportForm] = useState({
    title: '',
    type: 'student' as 'student' | 'tutor' | 'department' | 'subject' | 'custom',
    scope: {
      studentIds: [] as string[],
      tutorIds: [] as string[],
      department: '',
      subject: '',
      timeRange: {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      }
    },
    filters: {
      minScore: undefined as number | undefined,
      minAttendance: undefined as number | undefined,
      subjects: [] as string[]
    }
  })

  const [creatingReport, setCreatingReport] = useState(false)

  // Performance Analysis state
  const [performanceAnalysis, setPerformanceAnalysis] = useState<any>(null)
  const [performanceKPIs, setPerformanceKPIs] = useState<any>(null)
  const [performanceLoading, setPerformanceLoading] = useState(false)
  const [performanceFilters, setPerformanceFilters] = useState({
    type: 'overall' as 'student' | 'tutor' | 'comparative' | 'overall',
    studentIds: [] as string[],
    tutorIds: [] as string[],
    subjects: [] as string[],
    timeRange: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    },
    includeComparisons: false,
    includeTrends: true
  })
  const [studentsList, setStudentsList] = useState<any[]>([])
  const [tutorsList, setTutorsList] = useState<any[]>([])
  const [subjectsList, setSubjectsList] = useState<string[]>([])
  const [isPerformanceAnalysisDialogOpen, setIsPerformanceAnalysisDialogOpen] = useState(false)
  const [isCompareDialogOpen, setIsCompareDialogOpen] = useState(false)
  const [compareEntityIds, setCompareEntityIds] = useState<string[]>([])
  const [compareEntityType, setCompareEntityType] = useState<'student' | 'tutor'>('student')

  // Load reports
  const loadReports = useCallback(async () => {
    try {
      setReportsLoading(true)
      setErrorMessage(null)
      const response = await api.management.reports.list()
      if (response && response.data && response.data.data) {
        setReports(response.data.data)
      } else if (response && Array.isArray(response.data)) {
        setReports(response.data)
      } else {
        setReports([])
      }
    } catch (error: any) {
      console.error('Error loading reports:', error)
      setErrorMessage('Lỗi tải danh sách báo cáo: ' + (error.message || 'Unknown error'))
    } finally {
      setReportsLoading(false)
    }
  }, [])

  // Load analytics data
  const loadAnalytics = useCallback(async () => {
    try {
      setAnalyticsLoading(true)
      setErrorMessage(null)

      // Calculate date range based on selected period
      const now = new Date()
      let startDate: Date
      switch (selectedPeriod) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          break
        case '1y':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          break
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      }

      // Load KPIs for overview
      const kpisResponse = await api.management.analytics.getKPIs()
      if (kpisResponse && kpisResponse.success && kpisResponse.data) {
        const kpis = kpisResponse.data
        setAnalyticsData(prev => ({
          ...prev,
          overview: {
            totalUsers: kpis.overall?.totalStudents + kpis.overall?.totalTutors || 0,
            activeUsers: kpis.overall?.totalStudents || 0, // Use total students as active users for now
            totalSessions: kpis.overall?.totalSessions || 0
          }
        }))
      }

      // Load performance analysis with trends for user growth
      const performanceResponse = await api.management.analytics.getPerformance({
        type: 'overall',
        startDate: startDate.toISOString(),
        endDate: now.toISOString()
      })

      if (performanceResponse && performanceResponse.success && performanceResponse.data) {
        const analysis = performanceResponse.data
        
        // Process trends for user growth chart
        if (analysis.trends && Array.isArray(analysis.trends) && analysis.trends.length > 0) {
          // Group trends by month for better visualization
          const monthMap = new Map<string, {
            users: number[]
            attendanceRates: number[]
            dates: Date[]
          }>()

          analysis.trends.forEach((trend: any) => {
            const date = new Date(trend.date)
            const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            
            if (!monthMap.has(monthKey)) {
              monthMap.set(monthKey, { users: [], attendanceRates: [], dates: [] })
            }
            const monthData = monthMap.get(monthKey)!
            monthData.attendanceRates.push(trend.attendanceRate || 0)
            monthData.dates.push(date)
            // Estimate users from attendance rate (scale for visualization)
            monthData.users.push(Math.round((trend.attendanceRate || 0) * 20))
          })

          // Convert to array and calculate growth
          const sortedMonths = Array.from(monthMap.entries())
            .sort((a, b) => a[1].dates[0].getTime() - b[1].dates[0].getTime())
            .slice(-6) // Last 6 months

          const userGrowth = sortedMonths.map(([month, data], index) => {
            const avgUsers = data.users.length > 0
              ? Math.round(data.users.reduce((sum, u) => sum + u, 0) / data.users.length)
              : 0
            const avgAttendance = data.attendanceRates.length > 0
              ? data.attendanceRates.reduce((sum, r) => sum + r, 0) / data.attendanceRates.length
              : 0
            
            const prevMonth = index > 0 ? sortedMonths[index - 1][1] : null
            const prevAvgAttendance = prevMonth && prevMonth.attendanceRates.length > 0
              ? prevMonth.attendanceRates.reduce((sum, r) => sum + r, 0) / prevMonth.attendanceRates.length
              : 0
            
            const growth = prevAvgAttendance > 0
              ? ((avgAttendance - prevAvgAttendance) / prevAvgAttendance) * 100
              : 0
            
            return {
              month: month.split(' ')[0], // Just month name
              users: avgUsers,
              growth: Math.round(growth * 10) / 10
            }
          })
          
          setAnalyticsData(prev => ({
            ...prev,
            userGrowth: userGrowth.length > 0 ? userGrowth : prev.userGrowth
          }))
        } else {
          // Fallback: create simple growth data from KPIs
          if (kpisResponse && kpisResponse.success && kpisResponse.data) {
            const kpis = kpisResponse.data
            const totalUsers = (kpis.overall?.totalStudents || 0) + (kpis.overall?.totalTutors || 0)
            const userGrowth = [
              { month: 'Jan', users: Math.round(totalUsers * 0.8), growth: 0 },
              { month: 'Feb', users: Math.round(totalUsers * 0.85), growth: 6.25 },
              { month: 'Mar', users: Math.round(totalUsers * 0.9), growth: 5.88 },
              { month: 'Apr', users: Math.round(totalUsers * 0.95), growth: 5.56 },
              { month: 'May', users: Math.round(totalUsers * 0.98), growth: 3.16 },
              { month: 'Jun', users: totalUsers, growth: 2.04 }
            ]
            setAnalyticsData(prev => ({
              ...prev,
              userGrowth
            }))
          }
        }
      }

      // Load sessions to calculate subject performance and top performers
      let allSessions: any[] = []
      try {
        const sessionsResponse = await api.sessions.list({ limit: 1000 })
        if (sessionsResponse && sessionsResponse.data && Array.isArray(sessionsResponse.data)) {
          allSessions = sessionsResponse.data
        } else if (Array.isArray(sessionsResponse.data)) {
          allSessions = sessionsResponse.data
        }

        // Filter sessions by date range
        const filteredSessions = allSessions.filter((s: any) => {
          if (!s.startTime) return false
          const sessionDate = new Date(s.startTime)
          return sessionDate >= startDate && sessionDate <= now
        })

        // Group by subject
        const subjectMap = new Map<string, {
          sessions: number
          completed: number
          ratings: number[]
        }>()

        filteredSessions.forEach((session: any) => {
          if (!session.subject) return
          
          if (!subjectMap.has(session.subject)) {
            subjectMap.set(session.subject, { sessions: 0, completed: 0, ratings: [] })
          }
          const subjectData = subjectMap.get(session.subject)!
          subjectData.sessions++
          if (session.status === 'completed') {
            subjectData.completed++
          }
        })

        // Get evaluations for ratings
        try {
          const evaluationsResponse = await api.evaluations.list({ limit: 1000 })
          let evaluations: any[] = []
          if (evaluationsResponse && evaluationsResponse.data && Array.isArray(evaluationsResponse.data)) {
            evaluations = evaluationsResponse.data
          } else if (Array.isArray(evaluationsResponse.data)) {
            evaluations = evaluationsResponse.data
          }

          // Map evaluations to sessions by subject
          evaluations.forEach((evaluation: any) => {
            const session = filteredSessions.find((s: any) => s.id === evaluation.sessionId)
            if (session && session.subject) {
              if (!subjectMap.has(session.subject)) {
                subjectMap.set(session.subject, { sessions: 0, completed: 0, ratings: [] })
              }
              subjectMap.get(session.subject)!.ratings.push(evaluation.rating || 0)
            }
          })
        } catch (e) {
          console.warn('Could not load evaluations:', e)
        }

        // Convert to array format
        const sessionStats = Array.from(subjectMap.entries()).map(([subject, data]) => ({
          subject,
          sessions: data.sessions,
          completion: data.sessions > 0 ? Math.round((data.completed / data.sessions) * 100) : 0,
          rating: data.ratings.length > 0
            ? Math.round((data.ratings.reduce((sum, r) => sum + r, 0) / data.ratings.length) * 10) / 10
            : 0
        })).sort((a, b) => b.sessions - a.sessions)

        setAnalyticsData(prev => ({
          ...prev,
          sessionStats
        }))

        // Load top performers from KPIs
        if (kpisResponse && kpisResponse.success && kpisResponse.data) {
          const kpis = kpisResponse.data
          
          // Get top rated tutors
          const topPerformers = (kpis.tutors?.topRated || []).slice(0, 4).map((tutor: any) => {
            // Find tutor's primary subject from all sessions
            const tutorSessions = allSessions.filter((s: any) => s.tutorId === tutor.tutorId)
            const subjectCounts = new Map<string, number>()
            tutorSessions.forEach((s: any) => {
              if (s.subject) {
                subjectCounts.set(s.subject, (subjectCounts.get(s.subject) || 0) + 1)
              }
            })
            const primarySubject = Array.from(subjectCounts.entries())
              .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
            
            // Count unique students
            const studentIds = new Set(tutorSessions.flatMap((s: any) => s.studentIds || []))
            
            return {
              name: tutor.tutorName,
              subject: primarySubject,
              sessions: tutorSessions.length,
              rating: tutor.rating,
              students: studentIds.size
            }
          })

          setAnalyticsData(prev => ({
            ...prev,
            topPerformers
          }))
        }
      } catch (e) {
        console.error('Error loading sessions:', e)
      }
    } catch (error: any) {
      console.error('Error loading analytics:', error)
      setErrorMessage('Lỗi tải dữ liệu analytics: ' + (error.message || 'Unknown error'))
    } finally {
      setAnalyticsLoading(false)
    }
  }, [selectedPeriod])

  // Load reports when tab changes
  useEffect(() => {
    if (activeTab === 1) {
      loadReports()
    } else if (activeTab === 0) {
      loadAnalytics()
    }
  }, [activeTab, loadReports, loadAnalytics])

  // Reload analytics when period changes
  useEffect(() => {
    if (activeTab === 0) {
      loadAnalytics()
    }
  }, [selectedPeriod, activeTab, loadAnalytics])

  // Load students and tutors for Performance Analysis
  const loadStudentsAndTutors = useCallback(async () => {
    try {
      // Load students
      const studentsResponse = await api.users.list({ role: 'student', limit: 1000 })
      let students: any[] = []
      if (studentsResponse && studentsResponse.data && Array.isArray(studentsResponse.data)) {
        students = studentsResponse.data
      } else if (Array.isArray(studentsResponse.data)) {
        students = studentsResponse.data
      }
      setStudentsList(students)

      // Load tutors
      const tutorsResponse = await api.users.list({ role: 'tutor', limit: 1000 })
      let tutors: any[] = []
      if (tutorsResponse && tutorsResponse.data && Array.isArray(tutorsResponse.data)) {
        tutors = tutorsResponse.data
      } else if (Array.isArray(tutorsResponse.data)) {
        tutors = tutorsResponse.data
      }
      setTutorsList(tutors)

      // Load subjects from sessions
      try {
        const sessionsResponse = await api.sessions.list({ limit: 1000 })
        let allSessions: any[] = []
        if (sessionsResponse && sessionsResponse.data && Array.isArray(sessionsResponse.data)) {
          allSessions = sessionsResponse.data
        } else if (Array.isArray(sessionsResponse.data)) {
          allSessions = sessionsResponse.data
        }
        
        const subjectsSet = new Set<string>()
        allSessions.forEach((s: any) => {
          if (s.subject) {
            subjectsSet.add(s.subject)
          }
        })
        setSubjectsList(Array.from(subjectsSet).sort())
      } catch (e) {
        console.error('Error loading subjects:', e)
      }
    } catch (error: any) {
      console.error('Error loading students and tutors:', error)
      setErrorMessage('Lỗi tải danh sách học sinh và tutor: ' + (error.message || 'Unknown error'))
    }
  }, [])

  // Load Performance Analysis
  const loadPerformanceAnalysis = useCallback(async () => {
    try {
      setPerformanceLoading(true)
      setErrorMessage(null)

      const params: any = {
        type: performanceFilters.type,
        startDate: new Date(performanceFilters.timeRange.startDate).toISOString(),
        endDate: new Date(performanceFilters.timeRange.endDate + 'T23:59:59').toISOString(),
        includeComparisons: performanceFilters.includeComparisons.toString(),
        includeTrends: performanceFilters.includeTrends.toString()
      }

      if (performanceFilters.studentIds.length > 0) {
        params.studentIds = performanceFilters.studentIds.join(',')
      }
      if (performanceFilters.tutorIds.length > 0) {
        params.tutorIds = performanceFilters.tutorIds.join(',')
      }
      if (performanceFilters.subjects.length > 0) {
        params.subjects = performanceFilters.subjects.join(',')
      }

      const response = await api.management.analytics.getPerformance(params)
      if (response && response.success && response.data) {
        setPerformanceAnalysis(response.data)
      } else {
        setPerformanceAnalysis(null)
        setErrorMessage('Không thể tải phân tích hiệu suất')
      }

      // Also load KPIs
      const kpisResponse = await api.management.analytics.getKPIs()
      if (kpisResponse && kpisResponse.success && kpisResponse.data) {
        setPerformanceKPIs(kpisResponse.data)
      }
    } catch (error: any) {
      console.error('Error loading performance analysis:', error)
      setErrorMessage('Lỗi tải phân tích hiệu suất: ' + (error.message || 'Unknown error'))
      setPerformanceAnalysis(null)
    } finally {
      setPerformanceLoading(false)
    }
  }, [performanceFilters])

  // Load Performance Analysis when tab changes
  useEffect(() => {
    if (activeTab === 2) {
      loadStudentsAndTutors()
      loadPerformanceAnalysis()
    }
  }, [activeTab, loadStudentsAndTutors, loadPerformanceAnalysis])

  // Generate Performance Analysis
  const handleGeneratePerformanceAnalysis = useCallback(async () => {
    try {
      setPerformanceLoading(true)
      setErrorMessage(null)

      const analysisData = {
        type: performanceFilters.type,
        scope: {
          studentIds: performanceFilters.studentIds.length > 0 ? performanceFilters.studentIds : undefined,
          tutorIds: performanceFilters.tutorIds.length > 0 ? performanceFilters.tutorIds : undefined,
          subjects: performanceFilters.subjects.length > 0 ? performanceFilters.subjects : undefined,
          timeRange: {
            startDate: new Date(performanceFilters.timeRange.startDate).toISOString(),
            endDate: new Date(performanceFilters.timeRange.endDate + 'T23:59:59').toISOString()
          }
        },
        includeComparisons: performanceFilters.includeComparisons,
        includeTrends: performanceFilters.includeTrends
      }

      const response = await api.management.analytics.generatePerformanceAnalysis(analysisData)
      if (response && response.success && response.data) {
        setPerformanceAnalysis(response.data)
        setSuccessMessage('Tạo phân tích hiệu suất thành công')
      } else {
        setErrorMessage('Không thể tạo phân tích hiệu suất')
      }
    } catch (error: any) {
      console.error('Error generating performance analysis:', error)
      setErrorMessage('Lỗi tạo phân tích hiệu suất: ' + (error.message || 'Unknown error'))
    } finally {
      setPerformanceLoading(false)
    }
  }, [performanceFilters])

  // Compare Performance
  const handleComparePerformance = useCallback(async () => {
    try {
      if (compareEntityIds.length < 2) {
        setErrorMessage('Cần ít nhất 2 entities để so sánh')
        return
      }

      setPerformanceLoading(true)
      setErrorMessage(null)

      const params: any = {
        entityIds: compareEntityIds.join(','),
        entityType: compareEntityType,
        startDate: new Date(performanceFilters.timeRange.startDate).toISOString(),
        endDate: new Date(performanceFilters.timeRange.endDate + 'T23:59:59').toISOString()
      }

      const response = await api.management.analytics.comparePerformance(params)
      if (response && response.success && response.data) {
        setPerformanceAnalysis(response.data)
        setIsCompareDialogOpen(false)
        setSuccessMessage('So sánh hiệu suất thành công')
      } else {
        setErrorMessage('Không thể so sánh hiệu suất')
      }
    } catch (error: any) {
      console.error('Error comparing performance:', error)
      setErrorMessage('Lỗi so sánh hiệu suất: ' + (error.message || 'Unknown error'))
    } finally {
      setPerformanceLoading(false)
    }
  }, [compareEntityIds, compareEntityType, performanceFilters.timeRange])

  // Export Performance Analysis
  const handleExportPerformanceAnalysis = useCallback(async (format: 'json' | 'csv') => {
    if (!performanceAnalysis) {
      setErrorMessage('Không có dữ liệu để xuất')
      return
    }

    try {
      setExportLoading('performance')
      
      if (format === 'json') {
        const dataStr = JSON.stringify(performanceAnalysis, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `performance-analysis-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        setSuccessMessage('Xuất báo cáo JSON thành công')
      } else if (format === 'csv') {
        // Convert to CSV
        const csvRows: string[] = []
        
        // Header
        csvRows.push('Metric,Value')
        
        // Metrics
        if (performanceAnalysis.metrics) {
          csvRows.push(`Attendance Rate,${performanceAnalysis.metrics.attendance?.rate || 0}%`)
          csvRows.push(`Average Rating,${performanceAnalysis.metrics.ratings?.average || 0}`)
          csvRows.push(`Completion Rate,${performanceAnalysis.metrics.completion?.rate || 0}%`)
          csvRows.push(`Average Score,${performanceAnalysis.metrics.scores?.average || 0}`)
        }
        
        // Trends
        if (performanceAnalysis.trends && performanceAnalysis.trends.length > 0) {
          csvRows.push('')
          csvRows.push('Trends')
          csvRows.push('Date,Attendance Rate,Average Rating,Completion Rate,Average Score')
          performanceAnalysis.trends.forEach((trend: any) => {
            csvRows.push(`${trend.date},${trend.attendanceRate || 0},${trend.averageRating || 0},${trend.completionRate || 0},${trend.averageScore || 0}`)
          })
        }
        
        // Comparisons
        if (performanceAnalysis.comparisons && performanceAnalysis.comparisons.length > 0) {
          csvRows.push('')
          csvRows.push('Comparisons')
          csvRows.push('Entity Name,Attendance Rate,Average Rating,Completion Rate,Average Score,Rank,Percentile')
          performanceAnalysis.comparisons.forEach((comp: any) => {
            csvRows.push(`${comp.entityName},${comp.metrics?.attendance?.rate || 0},${comp.metrics?.ratings?.average || 0},${comp.metrics?.completion?.rate || 0},${comp.metrics?.scores?.average || 0},${comp.rank || 0},${comp.percentile || 0}`)
          })
        }
        
        const csvStr = csvRows.join('\n')
        const dataBlob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `performance-analysis-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        setSuccessMessage('Xuất báo cáo CSV thành công')
      }
    } catch (error: any) {
      console.error('Error exporting performance analysis:', error)
      setErrorMessage('Lỗi xuất báo cáo: ' + (error.message || 'Unknown error'))
    } finally {
      setExportLoading(null)
    }
  }, [performanceAnalysis])

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
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

  // Create report
  const handleCreateReport = async () => {
    try {
      setCreatingReport(true)
      setErrorMessage(null)
      setSuccessMessage(null)

      // Validate form
      if (!reportForm.title.trim()) {
        setErrorMessage('Vui lòng nhập tiêu đề báo cáo')
        return
      }

      if (!reportForm.scope.timeRange.startDate || !reportForm.scope.timeRange.endDate) {
        setErrorMessage('Vui lòng chọn khoảng thời gian')
        return
      }

      // Convert date to ISO format
      const startDateISO = new Date(reportForm.scope.timeRange.startDate + 'T00:00:00.000Z').toISOString()
      const endDateISO = new Date(reportForm.scope.timeRange.endDate + 'T23:59:59.999Z').toISOString()

      const reportData = {
        title: reportForm.title,
        type: reportForm.type,
        scope: {
          ...reportForm.scope,
          studentIds: reportForm.scope.studentIds.length > 0 ? reportForm.scope.studentIds : undefined,
          tutorIds: reportForm.scope.tutorIds.length > 0 ? reportForm.scope.tutorIds : undefined,
          department: reportForm.scope.department || undefined,
          subject: reportForm.scope.subject || undefined,
          timeRange: {
            startDate: startDateISO,
            endDate: endDateISO
          }
        },
        filters: {
          minScore: reportForm.filters.minScore || undefined,
          minAttendance: reportForm.filters.minAttendance || undefined,
          subjects: reportForm.filters.subjects.length > 0 ? reportForm.filters.subjects : undefined
        }
      }

      const response = await api.management.reports.create(reportData)
      if (response && response.success) {
        setSuccessMessage('Tạo báo cáo thành công')
        setIsCreateDialogOpen(false)
        // Reset form
        setReportForm({
          title: '',
          type: 'student',
          scope: {
            studentIds: [],
            tutorIds: [],
            department: '',
            subject: '',
            timeRange: {
              startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              endDate: new Date().toISOString().split('T')[0]
            }
          },
          filters: {
            minScore: undefined,
            minAttendance: undefined,
            subjects: []
          }
        })
        // Reload reports
        await loadReports()
      } else {
        setErrorMessage(response?.error || 'Lỗi tạo báo cáo')
      }
    } catch (error: any) {
      console.error('Error creating report:', error)
      setErrorMessage('Lỗi tạo báo cáo: ' + (error.message || 'Unknown error'))
    } finally {
      setCreatingReport(false)
    }
  }

  // View report
  const handleViewReport = async (reportId: string) => {
    try {
      setErrorMessage(null)
      const response = await api.management.reports.get(reportId)
      if (response && response.data) {
        setSelectedReport(response.data)
        setIsViewDialogOpen(true)
      } else {
        setErrorMessage('Không tìm thấy báo cáo')
      }
    } catch (error: any) {
      console.error('Error viewing report:', error)
      setErrorMessage('Lỗi tải báo cáo: ' + (error.message || 'Unknown error'))
    }
  }

  // Export report
  const handleExportReport = async (reportId: string, format: 'json' | 'csv' | 'pdf') => {
    try {
      setExportLoading(reportId)
      setErrorMessage(null)
      
      // Get token for authenticated request
      const token = localStorage.getItem('token')
      // Use API_BASE_URL - check if in production or development
      const isProduction = typeof window !== 'undefined' 
        ? window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
        : false
      const API_BASE_URL = isProduction ? '/api' : 'http://localhost:3000/api'
      const url = `${API_BASE_URL}/management/reports/progress/${reportId}/export?format=${format}`
      
      // Fetch file directly
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for file downloads
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Lỗi xuất báo cáo')
      }
      
      // Get content type and filename from headers
      const contentType = response.headers.get('content-type') || 
        (format === 'json' ? 'application/json' : 
         format === 'csv' ? 'text/csv' : 
         'application/pdf')
      const contentDisposition = response.headers.get('content-disposition')
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `progress-report-${reportId}.${format}`
      
      // Get blob data
      const blob = await response.blob()
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)
      
      setSuccessMessage(`Xuất báo cáo thành công (${format.toUpperCase()})`)
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error: any) {
      console.error('Error exporting report:', error)
      setErrorMessage('Lỗi xuất báo cáo: ' + (error.message || 'Unknown error'))
    } finally {
      setExportLoading(null)
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    })
  }

  // Format datetime
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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

            {/* Analytics Overview */}
            <div className="mb-8">
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                ANALYTICS OVERVIEW
              </h3>
              <div className="space-y-3">
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Total Users:</span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {analyticsData.overview.totalUsers.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Active Users:</span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {analyticsData.overview.activeUsers.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Total Sessions:</span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {analyticsData.overview.totalSessions.toLocaleString()}
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
                  Reports & Analytics
                </h1>
                <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Comprehensive system analytics and reporting
                </p>
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
                <Tab label="Analytics" />
                <Tab label="Progress Reports" />
                <Tab label="Performance Analysis" />
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
            /* Analytics Tab */
            <>
              {/* Loading State */}
              {analyticsLoading && (
                <div className="text-center py-8 mb-8">
                  <LinearProgress className="mb-4" />
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Đang tải dữ liệu analytics...
                  </p>
          </div>
              )}

          {/* Filters */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Search and Filters */}
            <div className="lg:col-span-2">
              <Card 
                className={`p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                style={{
                  borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                  boxShadow: 'none !important'
                }}
              >
                <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Report Filters
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <select
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                      className={`w-full px-3 py-3 border rounded-lg ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="7d">Last 7 Days</option>
                      <option value="30d">Last 30 Days</option>
                      <option value="90d">Last 90 Days</option>
                      <option value="1y">Last Year</option>
                    </select>
                  </div>
                  <div>
                    <select
                      value={selectedMetric}
                      onChange={(e) => setSelectedMetric(e.target.value)}
                      className={`w-full px-3 py-3 border rounded-lg ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="all">All Metrics</option>
                      <option value="users">User Analytics</option>
                      <option value="sessions">Session Analytics</option>
                    </select>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <Card 
                className={`p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                style={{
                  borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                  boxShadow: 'none !important'
                }}
              >
                <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button className={`w-full flex items-center px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  } transition-colors`}>
                    <DownloadIcon className="mr-3 w-4 h-4" />
                    Export PDF
                  </button>
                  <button className={`w-full flex items-center px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  } transition-colors`}>
                    <FilterListIcon className="mr-3 w-4 h-4" />
                    Advanced Filters
                  </button>
                  <button className={`w-full flex items-center px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  } transition-colors`}>
                    <DateRangeIcon className="mr-3 w-4 h-4" />
                    Custom Date Range
                  </button>
                </div>
              </Card>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card 
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
                    {analyticsData.overview.totalUsers.toLocaleString()}
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total Users
                  </p>
                </div>
                <div className="text-3xl text-blue-600">
                  <People />
                </div>
              </div>
            </Card>

            <Card 
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
                    {analyticsData.overview.activeUsers.toLocaleString()}
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Active Users
                  </p>
                </div>
                <div className="text-3xl text-green-600">
                  <TrendingUp />
                </div>
              </div>
            </Card>

            <Card 
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
                    {analyticsData.overview.totalSessions.toLocaleString()}
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total Sessions
                  </p>
                </div>
                <div className="text-3xl text-purple-600">
                  <Schedule />
                </div>
              </div>
            </Card>
          </div>

          {/* Session Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Subject Performance */}
            <Card 
              className={`p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
              style={{
                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                boxShadow: 'none !important'
              }}
            >
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Subject Performance
              </h3>
                  {analyticsData.sessionStats.length > 0 ? (
              <div className="space-y-4">
                {analyticsData.sessionStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {stat.subject}
                        </span>
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {stat.sessions} sessions
                        </span>
                      </div>
                      <div className={`w-full rounded-full h-2 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${stat.completion}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {stat.completion}% completion
                        </span>
                        <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          ⭐ {stat.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Chưa có dữ liệu môn học
                      </p>
                    </div>
                  )}
            </Card>

            {/* Top Performers */}
            <Card 
              className={`p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
              style={{
                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                boxShadow: 'none !important'
              }}
            >
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Top Performers
              </h3>
                  {analyticsData.topPerformers.length > 0 ? (
              <div className="space-y-4">
                {analyticsData.topPerformers.map((performer, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: getAvatarColor(performer.name),
                          fontSize: '1rem',
                          fontWeight: 'bold',
                          mr: 3
                        }}
                      >
                        {getInitials(performer.name)}
                      </Avatar>
                      <div>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {performer.name}
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {performer.subject}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {performer.sessions} sessions
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        ⭐ {performer.rating} • {performer.students} students
                      </p>
                    </div>
                  </div>
                ))}
              </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Chưa có dữ liệu top performers
                      </p>
                    </div>
                  )}
            </Card>
          </div>

          {/* Growth Chart */}
              {analyticsData.userGrowth.length > 0 ? (
          <Card 
            className={`p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
            style={{
              borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
              backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
              boxShadow: 'none !important'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              User Growth Trend
            </h3>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Users</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Growth %</span>
                </div>
              </div>
            </div>
            
            {/* Simple MUI X Line Chart */}
            <div className="h-80">
              <LineChart
                height={300}
                series={[
                  {
                    data: analyticsData.userGrowth.map(d => d.users),
                    label: 'Users',
                    color: '#3b82f6',
                    showMark: true
                  },
                  {
                    data: analyticsData.userGrowth.map(d => d.growth),
                    label: 'Growth %',
                    color: '#10b981',
                    showMark: true
                  }
                ]}
                xAxis={[{
                  scaleType: 'point',
                  data: analyticsData.userGrowth.map(d => d.month)
                }]}
                yAxis={[{
                  valueFormatter: (value: number) => value.toString()
                }]}
                grid={{ vertical: true, horizontal: true }}
                margin={{ left: 60, right: 24, top: 20, bottom: 20 }}
                sx={{
                  [`& .${axisClasses.root}`]: {
                    [`& .${axisClasses.tickLabel}`]: {
                      fill: theme === 'dark' ? '#ffffff' : '#374151',
                      fontSize: '0.875rem',
                      fontWeight: 500
                    },
                    [`& .${axisClasses.label}`]: {
                      fill: theme === 'dark' ? '#ffffff' : '#374151',
                      fontSize: '0.875rem',
                      fontWeight: 500
                    },
                    [`& .${axisClasses.tick}, .${axisClasses.line}`]: {
                      stroke: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                      strokeWidth: 1
                    }
                  },
                  [`& .${legendClasses.root} .${legendClasses.label}`]: {
                    fill: theme === 'dark' ? '#ffffff' : '#374151',
                    fontSize: '0.875rem',
                    fontWeight: 500
                  },
                  '& .MuiChartsGrid-root .MuiChartsGrid-line': {
                    stroke: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                    strokeWidth: 1
                  }
                }}
              />
            </div>
            
            {/* Chart Summary */}
                  {analyticsData.userGrowth.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {analyticsData.userGrowth[analyticsData.userGrowth.length - 1]?.users || 0}
                  </p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Current Users
                  </p>
                </div>
                <div>
                  <p className={`text-2xl font-bold text-green-600`}>
                            +{analyticsData.userGrowth.length > 0 
                              ? Math.round(analyticsData.userGrowth.reduce((sum, data) => sum + data.growth, 0) / analyticsData.userGrowth.length)
                              : 0}%
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Avg Growth
                  </p>
                </div>
                <div>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {analyticsData.userGrowth.length > 0
                              ? (analyticsData.userGrowth[analyticsData.userGrowth.length - 1]?.users || 0) - (analyticsData.userGrowth[0]?.users || 0)
                              : 0}
                  </p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Total Growth
                    </p>
                  </div>
                </div>
            </div>
                  )}
          </Card>
              ) : (
                <Card 
                  className={`p-8 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} text-center`}
                  style={{
                    borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    boxShadow: 'none !important'
                  }}
                >
                  <p className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Chưa có dữ liệu User Growth
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Dữ liệu sẽ được hiển thị khi có đủ thông tin trends
                  </p>
                </Card>
              )}
            </>
          ) : activeTab === 1 ? (
            /* Progress Reports Tab */
            <div>
              {/* Header Actions */}
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Progress Reports
                </h2>
                <MuiButton
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setIsCreateDialogOpen(true)}
                  sx={{
                    backgroundColor: '#3b82f6',
                    '&:hover': {
                      backgroundColor: '#2563eb'
                    }
                  }}
                >
                  Create Report
                </MuiButton>
              </div>

              {/* Reports List */}
              {reportsLoading ? (
                <div className="text-center py-8">
                  <LinearProgress className="mb-4" />
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Đang tải danh sách báo cáo...
                  </p>
                </div>
              ) : reports.length === 0 ? (
                <Card 
                  className={`p-8 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} text-center`}
                  style={{
                    borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    boxShadow: 'none !important'
                  }}
                >
                  <AssignmentIcon className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                  <p className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Chưa có báo cáo nào
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Tạo báo cáo tiến độ đầu tiên để bắt đầu
                  </p>
                  <MuiButton
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setIsCreateDialogOpen(true)}
                    sx={{
                      mt: 3,
                      backgroundColor: '#3b82f6',
                      '&:hover': {
                        backgroundColor: '#2563eb'
                      }
                    }}
                  >
                    Create Report
                  </MuiButton>
                </Card>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <Card
                      key={report.id}
                      className={`p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} cursor-pointer hover:shadow-lg transition-shadow`}
                      style={{
                        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                        boxShadow: 'none !important'
                      }}
                      onClick={() => handleViewReport(report.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className={`text-xl font-semibold mr-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {report.title}
                            </h3>
                            <Chip
                              label={report.type}
                              size="small"
                              sx={{
                                backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                                color: theme === 'dark' ? '#ffffff' : '#111827',
                                fontSize: '0.75rem',
                                height: '24px'
                              }}
                            />
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div>
                              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                Thời gian
                              </p>
                              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {formatDate(report.scope.timeRange.startDate)} - {formatDate(report.scope.timeRange.endDate)}
                              </p>
                            </div>
                            {report.data.summary.totalStudents > 0 && (
                              <div>
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Số học sinh
                                </p>
                                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {report.data.summary.totalStudents}
                                </p>
                              </div>
                            )}
                            {report.data.summary.totalTutors > 0 && (
                              <div>
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Số gia sư
                                </p>
                                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {report.data.summary.totalTutors}
                                </p>
                              </div>
                            )}
                            <div>
                              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                Tổng số buổi học
                              </p>
                              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {report.data.summary.totalSessions}
                              </p>
                            </div>
                          </div>
                          {report.creator && (
                            <div className="mt-3">
                              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                Tạo bởi: {report.creator.name} • {formatDateTime(report.createdAt)}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <MuiButton
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewReport(report.id)
                            }}
                            sx={{
                              color: theme === 'dark' ? '#ffffff' : '#111827',
                              '&:hover': {
                                backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6'
                              }
                            }}
                          >
                            View
                          </MuiButton>
                          <MuiButton
                            size="small"
                            startIcon={<DownloadIcon />}
                            onClick={(e) => {
                              e.stopPropagation()
                              // Show export menu
                            }}
                            sx={{
                              color: theme === 'dark' ? '#ffffff' : '#111827',
                              '&:hover': {
                                backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6'
                              }
                            }}
                          >
                            Export
                          </MuiButton>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 2 ? (
            /* Performance Analysis Tab */
            <div>
              {/* Header Actions */}
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Academic Performance Analysis
                </h2>
                <div className="flex items-center space-x-2">
                  <MuiButton
                    variant="outlined"
                    startIcon={<FilterListIcon />}
                    onClick={() => setIsPerformanceAnalysisDialogOpen(true)}
                    sx={{
                      color: theme === 'dark' ? '#ffffff' : '#111827',
                      borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                      '&:hover': {
                        borderColor: theme === 'dark' ? '#6b7280' : '#9ca3af',
                        backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6'
                      }
                    }}
                  >
                    Filters
                  </MuiButton>
                  <MuiButton
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={loadPerformanceAnalysis}
                    disabled={performanceLoading}
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
                  {performanceAnalysis && (
                    <>
                      <MuiButton
                        variant="outlined"
                        startIcon={<JsonIcon />}
                        onClick={() => handleExportPerformanceAnalysis('json')}
                        disabled={exportLoading === 'performance'}
                        sx={{
                          color: theme === 'dark' ? '#ffffff' : '#111827',
                          borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                          '&:hover': {
                            borderColor: theme === 'dark' ? '#6b7280' : '#9ca3af',
                            backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6'
                          }
                        }}
                      >
                        JSON
                      </MuiButton>
                      <MuiButton
                        variant="outlined"
                        startIcon={<CsvIcon />}
                        onClick={() => handleExportPerformanceAnalysis('csv')}
                        disabled={exportLoading === 'performance'}
                        sx={{
                          color: theme === 'dark' ? '#ffffff' : '#111827',
                          borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                          '&:hover': {
                            borderColor: theme === 'dark' ? '#6b7280' : '#9ca3af',
                            backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6'
                          }
                        }}
                      >
                        CSV
                      </MuiButton>
                    </>
                  )}
                </div>
              </div>

              {/* Loading State */}
              {performanceLoading && (
                <div className="text-center py-8 mb-8">
                  <LinearProgress className="mb-4" />
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Đang tải phân tích hiệu suất...
                  </p>
                </div>
              )}

              {/* KPI Dashboard */}
              {performanceKPIs && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Card
                    className={`p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                    style={{
                      borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                      backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                      boxShadow: 'none !important'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Tổng số học sinh
                        </p>
                        <p className={`text-2xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {performanceKPIs.overall?.totalStudents || 0}
                        </p>
                      </div>
                      <People className={`w-8 h-8 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                  </Card>

                  <Card
                    className={`p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                    style={{
                      borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                      backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                      boxShadow: 'none !important'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Tổng số gia sư
                        </p>
                        <p className={`text-2xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {performanceKPIs.overall?.totalTutors || 0}
                        </p>
                      </div>
                      <People className={`w-8 h-8 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                    </div>
                  </Card>

                  <Card
                    className={`p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                    style={{
                      borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                      backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                      boxShadow: 'none !important'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Điểm danh trung bình
                        </p>
                        <p className={`text-2xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {performanceKPIs.overall?.averageAttendanceRate?.toFixed(1) || 0}%
                        </p>
                      </div>
                      <CheckCircleIcon className={`w-8 h-8 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`} />
                    </div>
                  </Card>

                  <Card
                    className={`p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                    style={{
                      borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                      backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                      boxShadow: 'none !important'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Đánh giá trung bình
                        </p>
                        <p className={`text-2xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {performanceKPIs.overall?.averageRating?.toFixed(1) || 0}
                        </p>
                      </div>
                      <Star className={`w-8 h-8 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
                    </div>
                  </Card>
                </div>
              )}

              {/* Performance Metrics */}
              {performanceAnalysis && performanceAnalysis.metrics && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Attendance Metrics */}
                  <Card
                    className={`p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                    style={{
                      borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                      backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                      boxShadow: 'none !important'
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 3, color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                      Điểm Danh
                    </Typography>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Tỷ lệ điểm danh</span>
                        <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {performanceAnalysis.metrics.attendance?.rate?.toFixed(1) || 0}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Có mặt</span>
                        <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {performanceAnalysis.metrics.attendance?.present || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Vắng mặt</span>
                        <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {performanceAnalysis.metrics.attendance?.absent || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Tổng</span>
                        <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {performanceAnalysis.metrics.attendance?.total || 0}
                        </span>
                      </div>
                    </div>
                  </Card>

                  {/* Ratings Metrics */}
                  <Card
                    className={`p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                    style={{
                      borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                      backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                      boxShadow: 'none !important'
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 3, color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                      Đánh Giá
                    </Typography>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Đánh giá trung bình</span>
                        <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {performanceAnalysis.metrics.ratings?.average?.toFixed(1) || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Tổng số đánh giá</span>
                        <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {performanceAnalysis.metrics.ratings?.total || 0}
                        </span>
                      </div>
                      {performanceAnalysis.metrics.ratings?.distribution && performanceAnalysis.metrics.ratings.distribution.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <Typography variant="subtitle2" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                            Phân bố đánh giá
                          </Typography>
                          {performanceAnalysis.metrics.ratings.distribution.map((dist: any, index: number) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                {dist.rating} sao
                              </span>
                              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {dist.count}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Completion Metrics */}
                  <Card
                    className={`p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                    style={{
                      borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                      backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                      boxShadow: 'none !important'
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 3, color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                      Hoàn Thành
                    </Typography>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Tỷ lệ hoàn thành</span>
                        <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {performanceAnalysis.metrics.completion?.rate?.toFixed(1) || 0}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Đã hoàn thành</span>
                        <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {performanceAnalysis.metrics.completion?.completed || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Tổng</span>
                        <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {performanceAnalysis.metrics.completion?.total || 0}
                        </span>
                      </div>
                    </div>
                  </Card>

                  {/* Scores Metrics */}
                  <Card
                    className={`p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                    style={{
                      borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                      backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                      boxShadow: 'none !important'
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 3, color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                      Điểm Số
                    </Typography>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Điểm trung bình</span>
                        <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {performanceAnalysis.metrics.scores?.average?.toFixed(1) || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Tổng số điểm</span>
                        <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {performanceAnalysis.metrics.scores?.total || 0}
                        </span>
                      </div>
                      {performanceAnalysis.metrics.scores?.distribution && performanceAnalysis.metrics.scores.distribution.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <Typography variant="subtitle2" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                            Phân bố điểm
                          </Typography>
                          {performanceAnalysis.metrics.scores.distribution.map((dist: any, index: number) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                {dist.range}
                              </span>
                              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {dist.count}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              )}

              {/* Trends Chart */}
              {performanceAnalysis && performanceAnalysis.trends && performanceAnalysis.trends.length > 0 && (
                <Card
                  className={`p-6 border mb-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                  style={{
                    borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    boxShadow: 'none !important'
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 3, color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                    Xu Hướng Hiệu Suất
                  </Typography>
                  <div className="h-80">
                    <LineChart
                      height={300}
                      series={[
                        {
                          data: performanceAnalysis.trends.map((t: any) => t.attendanceRate || 0),
                          label: 'Attendance Rate (%)',
                          color: '#3b82f6',
                          showMark: true
                        },
                        {
                          data: performanceAnalysis.trends.map((t: any) => (t.averageRating || 0) * 20), // Scale for visualization
                          label: 'Average Rating (scaled)',
                          color: '#10b981',
                          showMark: true
                        },
                        {
                          data: performanceAnalysis.trends.map((t: any) => t.completionRate || 0),
                          label: 'Completion Rate (%)',
                          color: '#f59e0b',
                          showMark: true
                        }
                      ]}
                      xAxis={[{
                        scaleType: 'point',
                        data: performanceAnalysis.trends.map((t: any) => {
                          const date = new Date(t.date)
                          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        })
                      }]}
                      yAxis={[{
                        valueFormatter: (value: number) => value.toFixed(1)
                      }]}
                      grid={{ vertical: true, horizontal: true }}
                      margin={{ left: 60, right: 24, top: 20, bottom: 40 }}
                      sx={{
                        [`& .${axisClasses.root}`]: {
                          [`& .${axisClasses.tickLabel}`]: {
                            fill: theme === 'dark' ? '#ffffff' : '#374151',
                            fontSize: '0.875rem',
                            fontWeight: 500
                          },
                          [`& .${axisClasses.label}`]: {
                            fill: theme === 'dark' ? '#ffffff' : '#374151',
                            fontSize: '0.875rem',
                            fontWeight: 500
                          },
                          [`& .${axisClasses.tick}, .${axisClasses.line}`]: {
                            stroke: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                            strokeWidth: 1
                          }
                        },
                        [`& .${legendClasses.root} .${legendClasses.label}`]: {
                          fill: theme === 'dark' ? '#ffffff' : '#374151',
                          fontSize: '0.875rem',
                          fontWeight: 500
                        },
                        '& .MuiChartsGrid-root .MuiChartsGrid-line': {
                          stroke: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                          strokeWidth: 1
                        }
                      }}
                    />
                  </div>
                </Card>
              )}

              {/* Comparisons */}
              {performanceAnalysis && performanceAnalysis.comparisons && performanceAnalysis.comparisons.length > 0 && (
                <Card
                  className={`p-6 border mb-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                  style={{
                    borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    boxShadow: 'none !important'
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Typography variant="h6" sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                      So Sánh Hiệu Suất
                    </Typography>
                    <MuiButton
                      size="small"
                      variant="outlined"
                      onClick={() => setIsCompareDialogOpen(true)}
                      sx={{
                        color: theme === 'dark' ? '#ffffff' : '#111827',
                        borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db'
                      }}
                    >
                      So Sánh Mới
                    </MuiButton>
                  </div>
                  <div className="space-y-4">
                    {performanceAnalysis.comparisons.map((comp: any, index: number) => (
                      <Card
                        key={index}
                        className={`p-4 border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                        style={{
                          borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                          backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                          boxShadow: 'none !important'
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <Typography variant="subtitle1" sx={{ color: theme === 'dark' ? '#ffffff' : '#111827', fontWeight: 600 }}>
                              {comp.entityName}
                            </Typography>
                            <div className="flex items-center space-x-4 mt-1">
                              <Chip
                                label={`Rank: ${comp.rank || 'N/A'}`}
                                size="small"
                                sx={{
                                  backgroundColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                                  color: theme === 'dark' ? '#ffffff' : '#111827',
                                  fontSize: '0.75rem'
                                }}
                              />
                              <Chip
                                label={`Percentile: ${comp.percentile?.toFixed(1) || 0}%`}
                                size="small"
                                sx={{
                                  backgroundColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                                  color: theme === 'dark' ? '#ffffff' : '#111827',
                                  fontSize: '0.75rem'
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              Điểm danh
                            </p>
                            <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {comp.metrics?.attendance?.rate?.toFixed(1) || 0}%
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              Đánh giá
                            </p>
                            <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {comp.metrics?.ratings?.average?.toFixed(1) || 0}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              Hoàn thành
                            </p>
                            <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {comp.metrics?.completion?.rate?.toFixed(1) || 0}%
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              Điểm số
                            </p>
                            <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {comp.metrics?.scores?.average?.toFixed(1) || 0}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              )}

              {/* Empty State */}
              {!performanceLoading && !performanceAnalysis && (
                <Card
                  className={`p-8 border text-center ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                  style={{
                    borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    boxShadow: 'none !important'
                  }}
                >
                  <TrendingUp className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                  <Typography variant="h6" sx={{ mb: 2, color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                    Chưa có dữ liệu phân tích
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 4, color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                    Chọn filters và nhấn "Generate Analysis" để tạo phân tích hiệu suất
                  </Typography>
                  <MuiButton
                    variant="contained"
                    onClick={() => setIsPerformanceAnalysisDialogOpen(true)}
                    sx={{
                      backgroundColor: '#3b82f6',
                      '&:hover': {
                        backgroundColor: '#2563eb'
                      }
                    }}
                  >
                    Configure Filters
                  </MuiButton>
                </Card>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Performance Analysis Filters Dialog */}
      <Dialog
        open={isPerformanceAnalysisDialogOpen}
        onClose={() => setIsPerformanceAnalysisDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            color: theme === 'dark' ? '#ffffff' : '#111827'
          }
        }}
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
            Performance Analysis Filters
          </Typography>
        </DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-4">
            {/* Analysis Type */}
            <FormControl fullWidth>
              <InputLabel sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                Analysis Type *
              </InputLabel>
              <Select
                value={performanceFilters.type}
                onChange={(e) => setPerformanceFilters({ ...performanceFilters, type: e.target.value as any })}
                sx={{
                  color: theme === 'dark' ? '#ffffff' : '#111827',
                  backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db'
                  }
                }}
              >
                <MenuItem value="overall">Overall</MenuItem>
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="tutor">Tutor</MenuItem>
                <MenuItem value="comparative">Comparative</MenuItem>
              </Select>
            </FormControl>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <TextField
                fullWidth
                label="Start Date *"
                type="date"
                value={performanceFilters.timeRange.startDate}
                onChange={(e) => setPerformanceFilters({
                  ...performanceFilters,
                  timeRange: { ...performanceFilters.timeRange, startDate: e.target.value }
                })}
                InputLabelProps={{ shrink: true }}
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
              <TextField
                fullWidth
                label="End Date *"
                type="date"
                value={performanceFilters.timeRange.endDate}
                onChange={(e) => setPerformanceFilters({
                  ...performanceFilters,
                  timeRange: { ...performanceFilters.timeRange, endDate: e.target.value }
                })}
                InputLabelProps={{ shrink: true }}
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

            {/* Students */}
            {(performanceFilters.type === 'student' || performanceFilters.type === 'comparative') && (
              <Autocomplete
                multiple
                options={studentsList}
                getOptionLabel={(option) => option.name || option.email || option.id}
                value={studentsList.filter(s => performanceFilters.studentIds.includes(s.id))}
                onChange={(e, newValue) => {
                  setPerformanceFilters({
                    ...performanceFilters,
                    studentIds: newValue.map(v => v.id)
                  })
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Students"
                    placeholder="Select students"
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
                )}
              />
            )}

            {/* Tutors */}
            {(performanceFilters.type === 'tutor' || performanceFilters.type === 'comparative') && (
              <Autocomplete
                multiple
                options={tutorsList}
                getOptionLabel={(option) => option.name || option.email || option.id}
                value={tutorsList.filter(t => performanceFilters.tutorIds.includes(t.id))}
                onChange={(e, newValue) => {
                  setPerformanceFilters({
                    ...performanceFilters,
                    tutorIds: newValue.map(v => v.id)
                  })
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tutors"
                    placeholder="Select tutors"
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
                )}
              />
            )}

            {/* Subjects */}
            <Autocomplete
              multiple
              options={subjectsList}
              value={performanceFilters.subjects}
              onChange={(e, newValue) => {
                setPerformanceFilters({
                  ...performanceFilters,
                  subjects: newValue
                })
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Subjects"
                  placeholder="Select subjects"
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
              )}
            />

            {/* Options */}
            <div className="space-y-2">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={performanceFilters.includeComparisons}
                    onChange={(e) => setPerformanceFilters({
                      ...performanceFilters,
                      includeComparisons: e.target.checked
                    })}
                    sx={{
                      color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                      '&.Mui-checked': {
                        color: '#3b82f6'
                      }
                    }}
                  />
                }
                label="Include Comparisons"
                sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={performanceFilters.includeTrends}
                    onChange={(e) => setPerformanceFilters({
                      ...performanceFilters,
                      includeTrends: e.target.checked
                    })}
                    sx={{
                      color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                      '&.Mui-checked': {
                        color: '#3b82f6'
                      }
                    }}
                  />
                }
                label="Include Trends"
                sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <MuiButton
            onClick={() => setIsPerformanceAnalysisDialogOpen(false)}
            sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}
          >
            Cancel
          </MuiButton>
          <MuiButton
            onClick={() => {
              setIsPerformanceAnalysisDialogOpen(false)
              handleGeneratePerformanceAnalysis()
            }}
            variant="contained"
            disabled={performanceLoading}
            sx={{
              backgroundColor: '#3b82f6',
              '&:hover': {
                backgroundColor: '#2563eb'
              }
            }}
          >
            Generate Analysis
          </MuiButton>
        </DialogActions>
      </Dialog>

      {/* Compare Performance Dialog */}
      <Dialog
        open={isCompareDialogOpen}
        onClose={() => setIsCompareDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            color: theme === 'dark' ? '#ffffff' : '#111827'
          }
        }}
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
            Compare Performance
          </Typography>
        </DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-4">
            {/* Entity Type */}
            <FormControl fullWidth>
              <InputLabel sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                Entity Type *
              </InputLabel>
              <Select
                value={compareEntityType}
                onChange={(e) => setCompareEntityType(e.target.value as 'student' | 'tutor')}
                sx={{
                  color: theme === 'dark' ? '#ffffff' : '#111827',
                  backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db'
                  }
                }}
              >
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="tutor">Tutor</MenuItem>
              </Select>
            </FormControl>

            {/* Entities */}
            <Autocomplete
              multiple
              options={compareEntityType === 'student' ? studentsList : tutorsList}
              getOptionLabel={(option) => option.name || option.email || option.id}
              value={(compareEntityType === 'student' ? studentsList : tutorsList).filter(e => compareEntityIds.includes(e.id))}
              onChange={(e, newValue) => {
                setCompareEntityIds(newValue.map(v => v.id))
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={compareEntityType === 'student' ? 'Students' : 'Tutors'}
                  placeholder={`Select at least 2 ${compareEntityType === 'student' ? 'students' : 'tutors'}`}
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
              )}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <MuiButton
            onClick={() => setIsCompareDialogOpen(false)}
            sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}
          >
            Cancel
          </MuiButton>
          <MuiButton
            onClick={handleComparePerformance}
            variant="contained"
            disabled={performanceLoading || compareEntityIds.length < 2}
            sx={{
              backgroundColor: '#3b82f6',
              '&:hover': {
                backgroundColor: '#2563eb'
              }
            }}
          >
            Compare
          </MuiButton>
        </DialogActions>
      </Dialog>

      {/* Create Report Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onClose={() => !creatingReport && setIsCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            color: theme === 'dark' ? '#ffffff' : '#111827'
          }
        }}
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
            Tạo Báo Cáo Tiến Độ
          </Typography>
        </DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-4">
            {/* Title */}
            <TextField
              fullWidth
              label="Tiêu đề báo cáo *"
              value={reportForm.title}
              onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
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

            {/* Type */}
            <FormControl fullWidth>
              <InputLabel sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                Loại báo cáo *
              </InputLabel>
              <Select
                value={reportForm.type}
                onChange={(e) => setReportForm({ ...reportForm, type: e.target.value as any })}
                sx={{
                  color: theme === 'dark' ? '#ffffff' : '#111827',
                  backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme === 'dark' ? '#6b7280' : '#9ca3af'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#3b82f6'
                  }
                }}
              >
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="tutor">Tutor</MenuItem>
                <MenuItem value="department">Department</MenuItem>
                <MenuItem value="subject">Subject</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
              </Select>
            </FormControl>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <TextField
                fullWidth
                label="Từ ngày *"
                type="date"
                value={reportForm.scope.timeRange.startDate}
                onChange={(e) => setReportForm({
                  ...reportForm,
                  scope: {
                    ...reportForm.scope,
                    timeRange: {
                      ...reportForm.scope.timeRange,
                      startDate: e.target.value
                    }
                  }
                })}
                InputLabelProps={{ shrink: true }}
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
              <TextField
                fullWidth
                label="Đến ngày *"
                type="date"
                value={reportForm.scope.timeRange.endDate}
                onChange={(e) => setReportForm({
                  ...reportForm,
                  scope: {
                    ...reportForm.scope,
                    timeRange: {
                      ...reportForm.scope.timeRange,
                      endDate: e.target.value
                    }
                  }
                })}
                InputLabelProps={{ shrink: true }}
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

            {/* Filters */}
            <div className="border-t pt-4">
              <Typography variant="subtitle2" sx={{ mb: 2, color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                Filters (Optional)
              </Typography>
              <div className="grid grid-cols-2 gap-4">
                <TextField
                  fullWidth
                  label="Điểm tối thiểu"
                  type="number"
                  value={reportForm.filters.minScore || ''}
                  onChange={(e) => setReportForm({
                    ...reportForm,
                    filters: {
                      ...reportForm.filters,
                      minScore: e.target.value ? parseFloat(e.target.value) : undefined
                    }
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
                <TextField
                  fullWidth
                  label="Điểm danh tối thiểu (%)"
                  type="number"
                  value={reportForm.filters.minAttendance || ''}
                  onChange={(e) => setReportForm({
                    ...reportForm,
                    filters: {
                      ...reportForm.filters,
                      minAttendance: e.target.value ? parseFloat(e.target.value) : undefined
                    }
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
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <MuiButton
            onClick={() => setIsCreateDialogOpen(false)}
            disabled={creatingReport}
            sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}
          >
            Hủy
          </MuiButton>
          <MuiButton
            onClick={handleCreateReport}
            variant="contained"
            disabled={creatingReport}
            sx={{
              backgroundColor: '#3b82f6',
              '&:hover': {
                backgroundColor: '#2563eb'
              }
            }}
          >
            {creatingReport ? 'Đang tạo...' : 'Tạo báo cáo'}
          </MuiButton>
        </DialogActions>
      </Dialog>

      {/* View Report Dialog */}
      <Dialog
        open={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            color: theme === 'dark' ? '#ffffff' : '#111827',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle>
          <div className="flex items-center justify-between">
            <Typography variant="h6" sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
              {selectedReport?.title || 'Progress Report'}
            </Typography>
            <div className="flex items-center space-x-2">
              <MuiButton
                size="small"
                startIcon={<JsonIcon />}
                onClick={() => selectedReport && handleExportReport(selectedReport.id, 'json')}
                disabled={exportLoading === selectedReport?.id}
                sx={{
                  color: theme === 'dark' ? '#ffffff' : '#111827',
                  '&:hover': {
                    backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6'
                  }
                }}
              >
                JSON
              </MuiButton>
              <MuiButton
                size="small"
                startIcon={<CsvIcon />}
                onClick={() => selectedReport && handleExportReport(selectedReport.id, 'csv')}
                disabled={exportLoading === selectedReport?.id}
                sx={{
                  color: theme === 'dark' ? '#ffffff' : '#111827',
                  '&:hover': {
                    backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6'
                  }
                }}
              >
                CSV
              </MuiButton>
              <MuiButton
                size="small"
                startIcon={<PdfIcon />}
                onClick={() => selectedReport && handleExportReport(selectedReport.id, 'pdf')}
                disabled={exportLoading === selectedReport?.id}
                sx={{
                  color: theme === 'dark' ? '#ffffff' : '#111827',
                  '&:hover': {
                    backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6'
                  }
                }}
              >
                PDF
              </MuiButton>
            </div>
          </div>
        </DialogTitle>
        <DialogContent>
          {selectedReport && (
            <div className="space-y-6">
              {/* Summary */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <Typography variant="h6" sx={{ mb: 2, color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                  Tổng Quan
                </Typography>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Tổng số học sinh
                    </p>
                    <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedReport.data.summary.totalStudents}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Tổng số gia sư
                    </p>
                    <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedReport.data.summary.totalTutors}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Tổng số buổi học
                    </p>
                    <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedReport.data.summary.totalSessions}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Điểm danh trung bình
                    </p>
                    <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedReport.data.summary.averageAttendanceRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Students */}
              {selectedReport.data.students && selectedReport.data.students.length > 0 && (
                <div>
                  <Typography variant="h6" sx={{ mb: 2, color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                    Học Sinh ({selectedReport.data.students.length})
                  </Typography>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {selectedReport.data.students.map((student) => (
                      <Card
                        key={student.studentId}
                        className={`p-4 border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                        style={{
                          borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                          backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                          boxShadow: 'none !important'
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                              {student.studentName}
                            </Typography>
                            <Typography variant="body2" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                              ID: {student.studentId}
                            </Typography>
                          </div>
                          <div className="text-right">
                            <Chip
                              label={`${student.attendanceRate.toFixed(1)}% điểm danh`}
                              size="small"
                              color={student.attendanceRate >= 80 ? 'success' : student.attendanceRate >= 60 ? 'warning' : 'error'}
                              sx={{ mb: 1 }}
                            />
                            <Typography variant="body2" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                              Điểm TB: {student.averageScore.toFixed(2)}
                            </Typography>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-2">
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              Buổi học đã hoàn thành
                            </p>
                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {student.sessionsCompleted} / {student.sessionsTotal}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              Môn học
                            </p>
                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {student.subjects.length}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              Điểm danh
                            </p>
                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {student.attendanceRate.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        {student.subjects.length > 0 && (
                          <div className="mt-3">
                            <Typography variant="body2" sx={{ mb: 1, color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                              Môn học:
                            </Typography>
                            <div className="flex flex-wrap gap-2">
                              {student.subjects.map((subject, idx) => (
                                <Chip
                                  key={idx}
                                  label={`${subject.subject} (${subject.averageScore.toFixed(1)})`}
                                  size="small"
                                  sx={{
                                    backgroundColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                                    color: theme === 'dark' ? '#ffffff' : '#111827'
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Tutors */}
              {selectedReport.data.tutors && selectedReport.data.tutors.length > 0 && (
                <div>
                  <Typography variant="h6" sx={{ mb: 2, color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                    Gia Sư ({selectedReport.data.tutors.length})
                  </Typography>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {selectedReport.data.tutors.map((tutor) => (
                      <Card
                        key={tutor.tutorId}
                        className={`p-4 border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                        style={{
                          borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                          backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                          boxShadow: 'none !important'
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                              {tutor.tutorName}
                            </Typography>
                            <Typography variant="body2" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                              ID: {tutor.tutorId}
                            </Typography>
                          </div>
                          <div className="text-right">
                            <Chip
                              label={`⭐ ${tutor.averageRating.toFixed(1)}`}
                              size="small"
                              color="primary"
                              sx={{ mb: 1 }}
                            />
                            <Typography variant="body2" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                              {tutor.studentsCount} học sinh
                            </Typography>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-2">
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              Buổi học đã hoàn thành
                            </p>
                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {tutor.sessionsCompleted} / {tutor.sessionsTotal}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              Điểm danh
                            </p>
                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {tutor.attendanceRate.toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              Môn học
                            </p>
                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {tutor.subjects.length}
                            </p>
                          </div>
                        </div>
                        {tutor.subjects.length > 0 && (
                          <div className="mt-3">
                            <Typography variant="body2" sx={{ mb: 1, color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                              Môn học:
                            </Typography>
                            <div className="flex flex-wrap gap-2">
                              {tutor.subjects.map((subject, idx) => (
                                <Chip
                                  key={idx}
                                  label={subject}
                                  size="small"
                                  sx={{
                                    backgroundColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                                    color: theme === 'dark' ? '#ffffff' : '#111827'
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        {tutor.performanceMetrics && (
                          <div className="mt-3">
                            <Typography variant="body2" sx={{ mb: 1, color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                              Đánh giá hiệu suất:
                            </Typography>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Giao tiếp: {tutor.performanceMetrics.communication.toFixed(1)}
                                </p>
                              </div>
                              <div>
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Kiến thức: {tutor.performanceMetrics.knowledge.toFixed(1)}
                                </p>
                              </div>
                              <div>
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Hữu ích: {tutor.performanceMetrics.helpfulness.toFixed(1)}
                                </p>
                              </div>
                              <div>
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Đúng giờ: {tutor.performanceMetrics.punctuality.toFixed(1)}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <MuiButton
            onClick={() => setIsViewDialogOpen(false)}
            sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}
          >
            Đóng
          </MuiButton>
        </DialogActions>
      </Dialog>

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

              {/* Mobile Analytics Overview */}
              <div className="mb-8">
                <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  ANALYTICS OVERVIEW
                </h3>
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Total Users:</span>
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {analyticsData.overview.totalUsers.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Active Users:</span>
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {analyticsData.overview.activeUsers.toLocaleString()}
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
                  <AssignmentIcon className="mr-3 w-4 h-4" />
                  Approval Requests
                </button>
                <button 
                  onClick={() => {
                    navigate('/management/awards')
                    setMobileOpen(false)
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Star className="mr-3 w-4 h-4" />
                  Award Credits
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
    </div>
  )
}

export default ReportsAnalytics
