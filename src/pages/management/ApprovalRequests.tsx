import React, { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button as MuiButton,
  Typography
} from '@mui/material'
import { 
  Search, 
  CheckCircle,
  Cancel,
  Schedule,
  Info,
  Menu as MenuIcon,
  ArrowBack as ArrowBackIcon,
  BarChart as BarChartIcon,
  Star as StarIcon
} from '@mui/icons-material'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const ApprovalRequests: React.FC = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [filterType, setFilterType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState('')
  const [reason, setReason] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const requests = [
    {
      id: 1,
      user: 'John Smith',
      type: 'Tutor Application',
      status: 'pending',
      date: '2024-01-15',
      time: '10:30 AM',
      priority: 'high',
      details: 'Applied for Mathematics tutoring position',
      documents: ['CV', 'Certificates', 'References']
    },
    {
      id: 2,
      user: 'Sarah Johnson',
      type: 'Credit Request',
      status: 'pending',
      date: '2024-01-15',
      time: '09:15 AM',
      priority: 'medium',
      details: 'Requesting 50 training credits for completed course',
      documents: ['Course Certificate', 'Completion Proof']
    },
    {
      id: 3,
      user: 'Mike Chen',
      type: 'Session Booking',
      status: 'pending',
      date: '2024-01-14',
      time: '2:45 PM',
      priority: 'high',
      details: 'Booking session with Dr. Wilson for Physics',
      documents: ['Student ID', 'Payment Proof']
    },
    {
      id: 4,
      user: 'Alice Brown',
      type: 'Account Verification',
      status: 'approved',
      date: '2024-01-13',
      time: '11:20 AM',
      priority: 'low',
      details: 'Email verification and profile completion',
      documents: ['Email Verification', 'Profile Photo']
    }
  ]

  const filteredRequests = requests.filter(request => {
    const matchesType = filterType === 'all' || request.type.toLowerCase().includes(filterType.toLowerCase())
    const matchesSearch = request.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         request.type.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
  })

  const handleAction = (request: any, type: string) => {
    setSelectedRequest(request)
    setActionType(type)
    setIsActionDialogOpen(true)
  }

  const handleSubmitAction = () => {
    console.log('Action submitted:', {
      request: selectedRequest,
      action: actionType,
      reason
    })
    setIsActionDialogOpen(false)
    setReason('')
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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

            {/* Request Stats */}
            <div className="mb-8">
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                REQUEST STATS
              </h3>
              <div className="space-y-3">
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Pending:</span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {requests.filter(r => r.status === 'pending').length}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Approved:</span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {requests.filter(r => r.status === 'approved').length}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Total:</span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {requests.length}
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
                  onClick={() => navigate('/management/reports')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <BarChartIcon className="mr-3 w-4 h-4" />
                  Reports
                </button>
                <button 
                  onClick={() => navigate('/management/awards')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <StarIcon className="mr-3 w-4 h-4" />
                  Award Credits
                </button>
                <button 
                  onClick={() => navigate('/management')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <ArrowBackIcon className="mr-3 w-4 h-4" />
                  Dashboard
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
                  Approval Requests
                </h1>
                <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Review and approve user requests
                </p>
              </div>
              <div className="flex space-x-2">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Bulk Approve
                </Button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Search and Filters */}
            <div className="lg:col-span-2">
              <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6`}>
                <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Search & Filters
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search requests..."
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
                      onChange={(e) => setFilterType(e.target.value)}
                      className={`w-full px-3 py-3 border rounded-lg ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="all">All Types</option>
                      <option value="tutor">Tutor Applications</option>
                      <option value="credit">Credit Requests</option>
                      <option value="session">Session Bookings</option>
                      <option value="verification">Account Verification</option>
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
                    <CheckCircle className="mr-3 w-4 h-4" />
                    Approve All Pending
                  </button>
                  <button className={`w-full flex items-center px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  } transition-colors`}>
                    <Cancel className="mr-3 w-4 h-4" />
                    Reject All Pending
                  </button>
                  <button className={`w-full flex items-center px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  } transition-colors`}>
                    <Info className="mr-3 w-4 h-4" />
                    Export Reports
                  </button>
                </div>
              </Card>
            </div>
          </div>

          {/* Requests List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRequests.map((request) => (
              <Card key={request.id} className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} overflow-hidden`}>
                <div className="p-6">
                  {/* Request Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                      <div>
                        <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {request.user}
                        </h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {request.type}
                        </p>
                        <div className="flex space-x-1 mt-1">
                          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(request.priority)}`}>
                            {request.priority}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Request Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center">
                      <Schedule className="w-4 h-4 text-gray-400 mr-2" />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {request.date} at {request.time}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Info className="w-4 h-4 text-gray-400 mr-2" />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {request.details}
                      </span>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="mb-4">
                    <h4 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Documents:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {request.documents.map((doc, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    {request.status === 'pending' ? (
                      <>
                        <Button 
                          size="small" 
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleAction(request, 'approve')}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="small" 
                          variant="outlined"
                          className="flex-1 border-red-500 text-red-500 hover:bg-red-50"
                          onClick={() => handleAction(request, 'reject')}
                        >
                          <Cancel className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    ) : (
                      <Button 
                        size="small" 
                        variant="outlined"
                        className="flex-1"
                      >
                        <Info className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    )}
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

              {/* Mobile Request Stats */}
              <div className="mb-8">
                <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  REQUEST STATS
                </h3>
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Pending:</span>
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {requests.filter(r => r.status === 'pending').length}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Approved:</span>
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {requests.filter(r => r.status === 'approved').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Quick Actions */}
              <div className="space-y-2">
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
                    navigate('/management/awards')
                    setMobileOpen(false)
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <StarIcon className="mr-3 w-4 h-4" />
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

      {/* Action Dialog */}
      <Dialog open={isActionDialogOpen} onClose={() => setIsActionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
        </DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-4">
            <div>
              <Typography variant="body1" gutterBottom>
                User: {selectedRequest?.user}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Type: {selectedRequest?.type}
              </Typography>
            </div>

            <div>
              <TextField
                fullWidth
                label="Response Message"
                multiline
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={
                  actionType === 'approve' 
                    ? 'Message to send to user about approval...'
                    : 'Reason for rejection...'
                }
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setIsActionDialogOpen(false)}>Cancel</MuiButton>
          <MuiButton 
            onClick={handleSubmitAction} 
            variant="contained"
            color={actionType === 'approve' ? 'success' : 'error'}
          >
            {actionType === 'approve' ? 'Approve' : 'Reject'}
          </MuiButton>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default ApprovalRequests
