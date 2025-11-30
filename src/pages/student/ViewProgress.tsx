import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { 
  TrendingUp, 
  School, 
  Schedule, 
  Assignment,
  Menu as MenuIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  BarChart as BarChartIcon,
  Warning as WarningIcon,
  CalendarToday as CalendarTodayIcon,
  EmojiEvents as EmojiEventsIcon,
  Flag as FlagIcon,
  Notifications as NotificationsIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Language as LanguageIcon
} from '@mui/icons-material'
import { 
  Box,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  Divider,
  IconButton,
  Avatar,
  Badge,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  MenuItem
} from '@mui/material'
import { progressAPI, usersAPI } from '../../lib/api'

interface SubjectProgress {
  subject: string
  averageScore: number
  totalRecords: number
  topics: string[]
  improvements: string[]
  challenges: string[]
  progressRecords: any[]
  targetScore: number
}

const achievements = [
  { id: 1, title: 'Top 10%', icon: <EmojiEventsIcon />, color: '#ca8a04', bg: '#fefce8' },
  { id: 2, title: '7 Day Streak', icon: <TrendingUp />, color: '#059669', bg: '#ecfdf5' },
  { id: 3, title: 'Math Wizard', icon: <School />, color: '#2563eb', bg: '#eff6ff' },
]

const ViewProgress: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [currentLang, setCurrentLang] = useState(i18n.language)
  
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang)
    setCurrentLang(lang)
  }
  
  const [loading, setLoading] = useState(true)
  const [progressRecords, setProgressRecords] = useState<any[]>([])
  const [tutorsMap, setTutorsMap] = useState<Record<string, any>>({})
  const [subjectsProgress, setSubjectsProgress] = useState<SubjectProgress[]>([])
  const [timeRange, setTimeRange] = useState('3months')
  const [mobileOpen, setMobileOpen] = useState(false)

  const [openGoalDialog, setOpenGoalDialog] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState('')
  const [targetInput, setTargetInput] = useState<number | string>(90)

  const loadData = async () => {
    try {
      setLoading(true)

      const userStr = localStorage.getItem('user')
      if (!userStr) {
        navigate('/login')
        return
      }
      const userData = JSON.parse(userStr)

      const progressResponse = await progressAPI.list({ studentId: userData.id, limit: 1000 })
      
      console.log('Progress response:', progressResponse) 

      if (progressResponse.data && Array.isArray(progressResponse.data)) {
        const records = progressResponse.data
        setProgressRecords(records)

        const tutorIds = [...new Set(records.map((p: any) => p.tutorId))] as string[]
        
        const tutorsData: Record<string, any> = {}
        await Promise.all(
          tutorIds.map(async (tutorId) => {
            try {
              const response = await usersAPI.get(tutorId)
              const tutorData = response.success ? response.data : response
              if (tutorData) {
                tutorsData[tutorId] = tutorData
              }
            } catch (err) {
              console.error(`Error loading tutor ${tutorId}:`, err)
            }
          })
        )

        setTutorsMap(tutorsData)

        const subjectMap = new Map<string, SubjectProgress>()

        records.forEach((progress: any) => {
          if (!subjectMap.has(progress.subject)) {
            subjectMap.set(progress.subject, {
              subject: progress.subject,
              averageScore: 0,
              totalRecords: 0,
              topics: [],
              improvements: [],
              challenges: [],
              progressRecords: [],
              targetScore: 90
            })
          }

          const subjectProgress = subjectMap.get(progress.subject)!
          subjectProgress.progressRecords.push(progress)
          
          if (progress.topic && !subjectProgress.topics.includes(progress.topic)) {
            subjectProgress.topics.push(progress.topic)
          }

          if (progress.improvements) {
            progress.improvements.forEach((imp: string) => {
              if (!subjectProgress.improvements.includes(imp)) {
                subjectProgress.improvements.push(imp)
              }
            })
          }
          if (progress.challenges) {
            progress.challenges.forEach((chal: string) => {
              if (!subjectProgress.challenges.includes(chal)) {
                subjectProgress.challenges.push(chal)
              }
            })
          }
        })

        subjectMap.forEach((subjectProgress) => {
          const scores = subjectProgress.progressRecords.map((p: any) => p.score || 0)
          const averageScore = scores.length > 0 
            ? scores.reduce((a, b) => a + b, 0) / scores.length
            : 0
          subjectProgress.averageScore = Math.round(averageScore * 10) 
          subjectProgress.totalRecords = subjectProgress.progressRecords.length
        })

        setSubjectsProgress(Array.from(subjectMap.values()))
      }
    } catch (err: any) {
      console.error('Error loading progress:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [navigate])

  // Sync currentLang with i18n.language
  useEffect(() => {
    setCurrentLang(i18n.language)
  }, [i18n.language])

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleOpenGoalDialog = () => {
    if (subjectsProgress.length > 0) {
      setSelectedSubject(subjectsProgress[0].subject)
      setTargetInput(subjectsProgress[0].targetScore)
    }
    setOpenGoalDialog(true)
  }

  const handleCloseGoalDialog = () => {
    setOpenGoalDialog(false)
  }

  const handleSubjectChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const subjName = event.target.value
    setSelectedSubject(subjName)
    const subj = subjectsProgress.find(s => s.subject === subjName)
    if (subj) {
      setTargetInput(subj.targetScore)
    }
  }

  const handleSaveGoal = () => {
    const newTarget = Number(targetInput)
    if (newTarget > 0 && newTarget <= 100) {
      setSubjectsProgress(prev => prev.map(subj => 
        subj.subject === selectedSubject 
          ? { ...subj, targetScore: newTarget } 
          : subj
      ))
      setOpenGoalDialog(false)
    }
  }

  const overallProgress = subjectsProgress.length > 0
    ? Math.round(subjectsProgress.reduce((sum, s) => sum + s.averageScore, 0) / subjectsProgress.length)
    : 0

  const totalSessions = subjectsProgress.reduce((sum, s) => sum + s.totalRecords, 0)

  const stats = [
    { title: t('viewProgress.stats.totalSessions'), value: totalSessions.toString(), icon: <Schedule />, color: 'primary' },
    { title: t('viewProgress.stats.subjectsStudied'), value: subjectsProgress.length.toString(), icon: <School />, color: 'success' },
    { title: t('viewProgress.stats.overallProgress'), value: `${overallProgress}%`, icon: <TrendingUp />, color: 'info' },
    { title: t('viewProgress.stats.progressRecords'), value: progressRecords.length.toString(), icon: <Assignment />, color: 'secondary' },
  ]

  if (loading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('viewProgress.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex flex-col lg:flex-row">
        <div className={`w-full lg:w-60 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-r ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} lg:block`}>
          <div className="p-6">
            <div 
              className="flex items-center mb-8 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/student')}
            >
              <div className="w-10 h-10 flex items-center justify-center mr-3">
                <img src="/HCMCUT.png" alt="HCMUT Logo" className="w-10 h-10" />
              </div>
              <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                HCMUT
              </span>
            </div>

            <div className="mb-8">
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('viewProgress.progressOverview')}
              </h3>
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="text-center mb-3">
                  <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {overallProgress}%
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('viewProgress.overallProgress')}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${overallProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div>
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('viewProgress.quickActions')}
              </h3>
              <div className="space-y-2">
                <button 
                  onClick={() => navigate('/student')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors`}
                >
                  <ArrowBackIcon className="mr-3 w-4 h-4" />
                  {t('viewProgress.backToDashboard')}
                </button>
                <button 
                  onClick={() => changeLanguage(currentLang === 'vi' ? 'en' : 'vi')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <LanguageIcon className="mr-3 w-4 h-4" />
                  {currentLang === 'vi' ? 'English' : 'Tiếng Việt'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 lg:p-8 max-w-[1600px] mx-auto">
          
          <div className="flex justify-between items-center mb-6">
            <div className="lg:hidden">
              <button
                onClick={handleDrawerToggle}
                className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <MenuIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="hidden lg:block"></div>
            
            <div className="flex items-center gap-3">
              <IconButton>
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }} />
                </Badge>
              </IconButton>
            </div>
          </div>

          <Paper 
            elevation={0}
            sx={{ 
              mb: 4, 
              p: 4, 
              backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
              border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
              borderRadius: '12px'
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Box>
                <Typography variant="h4" fontWeight="bold" sx={{ color: theme === 'dark' ? '#ffffff' : '#111827', mb: 1 }}>
                  {t('viewProgress.learningProgressReport')}
                </Typography>
                <Typography variant="body1" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                  {t('viewProgress.subtitle')}
                </Typography>
              </Box>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className={`px-4 py-2.5 border rounded-lg font-medium ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="1month">{t('viewProgress.timeRange.lastMonth')}</option>
                  <option value="3months">{t('viewProgress.timeRange.last3Months')}</option>
                  <option value="6months">{t('viewProgress.timeRange.last6Months')}</option>
                  <option value="1year">{t('viewProgress.timeRange.lastYear')}</option>
              </select>
            </Box>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {stats.map((stat, index) => (
                <Box 
                  key={index}
                  sx={{ 
                    p: 2.5,
                    backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}
                >
                  <Box sx={{ color: '#3b82f6', fontSize: '2rem', mb: 1 }}>
                    {stat.icon}
                  </Box>
                  <Typography variant="h5" fontWeight="bold" sx={{ color: theme === 'dark' ? '#ffffff' : '#111827', mb: 0.5 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280', fontSize: '0.75rem' }}>
                    {stat.title}
                  </Typography>
                </Box>
              ))}
            </div>
          </Paper>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <Paper 
                elevation={0}
                sx={{ 
                  p: 4, 
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                  border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '12px',
                  height: '100%'
                }}
              >
                <Box mb={4}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                    <Typography variant="h6" fontWeight="600" sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                      {t('viewProgress.overallPerformance')}
                    </Typography>
                    <Chip 
                      label={`${overallProgress}%`} 
                      sx={{ 
                        backgroundColor: '#3b82f6', 
                        color: '#ffffff',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        height: '36px'
                      }} 
                    />
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={overallProgress} 
                    sx={{ 
                      height: 12, 
                      borderRadius: 6,
                      backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#3b82f6',
                        borderRadius: 6
                      }
                    }} 
                  />
                  <Typography variant="caption" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280', mt: 1, display: 'block' }}>
                    {t('viewProgress.averageAcrossSubjects')}
                  </Typography>
                </Box>

                <Divider sx={{ my: 3, borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }} />

                <Box mb={4}>
                  <Typography variant="h6" fontWeight="600" sx={{ color: theme === 'dark' ? '#ffffff' : '#111827', mb: 3 }}>
                    {t('viewProgress.subjectPerformance')}
                  </Typography>
                  {subjectsProgress.length === 0 ? (
                    <Box 
                      sx={{ 
                        textAlign: 'center', 
                        py: 6,
                        backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                        borderRadius: '8px'
                      }}
                    >
                      <School sx={{ fontSize: 48, color: theme === 'dark' ? '#6b7280' : '#9ca3af', mb: 2 }} />
                      <Typography sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                        {t('viewProgress.noProgressRecords')}
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {subjectsProgress.map((subject, index) => (
                        <Box 
                          key={index}
                          sx={{ 
                            p: 3,
                            backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                            borderRadius: '8px',
                            border: `1px solid ${theme === 'dark' ? '#4b5563' : '#e5e7eb'}`
                          }}
                        >
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="subtitle1" fontWeight="600" sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                              {subject.subject}
                            </Typography>
                            <Chip 
                              label={`${subject.averageScore}%`} 
                              size="small"
                              sx={{ 
                                backgroundColor: subject.averageScore >= 80 ? '#10b981' : subject.averageScore >= 60 ? '#f59e0b' : '#ef4444',
                                color: '#ffffff',
                                fontWeight: 'bold'
                              }} 
                            />
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={subject.averageScore} 
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              mb: 2,
                              backgroundColor: theme === 'dark' ? '#1f2937' : '#e5e7eb',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: subject.averageScore >= 80 ? '#10b981' : subject.averageScore >= 60 ? '#f59e0b' : '#ef4444',
                                borderRadius: 4
                              }
                            }} 
                          />
                          <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={2}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Assignment sx={{ fontSize: 16, color: theme === 'dark' ? '#9ca3af' : '#6b7280' }} />
                              <Typography variant="caption" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                                {subject.totalRecords} {t('viewProgress.sessions')}
                              </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={1}>
                              <School sx={{ fontSize: 16, color: theme === 'dark' ? '#9ca3af' : '#6b7280' }} />
                              <Typography variant="caption" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                                {subject.topics.length} {t('viewProgress.topicsCovered')}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>

                <Divider sx={{ my: 3, borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }} />

                <Box>
                  <Typography variant="h6" fontWeight="600" sx={{ color: theme === 'dark' ? '#ffffff' : '#111827', mb: 3 }}>
                    {t('viewProgress.recentSessions')}
                  </Typography>
                  {progressRecords.length === 0 ? (
                    <Box 
                      sx={{ 
                        textAlign: 'center', 
                        py: 6,
                        backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                        borderRadius: '8px'
                      }}
                    >
                      <CalendarTodayIcon sx={{ fontSize: 48, color: theme === 'dark' ? '#6b7280' : '#9ca3af', mb: 2 }} />
                      <Typography sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                        {t('viewProgress.noSessionsCompleted')}
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {progressRecords.slice(0, 5).map((record, index) => {
                        const tutor = tutorsMap[record.tutorId]
                        const tutorName = tutor?.name || 'Unknown Tutor'
                        const scorePercentage = Math.round(record.score * 10)
                        const recordDate = new Date(record.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })
                        
                        return (
                          <Box 
                            key={index}
                            sx={{ 
                              p: 2.5,
                              backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                              borderRadius: '8px',
                              border: `1px solid ${theme === 'dark' ? '#4b5563' : '#e5e7eb'}`,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: 2
                            }}
                          >
                            <Box flex={1} minWidth="200px">
                              <Typography variant="subtitle2" fontWeight="600" sx={{ color: theme === 'dark' ? '#ffffff' : '#111827', mb: 0.5 }}>
                                {record.subject} - {record.topic}
                              </Typography>
                              <Typography variant="caption" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280', display: 'block' }}>
                                {tutorName} • {recordDate}
                              </Typography>
                              {record.notes && (
                                <Typography variant="caption" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280', display: 'block', mt: 1, fontStyle: 'italic' }}>
                                  "{record.notes}"
                                </Typography>
                              )}
                            </Box>
                            <Chip 
                              label={`${scorePercentage}%`} 
                              sx={{ 
                                backgroundColor: scorePercentage >= 80 ? '#10b981' : scorePercentage >= 60 ? '#f59e0b' : '#ef4444',
                                color: '#ffffff',
                                fontWeight: 'bold',
                                minWidth: '60px'
                              }} 
                            />
                          </Box>
                        )
                      })}
                    </Box>
                  )}
                </Box>
              </Paper>
            </div>

            <div className="lg:col-span-4">
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', 
                    border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '12px' 
                  }} 
                >
                  <Box display="flex" alignItems="center" gap={1} mb={3}>
                    <FlagIcon sx={{ color: '#ef4444' }} />
                    <Typography variant="h6" fontWeight="700" sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>{t('viewProgress.myGoals')}</Typography>
                  </Box>
                  {subjectsProgress.slice(0, 3).map((subj, i) => (
                    <Box key={i} mb={3}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{subj.subject}</span>
                        <span className="text-gray-500 font-medium">{subj.averageScore} / <span className="text-blue-600">{subj.targetScore}</span></span>
                      </div>
                      <LinearProgress 
                        variant="determinate" 
                        value={(subj.averageScore / (subj.targetScore || 100)) * 100} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3, 
                          bgcolor: theme === 'dark' ? '#374151' : '#f1f5f9', 
                          '& .MuiLinearProgress-bar': { bgcolor: '#ef4444' } 
                        }} 
                      />
                    </Box>
                  ))}
                  <Button 
                    variant="text" 
                    size="small" 
                    fullWidth
                    onClick={handleOpenGoalDialog}
                  >
                    {t('viewProgress.setNewGoals')}
                  </Button>
                </Paper>

                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', 
                    border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '12px' 
                  }} 
                >
                  <Box display="flex" alignItems="center" gap={1} mb={3}>
                    <EmojiEventsIcon sx={{ color: '#f59e0b' }} />
                    <Typography variant="h6" fontWeight="700" sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>{t('viewProgress.achievements')}</Typography>
                  </Box>
                  <div className="grid grid-cols-3 gap-2">
                    {achievements.map((badge) => (
                      <div 
                        key={badge.id} 
                        className="flex flex-col items-center p-2 rounded-lg text-center transition-transform hover:scale-105 cursor-pointer" 
                        style={{ backgroundColor: theme === 'dark' ? '#374151' : badge.bg }}
                      >
                        <div style={{ color: badge.color }} className="mb-1">{badge.icon}</div>
                        <span className={`text-[10px] font-bold leading-tight ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {badge.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </Paper>

                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '12px'
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
                    <CheckCircleIcon sx={{ color: '#10b981', fontSize: 24 }} />
                    <Typography variant="h6" fontWeight="600" sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                      {t('viewProgress.improvements')}
                    </Typography>
                  </Box>
                  {progressRecords.length === 0 || progressRecords.filter(r => r.improvements && r.improvements.length > 0).length === 0 ? (
                    <Typography variant="body2" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280', textAlign: 'center', py: 4 }}>
                      {t('viewProgress.noImprovements')}
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {progressRecords
                        .filter(r => r.improvements && r.improvements.length > 0)
                        .slice(0, 5)
                        .flatMap(r => r.improvements.map((imp: string) => ({ text: imp, subject: r.subject })))
                        .slice(0, 6)
                        .map((item: any, index: number) => (
                          <Box 
                            key={index}
                            sx={{ 
                              p: 2,
                              backgroundColor: theme === 'dark' ? '#374151' : '#f0fdf4',
                              borderRadius: '6px',
                              border: `1px solid ${theme === 'dark' ? '#4b5563' : '#bbf7d0'}`
                            }}
                          >
                            <Typography variant="caption" fontWeight="600" sx={{ color: theme === 'dark' ? '#10b981' : '#059669', display: 'block', mb: 0.5 }}>
                              {item.subject}
                            </Typography>
                            <Typography variant="body2" sx={{ color: theme === 'dark' ? '#e5e7eb' : '#111827' }}>
                              {item.text}
                            </Typography>
                          </Box>
                        ))}
                    </Box>
                  )}
                </Paper>

                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '12px'
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
                    <WarningIcon sx={{ color: '#f59e0b', fontSize: 24 }} />
                    <Typography variant="h6" fontWeight="600" sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                      {t('viewProgress.areasToFocus')}
                    </Typography>
                  </Box>
                  {progressRecords.length === 0 || progressRecords.filter(r => r.challenges && r.challenges.length > 0).length === 0 ? (
                    <Typography variant="body2" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280', textAlign: 'center', py: 4 }}>
                      {t('viewProgress.noChallenges')}
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {progressRecords
                        .filter(r => r.challenges && r.challenges.length > 0)
                        .slice(0, 5)
                        .flatMap(r => r.challenges.map((chal: string) => ({ text: chal, subject: r.subject })))
                        .slice(0, 6)
                        .map((item: any, index: number) => (
                          <Box 
                            key={index}
                            sx={{ 
                              p: 2,
                              backgroundColor: theme === 'dark' ? '#374151' : '#fffbeb',
                              borderRadius: '6px',
                              border: `1px solid ${theme === 'dark' ? '#4b5563' : '#fde68a'}`
                            }}
                          >
                            <Typography variant="caption" fontWeight="600" sx={{ color: theme === 'dark' ? '#f59e0b' : '#d97706', display: 'block', mb: 0.5 }}>
                              {item.subject}
                            </Typography>
                            <Typography variant="body2" sx={{ color: theme === 'dark' ? '#e5e7eb' : '#111827' }}>
                              {item.text}
                            </Typography>
                          </Box>
                        ))}
                    </Box>
                  )}
                </Paper>
              </Box>
            </div>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleDrawerToggle}></div>
          <div className={`fixed left-0 top-0 h-full w-80 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
            <div className="p-6">
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
                  <CloseIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-8">
                  <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('viewProgress.progressOverview')}
                </h3>
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="text-center mb-3">
                    <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {overallProgress}%
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('viewProgress.overallProgress')}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${overallProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <button 
                  onClick={() => {
                    navigate('/student/book')
                    setMobileOpen(false)
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <CheckCircleIcon className="mr-3 w-4 h-4" />
                  {t('viewProgress.bookSession')}
                </button>
                <button 
                  onClick={() => {
                    navigate('/student/search')
                    setMobileOpen(false)
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <BarChartIcon className="mr-3 w-4 h-4" />
                  {t('viewProgress.findTutors')}
                </button>
                <button 
                  onClick={() => {
                    navigate('/student')
                    setMobileOpen(false)
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <ArrowBackIcon className="mr-3 w-4 h-4" />
                  {t('viewProgress.backToDashboard')}
                </button>
                <button 
                  onClick={() => {
                    changeLanguage(currentLang === 'vi' ? 'en' : 'vi')
                    setMobileOpen(false)
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <LanguageIcon className="mr-3 w-4 h-4" />
                  {currentLang === 'vi' ? 'English' : 'Tiếng Việt'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog open={openGoalDialog} onClose={handleCloseGoalDialog}>
        <DialogTitle>{t('viewProgress.setLearningGoal')}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {t('viewProgress.setGoalDescription')}
          </DialogContentText>
          <TextField
            select
            label={t('viewProgress.subject')}
            fullWidth
            value={selectedSubject}
            onChange={handleSubjectChange}
            sx={{ mb: 2 }}
          >
            {subjectsProgress.map((subj) => (
              <MenuItem key={subj.subject} value={subj.subject}>
                {subj.subject}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label={t('viewProgress.targetScore')}
            type="number"
            fullWidth
            value={targetInput}
            onChange={(e) => setTargetInput(e.target.value)}
            InputProps={{ inputProps: { min: 0, max: 100 } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseGoalDialog}>{t('viewProgress.cancel')}</Button>
          <Button onClick={handleSaveGoal} variant="contained">{t('viewProgress.saveGoal')}</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default ViewProgress