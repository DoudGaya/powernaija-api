import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';
import { ErrorTypes } from '../middleware/errorHandler';
import { DEFAULT_USAGE_LIMITS, CARBON_CREDIT_RATIO, CO2_REDUCTION_PER_KWH } from '../shared/constants';

/**
 * Usage Service - Handles energy usage tracking and limits
 */

/**
 * Log energy usage
 */
export async function logUsage(
  userId: string,
  tokenId: string,
  amount: number,
  metadata?: Record<string, any>
): Promise<any> {
  try {
    // Get token details to determine if renewable
    const token = await prisma.token.findUnique({
      where: { id: tokenId },
      include: { company: true },
    });

    if (!token) {
      throw ErrorTypes.NotFound('Token not found');
    }

    // Create usage log
    const usageLog = await prisma.usageLog.create({
      data: {
        userId,
        tokenId,
        amount,
        timestamp: new Date(),
        metadata: metadata || {},
      },
    });

    // If renewable, create carbon credit
    if (token.type === 'RENEWABLE') {
      const creditsEarned = Math.floor(amount / CARBON_CREDIT_RATIO);
      const co2Reduction = amount * CO2_REDUCTION_PER_KWH;

      if (creditsEarned > 0) {
        await prisma.carbonCredit.create({
          data: {
            userId,
            amount: creditsEarned,
            source: token.company.name,
            renewableKwh: amount,
            isSold: false,
          },
        });

        logger.info(`Carbon credits earned: ${creditsEarned} for user ${userId}`);
      }
    }

    // Check usage limits and send alerts if needed
    await checkUsageLimits(userId);

    logger.info(`Usage logged: ${amount} kWh for user ${userId}`);
    return usageLog;
  } catch (error) {
    logger.error('Error logging usage:', error);
    throw error;
  }
}

/**
 * Get user usage statistics
 */
export async function getUserUsageStats(
  userId: string,
  period: 'daily' | 'weekly' | 'monthly' | 'all' = 'monthly'
): Promise<any> {
  try {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'daily':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'weekly':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'monthly':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        startDate = new Date(0); // All time
    }

    const usageLogs = await prisma.usageLog.findMany({
      where: {
        userId,
        timestamp: {
          gte: startDate,
        },
      },
      include: {
        token: {
          include: {
            company: true,
          },
        },
      },
    });

    const totalUsage = usageLogs.reduce((sum, log) => sum + log.amount, 0);
    const renewableUsage = usageLogs
      .filter((log) => log.token.type === 'RENEWABLE')
      .reduce((sum, log) => sum + log.amount, 0);
    const nonRenewableUsage = totalUsage - renewableUsage;
    const carbonSaved = renewableUsage * CO2_REDUCTION_PER_KWH;

    return {
      totalUsage,
      renewableUsage,
      nonRenewableUsage,
      carbonSaved,
      period,
      logs: usageLogs,
    };
  } catch (error) {
    logger.error('Error getting usage stats:', error);
    throw error;
  }
}

/**
 * Set usage limits for a user
 */
export async function setUsageLimits(
  userId: string,
  limits: {
    dailyLimit?: number;
    weeklyLimit?: number;
    monthlyLimit?: number;
    alertThreshold?: number;
  }
): Promise<any> {
  try {
    const usageLimit = await prisma.usageLimit.upsert({
      where: { userId },
      update: limits,
      create: {
        userId,
        dailyLimit: limits.dailyLimit || DEFAULT_USAGE_LIMITS.DAILY,
        weeklyLimit: limits.weeklyLimit || DEFAULT_USAGE_LIMITS.WEEKLY,
        monthlyLimit: limits.monthlyLimit || DEFAULT_USAGE_LIMITS.MONTHLY,
        alertThreshold: limits.alertThreshold || DEFAULT_USAGE_LIMITS.ALERT_THRESHOLD,
      },
    });

    logger.info(`Usage limits set for user ${userId}`);
    return usageLimit;
  } catch (error) {
    logger.error('Error setting usage limits:', error);
    throw error;
  }
}

/**
 * Get user usage limits
 */
export async function getUserUsageLimits(userId: string): Promise<any> {
  try {
    let usageLimit = await prisma.usageLimit.findUnique({
      where: { userId },
    });

    // If no limits set, return defaults
    if (!usageLimit) {
      usageLimit = await prisma.usageLimit.create({
        data: {
          userId,
          dailyLimit: DEFAULT_USAGE_LIMITS.DAILY,
          weeklyLimit: DEFAULT_USAGE_LIMITS.WEEKLY,
          monthlyLimit: DEFAULT_USAGE_LIMITS.MONTHLY,
          alertThreshold: DEFAULT_USAGE_LIMITS.ALERT_THRESHOLD,
        },
      });
    }

    return usageLimit;
  } catch (error) {
    logger.error('Error getting usage limits:', error);
    throw error;
  }
}

/**
 * Check if user has exceeded usage limits and create notifications
 */
async function checkUsageLimits(userId: string): Promise<void> {
  try {
    const limits = await getUserUsageLimits(userId);
    const dailyStats = await getUserUsageStats(userId, 'daily');
    const weeklyStats = await getUserUsageStats(userId, 'weekly');
    const monthlyStats = await getUserUsageStats(userId, 'monthly');

    const alerts: string[] = [];

    // Check daily limit
    if (dailyStats.totalUsage >= limits.dailyLimit * limits.alertThreshold) {
      alerts.push('daily');
    }

    // Check weekly limit
    if (weeklyStats.totalUsage >= limits.weeklyLimit * limits.alertThreshold) {
      alerts.push('weekly');
    }

    // Check monthly limit
    if (monthlyStats.totalUsage >= limits.monthlyLimit * limits.alertThreshold) {
      alerts.push('monthly');
    }

    // Create notifications for alerts
    for (const period of alerts) {
      await prisma.notification.create({
        data: {
          userId,
          type: 'usage_alert',
          title: `${period.charAt(0).toUpperCase() + period.slice(1)} Usage Alert`,
          body: `You have used ${
            period === 'daily' ? dailyStats.totalUsage : period === 'weekly' ? weeklyStats.totalUsage : monthlyStats.totalUsage
          } kWh this ${period}, approaching your ${period} limit.`,
          isRead: false,
        },
      });
    }
  } catch (error) {
    logger.error('Error checking usage limits:', error);
    // Don't throw error, just log it
  }
}

/**
 * Get all usage logs (admin only)
 */
export async function getAllUsageLogs(page: number = 1, limit: number = 20) {
  try {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.usageLog.findMany({
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
          token: {
            include: {
              company: true,
            },
          },
        },
        orderBy: { timestamp: 'desc' },
      }),
      prisma.usageLog.count(),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Error getting all usage logs:', error);
    throw error;
  }
}
