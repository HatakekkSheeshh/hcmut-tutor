import React, { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import {
  Checkbox,
  FormControlLabel,
  Chip,
  Box,
  Typography,
  Divider
} from '@mui/material'
import {
  Computer,
  Videocam,
  VolumeUp,
  Mic,
  CameraAlt,
  Devices,
  Edit as EditIcon
} from '@mui/icons-material'

// Available equipment types
const AVAILABLE_EQUIPMENT = [
  { id: 'whiteboard', name: 'Bảng trắng', icon: <EditIcon /> },
  { id: 'projector', name: 'Máy chiếu', icon: <Videocam /> },
  { id: 'computer', name: 'Máy tính', icon: <Computer /> },
  { id: 'sound_system', name: 'Hệ thống âm thanh', icon: <VolumeUp /> },
  { id: 'microphone', name: 'Micro', icon: <Mic /> },
  { id: 'camera', name: 'Camera', icon: <CameraAlt /> }
]

interface EquipmentSelectorProps {
  selectedEquipment: string[]
  onEquipmentChange: (equipment: string[]) => void
  required?: boolean
}

const EquipmentSelector: React.FC<EquipmentSelectorProps> = ({
  selectedEquipment,
  onEquipmentChange,
  required = false
}) => {
  const { theme } = useTheme()

  const handleToggleEquipment = (equipmentId: string) => {
    if (selectedEquipment.includes(equipmentId)) {
      onEquipmentChange(selectedEquipment.filter(id => id !== equipmentId))
    } else {
      onEquipmentChange([...selectedEquipment, equipmentId])
    }
  }

  const getEquipmentName = (id: string) => {
    return AVAILABLE_EQUIPMENT.find(eq => eq.id === id)?.name || id
  }

  const getEquipmentIcon = (id: string) => {
    return AVAILABLE_EQUIPMENT.find(eq => eq.id === id)?.icon || <Devices />
  }

  return (
    <Box>
      <Typography
        variant="subtitle2"
        sx={{
          color: theme === 'dark' ? '#ffffff' : '#111827',
          fontWeight: 600,
          mb: 2
        }}
      >
        Yêu cầu thiết bị {required && <span style={{ color: '#ef4444' }}>*</span>}
      </Typography>
      
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1.5,
          mb: 2
        }}
      >
        {AVAILABLE_EQUIPMENT.map((equipment) => {
          const isSelected = selectedEquipment.includes(equipment.id)
          return (
            <FormControlLabel
              key={equipment.id}
              control={
                <Checkbox
                  checked={isSelected}
                  onChange={() => handleToggleEquipment(equipment.id)}
                  sx={{
                    color: theme === 'dark' ? '#6b7280' : '#9ca3af',
                    '&.Mui-checked': {
                      color: theme === 'dark' ? '#3b82f6' : '#2563eb'
                    }
                  }}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      color: isSelected
                        ? theme === 'dark' ? '#3b82f6' : '#2563eb'
                        : theme === 'dark' ? '#6b7280' : '#9ca3af',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {equipment.icon}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: isSelected
                        ? theme === 'dark' ? '#ffffff' : '#111827'
                        : theme === 'dark' ? '#9ca3af' : '#6b7280',
                      fontWeight: isSelected ? 500 : 400
                    }}
                  >
                    {equipment.name}
                  </Typography>
                </Box>
              }
              sx={{
                margin: 0,
                padding: '8px 12px',
                borderRadius: '8px',
                border: `1px solid ${
                  isSelected
                    ? theme === 'dark' ? '#3b82f6' : '#2563eb'
                    : theme === 'dark' ? '#374151' : '#e5e7eb'
                }`,
                backgroundColor: isSelected
                  ? theme === 'dark' ? '#1e3a5f' : '#eff6ff'
                  : theme === 'dark' ? '#1f2937' : '#ffffff',
                '&:hover': {
                  backgroundColor: isSelected
                    ? theme === 'dark' ? '#1e3a5f' : '#eff6ff'
                    : theme === 'dark' ? '#374151' : '#f9fafb'
                }
              }}
            />
          )
        })}
      </Box>

      {selectedEquipment.length > 0 && (
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: theme === 'dark' ? '#9ca3af' : '#6b7280',
              mb: 1,
              display: 'block'
            }}
          >
            Đã chọn ({selectedEquipment.length}):
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {selectedEquipment.map((eqId) => (
              <Chip
                key={eqId}
                icon={getEquipmentIcon(eqId)}
                label={getEquipmentName(eqId)}
                size="small"
                sx={{
                  backgroundColor: theme === 'dark' ? '#3b82f6' : '#2563eb',
                  color: '#ffffff',
                  '& .MuiChip-icon': {
                    color: '#ffffff'
                  }
                }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default EquipmentSelector

