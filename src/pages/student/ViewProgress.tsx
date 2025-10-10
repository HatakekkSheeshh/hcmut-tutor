import React, { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { 
  TrendingUp, 
  School, 
  Schedule, 
  Star,
  Assignment,
  Menu as MenuIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const ViewProgress: React.FC = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [timeRange, setTimeRange] = useState('3months')
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const progressData = {
    overallProgress: 85,
    subjects: [
      {
        name: 'Mathematics',
        progress: 90,
        sessionsCompleted: 12,
        averageRating: 4.8,
        lastSession: '2024-01-10',
        topics: ['Calculus', 'Algebra', 'Statistics']
      },
      {
        name: 'Physics',
        progress: 75,
        sessionsCompleted: 8,
        averageRating: 4.6,
        lastSession: '2024-01-08',
        topics: ['Mechanics', 'Thermodynamics', 'Quantum Physics']
      },
      {
        name: 'Chemistry',
        progress: 80,
        sessionsCompleted: 6,
        averageRating: 4.7,
        lastSession: '2024-01-05',
        topics: ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry']
      }
    ],
    achievements: [
      { title: 'First Session', description: 'Completed your first tutoring session', date: '2023-10-15', icon: <Star /> },
      { title: 'Math Master', description: 'Completed 10 Mathematics sessions', date: '2023-12-20', icon: <School /> },
      { title: 'Consistent Learner', description: 'Attended sessions for 3 consecutive months', date: '2024-01-01', icon: <TrendingUp /> },
      { title: 'Top Performer', description: 'Achieved 90%+ in Mathematics', date: '2024-01-10', icon: <Assignment /> }
    ],
    recentSessions: [
      {
        date: '2024-01-10',
        subject: 'Mathematics',
        tutor: 'Dr. Sarah Johnson',
        duration: '60 min',
        rating: 5,
        topic: 'Advanced Calculus'
      },
      {
        date: '2024-01-08',
        subject: 'Physics',
        tutor: 'Prof. Michael Chen',
        duration: '90 min',
        rating: 4,
        topic: 'Quantum Mechanics'
      },
      {
        date: '2024-01-05',
        subject: 'Chemistry',
        tutor: 'Dr. Emily Davis',
        duration: '60 min',
        rating: 5,
        topic: 'Organic Reactions'
      }
    ],
    goals: [
      { subject: 'Mathematics', target: 95, current: 90, deadline: '2024-02-15' },
      { subject: 'Physics', target: 85, current: 75, deadline: '2024-03-01' },
      { subject: 'Chemistry', target: 90, current: 80, deadline: '2024-02-28' }
    ]
  }

  const stats = [
    { title: 'Total Sessions', value: '26', icon: <Schedule />, color: 'primary' },
    { title: 'Average Rating', value: '4.7', icon: <Star />, color: 'secondary' },
    { title: 'Subjects Studied', value: '3', icon: <School />, color: 'success' },
    { title: 'Achievements', value: '4', icon: <TrendingUp />, color: 'info' },
  ]

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
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="text-center mb-3">
                  <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {progressData.overallProgress}%
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Overall Progress
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${progressData.overallProgress}%` }}
                  ></div>
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
                  onClick={() => navigate('/student/search')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <BarChartIcon className="mr-3 w-4 h-4" />
                  Find Tutors
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
                <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Learning Progress
                </h1>
                <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Track your learning journey and achievements
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
                  className={`px-3 py-2 border rounded-lg ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="1month">Last Month</option>
                  <option value="3months">Last 3 Months</option>
                  <option value="6months">Last 6 Months</option>
                  <option value="1year">Last Year</option>
                </select>
              </div>
            </div>
          </div>

      {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
              <Card key={index} className={`p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stat.value}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {stat.title}
                    </p>
                  </div>
                  <div className="text-3xl text-blue-600">{stat.icon}</div>
                </div>
            </Card>
        ))}
          </div>

          {/* Progress Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Overall Progress */}
            <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Overall Progress
              </h3>
              <div className="text-center mb-6">
                <div className={`text-4xl font-bold text-blue-600 mb-2`}>
                {progressData.overallProgress}%
                </div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Overall Learning Progress
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progressData.overallProgress}%` }}
                ></div>
              </div>
          </Card>

        {/* Subject Progress */}
            <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Subject Progress
              </h3>
              <div className="space-y-4">
            {progressData.subjects.map((subject, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {subject.name}
                      </span>
                      <span className="text-blue-600 font-semibold">
                    {subject.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${subject.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {subject.sessionsCompleted} sessions
                      </span>
                      <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Avg: {subject.averageRating}★
                      </span>
                    </div>
                  </div>
                ))}
              </div>
          </Card>
          </div>

          {/* Goals and Recent Sessions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Learning Goals */}
            <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Learning Goals
              </h3>
              <div className="space-y-4">
            {progressData.goals.map((goal, index) => (
                  <div key={index} className={`p-4 border rounded-lg ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {goal.subject}
                      </span>
                      <span className="text-blue-600 font-semibold">
                    {goal.current}/{goal.target}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(goal.current / goal.target) * 100}%` }}
                      ></div>
                    </div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Target: {goal.target}% by {goal.deadline}
                    </p>
                  </div>
            ))}
              </div>
          </Card>

        {/* Recent Sessions */}
            <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Recent Sessions
                </h3>
                <Button size="small" variant="outlined">
                View All
              </Button>
              </div>
              <div className="space-y-4">
            {progressData.recentSessions.map((session, index) => (
                  <div key={index} className={`p-4 border rounded-lg ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {session.subject}
                      </span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {session.rating}
                        </span>
                      </div>
                    </div>
                    <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {session.tutor} • {session.topic}
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  {session.date} • {session.duration}
                    </p>
                  </div>
            ))}
              </div>
          </Card>
          </div>

        {/* Achievements */}
          <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6`}>
            <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Achievements
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {progressData.achievements.map((achievement, index) => (
                <div key={index} className={`text-center p-4 border rounded-lg ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                  <div className="text-blue-600 mb-3">
                        {achievement.icon}
                  </div>
                  <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {achievement.title}
                  </h4>
                  <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {achievement.description}
                  </p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                        {achievement.date}
                  </p>
                </div>
              ))}
            </div>
          </Card>
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
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="text-center mb-3">
                    <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {progressData.overallProgress}%
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Overall Progress
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${progressData.overallProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Mobile Quick Actions */}
              <div className="space-y-2">
                <button 
                  onClick={() => {
                    navigate('/student/book')
                    setMobileOpen(false)
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <CheckCircleIcon className="mr-3 w-4 h-4" />
                  Book Session
                </button>
                <button 
                  onClick={() => {
                    navigate('/student/search')
                    setMobileOpen(false)
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <BarChartIcon className="mr-3 w-4 h-4" />
                  Find Tutors
                </button>
                <button 
                  onClick={() => {
                    navigate('/student')
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

export default ViewProgress
