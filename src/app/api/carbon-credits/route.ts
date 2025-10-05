import { NextRequest, NextResponse } from 'next/server';
import { getUserCarbonCredits, monetizeCarbonCredits, getCarbonCreditStats } from '@/services/carbonService';
import { authenticateToken, getCurrentUser } from '@/middleware/auth';
import { handleError } from '@/middleware/errorHandler';
import { carbonMonetizeSchema } from '@/utils/validation';

/**
 * GET /api/carbon-credits
 * Get user's carbon credits and stats
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
    const includeUsed = searchParams.get('includeUsed') === 'true';

    const [credits, stats] = await Promise.all([
      getUserCarbonCredits(user.userId, includeUsed),
      getCarbonCreditStats(user.userId),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        credits,
        stats,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/carbon-credits
 * Monetize carbon credits
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
    const validatedData = carbonMonetizeSchema.parse(body);

    // Monetize carbon credits
    const result = await monetizeCarbonCredits(
      user.userId,
      validatedData.creditIds,
      validatedData.action
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Carbon credits monetized successfully',
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
