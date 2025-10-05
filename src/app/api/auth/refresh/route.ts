import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, generateAccessToken } from '@/utils/encryption';
import { getUserById } from '@/services/userService';
import { handleError, ErrorTypes } from '@/middleware/errorHandler';

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      throw ErrorTypes.BadRequest('Refresh token is required');
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      throw ErrorTypes.Unauthorized('Invalid or expired refresh token');
    }

    // Get user
    const user = await getUserById(payload.userId);
    if (!user) {
      throw ErrorTypes.NotFound('User not found');
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken,
          expiresIn: 900, // 15 minutes
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
