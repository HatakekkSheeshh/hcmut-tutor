import React, { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  Search,
  FilterList,
  Bookmark,
  Download,
  Share,
  Star,
  AccessTime,
  Person,
  TrendingUp,
  Menu as MenuIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Forum as ForumIcon,
  NotificationsActive as NotificationsIcon,
  Upload as UploadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Description,
  Visibility,
  Language as LanguageIcon
} from '@mui/icons-material'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { navigateToDashboard } from '../../utils/navigation'
import jsPDF from 'jspdf'
import { libraryAPI, authAPI } from '../../lib/api'
const DigitalLibraryAccess: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedFormat, setSelectedFormat] = useState('all')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentLang, setCurrentLang] = useState(i18n.language)

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang)
    setCurrentLang(lang)
  }

  useEffect(() => {
    setCurrentLang(i18n.language)
  }, [i18n.language])

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  // Live resources fetched from backend
  const [libraryResources, setLibraryResources] = useState<any[]>([])
  const [isLoadingResources, setIsLoadingResources] = useState(false)
  const [bookmarkPending, setBookmarkPending] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<any>(null)
  const [uploadForm, setUploadForm] = useState({
    title: '',
    author: '',
    subject: '',
    type: 'book',
    description: '',
    tags: '',
    url: ''
  })
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const categories = [
    { name: 'All', value: 'all', count: libraryResources.length }
  ]

  const formats = [
    { name: t('digitalLibrary.allFormats'), value: 'all' },
    { name: t('digitalLibrary.document'), value: 'Document' },
    { name: t('digitalLibrary.video'), value: 'Video' },
    { name: t('digitalLibrary.book'), value: 'Book' },
    { name: t('digitalLibrary.article'), value: 'Article' }
  ]

  // Filter resources locally for UI responsiveness; primary source is backend search
  const filteredResources = libraryResources.filter(resource => {
    const q = searchTerm.trim().toLowerCase()
    const matchesSearch = !q || (
      (resource.title || '').toLowerCase().includes(q) ||
      (resource.author || '').toLowerCase().includes(q) ||
      (resource.description || '').toLowerCase().includes(q) ||
      ((resource.tags || []) as string[]).join(' ').toLowerCase().includes(q) ||
      (resource.id || '').toLowerCase().includes(q)
    )
    const matchesCategory = selectedCategory === 'all' || (resource.subject || resource.category) === selectedCategory
    const matchesFormat = selectedFormat === 'all' || (resource.type || resource.format).toLowerCase() === selectedFormat.toLowerCase()
    return matchesSearch && matchesCategory && matchesFormat
  })

  // Fetch all materials from backend on mount or when searchTerm changes
  useEffect(() => {
    let mounted = true
    const fetchResources = async () => {
      try {
        setIsLoadingResources(true)
        
        // Use libraryAPI.search with proper filters
        const response = await libraryAPI.search({
          q: searchTerm.trim() || undefined,
          type: selectedFormat !== 'all' ? selectedFormat : undefined,
          subject: selectedCategory !== 'all' ? selectedCategory : undefined,
          page: pagination.page,
          limit: 100 // Get more results for better UX
        })

        if (mounted && response.success) {
          const data = response.data?.materials || response.data || []
          const enriched = Array.isArray(data) ? data.map((item: any) => ({
            ...item,
            isBookMarked: item.isBookMarked ?? false,
          })) : []
          
          setLibraryResources(enriched)
          
          // Update pagination if available
          if (response.data?.pagination) {
            setPagination(prev => ({
              ...prev,
              total: response.data.pagination.total || enriched.length
            }))
          }
          
          // Save to localStorage for offline access
          localStorage.setItem('libraryData', JSON.stringify(enriched))
        } else if (mounted) {
          // Fallback: try loading from localStorage
          const saved = localStorage.getItem('libraryData')
          if (saved) {
            try {
              const parsed = JSON.parse(saved)
              if (Array.isArray(parsed) && parsed.length > 0) {
                setLibraryResources(parsed)
                return
              }
            } catch (e) {
              console.warn('Failed to parse localStorage data:', e)
            }
          }
          setLibraryResources([])
        }
      } catch (e) {
        console.error('Failed to fetch library resources', e)
        // Fallback to localStorage on error
        if (mounted) {
          const saved = localStorage.getItem('libraryData')
          if (saved) {
            try {
              const parsed = JSON.parse(saved)
              if (Array.isArray(parsed) && parsed.length > 0) {
                setLibraryResources(parsed)
                return
              }
            } catch (parseErr) {
              console.warn('Failed to parse localStorage data:', parseErr)
            }
          }
          setLibraryResources([])
        }
      } finally {
        if (mounted) setIsLoadingResources(false)
      }
    }

    // Debounce quick typing: small delay
    const t = setTimeout(fetchResources, 250)
    return () => {
      mounted = false
      clearTimeout(t)
    }
  }, [searchTerm, selectedFormat, selectedCategory, pagination.page])

  // Load current user and check if admin
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const response = await authAPI.getMe()
        if (response.success && response.data) {
          const user = response.data
          setCurrentUser(user)
          setIsAdmin(user.role === 'management')
        }
      } catch (error) {
        console.error('Failed to load current user:', error)
      }
    }
    loadCurrentUser()
  }, [])

  // Fetch recommendations on mount
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoadingRecommendations(true)
        const response = await libraryAPI.getRecommendations({ limit: 8 })
        if (response.success) {
          const data = response.data?.materials || response.data || []
          setRecommendations(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error('Failed to fetch recommendations:', error)
      } finally {
        setIsLoadingRecommendations(false)
      }
    }

    fetchRecommendations()
  }, [])

  // Function to handle bookmark toggling with API call
  const handleBookmark = async (resourceId: string) => {
    if (bookmarkPending === resourceId) return
    
    setBookmarkPending(resourceId)
    
    try {
      // Optimistic update
      const previousResources = [...libraryResources]
      setLibraryResources(prevResources => {
        const updatedResources = prevResources.map(r =>
          r.id === resourceId
            ? { ...r, isBookMarked: !r.isBookMarked }
            : r
        )
        localStorage.setItem('libraryData', JSON.stringify(updatedResources))
        return updatedResources
      })

      // Call API to bookmark/unbookmark
      const response = await libraryAPI.bookmark(resourceId)
      
      if (!response.success) {
        // Revert on error
        setLibraryResources(previousResources)
        localStorage.setItem('libraryData', JSON.stringify(previousResources))
        console.error('Failed to bookmark:', response.error)
      }
    } catch (error: any) {
      console.error('Bookmark error:', error)
      // Revert on error
      const saved = localStorage.getItem('libraryData')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setLibraryResources(parsed)
        } catch (e) {
          console.error('Failed to revert bookmark state:', e)
        }
      }
    } finally {
      setBookmarkPending(null)
    }
  }
  

  const handleDownload = async (resource: any) => {
    try {
      // Check if this is an uploaded PDF (has pdfFileId or preview URL)
      if (resource.pdfFileId || (resource.url && resource.url.includes('/api/library/preview/'))) {
        // Extract PDF ID from URL or use pdfFileId
        let pdfId = resource.pdfFileId
        
        // If no pdfFileId, try to extract from URL
        if (!pdfId && resource.url) {
          const urlMatch = resource.url.match(/\/preview\/([^/?]+)/)
          if (urlMatch) {
            pdfId = urlMatch[1]
          }
        }
        
        if (pdfId) {
          // Get download URL with download=true parameter
          // This will make backend return Content-Disposition: attachment with original filename
          const downloadUrl = libraryAPI.getDownloadUrl(pdfId)
          
          // Create a temporary anchor element to trigger download
          // Browser will use the filename from Content-Disposition header
          const link = document.createElement('a')
          link.href = downloadUrl
          link.download = '' // Let browser use filename from Content-Disposition header
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          
          return
        }
      }
      
      // If it's an external URL, try to download it
      if (resource.url && (resource.url.startsWith('http://') || resource.url.startsWith('https://'))) {
        // For external URLs, open in new tab (browser will handle download if Content-Disposition is set)
        const link = document.createElement('a')
        link.href = resource.url
        link.download = resource.title ? `${resource.title}.pdf` : 'document.pdf'
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        return
      }
      
      // Fallback: Show message
      alert('Download not available for this resource')
    } catch (error: any) {
      console.error('Download error:', error)
      alert('Failed to download: ' + (error.message || 'Unknown error'))
    }
  }

  const handleShare = (resourceId: number) => {
    console.log('Share resource:', resourceId)
  }

  const handleViewPDF = (resource: any) => {
    console.log('🔍 handleViewPDF - resource:', { 
      id: resource.id, 
      pdfFileId: resource.pdfFileId, 
      url: resource.url 
    })
    
    // Check if this is an uploaded PDF (has pdfFileId or preview URL)
    if (resource.pdfFileId || (resource.url && resource.url.includes('/api/library/preview/'))) {
      // Extract PDF ID from URL or use pdfFileId
      let pdfId = resource.pdfFileId
      
      // If no pdfFileId, try to extract from URL
      if (!pdfId && resource.url) {
        const urlMatch = resource.url.match(/\/preview\/([^/?]+)/)
        if (urlMatch) {
          pdfId = urlMatch[1]
        }
      }
      
      console.log('📄 Extracted PDF ID:', pdfId)
      
      if (pdfId) {
        // Use resource title as filename hint for better browser display
        // Only add .pdf extension if title doesn't already have it
        let filename: string | undefined = undefined
        if (resource.title) {
          filename = resource.title.toLowerCase().endsWith('.pdf') 
            ? resource.title 
            : `${resource.title}.pdf`
        }
        const previewUrl = libraryAPI.getPreviewUrl(pdfId, filename)
        console.log('🔗 Preview URL:', previewUrl)
        window.open(previewUrl, '_blank')
        return
      } else {
        console.error('❌ Could not extract PDF ID from resource')
      }
    }

    // If it's an external URL, open it directly
    if (resource.url && (resource.url.startsWith('http://') || resource.url.startsWith('https://'))) {
      window.open(resource.url, '_blank')
      return
    }

    // Fallback: Generate PDF preview with resource info
    const doc = new jsPDF()

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.text(resource.title || 'Untitled Document', 10, 20)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)
    let y = 30

    const info = [
      ['ID', resource.id],
      ['Author', resource.author],
      ['Type', resource.type],
      ['Subject', resource.subject],
      ['Description', resource.description],
      ['Downloads', resource.downloads?.toString()],
      ['Views', resource.views?.toString()],
      ['Tags', (resource.tags || []).join(', ')],
      ['URL', resource.url || 'N/A'],
      ['Created At', resource.createdAt ? new Date(resource.createdAt).toLocaleString() : 'N/A'],
      ['Updated At', resource.updatedAt ? new Date(resource.updatedAt).toLocaleString() : 'N/A']
    ]

    info.forEach(([label, value]) => {
      doc.text(`${label}: ${value || 'N/A'}`, 10, y)
      y += 10
    })

    // ✅ Mở file PDF trong tab mới (xem trực tiếp)
    window.open(doc.output('bloburl'), '_blank')
  }


  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar - Sticky */}
        <div className={`w-full lg:w-60 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-r ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} lg:block`}>
          <div className="p-6">
            {/* Logo */}
            <div 
              className="flex items-center mb-8 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigateToDashboard(navigate)}
            >
              <div className="w-10 h-10 flex items-center justify-center mr-3">
                <img src="/HCMCUT.png" alt="HCMUT Logo" className="w-10 h-10" />
              </div>
              <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                HCMUT
              </span>
            </div>

            {/* Library Stats */}
            <div className="mb-8">
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('digitalLibrary.libraryStats')}
              </h3>
              <div className="space-y-3">
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('digitalLibrary.totalResources')}</span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {libraryResources.length}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('digitalLibrary.bookmarked')}</span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {libraryResources.filter(r => r.isBookMarked).length}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('digitalLibrary.downloaded')}</span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {libraryResources.filter(r => r.isDownloaded).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="mb-8">
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('digitalLibrary.categories')}
              </h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left ${
                      selectedCategory === category.value
                        ? 'bg-blue-100 text-blue-700'
                        : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
                    }`}
                  >
                    <span>{category.name}</span>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('digitalLibrary.quickActions')}
              </h3>
              <div className="space-y-2">
                <button 
                  onClick={() => navigateToDashboard(navigate)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors`}
                >
                  <ArrowBackIcon className="mr-3 w-4 h-4" />
                  {t('digitalLibrary.backToDashboard')}
                </button>
                <button 
                  onClick={() => navigate('/common/profile')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <PersonIcon className="mr-3 w-4 h-4" />
                  {t('digitalLibrary.profileManagement')}
                </button>
                <button 
                  onClick={() => navigate('/common/forum')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <ForumIcon className="mr-3 w-4 h-4" />
                  {t('digitalLibrary.communityForum')}
                </button>
                <button 
                  onClick={() => navigate('/common/notifications')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <NotificationsIcon className="mr-3 w-4 h-4" />
                  {t('digitalLibrary.notifications')}
                </button>
                <button 
                  onClick={() => changeLanguage(currentLang === 'vi' ? 'en' : 'vi')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <LanguageIcon className="mr-3 w-4 h-4" />
                  {currentLang === 'vi' ? 'English' : 'Tiếng Việt'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-6">
          {/* Mobile Menu Button */}
          <div className="lg:hidden mb-4">
            <button
              onClick={handleDrawerToggle}
              className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <MenuIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('digitalLibrary.title')}
            </h1>
            <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('digitalLibrary.subtitle')}
            </p>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Search */}
            <div className="lg:col-span-2">
              <Card 
                className={`p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                style={{
                  borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                  boxShadow: 'none !important'
                }}
              >
                <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('digitalLibrary.searchResources')}
                </h3>
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder={t('digitalLibrary.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full px-4 py-3 pl-10 rounded-lg border ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Search className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <select
                      value={selectedFormat}
                      onChange={(e) => setSelectedFormat(e.target.value)}
                      className={`w-full px-3 py-3 border rounded-lg ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      {formats.map((format) => (
                        <option key={format.value} value={format.value}>
                          {format.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      <FilterList className="w-4 h-4 mr-2" />
                      {t('digitalLibrary.advancedFilters')}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <Card 
                className={`p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                style={{
                  borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                  boxShadow: 'none !important'
                }}
              >
                <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('digitalLibrary.quickActionsTitle')}
                </h3>
                <div className="space-y-3">
                  {isAdmin && (
                    <button 
                      onClick={() => {
                        setUploadForm({
                          title: '',
                          author: '',
                          subject: '',
                          type: 'book',
                          description: '',
                          tags: '',
                          url: ''
                        })
                        setPdfFile(null) // Reset PDF file when opening upload modal
                        setShowUploadModal(true)
                      }}
                      className={`w-full flex items-center px-4 py-3 rounded-lg border bg-blue-600 text-white hover:bg-blue-700 transition-colors`}
                    >
                      <AddIcon className="mr-3 w-4 h-4" />
                      {t('digitalLibrary.addMaterial')}
                    </button>
                  )}
                  <button className={`w-full flex items-center px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  } transition-colors`}>
                    <Bookmark className="mr-3 w-4 h-4" />
                    {t('digitalLibrary.myBookmarks')}
                  </button>
                  <button className={`w-full flex items-center px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  } transition-colors`}>
                    <Download className="mr-3 w-4 h-4" />
                    {t('digitalLibrary.downloads')}
                  </button>
                  <button className={`w-full flex items-center px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  } transition-colors`}>
                    <TrendingUp className="mr-3 w-4 h-4" />
                    {t('digitalLibrary.trending')}
                  </button>
                </div>
              </Card>
            </div>
          </div>

          {/* Recommendations Section */}
          {recommendations.length > 0 && (
            <div className="mb-8">
              <Card 
                className={`p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                style={{
                  borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                  boxShadow: 'none !important'
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <TrendingUp className="inline w-5 h-5 mr-2" />
                    {t('digitalLibrary.recommendedForYou')}
                  </h3>
                </div>
                {isLoadingRecommendations ? (
                  <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('digitalLibrary.loadingRecommendations')}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {recommendations.slice(0, 4).map((resource) => (
                      <div
                        key={resource.id}
                        className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
                          theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                        onClick={() => handleViewPDF(resource)}
                      >
                        <h4 className={`font-medium mb-2 line-clamp-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {resource.title}
                        </h4>
                        <p className={`text-xs mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('digitalLibrary.by')} {resource.author}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 text-xs rounded ${theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                            {resource.type || resource.format}
                          </span>
                          <Star className="w-4 h-4 text-yellow-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Resources List */}
          {isLoadingResources ? (
            <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('digitalLibrary.loadingResources')}
            </div>
          ) : filteredResources.length === 0 ? (
            <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('digitalLibrary.noResourcesFound')}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <Card 
                key={resource.id} 
                className={`overflow-hidden border transition-all duration-200 hover:shadow-lg ${theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'}`}
                style={{
                  borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                  boxShadow: theme === 'dark' ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <div className="p-6">
                  {/* Resource Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0 pr-2">
                      <h3
                        onClick={() => handleViewPDF(resource)}
                        className={`font-semibold text-lg mb-2 cursor-pointer hover:text-blue-600 transition-colors line-clamp-2 ${theme === 'dark' ? 'text-white hover:text-blue-400' : 'text-gray-900'}`}>
                        {resource.title}
                      </h3>
                      <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t('digitalLibrary.by')} <span className="font-medium">{resource.author}</span>
                      </p>
                      <div className="flex items-center flex-wrap gap-2 mb-3">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-md ${theme === 'dark' ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-50 text-blue-700'}`}>
                          {resource.subject || resource.category || 'General'}
                        </span>
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-md ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                          {resource.type || resource.format || 'Document'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 flex-shrink-0">
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => {
                              setEditingMaterial(resource)
                              setPdfFile(null)
                              setUploadForm({
                                title: resource.title || '',
                                author: resource.author || '',
                                subject: resource.subject || resource.category || '',
                                type: resource.type || 'book',
                                description: resource.description || '',
                                tags: Array.isArray(resource.tags) ? resource.tags.join(', ') : '',
                                url: resource.url || ''
                              })
                              setShowEditModal(true)
                            }}
                            className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-100 hover:bg-blue-200 text-blue-700'}`}
                            title="Edit Material"
                          >
                            <EditIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm(t('digitalLibrary.deleteConfirm'))) {
                                try {
                                  const response = await libraryAPI.deleteMaterial(resource.id)
                                  if (response.success) {
                                    const refreshResponse = await libraryAPI.search({ limit: 100 })
                                    if (refreshResponse.success) {
                                      const data = refreshResponse.data?.materials || refreshResponse.data || []
                                      setLibraryResources(Array.isArray(data) ? data.map((item: any) => ({
                                        ...item,
                                        isBookMarked: item.isBookMarked ?? false,
                                      })) : [])
                                    }
                                  } else {
                                    alert(t('digitalLibrary.deleteFailed', { error: response.error || 'Unknown error' }))
                                  }
                                } catch (error: any) {
                                  alert(t('digitalLibrary.deleteFailed', { error: error.message || 'Unknown error' }))
                                }
                              }
                            }}
                            className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'bg-red-700 hover:bg-red-600 text-white' : 'bg-red-100 hover:bg-red-200 text-red-700'}`}
                            title="Delete Material"
                          >
                            <DeleteIcon className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleBookmark(resource.id)}
                        disabled={bookmarkPending === resource.id}
                        className={`p-2 rounded-lg transition-colors ${bookmarkPending === resource.id ? 'opacity-60 cursor-not-allowed' : ''} ${
                          resource.isBookMarked 
                            ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                            : `${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`
                        }`}
                        title={resource.isBookMarked ? 'Remove bookmark' : 'Bookmark'}
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleShare(resource.id)}
                        className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                        title="Share"
                      >
                        <Share className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Resource Details */}
                  <div className="space-y-3 mb-4">
                    {resource.description && (
                      <p className={`text-sm line-clamp-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {resource.description}
                      </p>
                    )}
                    <div className="flex items-center flex-wrap gap-4 text-xs">
                      {resource.rating && (
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {resource.rating}
                          </span>
                        </div>
                      )}
                      {resource.downloads !== undefined && (
                        <div className="flex items-center">
                          <Download className={`w-4 h-4 mr-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                          <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            {resource.downloads || 0}
                          </span>
                        </div>
                      )}
                      {(resource.pages || resource.duration) && (
                        <div className="flex items-center">
                          <AccessTime className={`w-4 h-4 mr-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                          <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            {resource.format === 'PDF' || resource.type === 'book' ? `${resource.pages || 'N/A'} ${t('digitalLibrary.pages')}` : resource.duration || 'N/A'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {resource.tags && resource.tags.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1.5">
                        {((resource.tags || []) as string[]).slice(0, 3).map((tag: string, index: number) => (
                          <span
                            key={index}
                            className={`px-2.5 py-1 text-xs font-medium rounded-full ${theme === 'dark' ? 'bg-blue-900/30 text-blue-300 border border-blue-800/50' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}
                          >
                            {tag}
                          </span>
                        ))}
                        {resource.tags.length > 3 && (
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                            +{resource.tags.length - 3} {t('digitalLibrary.more')}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button 
                      size="small" 
                      className={`flex-1 ${
                        resource.isDownloaded 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                      onClick={() => handleDownload(resource)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      {resource.isDownloaded ? t('digitalLibrary.downloaded') : t('digitalLibrary.download')}
                    </Button>
                    <Button 
                      size="small" 
                      variant="outlined"
                      className="flex-1"
                      onClick={() => handleViewPDF(resource)}
                      style={{
                        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                        color: theme === 'dark' ? '#ffffff' : '#1f2937',
                        borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                        textTransform: 'none',
                        fontWeight: '500'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#f3f4f6'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1f2937' : '#ffffff'
                      }}
                    >
                      <Visibility className="w-4 h-4 mr-1" />
                      {t('digitalLibrary.viewDocument')}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload/Edit Material Modal */}
      {(showUploadModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`w-full max-w-2xl mx-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {showEditModal ? t('digitalLibrary.editMaterial') : t('digitalLibrary.addNewMaterial')}
              </h2>
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  setShowEditModal(false)
                  setEditingMaterial(null)
                }}
                className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('digitalLibrary.titleLabel')} <span className="text-red-500">{t('digitalLibrary.titleRequired')}</span>
                </label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  placeholder={t('digitalLibrary.titlePlaceholder')}
                  className={`w-full px-4 py-2 border rounded-lg ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('digitalLibrary.authorLabel')} <span className="text-red-500">{t('digitalLibrary.authorRequired')}</span>
                  </label>
                  <input
                    type="text"
                    value={uploadForm.author}
                    onChange={(e) => setUploadForm({ ...uploadForm, author: e.target.value })}
                    placeholder={t('digitalLibrary.authorPlaceholder')}
                    className={`w-full px-4 py-2 border rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('digitalLibrary.subjectLabel')} <span className="text-red-500">{t('digitalLibrary.subjectRequired')}</span>
                  </label>
                  <input
                    type="text"
                    value={uploadForm.subject}
                    onChange={(e) => setUploadForm({ ...uploadForm, subject: e.target.value })}
                    placeholder={t('digitalLibrary.subjectPlaceholder')}
                    className={`w-full px-4 py-2 border rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('digitalLibrary.typeLabel')} <span className="text-red-500">{t('digitalLibrary.typeRequired')}</span>
                </label>
                <select
                  value={uploadForm.type}
                  onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value as any })}
                  className={`w-full px-4 py-2 border rounded-lg ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="book">Book</option>
                  <option value="article">Article</option>
                  <option value="thesis">Thesis</option>
                  <option value="video">Video</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('digitalLibrary.descriptionLabel')}
                </label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  placeholder={t('digitalLibrary.descriptionPlaceholder')}
                  rows={3}
                  className={`w-full px-4 py-2 border rounded-lg ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('digitalLibrary.pdfFile')}
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null
                    setPdfFile(file)
                    // Clear URL if PDF is uploaded
                    if (file) {
                      setUploadForm({ ...uploadForm, url: '' })
                    }
                  }}
                  className={`w-full px-4 py-2 border rounded-lg ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                {pdfFile && (
                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('digitalLibrary.selectedFile', { filename: pdfFile.name, size: (pdfFile.size / 1024 / 1024).toFixed(2) })}
                  </p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('digitalLibrary.urlLabel')} {pdfFile ? t('digitalLibrary.urlIgnored') : ''}
                </label>
                <input
                  type="text"
                  value={uploadForm.url}
                  onChange={(e) => setUploadForm({ ...uploadForm, url: e.target.value })}
                  placeholder={t('digitalLibrary.urlPlaceholder')}
                  disabled={!!pdfFile}
                  className={`w-full px-4 py-2 border rounded-lg ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } ${pdfFile ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('digitalLibrary.tagsLabel')}
                </label>
                <input
                  type="text"
                  value={uploadForm.tags}
                  onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                  placeholder={t('digitalLibrary.tagsPlaceholder')}
                  className={`w-full px-4 py-2 border rounded-lg ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowUploadModal(false)
                    setShowEditModal(false)
                    setEditingMaterial(null)
                    setPdfFile(null)
                    setUploadForm({
                      title: '',
                      author: '',
                      subject: '',
                      type: 'book',
                      description: '',
                      tags: '',
                      url: ''
                    })
                  }}
                  disabled={uploading}
                  className={`px-6 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {t('digitalLibrary.cancel')}
                </button>
                <button
                  onClick={async () => {
                    if (!uploadForm.title || !uploadForm.author || !uploadForm.subject) {
                      alert(t('digitalLibrary.fillRequiredFields'))
                      return
                    }

                    // Check if either PDF or URL is provided (or allow both to be empty for edit)
                    if (!pdfFile && !uploadForm.url && !showEditModal) {
                      alert(t('digitalLibrary.providePdfOrUrl'))
                      return
                    }

                    setUploading(true)
                    try {
                      let response
                      if (showEditModal && editingMaterial) {
                        response = await libraryAPI.updateMaterial(editingMaterial.id, {
                          title: uploadForm.title,
                          author: uploadForm.author,
                          subject: uploadForm.subject,
                          type: uploadForm.type as any,
                          description: uploadForm.description || undefined,
                          tags: uploadForm.tags ? uploadForm.tags.split(',').map(t => t.trim()) : undefined,
                          url: uploadForm.url || undefined,
                          pdfFile: pdfFile || undefined
                        })
                      } else {
                        response = await libraryAPI.createMaterial({
                          title: uploadForm.title,
                          author: uploadForm.author,
                          subject: uploadForm.subject,
                          type: uploadForm.type as any,
                          description: uploadForm.description || undefined,
                          tags: uploadForm.tags ? uploadForm.tags.split(',').map(t => t.trim()) : undefined,
                          url: uploadForm.url || undefined,
                          pdfFile: pdfFile || undefined
                        })
                      }

                      if (response.success) {
                        // Refresh resources
                        const refreshResponse = await libraryAPI.search({ limit: 100 })
                        if (refreshResponse.success) {
                          const data = refreshResponse.data?.materials || refreshResponse.data || []
                          setLibraryResources(Array.isArray(data) ? data.map((item: any) => ({
                            ...item,
                            isBookMarked: item.isBookMarked ?? false,
                            // Ensure pdfFileId is preserved
                            pdfFileId: item.pdfFileId || (item.url?.includes('/preview/') ? item.url.split('/preview/')[1]?.split('?')[0] : undefined)
                          })) : [])
                          console.log('📚 Refreshed resources:', data.map((item: any) => ({ 
                            id: item.id, 
                            title: item.title, 
                            pdfFileId: item.pdfFileId, 
                            url: item.url 
                          })))
                        }
                        
                        setShowUploadModal(false)
                        setShowEditModal(false)
                        setEditingMaterial(null)
                        setPdfFile(null)
                        setUploadForm({
                          title: '',
                          author: '',
                          subject: '',
                          type: 'book',
                          description: '',
                          tags: '',
                          url: ''
                        })
                        alert(showEditModal ? t('digitalLibrary.materialUpdated') : t('digitalLibrary.materialCreated'))
                      } else {
                        alert(t('digitalLibrary.failed', { error: response.error || 'Unknown error' }))
                      }
                    } catch (error: any) {
                      alert(t('digitalLibrary.failed', { error: error.message || 'Unknown error' }))
                    } finally {
                      setUploading(false)
                    }
                  }}
                  disabled={uploading}
                  className={`px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {uploading ? t('digitalLibrary.uploading') : (showEditModal ? t('digitalLibrary.updateMaterial') : t('digitalLibrary.createMaterial'))}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

              {/* Mobile Library Stats */}
              <div className="mb-8">
                <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('digitalLibrary.libraryStats')}
                </h3>
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('digitalLibrary.totalResources')}</span>
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {libraryResources.length}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('digitalLibrary.bookmarked')}</span>
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {libraryResources.filter(r => r.isBookMarked).length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Categories */}
              <div className="mb-8">
                <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('digitalLibrary.categories')}
                </h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => {
                        setSelectedCategory(category.value)
                        setMobileOpen(false)
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left ${
                        selectedCategory === category.value
                          ? 'bg-blue-100 text-blue-700'
                          : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
                      }`}
                    >
                      <span>{category.name}</span>
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Quick Actions */}
              <div className="space-y-2">
                <button 
                  onClick={() => {
                    navigateToDashboard(navigate)
                    setMobileOpen(false)
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors`}
                >
                  <ArrowBackIcon className="mr-3 w-4 h-4" />
                  {t('digitalLibrary.backToDashboard')}
                </button>
                <button 
                  onClick={() => {
                    navigate('/common/profile')
                    setMobileOpen(false)
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <PersonIcon className="mr-3 w-4 h-4" />
                  {t('digitalLibrary.profileManagement')}
                </button>
                <button 
                  onClick={() => {
                    navigate('/common/forum')
                    setMobileOpen(false)
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <ForumIcon className="mr-3 w-4 h-4" />
                  {t('digitalLibrary.communityForum')}
                </button>
                <button 
                  onClick={() => {
                    navigate('/common/notifications')
                    setMobileOpen(false)
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <NotificationsIcon className="mr-3 w-4 h-4" />
                  {t('digitalLibrary.notifications')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DigitalLibraryAccess
