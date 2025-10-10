import React from 'react'
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material'

interface ButtonProps extends MuiButtonProps {
  variant?: 'contained' | 'outlined' | 'text'
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'contained',
  children,
  ...props 
}) => {
  return (
    <MuiButton variant={variant} {...props}>
      {children}
    </MuiButton>
  )
}

export default Button
