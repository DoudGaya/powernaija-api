import { logger } from '../utils/logger';
import { ErrorTypes } from '../middleware/errorHandler';
import crypto from 'crypto';

/**
 * Payment Service - Handles payment processing with Paystack/Stripe
 */

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY || '';
const PAYMENT_CALLBACK_URL = process.env.PAYMENT_CALLBACK_URL || 'http://localhost:3000/api/payments/callback';

/**
 * Initialize Paystack payment
 */
export async function initializePaystackPayment(
  email: string,
  amount: number,
  metadata?: Record<string, any>
): Promise<{
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}> {
  try {
    const reference = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amount * 100, // Paystack expects amount in kobo
        reference,
        callback_url: PAYMENT_CALLBACK_URL,
        metadata: metadata || {},
      }),
    });

    const data = await response.json();

    if (!data.status) {
      throw ErrorTypes.BadRequest(data.message || 'Payment initialization failed');
    }

    logger.info(`Paystack payment initialized: ${reference}`);

    return {
      authorizationUrl: data.data.authorization_url,
      accessCode: data.data.access_code,
      reference: data.data.reference,
    };
  } catch (error) {
    logger.error('Error initializing Paystack payment:', error);
    throw error;
  }
}

/**
 * Verify Paystack payment
 */
export async function verifyPaystackPayment(reference: string): Promise<{
  status: 'success' | 'failed' | 'pending';
  amount: number;
  currency: string;
  transactionId: string;
  metadata?: any;
}> {
  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = await response.json();

    if (!data.status) {
      throw ErrorTypes.BadRequest('Payment verification failed');
    }

    const transaction = data.data;

    logger.info(`Payment verified: ${reference} - ${transaction.status}`);

    return {
      status: transaction.status === 'success' ? 'success' : 'failed',
      amount: transaction.amount / 100, // Convert from kobo to naira
      currency: transaction.currency,
      transactionId: transaction.id.toString(),
      metadata: transaction.metadata,
    };
  } catch (error) {
    logger.error('Error verifying Paystack payment:', error);
    throw error;
  }
}

/**
 * Verify Paystack webhook signature
 */
export function verifyPaystackWebhook(payload: string, signature: string): boolean {
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(payload)
    .digest('hex');

  return hash === signature;
}

/**
 * Initialize Stripe payment (placeholder for future implementation)
 */
export async function initializeStripePayment(
  email: string,
  amount: number,
  metadata?: Record<string, any>
): Promise<{
  clientSecret: string;
  paymentIntentId: string;
}> {
  try {
    // TODO: Implement Stripe payment initialization
    // This is a placeholder for when Stripe integration is needed
    throw ErrorTypes.ServiceUnavailable('Stripe payment not yet implemented');
  } catch (error) {
    logger.error('Error initializing Stripe payment:', error);
    throw error;
  }
}

/**
 * Verify Stripe payment (placeholder for future implementation)
 */
export async function verifyStripePayment(paymentIntentId: string): Promise<{
  status: 'success' | 'failed' | 'pending';
  amount: number;
  currency: string;
}> {
  try {
    // TODO: Implement Stripe payment verification
    throw ErrorTypes.ServiceUnavailable('Stripe payment not yet implemented');
  } catch (error) {
    logger.error('Error verifying Stripe payment:', error);
    throw error;
  }
}

/**
 * Get payment status from reference
 */
export async function getPaymentStatus(reference: string, provider: 'paystack' | 'stripe' = 'paystack') {
  try {
    if (provider === 'paystack') {
      return await verifyPaystackPayment(reference);
    } else if (provider === 'stripe') {
      return await verifyStripePayment(reference);
    }

    throw ErrorTypes.BadRequest('Invalid payment provider');
  } catch (error) {
    logger.error('Error getting payment status:', error);
    throw error;
  }
}
