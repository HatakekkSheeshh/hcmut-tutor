/**
 * Library APIs
 * GET  /api/library/search           - Search materials
 * GET  /api/library/sync             - Sync from HCMUT Library (cron job)
 * POST /api/library/bookmarks        - Bookmark material
 * GET  /api/library/recommendations  - Get recommendations
 */

import { Response } from 'express'
import { AuthRequest } from '../../lib/middleware.js'
import { storage } from '../../lib/storage.js'
import { successResponse, errorResponse } from '../../lib/utils.ts'
import libraryService from '../../lib/services/libraryService.ts'

/**
 * GET /api/library/search
 */
export async function searchMaterialsHandler(req: AuthRequest, res: Response) {
  try {
    const { q, subject, type, tags, page = '1', limit = '10' } = req.query

    const filters: any = {
      subject: subject as string | undefined,
      type: type as string | undefined,
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 10
    }

    if (tags) {
      filters.tags = String(tags).split(',').map((t) => t.trim()).filter(Boolean)
    }

    const result = await libraryService.searchMaterials(q as string | undefined, filters)

    return res.json(result)
  } catch (error: any) {
    return res.status(500).json(errorResponse('Lỗi tìm kiếm tài liệu: ' + error.message))
  }
}

/**
 * GET /api/library/sync
 * Note: Intended for cron/admin. Server should protect this endpoint (authorize) when registering the route.
 */
export async function syncLibraryHandler(req: AuthRequest, res: Response) {
  try {
    const result = await libraryService.syncFromHCMUTLibrary()
    if (!result.success) {
      return res.status(500).json(errorResponse('Đồng bộ thất bại: ' + result.error))
    }
    return res.json(successResponse({ imported: result.imported }, 'Đồng bộ thành công'))
  } catch (error: any) {
    return res.status(500).json(errorResponse('Lỗi khi đồng bộ thư viện: ' + error.message))
  }
}

/**
 * POST /api/library/bookmarks
 */
export async function bookmarkMaterialHandler(req: AuthRequest, res: Response) {
  try {
    const currentUser = req.user
    if (!currentUser) {
      return res.status(401).json(errorResponse('Unauthorized', 401))
    }

    const { materialId } = req.body
    if (!materialId) {
      return res.status(400).json(errorResponse('materialId is required', 400))
    }

    const result = await libraryService.bookmarkMaterial(currentUser.userId, materialId)
    if (!result.success) {
      return res.status(400).json(errorResponse(result.error || 'Unable to bookmark'))
    }

    return res.status(201).json(successResponse(result.data, 'Đã bookmark tài liệu'))
  } catch (error: any) {
    return res.status(500).json(errorResponse('Lỗi bookmark tài liệu: ' + error.message))
  }
}

/**
 * GET /api/library/recommendations
 */
export async function getRecommendationsHandler(req: AuthRequest, res: Response) {
  try {
    const { userId, subject, limit = '8' } = req.query
    const limitNum = parseInt(limit as string) || 8

    // Prefer authenticated user if available
    const currentUser = req.user
    const uid = currentUser ? currentUser.userId : (userId as string | undefined)

    const result = await libraryService.getRecommendations(uid, subject as string | undefined, limitNum)
    return res.json(result)
  } catch (error: any) {
    return res.status(500).json(errorResponse('Lỗi lấy gợi ý tài liệu: ' + error.message))
  }
}
