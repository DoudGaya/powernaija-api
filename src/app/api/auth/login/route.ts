import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/utils/validation';
import { authenticateUser } from '@/services/userService';
import { handleError } from '@/middleware/errorHandler';
import { authRateLimit } from '@/middleware/rateLimit';

/**
 * POST /api/auth/login
 * Authenticate user and return tokens
 */
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await authRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validatedData = loginSchema.parse(body);

    // Authenticate user
    const { user, tokens } = await authenticateUser(
      validatedData.email,
      validatedData.password
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            wallet: user.wallet,
          },
          tokens,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
