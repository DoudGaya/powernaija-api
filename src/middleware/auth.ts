import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '../utils/encryption';
import { verifyFirebaseToken } from '../lib/firebase-admin';
import { logger } from '../utils/logger';
import { prisma } from '../lib/prisma';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

/**
 * Middleware to authenticate JWT tokens
 */
export async function authenticateToken(request: NextRequest): Promise<NextResponse | null> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization header missing or invalid' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Try JWT verification first
    const jwtPayload = verifyAccessToken(token);
    if (jwtPayload) {
      // Attach user info to request
      (request as AuthenticatedRequest).user = jwtPayload;
      return null; // Continue to next middleware/handler
    }

    // Try Firebase token verification
    try {
      const firebaseUser = await verifyFirebaseToken(token);
      if (firebaseUser) {
        // Find user in database
        const user = await prisma.user.findUnique({
          where: { firebaseUid: firebaseUser.uid },
          select: { id: true, email: true, role: true },
        });

        if (!user) {
          return NextResponse.json(
            { success: false, error: 'User not found' },
            { status: 404 }
          );
        }

        // Attach user info to request
        (request as AuthenticatedRequest).user = {
          userId: user.id,
          email: user.email,
          role: user.role,
        };
        return null; // Continue
      }
    } catch (firebaseError) {
      logger.error('Firebase token verification failed:', firebaseError);
    }

    // Both verification methods failed
    return NextResponse.json(
      { success: false, error: 'Invalid or expired token' },
      { status: 401 }
    );
  } catch (error) {
    logger.error('Authentication error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 401 }
    );
  }
}

/**
 * Middleware to check if user has required role
 */
export function requireRole(allowedRoles: string[]) {
  return async (request: AuthenticatedRequest): Promise<NextResponse | null> => {
    const user = request.user;

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }

    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return null; // User has required role, continue
  };
}

/**
 * Middleware to require ADMIN role
 */
export const requireAdmin = (request: AuthenticatedRequest) => {
  return requireRole(['ADMIN'])(request);
};

/**
 * Middleware to require ADMIN or COMPANY_REP role
 */
export const requireAdminOrCompanyRep = (request: AuthenticatedRequest) => {
  return requireRole(['ADMIN', 'COMPANY_REP'])(request);
};

/**
 * Helper to get current user from request
 */
export function getCurrentUser(request: NextRequest) {
  return (request as AuthenticatedRequest).user;
}
