import React from 'react'
import { Card as MuiCard, CardContent, CardActions, CardHeader, CardMedia } from '@mui/material'

interface CardProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  image?: string
  actions?: React.ReactNode
  className?: string
}

const Card: React.FC<CardProps> = ({ 
  children, 
  title, 
  subtitle, 
  image, 
  actions,
  className 
}) => {
  return (
    <MuiCard className={className}>
      {title && (
        <CardHeader 
          title={title} 
          subheader={subtitle}
        />
      )}
      {image && (
        <CardMedia
          component="img"
          height="140"
          image={image}
          alt={title}
        />
      )}
      <CardContent>
        {children}
      </CardContent>
      {actions && (
        <CardActions>
          {actions}
        </CardActions>
      )}
    </MuiCard>
  )
}

export default Card
