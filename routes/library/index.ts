/**
 * Digital Library APIs
 * ...
 */

import { Response } from 'express';
import { storage } from '../../lib/storage.js';
// ✅ Interface của bạn đã được import (giả sử từ types.ts)
import { LibraryResource } from '../../lib/types.js'; 
import { AuthRequest } from '../../lib/middleware.js';
import { successResponse, errorResponse } from '../../lib/utils.js';

// ... (Hàm listLibraryResourcesHandler và getLibraryResourceHandler
//      giữ nguyên như tin nhắn trước) ...

export async function listLibraryResourcesHandler(req: AuthRequest, res: Response) {
  // (Giữ nguyên code từ tin nhắn trước)
  try {
    const { page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const allResources = await storage.read<LibraryResource>('library.json');

    allResources.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const total = allResources.length;
    const totalPages = Math.ceil(total / limitNum);
    const start = (pageNum - 1) * limitNum;
    const end = start + limitNum;
    const paginatedData = allResources.slice(start, end);

    const result = {
      data: paginatedData,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages
      }
    };
    
    return res.json(successResponse(result));
  } catch (error: any) {
    return res.status(500).json(errorResponse('Lỗi lấy tài nguyên thư viện: ' + error.message));
  }
}

export async function getLibraryResourceHandler(req: AuthRequest, res: Response) {
  // (Giữ nguyên code từ tin nhắn trước)
  try {
    const { id } = req.params;
    const resource = await storage.findById<LibraryResource>('library.json', id);
    
    if (!resource) {
      return res.status(404).json(errorResponse('Không tìm thấy tài nguyên'));
    }
    
    return res.json(successResponse(resource));
  } catch (error: any) {
    return res.status(500).json(errorResponse('Lỗi lấy chi tiết tài nguyên: ' + error.message));
  }
}

/**
 * GET /api/library/search
 * Tìm kiếm tài nguyên (ĐÃ CẬP NHẬT để xử lý optional fields '?')
 */
export async function searchLibraryHandler(req: AuthRequest, res: Response) {
  try {
    const { q } = req.query; // q = query

    if (!q || typeof q !== 'string') {
      return res.status(400).json(errorResponse('Thiếu tham số tìm kiếm "q"'));
    }

    const query = q.toLowerCase();
    const allResources = await storage.read<LibraryResource>('library.json');

    // Logic tìm kiếm "an toàn"
    const results = allResources.filter(r => {
      const inTitle = r.title.toLowerCase().includes(query);
      const inSubject = r.subject.toLowerCase().includes(query);
      
      // Kiểm tra trường optional trước khi truy cập
      const inDescription = r.description ? r.description.toLowerCase().includes(query) : false;
      const inAuthor = r.author ? r.author.toLowerCase().includes(query) : false;
      const inTags = r.tags.some(tag => tag.toLowerCase().includes(query));
      
      return inTitle || inSubject || inDescription || inAuthor || inTags;
    });

    return res.json(successResponse(results));
  } catch (error: any) {
    return res.status(500).json(errorResponse('Lỗi tìm kiếm tài nguyên: ' + error.message));
  }
}