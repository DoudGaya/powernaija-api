import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';
import { ErrorTypes } from '../middleware/errorHandler';
import { CARBON_CREDIT_PRICE, CO2_REDUCTION_PER_KWH } from '../shared/constants';
import { updateWalletBalance } from './userService';

/**
 * Carbon Credit Service - Handles carbon credit operations
 */

/**
 * Get user's carbon credits
 */
export async function getUserCarbonCredits(
  userId: string,
  includeUsed: boolean = false
): Promise<any[]> {
  try {
    const carbonCredits = await prisma.carbonCredit.findMany({
      where: {
        userId,
        ...(includeUsed ? {} : { isSold: false }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return carbonCredits;
  } catch (error) {
    logger.error('Error getting carbon credits:', error);
    throw error;
  }
}

/**
 * Calculate carbon credits from renewable usage
 */
export async function calculateCarbonCredits(
  renewableKwh: number
): Promise<{
  creditsEarned: number;
  co2Reduction: number;
  equivalentTrees: number;
}> {
  const CARBON_CREDIT_RATIO = 10; // 1 credit per 10 kWh
  const TREES_PER_CREDIT = 0.5; // Approximate tree planting equivalent

  const creditsEarned = Math.floor(renewableKwh / CARBON_CREDIT_RATIO);
  const co2Reduction = renewableKwh * CO2_REDUCTION_PER_KWH;
  const equivalentTrees = creditsEarned * TREES_PER_CREDIT;

  return {
    creditsEarned,
    co2Reduction,
    equivalentTrees,
  };
}

/**
 * Monetize carbon credits
 */
export async function monetizeCarbonCredits(
  userId: string,
  creditIds: string[],
  action: 'sell_to_cash' | 'convert_to_tokens'
): Promise<any> {
  try {
    // Verify all credits belong to user and are not sold
    const credits = await prisma.carbonCredit.findMany({
      where: {
        id: { in: creditIds },
        userId,
        isSold: false,
      },
    });

    if (credits.length !== creditIds.length) {
      throw ErrorTypes.BadRequest('Some carbon credits are invalid or already sold');
    }

    const totalCredits = credits.reduce((sum, credit) => sum + credit.amount, 0);
    const totalAmount = totalCredits * CARBON_CREDIT_PRICE;

    if (action === 'sell_to_cash') {
      // Mark credits as sold
      await prisma.carbonCredit.updateMany({
        where: {
          id: { in: creditIds },
        },
        data: {
          isSold: true,
          soldAt: new Date(),
          soldPrice: CARBON_CREDIT_PRICE,
        },
      });

      // Add cash to wallet
      await prisma.wallet.update({
        where: { userId },
        data: {
          cashBalance: {
            increment: totalAmount,
          },
        },
      });

      // Create transaction record
      await prisma.transaction.create({
        data: {
          userId,
          type: 'CARBON_CREDIT_SALE',
          status: 'SUCCESS',
          amount: totalAmount,
          reference: `CARBON-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          metadata: {
            creditIds,
            totalCredits,
            pricePerCredit: CARBON_CREDIT_PRICE,
            action,
          },
        },
      });

      logger.info(`Carbon credits sold: ${totalCredits} credits for ₦${totalAmount} by user ${userId}`);

      return {
        success: true,
        creditsMonetized: totalCredits,
        amount: totalAmount,
        action: 'sold_to_cash',
      };
    } else if (action === 'convert_to_tokens') {
      // Mark credits as sold
      await prisma.carbonCredit.updateMany({
        where: {
          id: { in: creditIds },
        },
        data: {
          isSold: true,
          soldAt: new Date(),
          soldPrice: CARBON_CREDIT_PRICE,
        },
      });

      // Convert to tokens (kWh balance)
      // Assuming ₦75 per kWh for converted tokens
      const tokenKwh = totalAmount / 75;
      await prisma.wallet.update({
        where: { userId },
        data: {
          balance: {
            increment: tokenKwh,
          },
        },
      });

      // Create transaction record
      await prisma.transaction.create({
        data: {
          userId,
          type: 'CARBON_CREDIT_SALE',
          status: 'SUCCESS',
          amount: totalAmount,
          quantity: tokenKwh,
          reference: `CARBON-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          metadata: {
            creditIds,
            totalCredits,
            pricePerCredit: CARBON_CREDIT_PRICE,
            action,
          },
        },
      });

      logger.info(`Carbon credits converted: ${totalCredits} credits to ${tokenKwh} kWh by user ${userId}`);

      return {
        success: true,
        creditsMonetized: totalCredits,
        tokensReceived: tokenKwh,
        action: 'converted_to_tokens',
      };
    }

    throw ErrorTypes.BadRequest('Invalid action specified');
  } catch (error) {
    logger.error('Error monetizing carbon credits:', error);
    throw error;
  }
}

/**
 * Get carbon credit statistics
 */
export async function getCarbonCreditStats(userId: string): Promise<any> {
  try {
    const [totalCredits, soldCredits, availableCredits] = await Promise.all([
      prisma.carbonCredit.aggregate({
        where: { userId },
        _sum: { amount: true },
      }),
      prisma.carbonCredit.aggregate({
        where: { userId, isSold: true },
        _sum: { amount: true, soldPrice: true },
      }),
      prisma.carbonCredit.aggregate({
        where: { userId, isSold: false },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalCreditsEarned: totalCredits._sum.amount || 0,
      creditsSold: soldCredits._sum.amount || 0,
      creditsAvailable: availableCredits._sum.amount || 0,
      totalEarnings: soldCredits._sum.soldPrice || 0,
    };
  } catch (error) {
    logger.error('Error getting carbon credit stats:', error);
    throw error;
  }
}

/**
 * Get all carbon credits (admin only)
 */
export async function getAllCarbonCredits(page: number = 1, limit: number = 20) {
  try {
    const skip = (page - 1) * limit;

    const [credits, total] = await Promise.all([
      prisma.carbonCredit.findMany({
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.carbonCredit.count(),
    ]);

    return {
      credits,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Error getting all carbon credits:', error);
    throw error;
  }
}
