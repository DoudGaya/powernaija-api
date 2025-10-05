import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/middleware/auth';
import { handleError } from '@/middleware/errorHandler';

/**
 * POST /api/auth/logout
 * Logout user (client-side should remove tokens)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResponse = await authenticateToken(request);
    if (authResponse) {
      return authResponse;
    }

    // In a JWT-based auth, logout is primarily handled client-side
    // Here we could add token to a blacklist in Redis if needed

    return NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
