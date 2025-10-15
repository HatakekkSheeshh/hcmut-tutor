import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import {
  PhoneAndroid as MobileIcon,
  Computer as DesktopIcon,
  Settings as SettingsIcon
} from '@mui/icons-material'

interface DeviceSwitchProps {
  onDeviceChange: (isMobile: boolean) => void
  currentDevice: 'mobile' | 'desktop'
}

const DeviceSwitch: React.FC<DeviceSwitchProps> = ({ onDeviceChange, currentDevice }) => {
  const { theme } = useTheme()
  const [showOptions, setShowOptions] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} transition-colors`}
        title="Switch Device View"
      >
        <SettingsIcon className="w-5 h-5" />
      </button>

      {showOptions && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowOptions(false)}
          ></div>
          <div className={`absolute right-0 top-12 w-48 p-2 rounded-lg shadow-lg border z-20 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="space-y-1">
              <button
                onClick={() => {
                  onDeviceChange(false)
                  setShowOptions(false)
                }}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                  currentDevice === 'desktop'
                    ? `${theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'}`
                    : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
                }`}
              >
                <DesktopIcon className="mr-3 w-4 h-4" />
                Desktop View
                {currentDevice === 'desktop' && (
                  <span className="ml-auto text-xs">✓</span>
                )}
              </button>
              
              <button
                onClick={() => {
                  onDeviceChange(true)
                  setShowOptions(false)
                }}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                  currentDevice === 'mobile'
                    ? `${theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'}`
                    : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
                }`}
              >
                <MobileIcon className="mr-3 w-4 h-4" />
                Mobile View
                {currentDevice === 'mobile' && (
                  <span className="ml-auto text-xs">✓</span>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default DeviceSwitch
