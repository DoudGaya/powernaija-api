import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { logger } from '../utils/logger';

export interface ApiError {
  message: string;
  statusCode: number;
  code?: string;
  errors?: Record<string, string[]>;
}

/**
 * Global error handler for API routes
 */
export function handleError(error: unknown): NextResponse {
  logger.error('API Error:', error);

  // Zod validation errors
  if (error instanceof ZodError) {
    const formattedErrors: Record<string, string[]> = {};
    error.errors.forEach((err) => {
      const path = err.path.join('.');
      if (!formattedErrors[path]) {
        formattedErrors[path] = [];
      }
      formattedErrors[path].push(err.message);
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed',
        errors: formattedErrors,
      },
      { status: 400 }
    );
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error);
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid data provided',
      },
      { status: 400 }
    );
  }

  // Custom API errors
  if (isApiError(error)) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        errors: error.errors,
      },
      { status: error.statusCode }
    );
  }

  // Generic errors
  if (error instanceof Error) {
    // Don't expose internal error messages in production
    const message =
      process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : error.message;

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }

  // Unknown error type
  return NextResponse.json(
    {
      success: false,
      error: 'An unexpected error occurred',
    },
    { status: 500 }
  );
}

/**
 * Handle Prisma-specific errors
 */
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): NextResponse {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const field = (error.meta?.target as string[])?.join(', ') || 'field';
      return NextResponse.json(
        {
          success: false,
          error: `A record with this ${field} already exists`,
          code: 'UNIQUE_CONSTRAINT_VIOLATION',
        },
        { status: 409 }
      );

    case 'P2025':
      // Record not found
      return NextResponse.json(
        {
          success: false,
          error: 'Record not found',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      );

    case 'P2003':
      // Foreign key constraint violation
      return NextResponse.json(
        {
          success: false,
          error: 'Related record not found',
          code: 'FOREIGN_KEY_VIOLATION',
        },
        { status: 400 }
      );

    case 'P2014':
      // Required relation violation
      return NextResponse.json(
        {
          success: false,
          error: 'Required relationship is missing',
          code: 'REQUIRED_RELATION_VIOLATION',
        },
        { status: 400 }
      );

    default:
      return NextResponse.json(
        {
          success: false,
          error: 'Database error occurred',
          code: error.code,
        },
        { status: 500 }
      );
  }
}

/**
 * Type guard for ApiError
 */
function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'statusCode' in error
  );
}

/**
 * Create custom API error
 */
export function createError(
  message: string,
  statusCode: number = 500,
  code?: string,
  errors?: Record<string, string[]>
): ApiError {
  return {
    message,
    statusCode,
    code,
    errors,
  };
}

/**
 * Common error creators
 */
export const ErrorTypes = {
  BadRequest: (message: string = 'Bad request') =>
    createError(message, 400, 'BAD_REQUEST'),

  Unauthorized: (message: string = 'Unauthorized') =>
    createError(message, 401, 'UNAUTHORIZED'),

  Forbidden: (message: string = 'Forbidden') =>
    createError(message, 403, 'FORBIDDEN'),

  NotFound: (message: string = 'Resource not found') =>
    createError(message, 404, 'NOT_FOUND'),

  Conflict: (message: string = 'Resource already exists') =>
    createError(message, 409, 'CONFLICT'),

  ValidationError: (errors: Record<string, string[]>) =>
    createError('Validation failed', 422, 'VALIDATION_ERROR', errors),

  InternalError: (message: string = 'Internal server error') =>
    createError(message, 500, 'INTERNAL_ERROR'),

  ServiceUnavailable: (message: string = 'Service unavailable') =>
    createError(message, 503, 'SERVICE_UNAVAILABLE'),
};

/**
 * Async error wrapper for API route handlers
 */
export function asyncHandler<T>(
  handler: (request: Request, context?: any) => Promise<T>
) {
  return async (request: Request, context?: any): Promise<NextResponse> => {
    try {
      const result = await handler(request, context);
      
      // If handler returns NextResponse, return it directly
      if (result instanceof NextResponse) {
        return result;
      }
      
      // Otherwise wrap in NextResponse
      return NextResponse.json(result);
    } catch (error) {
      return handleError(error);
    }
  };
}
