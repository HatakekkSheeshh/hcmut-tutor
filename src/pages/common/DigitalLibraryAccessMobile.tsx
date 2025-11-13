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
  NotificationsActive as NotificationsIcon,
  Close as CloseIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { navigateToDashboard } from '../../utils/navigation'

interface LibraryResource {
  id: string;
  title: string;
  author: string;
  category: string;
  format: string;
  pages?: number;
  duration?: string;
  rating?: number;
  downloads?: number;
  views?: number;
  description: string;
  tags: string[];
  isBookMarked: boolean;
  isDownloaded: boolean;
  subject?: string;
  type?: string;
  url?: string;
  createdAt?: string;
  updatedAt?: string;
}

const DigitalLibraryAccessMobile: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedFormat, setSelectedFormat] = useState('all')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showFormatDropdown, setShowFormatDropdown] = useState(false)

  const [libraryResources, setLibraryResources] = useState<LibraryResource[]>([])
  const [isLoadingResources, setIsLoadingResources] = useState(false)
  const [bookmarkPending, setBookmarkPending] = useState<string | null>(null)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      
      if (showFormatDropdown && !target.closest('.format-dropdown-container')) {
        setShowFormatDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showFormatDropdown])

  // const getSelectedFormat = () => {
  //   return formats.find(format => format.value === selectedFormat) || formats[0]
  // }

  const handleThemeToggle = () => {
    toggleTheme()
  }


  // const [libraryResources, setLibraryResources] = useState([
  //   {
  //     id: 1,
  //     title: 'Advanced Mathematics for Engineers',
  //     author: 'Dr. Sarah Wilson',
  //     category: 'Mathematics',
  //     format: 'PDF',
  //     pages: 450,
  //     rating: 4.8,
  //     downloads: 1250,
  //     description: 'Comprehensive guide to advanced mathematical concepts for engineering students.',
  //     tags: ['Engineering', 'Calculus', 'Linear Algebra', 'Differential Equations'],
  //     isBookmarked: false,
  //     isDownloaded: false
  //   },
  //   {
  //     id: 2,
  //     title: 'Introduction to Machine Learning',
  //     author: 'Prof. Mike Chen',
  //     category: 'Computer Science',
  //     format: 'Video',
  //     duration: '12 hours',
  //     rating: 4.9,
  //     downloads: 2100,
  //     description: 'Complete course on machine learning fundamentals and applications.',
  //     tags: ['AI', 'Python', 'Data Science', 'Neural Networks'],
  //     isBookmarked: true,
  //     isDownloaded: true
  //   },
  //   {
  //     id: 3,
  //     title: 'Organic Chemistry Laboratory Manual',
  //     author: 'Dr. Alice Brown',
  //     category: 'Chemistry',
  //     format: 'PDF',
  //     pages: 320,
  //     rating: 4.7,
  //     downloads: 890,
  //     description: 'Step-by-step laboratory procedures and safety guidelines.',
  //     tags: ['Laboratory', 'Safety', 'Procedures', 'Organic Chemistry'],
  //     isBookmarked: false,
  //     isDownloaded: false
  //   },
  //   {
  //     id: 4,
  //     title: 'Physics Problem Solving Techniques',
  //     author: 'Prof. David Lee',
  //     category: 'Physics',
  //     format: 'Interactive',
  //     duration: '8 hours',
  //     rating: 4.6,
  //     downloads: 1560,
  //     description: 'Interactive problem-solving methods for physics students.',
  //     tags: ['Problem Solving', 'Mechanics', 'Thermodynamics', 'Electromagnetism'],
  //     isBookmarked: true,
  //     isDownloaded: false
  //   }
  // ])

  // const categories = [
  //   { name: 'All', value: 'all', count: libraryResources.length },
  //   { name: 'Mathematics', value: 'Mathematics', count: 1 },
  //   { name: 'Computer Science', value: 'Computer Science', count: 1 },
  //   { name: 'Chemistry', value: 'Chemistry', count: 1 },
  //   { name: 'Physics', value: 'Physics', count: 1 }
  // ]

  // const formats = [
  //   { name: 'All Formats', value: 'all' },
  //   { name: 'Document', value: 'Document' },
  //   { name: 'Video', value: 'Video' },
  //   { name: 'Book', value: 'Book' },
  //   {name: 'Article', value: 'Article'}
  // ]

  const formats = [
    { name: 'All Formats', value: 'all' },
    { name: 'Document', value: 'document' },
    { name: 'Video', value: 'video' },
    { name: 'Book', value: 'book' },
    { name: 'Article', value: 'article' }
  ]

  const getSelectedFormat = () => {
    return formats.find(format => format.value === selectedFormat) || formats[0]
  }

  const categories = [
    { name: 'All', value: 'all', count: libraryResources.length },
    { name: 'Mathematics', value: 'Mathematics', count: libraryResources.filter(r => (r.subject || r.category) === 'Mathematics').length },
    { name: 'Computer Science', value: 'Computer Science', count: libraryResources.filter(r => (r.subject || r.category) === 'Computer Science').length },
    { name: 'Chemistry', value: 'Chemistry', count: libraryResources.filter(r => (r.subject || r.category) === 'Chemistry').length },
    { name: 'Physics', value: 'Physics', count: libraryResources.filter(r => (r.subject || r.category) === 'Physics').length }
  ]

  useEffect(() => {
    let mounted = true
    const fetchResources = async () => {
      try {
        setIsLoadingResources(true)

        // 1. Check Local Storage for remain status
        const saved = localStorage.getItem('libraryData')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (mounted && Array.isArray(parsed) && parsed.length > 0) {  
            setLibraryResources(parsed as LibraryResource[])
            setIsLoadingResources(false)
            // Không return ở đây để luôn cố gắng fetch mới nếu không có searchTerm
            // Nếu có searchTerm, ta vẫn cần fetch mới, nên logic này của desktop không thay đổi
            if (!searchTerm.trim()) return; // Chỉ giữ lại local data nếu không search
        }
      }
        
        // Setup params cho API
        const params = new URLSearchParams()
        if (searchTerm.trim()) params.set('q', searchTerm.trim())
        params.set('limit', '1000')

        // 2. Primary: try backend search endpoint
      try {
          const res = await fetch(`/api/library/search?${params.toString()}`)
          if (res.ok) {
            const json = await res.json()
            const data = json?.data || []
          if (mounted && Array.isArray(data) && data.length > 0) {
            const enriched = data.map((item: any) => ({
              ...item,
              id: item.id.toString(), // Đảm bảo ID là string để đồng bộ
              isBookMarked: item.isBookMarked ?? false,
              isDownloaded: item.isDownloaded ?? false,
            }))
            setLibraryResources(enriched)
            // 💾 Lưu lại vào localStorage chỉ khi fetch thành công
            localStorage.setItem('libraryData', JSON.stringify(enriched))
            return
          }
        } else {
          console.warn('API /api/library/search returned status', res.status)
        }
      } catch (apiErr) {
        console.warn('Primary library API fetch failed:', apiErr)
      }


        // 3. Fallback: try loading static data file (Chỉ chạy khi không search và API thất bại)
      if (!searchTerm.trim()) {
        try {
          const fallbackRes = await fetch('/data/library-materials.json')
          if (fallbackRes.ok) {
            const arr = await fallbackRes.json()
            if (mounted && Array.isArray(arr)) {
              const enriched = arr.map((item: any) => ({
                ...item,
                id: item.id.toString(), // Đảm bảo ID là string
                isBookMarked: item.isBookMarked ?? false,
                isDownloaded: item.isDownloaded ?? false,
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
      }

        // 4. If all methods failed, clear resources (maintain previous behavior)
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

  const filteredResources = libraryResources.filter(resource => {
    const q = searchTerm.trim().toLowerCase()
    const matchesSearch = !q || (
      (resource.title || '').toLowerCase().includes(q) ||
      (resource.author || '').toLowerCase().includes(q) ||
      (resource.description || '').toLowerCase().includes(q) ||
      ((resource.tags || []) as string[]).join(' ').toLowerCase().includes(q) ||
      (resource.id || '').toLowerCase().includes(q)
    )
    // Kiểm tra category hoặc subject
    const matchesCategory = selectedCategory === 'all' || (resource.subject || resource.category) === selectedCategory
    // Kiểm tra format hoặc type
    const matchesFormat = selectedFormat === 'all' || (resource.type || resource.format).toLowerCase() === selectedFormat.toLowerCase()
    
    // Thêm filter cho Bookmarked nếu người dùng nhấn vào nút "My Bookmarks"
    const matchesBookmark = selectedCategory !== 'bookmarked' || resource.isBookMarked

    return matchesSearch && matchesCategory && matchesFormat && matchesBookmark
  })

  const handleBookmark = (resourceId: string) => {
    // Tạm thời bỏ qua setBookmarkPending vì đây là mobile và chưa có call API thực sự
    setLibraryResources(prevResources => {
      const updatedResources = prevResources.map(r =>
        r.id === resourceId
          ? { ...r, isBookMarked: !r.isBookMarked }  // đảo giá trị
          : r
      )
      // 💾 Lưu trạng thái vào localStorage để reload vẫn nhớ
      localStorage.setItem('libraryData', JSON.stringify(updatedResources))
      return updatedResources
    })
  }

  const handleDownload = (resourceId: string) => {
    setLibraryResources(prevResources => {
      const updatedResources = prevResources.map(r => {
        if (r.id === resourceId) {
          const isCurrentlyDownloaded = r.isDownloaded || false
          return { 
            ...r, 
            isDownloaded: !isCurrentlyDownloaded, // Đảo trạng thái Download
            downloads: !isCurrentlyDownloaded ? (r.downloads || 0) + 1 : (r.downloads || 0) // Giả lập tăng download count
          } 
        }
        return r
      })
      // 💾 Lưu trạng thái vào localStorage
      localStorage.setItem('libraryData', JSON.stringify(updatedResources))
      return updatedResources
    })
  }

  const handleShare = (resourceId: string) => {
    console.log('Share resource:', resourceId)
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} pb-16 overflow-visible`} style={{ overflow: 'visible' }}>
      {/* Mobile Header */}
      <div className={`sticky top-0 z-40 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between p-4">
          <div 
            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigateToDashboard(navigate)}
          >
            <div className="w-8 h-8 flex items-center justify-center mr-3">
              <img src="/HCMCUT.png" alt="HCMUT Logo" className="w-8 h-8" />
            </div>
            <div>
              <h1 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Digital Library
              </h1>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Educational resources & materials
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleThemeToggle}
              className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <LightModeIcon className="w-5 h-5 text-yellow-400" /> : <DarkModeIcon className="w-5 h-5" />}
            </button>
            <button
              onClick={handleDrawerToggle}
              className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              <MenuIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="p-4 space-y-4 overflow-visible" style={{ overflow: 'visible' }}>

        {/* Library Stats - Mobile */}
        <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Library Statistics
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600 mb-1">{libraryResources.length}</div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Total</div>
              </div>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="text-center">
                <div className="text-xl font-bold text-yellow-600 mb-1">{libraryResources.filter(r => r.isBookMarked).length}</div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Bookmarked</div>
              </div>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600 mb-1">{libraryResources.filter(r => r.isDownloaded).length}</div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Downloaded</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Section - Mobile */}
        <Card
          className={`p-4 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} overflow-visible`}
          style={{
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            boxShadow: 'none !important',
            overflow: 'visible'
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
          
          {/* Format Filter */}
          <div className="mb-4 relative format-dropdown-container">
            {/* Custom Format Dropdown Button */}
            <button
              onClick={() => setShowFormatDropdown(!showFormatDropdown)}
              className={`w-full px-3 py-3 border rounded-xl flex items-center justify-between transition-all duration-200 ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                  : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <div className="flex items-center">
                <span className="font-medium">{getSelectedFormat().name}</span>
              </div>
              <div className={`transform transition-transform duration-200 ${showFormatDropdown ? 'rotate-180' : ''}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Custom Format Dropdown Options */}
            {showFormatDropdown && (
              <div className="absolute top-full left-0 right-0 z-[99999] mt-1">
                <div className={`rounded-xl shadow-2xl border overflow-hidden ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-white border-gray-200'
                }`}>
                  {formats.map((format, index) => (
                    <button
                      key={format.value}
                      onClick={() => {
                        setSelectedFormat(format.value)
                        setShowFormatDropdown(false)
                      }}
                      className={`w-full px-4 py-3 text-left flex items-center transition-colors duration-150 ${
                        format.value === selectedFormat
                          ? theme === 'dark'
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-100 text-blue-700'
                          : theme === 'dark'
                            ? 'text-gray-300 hover:bg-gray-600'
                            : 'text-gray-700 hover:bg-gray-50'
                      } ${index !== formats.length - 1 ? 'border-b border-gray-200 dark:border-gray-600' : ''}`}
                    >
                      <span className="font-medium">{format.name}</span>
                      {format.value === selectedFormat && (
                        <div className="ml-auto">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`w-full flex items-center justify-center px-4 py-3 rounded-lg border ${
              theme === 'dark'
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            } transition-colors`}
          >
            <FilterList className="w-4 h-4 mr-2" />
            Advanced Filters
            <div className={`ml-2 transform transition-transform ${showFilters ? 'rotate-180' : ''}`}>
              <ArrowForwardIcon className="w-4 h-4" />
            </div>
          </button>

          {/* Advanced Filters Content */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="space-y-3">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Category
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category) => (
                      <button
                        key={category.value}
                        onClick={() => setSelectedCategory(category.value)}
                        className={`px-3 py-2 rounded-lg text-sm ${
                          selectedCategory === category.value
                            ? 'bg-blue-100 text-blue-700'
                            : `${theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`
                        }`}
                      >
                        {category.name} ({category.count})
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Quick Actions - Mobile */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => {
              setSelectedCategory('bookmarked') // Đặt category thành 'bookmarked'
              setShowFilters(false) // Đóng advanced filters nếu đang mở
            }}
            className={`flex items-center justify-center px-4 py-3 rounded-lg border ${
            theme === 'dark'
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
              : 'border-gray-200 text-gray-700 hover:bg-gray-50'
          } transition-colors`}>
            <Bookmark className="w-4 h-4 mr-2" />
            My Bookmarks
          </button>
          <button className={`flex items-center justify-center px-4 py-3 rounded-lg border ${
            theme === 'dark'
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
              : 'border-gray-200 text-gray-700 hover:bg-gray-50'
          } transition-colors`}>
            <Download className="w-4 h-4 mr-2" />
            Downloads
          </button>
          <button className={`flex items-center justify-center px-4 py-3 rounded-lg border ${
            theme === 'dark'
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
              : 'border-gray-200 text-gray-700 hover:bg-gray-50'
          } transition-colors`}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Trending
          </button>
          <button className={`flex items-center justify-center px-4 py-3 rounded-lg border ${
            theme === 'dark'
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
              : 'border-gray-200 text-gray-700 hover:bg-gray-50'
          } transition-colors`}>
            <Share className="w-4 h-4 mr-2" />
            Share
          </button>
        </div>

        {/* Resources List - Mobile */}
        <div className="space-y-4">
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
              <div className="p-4">
                {/* Resource Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className={`font-semibold text-base mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      <button
                        onClick={() => navigate(`/common/library/${resource.id}`)}
                        className="text-left w-full text-inherit hover:underline focus:outline-none"
                        aria-label={`Open details for ${resource.title}`}
                      >
                        {resource.title}
                      </button>
                    </h3>
                    <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      by {resource.author}
                    </p>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                        {resource.category}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                        {resource.format}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleBookmark(resource.id)}
                      className={`p-2 rounded-lg ${
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
                <div className="space-y-2 mb-3">
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
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {resource.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {resource.tags.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{resource.tags.length - 2} more
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
                    style={{
                      backgroundColor: resource.isDownloaded ? '#059669' : '#3b82f6',
                      color: '#ffffff',
                      textTransform: 'none',
                      fontWeight: '500'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = resource.isDownloaded ? '#047857' : '#2563eb'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = resource.isDownloaded ? '#059669' : '#3b82f6'
                    }}
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
                    Author
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Help Section - Mobile with Toggle */}
        <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <button 
            onClick={() => setShowHelp(!showHelp)}
            className={`w-full flex items-center justify-between p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
          >
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Need Help?
            </h3>
            <div className={`transform transition-transform ${showHelp ? 'rotate-180' : ''}`}>
              <ArrowForwardIcon className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
          </button>
          
          {showHelp && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => navigate('/common/profile')}
                  className={`flex flex-col items-center p-3 rounded-lg border ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                >
                  <PersonIcon className="w-6 h-6 text-blue-600 mb-2" />
                  <span className={`text-xs font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Profile
                  </span>
                </button>
                <button 
                  onClick={() => navigate('/common/forum')}
                  className={`flex flex-col items-center p-3 rounded-lg border ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                >
                  <ForumIcon className="w-6 h-6 text-green-600 mb-2" />
                  <span className={`text-xs font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Forum
                  </span>
                </button>
                <button 
                  onClick={() => navigate('/common/notifications')}
                  className={`flex flex-col items-center p-3 rounded-lg border ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                >
                  <NotificationsIcon className="w-6 h-6 text-orange-600 mb-2" />
                  <span className={`text-xs font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Notifications
                  </span>
                </button>
                <button 
                  onClick={() => navigate('/common')}
                  className={`flex flex-col items-center p-3 rounded-lg border ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                >
                  <ArrowBackIcon className="w-6 h-6 text-purple-600 mb-2" />
                  <span className={`text-xs font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Login
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleDrawerToggle}></div>
          <div className={`fixed left-0 top-0 h-full w-80 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
            <div className="p-6 h-full flex flex-col">
              {/* Mobile Header */}
              <div className="flex items-center justify-between mb-8">
                <div 
                  className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => navigateToDashboard(navigate)}
                >
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
                  <CloseIcon className="w-6 h-6" />
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
              <div className="flex-1 space-y-2">
                <button 
                  onClick={() => {
                    navigate('/common')
                    setMobileOpen(false)
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <ArrowBackIcon className="mr-3 w-4 h-4" />
                  Back to Login
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

              {/* Mobile Settings */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
                <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  SETTINGS
                </h3>
                <div className="space-y-2">
                  <button 
                    onClick={handleThemeToggle}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    {theme === 'dark' ? <LightModeIcon className="mr-3 w-4 h-4" /> : <DarkModeIcon className="mr-3 w-4 h-4" />}
                    {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DigitalLibraryAccessMobile
