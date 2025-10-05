import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';
import { ErrorTypes } from '../middleware/errorHandler';

/**
 * Company Service - Handles company management operations
 */

/**
 * Get all active companies
 */
export async function getActiveCompanies(): Promise<any[]> {
  try {
    const companies = await prisma.company.findMany({
      where: { isActive: true },
      include: {
        tokens: {
          where: { isAvailable: true },
        },
        _count: {
          select: {
            tokens: true,
            transactions: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return companies;
  } catch (error) {
    logger.error('Error getting active companies:', error);
    throw error;
  }
}

/**
 * Get company by ID
 */
export async function getCompanyById(companyId: string): Promise<any | null> {
  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        tokens: true,
        _count: {
          select: {
            tokens: true,
            transactions: true,
          },
        },
      },
    });

    return company;
  } catch (error) {
    logger.error('Error getting company:', error);
    throw error;
  }
}

/**
 * Get company by slug
 */
export async function getCompanyBySlug(slug: string): Promise<any | null> {
  try {
    const company = await prisma.company.findUnique({
      where: { slug },
      include: {
        tokens: {
          where: { isAvailable: true },
        },
      },
    });

    return company;
  } catch (error) {
    logger.error('Error getting company by slug:', error);
    throw error;
  }
}

/**
 * Create new company (admin only)
 */
export async function createCompany(data: {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  supportEmail?: string;
  supportPhone?: string;
  isActive?: boolean;
}): Promise<any> {
  try {
    const company = await prisma.company.create({
      data: {
        ...data,
        isActive: data.isActive ?? true,
      },
    });

    logger.info(`Company created: ${company.name}`);
    return company;
  } catch (error) {
    logger.error('Error creating company:', error);
    throw error;
  }
}

/**
 * Update company (admin only)
 */
export async function updateCompany(
  companyId: string,
  data: {
    name?: string;
    slug?: string;
    description?: string;
    logo?: string;
    supportEmail?: string;
    supportPhone?: string;
    isActive?: boolean;
  }
): Promise<any> {
  try {
    const company = await prisma.company.update({
      where: { id: companyId },
      data,
    });

    logger.info(`Company updated: ${company.name}`);
    return company;
  } catch (error) {
    logger.error('Error updating company:', error);
    throw error;
  }
}

/**
 * Delete company (admin only)
 */
export async function deleteCompany(companyId: string): Promise<void> {
  try {
    // Check if company has active tokens or transactions
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        _count: {
          select: {
            tokens: true,
            transactions: true,
          },
        },
      },
    });

    if (!company) {
      throw ErrorTypes.NotFound('Company not found');
    }

    if (company._count.transactions > 0) {
      throw ErrorTypes.BadRequest('Cannot delete company with existing transactions. Deactivate instead.');
    }

    // Delete company (will cascade delete tokens)
    await prisma.company.delete({
      where: { id: companyId },
    });

    logger.info(`Company deleted: ${company.name}`);
  } catch (error) {
    logger.error('Error deleting company:', error);
    throw error;
  }
}

/**
 * Get all companies (admin only)
 */
export async function getAllCompanies(page: number = 1, limit: number = 20) {
  try {
    const skip = (page - 1) * limit;

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              tokens: true,
              transactions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.company.count(),
    ]);

    return {
      companies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Error getting all companies:', error);
    throw error;
  }
}

/**
 * Get company statistics
 */
export async function getCompanyStats(companyId: string): Promise<any> {
  try {
    const [tokenStats, transactionStats] = await Promise.all([
      prisma.token.aggregate({
        where: { companyId },
        _count: true,
        _sum: {
          pricePerUnit: true,
        },
      }),
      prisma.transaction.aggregate({
        where: { companyId, status: 'SUCCESS' },
        _count: true,
        _sum: {
          amount: true,
          quantity: true,
        },
      }),
    ]);

    return {
      totalTokens: tokenStats._count,
      totalRevenue: transactionStats._sum.amount || 0,
      totalSales: transactionStats._count,
      totalKwhSold: transactionStats._sum.quantity || 0,
    };
  } catch (error) {
    logger.error('Error getting company stats:', error);
    throw error;
  }
}
