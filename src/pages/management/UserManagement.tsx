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
  Tabs,
  Tab,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material'
import { 
  Search, 
  Person,
  Menu as MenuIcon,
  ArrowBack as ArrowBackIcon,
  People as PeopleIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  History as HistoryIcon,
  Security as SecurityIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon
} from '@mui/icons-material'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import api from '../../lib/api'

interface User {
  id: string
  name: string
  email: string
  hcmutId: string
  role: 'student' | 'tutor' | 'management'
  avatar?: string
  permissions: string[]
  createdAt: string
  updatedAt: string
  phone?: string
  department?: string
  // Student fields
  major?: string
  year?: number
  interests?: string[]
  preferredSubjects?: string[]
  trainingCredits?: number
  // Tutor fields
  subjects?: string[]
  bio?: string
  rating?: number
  totalSessions?: number
  availability?: string[]
  verified?: boolean
  credentials?: string[]
}

interface UserPermissions {
  user: {
    id: string
    name: string
    email: string
    hcmutId: string
    role: string
    avatar?: string
  }
  permissions: string[]
  auditLogs: Array<{
    id: string
    userId: string
    action: 'grant' | 'revoke' | 'update'
    permissions: string[]
    previousPermissions?: string[]
    actorId: string
    reason?: string
    temporary?: boolean
    expiresAt?: string
    createdAt: string
    actor?: {
      id: string
      name: string
      email: string
    }
  }>
}

const UserManagement: React.FC = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileTab, setProfileTab] = useState(0) // 0: Overview, 1: Activity/Permissions (for profile dialog)

  // Data state
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Filters
  const [filters, setFilters] = useState({
    role: '' as '' | 'student' | 'tutor' | 'management',
    search: ''
  })

  // Pagination
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  // Selected user
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userDetail, setUserDetail] = useState<User | null>(null)
  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null)
  const [loadingPermissions, setLoadingPermissions] = useState(false)
  const [loadingUserDetail, setLoadingUserDetail] = useState(false)
  const [userSessions, setUserSessions] = useState<any[]>([])
  const [userClasses, setUserClasses] = useState<any[]>([])
  const [loadingUserActivity, setLoadingUserActivity] = useState(false)

  // Dialogs
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false)
  const [isUpdatePermissionsDialogOpen, setIsUpdatePermissionsDialogOpen] = useState(false)
  const [isRevokePermissionsDialogOpen, setIsRevokePermissionsDialogOpen] = useState(false)
  const [isTemporaryPermissionsDialogOpen, setIsTemporaryPermissionsDialogOpen] = useState(false)

  // Permission management state
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [permissionReason, setPermissionReason] = useState('')
  const [temporaryExpiresAt, setTemporaryExpiresAt] = useState('')
  const [updating, setUpdating] = useState(false)

  // Available permissions
  const availablePermissions = [
    'view_analytics',
    'manage_users',
    'approve_requests',
    'view_reports',
    'award_credits',
    'manage_community'
  ]

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  // Load users
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      setErrorMessage(null)

      const params: any = {
        page,
        limit
      }
      if (filters.role) {
        params.role = filters.role
      }
      if (filters.search) {
        params.search = filters.search
      }

      const response = await api.management.permissions.listUsers(params)
      if (response && response.success && response.data) {
        if (response.data.data && Array.isArray(response.data.data)) {
          setUsers(response.data.data)
          if (response.data.pagination) {
            setPagination(response.data.pagination)
          }
        } else if (Array.isArray(response.data)) {
          setUsers(response.data)
        } else {
          setUsers([])
        }
      } else if (response && Array.isArray(response.data)) {
        setUsers(response.data)
      } else {
        setUsers([])
        setErrorMessage('Không thể tải danh sách người dùng')
      }
    } catch (error: any) {
      console.error('Error loading users:', error)
      setErrorMessage('Lỗi tải danh sách người dùng: ' + (error.message || 'Unknown error'))
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [filters, page, limit])

  // Load user permissions
  const loadUserPermissions = useCallback(async (userId: string) => {
    try {
      setLoadingPermissions(true)
      setErrorMessage(null)

      const response = await api.management.permissions.getUserPermissions(userId)
      if (response && response.success && response.data) {
        setUserPermissions(response.data)
      } else {
        setErrorMessage('Không thể tải thông tin quyền của người dùng')
      }
    } catch (error: any) {
      console.error('Error loading user permissions:', error)
      setErrorMessage('Lỗi tải thông tin quyền: ' + (error.message || 'Unknown error'))
    } finally {
      setLoadingPermissions(false)
    }
  }, [])

  // Load user detail
  const loadUserDetail = useCallback(async (userId: string) => {
    try {
      setLoadingUserDetail(true)
      setErrorMessage(null)

      const response = await api.users.get(userId)
      if (response && response.success && response.data) {
        setUserDetail(response.data)
      } else {
        setErrorMessage('Không thể tải thông tin chi tiết người dùng')
      }
    } catch (error: any) {
      console.error('Error loading user detail:', error)
      setErrorMessage('Lỗi tải thông tin chi tiết: ' + (error.message || 'Unknown error'))
    } finally {
      setLoadingUserDetail(false)
    }
  }, [])

  // Load user activity (sessions, classes)
  const loadUserActivity = useCallback(async (userId: string, role: string) => {
    try {
      setLoadingUserActivity(true)
      setErrorMessage(null)

      if (role === 'student') {
        // Load student sessions and classes
        const [sessionsResponse, enrollmentsResponse] = await Promise.all([
          api.sessions.list({ studentId: userId, limit: 100 }),
          api.enrollments.list({ studentId: userId, limit: 100 })
        ])

        if (sessionsResponse && sessionsResponse.data && Array.isArray(sessionsResponse.data)) {
          setUserSessions(sessionsResponse.data)
        }

        if (enrollmentsResponse && enrollmentsResponse.success && enrollmentsResponse.data && Array.isArray(enrollmentsResponse.data)) {
          // Load class details for each enrollment
          const classPromises = enrollmentsResponse.data.map(async (enrollment: any) => {
            try {
              const classResponse = await api.classes.get(enrollment.classId)
              if (classResponse && classResponse.success && classResponse.data) {
                return classResponse.data
              }
            } catch (err) {
              console.error(`Failed to load class ${enrollment.classId}:`, err)
            }
            return null
          })
          const classResults = await Promise.all(classPromises)
          setUserClasses(classResults.filter(c => c !== null))
        }
      } else if (role === 'tutor') {
        // Load tutor sessions and classes
        const [sessionsResponse, classesResponse] = await Promise.all([
          api.sessions.list({ tutorId: userId, limit: 100 }),
          api.classes.list({ tutorId: userId, limit: 100 })
        ])

        if (sessionsResponse && sessionsResponse.data && Array.isArray(sessionsResponse.data)) {
          setUserSessions(sessionsResponse.data)
        }

        if (classesResponse && classesResponse.success && classesResponse.data && Array.isArray(classesResponse.data)) {
          setUserClasses(classesResponse.data)
        }
      }
    } catch (error: any) {
      console.error('Error loading user activity:', error)
      setErrorMessage('Lỗi tải thông tin hoạt động: ' + (error.message || 'Unknown error'))
    } finally {
      setLoadingUserActivity(false)
    }
  }, [])

  // Load users on mount and when filters change
  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  // Update filters when search term changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm }))
      setPage(1) // Reset to first page when search changes
    }, 500) // Debounce search

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Handle view user details
  const handleViewUser = async (user: User) => {
    setSelectedUser(user)
    setUserDetail(null)
    setUserSessions([])
    setUserClasses([])
    setProfileTab(0) // Reset to Overview tab
    setIsViewDialogOpen(true)
    
    // Load full user detail
    await loadUserDetail(user.id)
    
    // Load permissions for management users
    if (user.role === 'management') {
      await loadUserPermissions(user.id)
    }
    
    // Load activity (sessions, classes) for students and tutors
    if (user.role === 'student' || user.role === 'tutor') {
      await loadUserActivity(user.id, user.role)
    }
  }

  // Handle edit permissions
  const handleEditPermissions = async (user: User) => {
    if (user.role !== 'management') {
      setErrorMessage('Chỉ người dùng management mới có thể có permissions')
      return
    }
    setSelectedUser(user)
    setSelectedPermissions(user.permissions || [])
    setPermissionReason('')
    setIsUpdatePermissionsDialogOpen(true)
    await loadUserPermissions(user.id)
  }

  // Handle revoke permissions
  const handleRevokePermissions = async (user: User) => {
    if (user.role !== 'management') {
      setErrorMessage('Chỉ người dùng management mới có thể có permissions')
      return
    }
    setSelectedUser(user)
    setSelectedPermissions([])
    setPermissionReason('')
    setIsRevokePermissionsDialogOpen(true)
    await loadUserPermissions(user.id)
  }

  // Handle grant temporary permissions
  const handleGrantTemporaryPermissions = async (user: User) => {
    if (user.role !== 'management') {
      setErrorMessage('Chỉ người dùng management mới có thể có permissions')
      return
    }
    setSelectedUser(user)
    setSelectedPermissions([])
    setPermissionReason('')
    setTemporaryExpiresAt('')
    setIsTemporaryPermissionsDialogOpen(true)
    await loadUserPermissions(user.id)
  }

  // Handle update permissions
  const handleUpdatePermissions = async () => {
    if (!selectedUser) {
      setErrorMessage('Không tìm thấy người dùng')
      return
    }
    if (!permissionReason || permissionReason.trim().length < 10) {
      setErrorMessage('Vui lòng nhập lý do cập nhật (ít nhất 10 ký tự)')
      return
    }

    try {
      setUpdating(true)
      setErrorMessage(null)
      setSuccessMessage(null)

      const response = await api.management.permissions.updateUserPermissions(selectedUser.id, {
        permissions: selectedPermissions,
        reason: permissionReason.trim()
      })

      if (response && response.success) {
        setSuccessMessage('Cập nhật quyền thành công')
        setIsUpdatePermissionsDialogOpen(false)
        setPermissionReason('')
        setSelectedPermissions([])
        await loadUsers()
        if (selectedUser) {
          await loadUserPermissions(selectedUser.id)
        }
      } else {
        setErrorMessage(response?.error || 'Lỗi cập nhật quyền')
      }
    } catch (error: any) {
      console.error('Error updating permissions:', error)
      setErrorMessage('Lỗi cập nhật quyền: ' + (error.message || 'Unknown error'))
    } finally {
      setUpdating(false)
    }
  }

  // Handle revoke permissions
  const handleRevokePermissionsSubmit = async () => {
    if (!selectedUser) {
      setErrorMessage('Không tìm thấy người dùng')
      return
    }
    if (selectedPermissions.length === 0) {
      setErrorMessage('Vui lòng chọn ít nhất một quyền để thu hồi')
      return
    }
    if (!permissionReason || permissionReason.trim().length < 10) {
      setErrorMessage('Vui lòng nhập lý do thu hồi (ít nhất 10 ký tự)')
      return
    }

    try {
      setUpdating(true)
      setErrorMessage(null)
      setSuccessMessage(null)

      const response = await api.management.permissions.revokePermissions(selectedUser.id, {
        permissions: selectedPermissions,
        reason: permissionReason.trim()
      })

      if (response && response.success) {
        setSuccessMessage('Thu hồi quyền thành công')
        setIsRevokePermissionsDialogOpen(false)
        setPermissionReason('')
        setSelectedPermissions([])
        await loadUsers()
        if (selectedUser) {
          await loadUserPermissions(selectedUser.id)
        }
      } else {
        setErrorMessage(response?.error || 'Lỗi thu hồi quyền')
      }
    } catch (error: any) {
      console.error('Error revoking permissions:', error)
      setErrorMessage('Lỗi thu hồi quyền: ' + (error.message || 'Unknown error'))
    } finally {
      setUpdating(false)
    }
  }

  // Handle grant temporary permissions
  const handleGrantTemporaryPermissionsSubmit = async () => {
    if (!selectedUser) {
      setErrorMessage('Không tìm thấy người dùng')
      return
    }
    if (selectedPermissions.length === 0) {
      setErrorMessage('Vui lòng chọn ít nhất một quyền để cấp')
      return
    }
    if (!temporaryExpiresAt) {
      setErrorMessage('Vui lòng chọn ngày hết hạn')
      return
    }
    if (!permissionReason || permissionReason.trim().length < 10) {
      setErrorMessage('Vui lòng nhập lý do cấp quyền (ít nhất 10 ký tự)')
      return
    }

    try {
      setUpdating(true)
      setErrorMessage(null)
      setSuccessMessage(null)

      const response = await api.management.permissions.grantTemporaryPermissions(selectedUser.id, {
        permissions: selectedPermissions,
        expiresAt: temporaryExpiresAt,
        reason: permissionReason.trim()
      })

      if (response && response.success) {
        setSuccessMessage('Cấp quyền tạm thời thành công')
        setIsTemporaryPermissionsDialogOpen(false)
        setPermissionReason('')
        setTemporaryExpiresAt('')
        setSelectedPermissions([])
        await loadUsers()
        if (selectedUser) {
          await loadUserPermissions(selectedUser.id)
        }
      } else {
        setErrorMessage(response?.error || 'Lỗi cấp quyền tạm thời')
      }
    } catch (error: any) {
      console.error('Error granting temporary permissions:', error)
      setErrorMessage('Lỗi cấp quyền tạm thời: ' + (error.message || 'Unknown error'))
    } finally {
      setUpdating(false)
    }
  }

  // Toggle permission selection
  const handleTogglePermission = (permission: string) => {
    if (selectedPermissions.includes(permission)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== permission))
    } else {
      setSelectedPermissions([...selectedPermissions, permission])
    }
  }

  // Get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'student': return 'primary'
      case 'tutor': return 'success'
      case 'management': return 'warning'
      default: return 'default'
    }
  }

  // Get role label
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'student': return 'Học sinh'
      case 'tutor': return 'Gia sư'
      case 'management': return 'Quản lý'
      default: return role
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

  // Statistics state
  const [statistics, setStatistics] = useState({
    total: 0,
    students: 0,
    tutors: 0,
    management: 0
  })

  // Load statistics
  const loadStatistics = useCallback(async () => {
    try {
      // Load all users to calculate statistics
      const response = await api.management.permissions.listUsers({ limit: 10000 })
      if (response && response.success && response.data) {
        let allUsers: User[] = []
        if (response.data.data && Array.isArray(response.data.data)) {
          allUsers = response.data.data
        } else if (Array.isArray(response.data)) {
          allUsers = response.data
        }

        setStatistics({
          total: allUsers.length,
          students: allUsers.filter(u => u.role === 'student').length,
          tutors: allUsers.filter(u => u.role === 'tutor').length,
          management: allUsers.filter(u => u.role === 'management').length
        })
      }
    } catch (error: any) {
      console.error('Error loading statistics:', error)
    }
  }, [])

  // Load statistics on mount
  useEffect(() => {
    loadStatistics()
  }, [loadStatistics])

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

            {/* User Statistics */}
            <div className="mb-8">
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                USER STATISTICS
              </h3>
              <div className="space-y-3">
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Total Users:</span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {statistics.total}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Students:</span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {statistics.students}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Tutors:</span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {statistics.tutors}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Management:</span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {statistics.management}
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
                  User Management
                </h1>
                <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Manage users and their permissions
                </p>
              </div>
              <div className="flex space-x-2">
                <MuiButton
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={loadUsers}
                  disabled={loading}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Role Filter */}
              <FormControl fullWidth>
                <InputLabel sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                  Role
                </InputLabel>
                <Select
                  value={filters.role}
                  onChange={(e) => {
                    setFilters({ ...filters, role: e.target.value as any })
                    setPage(1)
                  }}
                  sx={{
                    color: theme === 'dark' ? '#ffffff' : '#111827',
                    backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db'
                    }
                  }}
                >
                  <MenuItem value="">All Roles</MenuItem>
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="tutor">Tutor</MenuItem>
                  <MenuItem value="management">Management</MenuItem>
                </Select>
              </FormControl>

              {/* Search */}
              <TextField
                fullWidth
                placeholder="Search by name, email, or HCMUT ID..."
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
                Đang tải danh sách người dùng...
              </p>
            </div>
          )}

          {/* Users Table */}
          {!loading && users.length > 0 && (
            <Card
              className={`p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
              style={{
                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                boxShadow: 'none !important'
              }}
            >
              <Typography variant="h6" sx={{ mb: 3, color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                Users ({pagination.total})
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: theme === 'dark' ? '#ffffff' : '#111827', fontWeight: 600 }}>
                        User
                      </TableCell>
                      <TableCell sx={{ color: theme === 'dark' ? '#ffffff' : '#111827', fontWeight: 600 }}>
                        Role
                      </TableCell>
                      <TableCell sx={{ color: theme === 'dark' ? '#ffffff' : '#111827', fontWeight: 600 }}>
                        HCMUT ID
                      </TableCell>
                      <TableCell sx={{ color: theme === 'dark' ? '#ffffff' : '#111827', fontWeight: 600 }}>
                        Permissions
                      </TableCell>
                      <TableCell sx={{ color: theme === 'dark' ? '#ffffff' : '#111827', fontWeight: 600 }}>
                        Created At
                      </TableCell>
                      <TableCell sx={{ color: theme === 'dark' ? '#ffffff' : '#111827', fontWeight: 600 }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <Avatar
                              sx={{
                                width: 40,
                                height: 40,
                                bgcolor: getAvatarColor(user.name),
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                mr: 2
                              }}
                              src={user.avatar}
                            >
                              {getInitials(user.name)}
                            </Avatar>
                            <div>
                              <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ffffff' : '#111827', fontWeight: 500 }}>
                                {user.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                                {user.email}
                              </Typography>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getRoleLabel(user.role)}
                            size="small"
                            color={getRoleColor(user.role) as any}
                            sx={{
                              fontSize: '0.75rem',
                              height: '24px'
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                          {user.hcmutId}
                        </TableCell>
                        <TableCell>
                          {user.role === 'management' && user.permissions && user.permissions.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {user.permissions.slice(0, 2).map((permission) => (
                                <Chip
                                  key={permission}
                                  label={permission.replace(/_/g, ' ')}
                                  size="small"
                                  sx={{
                                    fontSize: '0.7rem',
                                    height: '20px',
                                    backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                                    color: theme === 'dark' ? '#ffffff' : '#111827'
                                  }}
                                />
                              ))}
                              {user.permissions.length > 2 && (
                                <Chip
                                  label={`+${user.permissions.length - 2}`}
                                  size="small"
                                  sx={{
                                    fontSize: '0.7rem',
                                    height: '20px',
                                    backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                                    color: theme === 'dark' ? '#ffffff' : '#111827'
                                  }}
                                />
                              )}
                            </div>
                          ) : (
                            <Typography variant="body2" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                              N/A
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                          {new Date(user.createdAt).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleViewUser(user)}
                                sx={{
                                  color: theme === 'dark' ? '#ffffff' : '#111827',
                                  '&:hover': {
                                    backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6'
                                  }
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {user.role === 'management' && (
                              <>
                                <Tooltip title="Edit Permissions">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEditPermissions(user)}
                                    sx={{
                                      color: theme === 'dark' ? '#ffffff' : '#111827',
                                      '&:hover': {
                                        backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6'
                                      }
                                    }}
                                  >
                                    <SecurityIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <Typography variant="body2" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                    Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                  </Typography>
                  <div className="flex space-x-2">
                    <MuiButton
                      size="small"
                      onClick={() => setPage(prev => Math.max(1, prev - 1))}
                      disabled={page === 1}
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
                      onClick={() => setPage(prev => Math.min(pagination.totalPages, prev + 1))}
                      disabled={page === pagination.totalPages}
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
          {!loading && users.length === 0 && (
            <Card 
              className={`p-8 border text-center ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
              style={{
                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                boxShadow: 'none !important'
              }}
            >
              <PeopleIcon className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
              <Typography variant="h6" sx={{ mb: 2, color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                Không có người dùng
              </Typography>
              <Typography variant="body2" sx={{ mb: 4, color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                Thử thay đổi filters hoặc tìm kiếm với từ khóa khác
              </Typography>
            </Card>
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

              {/* Mobile User Statistics */}
              <div className="mb-8">
                <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  USER STATISTICS
                </h3>
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Total Users:</span>
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {statistics.total}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Students:</span>
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {statistics.students}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Tutors:</span>
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {statistics.tutors}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Management:</span>
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {statistics.management}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Quick Actions */}
              <div className="space-y-2">
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

      {/* View User Dialog - Full Profile */}
      <Dialog 
        open={isViewDialogOpen} 
        onClose={() => setIsViewDialogOpen(false)} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            color: theme === 'dark' ? '#ffffff' : '#111827',
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            borderBottom: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb'
          }}
        >
          <div className="flex items-center justify-between">
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              User Profile
            </Typography>
            {loadingUserDetail && (
              <LinearProgress sx={{ width: 100, height: 4, borderRadius: 2 }} />
            )}
          </div>
        </DialogTitle>
        <DialogContent 
          sx={{ 
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            padding: 0
          }}
        >
          {selectedUser && (
            <div>
              {/* User Header */}
              <div className={`p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center space-x-4">
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: getAvatarColor(selectedUser.name),
                      fontSize: '2rem',
                      fontWeight: 'bold'
                    }}
                    src={userDetail?.avatar || selectedUser.avatar}
                  >
                    {getInitials(userDetail?.name || selectedUser.name)}
                  </Avatar>
                  <div className="flex-1">
                    <Typography variant="h5" sx={{ color: theme === 'dark' ? '#ffffff' : '#111827', fontWeight: 600, mb: 1 }}>
                      {userDetail?.name || selectedUser.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280', mb: 1 }}>
                      {userDetail?.email || selectedUser.email}
                    </Typography>
                    <div className="flex items-center space-x-2 mt-2">
                      <Chip
                        label={getRoleLabel(userDetail?.role || selectedUser.role)}
                        size="small"
                        color={getRoleColor(userDetail?.role || selectedUser.role) as any}
                        sx={{
                          fontSize: '0.75rem',
                          height: '24px'
                        }}
                      />
                      {userDetail?.role === 'tutor' && userDetail?.verified && (
                        <Chip
                          label="Verified"
                          size="small"
                          color="success"
                          sx={{
                            fontSize: '0.75rem',
                            height: '24px'
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
                <Tabs
                  value={profileTab}
                  onChange={(e, newValue) => setProfileTab(newValue)}
                  sx={{
                    '& .MuiTab-root': {
                      color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                      '&.Mui-selected': {
                        color: theme === 'dark' ? '#ffffff' : '#111827'
                      }
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: theme === 'dark' ? '#3b82f6' : '#3b82f6'
                    }
                  }}
                >
                  <Tab label="Overview" />
                  {(selectedUser.role === 'student' || selectedUser.role === 'tutor') && (
                    <Tab label="Activity" />
                  )}
                  {selectedUser.role === 'management' && (
                    <Tab label="Permissions" />
                  )}
                </Tabs>
              </Box>

              {/* Tab Content */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {profileTab === 0 && (
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div>
                      <Typography variant="h6" sx={{ mb: 3, color: theme === 'dark' ? '#ffffff' : '#111827', fontWeight: 600 }}>
                        Basic Information
                      </Typography>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Typography variant="body2" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280', mb: 1 }}>
                            HCMUT ID:
                          </Typography>
                          <Typography variant="body1" sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                            {userDetail?.hcmutId || selectedUser.hcmutId}
                          </Typography>
                        </div>
                        {userDetail?.phone || selectedUser.phone ? (
                          <div>
                            <Typography variant="body2" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280', mb: 1 }}>
                              Phone:
                            </Typography>
                            <Typography variant="body1" sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                              {userDetail?.phone || selectedUser.phone}
                            </Typography>
                          </div>
                        ) : null}
                        {(userDetail?.department || selectedUser.department) && (
                          <div>
                            <Typography variant="body2" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280', mb: 1 }}>
                              Department:
                            </Typography>
                            <Typography variant="body1" sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                              {userDetail?.department || selectedUser.department}
                            </Typography>
                          </div>
                        )}
                        <div>
                          <Typography variant="body2" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280', mb: 1 }}>
                            Created At:
                          </Typography>
                          <Typography variant="body1" sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                            {new Date(userDetail?.createdAt || selectedUser.createdAt).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                        </div>
                        <div>
                          <Typography variant="body2" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280', mb: 1 }}>
                            Updated At:
                          </Typography>
                          <Typography variant="body1" sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                            {new Date(userDetail?.updatedAt || selectedUser.updatedAt).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                        </div>
                      </div>
                    </div>

                    <Divider sx={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }} />

                    {/* Role-Specific Information */}
                    {selectedUser.role === 'student' && userDetail && (
                      <div>
                        <Typography variant="h6" sx={{ mb: 3, color: theme === 'dark' ? '#ffffff' : '#111827', fontWeight: 600 }}>
                          Student Information
                        </Typography>
                        <div className="grid grid-cols-2 gap-4">
                          {userDetail.major && (
                            <div>
                              <Typography variant="body2" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280', mb: 1 }}>
                                Major:
                              </Typography>
                              <Typography variant="body1" sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                                {userDetail.major}
                              </Typography>
                            </div>
                          )}
                          {userDetail.year && (
                            <div>
                              <Typography variant="body2" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280', mb: 1 }}>
                                Year:
                              </Typography>
                              <Typography variant="body1" sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                                {userDetail.year}
                              </Typography>
                            </div>
                          )}
                          {userDetail.trainingCredits !== undefined && (
                            <div>
                              <Typography variant="body2" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280', mb: 1 }}>
                                Training Credits:
                              </Typography>
                              <Typography variant="body1" sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                                {userDetail.trainingCredits}
                              </Typography>
                            </div>
                          )}
                        </div>
                        {userDetail.interests && userDetail.interests.length > 0 && (
                          <div className="mt-4">
                            <Typography variant="body2" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280', mb: 1 }}>
                              Interests:
                            </Typography>
                            <div className="flex flex-wrap gap-2">
                              {userDetail.interests.map((interest, index) => (
                                <Chip
                                  key={index}
                                  label={interest}
                                  size="small"
                                  sx={{
                                    fontSize: '0.75rem',
                                    backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                                    color: theme === 'dark' ? '#ffffff' : '#111827'
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        {userDetail.preferredSubjects && userDetail.preferredSubjects.length > 0 && (
                          <div className="mt-4">
                            <Typography variant="body2" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280', mb: 1 }}>
                              Preferred Subjects:
                            </Typography>
                            <div className="flex flex-wrap gap-2">
                              {userDetail.preferredSubjects.map((subject, index) => (
                                <Chip
                                  key={index}
                                  label={subject}
                                  size="small"
                                  color="primary"
                                  sx={{
                                    fontSize: '0.75rem'
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedUser.role === 'tutor' && userDetail && (
                      <div>
                        <Typography variant="h6" sx={{ mb: 3, color: theme === 'dark' ? '#ffffff' : '#111827', fontWeight: 600 }}>
                          Tutor Information
                        </Typography>
                        <div className="grid grid-cols-2 gap-4">
                          {userDetail.rating !== undefined && (
                            <div>
                              <Typography variant="body2" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280', mb: 1 }}>
                                Rating:
                              </Typography>
                              <Typography variant="body1" sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                                {userDetail.rating.toFixed(1)} / 5.0
                              </Typography>
                            </div>
                          )}
                          {userDetail.totalSessions !== undefined && (
                            <div>
                              <Typography variant="body2" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280', mb: 1 }}>
                                Total Sessions:
                              </Typography>
                              <Typography variant="body1" sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                                {userDetail.totalSessions}
                              </Typography>
                            </div>
                          )}
                        </div>
                        {userDetail.bio && (
                          <div className="mt-4">
                            <Typography variant="body2" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280', mb: 1 }}>
                              Bio:
                            </Typography>
                            <Typography variant="body1" sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                              {userDetail.bio}
                            </Typography>
                          </div>
                        )}
                        {userDetail.subjects && userDetail.subjects.length > 0 && (
                          <div className="mt-4">
                            <Typography variant="body2" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280', mb: 1 }}>
                              Subjects:
                            </Typography>
                            <div className="flex flex-wrap gap-2">
                              {userDetail.subjects.map((subject, index) => (
                                <Chip
                                  key={index}
                                  label={subject}
                                  size="small"
                                  color="primary"
                                  sx={{
                                    fontSize: '0.75rem'
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        {userDetail.credentials && userDetail.credentials.length > 0 && (
                          <div className="mt-4">
                            <Typography variant="body2" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280', mb: 1 }}>
                              Credentials:
                            </Typography>
                            <div className="flex flex-wrap gap-2">
                              {userDetail.credentials.map((credential, index) => (
                                <Chip
                                  key={index}
                                  label={credential}
                                  size="small"
                                  sx={{
                                    fontSize: '0.75rem',
                                    backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                                    color: theme === 'dark' ? '#ffffff' : '#111827'
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        {userDetail.availability && userDetail.availability.length > 0 && (
                          <div className="mt-4">
                            <Typography variant="body2" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280', mb: 1 }}>
                              Availability:
                            </Typography>
                            <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                              {userDetail.availability.join(', ')}
                            </Typography>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedUser.role === 'management' && userDetail && (
                      <div>
                        <Typography variant="h6" sx={{ mb: 3, color: theme === 'dark' ? '#ffffff' : '#111827', fontWeight: 600 }}>
                          Management Information
                        </Typography>
                        {userDetail.department && (
                          <div>
                            <Typography variant="body2" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280', mb: 1 }}>
                              Department:
                            </Typography>
                            <Typography variant="body1" sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                              {userDetail.department}
                            </Typography>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Activity Tab - for Students and Tutors */}
                {profileTab === 1 && (selectedUser.role === 'student' || selectedUser.role === 'tutor') && (
                  <div className="space-y-6">
                    {loadingUserActivity ? (
                      <LinearProgress />
                    ) : (
                      <>
                        {/* Sessions */}
                        <div>
                          <Typography variant="h6" sx={{ mb: 3, color: theme === 'dark' ? '#ffffff' : '#111827', fontWeight: 600 }}>
                            Sessions ({userSessions.length})
                          </Typography>
                          {userSessions.length > 0 ? (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {userSessions.slice(0, 10).map((session) => (
                                <div
                                  key={session.id}
                                  className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                                >
                                  <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ffffff' : '#111827', fontWeight: 500 }}>
                                    {session.subject}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                                    {new Date(session.startTime).toLocaleDateString('vi-VN')} - {session.status}
                                  </Typography>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <Typography variant="body2" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                              No sessions found
                            </Typography>
                          )}
                        </div>

                        {/* Classes */}
                        <div>
                          <Typography variant="h6" sx={{ mb: 3, color: theme === 'dark' ? '#ffffff' : '#111827', fontWeight: 600 }}>
                            Classes ({userClasses.length})
                          </Typography>
                          {userClasses.length > 0 ? (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {userClasses.slice(0, 10).map((classItem) => (
                                <div
                                  key={classItem.id}
                                  className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                                >
                                  <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ffffff' : '#111827', fontWeight: 500 }}>
                                    {classItem.code} - {classItem.subject}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                                    {classItem.day} {classItem.startTime} - {classItem.endTime}
                                  </Typography>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <Typography variant="body2" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                              No classes found
                            </Typography>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Permissions Tab - for Management */}
                {profileTab === 1 && selectedUser.role === 'management' && (
                  <div className="space-y-6">
                    <div>
                      <Typography variant="h6" sx={{ mb: 3, color: theme === 'dark' ? '#ffffff' : '#111827', fontWeight: 600 }}>
                        Permissions
                      </Typography>
                      {loadingPermissions ? (
                        <LinearProgress className="mb-4" />
                      ) : userPermissions && userPermissions.permissions.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {userPermissions.permissions.map((permission) => (
                            <Chip
                              key={permission}
                              label={permission.replace(/_/g, ' ')}
                              size="small"
                              sx={{
                                fontSize: '0.75rem',
                                height: '28px',
                                backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                                color: theme === 'dark' ? '#ffffff' : '#111827'
                              }}
                            />
                          ))}
                        </div>
                      ) : (
                        <Typography variant="body2" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280', mb: 4 }}>
                          No permissions assigned
                        </Typography>
                      )}

                      {/* Action Buttons */}
                      <div className="flex space-x-2 mt-4">
                        <MuiButton
                          variant="outlined"
                          size="small"
                          startIcon={<SecurityIcon />}
                          onClick={() => {
                            setIsViewDialogOpen(false)
                            handleEditPermissions(selectedUser)
                          }}
                          sx={{
                            color: theme === 'dark' ? '#ffffff' : '#111827',
                            borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                            '&:hover': {
                              borderColor: theme === 'dark' ? '#6b7280' : '#9ca3af',
                              backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6'
                            }
                          }}
                        >
                          Edit Permissions
                        </MuiButton>
                        {userPermissions && userPermissions.permissions.length > 0 && (
                          <>
                            <MuiButton
                              variant="outlined"
                              size="small"
                              startIcon={<LockIcon />}
                              onClick={() => {
                                setIsViewDialogOpen(false)
                                handleRevokePermissions(selectedUser)
                              }}
                              sx={{
                                color: theme === 'dark' ? '#ffffff' : '#111827',
                                borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                                '&:hover': {
                                  borderColor: theme === 'dark' ? '#6b7280' : '#9ca3af',
                                  backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6'
                                }
                              }}
                            >
                              Revoke
                            </MuiButton>
                            <MuiButton
                              variant="outlined"
                              size="small"
                              startIcon={<LockOpenIcon />}
                              onClick={() => {
                                setIsViewDialogOpen(false)
                                handleGrantTemporaryPermissions(selectedUser)
                              }}
                              sx={{
                                color: theme === 'dark' ? '#ffffff' : '#111827',
                                borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                                '&:hover': {
                                  borderColor: theme === 'dark' ? '#6b7280' : '#9ca3af',
                                  backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6'
                                }
                              }}
                            >
                              Grant Temporary
                            </MuiButton>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Audit Logs */}
                    {userPermissions && userPermissions.auditLogs && userPermissions.auditLogs.length > 0 && (
                      <div>
                        <Typography variant="h6" sx={{ mb: 3, color: theme === 'dark' ? '#ffffff' : '#111827', fontWeight: 600 }}>
                          Audit Logs
                        </Typography>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {userPermissions.auditLogs.map((log) => (
                            <div
                              key={log.id}
                              className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <Typography variant="body2" sx={{ color: theme === 'dark' ? '#ffffff' : '#111827', fontWeight: 500 }}>
                                  {log.action === 'grant' ? 'Granted' : log.action === 'revoke' ? 'Revoked' : 'Updated'} Permissions
                                </Typography>
                                <Typography variant="caption" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                                  {new Date(log.createdAt).toLocaleDateString('vi-VN', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </Typography>
                              </div>
                              <Typography variant="caption" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                                By: {log.actor?.name || 'Unknown'}
                              </Typography>
                              {log.reason && (
                                <Typography variant="caption" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280', display: 'block', mt: 1 }}>
                                  Reason: {log.reason}
                                </Typography>
                              )}
                              {log.temporary && log.expiresAt && (
                                <Typography variant="caption" sx={{ color: theme === 'dark' ? '#ff9800' : '#f57c00', display: 'block', mt: 1 }}>
                                  Expires: {new Date(log.expiresAt).toLocaleDateString('vi-VN')}
                                </Typography>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions 
          sx={{ 
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            padding: '16px 24px',
            borderTop: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb'
          }}
        >
          <MuiButton 
            onClick={() => {
              setIsViewDialogOpen(false)
              setProfileTab(0)
            }}
            sx={{
              color: theme === 'dark' ? '#ffffff' : '#111827',
              '&:hover': {
                backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6'
              }
            }}
          >
            Close
          </MuiButton>
        </DialogActions>
      </Dialog>

      {/* Update Permissions Dialog */}
      <Dialog 
        open={isUpdatePermissionsDialogOpen} 
        onClose={() => setIsUpdatePermissionsDialogOpen(false)} 
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
          Update Permissions - {selectedUser?.name}
        </DialogTitle>
        <DialogContent 
          sx={{ 
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff'
          }}
        >
          <div className="space-y-4 mt-4">
            <Typography variant="body2" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280', mb: 2 }}>
              Select permissions to assign to this user:
            </Typography>
            
            {/* Permission Checkboxes */}
            <div className="space-y-2">
              {availablePermissions.map((permission) => (
                <FormControlLabel
                  key={permission}
                  control={
                    <Checkbox
                      checked={selectedPermissions.includes(permission)}
                      onChange={() => handleTogglePermission(permission)}
                      sx={{
                        color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                        '&.Mui-checked': {
                          color: '#3b82f6'
                        }
                      }}
                    />
                  }
                  label={permission.replace(/_/g, ' ')}
                  sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}
                />
              ))}
            </div>

            {/* Reason */}
            <TextField
              fullWidth
              label="Reason for Update"
              multiline
              rows={3}
              value={permissionReason}
              onChange={(e) => setPermissionReason(e.target.value)}
              placeholder="Enter reason for updating permissions (at least 10 characters)..."
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
        </DialogContent>
        <DialogActions 
          sx={{ 
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            padding: '16px 24px'
          }}
        >
          <MuiButton 
            onClick={() => setIsUpdatePermissionsDialogOpen(false)}
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
            onClick={handleUpdatePermissions} 
            variant="contained"
            color="primary"
            disabled={updating}
            sx={{
              backgroundColor: '#3b82f6',
              '&:hover': {
                backgroundColor: '#2563eb'
              },
              '&:disabled': {
                backgroundColor: '#6b7280'
              }
            }}
          >
            {updating ? 'Updating...' : 'Update Permissions'}
          </MuiButton>
        </DialogActions>
      </Dialog>

      {/* Revoke Permissions Dialog */}
      <Dialog 
        open={isRevokePermissionsDialogOpen} 
        onClose={() => setIsRevokePermissionsDialogOpen(false)} 
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
          Revoke Permissions - {selectedUser?.name}
        </DialogTitle>
        <DialogContent 
          sx={{ 
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff'
          }}
        >
          <div className="space-y-4 mt-4">
            {loadingPermissions ? (
              <LinearProgress className="mb-4" />
            ) : userPermissions && userPermissions.permissions.length > 0 ? (
              <>
                <Typography variant="body2" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280', mb: 2 }}>
                  Select permissions to revoke:
                </Typography>
                
                {/* Permission Checkboxes */}
                <div className="space-y-2">
                  {userPermissions.permissions.map((permission) => (
                    <FormControlLabel
                      key={permission}
                      control={
                        <Checkbox
                          checked={selectedPermissions.includes(permission)}
                          onChange={() => handleTogglePermission(permission)}
                          sx={{
                            color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                            '&.Mui-checked': {
                              color: '#ef4444'
                            }
                          }}
                        />
                      }
                      label={permission.replace(/_/g, ' ')}
                      sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}
                    />
                  ))}
                </div>
              </>
            ) : (
              <Typography variant="body2" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280', mb: 2 }}>
                This user has no permissions to revoke.
              </Typography>
            )}

            {/* Reason */}
            <TextField
              fullWidth
              label="Reason for Revocation"
              multiline
              rows={3}
              value={permissionReason}
              onChange={(e) => setPermissionReason(e.target.value)}
              placeholder="Enter reason for revoking permissions (at least 10 characters)..."
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
        </DialogContent>
        <DialogActions 
          sx={{ 
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            padding: '16px 24px'
          }}
        >
          <MuiButton 
            onClick={() => setIsRevokePermissionsDialogOpen(false)}
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
            onClick={handleRevokePermissionsSubmit} 
            variant="contained"
            color="error"
            disabled={updating || selectedPermissions.length === 0}
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
            {updating ? 'Revoking...' : 'Revoke Permissions'}
          </MuiButton>
        </DialogActions>
      </Dialog>

      {/* Grant Temporary Permissions Dialog */}
      <Dialog 
        open={isTemporaryPermissionsDialogOpen} 
        onClose={() => setIsTemporaryPermissionsDialogOpen(false)} 
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
          Grant Temporary Permissions - {selectedUser?.name}
        </DialogTitle>
        <DialogContent 
          sx={{ 
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff'
          }}
        >
          <div className="space-y-4 mt-4">
            <Typography variant="body2" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280', mb: 2 }}>
              Select permissions to grant temporarily:
            </Typography>
            
            {/* Permission Checkboxes */}
            <div className="space-y-2">
              {availablePermissions.map((permission) => (
                <FormControlLabel
                  key={permission}
                  control={
                    <Checkbox
                      checked={selectedPermissions.includes(permission)}
                      onChange={() => handleTogglePermission(permission)}
                      sx={{
                        color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                        '&.Mui-checked': {
                          color: '#3b82f6'
                        }
                      }}
                    />
                  }
                  label={permission.replace(/_/g, ' ')}
                  sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}
                />
              ))}
            </div>

            {/* Expiration Date */}
            <TextField
              fullWidth
              label="Expiration Date"
              type="datetime-local"
              value={temporaryExpiresAt}
              onChange={(e) => setTemporaryExpiresAt(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
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

            {/* Reason */}
            <TextField
              fullWidth
              label="Reason for Grant"
              multiline
              rows={3}
              value={permissionReason}
              onChange={(e) => setPermissionReason(e.target.value)}
              placeholder="Enter reason for granting temporary permissions (at least 10 characters)..."
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
        </DialogContent>
        <DialogActions 
          sx={{ 
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            padding: '16px 24px'
          }}
        >
          <MuiButton 
            onClick={() => setIsTemporaryPermissionsDialogOpen(false)}
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
            onClick={handleGrantTemporaryPermissionsSubmit} 
            variant="contained"
            color="primary"
            disabled={updating || selectedPermissions.length === 0 || !temporaryExpiresAt}
            sx={{
              backgroundColor: '#3b82f6',
              '&:hover': {
                backgroundColor: '#2563eb'
              },
              '&:disabled': {
                backgroundColor: '#6b7280'
              }
            }}
          >
            {updating ? 'Granting...' : 'Grant Temporary Permissions'}
          </MuiButton>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default UserManagement

