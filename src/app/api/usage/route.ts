import { NextRequest, NextResponse } from 'next/server';
import { logUsage, getUserUsageStats, getAllUsageLogs } from '@/services/usageService';
import { authenticateToken, getCurrentUser, requireAdmin } from '@/middleware/auth';
import { handleError } from '@/middleware/errorHandler';
import { usageTrackSchema } from '@/utils/validation';

/**
 * GET /api/usage
 * Get user's usage statistics or all usage logs (admin)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResponse = await authenticateToken(request);
    if (authResponse) {
      return authResponse;
    }

    const user = getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') as any || 'monthly';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Check if admin requesting all logs
    if (user.role === 'ADMIN' && searchParams.get('all') === 'true') {
      const result = await getAllUsageLogs(page, limit);
      return NextResponse.json({
        success: true,
        data: result.logs,
        pagination: result.pagination,
      });
    }

    // Get user's usage stats
    const stats = await getUserUsageStats(user.userId, period);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/usage
 * Log energy usage
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResponse = await authenticateToken(request);
    if (authResponse) {
      return authResponse;
    }

    const user = getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = usageTrackSchema.parse(body);

    // Log usage
    const usageLog = await logUsage(
      user.userId,
      validatedData.tokenId,
      validatedData.amount,
      validatedData.metadata
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Usage logged successfully',
        data: usageLog,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
