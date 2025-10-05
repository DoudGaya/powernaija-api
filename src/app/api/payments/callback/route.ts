import { NextRequest, NextResponse } from 'next/server';
import { verifyPaystackPayment } from '@/services/paymentService';
import { completeTokenPurchase } from '@/services/tokenService';
import { prisma } from '@/lib/prisma';
import { handleError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

/**
 * GET /api/payments/callback
 * Handle payment callback from Paystack
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json(
        { success: false, error: 'Payment reference is required' },
        { status: 400 }
      );
    }

    // Verify payment
    const verification = await verifyPaystackPayment(reference);

    if (verification.status === 'success') {
      // Find transaction by reference
      const transaction = await prisma.transaction.findUnique({
        where: { reference },
      });

      if (transaction && transaction.status === 'PENDING') {
        // Complete the token purchase
        await completeTokenPurchase(transaction.id);

        logger.info(`Payment successful: ${reference}`);

        // Redirect to success page
        return NextResponse.redirect(new URL('/dashboard?payment=success', request.url));
      }
    }

    // Redirect to failure page
    return NextResponse.redirect(new URL('/dashboard?payment=failed', request.url));
  } catch (error) {
    logger.error('Payment callback error:', error);
    return NextResponse.redirect(new URL('/dashboard?payment=error', request.url));
  }
}
