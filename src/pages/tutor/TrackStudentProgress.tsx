import React, { useState } from 'react'
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
  BarChart as BarChartIcon
} from '@mui/icons-material'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const TrackStudentProgress: React.FC = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [selectedStudent, setSelectedStudent] = useState('all')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const students = [
    {
      id: 1,
      name: 'John Smith',
      subject: 'Mathematics',
      progress: 85,
      sessionsCompleted: 12,
      averageRating: 4.8,
      lastSession: '2024-01-10',
      avatar: '/api/placeholder/40/40',
      goals: [
        { topic: 'Calculus', target: 90, current: 85, deadline: '2024-02-15' },
        { topic: 'Algebra', target: 95, current: 88, deadline: '2024-02-20' }
      ],
      recentSessions: [
        { date: '2024-01-10', topic: 'Derivatives', rating: 5, duration: '60 min' },
        { date: '2024-01-08', topic: 'Limits', rating: 4, duration: '60 min' },
        { date: '2024-01-05', topic: 'Functions', rating: 5, duration: '90 min' }
      ],
      strengths: ['Problem Solving', 'Critical Thinking'],
      weaknesses: ['Time Management', 'Complex Calculations']
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      subject: 'Physics',
      progress: 78,
      sessionsCompleted: 8,
      averageRating: 4.6,
      lastSession: '2024-01-08',
      avatar: '/api/placeholder/40/40',
      goals: [
        { topic: 'Mechanics', target: 85, current: 80, deadline: '2024-03-01' },
        { topic: 'Thermodynamics', target: 80, current: 75, deadline: '2024-03-15' }
      ],
      recentSessions: [
        { date: '2024-01-08', topic: 'Newton\'s Laws', rating: 4, duration: '90 min' },
        { date: '2024-01-05', topic: 'Kinematics', rating: 5, duration: '60 min' },
        { date: '2024-01-03', topic: 'Forces', rating: 4, duration: '60 min' }
      ],
      strengths: ['Conceptual Understanding', 'Visual Learning'],
      weaknesses: ['Mathematical Applications', 'Problem Setup']
    },
    {
      id: 3,
      name: 'Mike Chen',
      subject: 'Chemistry',
      progress: 92,
      sessionsCompleted: 6,
      averageRating: 4.9,
      lastSession: '2024-01-05',
      avatar: '/api/placeholder/40/40',
      goals: [
        { topic: 'Organic Chemistry', target: 95, current: 92, deadline: '2024-02-28' },
        { topic: 'Inorganic Chemistry', target: 90, current: 88, deadline: '2024-03-10' }
      ],
      recentSessions: [
        { date: '2024-01-05', topic: 'Organic Reactions', rating: 5, duration: '60 min' },
        { date: '2024-01-03', topic: 'Bonding', rating: 5, duration: '90 min' },
        { date: '2024-01-01', topic: 'Stoichiometry', rating: 4, duration: '60 min' }
      ],
      strengths: ['Memorization', 'Pattern Recognition'],
      weaknesses: ['Laboratory Skills', 'Safety Protocols']
    }
  ]

  const filteredStudents = students.filter(student => {
    const matchesStudent = selectedStudent === 'all' || student.id.toString() === selectedStudent
    const matchesSubject = selectedSubject === 'all' || student.subject === selectedSubject
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStudent && matchesSubject && matchesSearch
  })

  const overallStats = {
    totalStudents: students.length,
    averageProgress: Math.round(students.reduce((sum, student) => sum + student.progress, 0) / students.length),
    totalSessions: students.reduce((sum, student) => sum + student.sessionsCompleted, 0),
    averageRating: (students.reduce((sum, student) => sum + student.averageRating, 0) / students.length).toFixed(1)
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

            {/* Progress Overview */}
            <div className="mb-8">
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                PROGRESS OVERVIEW
              </h3>
              <div className="space-y-3">
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Total Students:</span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {overallStats.totalStudents}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Avg Progress:</span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {overallStats.averageProgress}%
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Total Sessions:</span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {overallStats.totalSessions}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Avg Rating:</span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {overallStats.averageRating}
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
                  onClick={() => navigate('/tutor/sessions')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Assignment className="mr-3 w-4 h-4" />
                  Manage Sessions
                </button>
                <button 
                  onClick={() => navigate('/tutor/availability')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Schedule className="mr-3 w-4 h-4" />
                  Set Availability
                </button>
                <button 
                  onClick={() => navigate('/tutor')}
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
                <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Track Student Progress
                </h1>
                <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Monitor and analyze student learning progress
                </p>
              </div>
              <div className="flex space-x-2">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <BarChartIcon className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </div>
          </div>

          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {overallStats.totalStudents}
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total Students
                  </p>
                </div>
                <div className="text-3xl text-blue-600">
                  <Person />
                </div>
              </div>
            </Card>

            <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {overallStats.averageProgress}%
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Avg Progress
                  </p>
                </div>
                <div className="text-3xl text-green-600">
                  <TrendingUp />
                </div>
              </div>
            </Card>

            <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {overallStats.totalSessions}
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

            <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {overallStats.averageRating}
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Avg Rating
                  </p>
                </div>
                <div className="text-3xl text-yellow-600">
                  <Star />
                </div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Search and Filters */}
            <div className="lg:col-span-2">
              <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6`}>
                <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Search & Filters
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search students..."
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
                      value={selectedStudent}
                      onChange={(e) => setSelectedStudent(e.target.value)}
                      className={`w-full px-3 py-3 border rounded-lg ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="all">All Students</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id.toString()}>
                          {student.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className={`w-full px-3 py-3 border rounded-lg ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="all">All Subjects</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                    </select>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6`}>
                <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button className={`w-full flex items-center px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  } transition-colors`}>
                    <Assignment className="mr-3 w-4 h-4" />
                    Assign Homework
                  </button>
                  <button className={`w-full flex items-center px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  } transition-colors`}>
                    <Quiz className="mr-3 w-4 h-4" />
                    Create Quiz
                  </button>
                  <button className={`w-full flex items-center px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  } transition-colors`}>
                    <BarChartIcon className="mr-3 w-4 h-4" />
                    View Analytics
                  </button>
                </div>
              </Card>
            </div>
          </div>

          {/* Student Progress Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <Card key={student.id} className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} overflow-hidden`}>
                <div className="p-6">
                  {/* Student Header */}
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gray-300 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {student.name}
                      </h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {student.subject}
                      </p>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {student.averageRating}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Overall Progress
                      </span>
                      <span className={`text-sm font-medium text-blue-600`}>
                        {student.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${student.progress}%` }}
                      ></div>
                    </div>
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {student.sessionsCompleted} sessions • Last: {student.lastSession}
                    </p>
                  </div>

                  {/* Learning Goals */}
                  <div className="mb-4">
                    <h4 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Learning Goals:
                    </h4>
                    <div className="space-y-2">
                      {student.goals.map((goal, index) => (
                        <div key={index}>
                          <div className="flex justify-between items-center mb-1">
                            <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                              {goal.topic}
                            </span>
                            <span className={`text-xs font-medium text-blue-600`}>
                              {goal.current}/{goal.target}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div
                              className="bg-green-500 h-1 rounded-full"
                              style={{ width: `${(goal.current / goal.target) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Strengths */}
                  <div className="mb-4">
                    <h4 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Strengths:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {student.strengths.map((strength, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                        >
                          {strength}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Areas for Improvement */}
                  <div className="mb-4">
                    <h4 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Areas for Improvement:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {student.weaknesses.map((weakness, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full"
                        >
                          {weakness}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button 
                      size="small" 
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Assignment className="w-4 h-4 mr-1" />
                      Assign
                    </Button>
                    <Button 
                      size="small" 
                      variant="outlined"
                      className="flex-1"
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

              {/* Mobile Progress Overview */}
              <div className="mb-8">
                <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  PROGRESS OVERVIEW
                </h3>
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Total Students:</span>
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {overallStats.totalStudents}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Avg Progress:</span>
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {overallStats.averageProgress}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Quick Actions */}
              <div className="space-y-2">
                <button 
                  onClick={() => {
                    navigate('/tutor/sessions')
                    setMobileOpen(false)
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Assignment className="mr-3 w-4 h-4" />
                  Manage Sessions
                </button>
                <button 
                  onClick={() => {
                    navigate('/tutor/availability')
                    setMobileOpen(false)
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Schedule className="mr-3 w-4 h-4" />
                  Set Availability
                </button>
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

export default TrackStudentProgress
