import { NextRequest, NextResponse } from 'next/server';
import { getUserUsageLimits, setUsageLimits } from '@/services/usageService';
import { authenticateToken, getCurrentUser } from '@/middleware/auth';
import { handleError } from '@/middleware/errorHandler';
import { usageLimitsSchema } from '@/utils/validation';

/**
 * GET /api/usage/limits
 * Get user's usage limits
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

    const limits = await getUserUsageLimits(user.userId);

    return NextResponse.json({
      success: true,
      data: limits,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PUT /api/usage/limits
 * Update user's usage limits
 */
export async function PUT(request: NextRequest) {
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
    const validatedData = usageLimitsSchema.parse(body);

    // Set usage limits
    const limits = await setUsageLimits(user.userId, validatedData);

    return NextResponse.json({
      success: true,
      message: 'Usage limits updated successfully',
      data: limits,
    });
  } catch (error) {
    return handleError(error);
  }
}
