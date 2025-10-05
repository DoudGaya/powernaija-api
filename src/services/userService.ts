import { prisma } from '../lib/prisma';
import { hashPassword, comparePassword, generateAccessToken, generateRefreshToken } from '../utils/encryption';
import { logger } from '../utils/logger';
import { ErrorTypes } from '../middleware/errorHandler';
import type { RegisterData, AuthTokens, UserWithWallet } from '../types';

/**
 * User Service - Handles user management operations
 */

/**
 * Create a new user
 */
export async function createUser(data: RegisterData): Promise<UserWithWallet> {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw ErrorTypes.Conflict('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user with wallet
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        language: data.language || 'en',
        wallet: {
          create: {
            balance: 0,
            cashBalance: 0,
          },
        },
      },
      include: {
        wallet: true,
      },
    });

    logger.info(`User created: ${user.email}`);
    return user as UserWithWallet;
  } catch (error) {
    logger.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Authenticate user and generate tokens
 */
export async function authenticateUser(email: string, password: string): Promise<{ user: UserWithWallet; tokens: AuthTokens }> {
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { wallet: true },
    });

    if (!user) {
      throw ErrorTypes.Unauthorized('Invalid email or password');
    }

    if (!user.password) {
      throw ErrorTypes.Unauthorized('Please use social login for this account');
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      throw ErrorTypes.Unauthorized('Invalid email or password');
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
    });

    logger.info(`User authenticated: ${user.email}`);

    return {
      user: user as UserWithWallet,
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 900, // 15 minutes in seconds
      },
    };
  } catch (error) {
    logger.error('Error authenticating user:', error);
    throw error;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<UserWithWallet | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true },
    });

    return user as UserWithWallet | null;
  } catch (error) {
    logger.error('Error getting user:', error);
    throw error;
  }
}

/**
 * Get user by Firebase UID
 */
export async function getUserByFirebaseUid(firebaseUid: string): Promise<UserWithWallet | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      include: { wallet: true },
    });

    return user as UserWithWallet | null;
  } catch (error) {
    logger.error('Error getting user by Firebase UID:', error);
    throw error;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    language?: string;
    profileImage?: string;
  }
): Promise<UserWithWallet> {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      include: { wallet: true },
    });

    logger.info(`User profile updated: ${user.email}`);
    return user as UserWithWallet;
  } catch (error) {
    logger.error('Error updating user profile:', error);
    throw error;
  }
}

/**
 * Link Firebase UID to existing user
 */
export async function linkFirebaseAccount(userId: string, firebaseUid: string): Promise<UserWithWallet> {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { firebaseUid },
      include: { wallet: true },
    });

    logger.info(`Firebase account linked for user: ${user.email}`);
    return user as UserWithWallet;
  } catch (error) {
    logger.error('Error linking Firebase account:', error);
    throw error;
  }
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers(page: number = 1, limit: number = 20) {
  try {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        include: { wallet: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Error getting all users:', error);
    throw error;
  }
}

/**
 * Get user wallet balance
 */
export async function getUserWalletBalance(userId: string): Promise<number> {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    return wallet?.balance || 0;
  } catch (error) {
    logger.error('Error getting wallet balance:', error);
    throw error;
  }
}

/**
 * Update user wallet balance
 */
export async function updateWalletBalance(
  userId: string,
  amount: number,
  operation: 'add' | 'subtract'
): Promise<void> {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw ErrorTypes.NotFound('Wallet not found');
    }

    const newBalance = operation === 'add' ? wallet.balance + amount : wallet.balance - amount;

    if (newBalance < 0) {
      throw ErrorTypes.BadRequest('Insufficient wallet balance');
    }

    await prisma.wallet.update({
      where: { userId },
      data: {
        balance: newBalance,
        ...(operation === 'add' && { totalEarned: { increment: amount } }),
        ...(operation === 'subtract' && { totalSpent: { increment: amount } }),
      },
    });

    logger.info(`Wallet balance updated for user ${userId}: ${operation} ${amount}`);
  } catch (error) {
    logger.error('Error updating wallet balance:', error);
    throw error;
  }
}
