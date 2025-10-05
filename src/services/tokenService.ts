import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';
import { ErrorTypes } from '../middleware/errorHandler';
import { updateWalletBalance } from './userService';
import type { TokenWithCompany, TokenPurchaseData } from '../types';

/**
 * Token Service - Handles token operations
 */

/**
 * Get all available tokens
 */
export async function getAvailableTokens(): Promise<TokenWithCompany[]> {
  try {
    const tokens = await prisma.token.findMany({
      where: {
        isAvailable: true,
        company: { isActive: true },
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
      },
      orderBy: { pricePerUnit: 'asc' },
    });

    return tokens as TokenWithCompany[];
  } catch (error) {
    logger.error('Error getting available tokens:', error);
    throw error;
  }
}

/**
 * Get tokens by company
 */
export async function getTokensByCompany(companyId: string): Promise<TokenWithCompany[]> {
  try {
    const tokens = await prisma.token.findMany({
      where: {
        companyId,
        isAvailable: true,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
      },
    });

    return tokens as TokenWithCompany[];
  } catch (error) {
    logger.error('Error getting tokens by company:', error);
    throw error;
  }
}

/**
 * Get token by ID
 */
export async function getTokenById(tokenId: string): Promise<TokenWithCompany | null> {
  try {
    const token = await prisma.token.findUnique({
      where: { id: tokenId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
      },
    });

    return token as TokenWithCompany | null;
  } catch (error) {
    logger.error('Error getting token:', error);
    throw error;
  }
}

/**
 * Purchase tokens
 */
export async function purchaseTokens(
  userId: string,
  purchaseData: TokenPurchaseData
): Promise<any> {
  try {
    const { tokenId, quantity, amount } = purchaseData;

    // Get token details
    const token = await getTokenById(tokenId);
    if (!token) {
      throw ErrorTypes.NotFound('Token not found');
    }

    // Validate amount
    const expectedAmount = token.pricePerUnit * quantity;
    if (Math.abs(amount - expectedAmount) > 0.01) {
      throw ErrorTypes.BadRequest('Invalid purchase amount');
    }

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        type: 'PURCHASE',
        amount,
        status: 'PENDING',
        reference: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        metadata: {
          tokenId,
          quantity,
          pricePerUnit: token.pricePerUnit,
          companyId: token.companyId,
          description: `Purchase of ${quantity} kWh ${token.type} tokens from ${token.company.name}`,
        },
      },
    });

    logger.info(`Token purchase initiated: ${transaction.id} for user ${userId}`);

    return {
      transactionId: transaction.id,
      amount,
      token,
      quantity,
    };
  } catch (error) {
    logger.error('Error purchasing tokens:', error);
    throw error;
  }
}

/**
 * Complete token purchase after payment
 */
export async function completeTokenPurchase(transactionId: string): Promise<void> {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { user: true },
    });

    if (!transaction) {
      throw ErrorTypes.NotFound('Transaction not found');
    }

    if (transaction.status !== 'PENDING') {
      throw ErrorTypes.BadRequest('Transaction already processed');
    }

    const metadata = transaction.metadata as any;
    const { tokenId, quantity } = metadata;

    // Update transaction status
    await prisma.transaction.update({
      where: { id: transactionId },
      data: { status: 'SUCCESS' },
    });

    // Add tokens to user's wallet (represented as wallet balance increase)
    await updateWalletBalance(transaction.userId, quantity, 'add');

    logger.info(`Token purchase completed: ${transactionId}`);
  } catch (error) {
    logger.error('Error completing token purchase:', error);
    throw error;
  }
}

/**
 * Create new token (admin only)
 */
export async function createToken(data: {
  companyId: string;
  type: 'RENEWABLE' | 'NON_RENEWABLE';
  pricePerUnit: number;
  description?: string;
  isAvailable?: boolean;
}): Promise<TokenWithCompany> {
  try {
    const token = await prisma.token.create({
      data: {
        ...data,
        isAvailable: data.isAvailable ?? true,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
      },
    });

    logger.info(`Token created: ${token.id} for company ${data.companyId}`);
    return token as TokenWithCompany;
  } catch (error) {
    logger.error('Error creating token:', error);
    throw error;
  }
}

/**
 * Update token (admin only)
 */
export async function updateToken(
  tokenId: string,
  data: {
    pricePerUnit?: number;
    description?: string;
    isAvailable?: boolean;
  }
): Promise<TokenWithCompany> {
  try {
    const token = await prisma.token.update({
      where: { id: tokenId },
      data,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
      },
    });

    logger.info(`Token updated: ${tokenId}`);
    return token as TokenWithCompany;
  } catch (error) {
    logger.error('Error updating token:', error);
    throw error;
  }
}

/**
 * Get all tokens (admin only)
 */
export async function getAllTokens(page: number = 1, limit: number = 20) {
  try {
    const skip = (page - 1) * limit;

    const [tokens, total] = await Promise.all([
      prisma.token.findMany({
        skip,
        take: limit,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.token.count(),
    ]);

    return {
      tokens,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Error getting all tokens:', error);
    throw error;
  }
}
