import React, { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  TrendingUp,
  Schedule,
  Star,
  Assignment,
  Quiz,
  Person,
  Menu as MenuIcon,
  ArrowBack as ArrowBackIcon,
  BarChart as BarChartIcon,
  Close as CloseIcon,
  AddCircle as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioIcon
} from '@mui/icons-material'
import { Avatar } from '@mui/material'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { progressAPI, usersAPI } from '../../lib/api'


const Modal = ({ isOpen, onClose, title, children }: any) => {
  const { theme } = useTheme()
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
      <div className={`relative w-full max-w-lg rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        }`}>
        <div className={`flex items-center justify-between p-5 border-b sticky top-0 z-10 ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'
          }`}>
          <h3 className="text-xl font-bold">{title}</h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

const AssignHomeworkModal = ({ isOpen, onClose, studentName, currentUser }: any) => {
  const { theme } = useTheme()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    dueDate: '',
    points: ''
  })

  const inputClass = `w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 shadow-sm ${theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
    }`

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const randomId = Math.random().toString(36).substring(2, 15)

    const newAssignment = {
      id: `assign_${randomId}`,
      classId: "class_demo_123",
      title: formData.title,
      description: formData.description,
      instructions: formData.instructions,
      attachments: [{ fileName: "reference_material.pdf", fileSize: 102400 }],
      totalPoints: Number(formData.points),
      dueDate: new Date(formData.dueDate).toISOString(),
      createdBy: currentUser?.id || "tut_current_user",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    console.log("Payload Assign Homework:", newAssignment)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={studentName ? `Assign to ${studentName}` : "Assign Homework"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Assignment Title <span className="text-red-500">*</span></label>
          <input required type="text" className={inputClass}
            placeholder="e.g. Chapter 5 Exercises"
            onChange={e => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Due Date <span className="text-red-500">*</span></label>
            <input required type="date" className={inputClass}
              onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Total Points <span className="text-red-500">*</span></label>
            <input required type="number" className={inputClass}
              placeholder="100"
              onChange={e => setFormData({ ...formData, points: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Description</label>
          <textarea className={inputClass} rows={2}
            placeholder="Mô tả ngắn gọn..."
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Attachments</label>
          <div className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${theme === 'dark'
              ? 'border-gray-600 hover:border-gray-500 bg-gray-800 text-gray-400'
              : 'border-gray-300 hover:border-blue-400 bg-gray-50 text-gray-500'
            }`}>
            <UploadIcon className="mx-auto h-8 w-8 mb-1" />
            <p className="text-xs">Click to upload PDF, DOCX</p>
          </div>
        </div>

        <div className={`flex justify-end pt-4 gap-3 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
          <Button type="button" variant="outlined" onClick={onClose}
            style={{ borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db', color: theme === 'dark' ? 'white' : 'black' }}
          >Cancel</Button>
          <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700 shadow-lg">Assign Now</Button>
        </div>
      </form>
    </Modal>
  )
}

const CreateQuizModal = ({ isOpen, onClose, currentUser }: any) => {
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

  const inputClass = `w-full p-2 border rounded-md ${theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
    }`

  const totalPoints = questions.reduce((sum, q) => sum + Number(q.points), 0)

  const handleAddQuestion = () => {
    if (!newQuestion.text) return;
    if (newQuestion.type === 'multiple_choice' && newQuestion.options.some(opt => !opt.trim())) {
      alert("Fill all 4 question options.");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const randomId = Math.random().toString(36).substring(2, 15)

    const newQuiz = {
      id: `quiz_${randomId}`,
      sessionId: "ses_demo_session",
      title: quizMeta.title,
      description: quizMeta.description,
      questions: questions,
      totalPoints: totalPoints,
      duration: Number(quizMeta.duration),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: currentUser?.id || "tut_current_user",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    console.log("Payload Create Quiz (Full):", newQuiz)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Quiz">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className={`space-y-3 p-4 rounded-lg border shadow-sm ${theme === 'dark' ? 'bg-gray-700/50 border-gray-700' : 'bg-gray-50 border-gray-100'
          }`}>
          <h4 className={`text-sm font-bold uppercase ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>1. Quiz Info</h4>
          <div>
            <input required type="text" className={inputClass}
              placeholder="Quiz Title (e.g. Mid-term Test)"
              value={quizMeta.title} onChange={e => setQuizMeta({ ...quizMeta, title: e.target.value })}
            />
          </div>
          <div className="flex gap-3">
            <input required type="number" className={`${inputClass} w-1/2`}
              placeholder="Duration (mins)"
              value={quizMeta.duration} onChange={e => setQuizMeta({ ...quizMeta, duration: e.target.value })}
            />
            <input type="text" className={`w-1/2 p-2 border rounded-md cursor-not-allowed ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-500'
              }`}
              value={`Total Points: ${totalPoints}`} disabled
            />
          </div>
        </div>

        <div className="space-y-3">
          <h4 className={`text-sm font-bold uppercase ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>2. Add Questions</h4>

          <div className={`space-y-3 p-4 border border-dashed rounded-lg ${
            theme === 'dark' ? 'border-gray-600 bg-gray-800/30' : 'border-gray-300 bg-gray-50/50'
          }`}>
            
            <div className="flex flex-col gap-2">
              <input type="text" className={`${inputClass} font-medium`} 
                placeholder="Enter question text here..." 
                value={newQuestion.text} onChange={e => setNewQuestion({...newQuestion, text: e.target.value})}
              />
              
              <div className="flex gap-2">
                <select className={`${inputClass} flex-1`}
                  value={newQuestion.type} onChange={e => setNewQuestion({...newQuestion, type: e.target.value})}
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="true_false">True / False</option>
                  <option value="short_answer">Short Answer / Essay</option>
                </select>
                <input type="number" className={`${inputClass} flex-1 text-center`} 
                  placeholder="Points" value={newQuestion.points} onChange={e => setNewQuestion({...newQuestion, points: Number(e.target.value)})}
                />
              </div>
            </div>

            {/* Dynamic Answer Inputs */}
            <div className={`pl-2 border-l-2 ml-1 ${theme === 'dark' ? 'border-blue-800' : 'border-blue-200'}`}>
              {newQuestion.type === 'multiple_choice' && (
                <div className="grid grid-cols-1 gap-2">
                  <p className="text-xs text-gray-500 mb-1">Enter 4 options and select the correct one:</p>
                  {newQuestion.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setNewQuestion({ ...newQuestion, correctAnswerIndex: idx })}
                        className={`p-1 rounded-full transition-colors ${newQuestion.correctAnswerIndex === idx ? 'text-green-600 bg-green-100' : 'text-gray-400 hover:bg-gray-200'}`}
                      >
                        {newQuestion.correctAnswerIndex === idx ? <CheckCircleIcon fontSize="small" /> : <RadioIcon fontSize="small" />}
                      </button>
                      <input
                        type="text"
                        className={`${inputClass} py-1.5 text-sm`}
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              )}

              {newQuestion.type === 'true_false' && (
                <div className="flex gap-4 items-center p-2">
                  <span className="text-sm text-gray-500">Correct Answer:</span>
                  <button type="button" onClick={() => setNewQuestion({ ...newQuestion, correctAnswerIndex: 0 })}
                    className={`px-4 py-1.5 rounded-md border transition-all ${newQuestion.correctAnswerIndex === 0 ? 'bg-green-600 text-white border-green-600 shadow-sm' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                    True
                  </button>
                  <button type="button" onClick={() => setNewQuestion({ ...newQuestion, correctAnswerIndex: 1 })}
                    className={`px-4 py-1.5 rounded-md border transition-all ${newQuestion.correctAnswerIndex === 1 ? 'bg-red-600 text-white border-red-600 shadow-sm' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                    False
                  </button>
                </div>
              )}

              {newQuestion.type === 'short_answer' && (
                <p className={`text-sm italic p-2 rounded border ${theme === 'dark' ? 'text-gray-400 bg-gray-800 border-gray-700' : 'text-gray-500 bg-white border-gray-200'
                  }`}>
                  Student will answer with a text response. Correct answer will be manually graded.
                </p>
              )}
            </div>

            <button type="button" onClick={handleAddQuestion} className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-all ${theme === 'dark' ? 'bg-blue-900/30 text-blue-300 hover:bg-blue-900/50' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}>
              <AddIcon fontSize="small" /> Add This Question
            </button>
          </div>

          {/* Question List Preview */}
          <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
            {questions.length === 0 && <p className="text-xs text-center text-gray-400 py-4 border rounded-lg border-dashed">No questions added yet.</p>}
            {questions.map((q, idx) => (
              <div key={q.id} className={`flex justify-between items-start p-3 rounded-lg shadow-sm border text-sm group transition-all ${theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:border-blue-700' : 'bg-white border-gray-100 hover:border-blue-300'
                }`}>
                <div className="flex-1 mr-2">
                  <div className="font-medium mb-1">
                    <span className="text-blue-600 font-bold mr-2">Question {idx + 1}.</span>
                    {q.text}
                  </div>
                  <div className="text-xs text-gray-500 flex gap-2">
                    <span className={`px-2 py-0.5 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      {q.type === 'multiple_choice' ? 'MCQ' : q.type === 'true_false' ? 'True/False' : 'Essay'}
                    </span>
                    <span className="text-green-600">
                      Correct: {
                        q.type === 'multiple_choice' ? `Option ${String.fromCharCode(65 + q.correctAnswerIndex)}` :
                          q.type === 'true_false' ? (q.correctAnswerIndex === 0 ? 'True' : 'False') : '(Text)'
                      }
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-col sm:flex-row">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${theme === 'dark' ? 'bg-blue-900/50 text-blue-200' : 'bg-blue-50 text-blue-700'
                    }`}>{q.points} pts</span>
                  <button type="button" onClick={() => handleRemoveQuestion(q.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                    <DeleteIcon fontSize="small" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`flex justify-end pt-4 gap-3 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
          <Button type="button" variant="outlined" onClick={onClose}
            style={{ borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db', color: theme === 'dark' ? 'white' : 'black' }}
          >Cancel</Button>
          <Button type="submit" className="bg-green-600 text-white hover:bg-green-700 shadow-md" disabled={questions.length === 0}>
            Finish & Create Quiz
          </Button>
        </div>
      </form>
    </Modal>
  )
}

const AnalyticsModal = ({ isOpen, onClose, stats }: any) => {
  const { theme } = useTheme()
  if (!isOpen) return null

  const statCardClass = (color: string, bgColorLight: string, bgColorDark: string, textColorLight: string) => `
    p-4 rounded-lg text-center shadow-sm 
    ${theme === 'dark' ? bgColorDark : bgColorLight}
  `

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="My Teaching Analytics">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className={statCardClass('blue', 'bg-blue-50', 'bg-blue-900/20', 'text-blue-600')}>
          <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>{stats.totalStudents}</div>
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>My Students</div>
        </div>
        <div className={statCardClass('green', 'bg-green-50', 'bg-green-900/20', 'text-green-600')}>
          <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>{stats.averageProgress}%</div>
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Class Avg. Progress</div>
        </div>
        <div className={statCardClass('purple', 'bg-purple-50', 'bg-purple-900/20', 'text-purple-600')}>
          <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>{stats.totalSessions}</div>
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Sessions Recorded</div>
        </div>
        <div className={statCardClass('yellow', 'bg-yellow-50', 'bg-yellow-900/20', 'text-yellow-600')}>
          <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>{stats.averageRating}</div>
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Avg Rating</div>
        </div>
      </div>
      <div className={`text-xs text-center border-t pt-4 ${theme === 'dark' ? 'text-gray-500 border-gray-700' : 'text-gray-400 border-gray-200'
        }`}>
        Analytics based on your real-time progress data.
      </div>
      <div className="mt-4 flex justify-end">
        <Button onClick={onClose} variant="outlined" style={{ borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db', color: theme === 'dark' ? 'white' : 'black' }}>Close Report</Button>
      </div>
    </Modal>
  )
}

// --- 2. MAIN COMPONENT ---

interface StudentProgress {
  studentId: string
  studentName: string
  progressRecords: any[]
  sessions: any[]
  averageScore: number
  totalSessions: number
  subjects: string[]
}

const TrackStudentProgress: React.FC = () => {
  const { theme } = useTheme()
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

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false)
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false)
  const [selectedStudentForAction, setSelectedStudentForAction] = useState<string | null>(null)

  const handleOpenAssign = (studentName?: string) => {
    setSelectedStudentForAction(studentName || null)
    setIsAssignModalOpen(true)
  }

  const handleOpenQuiz = () => {
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
        if (!userStr) {
          navigate('/login')
          return
        }
        const userData = JSON.parse(userStr)
        setUser(userData)

        const progressResponse = await progressAPI.list({ tutorId: userData.id, limit: 1000 })

        if (progressResponse.data && Array.isArray(progressResponse.data)) {
          const progressRecords = progressResponse.data
          const studentIds = [...new Set(progressRecords.map((p: any) => p.studentId))] as string[]

          const studentsData: Record<string, any> = {}
          await Promise.all(
            studentIds.map(async (studentId) => {
              try {
                const response = await usersAPI.get(studentId)
                const userData = response.success ? response.data : response
                if (userData) {
                  studentsData[studentId] = userData
                }
              } catch (err) {
                console.error(`Error loading student ${studentId}:`, err)
              }
            })
          )

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
            if (!studentProgress.subjects.includes(progress.subject)) {
              studentProgress.subjects.push(progress.subject)
            }
          })

          studentProgressMap.forEach((studentProgress) => {
            const scores = studentProgress.progressRecords.map((p: any) => p.score || 0)
            const averageScore = scores.length > 0
              ? scores.reduce((a, b) => a + b, 0) / scores.length
              : 0
            studentProgress.averageScore = Math.round(averageScore * 10)
            studentProgress.totalSessions = studentProgress.progressRecords.length
          })

          setStudentsProgress(Array.from(studentProgressMap.values()))
        }
      } catch (err: any) {
        console.error('Error loading progress:', err)
        setError(err.message || 'Failed to load progress data')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [navigate])

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const getInitials = (name: string) => name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2)
  const getAvatarColor = (name: string) => {
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#795548', '#607d8b']
    return colors[(name.charCodeAt(0) || 0) % colors.length]
  }

  const filteredStudents = studentsProgress.filter(student => {
    const matchesStudent = selectedStudent === 'all' || student.studentId === selectedStudent
    const matchesSubject = selectedSubject === 'all' || student.subjects.includes(selectedSubject)
    const matchesSearch = student.studentName.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStudent && matchesSubject && matchesSearch
  })

  const overallStats = {
    totalStudents: studentsProgress.length,
    averageProgress: studentsProgress.length > 0 ? Math.round(studentsProgress.reduce((sum, s) => sum + s.averageScore, 0) / studentsProgress.length) : 0,
    totalSessions: studentsProgress.reduce((sum, s) => sum + s.totalSessions, 0),
    averageRating: '0.0'
  }

  const allSubjects = [...new Set(studentsProgress.flatMap(s => s.subjects))]

  if (loading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <div className={`w-full lg:w-60 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-r ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} lg:block`}>
          <div className="p-6">
            <div className="flex items-center mb-8 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/tutor')}>
              <div className="w-10 h-10 flex items-center justify-center mr-3">
                <img src="/HCMCUT.png" alt="HCMUT Logo" className="w-10 h-10" />
              </div>
              <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>HCMUT</span>
            </div>

            <div className="mb-8">
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>PROGRESS OVERVIEW</h3>
              <div className="space-y-3">
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Total Students:</span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{overallStats.totalStudents}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Avg Progress:</span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{overallStats.averageProgress}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>QUICK ACTIONS</h3>
              <div className="space-y-2">
                <button onClick={() => navigate('/tutor')} className={`w-full flex items-center px-3 py-2 rounded-lg text-left bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors`}>
                  <ArrowBackIcon className="mr-3 w-4 h-4" />
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Track Student Progress</h1>
                <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Monitor and analyze student learning progress</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => setIsAnalyticsModalOpen(true)}
                  className={`!shadow-lg !border-0 text-white transition-colors ${theme === 'dark' ? '!bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  <BarChartIcon className="w-4 h-4 mr-2" />
                  View My Analytics
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Row - SHADOW & NO BORDER */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className={`p-6 !shadow-lg !border-0 ${theme === 'dark' ? '!bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{overallStats.totalStudents}</p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Students</p>
                </div>
                <div className="text-3xl text-blue-600"><Person /></div>
              </div>
            </Card>
            <Card className={`p-6 !shadow-lg !border-0 ${theme === 'dark' ? '!bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{overallStats.averageProgress}%</p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Avg Progress</p>
                </div>
                <div className="text-3xl text-green-600"><TrendingUp /></div>
              </div>
            </Card>
            <Card className={`p-6 !shadow-lg !border-0 ${theme === 'dark' ? '!bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{overallStats.totalSessions}</p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Sessions</p>
                </div>
                <div className="text-3xl text-purple-600"><Schedule /></div>
              </div>
            </Card>
            <Card className={`p-6 !shadow-lg !border-0 ${theme === 'dark' ? '!bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{overallStats.averageRating}</p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Avg Rating</p>
                </div>
                <div className="text-3xl text-yellow-600"><Star /></div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Search and Filters - SHADOW & NO BORDER */}
            <div className="lg:col-span-2">
              <Card className={`p-6 !shadow-lg !border-0 ${theme === 'dark' ? '!bg-gray-800' : 'bg-white'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Search & Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="relative">
                      <input type="text" placeholder="Search students..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full px-4 py-3 pl-10 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`} />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2"><Search className="w-5 h-5 text-gray-400" /></div>
                    </div>
                  </div>
                  <div>
                    <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} className={`w-full px-3 py-3 border rounded-lg ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}>
                      <option value="all">All Students</option>
                      {studentsProgress.map((s) => <option key={s.studentId} value={s.studentId}>{s.studentName}</option>)}
                    </select>
                  </div>
                  <div>
                    <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className={`w-full px-3 py-3 border rounded-lg ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}>
                      <option value="all">All Subjects</option>
                      {allSubjects.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <Card className={`p-6 !shadow-lg !border-0 ${theme === 'dark' ? '!bg-gray-800' : 'bg-white'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h3>
                <div className="space-y-3">
                  <button onClick={() => handleOpenAssign()} className={`w-full flex items-center px-4 py-3 rounded-lg border ${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'} transition-colors`}>
                    <Assignment className="mr-3 w-4 h-4" />
                    Assign Homework
                  </button>
                  <button onClick={() => handleOpenQuiz()} className={`w-full flex items-center px-4 py-3 rounded-lg border ${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'} transition-colors`}>
                    <Quiz className="mr-3 w-4 h-4" />
                    Create Quiz
                  </button>
                  <button onClick={() => setIsAnalyticsModalOpen(true)} className={`w-full flex items-center px-4 py-3 rounded-lg border ${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'} transition-colors`}>
                    <BarChartIcon className="mr-3 w-4 h-4" />
                    View Analytics
                  </button>
                </div>
              </Card>
            </div>
          </div>

          {/* Student List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <Card key={student.studentId} className={`overflow-hidden !shadow-lg !border-0 transition-all duration-700 ease-in-out hover:-translate-y-1 hover:scale-[1.01] hover:!shadow-2xl cursor-pointer ${theme === 'dark' ? '!bg-gray-800' : 'bg-white'}`}>
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center mb-4">
                    <Avatar sx={{ width: 48, height: 48, bgcolor: getAvatarColor(student.studentName), fontSize: '1.25rem', fontWeight: 'bold', mr: 3 }}>{getInitials(student.studentName)}</Avatar>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{student.studentName}</h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{student.subjects.join(', ')}</p>
                    </div>
                  </div>

                  {/* Score Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Average Score</span>
                      <span className="text-sm font-medium text-blue-600">{student.averageScore}%</span>
                    </div>
                    <div className={`w-full rounded-full h-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${student.averageScore}%` }}></div>
                    </div>
                  </div>

                  {/* Recent Topics */}
                  <div className="mb-4">
                    <h4 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>Recent Topics:</h4>
                    <div className="space-y-2">
                      {student.progressRecords.slice(0, 2).map((p: any, i: number) => (
                        <div key={i} className={`p-2 rounded flex justify-between ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{p.topic}</span>
                          <span className="text-xs font-bold text-blue-500">{Math.round(p.score * 10)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Improvements */}
                  {student.progressRecords.length > 0 && student.progressRecords[0].improvements && (
                    <div className="mb-4">
                      <h4 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>Recent Improvements:</h4>
                      <div className="flex flex-wrap gap-1">
                        {student.progressRecords[0].improvements.slice(0, 3).map((imp: string, i: number) => (
                          <span key={i} className={`px-2 py-1 text-xs rounded-full ${theme === 'dark' ? 'bg-green-900/30 text-green-300 border border-green-800' : 'bg-green-100 text-green-800'
                            }`}>
                            {imp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Challenges */}
                  {student.progressRecords.length > 0 && student.progressRecords[0].challenges && (
                    <div className="mb-4">
                      <h4 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>Challenges:</h4>
                      <div className="flex flex-wrap gap-1">
                        {student.progressRecords[0].challenges.slice(0, 3).map((challenge: string, i: number) => (
                          <span key={i} className={`px-2 py-1 text-xs rounded-full ${theme === 'dark' ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {challenge}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2 mt-4">
                    <Button
                      size="small"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white !shadow-md"
                      onClick={() => handleOpenAssign(student.studentName)}
                    >
                      <Assignment className="w-4 h-4 mr-1" />
                      Assign
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      className={`flex-1 border transition-colors ${theme === 'dark'
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      onClick={() => handleOpenQuiz()}
                    >
                      <Quiz className="w-4 h-4 mr-1" />
                      Quiz
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <AssignHomeworkModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        studentName={selectedStudentForAction}
        currentUser={user}
      />
      <CreateQuizModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        currentUser={user}
      />
      <AnalyticsModal
        isOpen={isAnalyticsModalOpen}
        onClose={() => setIsAnalyticsModalOpen(false)}
        stats={overallStats}
      />
    </div>
  )
}

export default TrackStudentProgress