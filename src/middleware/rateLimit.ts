import { NextRequest, NextResponse } from 'next/server';
import { cache } from '../lib/redis';
import { logger } from '../utils/logger';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum number of requests in the window
  message?: string;
}

/**
 * Rate limiting middleware using Redis
 */
export function rateLimit(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests, please try again later.',
  } = config;

  return async (request: NextRequest): Promise<NextResponse | null> => {
    try {
      // Get identifier (IP address or user ID)
      const identifier = getIdentifier(request);
      const key = `rate-limit:${identifier}:${request.nextUrl.pathname}`;

      // Get current count from Redis
      const currentCount = await cache.get<number>(key);

      if (currentCount !== null && currentCount >= maxRequests) {
        logger.warn(`Rate limit exceeded for ${identifier} on ${request.nextUrl.pathname}`);
        
        return NextResponse.json(
          {
            success: false,
            error: message,
            retryAfter: Math.ceil(windowMs / 1000),
          },
          {
            status: 429,
            headers: {
              'Retry-After': Math.ceil(windowMs / 1000).toString(),
              'X-RateLimit-Limit': maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': new Date(Date.now() + windowMs).toISOString(),
            },
          }
        );
      }

      // Increment counter
      const newCount = (currentCount || 0) + 1;
      await cache.set(key, newCount, Math.ceil(windowMs / 1000));

      // Add rate limit headers to response
      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', (maxRequests - newCount).toString());
      response.headers.set('X-RateLimit-Reset', new Date(Date.now() + windowMs).toISOString());

      return null; // Continue to next middleware/handler
    } catch (error) {
      logger.error('Rate limiting error:', error);
      // On error, allow the request to proceed (fail open)
      return null;
    }
  };
}

/**
 * Get unique identifier for rate limiting
 */
function getIdentifier(request: NextRequest): string {
  // Try to get user ID from request (if authenticated)
  const user = (request as any).user;
  if (user?.userId) {
    return `user:${user.userId}`;
  }

  // Fall back to IP address
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0] || realIp || 'unknown';
  
  return `ip:${ip}`;
}

/**
 * Predefined rate limiters for common use cases
 */

// General API rate limiter (100 requests per 15 minutes)
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  maxRequests: 100,
});

// Auth endpoints rate limiter (5 attempts per 15 minutes)
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  message: 'Too many authentication attempts, please try again later.',
});

// Payment endpoints rate limiter (10 requests per minute)
export const paymentRateLimit = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: 10,
  message: 'Too many payment requests, please try again later.',
});

// Chat endpoints rate limiter (30 messages per minute)
export const chatRateLimit = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: 30,
  message: 'Too many chat messages, please slow down.',
});
