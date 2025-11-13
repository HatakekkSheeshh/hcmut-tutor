/**
 * Management Document APIs
 * GET /api/management/documents - List documents
 * POST /api/management/documents - Upload document
 * GET /api/management/documents/:id - Get document detail
 * PUT /api/management/documents/:id - Update document
 * DELETE /api/management/documents/:id - Delete document
 * POST /api/management/documents/:id/share - Share document
 * GET /api/management/documents/:id/access - Get access permissions
 * PUT /api/management/documents/:id/access - Update access permissions
 */

import { Response } from 'express';
import { storage } from '../../../lib/storage.js';
import { 
  User, 
  UserRole,
  Management,
  Document,
  DocumentPermission,
  DocumentSharing,
  DocumentActivity
} from '../../../lib/types.js';
import { AuthRequest } from '../../../lib/middleware.js';
import { successResponse, errorResponse } from '../../../lib/utils.js';
import {
  createDocument,
  updateDocument,
  deleteDocument,
  shareDocument,
  getDocumentPermissions,
  updateDocumentAccess,
  checkDocumentPermission,
  recordDocumentView,
  recordDocumentDownload
} from '../../../lib/services/documentManager.js';

/**
 * GET /api/management/documents
 */
export async function listDocumentsHandler(req: AuthRequest, res: Response) {
  try {
    const currentUser = req.user!;
    
    // Only authenticated users can list documents
    if (!currentUser) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    const { 
      category, 
      subject, 
      isPublic,
      uploadedBy,
      page = '1', 
      limit = '20' 
    } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    let documents = await storage.read<Document>('documents.json');

    // Filter by category
    if (category) {
      documents = documents.filter(d => d.category === category);
    }

    // Filter by subject
    if (subject) {
      documents = documents.filter(d => d.subject === subject);
    }

    // Filter by isPublic
    if (isPublic !== undefined) {
      documents = documents.filter(d => d.isPublic === (isPublic === 'true'));
    }

    // Filter by uploadedBy
    if (uploadedBy) {
      documents = documents.filter(d => d.uploadedBy === uploadedBy);
    }

    // Filter by permissions
    // Only show documents user has access to
    const accessibleDocuments: Document[] = [];
    for (const doc of documents) {
      const hasAccess = await checkDocumentPermission(doc.id, currentUser.userId, 'read');
      if (hasAccess || doc.isPublic) {
        accessibleDocuments.push(doc);
      }
    }

    // Sort by uploadedAt (newest first)
    accessibleDocuments.sort((a, b) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );

    // Pagination
    const total = accessibleDocuments.length;
    const totalPages = Math.ceil(total / limitNum);
    const start = (pageNum - 1) * limitNum;
    const end = start + limitNum;
    const paginatedData = accessibleDocuments.slice(start, end);

    // Get uploader info
    const uploaderIds = Array.from(new Set(paginatedData.map(d => d.uploadedBy)));
    const uploadersMap = await storage.findByIds<User>('users.json', uploaderIds);

    const enrichedData = paginatedData.map(doc => {
      const uploader = uploadersMap.get(doc.uploadedBy);
      return {
        ...doc,
        uploader: uploader ? {
          id: uploader.id,
          name: uploader.name,
          email: uploader.email
        } : null
      };
    });

    return res.json(successResponse({
      data: enrichedData,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages
      }
    }));
  } catch (error: any) {
    console.error('List documents error:', error);
    return res.status(500).json(
      errorResponse('Lỗi lấy danh sách tài liệu: ' + error.message)
    );
  }
}

/**
 * POST /api/management/documents
 */
export async function uploadDocumentHandler(req: AuthRequest, res: Response) {
  try {
    const currentUser = req.user!;
    
    // Only authenticated users can upload documents
    if (!currentUser) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    // Management users have full access
    const isManagement = currentUser.role === UserRole.MANAGEMENT;
    if (!isManagement) {
      // Check if user has upload permission
      const hasPermission = true; // Students and tutors can upload
      if (!hasPermission) {
        return res.status(403).json(errorResponse('Bạn không có quyền upload tài liệu'));
      }
    }

    const {
      title,
      description,
      fileName,
      fileUrl,
      fileSize,
      fileType,
      category,
      subject,
      tags,
      isPublic,
      isEncrypted,
      accessLevel,
      metadata
    } = req.body;

    const document = await createDocument(
      title,
      fileName,
      fileUrl,
      fileSize,
      fileType,
      currentUser.userId,
      {
        description,
        category,
        subject,
        tags,
        isPublic,
        isEncrypted,
        accessLevel,
        metadata
      }
    );

    return res.status(201).json(
      successResponse(document, 'Upload tài liệu thành công')
    );
  } catch (error: any) {
    console.error('Upload document error:', error);
    return res.status(500).json(
      errorResponse('Lỗi upload tài liệu: ' + error.message)
    );
  }
}

/**
 * GET /api/management/documents/:id
 */
export async function getDocumentHandler(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    if (!currentUser) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    const document = await storage.findById<Document>('documents.json', id);
    if (!document) {
      return res.status(404).json(errorResponse('Không tìm thấy tài liệu'));
    }

    // Check permission
    const hasPermission = await checkDocumentPermission(id, currentUser.userId, 'read');
    if (!hasPermission && !document.isPublic) {
      return res.status(403).json(errorResponse('Bạn không có quyền truy cập tài liệu này'));
    }

    // Record view
    await recordDocumentView(id, currentUser.userId);

    // Get uploader info
    const uploader = await storage.findById<User>('users.json', document.uploadedBy);

    return res.json(successResponse({
      ...document,
      uploader: uploader ? {
        id: uploader.id,
        name: uploader.name,
        email: uploader.email
      } : null
    }));
  } catch (error: any) {
    console.error('Get document error:', error);
    return res.status(500).json(
      errorResponse('Lỗi lấy thông tin tài liệu: ' + error.message)
    );
  }
}

/**
 * PUT /api/management/documents/:id
 */
export async function updateDocumentHandler(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    if (!currentUser) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    const document = await storage.findById<Document>('documents.json', id);
    if (!document) {
      return res.status(404).json(errorResponse('Không tìm thấy tài liệu'));
    }

    // Check permission (only owner or management can update)
    const isManagement = currentUser.role === UserRole.MANAGEMENT;
    const isOwner = document.uploadedBy === currentUser.userId;
    const hasWritePermission = await checkDocumentPermission(id, currentUser.userId, 'write');

    if (!isManagement && !isOwner && !hasWritePermission) {
      return res.status(403).json(errorResponse('Bạn không có quyền cập nhật tài liệu này'));
    }

    const {
      title,
      description,
      category,
      subject,
      tags,
      isPublic,
      accessLevel,
      metadata
    } = req.body;

    const updatedDocument = await updateDocument(id, {
      title,
      description,
      category,
      subject,
      tags,
      isPublic,
      accessLevel,
      metadata
    });

    return res.json(
      successResponse(updatedDocument, 'Cập nhật tài liệu thành công')
    );
  } catch (error: any) {
    console.error('Update document error:', error);
    return res.status(500).json(
      errorResponse('Lỗi cập nhật tài liệu: ' + error.message)
    );
  }
}

/**
 * DELETE /api/management/documents/:id
 */
export async function deleteDocumentHandler(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    if (!currentUser) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    const document = await storage.findById<Document>('documents.json', id);
    if (!document) {
      return res.status(404).json(errorResponse('Không tìm thấy tài liệu'));
    }

    // Check permission (only owner or management can delete)
    const isManagement = currentUser.role === UserRole.MANAGEMENT;
    const isOwner = document.uploadedBy === currentUser.userId;
    const hasDeletePermission = await checkDocumentPermission(id, currentUser.userId, 'delete');

    if (!isManagement && !isOwner && !hasDeletePermission) {
      return res.status(403).json(errorResponse('Bạn không có quyền xóa tài liệu này'));
    }

    await deleteDocument(id, currentUser.userId);

    return res.json(
      successResponse(null, 'Xóa tài liệu thành công')
    );
  } catch (error: any) {
    console.error('Delete document error:', error);
    return res.status(500).json(
      errorResponse('Lỗi xóa tài liệu: ' + error.message)
    );
  }
}

/**
 * POST /api/management/documents/:id/share
 */
export async function shareDocumentHandler(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    if (!currentUser) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    const document = await storage.findById<Document>('documents.json', id);
    if (!document) {
      return res.status(404).json(errorResponse('Không tìm thấy tài liệu'));
    }

    // Check permission
    const hasPermission = await checkDocumentPermission(id, currentUser.userId, 'share');
    if (!hasPermission) {
      return res.status(403).json(errorResponse('Bạn không có quyền chia sẻ tài liệu này'));
    }

    const { userIds, message, expiresAt, accessLevel } = req.body;

    const sharing = await shareDocument(
      id,
      currentUser.userId,
      userIds,
      {
        message,
        expiresAt,
        accessLevel
      }
    );

    return res.status(201).json(
      successResponse(sharing, 'Chia sẻ tài liệu thành công')
    );
  } catch (error: any) {
    console.error('Share document error:', error);
    return res.status(500).json(
      errorResponse('Lỗi chia sẻ tài liệu: ' + error.message)
    );
  }
}

/**
 * GET /api/management/documents/:id/access
 */
export async function getDocumentAccessHandler(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    if (!currentUser) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    const document = await storage.findById<Document>('documents.json', id);
    if (!document) {
      return res.status(404).json(errorResponse('Không tìm thấy tài liệu'));
    }

    // Only owner or management can view access permissions
    const isManagement = currentUser.role === UserRole.MANAGEMENT;
    const isOwner = document.uploadedBy === currentUser.userId;

    if (!isManagement && !isOwner) {
      return res.status(403).json(errorResponse('Bạn không có quyền xem quyền truy cập'));
    }

    const permissions = await getDocumentPermissions(id);

    // Get user info
    const userIds = Array.from(new Set(permissions.map(p => p.userId)));
    const usersMap = await storage.findByIds<User>('users.json', userIds);

    const enrichedPermissions = permissions.map(perm => {
      const user = usersMap.get(perm.userId);
      return {
        ...perm,
        user: user ? {
          id: user.id,
          name: user.name,
          email: user.email
        } : null
      };
    });

    return res.json(successResponse(enrichedPermissions));
  } catch (error: any) {
    console.error('Get document access error:', error);
    return res.status(500).json(
      errorResponse('Lỗi lấy quyền truy cập: ' + error.message)
    );
  }
}

/**
 * PUT /api/management/documents/:id/access
 */
export async function updateDocumentAccessHandler(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    if (!currentUser) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    const document = await storage.findById<Document>('documents.json', id);
    if (!document) {
      return res.status(404).json(errorResponse('Không tìm thấy tài liệu'));
    }

    const { userId, permission, expiresAt } = req.body;

    const updatedPermission = await updateDocumentAccess(
      id,
      userId,
      permission,
      currentUser.userId,
      expiresAt
    );

    return res.json(
      successResponse(updatedPermission, 'Cập nhật quyền truy cập thành công')
    );
  } catch (error: any) {
    console.error('Update document access error:', error);
    return res.status(500).json(
      errorResponse('Lỗi cập nhật quyền truy cập: ' + error.message)
    );
  }
}

