//File sẽ nộp

import { storage, getAllRecords, createRecord, findRecord, updateRecord, deleteRecord } from '../storage.js'
import { generateId, now } from '../utils.js'
import { generateLibraryResources } from '../mockData.js'

// Desired interface for materials (normalized)
interface LibraryMaterial {
  id: string
  title: string
  author: string
  subject: string
  type: 'book' | 'article' | 'thesis' | 'video' | 'other'
  url: string
  thumbnail?: string
  description: string
  tags: string[]
  hcmutId: string
  syncedAt: string
  pdfFileId?: string // ObjectId of PDF in GridFS
}

// Filename used to persist materials
const MATERIALS_FILE = 'library-materials.json'
const BOOKMARKS_FILE = 'library-bookmarks.json'

export const libraryService = {
  /**
   * Fetch materials from HCMUT Library (external) and sync into local storage.
   * If HCMUT_LIBRARY_URL is not configured, falls back to generating mock data.
   */
  async syncFromHCMUTLibrary(): Promise<{ success: boolean; imported: number; error?: string }> {
    try {
      const externalUrl = process.env.HCMUT_LIBRARY_URL || ''
  let materials: LibraryMaterial[] = []

  if (externalUrl) {
        // Try fetching from configured external source
  const res = await fetch(externalUrl)
        if (!res.ok) {
          throw new Error(`Failed to fetch external library: ${res.status} ${res.statusText}`)
        }

        const payload = await res.json()
        // Accept either array or { data: [] }
        const items = Array.isArray(payload) ? payload : payload?.data || []

        // Map external items into LibraryMaterial shape
        materials = items.map((it: any, idx: number) => {
          const mapped: LibraryMaterial = {
            id: it.id || generateId('lib'),
            title: it.title || it.name || `Material ${idx + 1}`,
            author: it.author || it.creator || 'Unknown',
            subject: it.subject || it.category || 'General',
            type: ((it.type as string) || 'other') as LibraryMaterial['type'],
            url: it.url || it.fileUrl || it.link || '',
            thumbnail: it.thumbnail || it.image || undefined,
            description: it.description || it.summary || '',
            tags: Array.isArray(it.tags) ? it.tags : (it.tags ? String(it.tags).split(',').map((s: string) => s.trim()) : []),
            hcmutId: it.hcmutId || it.sourceId || '',
            syncedAt: now()
          }
          return mapped as any
        })
      } else {
        // No external URL -> generate mock resources
        const mocks = generateLibraryResources(30)
        // normalize mocks to LibraryMaterial
        materials = mocks.map((m, idx) => {
          const mapped: LibraryMaterial = {
            id: m.id,
            title: m.title,
            author: m.author || 'Unknown',
            subject: m.subject || 'General',
            type: (m.type as any) in { book: 1, article: 1, video: 1, document: 1 } ? (m.type as any) : 'other',
            url: m.url || '',
            thumbnail: m.thumbnail,
            description: m.description || '',
            tags: m.tags || [],
            hcmutId: m.id, // fallback to own id
            syncedAt: now()
          }
          return mapped as any
        })
      }

      // Persist to storage (overwrite)
  await storage.write(MATERIALS_FILE, materials as any)

      return { success: true, imported: materials.length }
    } catch (error: any) {
      console.error('libraryService.syncFromHCMUTLibrary error:', error)
      return { success: false, imported: 0, error: String(error?.message || error) }
    }
  },

  /**
   * Search materials with optional filters and pagination
   */
  async searchMaterials(
    query?: string,
    filters?: {
      subject?: string
      type?: string
      tags?: string[]
      author?: string
      page?: number
      limit?: number
    }
  ) {
  const page = filters?.page || 1
  const limit = filters?.limit || 10
  const all = await getAllRecords<LibraryMaterial>(MATERIALS_FILE)

    const normalizedQuery = query ? String(query).toLowerCase().trim() : ''

    const result = all.filter((m) => {
      if (normalizedQuery) {
        const hay = `${m.title} ${m.author || ''} ${m.description || ''} ${m.tags?.join(' ') || ''}`.toLowerCase()
        if (!hay.includes(normalizedQuery)) return false
      }

      if (filters?.subject && String(filters.subject).trim() !== '') {
        if ((m.subject || '').toLowerCase() !== String(filters.subject).toLowerCase()) return false
      }

      if (filters?.type && String(filters.type).trim() !== '') {
        if ((m.type || '').toLowerCase() !== String(filters.type).toLowerCase()) return false
      }

      if (filters?.author && String(filters.author).trim() !== '') {
        if (!((m.author || '').toLowerCase().includes(String(filters.author).toLowerCase()))) return false
      }

      if (filters?.tags && filters.tags.length > 0) {
        const tagSet = new Set(filters.tags.map((t) => t.toLowerCase()))
        const hasAny = (m.tags || []).some((t) => tagSet.has(t.toLowerCase()))
        if (!hasAny) return false
      }

      return true
    })

    const total = result.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const paged = result.slice((page - 1) * limit, (page - 1) * limit + limit)

    return {
      success: true,
      data: paged,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    }
  },

  /**
   * Recommend materials for a user. Simple heuristics:
   * - If subject provided, prefer that subject
   * - Use user's preferredSubjects to expand
   * - Rank by downloads/views
   */
  async getRecommendations(userId?: string, subject?: string, limit = 8) {
  const all = await getAllRecords<LibraryMaterial>(MATERIALS_FILE)

    let preferredSubjects: string[] = []
    if (userId) {
      const user = await findRecord<any>('users.json', userId)
      if (user) {
        preferredSubjects = user.preferredSubjects || user.interests || []
      }
    }

    const candidates = all.filter((m) => {
      if (subject && m.subject && m.subject.toLowerCase() === subject.toLowerCase()) return true
      if (preferredSubjects.length > 0 && preferredSubjects.map(s => s.toLowerCase()).includes((m.subject || '').toLowerCase())) return true
      // fallback: include everything
      return true
    })

    // Rank by simple heuristics: subject match, preferredSubjects match, tag overlap
    const scored = candidates.map((m) => {
      let score = 0
      if (subject && m.subject && m.subject.toLowerCase() === subject.toLowerCase()) score += 100
      if (preferredSubjects.length > 0 && preferredSubjects.map(s => s.toLowerCase()).includes((m.subject || '').toLowerCase())) score += 50
      if (m.tags && m.tags.length > 0 && preferredSubjects.length > 0) {
        const tagSet = new Set(m.tags.map(t => t.toLowerCase()))
        const overlap = preferredSubjects.filter(s => tagSet.has(s.toLowerCase())).length
        score += overlap * 10
      }
      // small random tie-breaker
      score += Math.random()
      return { item: m, score }
    })

    scored.sort((a, b) => b.score - a.score)

    const picked = scored.slice(0, limit).map(s => s.item)

    return { success: true, data: picked }
  },

  /**
   * Bookmark a material for a user. Stores record in library-bookmarks.json.
   */
  async bookmarkMaterial(userId: string, materialId: string) {
    try {
      // Quick validation
      const material = await storage.findById(MATERIALS_FILE, materialId)
      if (!material) {
        return { success: false, error: 'Material not found' }
      }

      // Check if user already bookmarked this material
      const allBookmarks = await getAllRecords<any>(BOOKMARKS_FILE)
      const existing = allBookmarks.find((b: any) => b.userId === userId && b.materialId === materialId)

      if (existing) {
        // Unbookmark: remove bookmark record and clear flag on material
        try {
          await deleteRecord(BOOKMARKS_FILE, existing.id)
        } catch (derr) {
          console.warn('Failed to delete bookmark record:', derr)
        }

        try {
          await updateRecord<any>(MATERIALS_FILE, materialId, {
            isBookmarked: false,
            bookmarkedAt: null
          })
        } catch (uerr) {
          console.warn('Failed to update material bookmarked flag during unbookmark:', uerr)
        }

        return { success: true, data: { action: 'removed' } }
      }

      // Create bookmark
      const bookmark = {
        id: generateId('lbk'),
        userId,
        materialId,
        createdAt: now()
      }

      await storage.create(BOOKMARKS_FILE, bookmark as any)

      // Mark material as bookmarked (persist flag)
      try {
        await updateRecord<any>(MATERIALS_FILE, materialId, {
          isBookmarked: true,
          bookmarkedAt: now()
        })
      } catch (uerr) {
        console.warn('Failed to update material bookmarked flag:', uerr)
      }

      return { success: true, data: bookmark }
    } catch (error: any) {
      // If duplicate id error or other, return as failure
      console.error('bookmarkMaterial error:', error)
      return { success: false, error: String(error?.message || error) }
    }
  },

  /**
   * Create a new material (admin only)
   */
  async createMaterial(material: Omit<LibraryMaterial, 'id' | 'syncedAt'>) {
    try {
      const newMaterial: LibraryMaterial = {
        ...material,
        id: generateId('lib'),
        syncedAt: now()
      }
      await storage.create(MATERIALS_FILE, newMaterial as any)
      return { success: true, data: newMaterial }
    } catch (error: any) {
      console.error('createMaterial error:', error)
      return { success: false, error: String(error?.message || error) }
    }
  },

  /**
   * Update a material (admin only)
   */
  async updateMaterial(materialId: string, updates: Partial<LibraryMaterial>) {
    try {
      const material = await storage.findById(MATERIALS_FILE, materialId)
      if (!material) {
        return { success: false, error: 'Material not found' }
      }

      const updated = {
        ...material,
        ...updates,
        id: materialId // Ensure ID doesn't change
      }
      await updateRecord(MATERIALS_FILE, materialId, updated as any)
      return { success: true, data: updated }
    } catch (error: any) {
      console.error('updateMaterial error:', error)
      return { success: false, error: String(error?.message || error) }
    }
  },

  /**
   * Delete a material (admin only)
   */
  async deleteMaterial(materialId: string) {
    try {
      const material = await storage.findById(MATERIALS_FILE, materialId)
      if (!material) {
        return { success: false, error: 'Material not found' }
      }

      await deleteRecord(MATERIALS_FILE, materialId)
      return { success: true }
    } catch (error: any) {
      console.error('deleteMaterial error:', error)
      return { success: false, error: String(error?.message || error) }
    }
  }
}

export default libraryService
