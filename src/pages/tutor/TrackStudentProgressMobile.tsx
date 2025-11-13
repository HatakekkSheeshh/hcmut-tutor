import React, { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { 
  Search, 
  Schedule,
  Star,
  Assignment,
  Quiz,
  Menu as MenuIcon,
  ArrowBack as ArrowBackIcon,
  BarChart as BarChartIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Close as CloseIcon,
  ArrowForward as ArrowForwardIcon,
  Dashboard as DashboardIcon,
  Autorenew as AutorenewIcon,
  Chat as ChatIcon,
  AddCircle as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioIcon,
  Person
} from '@mui/icons-material'
import { Avatar } from '@mui/material'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { progressAPI, usersAPI, assignmentsAPI, quizzesAPI } from '../../lib/api'

interface StudentProgress {
  studentId: string
  studentName: string
  progressRecords: any[]
  sessions: any[]
  averageScore: number
  totalSessions: number
  subjects: string[]
}

const Modal = ({ isOpen, onClose, title, children }: any) => {
  const { theme } = useTheme()
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
      <div className={`relative w-full max-w-lg rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto ${
        theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        <div className={`flex items-center justify-between p-5 border-b sticky top-0 z-10 ${
          theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'
        }`}>
          <h3 className="text-xl font-bold">{title}</h3>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${
            theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
          }`}>
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

const AssignHomeworkModal = ({ isOpen, onClose, student, currentUser }: any) => {
  const { theme } = useTheme()
  const [formData, setFormData] = useState({
    sessionId: '',
    title: '',
    description: '',
    instructions: '',
    dueDate: '',
    points: ''
  })

  useEffect(() => {
    if (student && student.progressRecords.length > 0) {
      setFormData(prev => ({...prev, sessionId: student.progressRecords[0].sessionId}))
    }
  }, [student])

  const inputClass = `w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 shadow-sm ${
    theme === 'dark' 
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  }`

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await assignmentsAPI.create(formData.sessionId, {
        title: formData.title,
        description: formData.description,
        instructions: formData.instructions,
        totalPoints: Number(formData.points),
        dueDate: new Date(formData.dueDate).toISOString(),
        attachments: [{ fileName: "mobile_upload.pdf", fileSize: 102400 }]
      })
      onClose()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={student ? `Assign to ${student.studentName}` : "Assign Homework"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold mb-1">Title <span className="text-red-500">*</span></label>
          <input required type="text" className={inputClass} placeholder="e.g. Homework 4" onChange={e => setFormData({...formData, title: e.target.value})} />
        </div>

        {/* Date & Points */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Due Date</label>
            <input required type="date" className={inputClass} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Points</label>
            <input required type="number" className={inputClass} placeholder="100" onChange={e => setFormData({...formData, points: e.target.value})} />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold mb-1">Description</label>
          <textarea className={inputClass} rows={2} placeholder="Description..." onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
        </div>

        {/* Attachments */}
        <div>
          <label className="block text-sm font-semibold mb-1">Attachments</label>
          <div className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
            theme === 'dark' 
              ? 'border-gray-600 hover:border-gray-500 bg-gray-800 text-gray-400' 
              : 'border-gray-300 hover:border-blue-400 bg-gray-50 text-gray-500'
          }`}>
            <UploadIcon className="mx-auto h-8 w-8 mb-1" />
            <p className="text-xs">Click to upload PDF, DOCX</p>
          </div>
        </div>

        {/* Buttons */}
        <div className={`flex justify-end pt-4 gap-3 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
          <Button type="button" variant="outlined" onClick={onClose} style={{ borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db', color: theme === 'dark' ? 'white' : 'black' }}>Cancel</Button>
          <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700 shadow-lg">Assign</Button>
        </div>
      </form>
    </Modal>
  )
}

const CreateQuizModal = ({ isOpen, onClose, currentUser, student }: any) => {
  const { theme } = useTheme()
  const [quizMeta, setQuizMeta] = useState({ title: '', description: '', duration: '' })
  const [questions, setQuestions] = useState<any[]>([])
  
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    type: 'multiple_choice',
    points: 10,
    options: ['', '', '', ''], 
    correctAnswerIndex: 0
  })

  const inputClass = `w-full p-2 border rounded-md ${
    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  }`

  const totalPoints = questions.reduce((sum, q) => sum + Number(q.points), 0)

  const handleAddQuestion = () => {
    if (!newQuestion.text) return;
    if (newQuestion.type === 'multiple_choice' && newQuestion.options.some(opt => !opt.trim())) {
      alert("Please fill all 4 options.")
      return;
    }

    setQuestions([...questions, { ...newQuestion, id: Date.now() }])
    setNewQuestion({ 
      text: '', 
      type: newQuestion.type, 
      points: 10, 
      options: ['', '', '', ''], 
      correctAnswerIndex: 0 
    }) 
  }

  const handleRemoveQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id))
  }

  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...newQuestion.options]
    updatedOptions[index] = value
    setNewQuestion({ ...newQuestion, options: updatedOptions })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const targetSessionId = student?.progressRecords?.[0]?.sessionId || "ses_demo_mobile"

    try {
      await quizzesAPI.create(targetSessionId, {
        title: quizMeta.title,
        description: quizMeta.description,
        questions: questions,
        duration: Number(quizMeta.duration),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      onClose()
    } catch (error) {
        console.error("Error creating quiz:", error)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Quiz">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 1. Quiz Info */}
        <div className={`space-y-3 p-4 rounded-lg border shadow-sm ${theme === 'dark' ? 'bg-gray-700/50 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
          <h4 className={`text-sm font-bold uppercase ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>1. Quiz Info</h4>
          
          <div>
            <input required type="text" className={inputClass} placeholder="Quiz Title" value={quizMeta.title} onChange={e => setQuizMeta({...quizMeta, title: e.target.value})} />
          </div>
          <div className="flex gap-3">
            <input required type="number" className={`${inputClass} w-1/2`} placeholder="Mins" value={quizMeta.duration} onChange={e => setQuizMeta({...quizMeta, duration: e.target.value})} />
            <input type="text" className={`w-1/2 p-2 border rounded-md cursor-not-allowed ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-500'}`} value={`Total: ${totalPoints}`} disabled />
          </div>
        </div>

        {/* 2. Add Questions */}
        <div className="space-y-3">
          <h4 className={`text-sm font-bold uppercase ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>2. Add Questions</h4>
          
          <div className={`space-y-3 p-4 border border-dashed rounded-lg ${theme === 'dark' ? 'border-gray-600 bg-gray-800/30' : 'border-gray-300 bg-gray-50/50'}`}>
            <div className="flex flex-col gap-3">
              <input type="text" className={`${inputClass} font-medium`} 
                placeholder="Enter question text..." 
                value={newQuestion.text} onChange={e => setNewQuestion({...newQuestion, text: e.target.value})}
              />
              <div className="flex gap-2">
                <select className={`${inputClass} flex-1`} value={newQuestion.type} onChange={e => setNewQuestion({...newQuestion, type: e.target.value})}>
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="true_false">True / False</option>
                  <option value="short_answer">Short Answer</option>
                </select>
                <input type="number" className={`${inputClass} flex-1 text-center`} placeholder="Pts" value={newQuestion.points} onChange={e => setNewQuestion({...newQuestion, points: Number(e.target.value)})} />
              </div>
            </div>
            
            {/* Dynamic Answer Inputs */}
            <div className={`pl-2 border-l-2 ml-1 mt-2 ${theme === 'dark' ? 'border-blue-800' : 'border-blue-200'}`}>
              {newQuestion.type === 'multiple_choice' && (
                <div className="grid grid-cols-1 gap-2">
                  <p className="text-xs text-gray-500 mb-1">Enter 4 options & select correct:</p>
                  {newQuestion.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <button type="button" onClick={() => setNewQuestion({...newQuestion, correctAnswerIndex: idx})} className={`p-1 rounded-full ${newQuestion.correctAnswerIndex === idx ? 'text-green-600' : 'text-gray-400'}`}>
                        {newQuestion.correctAnswerIndex === idx ? <CheckCircleIcon fontSize="small"/> : <RadioIcon fontSize="small"/>}
                      </button>
                      <input type="text" className={`${inputClass} py-1.5 text-sm`} placeholder={`Option ${String.fromCharCode(65 + idx)}`} value={opt} onChange={(e) => handleOptionChange(idx, e.target.value)} />
                    </div>
                  ))}
                </div>
              )}

              {newQuestion.type === 'true_false' && (
                <div className="flex gap-3 items-center pt-1">
                  <span className="text-xs text-gray-500">Correct:</span>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setNewQuestion({...newQuestion, correctAnswerIndex: 0})} className={`px-3 py-1 text-xs rounded border ${newQuestion.correctAnswerIndex === 0 ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-300'}`}>True</button>
                    <button type="button" onClick={() => setNewQuestion({...newQuestion, correctAnswerIndex: 1})} className={`px-3 py-1 text-xs rounded border ${newQuestion.correctAnswerIndex === 1 ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700 border-gray-300'}`}>False</button>
                  </div>
                </div>
              )}

              {newQuestion.type === 'short_answer' && (
                <p className={`text-xs italic p-1.5 rounded ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Student will type answer...</p>
              )}
            </div>

            <button type="button" onClick={handleAddQuestion} className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-all ${theme === 'dark' ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-600'}`}>
              <AddIcon fontSize="small" /> Add Question
            </button>
          </div>
          
          {/* Preview List */}
          <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
            {questions.map((q, idx) => (
              <div key={q.id} className={`flex justify-between items-center p-2 rounded border text-xs ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <span className="truncate flex-1">Q{idx+1}. {q.text}</span>
                <div className="flex items-center gap-1">
                   <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded font-bold">{q.points}pts</span>
                   <button onClick={() => handleRemoveQuestion(q.id)} className="text-red-500"><DeleteIcon fontSize="small" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`flex justify-end pt-4 gap-3 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
          <Button type="button" variant="outlined" onClick={onClose} style={{ borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db', color: theme === 'dark' ? 'white' : 'black' }}>Cancel</Button>
          <Button type="submit" className="bg-green-600 text-white hover:bg-green-700 shadow-md" disabled={questions.length === 0}>Create</Button>
        </div>
      </form>
    </Modal>
  )
}

const AnalyticsModal = ({ isOpen, onClose, stats }: any) => {
  const { theme } = useTheme()
  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Analytics">
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className={`p-3 rounded-lg text-center ${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
          <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
          <div className="text-xs text-gray-500">Students</div>
        </div>
        <div className={`p-3 rounded-lg text-center ${theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'}`}>
          <div className="text-2xl font-bold text-green-600">{stats.averageProgress}%</div>
          <div className="text-xs text-gray-500">Avg Progress</div>
        </div>
        <div className={`p-3 rounded-lg text-center ${theme === 'dark' ? 'bg-purple-900/20' : 'bg-purple-50'}`}>
          <div className="text-2xl font-bold text-purple-600">{stats.totalSessions}</div>
          <div className="text-xs text-gray-500">Sessions</div>
        </div>
        <div className={`p-3 rounded-lg text-center ${theme === 'dark' ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
          <div className="text-2xl font-bold text-yellow-600">{stats.averageRating}</div>
          <div className="text-xs text-gray-500">Rating</div>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button onClick={onClose} variant="outlined" style={{ borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db', color: theme === 'dark' ? 'white' : 'black' }}>Close</Button>
      </div>
    </Modal>
  )
}

// --- 2. MAIN COMPONENT MOBILE ---

const TrackStudentProgressMobile: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [studentsMap, setStudentsMap] = useState<Record<string, any>>({})
  const [studentsProgress, setStudentsProgress] = useState<StudentProgress[]>([])
  
  const [selectedStudent, setSelectedStudent] = useState('all')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showStudentDropdown, setShowStudentDropdown] = useState(false)
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false)
  const [activeMenu, setActiveMenu] = useState('progress')
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false)
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false)
  const [selectedStudentForAction, setSelectedStudentForAction] = useState<StudentProgress | null>(null)

  const handleOpenAssign = (student?: StudentProgress) => {
    setSelectedStudentForAction(student || null)
    setIsAssignModalOpen(true)
  }

  const handleOpenQuiz = (student?: StudentProgress) => {
    setSelectedStudentForAction(student || null)
    setIsQuizModalOpen(true)
  }

  const handleOpenAnalytics = () => {
    setIsAnalyticsModalOpen(true)
  }
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        const userStr = localStorage.getItem('user')
        if (!userStr) { navigate('/login'); return }
        const userData = JSON.parse(userStr)
        setUser(userData)

        const progressResponse = await progressAPI.list({ tutorId: userData.id, limit: 1000 })
        
        if (progressResponse.data && Array.isArray(progressResponse.data)) {
          const progressRecords = progressResponse.data
          const studentIds = [...new Set(progressRecords.map((p: any) => p.studentId))] as string[]
          const studentsData: Record<string, any> = {}
          await Promise.all(studentIds.map(async (studentId) => {
              try {
                const response = await usersAPI.get(studentId)
                if (response.success) studentsData[studentId] = response.data
              } catch (err) { console.error(err) }
          }))
          setStudentsMap(studentsData)

          const studentProgressMap = new Map<string, StudentProgress>()
          progressRecords.forEach((progress: any) => {
            if (!studentProgressMap.has(progress.studentId)) {
              studentProgressMap.set(progress.studentId, {
                studentId: progress.studentId,
                studentName: studentsData[progress.studentId]?.name || 'Unknown Student',
                progressRecords: [],
                sessions: [],
                averageScore: 0,
                totalSessions: 0,
                subjects: []
              })
            }
            const studentProgress = studentProgressMap.get(progress.studentId)!
            studentProgress.progressRecords.push(progress)
            if (!studentProgress.subjects.includes(progress.subject)) studentProgress.subjects.push(progress.subject)
          })

          studentProgressMap.forEach((studentProgress) => {
            const scores = studentProgress.progressRecords.map((p: any) => p.score || 0)
            const averageScore = scores.length > 0 
              ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length 
              : 0
            studentProgress.averageScore = Math.round(averageScore * 10)
            studentProgress.totalSessions = studentProgress.progressRecords.length
          })
          setStudentsProgress(Array.from(studentProgressMap.values()))
        }
      } catch (err: any) {
        console.error(err)
        setError(err.message || 'Failed to load data')
      } finally { setLoading(false) }
    }
    loadData()
  }, [navigate])

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen)
  const handleThemeToggle = () => toggleTheme()
  const handleMenuClick = (item: any) => { setActiveMenu(item.id); if (item.path) navigate(item.path) }
  const getInitials = (name: string) => name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2)
  const getAvatarColor = (name: string) => {
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#795548', '#607d8b']
    return colors[(name.charCodeAt(0) || 0) % colors.length]
  }

  const allSubjects = [...new Set(studentsProgress.flatMap(s => s.subjects))]
  const filteredStudents = studentsProgress.filter(student => {
    const matchesStudent = selectedStudent === 'all' || student.studentId === selectedStudent
    const matchesSubject = selectedSubject === 'all' || student.subjects.includes(selectedSubject)
    const matchesSearch = student.studentName.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStudent && matchesSubject && matchesSearch
  })

  const overallStats = {
    totalStudents: studentsProgress.length,
    averageProgress: studentsProgress.length > 0 
      ? Math.round(studentsProgress.reduce((sum, s) => sum + s.averageScore, 0) / studentsProgress.length)
      : 0,
    totalSessions: studentsProgress.reduce((sum, s) => sum + s.totalSessions, 0),
    averageRating: '0.0'
  }

  const subjectOptions = [{ value: 'all', label: 'All Subjects' }, ...allSubjects.map(s => ({ value: s, label: s }))]
  const studentOptions = [{ value: 'all', label: 'All Students' }, ...studentsProgress.map(s => ({ value: s.studentId, label: s.studentName }))]
  const getSelectedStudent = () => studentOptions.find(o => o.value === selectedStudent) || studentOptions[0]
  const getSelectedSubject = () => subjectOptions.find(o => o.value === selectedSubject) || subjectOptions[0]

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, path: '/tutor' },
    { id: 'availability', label: 'Set Availability', icon: <Schedule className="w-4 h-4" />, path: '/tutor/availability' },
    { id: 'sessions', label: 'Manage Sessions', icon: <Assignment className="w-4 h-4" />, path: '/tutor/sessions' },
    { id: 'progress', label: 'Track Progress', icon: <BarChartIcon className="w-4 h-4" />, path: '/tutor/track-progress' },
    { id: 'cancel-reschedule', label: 'Cancel/Reschedule', icon: <AutorenewIcon className="w-4 h-4" />, path: '/tutor/cancel-reschedule' },
    { id: 'messages', label: 'Messages', icon: <ChatIcon className="w-4 h-4" />, path: '/tutor/messages' }
  ]

  if (loading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Loading student progress...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} pb-16`}>
      {/* Mobile Header */}
      <div className={`sticky top-0 z-40 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <button onClick={() => navigate('/tutor')} className={`p-2 rounded-lg mr-3 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
              <ArrowBackIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Track Progress</h1>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Monitor learning</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={handleThemeToggle} className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
              {theme === 'dark' ? <LightModeIcon className="w-5 h-5 text-yellow-400" /> : <DarkModeIcon className="w-5 h-5" />}
            </button>
            <button onClick={handleOpenAnalytics} className={`p-2 rounded-lg text-white !shadow-md ${theme === 'dark' ? '!bg-green-700' : 'bg-green-600'}`}>
               <BarChartIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="p-4 space-y-4">
        {/* Progress Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className={`p-3 !shadow-md !border-0 ${theme === 'dark' ? '!bg-gray-800 !text-white' : '!bg-white text-gray-900'}`}>
            <div className="text-center">
              <p className="text-lg font-bold">{overallStats.totalStudents}</p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Students</p>
            </div>
          </Card>
          <Card className={`p-3 !shadow-md !border-0 ${theme === 'dark' ? '!bg-gray-800 !text-white' : '!bg-white text-gray-900'}`}>
            <div className="text-center">
              <p className="text-lg font-bold">{overallStats.averageProgress}%</p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Avg Progress</p>
            </div>
          </Card>
          <Card className={`p-3 !shadow-md !border-0 ${theme === 'dark' ? '!bg-gray-800 !text-white' : '!bg-white text-gray-900'}`}>
            <div className="text-center">
              <p className="text-lg font-bold">{overallStats.totalSessions}</p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Sessions</p>
            </div>
          </Card>
          <Card className={`p-3 !shadow-md !border-0 ${theme === 'dark' ? '!bg-gray-800 !text-white' : '!bg-white text-gray-900'}`}>
            <div className="text-center">
              <p className="text-lg font-bold">{overallStats.averageRating}</p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Rating</p>
            </div>
          </Card>
        </div>

        {/* Search & Filters */}
        <div className="space-y-3">
          <div className="relative">
            <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-4 py-3 pl-10 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2"><Search className="w-5 h-5 text-gray-400" /></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div className="relative">
               <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} 
                 className={`w-full px-3 py-3 text-sm border rounded-xl appearance-none ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                 <option value="all">All Students</option>
                 {studentsProgress.map(s => <option key={s.studentId} value={s.studentId}>{s.studentName}</option>)}
               </select>
             </div>
             <div className="relative">
               <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} 
                 className={`w-full px-3 py-3 text-sm border rounded-xl appearance-none ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                 <option value="all">All Subjects</option>
                 {allSubjects.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
             </div>
          </div>
        </div>
        
        {error && <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">{error}</div>}

        {/* Student Progress Cards */}
        <div className="space-y-4">
          {filteredStudents.length === 0 && !loading && (
            <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              <BarChartIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No students found</h3>
            </div>
          )}
          
          {filteredStudents.map((student) => (
            <Card key={student.studentId} className={`overflow-hidden !shadow-lg !border-0 ${theme === 'dark' ? '!bg-gray-800 !text-white' : '!bg-white text-gray-900'}`}>
              <div className="p-4">
                {/* Student Header */}
                <div className="flex items-center mb-3">
                  <Avatar sx={{ width: 40, height: 40, bgcolor: getAvatarColor(student.studentName), fontSize: '1rem', fontWeight: 'bold', mr: 2 }}>
                    {getInitials(student.studentName)}
                  </Avatar>
                  <div className="flex-1">
                    <h3 className={`font-semibold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{student.studentName}</h3>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{student.subjects.join(', ')}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Score</span>
                    <span className={`text-xs font-medium text-blue-600`}>{student.averageScore}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${student.averageScore}%` }}></div>
                  </div>
                </div>

                {/* Recent Topics */}
                <div className="mb-3">
                  <h4 className={`text-xs font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>Recent Topics:</h4>
                  <div className="space-y-1">
                    {student.progressRecords.slice(0, 2).map((p: any, index: number) => (
                       <div key={index} className={`p-2 rounded flex justify-between ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{p.topic}</span>
                          <span className="text-xs font-bold text-blue-500">{Math.round(p.score * 10)}%</span>
                        </div>
                    ))}
                  </div>
                </div>

                {/* Improvements */}
                {student.progressRecords.length > 0 && student.progressRecords[0].improvements && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {student.progressRecords[0].improvements.slice(0, 2).map((imp: string, i: number) => (
                        <span key={i} className={`px-2 py-1 text-xs rounded-full ${theme === 'dark' ? 'bg-green-900/30 text-green-300 border border-green-800' : 'bg-green-100 text-green-800'}`}>{imp}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Challenges */}
                {student.progressRecords.length > 0 && student.progressRecords[0].challenges && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {student.progressRecords[0].challenges.slice(0, 2).map((chal: string, i: number) => (
                        <span key={i} className={`px-2 py-1 text-xs rounded-full ${theme === 'dark' ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-800' : 'bg-yellow-100 text-yellow-800'}`}>{chal}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <Button size="small" className="bg-blue-600 hover:bg-blue-700 text-white !shadow-md" onClick={() => handleOpenAssign(student)}>
                    <Assignment className="w-4 h-4 mr-1" /> Assign
                  </Button>
                  <Button size="small" variant="outlined" 
                    className={`border ${theme === 'dark' ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'}`}
                    onClick={() => handleOpenQuiz(student)}>
                    <Quiz className="w-4 h-4 mr-1" /> Quiz
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Modals */}
      <AssignHomeworkModal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} student={selectedStudentForAction} currentUser={user} />
      <CreateQuizModal isOpen={isQuizModalOpen} onClose={() => setIsQuizModalOpen(false)} currentUser={user} student={selectedStudentForAction} />
      <AnalyticsModal isOpen={isAnalyticsModalOpen} onClose={() => setIsAnalyticsModalOpen(false)} stats={overallStats} />
    </div>
  )
}

export default TrackStudentProgressMobile