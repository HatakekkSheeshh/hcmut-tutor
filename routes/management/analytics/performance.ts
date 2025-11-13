/**
 * Management Performance Analysis APIs
 * GET /api/management/analytics/performance - Get performance analysis
 * POST /api/management/analytics/performance - Generate analysis
 * GET /api/management/analytics/performance/compare - Compare performance
 * GET /api/management/analytics/performance/kpis - Get KPIs
 */

import { Response } from 'express';
import { storage } from '../../../lib/storage.js';
import { 
  User, 
  UserRole,
  Management,
  PerformanceAnalysis,
  PerformanceKPIs
} from '../../../lib/types.js';
import { AuthRequest } from '../../../lib/middleware.js';
import { successResponse, errorResponse } from '../../../lib/utils.js';
import {
  generatePerformanceAnalysis,
  getPerformanceKPIs
} from '../../../lib/services/performanceAnalyzer.js';

/**
 * GET /api/management/analytics/performance
 */
export async function getPerformanceAnalysisHandler(req: AuthRequest, res: Response) {
  try {
    const currentUser = req.user!;
    
    // Only management can view performance analysis
    if (currentUser.role !== UserRole.MANAGEMENT) {
      return res.status(403).json(errorResponse('Bạn không có quyền truy cập'));
    }

    // Check permissions
    const managementUser = await storage.findById<Management>('users.json', currentUser.userId);
    if (!managementUser || !managementUser.permissions?.includes('view_analytics')) {
      return res.status(403).json(errorResponse('Bạn không có quyền xem phân tích hiệu suất'));
    }

    const { 
      type, 
      studentIds, 
      tutorIds, 
      subjects,
      startDate,
      endDate,
      includeComparisons,
      includeTrends
    } = req.query;

    // Default to overall if no type specified
    const analysisType = (type as any) || 'overall';

    // Build scope
    const scope = {
      studentIds: studentIds ? (studentIds as string).split(',') : undefined,
      tutorIds: tutorIds ? (tutorIds as string).split(',') : undefined,
      subjects: subjects ? (subjects as string).split(',') : undefined,
      timeRange: {
        startDate: startDate as string || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: endDate as string || new Date().toISOString()
      }
    };

    const analysis = await generatePerformanceAnalysis(
      analysisType,
      scope,
      includeComparisons === 'true',
      includeTrends !== 'false'
    );

    return res.json(successResponse(analysis));
  } catch (error: any) {
    console.error('Get performance analysis error:', error);
    return res.status(500).json(
      errorResponse('Lỗi lấy phân tích hiệu suất: ' + error.message)
    );
  }
}

/**
 * POST /api/management/analytics/performance
 */
export async function generatePerformanceAnalysisHandler(req: AuthRequest, res: Response) {
  try {
    const currentUser = req.user!;
    
    // Only management can generate analysis
    if (currentUser.role !== UserRole.MANAGEMENT) {
      return res.status(403).json(errorResponse('Bạn không có quyền tạo phân tích'));
    }

    // Check permissions
    const managementUser = await storage.findById<Management>('users.json', currentUser.userId);
    if (!managementUser || !managementUser.permissions?.includes('view_analytics')) {
      return res.status(403).json(errorResponse('Bạn không có quyền tạo phân tích hiệu suất'));
    }

    const { type, scope, includeComparisons, includeTrends } = req.body;

    const analysis = await generatePerformanceAnalysis(
      type,
      scope,
      includeComparisons || false,
      includeTrends !== false
    );

    // Save analysis to analytics.json for future reference
    await storage.create<PerformanceAnalysis>('analytics.json', analysis);

    return res.status(201).json(
      successResponse(analysis, 'Tạo phân tích hiệu suất thành công')
    );
  } catch (error: any) {
    console.error('Generate performance analysis error:', error);
    return res.status(500).json(
      errorResponse('Lỗi tạo phân tích hiệu suất: ' + error.message)
    );
  }
}

/**
 * GET /api/management/analytics/performance/compare
 */
export async function comparePerformanceHandler(req: AuthRequest, res: Response) {
  try {
    const currentUser = req.user!;
    
    // Only management can compare performance
    if (currentUser.role !== UserRole.MANAGEMENT) {
      return res.status(403).json(errorResponse('Bạn không có quyền truy cập'));
    }

    // Check permissions
    const managementUser = await storage.findById<Management>('users.json', currentUser.userId);
    if (!managementUser || !managementUser.permissions?.includes('view_analytics')) {
      return res.status(403).json(errorResponse('Bạn không có quyền so sánh hiệu suất'));
    }

    const { 
      entityIds, 
      entityType, 
      metrics,
      startDate,
      endDate
    } = req.query;

    if (!entityIds || !entityType) {
      return res.status(400).json(errorResponse('entityIds và entityType là bắt buộc'));
    }

    const entityIdArray = (entityIds as string).split(',');

    if (entityIdArray.length < 2) {
      return res.status(400).json(errorResponse('Cần ít nhất 2 entities để so sánh'));
    }

    const scope = {
      studentIds: entityType === 'student' ? entityIdArray : undefined,
      tutorIds: entityType === 'tutor' ? entityIdArray : undefined,
      timeRange: {
        startDate: startDate as string || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: endDate as string || new Date().toISOString()
      }
    };

    const analysis = await generatePerformanceAnalysis(
      'comparative',
      scope,
      true, // include comparisons
      false // don't need trends for comparison
    );

    return res.json(successResponse({
      comparisons: analysis.comparisons || [],
      metrics: analysis.metrics
    }));
  } catch (error: any) {
    console.error('Compare performance error:', error);
    return res.status(500).json(
      errorResponse('Lỗi so sánh hiệu suất: ' + error.message)
    );
  }
}

/**
 * GET /api/management/analytics/performance/kpis
 */
export async function getPerformanceKPIsHandler(req: AuthRequest, res: Response) {
  try {
    const currentUser = req.user!;
    
    // Only management can view KPIs
    if (currentUser.role !== UserRole.MANAGEMENT) {
      return res.status(403).json(errorResponse('Bạn không có quyền truy cập'));
    }

    // Check permissions
    const managementUser = await storage.findById<Management>('users.json', currentUser.userId);
    if (!managementUser || !managementUser.permissions?.includes('view_analytics')) {
      return res.status(403).json(errorResponse('Bạn không có quyền xem KPIs'));
    }

    const kpis = await getPerformanceKPIs();

    return res.json(successResponse(kpis));
  } catch (error: any) {
    console.error('Get performance KPIs error:', error);
    return res.status(500).json(
      errorResponse('Lỗi lấy KPIs: ' + error.message)
    );
  }
}

