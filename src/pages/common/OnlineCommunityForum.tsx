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
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { navigateToDashboard } from '../../utils/navigation'
import { forumAPI, usersAPI, authAPI } from '../../lib/api'
import { formatDistanceToNow } from 'date-fns'
import { Avatar } from '@mui/material'

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
  status?: 'pending' | 'approved' | 'rejected' | 'hidden'
  moderationNotes?: string
  moderatedBy?: string
  moderatedAt?: string
  createdAt: string
  updatedAt: string
}

// Predefined categories
const FORUM_CATEGORIES = [
  'Programming',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Study Groups',
  'Career',
  'General Discussion',
  'Questions & Answers',
  'Resources'
]

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

// Helper functions for avatars
const getInitials = (name: string | undefined | null) => {
  if (!name) return 'U'
  return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2)
}

const getAvatarColor = (name: string | undefined | null) => {
  if (!name) return '#9ca3af'
  const colors = [
    '#f87171', '#fb923c', '#fbbf24', '#a3e635', '#34d399',
    '#22d3ee', '#60a5fa', '#a78bfa', '#f472b6', '#ec4899'
  ]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

const OnlineCommunityForum: React.FC = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedSort, setSelectedSort] = useState('recent')
  const [mobileOpen, setMobileOpen] = useState(false)
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
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [creatingPost, setCreatingPost] = useState(false)
  const [postingComment, setPostingComment] = useState(false)
  const [postingReply, setPostingReply] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [showModerationModal, setShowModerationModal] = useState(false)
  const [moderationPost, setModerationPost] = useState<ForumPost | null>(null)
  const [moderationAction, setModerationAction] = useState<'approve' | 'reject' | null>(null)
  const [moderationNotes, setModerationNotes] = useState('')
  const [isModerating, setIsModerating] = useState(false)
  const [pendingPosts, setPendingPosts] = useState<ForumPost[]>([])
  const [showPendingFilter, setShowPendingFilter] = useState(false)
  const [allPosts, setAllPosts] = useState<ForumPost[]>([])
  const [showManagementPanel, setShowManagementPanel] = useState(false)
  const [managementFilter, setManagementFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

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
    if (currentUser?.role === 'management') {
      loadPendingPosts()
      if (showManagementPanel) {
        loadAllPostsForManagement()
      }
    }
  }, [selectedCategory, searchTerm, selectedSort, page, currentUser, showManagementPanel])

  // Load all users on mount to ensure user data is available
  useEffect(() => {
    const loadAllUsers = async () => {
      try {
        const usersList = await usersAPI.list({ limit: 1000 })
        let usersArray: any[] = []
        if (Array.isArray(usersList)) {
          usersArray = usersList
        } else if (usersList.success && Array.isArray(usersList.data)) {
          usersArray = usersList.data
        } else if (usersList.data && Array.isArray(usersList.data)) {
          usersArray = usersList.data
        } else if (usersList.data?.data && Array.isArray(usersList.data.data)) {
          usersArray = usersList.data.data
        }

        const usersMap: Record<string, any> = {}
        usersArray.forEach((user: any) => {
          const userId = user.id
          if (userId) {
            usersMap[userId] = user
          }
        })

        setUsers(prev => ({ ...prev, ...usersMap }))
        console.log('[Forum] Loaded all users on mount:', Object.keys(usersMap).length)
      } catch (error) {
        console.error('Error loading all users on mount:', error)
      }
    }
    
    loadAllUsers()
  }, [])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const params: any = {
        page,
        limit: 10
      }
      
      if (selectedCategory !== 'all') {
        params.category = selectedCategory
      }
      
      if (searchTerm) {
        params.search = searchTerm
      }

      // Managers can see all posts, regular users only see approved
      const response = await forumAPI.posts.list(params)
      
      if (response.success && response.data) {
        // Response.data is already an array from paginated API
        const postsData = Array.isArray(response.data) ? response.data : []
        setPosts(postsData)
        setHasMore(postsData.length >= 10)
        
        // Load user data for authors
        const authorIds = [...new Set(postsData.map((p: ForumPost) => p.authorId))] as string[]
        await loadUsers(authorIds)
        
        // Load comments count for all posts (load all comments to get accurate count)
        const commentPromises = postsData.map(async (post: ForumPost) => {
          if (!comments[post.id]) {
            try {
              const commentsResponse = await forumAPI.comments.list(post.id, { page: 1, limit: 100 })
              if (commentsResponse.success && commentsResponse.data) {
                const commentsData = Array.isArray(commentsResponse.data) ? commentsResponse.data : []
                // Store all comments to get accurate count
                setComments(prev => ({ ...prev, [post.id]: commentsData }))
                
                // Load user data for comment authors
                const commentAuthorIds = [...new Set(commentsData.map((c: ForumComment) => c.authorId))] as string[]
                if (commentAuthorIds.length > 0) {
                  await loadUsers(commentAuthorIds)
                }
              }
            } catch (error) {
              // Silently fail for comment loading
            }
          }
        })
        await Promise.all(commentPromises)
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

  const loadPendingPosts = async () => {
    try {
      const response = await forumAPI.posts.list({ status: 'pending', limit: 100 })
      if (response.success && response.data) {
        const postsData = Array.isArray(response.data) ? response.data : []
        setPendingPosts(postsData)
        
        // Load user data for authors
        const authorIds = [...new Set(postsData.map((p: ForumPost) => p.authorId))] as string[]
        await loadUsers(authorIds)
      }
    } catch (error) {
      console.error('Error loading pending posts:', error)
    }
  }

  const loadAllPostsForManagement = async () => {
    try {
      const response = await forumAPI.posts.list({ limit: 1000 })
      if (response.success && response.data) {
        const postsData = Array.isArray(response.data) ? response.data : []
        setAllPosts(postsData)
        
        // Load user data for authors
        const authorIds = [...new Set(postsData.map((p: ForumPost) => p.authorId))] as string[]
        await loadUsers(authorIds)
      }
    } catch (error) {
      console.error('Error loading all posts:', error)
    }
  }

  const loadUsers = async (userIds: string[]) => {
    try {
      if (userIds.length === 0) return
      
      const usersToLoad = userIds.filter(id => !users[id])
      if (usersToLoad.length === 0) return

      console.log('[loadUsers] Loading users:', usersToLoad)
      
      const usersList = await usersAPI.list({ limit: 1000 })
      console.log('[loadUsers] API response:', usersList)
      
      // Parse response - support multiple formats
      let usersArray: any[] = []
      if (Array.isArray(usersList)) {
        usersArray = usersList
      } else if (usersList.success && Array.isArray(usersList.data)) {
        usersArray = usersList.data
      } else if (usersList.data && Array.isArray(usersList.data)) {
        usersArray = usersList.data
      } else if (usersList.data?.data && Array.isArray(usersList.data.data)) {
        usersArray = usersList.data.data
      }

      console.log('[loadUsers] Parsed users array length:', usersArray.length)

      const usersMap: Record<string, any> = {}
      usersArray.forEach((user: any) => {
        // Users from API have 'id' field (not 'userId')
        const userId = user.id
        if (userId && usersToLoad.includes(userId)) {
          usersMap[userId] = user
          console.log('[loadUsers] Mapped user:', userId, '->', user.name)
        }
      })

      console.log('[loadUsers] Final usersMap keys:', Object.keys(usersMap))
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
        const commentsData = Array.isArray(response.data) ? response.data : []
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

  const handleLike = async (e: React.MouseEvent, postId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!currentUser) return
    
    const userId = currentUser.userId || currentUser.id
    if (!userId) return
    
    // Get current post state before update (using functional update to get latest state)
    let originalPost: ForumPost | null = null
    setPosts(prev => {
      originalPost = prev.find(p => p.id === postId) || null
      if (!originalPost) return prev
      
      const currentlyLiked = originalPost.likes?.includes(userId) || false
      const newLikes = currentlyLiked 
        ? originalPost.likes?.filter(id => id !== userId) || []
        : [...(originalPost.likes || []), userId]
      
      return prev.map(p => 
        p.id === postId ? { ...p, likes: newLikes } : p
      )
    })
    
    if (!originalPost) return
    
    try {
      // Call API
      const response = await forumAPI.posts.like(postId)
      if (!response.success) {
        // Revert on error - restore original state
        setPosts(prev => prev.map(p => 
          p.id === postId ? originalPost! : p
        ))
      }
    } catch (error) {
      console.error('Error liking post:', error)
      // Revert on error - restore original state
      setPosts(prev => prev.map(p => 
        p.id === postId ? originalPost! : p
      ))
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
        await loadPosts() // Reload to update comment count
      }
    } catch (error) {
      console.error('Error posting comment:', error)
    } finally {
      setPostingComment(false)
    }
  }

  const handleLikeComment = async (e: React.MouseEvent, commentId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!currentUser) return

    const userId = currentUser.userId || currentUser.id
    if (!userId) return

    // Get current comment state
    let originalComment: ForumComment | null = null
    if (selectedPost) {
      setComments(prev => {
        const postComments = prev[selectedPost.id] || []
        originalComment = postComments.find(c => c.id === commentId) || null
        if (!originalComment) return prev

        const currentlyLiked = originalComment.likes?.includes(userId) || false
        const newLikes = currentlyLiked
          ? originalComment.likes?.filter(id => id !== userId) || []
          : [...(originalComment.likes || []), userId]

        return {
          ...prev,
          [selectedPost.id]: postComments.map(c =>
            c.id === commentId ? { ...c, likes: newLikes } : c
          )
        }
      })
    }

    if (!originalComment) return

    try {
      const response = await forumAPI.comments.like(commentId)
      if (!response.success) {
        // Revert on error
        if (selectedPost) {
          setComments(prev => ({
            ...prev,
            [selectedPost.id]: (prev[selectedPost.id] || []).map(c =>
              c.id === commentId ? originalComment! : c
            )
          }))
        }
      }
    } catch (error) {
      console.error('Error liking comment:', error)
      // Revert on error
      if (selectedPost) {
        setComments(prev => ({
          ...prev,
          [selectedPost.id]: (prev[selectedPost.id] || []).map(c =>
            c.id === commentId ? originalComment! : c
          )
        }))
      }
    }
  }

  const handleReply = async (commentId: string) => {
    if (!selectedPost || !replyContent.trim()) return

    try {
      setPostingReply(true)
      const response = await forumAPI.comments.create(selectedPost.id, {
        content: replyContent,
        parentCommentId: commentId
      })
      if (response.success) {
        setReplyContent('')
        setReplyingTo(null)
        await loadComments(selectedPost.id)
        await loadPosts() // Reload to update comment count
      }
    } catch (error) {
      console.error('Error posting reply:', error)
    } finally {
      setPostingReply(false)
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
      // Fallback: copy to clipboard
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

    if (!newPost.category || newPost.category === 'all') {
      alert('Please select a category')
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
        alert('Post created successfully! It is pending approval and will appear after management reviews it.')
        await loadPosts()
        if (currentUser?.role === 'management') {
          await loadPendingPosts()
        }
      }
    } catch (error) {
      console.error('Error creating post:', error)
      alert('Failed to create post')
    } finally {
      setCreatingPost(false)
    }
  }

  const handleModeratePost = async () => {
    if (!moderationPost || !moderationAction) return

    try {
      setIsModerating(true)
      let response
      if (moderationAction === 'approve') {
        response = await forumAPI.posts.approve(moderationPost.id, moderationNotes)
      } else {
        response = await forumAPI.posts.reject(moderationPost.id, moderationNotes)
      }

      if (response.success) {
        setShowModerationModal(false)
        setModerationPost(null)
        setModerationAction(null)
        setModerationNotes('')
        await loadPosts()
        await loadPendingPosts()
      }
    } catch (error) {
      console.error('Error moderating post:', error)
      alert('Failed to moderate post')
    } finally {
      setIsModerating(false)
    }
  }

  const openModerationModal = (post: ForumPost, action: 'approve' | 'reject') => {
    setModerationPost(post)
    setModerationAction(action)
    setModerationNotes('')
    setShowModerationModal(true)
  }

  // Get categories from posts (for display) + predefined categories
  const categories = useMemo(() => {
    const categorySet = new Set<string>()
    posts.forEach(post => {
      if (post.category) {
        categorySet.add(post.category)
      }
    })
    // Add predefined categories
    FORUM_CATEGORIES.forEach(cat => categorySet.add(cat))
    
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

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchLower) ||
        post.content.toLowerCase().includes(searchLower) ||
        (users[post.authorId]?.name || '').toLowerCase().includes(searchLower)
      )
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (selectedSort) {
        case 'popular':
          return (b.views || 0) - (a.views || 0)
        case 'liked':
          return (b.likes?.length || 0) - (a.likes?.length || 0)
        case 'commented':
          // We don't have comment count in post, so use likes as proxy
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
    if (!user) {
      console.warn('[getAuthorInfo] User not found for authorId:', authorId, 'Available users:', Object.keys(users))
      return { name: 'Unknown User', role: 'User' }
    }
    
    const roleMap: Record<string, string> = {
      'student': 'Student',
      'tutor': 'Tutor',
      'management': 'Management'
    }
    
    return {
      name: user.name || user.email || 'Unknown User',
      role: roleMap[user.role] || 'User'
    }
  }

  const isLiked = (post: ForumPost) => {
    if (!currentUser) return false
    const userId = currentUser.userId || currentUser.id
    return userId && post.likes?.includes(userId)
  }

  const getCommentCount = (postId: string) => {
    // Return actual comment count if loaded, otherwise return 0
    // Comments are loaded when modal opens or when posts are loaded
    return comments[postId]?.length || 0
  }

  const sortOptions = [
    { name: 'Most Recent', value: 'recent' },
    { name: 'Most Popular', value: 'popular' },
    { name: 'Most Liked', value: 'liked' },
    { name: 'Most Commented', value: 'commented' }
  ]

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

            {/* Forum Stats */}
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
                  onClick={() => navigate('/common/library')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <LibraryIcon className="mr-3 w-4 h-4" />
                  Digital Library
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
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Community Forum
                </h1>
                <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Connect, learn, and share knowledge with the community
                </p>
              </div>
              <div className="flex space-x-2">
                {currentUser?.role === 'management' && (
                  <>
                    {pendingPosts.length > 0 && (
                <Button 
                        onClick={() => setShowPendingFilter(!showPendingFilter)}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        Pending ({pendingPosts.length})
                      </Button>
                    )}
                    <Button 
                      onClick={() => {
                        setShowManagementPanel(!showManagementPanel)
                        if (!showManagementPanel) {
                          loadAllPostsForManagement()
                        }
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Manage Posts
                    </Button>
                  </>
                )}
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Add className="w-4 h-4 mr-2" />
                  Create Post
                </Button>
              </div>
            </div>
          </div>

          {/* Pending Posts Section (Manager Only) */}
          {currentUser?.role === 'management' && showPendingFilter && pendingPosts.length > 0 && (
            <div className="mb-8">
              <Card 
                className={`p-6 border ${theme === 'dark' ? 'bg-orange-900/20 border-orange-700' : 'bg-orange-50 border-orange-200'}`}
                style={{
                  borderColor: theme === 'dark' ? '#c2410c' : '#fed7aa',
                  backgroundColor: theme === 'dark' ? '#7c2d12' : '#fff7ed',
                  boxShadow: 'none !important'
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Pending Posts ({pendingPosts.length})
                  </h2>
                  <button
                    onClick={() => setShowPendingFilter(false)}
                    className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-orange-800' : 'hover:bg-orange-100'}`}
                  >
                    <CloseIcon />
                  </button>
                </div>
                <div className="space-y-4">
                  {pendingPosts.map((post) => {
                    const author = getAuthorInfo(post.authorId)
                    return (
                      <div 
                        key={post.id}
                        className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className={`font-semibold text-lg mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {post.title}
                            </h3>
                            <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                              by {author.name} • {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                            </p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} line-clamp-2`}>
                              {post.content}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mt-3">
                          <Button
                            onClick={() => openModerationModal(post, 'approve')}
                            className="bg-green-600 hover:bg-green-700 text-white text-sm"
                          >
                            Approve
                          </Button>
                          <Button
                            onClick={() => openModerationModal(post, 'reject')}
                            className="bg-red-600 hover:bg-red-700 text-white text-sm"
                          >
                            Reject
                          </Button>
                          <span className={`px-2 py-1 text-xs rounded-full ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                            {post.category}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            </div>
          )}

          {/* Management Panel (Manager Only) */}
          {currentUser?.role === 'management' && showManagementPanel && (
            <div className="mb-8">
              <Card 
                className={`p-6 border ${theme === 'dark' ? 'bg-purple-900/20 border-purple-700' : 'bg-purple-50 border-purple-200'}`}
                style={{
                  borderColor: theme === 'dark' ? '#7c3aed' : '#e9d5ff',
                  backgroundColor: theme === 'dark' ? '#581c87' : '#faf5ff',
                  boxShadow: 'none !important'
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Post Management
                  </h2>
                  <button
                    onClick={() => setShowManagementPanel(false)}
                    className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-purple-800' : 'hover:bg-purple-100'}`}
                  >
                    <CloseIcon />
                  </button>
                </div>

                {/* Status Filter */}
                <div className="mb-4 flex space-x-2 flex-wrap gap-2">
                  {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setManagementFilter(status)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        managementFilter === status
                          ? 'bg-purple-600 text-white'
                          : `${theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`
                      }`}
                    >
                      {status === 'all' ? 'All Posts' : status.charAt(0).toUpperCase() + status.slice(1)}
                      {status !== 'all' && (
                        <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                          {allPosts.filter(p => p.status === status).length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Posts List */}
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {allPosts
                    .filter(post => managementFilter === 'all' || post.status === managementFilter)
                    .map((post) => {
                      const author = getAuthorInfo(post.authorId)
                      const statusColor = {
                        pending: 'bg-yellow-100 text-yellow-800',
                        approved: 'bg-green-100 text-green-800',
                        rejected: 'bg-red-100 text-red-800',
                        hidden: 'bg-gray-100 text-gray-800'
                      }[post.status || 'pending'] || 'bg-gray-100 text-gray-800'

                      return (
                        <div 
                          key={post.id}
                          className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className={`font-semibold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {post.title}
                                </h3>
                                <span className={`px-2 py-1 text-xs rounded-full ${statusColor}`}>
                                  {post.status || 'pending'}
                                </span>
                              </div>
                              <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                by {author.name} • {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                              </p>
                              <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} line-clamp-2`}>
                                {post.content}
                              </p>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                  {post.category}
                                </span>
                                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {post.likes?.length || 0} likes • {post.views || 0} views
                                </span>
                              </div>
                              {post.moderationNotes && (
                                <div className={`mt-2 p-2 rounded text-xs ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                  <strong>Moderation Note:</strong> {post.moderationNotes}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 mt-3">
                            {post.status === 'pending' && (
                              <>
                                <Button
                                  onClick={() => openModerationModal(post, 'approve')}
                                  className="bg-green-600 hover:bg-green-700 text-white text-sm"
                                >
                                  Approve
                                </Button>
                                <Button
                                  onClick={() => openModerationModal(post, 'reject')}
                                  className="bg-red-600 hover:bg-red-700 text-white text-sm"
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {post.status === 'rejected' && (
                              <Button
                                onClick={() => openModerationModal(post, 'approve')}
                                className="bg-green-600 hover:bg-green-700 text-white text-sm"
                              >
                                Approve
                              </Button>
                            )}
                            {post.status === 'approved' && (
                              <Button
                                onClick={() => openModerationModal(post, 'reject')}
                                className="bg-red-600 hover:bg-red-700 text-white text-sm"
                              >
                                Reject
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  {allPosts.filter(post => managementFilter === 'all' || post.status === managementFilter).length === 0 && (
                    <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      No posts found with status: {managementFilter}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

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
                  Search Posts
                </h3>
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="Search by title, content, or author..."
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
                      value={selectedSort}
                      onChange={(e) => setSelectedSort(e.target.value)}
                      className={`w-full px-3 py-3 border rounded-lg ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.name}
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
                  <button 
                    onClick={() => {
                      // Filter to show only bookmarked posts
                      // This could be enhanced with a filter state
                    }}
                    className={`w-full flex items-center px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    } transition-colors`}
                  >
                    <Bookmark className="mr-3 w-4 h-4" />
                    My Bookmarks ({bookmarks.size})
                  </button>
                  <button className={`w-full flex items-center px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  } transition-colors`}>
                    <TrendingUp className="mr-3 w-4 h-4" />
                    Trending Posts
                  </button>
                  <button 
                    onClick={() => {
                      // Filter to show only current user's posts
                      if (currentUser) {
                        // This could be enhanced with a filter state
                      }
                    }}
                    className={`w-full flex items-center px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    } transition-colors`}
                  >
                    <Person className="mr-3 w-4 h-4" />
                    My Posts
                  </button>
                </div>
              </Card>
            </div>
          </div>

          {/* Posts List */}
          {loading ? (
            <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading posts...
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              No posts found. Be the first to create a post!
            </div>
          ) : (
          <div className="space-y-6">
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
                <div className="p-6">
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex-1">
                      <h3 className={`font-bold text-2xl mb-3 leading-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {post.title}
                      </h3>
                      <div className="flex items-center space-x-4 mb-2">
                        <div className="flex items-center">
                          <Person className="w-4 h-4 text-gray-400 mr-2" />
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
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
                          <Schedule className="w-4 h-4 text-gray-400 mr-2" />
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                          {post.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
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
                  <div className="mb-5">
                    <p className={`text-base leading-relaxed ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} whitespace-pre-wrap`}>
                      {post.content}
                    </p>
                  </div>

                  {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {post.tags.slice(0, 4).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {post.tags.length > 4 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{post.tags.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                      )}

                  {/* Post Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <button
                        type="button"
                        onClick={(e) => handleLike(e, post.id)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                              liked 
                            ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                            : `${theme === 'dark' ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:text-gray-500 hover:bg-gray-100'}`
                        }`}
                      >
                        <ThumbUp className="w-5 h-5" />
                            <span className="text-sm font-medium">{post.likes?.length || 0}</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleComment(post)
                        }}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:text-gray-500 hover:bg-gray-100'}`}
                      >
                        <Comment className="w-5 h-5" />
                            <span className="text-sm font-medium">{commentCount}</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleShare(post)
                        }}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:text-gray-500 hover:bg-gray-100'}`}
                      >
                        <Share className="w-5 h-5" />
                            <span className="text-sm font-medium">{post.views || 0}</span>
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
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`w-full max-w-2xl mx-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6`}>
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
                  {FORUM_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
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

      {/* Moderation Modal */}
      {showModerationModal && moderationPost && moderationAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`w-full max-w-lg mx-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {moderationAction === 'approve' ? 'Approve Post' : 'Reject Post'}
              </h2>
              <button
                onClick={() => {
                  setShowModerationModal(false)
                  setModerationPost(null)
                  setModerationAction(null)
                  setModerationNotes('')
                }}
                className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <CloseIcon />
              </button>
            </div>
            <div className="mb-4">
              <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {moderationPost.title}
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {moderationPost.content.substring(0, 200)}...
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Notes (optional)
                </label>
                <textarea
                  value={moderationNotes}
                  onChange={(e) => setModerationNotes(e.target.value)}
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder={`Add notes for ${moderationAction === 'approve' ? 'approval' : 'rejection'}...`}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  onClick={() => {
                    setShowModerationModal(false)
                    setModerationPost(null)
                    setModerationAction(null)
                    setModerationNotes('')
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleModeratePost}
                  disabled={isModerating}
                  className={moderationAction === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                  }
                >
                  {isModerating 
                    ? (moderationAction === 'approve' ? 'Approving...' : 'Rejecting...')
                    : (moderationAction === 'approve' ? 'Approve' : 'Reject')
                  }
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {showCommentModal && selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`w-full max-w-2xl mx-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 max-h-[80vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Comments
              </h2>
              <button
                onClick={() => {
                  setShowCommentModal(false)
                  setSelectedPost(null)
                  setNewComment('')
                  setReplyingTo(null)
                  setReplyContent('')
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
            <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
              {comments[selectedPost.id]?.map((comment) => {
                const commentAuthor = getAuthorInfo(comment.authorId)
                const commentUser = users[comment.authorId]
                const userId = currentUser?.userId || currentUser?.id
                const isCommentLiked = userId && comment.likes?.includes(userId) || false
                const commentLikesCount = comment.likes?.length || 0
                
                return (
                  <div key={comment.id} className="flex items-start space-x-3">
                    {/* Avatar */}
                    <Avatar
                      src={commentUser?.avatar}
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: getAvatarColor(commentAuthor.name),
                        fontSize: '0.875rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {getInitials(commentAuthor.name)}
                    </Avatar>
                    
                    {/* Comment Content */}
                    <div className="flex-1 min-w-0">
                      <div className={`inline-block rounded-2xl px-4 py-2 ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`font-semibold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {commentAuthor.name}
                          </span>
                        </div>
                        <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                          {comment.content}
                        </p>
                      </div>
                      
                      {/* Comment Actions */}
                      <div className="flex items-center space-x-4 mt-1 ml-2">
                        <button
                          type="button"
                          onClick={(e) => handleLikeComment(e, comment.id)}
                          className={`text-xs font-medium ${
                            isCommentLiked
                              ? 'text-blue-600'
                              : theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-500'
                          }`}
                        >
                          Like
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setReplyingTo(replyingTo === comment.id ? null : comment.id)
                            setReplyContent('')
                          }}
                          className={`text-xs font-medium ${
                            theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-500'
                          }`}
                        >
                          Reply
                        </button>
                        <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                        {commentLikesCount > 0 && (
                          <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {commentLikesCount} {commentLikesCount === 1 ? 'like' : 'likes'}
                          </span>
                        )}
                      </div>

                      {/* Reply Input */}
                      {replyingTo === comment.id && (
                        <div className="mt-3 ml-2">
                          <div className={`rounded-2xl px-4 py-2 ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                          }`}>
                            <textarea
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              rows={2}
                              className={`w-full resize-none bg-transparent text-sm ${
                                theme === 'dark' ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
                              } focus:outline-none`}
                              placeholder="Write a reply..."
                              style={{ minHeight: '48px', maxHeight: '120px' }}
                              onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement
                                target.style.height = 'auto'
                                target.style.height = `${Math.min(target.scrollHeight, 120)}px`
                              }}
                            />
                          </div>
                          <div className="flex justify-end space-x-2 mt-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                setReplyingTo(null)
                                setReplyContent('')
                              }}
                              className={`text-sm font-medium px-3 py-1.5 rounded-lg ${
                                theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                handleReply(comment.id)
                              }}
                              disabled={postingReply || !replyContent.trim()}
                              className="text-sm font-medium px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {postingReply ? 'Posting...' : 'Reply'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
              {(!comments[selectedPost.id] || comments[selectedPost.id].length === 0) && (
                <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  No comments yet. Be the first to comment!
                </div>
              )}
            </div>
            {/* Comment Input - Facebook Style */}
            <div className="flex items-start space-x-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <Avatar
                src={currentUser?.avatar}
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: getAvatarColor(currentUser?.name || currentUser?.email),
                  fontSize: '0.875rem',
                  fontWeight: 'bold'
                }}
              >
                {getInitials(currentUser?.name || currentUser?.email)}
              </Avatar>
              <div className="flex-1">
                <div className={`rounded-2xl px-4 py-2 ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={1}
                    className={`w-full resize-none bg-transparent text-sm ${
                      theme === 'dark' ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
                    } focus:outline-none`}
                    placeholder="Write a comment..."
                    style={{ minHeight: '36px', maxHeight: '120px' }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement
                      target.style.height = 'auto'
                      target.style.height = `${Math.min(target.scrollHeight, 120)}px`
                    }}
                  />
                </div>
                {newComment.trim() && (
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        setNewComment('')
                      }}
                      className={`text-sm font-medium px-3 py-1 rounded-lg mr-2 ${
                        theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitComment}
                      disabled={postingComment || !newComment.trim()}
                      className="text-sm font-medium px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {postingComment ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                )}
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
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OnlineCommunityForum
