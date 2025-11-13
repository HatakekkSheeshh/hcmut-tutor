/**
 * GET /api/library/materials/:id - Get material detail
 */
import { Response } from 'express'
import { AuthRequest } from '../../lib/middleware.js'
import { storage } from '../../lib/storage.js'
import { successResponse, errorResponse } from '../../lib/utils.js'

export async function getMaterialHandler(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params
  const material = await storage.findById<any>('library-materials.json', id)
    if (!material) {
      return res.status(404).json(errorResponse('Không tìm thấy tài liệu'))
    }

    // Optionally increment views
    try {
      if (typeof material.views === 'number') {
        await storage.update<any>('library-materials.json', id, { views: material.views + 1 })
      }
    } catch (e) {
      // non-fatal
      console.warn('Failed to increment material views', e)
    }

    return res.json(successResponse(material))
  } catch (error: any) {
    return res.status(500).json(errorResponse('Lỗi lấy chi tiết tài liệu: ' + error.message))
  }
}

export default getMaterialHandler
