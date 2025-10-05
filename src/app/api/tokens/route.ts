import { NextRequest, NextResponse } from 'next/server';
import { getAvailableTokens, getAllTokens, createToken } from '@/services/tokenService';
import { authenticateToken, requireAdmin } from '@/middleware/auth';
import { handleError } from '@/middleware/errorHandler';
import { tokenSchema } from '@/utils/validation';

/**
 * GET /api/tokens
 * Get available tokens (public) or all tokens (admin)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const companyId = searchParams.get('companyId');

    // Try to authenticate (optional)
    const authResponse = await authenticateToken(request);
    const isAdmin = !authResponse;

    if (isAdmin && searchParams.get('all') === 'true') {
      // Admin: Get all tokens
      const result = await getAllTokens(page, limit);
      return NextResponse.json({
        success: true,
        data: result.tokens,
        pagination: result.pagination,
      });
    } else {
      // Public: Get available tokens
      const tokens = await getAvailableTokens();
      return NextResponse.json({
        success: true,
        data: tokens,
      });
    }
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/tokens
 * Create a new token (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResponse = await authenticateToken(request);
    if (authResponse) {
      return authResponse;
    }

    // Verify admin role
    const adminResponse = await requireAdmin(request as any);
    if (adminResponse) {
      return adminResponse;
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = tokenSchema.parse(body);

    // Create token
    const token = await createToken(validatedData);

    return NextResponse.json(
      {
        success: true,
        message: 'Token created successfully',
        data: token,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
