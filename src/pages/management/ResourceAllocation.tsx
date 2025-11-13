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
  Checkbox,
  FormControlLabel,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  Box,
  Avatar
} from '@mui/material'
import {
  Search,
  Menu as MenuIcon,
  BarChart as BarChartIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  AutoAwesome as AutoAwesomeIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  Star as StarIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  MenuBook as MenuBookIcon,
  Forum as ForumIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  Business as BuildingIcon,
  MeetingRoom as RoomIcon,
  Computer,
  Videocam,
  VolumeUp,
  Mic,
  CameraAlt,
  Devices,
  ExpandMore,
  ExpandLess,
  Event,
  CalendarToday,
  FilterList
} from '@mui/icons-material'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import api from '../../lib/api'

const ResourceAllocation: React.FC = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<number>(0)
  const [mobileOpen, setMobileOpen] = useState(false)
  
  // Overview state
  const [overview, setOverview] = useState<any>(null)
  const [workloads, setWorkloads] = useState<any[]>([])
  const [overviewLoading, setOverviewLoading] = useState(false)
  
  // Inefficiencies state
  const [inefficiencies, setInefficiencies] = useState<any[]>([])
  const [inefficienciesLoading, setInefficienciesLoading] = useState(false)
  const [inefficiencyFilters, setInefficiencyFilters] = useState({
    severity: 'all',
    type: 'all'
  })
  
  // Optimization state
  const [optimizationPlan, setOptimizationPlan] = useState<any>(null)
  const [optimizationLoading, setOptimizationLoading] = useState(false)
  const [selectedChanges, setSelectedChanges] = useState<Set<string>>(new Set())
  const [optimizationDescription, setOptimizationDescription] = useState('')
  const [applyLoading, setApplyLoading] = useState(false)
  const [focusAreas, setFocusAreas] = useState<string[]>([])
  const [constraints, setConstraints] = useState({
    maxWorkloadPerTutor: 30,
    minGroupSize: 5,
    maxGroupSize: 20
  })
  const [isOptimizeDialogOpen, setIsOptimizeDialogOpen] = useState(false)
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Room Management state
  const [buildings, setBuildings] = useState<any[]>([])
  const [roomsLoading, setRoomsLoading] = useState(false)
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all')
  const [selectedRoom, setSelectedRoom] = useState<any>(null)
  const [isRoomDetailDialogOpen, setIsRoomDetailDialogOpen] = useState(false)
  const [roomSessions, setRoomSessions] = useState<any[]>([])
  const [roomSessionsLoading, setRoomSessionsLoading] = useState(false)
  const [roomSearchTerm, setRoomSearchTerm] = useState('')
  const [roomEquipmentFilter, setRoomEquipmentFilter] = useState<string>('all')
  const [roomCapacityFilter, setRoomCapacityFilter] = useState<string>('all')
  const [expandedFloors, setExpandedFloors] = useState<Set<string>>(new Set())
  const [roomDateFilter, setRoomDateFilter] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 60 days from now
  })

  // Menu items for sidebar
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, path: '/management' },
    { id: 'approval-requests', label: 'Approval Requests', icon: <AssignmentIcon />, path: '/management/approval' },
    { id: 'resource-allocation', label: 'Resource Allocation', icon: <TrendingUpIcon />, path: '/management/resources' },
    { id: 'reports-analytics', label: 'Reports & Analytics', icon: <BarChartIcon />, path: '/management/reports' },
    { id: 'award-credits', label: 'Award Credits', icon: <StarIcon />, path: '/management/awards' },
    { id: 'user-management', label: 'User Management', icon: <PeopleIcon />, path: '/management/users' },
    { id: 'system-settings', label: 'System Settings', icon: <SettingsIcon />, path: '/management/settings' },
    { id: 'security', label: 'Security', icon: <SecurityIcon />, path: '/management/security' },
    { id: 'notifications', label: 'Notifications', icon: <NotificationsIcon />, path: '/management/notifications' },
    { id: 'profile', label: 'Profile Management', icon: <PersonIcon />, path: '/common/profile' },
    { id: 'library', label: 'Digital Library', icon: <MenuBookIcon />, path: '/common/library' },
    { id: 'forum', label: 'Community Forum', icon: <ForumIcon />, path: '/common/forum' }
  ]

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleMenuClick = (item: any) => {
    if (item.path) {
      navigate(item.path)
    }
  }

  // Load overview
  const loadOverview = useCallback(async () => {
    try {
      setOverviewLoading(true)
      const response = await api.management.resources.getOverview()
      if (response.success) {
        setOverview(response.data.overview)
        setWorkloads(response.data.workloads || [])
      } else {
        setErrorMessage(response.error || 'Lỗi tải tổng quan tài nguyên')
      }
    } catch (error: any) {
      console.error('Error loading overview:', error)
      setErrorMessage('Lỗi tải tổng quan tài nguyên: ' + (error.message || 'Unknown error'))
    } finally {
      setOverviewLoading(false)
    }
  }, [])

  // Load inefficiencies
  const loadInefficiencies = useCallback(async () => {
    try {
      setInefficienciesLoading(true)
      const params: any = {}
      if (inefficiencyFilters.severity !== 'all') {
        params.severity = inefficiencyFilters.severity
      }
      if (inefficiencyFilters.type !== 'all') {
        params.type = inefficiencyFilters.type
      }
      const response = await api.management.resources.getInefficiencies(params)
      if (response.success) {
        setInefficiencies(response.data.inefficiencies || [])
      } else {
        setErrorMessage(response.error || 'Lỗi tải danh sách không hiệu quả')
      }
    } catch (error: any) {
      console.error('Error loading inefficiencies:', error)
      setErrorMessage('Lỗi tải danh sách không hiệu quả: ' + (error.message || 'Unknown error'))
    } finally {
      setInefficienciesLoading(false)
    }
  }, [inefficiencyFilters])

  // Generate optimization plan
  const generateOptimizationPlan = useCallback(async () => {
    try {
      setOptimizationLoading(true)
      setErrorMessage(null)
      const response = await api.management.resources.optimize({
        focusAreas: focusAreas.length > 0 ? focusAreas : undefined,
        constraints: constraints
      })
      if (response.success) {
        setOptimizationPlan(response.data)
        setSelectedChanges(new Set(response.data.changes?.map((c: any) => c.resourceId) || []))
        setIsOptimizeDialogOpen(false)
        setActiveTab(2)
      } else {
        setErrorMessage(response.error || 'Lỗi tạo kế hoạch tối ưu hóa')
      }
    } catch (error: any) {
      console.error('Error generating optimization plan:', error)
      setErrorMessage('Lỗi tạo kế hoạch tối ưu hóa: ' + (error.message || 'Unknown error'))
    } finally {
      setOptimizationLoading(false)
    }
  }, [focusAreas, constraints])

  // Apply optimization
  const applyOptimization = useCallback(async () => {
    if (selectedChanges.size === 0) {
      setErrorMessage('Vui lòng chọn ít nhất một thay đổi để áp dụng')
      return
    }

    try {
      setApplyLoading(true)
      setErrorMessage(null)
      const response = await api.management.resources.applyOptimization({
        planId: optimizationPlan.id,
        selectedChanges: Array.from(selectedChanges),
        description: optimizationDescription || undefined
      })
      if (response.success) {
        setSuccessMessage('Đã tạo yêu cầu phê duyệt tối ưu hóa thành công. Vui lòng chờ phê duyệt từ management.')
        setIsApplyDialogOpen(false)
        setOptimizationPlan(null)
        setSelectedChanges(new Set())
        setOptimizationDescription('')
        // Reload data
        loadOverview()
        loadInefficiencies()
        // Navigate to approvals page after 2 seconds
        setTimeout(() => {
          navigate('/management/approval')
        }, 2000)
      } else {
        setErrorMessage(response.error || 'Lỗi áp dụng tối ưu hóa')
      }
    } catch (error: any) {
      console.error('Error applying optimization:', error)
      setErrorMessage('Lỗi áp dụng tối ưu hóa: ' + (error.message || 'Unknown error'))
    } finally {
      setApplyLoading(false)
    }
  }, [optimizationPlan, selectedChanges, optimizationDescription, navigate, loadOverview, loadInefficiencies])

  // Load rooms
  const loadRooms = useCallback(async () => {
    try {
      setRoomsLoading(true)
      const response = await api.rooms.list()
      if (response.success) {
        setBuildings(response.data || [])
        // Auto-expand first building's first floor
        if (response.data && response.data.length > 0) {
          const firstBuilding = response.data[0]
          if (firstBuilding.floors && firstBuilding.floors.length > 0) {
            setExpandedFloors(new Set([`${firstBuilding.id}-${firstBuilding.floors[0].floorNumber}`]))
          }
        }
      } else {
        setErrorMessage(response.error || 'Lỗi tải danh sách phòng học')
      }
    } catch (error: any) {
      console.error('Error loading rooms:', error)
      setErrorMessage('Lỗi tải danh sách phòng học: ' + (error.message || 'Unknown error'))
    } finally {
      setRoomsLoading(false)
    }
  }, [])

  // Load room sessions
  const loadRoomSessions = useCallback(async (roomName: string) => {
    try {
      setRoomSessionsLoading(true)
      setErrorMessage(null)
      
      // Load all sessions first (management can see all sessions)
      // Then filter by date range and location on client side
      console.log('🔍 Loading room sessions for:', roomName)
      console.log('📅 Date filter:', roomDateFilter)
      
      const response = await api.sessions.list({
        page: 1,
        limit: 1000
      })
      
      console.log('📦 API Response:', response)
      
      // API returns {data: [...], pagination: {...}} format directly
      let sessions: any[] = []
      if (response && response.data && Array.isArray(response.data)) {
        sessions = response.data
        console.log('✅ Parsed sessions from response.data:', sessions.length)
      } else if (Array.isArray(response)) {
        sessions = response
        console.log('✅ Parsed sessions from response (array):', sessions.length)
      } else if (response && response.data && response.data.data && Array.isArray(response.data.data)) {
        sessions = response.data.data
        console.log('✅ Parsed sessions from response.data.data:', sessions.length)
      } else {
        console.warn('⚠️ Unexpected response format:', response)
      }
      
      // Parse date filter
      const startDate = new Date(roomDateFilter.startDate + 'T00:00:00.000Z')
      const endDate = new Date(roomDateFilter.endDate + 'T23:59:59.999Z')
      
      console.log('📅 Date range:', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        startDateLocal: startDate.toLocaleString('vi-VN'),
        endDateLocal: endDate.toLocaleString('vi-VN')
      })
      
      // Debug: Log all offline sessions with locations
      const offlineSessions = sessions.filter((s: any) => !s.isOnline && s.location)
      console.log('🏠 Offline sessions with locations:', offlineSessions.map((s: any) => ({
        id: s.id,
        location: s.location,
        startTime: s.startTime,
        isOnline: s.isOnline
      })))
      
      // Filter sessions by room location, date range, and ensure they are offline
      const roomSessions = sessions.filter((session: any) => {
        // Must be offline session
        if (session.isOnline) {
          return false
        }
        
        // Must have location
        if (!session.location) {
          return false
        }
        
        // Location must match room name (case-insensitive and trimmed)
        const sessionLocation = String(session.location || '').trim()
        const targetRoomName = String(roomName || '').trim()
        // Exact match (case-insensitive) or exact match (case-sensitive)
        const locationMatch = sessionLocation.toLowerCase() === targetRoomName.toLowerCase()
        if (!locationMatch) {
          console.log('❌ Location mismatch:', { sessionLocation, targetRoomName, sessionId: session.id })
          return false
        }
        
        // Must have startTime
        if (!session.startTime) {
          return false
        }
        
        // Check if session is within date range
        const sessionStartTime = new Date(session.startTime)
        const isInDateRange = sessionStartTime >= startDate && sessionStartTime <= endDate
        if (!isInDateRange) {
          return false
        }
        
        return true
      })
      
      console.log('🔍 Room sessions filter results:', {
        roomName,
        totalSessions: sessions.length,
        offlineSessions: sessions.filter((s: any) => !s.isOnline).length,
        sessionsWithLocation: sessions.filter((s: any) => s.location).length,
        sessionsInDateRange: sessions.filter((s: any) => {
          if (!s.startTime) return false
          const sessionStartTime = new Date(s.startTime)
          return sessionStartTime >= startDate && sessionStartTime <= endDate
        }).length,
        roomSessionsCount: roomSessions.length,
        roomSessions: roomSessions.map((s: any) => ({
          id: s.id,
          location: s.location,
          startTime: s.startTime,
          isOnline: s.isOnline
        }))
      })
      
      // Sort by startTime
      roomSessions.sort((a, b) => {
        const dateA = new Date(a.startTime)
        const dateB = new Date(b.startTime)
        return dateA.getTime() - dateB.getTime()
      })
      
      setRoomSessions(roomSessions)
    } catch (error: any) {
      console.error('Error loading room sessions:', error)
      setErrorMessage('Lỗi tải lịch sử sử dụng phòng: ' + (error.message || 'Unknown error'))
      setRoomSessions([])
    } finally {
      setRoomSessionsLoading(false)
    }
  }, [roomDateFilter])

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 0) {
      loadOverview()
    } else if (activeTab === 1) {
      loadInefficiencies()
    } else if (activeTab === 3) {
      loadRooms()
    }
  }, [activeTab, loadOverview, loadInefficiencies, loadRooms])

  // Load room sessions when room is selected or date filter changes
  useEffect(() => {
    if (selectedRoom && selectedRoom.name && isRoomDetailDialogOpen) {
      loadRoomSessions(selectedRoom.name)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoom?.name, isRoomDetailDialogOpen, roomDateFilter.startDate, roomDateFilter.endDate])

  // Get workload color
  const getWorkloadColor = (workload: string) => {
    switch (workload) {
      case 'overloaded':
        return 'error'
      case 'high':
        return 'warning'
      case 'medium':
        return 'info'
      case 'low':
        return 'success'
      default:
        return 'default'
    }
  }

  // Get workload label
  const getWorkloadLabel = (workload: string) => {
    switch (workload) {
      case 'overloaded':
        return 'Quá tải'
      case 'high':
        return 'Cao'
      case 'medium':
        return 'Trung bình'
      case 'low':
        return 'Thấp'
      default:
        return workload
    }
  }

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'error'
      case 'medium':
        return 'warning'
      case 'low':
        return 'info'
      default:
        return 'default'
    }
  }

  // Get severity label
  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'Cao'
      case 'medium':
        return 'Trung bình'
      case 'low':
        return 'Thấp'
      default:
        return severity
    }
  }

  // Get inefficiency type label
  const getInefficiencyTypeLabel = (type: string) => {
    switch (type) {
      case 'overloaded_tutor':
        return 'Tutor quá tải'
      case 'underutilized_tutor':
        return 'Tutor chưa sử dụng hiệu quả'
      case 'unbalanced_group':
        return 'Nhóm không cân bằng'
      case 'resource_conflict':
        return 'Xung đột tài nguyên'
      default:
        return type
    }
  }

  // Get change type label
  const getChangeTypeLabel = (type: string) => {
    switch (type) {
      case 'reallocate_session':
        return 'Phân bổ lại session'
      case 'adjust_group_size':
        return 'Điều chỉnh kích thước nhóm'
      case 'modify_schedule':
        return 'Thay đổi lịch'
      default:
        return type
    }
  }

  // Calculate resource stats
  const resourceStats = {
    totalTutors: overview?.totalTutors || 0,
    totalHours: overview?.totalHours || 0,
    totalStudents: overview?.totalStudents || 0,
    overloadedTutors: overview?.workloadDistribution?.overloaded || 0,
    inefficienciesCount: inefficiencies.length,
    pendingOptimizations: optimizationPlan ? 1 : 0,
    totalRooms: buildings.reduce((sum, building) => 
      sum + building.floors?.reduce((floorSum: number, floor: any) => 
        floorSum + (floor.rooms?.length || 0), 0) || 0, 0)
  }

  // Equipment name map
  const equipmentNameMap: Record<string, string> = {
    'whiteboard': 'Bảng trắng',
    'projector': 'Máy chiếu',
    'computer': 'Máy tính',
    'sound_system': 'Hệ thống âm thanh',
    'microphone': 'Micro',
    'camera': 'Camera',
    'Bảng trắng': 'Bảng trắng',
    'Máy chiếu': 'Máy chiếu',
    'Máy tính': 'Máy tính',
    'Hệ thống âm thanh': 'Hệ thống âm thanh',
    'Micro': 'Micro',
    'Camera': 'Camera'
  }

  // Get all unique equipment
  const allEquipment = Array.from(new Set(
    buildings.flatMap(building =>
      building.floors?.flatMap((floor: any) =>
        floor.rooms?.flatMap((room: any) => room.equipment || []) || []
      ) || []
    )
  ))

  // Filter rooms
  const filteredBuildings = buildings.map(building => {
    const filteredFloors = building.floors?.map((floor: any) => {
      const filteredRooms = floor.rooms?.filter((room: any) => {
        // Search filter
        if (roomSearchTerm) {
          const searchLower = roomSearchTerm.toLowerCase()
          if (!room.name.toLowerCase().includes(searchLower) &&
              !room.code.toLowerCase().includes(searchLower) &&
              !building.name.toLowerCase().includes(searchLower)) {
            return false
          }
        }
        
        // Building filter
        if (selectedBuilding !== 'all' && building.id !== selectedBuilding) {
          return false
        }
        
        // Equipment filter
        if (roomEquipmentFilter !== 'all' && !room.equipment?.includes(roomEquipmentFilter)) {
          return false
        }
        
        // Capacity filter
        if (roomCapacityFilter !== 'all') {
          const capacity = room.capacity || 0
          if (roomCapacityFilter === 'small' && capacity >= 30) return false
          if (roomCapacityFilter === 'medium' && (capacity < 30 || capacity >= 50)) return false
          if (roomCapacityFilter === 'large' && capacity < 50) return false
        }
        
        return true
      }) || []
      
      return { ...floor, rooms: filteredRooms }
    }).filter((floor: any) => floor.rooms.length > 0) || []
    
    return { ...building, floors: filteredFloors }
  }).filter(building => building.floors.length > 0)

  // Toggle floor expansion
  const toggleFloor = (buildingId: string, floorNumber: number) => {
    const key = `${buildingId}-${floorNumber}`
    setExpandedFloors(prev => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
  }

  // Format date/time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    const dateStr = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const timeStr = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    return { date: dateStr, time: timeStr }
  }

  // Handle room click
  const handleRoomClick = (room: any, building: any) => {
    const roomData = { ...room, buildingName: building.name, buildingCode: building.code }
    setSelectedRoom(roomData)
    setIsRoomDetailDialogOpen(true)
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar - Sticky */}
        <div className={`w-full lg:w-60 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-r ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} ${mobileOpen ? 'block' : 'hidden lg:block'}`}>
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

            {/* Navigation Menu */}
            <div className="mb-8">
              <div className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item)}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                      item.id === 'resource-allocation'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Resource Stats */}
            <div className="mb-8">
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                RESOURCE STATS
              </h3>
              <div className="space-y-3">
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Total Tutors:</span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {resourceStats.totalTutors}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Total Hours:</span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {resourceStats.totalHours.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Overloaded:</span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                      {resourceStats.overloadedTutors}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Inefficiencies:</span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                      {resourceStats.inefficienciesCount}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Total Rooms:</span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {resourceStats.totalRooms}
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
                <button 
                  onClick={() => {
                    loadOverview()
                    loadInefficiencies()
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left border ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  } transition-colors`}
                >
                  <RefreshIcon className="mr-3 w-4 h-4" />
                  Refresh Data
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
                  Resource Allocation
                </h1>
                <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Optimize resource allocation and manage workloads
                </p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => {
                    loadOverview()
                    loadInefficiencies()
                  }}
                  disabled={overviewLoading || inefficienciesLoading}
                >
                  <RefreshIcon className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
            
            {/* Success/Error Messages */}
            {successMessage && (
              <Alert 
                severity="success" 
                className="mb-4" 
                onClose={() => setSuccessMessage(null)}
                sx={{
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                  color: theme === 'dark' ? '#ffffff' : '#111827'
                }}
              >
                {successMessage}
              </Alert>
            )}
            {errorMessage && (
              <Alert 
                severity="error" 
                className="mb-4" 
                onClose={() => setErrorMessage(null)}
                sx={{
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                  color: theme === 'dark' ? '#ffffff' : '#111827'
                }}
              >
                {errorMessage}
              </Alert>
            )}
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
                    color: theme === 'dark' ? '#60a5fa' : '#2563eb'
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: theme === 'dark' ? '#60a5fa' : '#2563eb'
                }
              }}
            >
              <Tab label="Overview" />
              <Tab label="Inefficiencies" />
              <Tab label="Optimize" />
              <Tab label="Room Management" />
            </Tabs>
          </Box>

          {/* Tab Panels */}
          {/* Overview Tab */}
          {activeTab === 0 && (
            <div className="space-y-6">
              {overviewLoading ? (
                <div className="text-center py-8">
                  <LinearProgress className="mb-4" />
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Đang tải tổng quan tài nguyên...
                  </p>
                </div>
              ) : overview ? (
                <>
                  {/* Statistics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card 
                      className={`p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                      style={{
                        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                        boxShadow: 'none'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Tổng số Tutors
                          </p>
                          <p className={`text-2xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {overview.totalTutors || 0}
                          </p>
                        </div>
                        <PeopleIcon className={`w-8 h-8 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                      </div>
                    </Card>
                    <Card 
                      className={`p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                      style={{
                        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                        boxShadow: 'none'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Tổng số Giờ
                          </p>
                          <p className={`text-2xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {overview.totalHours?.toFixed(1) || 0}
                          </p>
                        </div>
                        <ScheduleIcon className={`w-8 h-8 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                      </div>
                    </Card>
                    <Card 
                      className={`p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                      style={{
                        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                        boxShadow: 'none'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Tổng số Học sinh
                          </p>
                          <p className={`text-2xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {overview.totalStudents || 0}
                          </p>
                        </div>
                        <PeopleIcon className={`w-8 h-8 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
                      </div>
                    </Card>
                    <Card 
                      className={`p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                      style={{
                        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                        boxShadow: 'none'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Tutors quá tải
                          </p>
                          <p className={`text-2xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {overview.workloadDistribution?.overloaded || 0}
                          </p>
                        </div>
                        <WarningIcon className={`w-8 h-8 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
                      </div>
                    </Card>
                  </div>

                  {/* Workload Distribution */}
                  <Card 
                    className={`p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                    style={{
                      borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                      backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                      boxShadow: 'none'
                    }}
                  >
                    <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Phân bổ Workload
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'}`}>
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                          Quá tải
                        </p>
                        <p className={`text-2xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {overview.workloadDistribution?.overloaded || 0}
                        </p>
                      </div>
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                          Cao
                        </p>
                        <p className={`text-2xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {overview.workloadDistribution?.high || 0}
                        </p>
                      </div>
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                          Trung bình
                        </p>
                        <p className={`text-2xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {overview.workloadDistribution?.medium || 0}
                        </p>
                      </div>
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'}`}>
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                          Thấp
                        </p>
                        <p className={`text-2xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {overview.workloadDistribution?.low || 0}
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Tutor Workloads Table */}
                  <Card 
                    className={`p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                    style={{
                      borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                      backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                      boxShadow: 'none'
                    }}
                  >
                    <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Workload của Tutors
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
                          <tr>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                              Tutor
                            </th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                              Tổng Giờ
                            </th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                              Số Học sinh
                            </th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                              Workload
                            </th>
                          </tr>
                        </thead>
                        <tbody className={`${theme === 'dark' ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
                          {workloads.map((workload) => (
                            <tr key={workload.tutorId}>
                              <td className={`px-6 py-4 whitespace-nowrap ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {workload.tutor?.name || workload.tutorId}
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                                {workload.totalHours?.toFixed(1) || 0}
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                                {workload.studentCount || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Chip
                                  label={getWorkloadLabel(workload.workload)}
                                  color={getWorkloadColor(workload.workload) as any}
                                  size="small"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Không có dữ liệu tổng quan
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Inefficiencies Tab */}
          {activeTab === 1 && (
            <div className="space-y-6">
              {/* Filters */}
              <Card 
                className={`p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                style={{
                  borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                  boxShadow: 'none'
                }}
              >
                <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Filters
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Mức độ nghiêm trọng
                    </label>
                    <select
                      value={inefficiencyFilters.severity}
                      onChange={(e) => setInefficiencyFilters({ ...inefficiencyFilters, severity: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="all">Tất cả</option>
                      <option value="high">Cao</option>
                      <option value="medium">Trung bình</option>
                      <option value="low">Thấp</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Loại vấn đề
                    </label>
                    <select
                      value={inefficiencyFilters.type}
                      onChange={(e) => setInefficiencyFilters({ ...inefficiencyFilters, type: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="all">Tất cả</option>
                      <option value="overloaded_tutor">Tutor quá tải</option>
                      <option value="underutilized_tutor">Tutor chưa sử dụng hiệu quả</option>
                      <option value="unbalanced_group">Nhóm không cân bằng</option>
                      <option value="resource_conflict">Xung đột tài nguyên</option>
                    </select>
                  </div>
                </div>
              </Card>

              {/* Inefficiencies List */}
              {inefficienciesLoading ? (
                <div className="text-center py-8">
                  <LinearProgress className="mb-4" />
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Đang tải danh sách vấn đề...
                  </p>
                </div>
              ) : inefficiencies.length > 0 ? (
                <div className="space-y-4">
                  {inefficiencies.map((inefficiency) => (
                    <Card 
                      key={inefficiency.id}
                      className={`p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                      style={{
                        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                        boxShadow: 'none'
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Chip
                              label={getInefficiencyTypeLabel(inefficiency.type)}
                              color="primary"
                              size="small"
                            />
                            <Chip
                              label={getSeverityLabel(inefficiency.severity)}
                              color={getSeverityColor(inefficiency.severity) as any}
                              size="small"
                            />
                          </div>
                          <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {inefficiency.description}
                          </p>
                          {inefficiency.suggestedActions && inefficiency.suggestedActions.length > 0 && (
                            <div className="mt-4">
                              <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                Hành động đề xuất:
                              </p>
                              <ul className={`list-disc list-inside space-y-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {inefficiency.suggestedActions.map((action: string, index: number) => (
                                  <li key={index} className="text-sm">{action}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Không có vấn đề nào được phát hiện
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Optimize Tab */}
          {activeTab === 2 && (
            <div className="space-y-6">
              {optimizationPlan ? (
                <>
                  {/* Optimization Plan Details */}
                  <Card 
                    className={`p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                    style={{
                      borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                      backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                      boxShadow: 'none'
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {optimizationPlan.name}
                      </h2>
                      <Button
                        onClick={() => {
                          setOptimizationPlan(null)
                          setSelectedChanges(new Set())
                          setOptimizationDescription('')
                        }}
                        variant="outlined"
                        size="small"
                      >
                        Tạo mới
                      </Button>
                    </div>
                    <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {optimizationPlan.description}
                    </p>
                    
                    {/* Estimated Impact */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                          Giảm Workload
                        </p>
                        <p className={`text-2xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {optimizationPlan.estimatedImpact?.workloadReduction?.toFixed(0) || 0}%
                        </p>
                      </div>
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'}`}>
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                          Cải thiện Cân bằng
                        </p>
                        <p className={`text-2xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {optimizationPlan.estimatedImpact?.balanceImprovement?.toFixed(0) || 0}%
                        </p>
                      </div>
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-purple-900/20' : 'bg-purple-50'}`}>
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                          Sử dụng Tài nguyên
                        </p>
                        <p className={`text-2xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {optimizationPlan.estimatedImpact?.resourceUtilization?.toFixed(0) || 0}%
                        </p>
                      </div>
                    </div>

                    {/* Changes List */}
                    <div className="mb-6">
                      <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Các thay đổi đề xuất
                      </h3>
                      <div className="space-y-2">
                        {optimizationPlan.changes?.map((change: any, index: number) => (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border ${
                              theme === 'dark'
                                ? 'bg-gray-700 border-gray-600'
                                : 'bg-white border-gray-200'
                            }`}
                          >
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={selectedChanges.has(change.resourceId)}
                                  onChange={(e) => {
                                    const newSelected = new Set(selectedChanges)
                                    if (e.target.checked) {
                                      newSelected.add(change.resourceId)
                                    } else {
                                      newSelected.delete(change.resourceId)
                                    }
                                    setSelectedChanges(newSelected)
                                  }}
                                  color="primary"
                                />
                              }
                              label={
                                <div>
                                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {getChangeTypeLabel(change.type)}
                                  </p>
                                  <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {change.reason}
                                  </p>
                                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                                    Resource ID: {change.resourceId}
                                  </p>
                                </div>
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Apply Button */}
                    <div className="flex justify-end">
                      <Button
                        onClick={() => setIsApplyDialogOpen(true)}
                        disabled={selectedChanges.size === 0 || applyLoading}
                        className="flex items-center space-x-2"
                      >
                        <AutoAwesomeIcon className="w-5 h-5" />
                        <span>Áp dụng Tối ưu hóa</span>
                      </Button>
                    </div>
                  </Card>
                </>
              ) : (
                <Card 
                  className={`p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                  style={{
                    borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    boxShadow: 'none'
                  }}
                >
                  <div className="text-center py-8">
                    <AutoAwesomeIcon className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-300'}`} />
                    <h2 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Tạo Kế hoạch Tối ưu hóa
                    </h2>
                    <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Chọn các lĩnh vực tập trung và ràng buộc để tạo kế hoạch tối ưu hóa tài nguyên
                    </p>
                    <Button
                      onClick={() => setIsOptimizeDialogOpen(true)}
                      className="flex items-center space-x-2 mx-auto"
                    >
                      <AutoAwesomeIcon className="w-5 h-5" />
                      <span>Tạo Kế hoạch Tối ưu hóa</span>
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Room Management Tab */}
          {activeTab === 3 && (
            <div className="space-y-6">
              {/* Filters */}
              <Card 
                className={`p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                style={{
                  borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                  boxShadow: 'none'
                }}
              >
                <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Filters & Search
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Tìm kiếm
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Tìm phòng, mã phòng..."
                        value={roomSearchTerm}
                        onChange={(e) => setRoomSearchTerm(e.target.value)}
                        className={`w-full px-4 py-2 pl-10 rounded-lg border ${
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
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Tòa nhà
                    </label>
                    <select
                      value={selectedBuilding}
                      onChange={(e) => setSelectedBuilding(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="all">Tất cả</option>
                      {buildings.map((building) => (
                        <option key={building.id} value={building.id}>
                          {building.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Thiết bị
                    </label>
                    <select
                      value={roomEquipmentFilter}
                      onChange={(e) => setRoomEquipmentFilter(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="all">Tất cả</option>
                      {allEquipment.map((equipment) => (
                        <option key={equipment} value={equipment}>
                          {equipmentNameMap[equipment] || equipment}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Sức chứa
                    </label>
                    <select
                      value={roomCapacityFilter}
                      onChange={(e) => setRoomCapacityFilter(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="all">Tất cả</option>
                      <option value="small">Nhỏ (&lt; 30)</option>
                      <option value="medium">Trung bình (30-50)</option>
                      <option value="large">Lớn (&gt; 50)</option>
                    </select>
                  </div>
                </div>
              </Card>

              {/* Rooms List */}
              {roomsLoading ? (
                <div className="text-center py-8">
                  <LinearProgress className="mb-4" />
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Đang tải danh sách phòng học...
                  </p>
                </div>
              ) : filteredBuildings.length > 0 ? (
                <div className="space-y-4">
                  {filteredBuildings.map((building) => (
                    <Card
                      key={building.id}
                      className={`p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                      style={{
                        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                        boxShadow: 'none'
                      }}
                    >
                      <div className="flex items-center mb-4">
                        <BuildingIcon className={`w-6 h-6 mr-3 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                        <div>
                          <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {building.name}
                          </h3>
                          {building.description && (
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {building.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {building.floors?.map((floor: any) => {
                        const floorKey = `${building.id}-${floor.floorNumber}`
                        const isExpanded = expandedFloors.has(floorKey)
                        
                        return (
                          <div key={floor.floorNumber} className="mb-4">
                            <button
                              onClick={() => toggleFloor(building.id, floor.floorNumber)}
                              className={`w-full flex items-center justify-between p-3 rounded-lg mb-2 ${
                                theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                              } transition-colors`}
                            >
                              <div className="flex items-center">
                                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  Tầng {floor.floorNumber}
                                </span>
                                <span className={`ml-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  ({floor.rooms.length} phòng)
                                </span>
                              </div>
                              {isExpanded ? <ExpandLess /> : <ExpandMore />}
                            </button>
                            
                            {isExpanded && (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ml-4">
                                {floor.rooms.map((room: any) => (
                                  <div
                                    key={room.id}
                                    onClick={() => handleRoomClick(room, building)}
                                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                      theme === 'dark'
                                        ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-blue-500'
                                        : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-blue-500'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center">
                                        <RoomIcon className={`w-5 h-5 mr-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                                        <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                          {room.name}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="space-y-1">
                                      <div className="flex items-center text-sm">
                                        <PeopleIcon className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                                          Sức chứa: {room.capacity}
                                        </span>
                                      </div>
                                      {room.equipment && room.equipment.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                          {room.equipment.slice(0, 3).map((equip: string, idx: number) => (
                                            <Chip
                                              key={idx}
                                              label={equipmentNameMap[equip] || equip}
                                              size="small"
                                              sx={{
                                                fontSize: '0.7rem',
                                                height: '20px',
                                                backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                                                color: theme === 'dark' ? '#ffffff' : '#111827'
                                              }}
                                            />
                                          ))}
                                          {room.equipment.length > 3 && (
                                            <Chip
                                              label={`+${room.equipment.length - 3}`}
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
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <RoomIcon className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-300'}`} />
                  <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Không tìm thấy phòng học nào
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Room Detail Dialog */}
      <Dialog
        open={isRoomDetailDialogOpen}
        onClose={() => setIsRoomDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            color: theme === 'dark' ? '#ffffff' : '#111827'
          }
        }}
      >
        <DialogTitle sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
          <div className="flex items-center">
            <RoomIcon className="mr-3" />
            <div>
              <Typography variant="h6" sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                {selectedRoom?.name}
              </Typography>
              <Typography variant="body2" sx={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                {selectedRoom?.buildingName}
              </Typography>
            </div>
          </div>
        </DialogTitle>
        <DialogContent>
          <div className="space-y-6 mt-4">
            {/* Room Information */}
            <div>
              <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Thông tin phòng học
              </h3>
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} space-y-2`}>
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Mã phòng:</span>
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {selectedRoom?.code}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Sức chứa:</span>
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {selectedRoom?.capacity} người
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Tầng:</span>
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Tầng {selectedRoom?.floor}
                  </span>
                </div>
                {selectedRoom?.equipment && selectedRoom.equipment.length > 0 && (
                  <div>
                    <span className={`block mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      Thiết bị:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedRoom.equipment.map((equip: string, idx: number) => (
                        <Chip
                          key={idx}
                          label={equipmentNameMap[equip] || equip}
                          size="small"
                          sx={{
                            backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                            color: theme === 'dark' ? '#ffffff' : '#111827'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Date Range Filter */}
            <div>
              <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Lọc theo ngày
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  fullWidth
                  label="Từ ngày"
                  type="date"
                  value={roomDateFilter.startDate}
                  onChange={(e) => setRoomDateFilter({ ...roomDateFilter, startDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: theme === 'dark' ? '#ffffff' : '#111827',
                      backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                      '& fieldset': {
                        borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Đến ngày"
                  type="date"
                  value={roomDateFilter.endDate}
                  onChange={(e) => setRoomDateFilter({ ...roomDateFilter, endDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: theme === 'dark' ? '#ffffff' : '#111827',
                      backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                      '& fieldset': {
                        borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                    },
                  }}
                />
              </div>
            </div>

            {/* Room Sessions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Lịch sử sử dụng phòng
                </h3>
                <MuiButton
                  size="small"
                  onClick={() => selectedRoom && loadRoomSessions(selectedRoom.name)}
                  disabled={roomSessionsLoading}
                  sx={{
                    color: theme === 'dark' ? '#60a5fa' : '#2563eb',
                    '&:hover': {
                      backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6'
                    }
                  }}
                >
                  <RefreshIcon className="w-4 h-4 mr-1" />
                  Reload
                </MuiButton>
              </div>
              {roomSessionsLoading ? (
                <div className="text-center py-4">
                  <LinearProgress className="mb-2" />
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Đang tải lịch sử...
                  </p>
                </div>
              ) : roomSessions.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {roomSessions.map((session: any) => {
                    const dateTime = formatDateTime(session.startTime)
                    const endDateTime = formatDateTime(session.endTime)
                    return (
                      <div
                        key={session.id}
                        className={`p-4 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <p className={`font-semibold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {session.subject || 'Session'}
                              </p>
                              {session.topic && (
                                <span className={`ml-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  - {session.topic}
                                </span>
                              )}
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center">
                                <ScheduleIcon className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                  {dateTime.date} từ {dateTime.time} đến {endDateTime.time}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <PeopleIcon className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                  {session.studentIds?.length || 0} học sinh
                                </span>
                              </div>
                              {session.tutorId && (
                                <div className="flex items-center">
                                  <PersonIcon className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Tutor ID: {session.tutorId}
                                  </span>
                                </div>
                              )}
                              {session.description && (
                                <div className={`mt-2 p-2 rounded ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {session.description}
                                  </p>
                                </div>
                              )}
                              {session.equipmentRequirements && session.equipmentRequirements.length > 0 && (
                                <div className="mt-2">
                                  <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Thiết bị yêu cầu:
                                  </span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {session.equipmentRequirements.map((equip: string, idx: number) => (
                                      <Chip
                                        key={idx}
                                        label={equipmentNameMap[equip] || equip}
                                        size="small"
                                        sx={{
                                          fontSize: '0.7rem',
                                          height: '20px',
                                          backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                                          color: theme === 'dark' ? '#ffffff' : '#111827'
                                        }}
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            <Chip
                              label={session.status === 'confirmed' ? 'Đã xác nhận' : 
                                     session.status === 'pending' ? 'Chờ xác nhận' :
                                     session.status === 'completed' ? 'Đã hoàn thành' :
                                     session.status === 'cancelled' ? 'Đã hủy' :
                                     session.status}
                              size="small"
                              color={session.status === 'confirmed' ? 'success' : 
                                     session.status === 'pending' ? 'warning' :
                                     session.status === 'completed' ? 'info' :
                                     session.status === 'cancelled' ? 'error' :
                                     'default'}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} text-center`}>
                  <Event className={`w-12 h-12 mx-auto mb-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                  <p className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Không có lịch sử sử dụng phòng
                  </p>
                  <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Trong khoảng thời gian từ {formatDateTime(roomDateFilter.startDate + 'T00:00:00.000Z').date} đến {formatDateTime(roomDateFilter.endDate + 'T23:59:59.999Z').date}
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <MuiButton 
            onClick={() => setIsRoomDetailDialogOpen(false)}
            sx={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
          >
            Đóng
          </MuiButton>
        </DialogActions>
      </Dialog>

      {/* Optimize Dialog */}
      <Dialog
        open={isOptimizeDialogOpen}
        onClose={() => setIsOptimizeDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            color: theme === 'dark' ? '#ffffff' : '#111827'
          }
        }}
      >
        <DialogTitle sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
          Tạo Kế hoạch Tối ưu hóa
        </DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-4">
            {/* Focus Areas */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Lĩnh vực tập trung
              </label>
              <div className="space-y-2">
                {[
                  { value: 'workload', label: 'Workload' },
                  { value: 'group_balance', label: 'Cân bằng nhóm' },
                  { value: 'resource_conflicts', label: 'Xung đột tài nguyên' },
                  { value: 'utilization', label: 'Sử dụng tài nguyên' }
                ].map((area) => (
                  <FormControlLabel
                    key={area.value}
                    control={
                      <Checkbox
                        checked={focusAreas.includes(area.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFocusAreas([...focusAreas, area.value])
                          } else {
                            setFocusAreas(focusAreas.filter(a => a !== area.value))
                          }
                        }}
                        color="primary"
                      />
                    }
                    label={area.label}
                    sx={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                  />
                ))}
              </div>
            </div>

            {/* Constraints */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TextField
                fullWidth
                label="Max Workload/Tutor"
                type="number"
                value={constraints.maxWorkloadPerTutor}
                onChange={(e) => setConstraints({ ...constraints, maxWorkloadPerTutor: Number(e.target.value) })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: theme === 'dark' ? '#ffffff' : '#111827',
                    backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                    '& fieldset': {
                      borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                  },
                }}
              />
              <TextField
                fullWidth
                label="Min Group Size"
                type="number"
                value={constraints.minGroupSize}
                onChange={(e) => setConstraints({ ...constraints, minGroupSize: Number(e.target.value) })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: theme === 'dark' ? '#ffffff' : '#111827',
                    backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                    '& fieldset': {
                      borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                  },
                }}
              />
              <TextField
                fullWidth
                label="Max Group Size"
                type="number"
                value={constraints.maxGroupSize}
                onChange={(e) => setConstraints({ ...constraints, maxGroupSize: Number(e.target.value) })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: theme === 'dark' ? '#ffffff' : '#111827',
                    backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                    '& fieldset': {
                      borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                  },
                }}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <MuiButton 
            onClick={() => setIsOptimizeDialogOpen(false)}
            sx={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
          >
            Hủy
          </MuiButton>
          <MuiButton
            onClick={generateOptimizationPlan}
            variant="contained"
            disabled={optimizationLoading}
            sx={{
              backgroundColor: '#2563eb',
              '&:hover': {
                backgroundColor: '#1d4ed8',
              }
            }}
          >
            {optimizationLoading ? 'Đang tạo...' : 'Tạo Kế hoạch'}
          </MuiButton>
        </DialogActions>
      </Dialog>

      {/* Apply Dialog */}
      <Dialog
        open={isApplyDialogOpen}
        onClose={() => setIsApplyDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            color: theme === 'dark' ? '#ffffff' : '#111827'
          }
        }}
      >
        <DialogTitle sx={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
          Áp dụng Tối ưu hóa
        </DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-4">
            <Alert 
              severity="info"
              sx={{
                backgroundColor: theme === 'dark' ? '#1e3a8a' : '#dbeafe',
                color: theme === 'dark' ? '#ffffff' : '#1e40af'
              }}
            >
              Kế hoạch tối ưu hóa sẽ được gửi dưới dạng yêu cầu phê duyệt. Vui lòng chờ phê duyệt từ management trước khi áp dụng.
            </Alert>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Mô tả (tùy chọn)"
              value={optimizationDescription}
              onChange={(e) => setOptimizationDescription(e.target.value)}
              placeholder="Nhập mô tả cho yêu cầu phê duyệt..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: theme === 'dark' ? '#ffffff' : '#111827',
                  backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                  '& fieldset': {
                    borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                },
              }}
            />
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Số thay đổi đã chọn: {selectedChanges.size}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Tổng số thay đổi: {optimizationPlan?.changes?.length || 0}
              </p>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <MuiButton 
            onClick={() => setIsApplyDialogOpen(false)}
            sx={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
          >
            Hủy
          </MuiButton>
          <MuiButton
            onClick={applyOptimization}
            variant="contained"
            disabled={applyLoading || selectedChanges.size === 0}
            sx={{
              backgroundColor: '#2563eb',
              '&:hover': {
                backgroundColor: '#1d4ed8',
              }
            }}
          >
            {applyLoading ? 'Đang gửi...' : 'Gửi Yêu cầu Phê duyệt'}
          </MuiButton>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default ResourceAllocation
