import React, { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { Avatar } from '@mui/material'
import {
  Dashboard as DashboardIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  MoreVert as MoreVertIcon,
  Menu as MenuIcon,
  BarChart as BarChartIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  VideoCall as VideoCallIcon,
  Chat as ChatIcon,
  Palette as PaletteIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiEmotionsIcon,
  MoreHoriz as MoreHorizIcon,
  OnlinePrediction as OnlinePredictionIcon
} from '@mui/icons-material'

const Messages: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [activeMenu, setActiveMenu] = useState('messages')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showThemeOptions, setShowThemeOptions] = useState(false)
  const [selectedChat, setSelectedChat] = useState<any>(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleMenuClick = (item: any) => {
    setActiveMenu(item.id)
    if (item.path) {
      navigate(item.path)
    }
  }

  const handleThemeToggle = () => {
    toggleTheme()
    setShowThemeOptions(false)
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

  // Mock data for conversations
  const conversations = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      type: 'tutor',
      lastMessage: 'Great work on today\'s session! Keep practicing those equations.',
      time: '2 min ago',
      unread: 1,
      online: true,
      avatar: 'SJ',
      subject: 'Mathematics'
    },
    {
      id: 2,
      name: 'Prof. Michael Chen',
      type: 'tutor',
      lastMessage: 'I\'ve prepared some additional materials for our next class.',
      time: '1 hour ago',
      unread: 0,
      online: false,
      avatar: 'MC',
      subject: 'Physics'
    },
    {
      id: 3,
      name: 'Dr. Emily Brown',
      type: 'tutor',
      lastMessage: 'Your homework submission was excellent!',
      time: '3 hours ago',
      unread: 2,
      online: true,
      avatar: 'EB',
      subject: 'Chemistry'
    },
    {
      id: 4,
      name: 'Prof. David Wilson',
      type: 'tutor',
      lastMessage: 'Let\'s schedule a review session for the upcoming exam.',
      time: '1 day ago',
      unread: 0,
      online: false,
      avatar: 'DW',
      subject: 'Biology'
    },
    {
      id: 5,
      name: 'Dr. Lisa Anderson',
      type: 'tutor',
      lastMessage: 'The project proposal looks promising!',
      time: '2 days ago',
      unread: 0,
      online: false,
      avatar: 'LA',
      subject: 'Computer Science'
    }
  ]

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, path: '/student' },
    { id: 'search', label: 'Search Tutors', icon: <SearchIcon />, path: '/student/search' },
    { id: 'book', label: 'Book Session', icon: <ScheduleIcon />, path: '/student/book' },
    { id: 'sessions', label: 'My Sessions', icon: <AssignmentIcon />, path: '/student/session' },
    { id: 'evaluate', label: 'Evaluate Session', icon: <BarChartIcon />, path: '/student/evaluate' },
    { id: 'progress', label: 'View Progress', icon: <BarChartIcon />, path: '/student/progress' },
    { id: 'chatbot', label: 'Chatbot Support', icon: <ChatIcon />, path: '/student/chatbot' },
    { id: 'messages', label: 'Messages', icon: <ChatIcon />, path: '/student/messages' }
  ]

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.subject.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Here you would typically send the message to your backend
      console.log('Sending message:', newMessage)
      setNewMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar - Sticky */}
        <div className={`w-full lg:w-60 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-r ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} lg:block`}>
          <div className="p-6">
            {/* Logo */}
            <div className="flex items-center mb-8">
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
                      activeMenu === item.id
                        ? 'bg-blue-100 text-blue-700'
                        : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div>
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                SETTINGS
              </h3>
              <div className="space-y-2">
                <button className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <PersonIcon className="mr-3 w-4 h-4" />
                  Profile
                </button>
                <button className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <NotificationsIcon className="mr-3 w-4 h-4" />
                  Notifications
                </button>
                <button 
                  onClick={() => setShowThemeOptions(!showThemeOptions)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <PaletteIcon className="mr-3 w-4 h-4" />
                  Theme
                </button>
                {showThemeOptions && (
                  <div className={`mt-2 ml-4 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="space-y-2">
                      <button 
                        onClick={handleThemeToggle}
                        className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                          theme === 'light' 
                            ? 'bg-blue-100 text-blue-700' 
                            : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-200'}`
                        }`}
                      >
                        {theme === 'dark' ? <LightModeIcon className="mr-3 w-4 h-4" /> : <DarkModeIcon className="mr-3 w-4 h-4" />}
                        {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                      </button>
                      <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} px-3 py-1`}>
                        Current: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-6">
          {/* Mobile Menu Button & Theme Toggle */}
          <div className="lg:hidden mb-4 flex items-center justify-between">
            <button
              onClick={handleDrawerToggle}
              className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <MenuIcon className="w-6 h-6" />
            </button>
            
            {/* Mobile Theme Toggle */}
            <button
              onClick={handleThemeToggle}
              className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} transition-colors`}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <LightModeIcon className="w-6 h-6 text-yellow-400" /> : <DarkModeIcon className="w-6 h-6" />}
            </button>
          </div>

          {/* Search Bar & Desktop Theme Toggle */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full px-4 py-3 pl-10 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <SearchIcon className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3">
                  Search
                </Button>
                
                {/* Desktop Theme Toggle */}
                <button
                  onClick={handleThemeToggle}
                  className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} transition-colors`}
                  title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                >
                  {theme === 'dark' ? <LightModeIcon className="w-5 h-5 text-yellow-400" /> : <DarkModeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>


          {/* Active Status Section */}
          <div className="mb-6">
            <div className={`rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Active Now
              </h3>
              <div className="flex space-x-4 overflow-x-auto pb-2">
                {/* Your Status */}
                <div className="flex flex-col items-center min-w-[80px]">
                  <div className="relative">
                    <div className={`w-16 h-16 rounded-full border-2 border-dashed ${theme === 'dark' ? 'border-gray-500' : 'border-gray-400'} flex items-center justify-center mb-2`}>
                      <div className={`w-8 h-8 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'} flex items-center justify-center`}>
                        <span className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>+</span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Your story
                  </span>
                </div>

                {/* Active Users */}
                {conversations.filter(conv => conv.online).slice(0, 6).map((conversation) => (
                  <div key={conversation.id} className="flex flex-col items-center min-w-[80px]">
                    <div className="relative">
                      <Avatar
                        sx={{
                          width: 64,
                          height: 64,
                          bgcolor: getAvatarColor(conversation.name),
                          fontSize: '1.5rem',
                          fontWeight: 'bold',
                          border: '3px solid #10b981'
                        }}
                      >
                        {conversation.avatar}
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <span className={`text-xs text-center mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {conversation.name.split(' ')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Messages Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[620px]">
            {/* Conversations List */}
            <div className={`lg:col-span-1 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} overflow-hidden`}
                 style={{
                   borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                   backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                   boxShadow: 'none !important'
                 }}>
              <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Messages
                </h2>
              </div>
              
              <div className="overflow-y-auto h-[540px]">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedChat(conversation)}
                    className={`p-4 border-b cursor-pointer transition-colors ${
                      selectedChat?.id === conversation.id
                        ? theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'
                        : theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    } ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar
                          sx={{
                            width: 48,
                            height: 48,
                            bgcolor: getAvatarColor(conversation.name),
                            fontSize: '1rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {conversation.avatar}
                        </Avatar>
                        {conversation.online && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className={`font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {conversation.name}
                          </h3>
                          <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {conversation.time}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-1">
                          <p className={`text-sm truncate ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            {conversation.lastMessage}
                          </p>
                          {conversation.unread > 0 && (
                            <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                              {conversation.unread}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            conversation.type === 'tutor' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {conversation.type === 'tutor' ? 'Tutor' : 'Student'}
                          </span>
                          <span className={`text-xs ml-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {conversation.subject}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className={`lg:col-span-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} flex flex-col overflow-hidden`}
                 style={{
                   borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                   backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                   boxShadow: 'none !important'
                 }}>
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: getAvatarColor(selectedChat.name),
                            fontSize: '0.875rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {selectedChat.avatar}
                        </Avatar>
                        {selectedChat.online && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div>
                        <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {selectedChat.name}
                        </h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {selectedChat.online ? 'Online' : 'Offline'} • {selectedChat.subject}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button 
                        className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        style={{
                          color: theme === 'dark' ? '#ffffff' : '#374151'
                        }}
                      >
                        <VideoCallIcon className="w-5 h-5" />
                      </button>
                      <button 
                        className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        style={{
                          color: theme === 'dark' ? '#ffffff' : '#374151'
                        }}
                      >
                        <MoreHorizIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {/* Sample messages */}
                    <div className="flex justify-start">
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        <p>{selectedChat.lastMessage}</p>
                        <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>10:30 AM</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'} text-white`}>
                        <p>Thank you for the feedback! I'll work on those areas.</p>
                        <span className={`text-xs ${theme === 'dark' ? 'text-blue-200' : 'text-blue-100'}`}>10:32 AM</span>
                      </div>
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center space-x-2">
                      <button 
                        className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        style={{
                          color: theme === 'dark' ? '#ffffff' : '#374151'
                        }}
                      >
                        <AttachFileIcon className="w-5 h-5" />
                      </button>
                      
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Type a message..."
                          className={`w-full px-4 py-2 rounded-lg border ${
                            theme === 'dark' 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>
                      
                      <button 
                        className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        style={{
                          color: theme === 'dark' ? '#ffffff' : '#374151'
                        }}
                      >
                        <EmojiEmotionsIcon className="w-5 h-5" />
                      </button>
                      
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
                        style={{
                          color: '#ffffff'
                        }}
                      >
                        <SendIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <ChatIcon className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                    <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Select a conversation
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Choose a conversation from the list to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Panel - Sticky */}
        <div className={`w-full lg:w-80 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-l ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} mt-6 lg:mt-0`}>
          <div className="p-6">
            {/* Profile Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Your Profile
              </h3>
              <button className="p-1">
                <MoreVertIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* User Profile */}
            <div className="text-center mb-8">
              <Avatar
                sx={{
                  width: 96,
                  height: 96,
                  bgcolor: getAvatarColor('Student User'),
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  mx: 'auto',
                  mb: 2
                }}
              >
                {getInitials('Student User')}
              </Avatar>
              <h4 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Good Morning Student
              </h4>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Continue your learning journey and achieve your goals
              </p>
            </div>

            {/* Social Links */}
            <div className="flex justify-center space-x-4 mb-8">
              <button className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                <FacebookIcon className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center text-white hover:bg-blue-500 transition-colors">
                <TwitterIcon className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white hover:bg-pink-600 transition-colors">
                <InstagramIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Online Status */}
            <div className="mb-8">
              <h4 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Online Status
              </h4>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Available for messages
                </span>
                <div className="flex items-center">
                  <OnlinePredictionIcon className="w-4 h-4 text-green-500 mr-2" />
                  <span className="text-sm text-green-500">Online</span>
                </div>
              </div>
            </div>

            {/* Recent Contacts */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Recent Contacts
                </h4>
                <button className="text-sm text-blue-600">
                  <MoreVertIcon className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-3">
                {conversations.slice(0, 4).map((contact, index) => (
                  <div key={index} className="flex items-center">
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: getAvatarColor(contact.name),
                        fontSize: '0.875rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {contact.avatar}
                    </Avatar>
                    <div className="flex-1 ml-3">
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {contact.name}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {contact.subject}
                      </p>
                    </div>
                    {contact.online && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
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

              {/* Mobile Navigation */}
              <div className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleMenuClick(item)
                      setMobileOpen(false)
                    }}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                      activeMenu === item.id
                        ? 'bg-blue-100 text-blue-700'
                        : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Mobile Settings */}
              <div className="mt-8">
                <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  SETTINGS
                </h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => {
                      navigate('/student/profile')
                      setMobileOpen(false)
                    }}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <PersonIcon className="mr-3 w-4 h-4" />
                    Profile
                  </button>
                  <button 
                    onClick={() => {
                      navigate('/student/notifications')
                      setMobileOpen(false)
                    }}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <NotificationsIcon className="mr-3 w-4 h-4" />
                    Notifications
                  </button>
                  <button 
                    onClick={() => setShowThemeOptions(!showThemeOptions)}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <PaletteIcon className="mr-3 w-4 h-4" />
                    Theme
                  </button>
                  {showThemeOptions && (
                    <div className={`mt-2 ml-4 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div className="space-y-2">
                        <button 
                          onClick={() => {
                            handleThemeToggle()
                            setMobileOpen(false)
                          }}
                          className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                            theme === 'light' 
                              ? 'bg-blue-100 text-blue-700' 
                              : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-200'}`
                          }`}
                        >
                          {theme === 'dark' ? <LightModeIcon className="mr-3 w-4 h-4" /> : <DarkModeIcon className="mr-3 w-4 h-4" />}
                          {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                        </button>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} px-3 py-1`}>
                          Current: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Messages
