import React, { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import api from '../../lib/api'
import { 
  Business as BuildingIcon,
  MeetingRoom as RoomIcon,
  CheckCircle,
  Cancel,
  Schedule,
  People,
  Computer,
  Videocam,
  VolumeUp,
  Mic,
  CameraAlt,
  Devices,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material'
import { Building, Room } from '../../../lib/types'

interface RoomSelectorProps {
  startTime: string
  endTime: string
  excludeSessionId?: string
  selectedRoom: string | null
  onSelectRoom: (roomName: string) => void
  required?: boolean
  equipmentRequirements?: string[] // Equipment requirements from tutor
}

const RoomSelector: React.FC<RoomSelectorProps> = ({
  startTime,
  endTime,
  excludeSessionId,
  selectedRoom,
  onSelectRoom,
  required = false,
  equipmentRequirements = []
}) => {
  const { theme } = useTheme()
  const [buildings, setBuildings] = useState<Building[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null)
  const [expandedFloors, setExpandedFloors] = useState<Set<string>>(new Set())
  const [expandedEquipmentRooms, setExpandedEquipmentRooms] = useState<Set<string>>(new Set())
  const [hasMatchingRooms, setHasMatchingRooms] = useState<boolean>(true)
  const [filterByEquipment, setFilterByEquipment] = useState<boolean>(false)

  useEffect(() => {
    const loadRooms = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await api.rooms.checkAvailability({
          startTime,
          endTime,
          excludeSessionId,
          equipmentRequirements: equipmentRequirements.length > 0 ? JSON.stringify(equipmentRequirements) : undefined
        })
        
        if (response.success && response.data) {
          setBuildings(response.data.buildings || [])
          setHasMatchingRooms(response.data.hasMatchingRooms ?? true)
          setFilterByEquipment(response.data.filterByEquipment ?? false)
          // Auto-select first building if available
          if (response.data.buildings && response.data.buildings.length > 0) {
            setSelectedBuildingId(response.data.buildings[0].id)
            // Expand first floor of first building
            if (response.data.buildings[0].floors && response.data.buildings[0].floors.length > 0) {
              setExpandedFloors(new Set([`${response.data.buildings[0].id}-${response.data.buildings[0].floors[0].floorNumber}`]))
            }
          }
        } else {
          setError(response.error || 'Không thể tải danh sách phòng học')
        }
      } catch (err: any) {
        console.error('Error loading rooms:', err)
        setError('Có lỗi xảy ra khi tải danh sách phòng học')
      } finally {
        setLoading(false)
      }
    }

    if (startTime && endTime) {
      loadRooms()
    }
  }, [startTime, endTime, excludeSessionId, equipmentRequirements])

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

  const toggleEquipment = (roomId: string) => {
    setExpandedEquipmentRooms(prev => {
      const newSet = new Set(prev)
      if (newSet.has(roomId)) {
        newSet.delete(roomId)
      } else {
        newSet.add(roomId)
      }
      return newSet
    })
  }

  const getEquipmentIcon = (equipment: string) => {
    const lower = equipment.toLowerCase()
    if (lower.includes('máy tính') || lower.includes('computer')) return <Computer className="w-4 h-4" />
    if (lower.includes('máy chiếu') || lower.includes('projector')) return <Videocam className="w-4 h-4" />
    if (lower.includes('âm thanh') || lower.includes('sound')) return <VolumeUp className="w-4 h-4" />
    if (lower.includes('micro')) return <Mic className="w-4 h-4" />
    if (lower.includes('camera')) return <CameraAlt className="w-4 h-4" />
    return null
  }

  const selectedBuilding = buildings.find(b => b.id === selectedBuildingId)

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
          Đang tải danh sách phòng học...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-800'}`}>
        <p>{error}</p>
      </div>
    )
  }

  if (buildings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
          Không có phòng học nào trong hệ thống
        </p>
      </div>
    )
  }

  // Get equipment requirements display names
  const equipmentNameMap: { [key: string]: string } = {
    'whiteboard': 'Bảng trắng',
    'projector': 'Máy chiếu',
    'computer': 'Máy tính',
    'sound_system': 'Hệ thống âm thanh',
    'microphone': 'Micro',
    'camera': 'Camera'
  }

  return (
    <div className="space-y-4">
      {/* Equipment Requirements Display */}
      {equipmentRequirements && equipmentRequirements.length > 0 && (
        <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
          <p className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-900'}`}>
            Yêu cầu thiết bị từ tutor:
          </p>
          <div className="flex flex-wrap gap-2">
            {equipmentRequirements.map((eqId, idx) => (
              <span
                key={idx}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  theme === 'dark' ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-800'
                }`}
              >
                {equipmentNameMap[eqId] || eqId}
              </span>
            ))}
          </div>
          {filterByEquipment && hasMatchingRooms && (
            <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>
              ✓ Đang hiển thị các phòng có đủ thiết bị yêu cầu
            </p>
          )}
          {equipmentRequirements.length > 0 && !hasMatchingRooms && (
            <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-700'}`}>
              ⚠ Không có phòng nào có đủ thiết bị yêu cầu. Đang hiển thị tất cả phòng có sẵn.
            </p>
          )}
        </div>
      )}

      {/* Building Selection */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          Chọn tòa nhà
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {buildings.map((building) => (
            <button
              key={building.id}
              type="button"
              onClick={() => {
                setSelectedBuildingId(building.id)
                // Expand first floor when selecting building
                if (building.floors && building.floors.length > 0) {
                  setExpandedFloors(new Set([`${building.id}-${building.floors[0].floorNumber}`]))
                }
              }}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedBuildingId === building.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : theme === 'dark'
                  ? 'border-gray-600 hover:border-gray-500 bg-gray-800'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <BuildingIcon className={`w-6 h-6 ${
                  selectedBuildingId === building.id
                    ? 'text-blue-600 dark:text-blue-400'
                    : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`} />
                <div className="text-left">
                  <p className={`font-semibold ${
                    selectedBuildingId === building.id
                      ? 'text-blue-900 dark:text-blue-300'
                      : theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {building.name}
                  </p>
                  {building.description && (
                    <p className={`text-xs mt-1 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {building.description}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Rooms by Floor */}
      {selectedBuilding && (
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Chọn phòng học {required && <span className="text-red-500">*</span>}
          </label>
          <div className="space-y-3">
            {selectedBuilding.floors.map((floor) => {
              const floorKey = `${selectedBuilding.id}-${floor.floorNumber}`
              const isExpanded = expandedFloors.has(floorKey)
              
              // Count available and busy rooms
              const availableRooms = floor.rooms.filter((r: any) => r.isAvailable).length
              const busyRooms = floor.rooms.filter((r: any) => !r.isAvailable).length
              
              return (
                <div
                  key={floor.floorNumber}
                  className={`rounded-lg border ${
                    theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                  }`}
                >
                  {/* Floor Header */}
                  <button
                    type="button"
                    onClick={() => toggleFloor(selectedBuilding.id, floor.floorNumber)}
                    className={`w-full p-4 flex items-center justify-between hover:bg-opacity-50 transition-colors ${
                      theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <RoomIcon className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} />
                      <div className="text-left">
                        <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          Tầng {floor.floorNumber}
                        </p>
                        <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {availableRooms} phòng trống • {busyRooms} phòng bận
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {isExpanded ? '▼' : '▶'}
                    </span>
                  </button>

                  {/* Rooms Grid */}
                  {isExpanded && (
                    <div className="p-4 pt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {floor.rooms.map((room: any) => {
                          const isSelected = selectedRoom === room.name || selectedRoom === room.code
                          const isAvailable = room.isAvailable
                          
                          return (
                            <button
                              key={room.id}
                              type="button"
                              onClick={() => {
                                if (isAvailable) {
                                  onSelectRoom(room.name)
                                }
                              }}
                              disabled={!isAvailable}
                              className={`p-4 rounded-lg border-2 transition-all text-left ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                  : isAvailable
                                  ? theme === 'dark'
                                    ? 'border-gray-600 hover:border-gray-500 bg-gray-800 hover:bg-gray-700'
                                    : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                                  : theme === 'dark'
                                  ? 'border-gray-700 bg-gray-900 opacity-60 cursor-not-allowed'
                                  : 'border-gray-300 bg-gray-100 opacity-60 cursor-not-allowed'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <RoomIcon className={`w-5 h-5 ${
                                    isSelected
                                      ? 'text-blue-600 dark:text-blue-400'
                                      : isAvailable
                                      ? theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                      : theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                                  }`} />
                                  <span className={`font-semibold ${
                                    isSelected
                                      ? 'text-blue-900 dark:text-blue-300'
                                      : theme === 'dark' ? 'text-white' : 'text-gray-900'
                                  }`}>
                                    {room.name}
                                  </span>
                                </div>
                                {isSelected && (
                                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                )}
                                {!isAvailable && (
                                  <Cancel className="w-5 h-5 text-red-500" />
                                )}
                              </div>
                              
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2 text-xs">
                                  <People className={`w-4 h-4 ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                  }`} />
                                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                    Sức chứa: {room.capacity} người
                                  </span>
                                </div>
                                
                                {room.equipment && room.equipment.length > 0 && (
                                  <div className="mt-2">
                                    {/* Equipment Button - Using div instead of button to avoid nesting */}
                                    <div
                                      role="button"
                                      tabIndex={0}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        toggleEquipment(room.id)
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                          e.preventDefault()
                                          e.stopPropagation()
                                          toggleEquipment(room.id)
                                        }
                                      }}
                                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                                        expandedEquipmentRooms.has(room.id)
                                          ? theme === 'dark'
                                          ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-900'
                                          : theme === 'dark'
                                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                      }`}
                                    >
                                      <div className="flex items-center space-x-1.5">
                                        <Devices className="w-3.5 h-3.5" />
                                        <span>Thiết bị ({room.equipment.length})</span>
                                      </div>
                                      {expandedEquipmentRooms.has(room.id) ? (
                                        <ExpandLess className="w-3.5 h-3.5" />
                                      ) : (
                                        <ExpandMore className="w-3.5 h-3.5" />
                                      )}
                                    </div>
                                    
                                    {/* Equipment List */}
                                    {expandedEquipmentRooms.has(room.id) && (
                                      <div className={`mt-2 p-2 rounded border ${
                                        theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                                      }`}>
                                        <div className="space-y-1.5">
                                          {room.equipment.map((eq: string, idx: number) => (
                                            <div
                                              key={idx}
                                              className={`flex items-center space-x-2 text-xs py-1 px-2 rounded ${
                                                theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                                              }`}
                                            >
                                              {getEquipmentIcon(eq) && (
                                                <span className={`flex-shrink-0 ${
                                                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                                }`}>
                                                  {getEquipmentIcon(eq)}
                                                </span>
                                              )}
                                              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                                                {eq}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {!isAvailable && room.conflictingInfo && (
                                  <div className={`mt-2 p-2 rounded text-xs ${
                                    theme === 'dark' ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-800'
                                  }`}>
                                    <div className="flex items-center space-x-1 mb-1">
                                      <Schedule className="w-3 h-3" />
                                      <span className="font-medium">Đang được sử dụng</span>
                                    </div>
                                    <p>
                                      {room.conflictingInfo.type === 'session' 
                                        ? `Session: ${room.conflictingInfo.subject}`
                                        : `Lớp: ${room.conflictingInfo.code} - ${room.conflictingInfo.subject}`
                                      }
                                    </p>
                                    <p className="mt-1">
                                      {new Date(room.conflictingInfo.startTime).toLocaleTimeString('vi-VN', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })} - {new Date(room.conflictingInfo.endTime).toLocaleTimeString('vi-VN', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {selectedRoom && (
        <div className={`p-3 rounded-lg ${
          theme === 'dark' ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className={`font-medium ${theme === 'dark' ? 'text-blue-300' : 'text-blue-900'}`}>
              Đã chọn: {selectedRoom}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default RoomSelector

