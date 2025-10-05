import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/utils/validation';
import { createUser } from '@/services/userService';
import { handleError } from '@/middleware/errorHandler';
import { authRateLimit } from '@/middleware/rateLimit';

/**
 * POST /api/auth/register
 * Register a new user
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
    const validatedData = registerSchema.parse(body);

    // Create user
    const user = await createUser(validatedData);

    return NextResponse.json(
      {
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
