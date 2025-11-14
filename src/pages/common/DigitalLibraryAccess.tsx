import React, { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'
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
  NotificationsActive as NotificationsIcon
} from '@mui/icons-material'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { navigateToDashboard } from '../../utils/navigation'
import jsPDF from 'jspdf'
const DigitalLibraryAccess: React.FC = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedFormat, setSelectedFormat] = useState('all')
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  // Live resources fetched from backend
  const [libraryResources, setLibraryResources] = useState<any[]>([])
  const [isLoadingResources, setIsLoadingResources] = useState(false)
  const [bookmarkPending, setBookmarkPending] = useState<string | null>(null)

  const categories = [
    { name: 'All', value: 'all', count: libraryResources.length }
  ]

  const formats = [
    { name: 'All Formats', value: 'all' },
    { name: 'Document', value: 'Document' },
    { name: 'Video', value: 'Video' },
    { name: 'Book', value: 'Book' },
    {name: 'Article', value: 'Article'}
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
        //Check Local Storage for remain status
        const saved = localStorage.getItem('libraryData')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0  ) {  
            setLibraryResources(parsed)
            setIsLoadingResources(false)
            return
        }
      }
        // Request a large limit to retrieve all materials; backend will paginate if needed
        const params = new URLSearchParams()
        if (searchTerm.trim()) params.set('q', searchTerm.trim())
        params.set('limit', '1000')

        // Primary: try backend search endpoint
      try {
          const res = await fetch(`/api/library/search?${params.toString()}`)
          if (res.ok) {
            const json = await res.json()
            const data = json?.data || []
          if (mounted && Array.isArray(data) && data.length > 0) {
            const enriched = data.map((item: any) => ({
              ...item,
              isBookMarked: item.isBookMarked ?? false,
            }))
            setLibraryResources(enriched)
            // 💾 Lưu lại vào localStorage
            localStorage.setItem('libraryData', JSON.stringify(enriched))
            return
          }
        } else {
          console.warn('API /api/library/search returned status', res.status)
        }
      } catch (apiErr) {
        console.warn('Primary library API fetch failed:', apiErr)
      }


        // Fallback: try loading static data file (useful during local development)
      try {
        const fallbackRes = await fetch('/data/library-materials.json')
        if (fallbackRes.ok) {
          const arr = await fallbackRes.json()
          if (mounted && Array.isArray(arr)) {
            const enriched = arr.map((item: any) => ({
              ...item,
              isBookMarked: item.isBookMarked ?? false,
            }))
            setLibraryResources(enriched)
            // 💾 Lưu lại vào localStorage
            localStorage.setItem('libraryData', JSON.stringify(enriched))
            return
          }
        } else {
          console.warn('Fallback /data/library-materials.json returned', fallbackRes.status)
        }
      } catch (fbErr) {
        console.warn('Fallback fetch failed:', fbErr)
      }

        // If both methods failed, clear resources (maintain previous behavior)
        if (mounted) setLibraryResources([])
      } catch (e) {
        console.error('Failed to fetch library resources', e)
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
  }, [searchTerm])

//Function toandle bookmark toggling
  const handleBookmark = async (resourceId: string) => {
    setLibraryResources(prevResources => {
    const updatedResources = prevResources.map(r =>
      r.id === resourceId
        ? { ...r, isBookMarked: !r.isBookMarked }  // đảo giá trị
        : r
    )
    // 💾 Lưu trạng thái vào localStorage để reload vẫn nhớ
    localStorage.setItem('libraryData', JSON.stringify(updatedResources))
    return updatedResources
  })
  }
  

  const handleDownload = (resourceId: number) => {
    console.log('Download resource:', resourceId)
  }

  const handleShare = (resourceId: number) => {
    console.log('Share resource:', resourceId)
  }

  const handleViewPDF = (resource: any) => {
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
      ['URL', resource.url],
      ['Created At', new Date(resource.createdAt).toLocaleString()],
      ['Updated At', new Date(resource.updatedAt).toLocaleString()]
    ]

    info.forEach(([label, value]) => {
      doc.text(`${label}: ${value || 'N/A'}`, 10, y)
      y += 10
    })

    // ✅ Mở file PDF trong tab mới (xem trực tiếp)
    window.open(doc.output('bloburl'), '_blank')

    // 👉 Nếu bạn muốn tải luôn, thay bằng:
    // doc.save(`${resource.title || 'document'}.pdf`)
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
                LIBRARY STATS
              </h3>
              <div className="space-y-3">
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Total Resources:</span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {libraryResources.length}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Bookmarked:</span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {libraryResources.filter(r => r.isBookMarked).length}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Downloaded:</span>
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
                CATEGORIES
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
                QUICK ACTIONS
              </h3>
              <div className="space-y-2">
                <button 
                  onClick={() => navigateToDashboard(navigate)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors`}
                >
                  <ArrowBackIcon className="mr-3 w-4 h-4" />
                  Back to Dashboard
                </button>
                <button 
                  onClick={() => navigate('/common/profile')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <PersonIcon className="mr-3 w-4 h-4" />
                  Profile Management
                </button>
                <button 
                  onClick={() => navigate('/common/forum')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <ForumIcon className="mr-3 w-4 h-4" />
                  Community Forum
                </button>
                <button 
                  onClick={() => navigate('/common/notifications')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <NotificationsIcon className="mr-3 w-4 h-4" />
                  Notifications
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
              Digital Library Access
            </h1>
            <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Access educational resources, books, and learning materials
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
                  Search Resources
                </h3>
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="Search by title, author, or description..."
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
                      Advanced Filters
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
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button className={`w-full flex items-center px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  } transition-colors`}>
                    <Bookmark className="mr-3 w-4 h-4" />
                    My Bookmarks
                  </button>
                  <button className={`w-full flex items-center px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  } transition-colors`}>
                    <Download className="mr-3 w-4 h-4" />
                    Downloads
                  </button>
                  <button className={`w-full flex items-center px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  } transition-colors`}>
                    <TrendingUp className="mr-3 w-4 h-4" />
                    Trending
                  </button>
                </div>
              </Card>
            </div>
          </div>

          {/* Resources List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredResources.map((resource) => (
              <Card 
                key={resource.id} 
                className={`overflow-hidden border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                style={{
                  borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                  boxShadow: 'none !important'
                }}
              >
                <div className="p-6">
                  {/* Resource Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3
                        onClick={() => handleViewPDF(resource)}
                        className={`font-semibold text-lg mb-2 cursor-pointer hover:underline ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {resource.title}
                      </h3>
                      <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        by {resource.author}
                      </p>
                      <div className="flex items-center space-x-4 mb-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                          {resource.category}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                          {resource.format}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleBookmark(resource.id)}
                        disabled={bookmarkPending === resource.id}
                        className={`p-2 rounded-lg transition-colors ${bookmarkPending === resource.id ? 'opacity-60 cursor-not-allowed' : ''} ${
                          resource.isBookMarked 
                            ? 'bg-yellow-100 text-yellow-600' 
                            : `${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`
                        }`}
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleShare(resource.id)}
                        className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                      >
                        <Share className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Resource Details */}
                  <div className="space-y-2 mb-4">
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {resource.description}
                    </p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {resource.rating}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Download className="w-4 h-4 text-gray-400 mr-1" />
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {resource.downloads}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <AccessTime className="w-4 h-4 text-gray-400 mr-1" />
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {resource.format === 'PDF' ? `${resource.pages} pages` : resource.duration}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {((resource.tags || []) as string[]).slice(0, 3).map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {resource.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{resource.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button 
                      size="small" 
                      className={`flex-1 ${
                        resource.isDownloaded 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                      onClick={() => handleDownload(resource.id)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      {resource.isDownloaded ? 'Downloaded' : 'Download'}
                    </Button>
                    <Button 
                      size="small" 
                      variant="outlined"
                      className="flex-1"
                      style={{
                        backgroundColor: theme === 'dark' ? '#000000' : '#ffffff',
                        color: theme === 'dark' ? '#ffffff' : '#000000',
                        borderColor: theme === 'dark' ? '#000000' : '#d1d5db',
                        textTransform: 'none',
                        fontWeight: '500'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1f2937' : '#f3f4f6'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = theme === 'dark' ? '#000000' : '#ffffff'
                      }}
                    >
                      <Person className="w-4 h-4 mr-1" />
                      View Author
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
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

              {/* Mobile Library Stats */}
              <div className="mb-8">
                <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  LIBRARY STATS
                </h3>
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Total Resources:</span>
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {libraryResources.length}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Bookmarked:</span>
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {libraryResources.filter(r => r.isBookmarked).length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Categories */}
              <div className="mb-8">
                <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  CATEGORIES
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
                  Back to Dashboard
                </button>
                <button 
                  onClick={() => {
                    navigate('/common/profile')
                    setMobileOpen(false)
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <PersonIcon className="mr-3 w-4 h-4" />
                  Profile Management
                </button>
                <button 
                  onClick={() => {
                    navigate('/common/forum')
                    setMobileOpen(false)
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <ForumIcon className="mr-3 w-4 h-4" />
                  Community Forum
                </button>
                <button 
                  onClick={() => {
                    navigate('/common/notifications')
                    setMobileOpen(false)
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <NotificationsIcon className="mr-3 w-4 h-4" />
                  Notifications
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
