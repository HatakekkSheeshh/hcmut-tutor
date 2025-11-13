/**
 * Management Progress Reports APIs
 * GET /api/management/reports/progress - List progress reports
 * POST /api/management/reports/progress - Create progress report
 * GET /api/management/reports/progress/:id - Get report detail
 * GET /api/management/reports/progress/:id/export - Export report
 * PUT /api/management/reports/progress/:id - Update report
 */

import { Response } from 'express';
import { storage } from '../../../lib/storage.js';
import { 
  User, 
  UserRole,
  Management,
  ProgressReport
} from '../../../lib/types.js';
import { AuthRequest } from '../../../lib/middleware.js';
import { successResponse, errorResponse, generateId, now } from '../../../lib/utils.js';
import {
  generateProgressReport,
  exportReport
} from '../../../lib/services/reportGenerator.js';

/**
 * GET /api/management/reports/progress
 */
export async function listProgressReportsHandler(req: AuthRequest, res: Response) {
  try {
    const currentUser = req.user!;
    
    // Only management can list reports
    if (currentUser.role !== UserRole.MANAGEMENT) {
      return res.status(403).json(errorResponse('Bạn không có quyền truy cập'));
    }

    // Check permissions
    const managementUser = await storage.findById<Management>('users.json', currentUser.userId);
    if (!managementUser || !managementUser.permissions?.includes('view_reports')) {
      return res.status(403).json(errorResponse('Bạn không có quyền xem báo cáo'));
    }

    const { type, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    let reports = await storage.read<ProgressReport>('progress-reports.json');

    // Filter by type
    if (type) {
      reports = reports.filter(r => r.type === type);
    }

    // Sort by createdAt (newest first)
    reports.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Pagination
    const total = reports.length;
    const totalPages = Math.ceil(total / limitNum);
    const start = (pageNum - 1) * limitNum;
    const end = start + limitNum;
    const paginatedData = reports.slice(start, end);

    // Get creator info
    const creatorIds = Array.from(new Set(paginatedData.map(r => r.createdBy)));
    const creatorsMap = await storage.findByIds<User>('users.json', creatorIds);

    const enrichedData = paginatedData.map(report => {
      const creator = creatorsMap.get(report.createdBy);
      return {
        ...report,
        creator: creator ? {
          id: creator.id,
          name: creator.name,
          email: creator.email
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
    console.error('List progress reports error:', error);
    return res.status(500).json(
      errorResponse('Lỗi lấy danh sách báo cáo: ' + error.message)
    );
  }
}

/**
 * POST /api/management/reports/progress
 */
export async function createProgressReportHandler(req: AuthRequest, res: Response) {
  try {
    const currentUser = req.user!;
    
    // Only management can create reports
    if (currentUser.role !== UserRole.MANAGEMENT) {
      return res.status(403).json(errorResponse('Bạn không có quyền tạo báo cáo'));
    }

    // Check permissions
    const managementUser = await storage.findById<Management>('users.json', currentUser.userId);
    if (!managementUser || !managementUser.permissions?.includes('view_reports')) {
      return res.status(403).json(errorResponse('Bạn không có quyền tạo báo cáo'));
    }

    const { title, type, scope, filters } = req.body;

    // Generate report
    const report = await generateProgressReport(type, scope, filters);

    // Update title if provided
    if (title) {
      report.title = title;
    }

    // Set creator
    report.createdBy = currentUser.userId;

    // Save report
    await storage.create<ProgressReport>('progress-reports.json', report);

    return res.status(201).json(
      successResponse(report, 'Tạo báo cáo tiến độ thành công')
    );
  } catch (error: any) {
    console.error('Create progress report error:', error);
    return res.status(500).json(
      errorResponse('Lỗi tạo báo cáo: ' + error.message)
    );
  }
}

/**
 * GET /api/management/reports/progress/:id
 */
export async function getProgressReportHandler(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    // Only management can view reports
    if (currentUser.role !== UserRole.MANAGEMENT) {
      return res.status(403).json(errorResponse('Bạn không có quyền truy cập'));
    }

    // Check permissions
    const managementUser = await storage.findById<Management>('users.json', currentUser.userId);
    if (!managementUser || !managementUser.permissions?.includes('view_reports')) {
      return res.status(403).json(errorResponse('Bạn không có quyền xem báo cáo'));
    }

    const report = await storage.findById<ProgressReport>('progress-reports.json', id);
    if (!report) {
      return res.status(404).json(errorResponse('Không tìm thấy báo cáo'));
    }

    // Get creator info
    const creator = await storage.findById<User>('users.json', report.createdBy);

    return res.json(successResponse({
      ...report,
      creator: creator ? {
        id: creator.id,
        name: creator.name,
        email: creator.email
      } : null
    }));
  } catch (error: any) {
    console.error('Get progress report error:', error);
    return res.status(500).json(
      errorResponse('Lỗi lấy thông tin báo cáo: ' + error.message)
    );
  }
}

/**
 * GET /api/management/reports/progress/:id/export
 */
export async function exportProgressReportHandler(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { format = 'json' } = req.query;
    const currentUser = req.user!;

    // Only management can export reports
    if (currentUser.role !== UserRole.MANAGEMENT) {
      return res.status(403).json(errorResponse('Bạn không có quyền truy cập'));
    }

    // Check permissions
    const managementUser = await storage.findById<Management>('users.json', currentUser.userId);
    if (!managementUser || !managementUser.permissions?.includes('view_reports')) {
      return res.status(403).json(errorResponse('Bạn không có quyền xuất báo cáo'));
    }

    const report = await storage.findById<ProgressReport>('progress-reports.json', id);
    if (!report) {
      return res.status(404).json(errorResponse('Không tìm thấy báo cáo'));
    }

    const exported = exportReport(report, format as 'json' | 'csv' | 'pdf');

    // Set appropriate content type
    let contentType = 'application/json';
    let filename = `progress-report-${id}.json`;
    
    if (format === 'csv') {
      contentType = 'text/csv';
      filename = `progress-report-${id}.csv`;
    } else if (format === 'pdf') {
      contentType = 'application/pdf';
      filename = `progress-report-${id}.pdf`;
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    return res.send(exported);
  } catch (error: any) {
    console.error('Export progress report error:', error);
    return res.status(500).json(
      errorResponse('Lỗi xuất báo cáo: ' + error.message)
    );
  }
}

/**
 * PUT /api/management/reports/progress/:id
 */
export async function updateProgressReportHandler(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { title, filters } = req.body;
    const currentUser = req.user!;

    // Only management can update reports
    if (currentUser.role !== UserRole.MANAGEMENT) {
      return res.status(403).json(errorResponse('Bạn không có quyền cập nhật báo cáo'));
    }

    // Check permissions
    const managementUser = await storage.findById<Management>('users.json', currentUser.userId);
    if (!managementUser || !managementUser.permissions?.includes('view_reports')) {
      return res.status(403).json(errorResponse('Bạn không có quyền cập nhật báo cáo'));
    }

    const report = await storage.findById<ProgressReport>('progress-reports.json', id);
    if (!report) {
      return res.status(404).json(errorResponse('Không tìm thấy báo cáo'));
    }

    // Update report
    const updatedReport = await storage.update<ProgressReport>('progress-reports.json', id, {
      title: title || report.title,
      filters: filters || report.filters,
      updatedAt: now()
    });

    return res.json(
      successResponse(updatedReport, 'Cập nhật báo cáo thành công')
    );
  } catch (error: any) {
    console.error('Update progress report error:', error);
    return res.status(500).json(
      errorResponse('Lỗi cập nhật báo cáo: ' + error.message)
    );
  }
}

