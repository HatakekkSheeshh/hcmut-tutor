import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { 
  Typography, 
  Button as MuiButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating
} from '@mui/material'
import { 
  VideoCall, 
  Chat, 
  Share, 
  Download, 
  Star,
  Schedule,
  Person,
  Menu as MenuIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'

const SessionDetail: React.FC = () => {
  const { id } = useParams()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  // Mock session data
  const session = {
    id: id,
    tutor: {
      name: 'Dr. Sarah Johnson',
      subject: 'Mathematics',
      rating: 4.9,
      image: '/api/placeholder/100/100',
      specialties: ['Calculus', 'Algebra', 'Statistics']
    },
    date: '2024-01-15',
    time: '10:00 AM - 11:00 AM',
    duration: '60 minutes',
    type: 'Online Video Call',
    status: 'upcoming',
    meetingLink: 'https://meet.example.com/session-123',
    materials: [
      { name: 'Calculus Chapter 5.pdf', type: 'PDF', size: '2.3 MB' },
      { name: 'Practice Problems.docx', type: 'Word', size: '1.1 MB' }
    ],
    notes: 'Focus on derivatives and integration techniques. Bring your calculator and notebook.',
    price: 50
  }

  const handleJoinSession = () => {
    setIsJoinDialogOpen(true)
  }

  const handleStartSession = () => {
    // In a real app, this would open the video call
    window.open(session.meetingLink, '_blank')
    setIsJoinDialogOpen(false)
  }

  const handleEndSession = () => {
    setIsFeedbackDialogOpen(true)
  }

  const handleSubmitFeedback = () => {
    // In a real app, this would submit feedback to the backend
    console.log('Feedback submitted:', { rating, feedback })
    setIsFeedbackDialogOpen(false)
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

            {/* Session Status */}
            <div className="mb-8">
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                SESSION STATUS
              </h3>
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {session.status === 'upcoming' ? 'Upcoming' : 'Active'}
                  </span>
                </div>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Session ID: {session.id}
                </p>
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
                  Book Another Session
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
        Session Details
            </h1>
            <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Session with {session.tutor.name} - {session.tutor.subject}
            </p>
          </div>

        {/* Session Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 mb-6`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Session Information
                  </h2>
                  <div className="flex space-x-2">
                <Button 
                  variant="contained" 
                  startIcon={<VideoCall />}
                  onClick={handleJoinSession}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Join Session
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<Chat />}
                >
                  Chat
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<Share />}
                >
                  Share
                </Button>
                  </div>
                </div>

                {/* Tutor Info */}
                <div className="flex items-center mb-6">
                  <Avatar src={session.tutor.image} name={session.tutor.name} size="large" />
                  <div className="ml-4">
                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {session.tutor.name}
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {session.tutor.subject}
                    </p>
                    <div className="flex items-center mt-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.floor(session.tutor.rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className={`text-sm ml-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {session.tutor.rating}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Session Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center">
                    <Schedule className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {session.date} at {session.time}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Duration: {session.duration}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Person className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {session.type}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Online Meeting
                      </p>
                    </div>
                  </div>
                </div>

                {/* Session Notes */}
                <div className="mb-6">
                  <h4 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Session Notes
                  </h4>
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {session.notes}
                  </p>
                </div>

                {/* Tutor Specialties */}
                <div>
                  <h4 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Tutor Specialties
                  </h4>
                  <div className="flex flex-wrap gap-2">
                {session.tutor.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
          </Card>
            </div>

            {/* Sidebar Content */}
            <div className="space-y-6">
        {/* Session Actions */}
              <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6`}>
                <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Session Actions
                </h3>
                <div className="space-y-3">
              <Button 
                fullWidth 
                variant="contained" 
                startIcon={<VideoCall />}
                onClick={handleJoinSession}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Join Video Call
              </Button>
              <Button 
                fullWidth 
                variant="outlined" 
                startIcon={<Chat />}
              >
                Send Message
              </Button>
              <Button 
                fullWidth 
                variant="outlined" 
                startIcon={<Download />}
              >
                Download Materials
              </Button>
              <Button 
                fullWidth 
                variant="outlined" 
                startIcon={<Star />}
                onClick={handleEndSession}
              >
                End Session & Rate
              </Button>
                </div>
          </Card>

              {/* Session Materials */}
              <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6`}>
                <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Session Materials
                </h3>
                <div className="space-y-3">
            {session.materials.map((material, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {material.name}
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {material.type} • {material.size}
                        </p>
                      </div>
                <Button size="small" variant="outlined">
                  Download
                </Button>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Session Info */}
              <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6`}>
                <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Session Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Status:</span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {session.status === 'upcoming' ? 'Upcoming' : 'Active'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Price:</span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      ${session.price}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Type:</span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {session.type}
                    </span>
                  </div>
                </div>
          </Card>
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

              {/* Mobile Session Status */}
              <div className="mb-8">
                <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  SESSION STATUS
                </h3>
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {session.status === 'upcoming' ? 'Upcoming' : 'Active'}
                    </span>
                  </div>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Session ID: {session.id}
                  </p>
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
                  Book Another Session
                </button>
                <button 
                  onClick={() => {
                    navigate('/student/progress')
                    setMobileOpen(false)
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <TrendingUpIcon className="mr-3 w-4 h-4" />
                  View Progress
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

      {/* Join Session Dialog */}
      <Dialog open={isJoinDialogOpen} onClose={() => setIsJoinDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Join Session</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            You are about to join the session with {session.tutor.name}.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Session: {session.tutor.subject} - {session.date} at {session.time}
          </Typography>
          <div className="mt-4">
            <TextField
              fullWidth
              label="Meeting Link"
              value={session.meetingLink}
              InputProps={{ readOnly: true }}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setIsJoinDialogOpen(false)}>Cancel</MuiButton>
          <MuiButton onClick={handleStartSession} variant="contained">
            Join Now
          </MuiButton>
        </DialogActions>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={isFeedbackDialogOpen} onClose={() => setIsFeedbackDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Rate Your Session</DialogTitle>
        <DialogContent>
          <div className="mt-4">
            <Typography variant="h6" gutterBottom>
              How would you rate this session?
            </Typography>
            <Rating
              value={rating}
              onChange={(_, newValue) => setRating(newValue || 0)}
              size="large"
            />
          </div>
          <div className="mt-4">
            <TextField
              fullWidth
              label="Additional Feedback"
              multiline
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your thoughts about the session..."
            />
          </div>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setIsFeedbackDialogOpen(false)}>Cancel</MuiButton>
          <MuiButton onClick={handleSubmitFeedback} variant="contained">
            Submit Feedback
          </MuiButton>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default SessionDetail
