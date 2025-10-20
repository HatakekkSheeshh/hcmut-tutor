import React, { useRef } from 'react'
import { Card, CardContent, Typography, Chip, Box } from '@mui/material'
import { AccessTime, LocationOn, Person } from '@mui/icons-material'
import { Session } from '../../types/calendar'
import { useTheme } from '../../contexts/ThemeContext'
import { animateSessionCardHover, animateSessionCardClick } from '../../utils/calendarAnimations'

interface SessionCardProps {
  session: Session
  onClick: (session: Session) => void
  isCompact?: boolean
  showTutor?: boolean
  showStudent?: boolean
}

const SessionCard: React.FC<SessionCardProps> = ({
  session,
  onClick,
  isCompact = false,
  showTutor = true,
  showStudent = false
}) => {
  const { theme } = useTheme()
  const cardRef = useRef<HTMLDivElement>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return theme === 'dark' ? '#3b82f6' : '#2563eb'
      case 'completed':
        return theme === 'dark' ? '#10b981' : '#059669'
      case 'cancelled':
        return theme === 'dark' ? '#ef4444' : '#dc2626'
      case 'rescheduled':
        return theme === 'dark' ? '#f59e0b' : '#d97706'
      default:
        return theme === 'dark' ? '#6b7280' : '#9ca3af'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Scheduled'
      case 'completed':
        return 'Completed'
      case 'cancelled':
        return 'Cancelled'
      case 'rescheduled':
        return 'Rescheduled'
      default:
        return status
    }
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const handleClick = () => {
    if (cardRef.current) {
      animateSessionCardClick(cardRef.current)
    }
    onClick(session)
  }

  const handleMouseEnter = () => {
    if (cardRef.current) {
      animateSessionCardHover(cardRef.current, true)
    }
  }

  const handleMouseLeave = () => {
    if (cardRef.current) {
      animateSessionCardHover(cardRef.current, false)
    }
  }

  return (
    <Card
      ref={cardRef}
      className="session-card"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme === 'dark' 
            ? '0 8px 25px rgba(0, 0, 0, 0.3)' 
            : '0 8px 25px rgba(0, 0, 0, 0.15)',
        },
        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
        border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
        borderRadius: '12px',
        overflow: 'hidden',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '4px',
          height: '100%',
          backgroundColor: session.color,
        }
      }}
    >
      <CardContent sx={{ p: isCompact ? 1.5 : 2 }}>
        {/* Header with subject and status */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography
            variant={isCompact ? 'body2' : 'subtitle2'}
            sx={{
              fontWeight: 600,
              color: theme === 'dark' ? '#ffffff' : '#111827',
              fontSize: isCompact ? '0.875rem' : '1rem',
              lineHeight: 1.2
            }}
          >
            {session.subject}
          </Typography>
          <Chip
            label={getStatusText(session.status)}
            size="small"
            sx={{
              backgroundColor: getStatusColor(session.status),
              color: '#ffffff',
              fontSize: '0.75rem',
              height: '20px',
              '& .MuiChip-label': {
                px: 1
              }
            }}
          />
        </Box>

        {/* Time */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <AccessTime sx={{ fontSize: 14, color: theme === 'dark' ? '#9ca3af' : '#6b7280', mr: 0.5 }} />
          <Typography
            variant="caption"
            sx={{
              color: theme === 'dark' ? '#9ca3af' : '#6b7280',
              fontSize: '0.75rem'
            }}
          >
            {formatTime(session.startTime)} - {formatTime(session.endTime)}
          </Typography>
        </Box>

        {/* Location */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationOn sx={{ fontSize: 14, color: theme === 'dark' ? '#9ca3af' : '#6b7280', mr: 0.5 }} />
          <Typography
            variant="caption"
            sx={{
              color: theme === 'dark' ? '#9ca3af' : '#6b7280',
              fontSize: '0.75rem'
            }}
          >
            {session.location.type === 'online' ? 'Online' : session.location.address}
          </Typography>
        </Box>

        {/* Tutor/Student */}
        {(showTutor && session.tutor) || (showStudent && session.student) ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Person sx={{ fontSize: 14, color: theme === 'dark' ? '#9ca3af' : '#6b7280', mr: 0.5 }} />
            <Typography
              variant="caption"
              sx={{
                color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                fontSize: '0.75rem'
              }}
            >
              {showTutor && session.tutor ? session.tutor.name : session.student?.name}
            </Typography>
          </Box>
        ) : null}

        {/* Notes preview (if not compact) */}
        {!isCompact && session.notes && (
          <Typography
            variant="caption"
            sx={{
              color: theme === 'dark' ? '#9ca3af' : '#6b7280',
              fontSize: '0.75rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mt: 1
            }}
          >
            {session.notes}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

export default SessionCard
