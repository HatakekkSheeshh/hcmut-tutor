import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { 
  Send, 
  SmartToy, 
  Person,
  Menu as MenuIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  History as HistoryIcon,
  Chat as ChatIcon,
  Dashboard as DashboardIcon,
  PersonSearch,
  Schedule,
  BarChart as BarChartIcon,
  Star,
  Class,
  School,
  Quiz,
  CalendarToday,
  Lightbulb,
  HelpOutline,
  ExpandMore,
  ExpandLess,
  Language as LanguageIcon
} from '@mui/icons-material'
import { chatbotAPI } from '../../lib/api'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

const ChatbotSupportMobile: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [currentLang, setCurrentLang] = useState(i18n.language)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: t('chatbotSupport.welcomeMessage'),
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>(undefined)
  const [conversations, setConversations] = useState<any[]>([])
  const [loadingConversations, setLoadingConversations] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<{ [key: number]: boolean }>({
    0: true,
    1: true,
  })
  
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang)
    setCurrentLang(lang)
  }
  
  useEffect(() => {
    setCurrentLang(i18n.language)
    // Update welcome message when language changes
    if (messages.length === 1 && messages[0].sender === 'bot' && messages[0].id === '1') {
      setMessages([{
        id: '1',
        text: t('chatbotSupport.welcomeMessage'),
        sender: 'bot',
        timestamp: new Date()
      }])
    }
  }, [i18n.language, t])
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const isInitialLoad = useRef(true)
  const previousMessagesLength = useRef(0)
  const hasUserInteracted = useRef(false)

  // Sample questions categorized by topic
  const questionCategories = [
    {
      title: t('chatbotSupport.questionCategories.bookingSchedule'),
      icon: <CalendarToday className="w-4 h-4" />,
      questions: [
        t('chatbotSupport.questions.bookSessionMath'),
        t('chatbotSupport.questions.scheduleThisWeek'),
        t('chatbotSupport.questions.rescheduleSession'),
        t('chatbotSupport.questions.subjectsAvailable'),
        t('chatbotSupport.questions.cancelSession')
      ]
    },
    {
      title: t('chatbotSupport.questionCategories.tutorsClasses'),
      icon: <School className="w-4 h-4" />,
      questions: [
        t('chatbotSupport.questions.whoIsMyTutor'),
        t('chatbotSupport.questions.classesEnrolled'),
        t('chatbotSupport.questions.findTutorPhysics'),
        t('chatbotSupport.questions.bestRatingTutor'),
        t('chatbotSupport.questions.viewTutorInfo')
      ]
    },
    {
      title: t('chatbotSupport.questionCategories.progressGrades'),
      icon: <BarChartIcon className="w-4 h-4" />,
      questions: [
        t('chatbotSupport.questions.howAreMyGrades'),
        t('chatbotSupport.questions.viewLearningProgress'),
        t('chatbotSupport.questions.subjectsToImprove'),
        t('chatbotSupport.questions.sessionsCompleted')
      ]
    },
    {
      title: t('chatbotSupport.questionCategories.learningSupport'),
      icon: <Lightbulb className="w-4 h-4" />,
      questions: [
        t('chatbotSupport.questions.studyTips'),
        t('chatbotSupport.questions.improveGrades'),
        t('chatbotSupport.questions.helpWithHomework'),
        t('chatbotSupport.questions.effectiveStudyWay')
      ]
    },
    {
      title: t('chatbotSupport.questionCategories.otherQuestions'),
      icon: <HelpOutline className="w-4 h-4" />,
      questions: [
        t('chatbotSupport.questions.systemFeatures'),
        t('chatbotSupport.questions.contactTutor'),
        t('chatbotSupport.questions.studyOnline'),
        t('chatbotSupport.questions.howToUseSystem')
      ]
    }
  ]

  const menuItems = [
    { id: 'dashboard', label: t('dashboard.menu.dashboard'), icon: <DashboardIcon />, path: '/student' },
    { id: 'search-tutors', label: t('dashboard.menu.findTutors'), icon: <PersonSearch />, path: '/student/search' },
    { id: 'book-session', label: t('dashboard.menu.bookSession'), icon: <Schedule />, path: '/student/book' },
    { id: 'view-progress', label: t('dashboard.menu.viewProgress'), icon: <BarChartIcon />, path: '/student/progress' },
    { id: 'evaluate-session', label: t('dashboard.menu.evaluateSession'), icon: <Star />, path: '/student/evaluate' },
    { id: 'session-detail', label: t('dashboard.menu.sessionDetails'), icon: <Class />, path: '/student/session' },
    { id: 'chatbot-support', label: t('dashboard.menu.aiSupport'), icon: <SmartToy />, path: '/student/chatbot' }
  ]

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }

  // Handle theme toggle
  const handleThemeToggle = () => {
    toggleTheme()
  }

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 128)}px`
    }
  }, [inputText])

  // Load conversations list on mount
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoadingConversations(true)
        const response = await chatbotAPI.getHistory()
        if (response.success && response.data.conversations) {
          setConversations(response.data.conversations)
          
          // Auto-load the most recent conversation if available
          if (response.data.conversations.length > 0 && !conversationId) {
            const mostRecent = response.data.conversations[0]
            setConversationId(mostRecent.id)
          }
        }
      } catch (error) {
        console.error('Failed to load conversations:', error)
      } finally {
        setLoadingConversations(false)
      }
    }

    loadConversations()
  }, [])

  // Load conversation history when conversationId changes
  useEffect(() => {
    const loadHistory = async () => {
      if (!conversationId) {
        setMessages([{
          id: '1',
          text: t('chatbotSupport.welcomeMessage'),
          sender: 'bot',
          timestamp: new Date()
        }])
        previousMessagesLength.current = 1
        return
      }

      try {
        const response = await chatbotAPI.getHistory(conversationId, 50)
        if (response.success && response.data.conversation) {
          const historyMessages: Message[] = response.data.messages.map((msg: any) => ({
            id: msg.id,
            text: msg.content,
            sender: msg.role === 'user' ? 'user' : 'bot',
            timestamp: new Date(msg.createdAt)
          }))
          if (historyMessages.length > 0) {
            setMessages(historyMessages)
            previousMessagesLength.current = historyMessages.length
          }
        }
      } catch (error) {
        console.error('Failed to load conversation history:', error)
      }
    }

    loadHistory()
  }, [conversationId])

  // Scroll to bottom when messages or typing state changes
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false
      previousMessagesLength.current = messages.length
      return
    }
    
    if (hasUserInteracted.current && messages.length > previousMessagesLength.current) {
      previousMessagesLength.current = messages.length
      setTimeout(() => {
        scrollToBottom()
      }, 100)
    }
    
    if (isTyping && hasUserInteracted.current) {
      setTimeout(() => {
        scrollToBottom()
      }, 100)
    }
  }, [messages, isTyping])

  const handleSendMessage = async () => {
    if (!inputText.trim()) return

    hasUserInteracted.current = true

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = inputText
    setInputText('')
    setIsTyping(true)

    setTimeout(() => {
      scrollToBottom()
      inputRef.current?.focus()
    }, 100)

    try {
      const response = await chatbotAPI.chat(currentInput, conversationId)
      
      if (response.success) {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: response.data.message,
          sender: 'bot',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botResponse])
        
        if (response.data.conversationId) {
          setConversationId(response.data.conversationId)
          
          // Refresh conversations list
          const refreshResponse = await chatbotAPI.getHistory()
          if (refreshResponse.success && refreshResponse.data.conversations) {
            setConversations(refreshResponse.data.conversations)
          }
        }
      } else {
        throw new Error(response.error || 'Failed to get response')
      }
    } catch (error: any) {
      console.error('Chatbot error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: error.message || t('chatbotSupport.errorOccurred'),
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleQuestionClick = async (question: string) => {
    hasUserInteracted.current = true
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: question,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsTyping(true)

    try {
      const response = await chatbotAPI.chat(question, conversationId)
      if (response.success && response.data) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.data.message,
          sender: 'bot',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botMessage])
        
        if (response.data.conversationId) {
          setConversationId(response.data.conversationId)
          
          const refreshResponse = await chatbotAPI.getHistory()
          if (refreshResponse.success && refreshResponse.data.conversations) {
            setConversations(refreshResponse.data.conversations)
          }
        }
      } else {
        throw new Error(response.message || 'Failed to get response')
      }
    } catch (error: any) {
      console.error('Chatbot error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: error.message || t('chatbotSupport.errorOccurred'),
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSelectConversation = (convId: string) => {
    setConversationId(convId)
    setShowHistory(false)
    hasUserInteracted.current = false
  }

  const handleNewConversation = () => {
    setConversationId(undefined)
    setMessages([{
      id: '1',
      text: t('chatbotSupport.welcomeMessage'),
      sender: 'bot',
      timestamp: new Date()
    }])
    setShowHistory(false)
    hasUserInteracted.current = false
    isInitialLoad.current = true
    previousMessagesLength.current = 1
  }

  const toggleCategory = (index: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return t('chatbotSupport.today')
    if (diffDays === 1) return t('chatbotSupport.yesterday')
    if (diffDays < 7) return t('chatbotSupport.daysAgo', { days: diffDays })
    return date.toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className={`fixed inset-0 flex flex-col ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Minimal Header - ChatGPT style */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <div className="flex items-center flex-1 min-w-0">
          <button
            onClick={() => navigate('/student')}
            className={`p-2 rounded-lg mr-2 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <ArrowBackIcon className="w-5 h-5" />
          </button>
          <h1 className={`text-base font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('chatbotSupport.mobile.aiAssistant')}
          </h1>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <HistoryIcon className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
          </button>
          <button
            onClick={() => changeLanguage(currentLang === 'vi' ? 'en' : 'vi')}
            className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <LanguageIcon className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
          </button>
          <button
            onClick={handleThemeToggle}
            className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            {theme === 'dark' ? <LightModeIcon className="w-5 h-5 text-yellow-400" /> : <DarkModeIcon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <MenuIcon className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
          </button>
        </div>
      </div>

      {/* Chat History Sidebar */}
      {showHistory && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowHistory(false)}></div>
          <div className={`fixed right-0 top-0 h-full w-80 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
            <div className="p-4 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('chatbotSupport.chatHistory')}
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleNewConversation}
                    className={`px-3 py-1.5 text-xs rounded border ${
                      theme === 'dark'
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {t('chatbotSupport.new')}
                  </button>
                  <button
                    onClick={() => setShowHistory(false)}
                    className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <CloseIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-1">
                {loadingConversations ? (
                  <div className={`text-center py-8 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('chatbotSupport.loading')}
                  </div>
                ) : conversations.length === 0 ? (
                  <div className={`text-center py-8 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('chatbotSupport.noPreviousConversations')}
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg border transition-colors ${
                        conversationId === conv.id
                          ? theme === 'dark'
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-blue-50 border-blue-300 text-blue-900'
                          : theme === 'dark'
                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                            : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start">
                        <ChatIcon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate mb-1">
                            {conv.lastMessage?.content?.substring(0, 40) || t('chatbotSupport.noPreviousConversations')}
                            {conv.lastMessage?.content && conv.lastMessage.content.length > 40 ? '...' : ''}
                          </p>
                          <p className={`text-xs ${conversationId === conv.id ? 'text-blue-200' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {formatDate(conv.updatedAt)} • {conv.messageCount} {t('chatbotSupport.messages')}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages Container - Full height */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6"
      >
        {/* Show question suggestions when chat is new */}
        {messages.length <= 1 && !isTyping && (
          <div className="mb-6">
            <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center mb-3">
                <Lightbulb className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`} />
                <h4 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('chatbotSupport.youCanAskMe')}
                </h4>
              </div>
              <div className="space-y-2">
                {questionCategories.slice(0, 3).map((category, catIdx) => (
                  <div key={catIdx}>
                    <p className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {category.title}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {category.questions.slice(0, 2).map((question, qIdx) => (
                        <button
                          key={qIdx}
                          onClick={() => handleQuestionClick(question)}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                            theme === 'dark'
                              ? 'border-gray-500 text-gray-300 hover:bg-gray-500'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-6`}
          >
            <div className={`flex items-start max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.sender === 'user' 
                  ? 'ml-3 bg-blue-600' 
                  : 'mr-3 bg-gradient-to-br from-purple-500 to-blue-500'
              }`}>
                {message.sender === 'user' ? (
                  <Person className="w-4 h-4 text-white" />
                ) : (
                  <SmartToy className="w-4 h-4 text-white" />
                )}
              </div>
              <div className={`rounded-2xl px-4 py-3 ${
                message.sender === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-sm' 
                  : `${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'} rounded-tl-sm`
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start mb-6">
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mr-3 flex-shrink-0">
                <SmartToy className="w-4 h-4 text-white" />
              </div>
              <div className={`rounded-2xl rounded-tl-sm px-4 py-3 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'}`}>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Sample Questions Panel - Collapsible */}
      {messages.length <= 1 && (
        <div className={`border-t px-4 py-3 ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {questionCategories.map((category, catIndex) => (
              <div
                key={catIndex}
                className={`border rounded-lg ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}
              >
                <button
                  onClick={() => toggleCategory(catIndex)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-t-lg ${
                    theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                  } transition-colors`}
                >
                  <div className="flex items-center">
                    <span className="mr-2">{category.icon}</span>
                    <span className="text-xs font-medium">{category.title}</span>
                  </div>
                  {expandedCategories[catIndex] ? (
                    <ExpandLess className="w-4 h-4" />
                  ) : (
                    <ExpandMore className="w-4 h-4" />
                  )}
                </button>
                {expandedCategories[catIndex] && (
                  <div className="p-2 space-y-1.5">
                    {category.questions.map((question, qIndex) => (
                      <button
                        key={qIndex}
                        onClick={() => handleQuestionClick(question)}
                        className={`w-full text-left px-2.5 py-1.5 rounded border text-xs transition-colors ${
                          theme === 'dark'
                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                            : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Bar - Fixed at bottom - ChatGPT style */}
      <div className={`border-t px-4 py-3 ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              placeholder={t('chatbotSupport.mobile.messageAI')}
              rows={1}
              className={`w-full px-4 py-3 pr-12 rounded-2xl resize-none text-sm ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
              } border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all max-h-32 overflow-y-auto`}
              style={{
                minHeight: '44px',
                maxHeight: '128px'
              }}
            />
            {inputText.trim() && (
              <button
                onClick={handleSendMessage}
                className={`absolute right-2 bottom-2 p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-lg`}
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <p className={`text-xs text-center mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
          {t('chatbotSupport.aiCanMakeMistakes')}
        </p>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setMobileOpen(false)}></div>
          <div className={`fixed left-0 top-0 h-full w-80 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
            <div className="p-6 h-full flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-8 flex-shrink-0">
                <div 
                  className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => navigate('/student')}
                >
                  <div className="w-8 h-8 flex items-center justify-center mr-3">
                    <img src="/HCMCUT.png" alt="HCMUT Logo" className="w-8 h-8" />
                  </div>
                  <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    HCMUT
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <CloseIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="space-y-2">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        navigate(item.path)
                        setMobileOpen(false)
                      }}
                      className={`w-full flex items-center px-3 py-3 rounded-lg text-left transition-colors ${
                        theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatbotSupportMobile
