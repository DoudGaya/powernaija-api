import { NextRequest, NextResponse } from 'next/server';
import { purchaseTokens, completeTokenPurchase } from '@/services/tokenService';
import { authenticateToken, getCurrentUser } from '@/middleware/auth';
import { handleError } from '@/middleware/errorHandler';
import { tokenPurchaseSchema } from '@/utils/validation';
import { initializePaystackPayment } from '@/services/paymentService';

/**
 * POST /api/tokens/purchase
 * Initiate token purchase
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
    const validatedData = tokenPurchaseSchema.parse(body);

    // Create token purchase transaction
    const purchase = await purchaseTokens(user.userId, {
      tokenId: validatedData.tokenId,
      quantity: validatedData.quantity,
      amount: validatedData.amount,
      paymentMethod: validatedData.paymentMethod,
    });

    // Initialize payment with Paystack
    const payment = await initializePaystackPayment(
      user.email,
      validatedData.amount,
      {
        transactionId: purchase.transactionId,
        userId: user.userId,
        tokenId: validatedData.tokenId,
        quantity: validatedData.quantity,
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Token purchase initiated',
        data: {
          ...purchase,
          payment: {
            authorizationUrl: payment.authorizationUrl,
            reference: payment.reference,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
