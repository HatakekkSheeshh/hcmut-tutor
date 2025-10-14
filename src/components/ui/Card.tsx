import React from 'react'
import { Card as MuiCard, CardContent, CardActions, CardHeader, CardMedia } from '@mui/material'

interface CardProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  image?: string
  actions?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

const Card: React.FC<CardProps> = ({ 
  children, 
  title, 
  subtitle, 
  image, 
  actions,
  className,
  style
}) => {
  return (
    <MuiCard 
      className={className} 
      elevation={0}
      style={{
        boxShadow: 'none',
        border: '1px solid',
        ...style
      }}
    >
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
