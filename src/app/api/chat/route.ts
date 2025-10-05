import { NextRequest, NextResponse } from 'next/server';
import { sendChatMessage, translateMessage } from '@/services/chatbotService';
import { authenticateToken, getCurrentUser } from '@/middleware/auth';
import { handleError } from '@/middleware/errorHandler';
import { chatMessageSchema } from '@/utils/validation';
import { chatRateLimit } from '@/middleware/rateLimit';

/**
 * POST /api/chat
 * Send a chat message and get AI response
 */
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await chatRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

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
    const validatedData = chatMessageSchema.parse(body);

    // Check if this is a translation request
    if (body.translate) {
      const translation = await translateMessage(validatedData.message, body.targetLanguage || 'en');
      return NextResponse.json({
        success: true,
        data: translation,
      });
    }

    // Send chat message
    const response = await sendChatMessage(
      user.userId,
      validatedData.message,
      validatedData.sessionId,
      validatedData.language
    );

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    return handleError(error);
  }
}
