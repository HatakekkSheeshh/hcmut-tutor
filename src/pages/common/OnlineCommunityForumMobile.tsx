import React, { useState, useEffect, useMemo } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { 
  Search,
  FilterList,
  Add,
  ThumbUp,
  Comment,
  Share,
  Bookmark,
  TrendingUp,
  Schedule,
  Person,
  Menu as MenuIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  LibraryBooks as LibraryIcon,
  NotificationsActive as NotificationsIcon,
  Close as CloseIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { navigateToDashboard } from '../../utils/navigation'
import { forumAPI, usersAPI, authAPI } from '../../lib/api'
import { formatDistanceToNow } from 'date-fns'

// Forum types (matching backend types)
interface ForumPost {
  id: string
  authorId: string
  title: string
  content: string
  category: string
  tags: string[]
  likes: string[]
  views: number
  pinned: boolean
  locked: boolean
  createdAt: string
  updatedAt: string
}

interface ForumComment {
  id: string
  postId: string
  authorId: string
  content: string
  parentCommentId?: string
  likes: string[]
  createdAt: string
  updatedAt: string
}

const BOOKMARKS_STORAGE_KEY = 'forum_bookmarks'

const OnlineCommunityForumMobile: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedSort, setSelectedSort] = useState('recent')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [users, setUsers] = useState<Record<string, any>>({})
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null)
  const [comments, setComments] = useState<Record<string, ForumComment[]>>({})
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'Programming', tags: '' })
  const [newComment, setNewComment] = useState('')
  const [creatingPost, setCreatingPost] = useState(false)
  const [postingComment, setPostingComment] = useState(false)

  // Load bookmarks from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(BOOKMARKS_STORAGE_KEY)
      if (stored) {
        setBookmarks(new Set(JSON.parse(stored)))
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error)
    }
  }, [])

  // Load current user
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const result = await authAPI.getMe()
        if (result.success) {
          setCurrentUser(result.data)
        }
      } catch (error) {
        console.error('Error loading current user:', error)
      }
    }
    loadCurrentUser()
  }, [])

  // Load posts
  useEffect(() => {
    loadPosts()
  }, [selectedCategory, searchTerm, selectedSort])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const params: any = {
        page: 1,
        limit: 20
      }
      
      if (selectedCategory !== 'all') {
        params.category = selectedCategory
      }
      
      if (searchTerm) {
        params.search = searchTerm
      }

      const response = await forumAPI.posts.list(params)
      
      if (response.success && response.data) {
        const postsData = Array.isArray(response.data) ? response.data : response.data.data || []
        setPosts(postsData)
        
        // Load user data for authors
        const authorIds = [...new Set(postsData.map((p: ForumPost) => p.authorId))] as string[]
        await loadUsers(authorIds)
      } else {
        setPosts([])
      }
    } catch (error) {
      console.error('Error loading posts:', error)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async (userIds: string[]) => {
    try {
      const usersToLoad = userIds.filter(id => !users[id])
      if (usersToLoad.length === 0) return

      const usersList = await usersAPI.list({ limit: 1000 })
      const usersArray = Array.isArray(usersList) 
        ? usersList 
        : usersList.success && Array.isArray(usersList.data) 
          ? usersList.data 
          : usersList.data?.data || []

      const usersMap: Record<string, any> = {}
      usersArray.forEach((user: any) => {
        if (usersToLoad.includes(user.id)) {
          usersMap[user.id] = user
        }
      })

      setUsers(prev => ({ ...prev, ...usersMap }))
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  // Load comments for a post
  const loadComments = async (postId: string) => {
    try {
      const response = await forumAPI.comments.list(postId, { page: 1, limit: 50 })
      if (response.success && response.data) {
        const commentsData = Array.isArray(response.data) ? response.data : response.data.data || []
        setComments(prev => ({ ...prev, [postId]: commentsData }))
        
        // Load user data for comment authors
        const authorIds = [...new Set(commentsData.map((c: ForumComment) => c.authorId))] as string[]
        await loadUsers(authorIds)
      }
    } catch (error) {
      console.error('Error loading comments:', error)
    }
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleThemeToggle = () => {
    toggleTheme()
  }

  const handleLike = async (postId: string) => {
    try {
      const response = await forumAPI.posts.like(postId)
      if (response.success) {
        await loadPosts()
      }
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const handleComment = async (post: ForumPost) => {
    setSelectedPost(post)
    setShowCommentModal(true)
    if (!comments[post.id]) {
      await loadComments(post.id)
    }
  }

  const handleSubmitComment = async () => {
    if (!selectedPost || !newComment.trim()) return

    try {
      setPostingComment(true)
      const response = await forumAPI.comments.create(selectedPost.id, { content: newComment })
      if (response.success) {
        setNewComment('')
        await loadComments(selectedPost.id)
        await loadPosts()
      }
    } catch (error) {
      console.error('Error posting comment:', error)
    } finally {
      setPostingComment(false)
    }
  }

  const handleShare = (post: ForumPost) => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.content.substring(0, 200),
        url: window.location.href
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const handleBookmark = (postId: string) => {
    const newBookmarks = new Set(bookmarks)
    if (newBookmarks.has(postId)) {
      newBookmarks.delete(postId)
    } else {
      newBookmarks.add(postId)
    }
    setBookmarks(newBookmarks)
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(Array.from(newBookmarks)))
  }

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert('Please fill in title and content')
      return
    }

    try {
      setCreatingPost(true)
      const tags = newPost.tags.split(',').map(t => t.trim()).filter(t => t)
      const response = await forumAPI.posts.create({
        title: newPost.title,
        content: newPost.content,
        category: newPost.category,
        tags
      })

      if (response.success) {
        setShowCreateModal(false)
        setNewPost({ title: '', content: '', category: 'Programming', tags: '' })
        await loadPosts()
      }
    } catch (error) {
      console.error('Error creating post:', error)
      alert('Failed to create post')
    } finally {
      setCreatingPost(false)
    }
  }

  // Get categories from posts
  const categories = useMemo(() => {
    const categorySet = new Set<string>()
    posts.forEach(post => {
      if (post.category) {
        categorySet.add(post.category)
      }
    })
    const categoryList = Array.from(categorySet).map(cat => ({
      name: cat,
      value: cat,
      count: posts.filter(p => p.category === cat).length
    }))
    return [
      { name: 'All', value: 'all', count: posts.length },
      ...categoryList
    ]
  }, [posts])

  // Sort and filter posts
  const filteredPosts = useMemo(() => {
    let filtered = [...posts]

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchLower) ||
        post.content.toLowerCase().includes(searchLower) ||
        (users[post.authorId]?.name || '').toLowerCase().includes(searchLower)
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory)
    }

    filtered.sort((a, b) => {
      switch (selectedSort) {
        case 'popular':
          return (b.views || 0) - (a.views || 0)
        case 'liked':
          return (b.likes?.length || 0) - (a.likes?.length || 0)
        case 'commented':
          return (b.likes?.length || 0) - (a.likes?.length || 0)
        case 'recent':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    return filtered
  }, [posts, searchTerm, selectedCategory, selectedSort, users])

  const getAuthorInfo = (authorId: string) => {
    const user = users[authorId]
    if (!user) return { name: 'Unknown', role: 'User' }
    
    const roleMap: Record<string, string> = {
      'student': 'Student',
      'tutor': 'Tutor',
      'management': 'Management'
    }
    
    return {
      name: user.name || user.email || 'Unknown',
      role: roleMap[user.role] || 'User'
    }
  }

  const isLiked = (post: ForumPost) => {
    return currentUser && post.likes?.includes(currentUser.userId || currentUser.id)
  }

  const getCommentCount = (postId: string) => {
    return comments[postId]?.length || 0
  }

  const sortOptions = [
    { name: 'Most Recent', value: 'recent' },
    { name: 'Most Popular', value: 'popular' },
    { name: 'Most Liked', value: 'liked' },
    { name: 'Most Commented', value: 'commented' }
  ]

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} pb-16`}>
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
                Community Forum
              </h1>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Connect and share knowledge
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
      <div className="p-4 space-y-4">
        {/* Forum Stats - Mobile */}
        <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Forum Statistics
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600 mb-1">{posts.length}</div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Total Posts</div>
              </div>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600 mb-1">{bookmarks.size}</div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Bookmarked</div>
              </div>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-600 mb-1">-</div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Active Users</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Section - Mobile */}
        <Card
          className={`p-4 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
          style={{
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            boxShadow: 'none !important'
          }}
        >
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Search & Filter
          </h3>
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search posts..."
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
          
          {/* Filter Toggle */}
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
                  <div className="grid grid-cols-1 gap-2">
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
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Sort By
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSelectedSort(option.value)}
                        className={`px-3 py-2 rounded-lg text-sm ${
                          selectedSort === option.value
                            ? 'bg-blue-100 text-blue-700'
                            : `${theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`
                        }`}
                      >
                        {option.name}
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
            onClick={() => setShowCreateModal(true)}
            className={`flex items-center justify-center px-4 py-3 rounded-lg border ${
              theme === 'dark'
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            } transition-colors`}
          >
            <Add className="w-4 h-4 mr-2" />
            Create Post
          </button>
          <button 
            className={`flex items-center justify-center px-4 py-3 rounded-lg border ${
              theme === 'dark'
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            } transition-colors`}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Trending
          </button>
        </div>

        {/* Posts List - Mobile */}
        {loading ? (
          <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading posts...
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            No posts found. Be the first to create a post!
          </div>
        ) : (
        <div className="space-y-3">
            {filteredPosts.map((post) => {
              const author = getAuthorInfo(post.authorId)
              const liked = isLiked(post)
              const bookmarked = bookmarks.has(post.id)
              const commentCount = getCommentCount(post.id)

              return (
            <Card 
              key={post.id} 
              className={`overflow-hidden border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
              style={{
                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                boxShadow: 'none !important'
              }}
            >
              <div className="p-4">
                {/* Post Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className={`font-semibold text-base mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {post.title}
                    </h3>
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center">
                        <Person className="w-3 h-3 text-gray-400 mr-1" />
                        <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                              {author.name}
                        </span>
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                              author.role === 'Tutor' ? 'bg-blue-100 text-blue-800' :
                              author.role === 'Management' ? 'bg-purple-100 text-purple-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                              {author.role}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Schedule className="w-3 h-3 text-gray-400 mr-1" />
                        <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                      {post.category}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleBookmark(post.id)}
                      className={`p-2 rounded-lg ${
                            bookmarked 
                          ? 'bg-yellow-100 text-yellow-600' 
                          : `${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`
                      }`}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                    <button
                          onClick={() => handleShare(post)}
                      className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                    >
                      <Share className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Post Content */}
                <div className="mb-3">
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} line-clamp-2`}>
                    {post.content}
                  </p>
                </div>

                {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {post.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {post.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{post.tags.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                    )}

                {/* Post Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center space-x-1 ${
                            liked 
                          ? 'text-blue-600' 
                          : `${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-500'}`
                      }`}
                    >
                      <ThumbUp className="w-4 h-4" />
                          <span className="text-sm">{post.likes?.length || 0}</span>
                    </button>
                    <button
                          onClick={() => handleComment(post)}
                      className={`flex items-center space-x-1 ${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-500'}`}
                    >
                      <Comment className="w-4 h-4" />
                          <span className="text-sm">{commentCount}</span>
                    </button>
                    <button
                          onClick={() => handleShare(post)}
                      className={`flex items-center space-x-1 ${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-500'}`}
                    >
                      <Share className="w-4 h-4" />
                          <span className="text-sm">{post.views || 0}</span>
                    </button>
                  </div>
                  <Button 
                    size="small" 
                    variant="outlined"
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
                    Read More
                  </Button>
                </div>
              </div>
            </Card>
              )
            })}
        </div>
        )}

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
                  onClick={() => navigateToDashboard(navigate)}
                  className={`flex flex-col items-center p-3 rounded-lg border ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                >
                  <ArrowBackIcon className="w-6 h-6 text-blue-600 mb-2" />
                  <span className={`text-xs font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Dashboard
                  </span>
                </button>
                <button 
                  onClick={() => navigate('/common/profile')}
                  className={`flex flex-col items-center p-3 rounded-lg border ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                >
                  <PersonIcon className="w-6 h-6 text-green-600 mb-2" />
                  <span className={`text-xs font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Profile
                  </span>
                </button>
                <button 
                  onClick={() => navigate('/common/library')}
                  className={`flex flex-col items-center p-3 rounded-lg border ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                >
                  <LibraryIcon className="w-6 h-6 text-purple-600 mb-2" />
                  <span className={`text-xs font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Library
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
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className={`w-full max-w-lg rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Create New Post
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <CloseIcon />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Title
                </label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Enter post title..."
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Category
                </label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {categories.filter(c => c.value !== 'all').map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Content
                </label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  rows={6}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Write your post content..."
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={newPost.tags}
                  onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="e.g., React, JavaScript, Learning"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  onClick={() => setShowCreateModal(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePost}
                  disabled={creatingPost}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {creatingPost ? 'Creating...' : 'Create Post'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {showCommentModal && selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className={`w-full max-w-lg rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 max-h-[80vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Comments
              </h2>
              <button
                onClick={() => {
                  setShowCommentModal(false)
                  setSelectedPost(null)
                  setNewComment('')
                }}
                className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <CloseIcon />
              </button>
            </div>
            <div className="mb-4">
              <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {selectedPost.title}
              </h3>
            </div>
            <div className="space-y-4 mb-4">
              {comments[selectedPost.id]?.map((comment) => {
                const commentAuthor = getAuthorInfo(comment.authorId)
                return (
                  <div key={comment.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {commentAuthor.name}
                        </span>
                        <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {comment.content}
                    </p>
                  </div>
                )
              })}
              {(!comments[selectedPost.id] || comments[selectedPost.id].length === 0) && (
                <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  No comments yet. Be the first to comment!
                </div>
              )}
            </div>
            <div className="space-y-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Write a comment..."
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmitComment}
                  disabled={postingComment || !newComment.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {postingComment ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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

              {/* Mobile Forum Stats */}
              <div className="mb-8">
                <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  FORUM STATS
                </h3>
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Total Posts:</span>
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {posts.length}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Bookmarked:</span>
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {bookmarks.size}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Active Users:</span>
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>-</span>
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
                    navigate('/common/library')
                    setMobileOpen(false)
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <LibraryIcon className="mr-3 w-4 h-4" />
                  Digital Library
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

export default OnlineCommunityForumMobile
