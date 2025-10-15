import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import DeviceDetector from './components/DeviceDetector'
import TutorDeviceDetector from './components/TutorDeviceDetector'
import CommonDeviceDetector from './components/CommonDeviceDetector'
import ManagementDeviceDetector from './components/ManagementDeviceDetector'
import WeatherEffectsDemo from './components/WeatherEffectsDemo'

function App() {
  return (
    <ThemeProvider>
      <Routes>
        {/* Student Routes */}
        <Route path="/student" element={<DeviceDetector />} />
        <Route path="/student/search" element={<DeviceDetector />} />
        <Route path="/student/book" element={<DeviceDetector />} />
        <Route path="/student/session" element={<DeviceDetector />} />
        <Route path="/student/session/:id" element={<DeviceDetector />} />
        <Route path="/student/evaluate" element={<DeviceDetector />} />
        <Route path="/student/evaluate/:id" element={<DeviceDetector />} />
        <Route path="/student/progress" element={<DeviceDetector />} />
        <Route path="/student/chatbot" element={<DeviceDetector />} />
        <Route path="/student/messages" element={<DeviceDetector />} />
        
        {/* Tutor Routes */}
        <Route path="/tutor" element={<TutorDeviceDetector />} />
        <Route path="/tutor/availability" element={<TutorDeviceDetector />} />
        <Route path="/tutor/sessions" element={<TutorDeviceDetector />} />
        <Route path="/tutor/cancel-reschedule" element={<TutorDeviceDetector />} />
        <Route path="/tutor/track-progress" element={<TutorDeviceDetector />} />
        <Route path="/tutor/messages" element={<TutorDeviceDetector />} />
        
        {/* Management Routes */}
        <Route path="/management" element={<ManagementDeviceDetector />} />
        <Route path="/management/approval" element={<ManagementDeviceDetector />} />
        <Route path="/management/reports" element={<ManagementDeviceDetector />} />
        <Route path="/management/awards" element={<ManagementDeviceDetector />} />
        
        {/* Common Screens Routes */}
        <Route path="/common" element={<CommonDeviceDetector />} />
        <Route path="/common/profile" element={<CommonDeviceDetector />} />
        <Route path="/common/library" element={<CommonDeviceDetector />} />
        <Route path="/common/forum" element={<CommonDeviceDetector />} />
        <Route path="/common/notifications" element={<CommonDeviceDetector />} />
        
        {/* Weather Effects Demo */}
        <Route path="/weather-demo" element={<WeatherEffectsDemo />} />

        {/* Default redirect to login */}
        <Route path="/" element={<CommonDeviceDetector />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App
