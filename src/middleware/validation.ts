/**
 * @fileoverview API validation middleware for Next.js routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ValidationError, handleError } from '@/shared/lib/errors';
import { logger } from '@/shared/lib/logger';

// Validation middleware factory
export function withValidation<T extends z.ZodSchema>(
  schema: T,
  options: {
    location?: 'body' | 'query' | 'params';
    skipLogging?: boolean;
  } = {}
) {
  return async (request: NextRequest, context?: { params?: Record<string, string> }) => {
    try {
      const { location = 'body', skipLogging = false } = options;

      let data: unknown;

      switch (location) {
        case 'body':
          try {
            data = await request.json();
          } catch (error) {
            throw new ValidationError('Invalid JSON in request body');
          }
          break;

        case 'query':
          data = Object.fromEntries(request.nextUrl.searchParams.entries());
          break;

        case 'params':
          data = context?.params || {};
          break;

        default:
          throw new ValidationError(`Unsupported validation location: ${location}`);
      }

      // Validate the data
      const result = schema.safeParse(data);

      if (!result.success) {
        throw ValidationError.fromZodError(result.error);
      }

      // Log validation success if not skipped
      if (!skipLogging) {
        await logger.debug('Request validation successful', {
          location,
          endpoint: request.nextUrl.pathname,
          method: request.method,
        });
      }

      // Add validated data to request for use in route handlers
      (request as any).validatedData = result.data;

      return NextResponse.next();

    } catch (error) {
      const appError = handleError(error);

      // Log validation errors
      await logger.warn('Request validation failed', {
        error: appError.message,
        location: options.location,
        endpoint: request.nextUrl.pathname,
        method: request.method,
        statusCode: appError.statusCode,
      });

      return NextResponse.json(
        {
          success: false,
          error: appError.message,
          code: appError.code,
          details: appError.details,
        },
        { status: appError.statusCode }
      );
    }
  };
}

// Rate limiting middleware
export function withRateLimit(
  options: {
    windowMs?: number;
    maxRequests?: number;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
  } = {}
) {
  const {
    windowMs = 60 * 1000, // 1 minute
    maxRequests = 10,
    skipSuccessfulRequests = false,
    skipFailedRequests = true,
  } = options;

  // In-memory store for rate limiting (in production, use Redis or similar)
  const requests = new Map<string, { count: number; resetTime: number }>();

  return async (request: NextRequest) => {
    try {
      const clientId = getClientId(request);
      const now = Date.now();

      // Get or create request tracking for this client
      let clientRequests = requests.get(clientId);

      if (!clientRequests || now > clientRequests.resetTime) {
        clientRequests = {
          count: 0,
          resetTime: now + windowMs,
        };
        requests.set(clientId, clientRequests);
      }

      // Check if rate limit exceeded
      if (clientRequests.count >= maxRequests) {
        await logger.warn('Rate limit exceeded', {
          clientId,
          count: clientRequests.count,
          maxRequests,
          resetTime: clientRequests.resetTime,
        });

        return NextResponse.json(
          {
            success: false,
            error: 'Rate limit exceeded',
            code: 'RATE_LIMIT_EXCEEDED',
            details: {
              resetTime: clientRequests.resetTime,
              retryAfter: Math.ceil((clientRequests.resetTime - now) / 1000),
            },
          },
          {
            status: 429,
            headers: {
              'Retry-After': Math.ceil((clientRequests.resetTime - now) / 1000).toString(),
            },
          }
        );
      }

      // Increment request count
      clientRequests.count++;

      // Clean up old entries periodically
      if (requests.size > 1000) {
        cleanupOldEntries(requests, now);
      }

      return NextResponse.next();

    } catch (error) {
      const appError = handleError(error);

      await logger.error('Rate limiting error', appError, {
        endpoint: request.nextUrl.pathname,
        method: request.method,
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
        { status: 500 }
      );
    }
  };
}

// Authentication middleware
export function withAuth(
  options: {
    requireAuth?: boolean;
    roles?: string[];
    skipLogging?: boolean;
  } = {}
) {
  const {
    requireAuth = true,
    roles = [],
    skipLogging = false,
  } = options;

  return async (request: NextRequest) => {
    try {
      // In a real implementation, you would extract the user from a JWT token
      // or session. For now, we'll use a simplified approach.

      const authHeader = request.headers.get('authorization');
      const token = authHeader?.replace('Bearer ', '');

      if (requireAuth && !token) {
        return NextResponse.json(
          {
            success: false,
            error: 'Authentication required',
            code: 'AUTHENTICATION_REQUIRED',
          },
          { status: 401 }
        );
      }

      // TODO: Implement actual token verification and user extraction
      const user = token ? { id: 'user-id', role: 'viewer' } : null;

      if (requireAuth && !user) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid authentication token',
            code: 'INVALID_TOKEN',
          },
          { status: 401 }
        );
      }

      // Check role-based access
      if (roles.length > 0 && user && !roles.includes(user.role)) {
        await logger.warn('Access denied due to insufficient permissions', {
          userId: user.id,
          userRole: user.role,
          requiredRoles: roles,
          endpoint: request.nextUrl.pathname,
        });

        return NextResponse.json(
          {
            success: false,
            error: 'Insufficient permissions',
            code: 'INSUFFICIENT_PERMISSIONS',
          },
          { status: 403 }
        );
      }

      // Add user to request for use in route handlers
      (request as any).user = user;

      if (!skipLogging && user) {
        await logger.debug('Authentication successful', {
          userId: user.id,
          role: user.role,
          endpoint: request.nextUrl.pathname,
          method: request.method,
        });
      }

      return NextResponse.next();

    } catch (error) {
      const appError = handleError(error);

      await logger.error('Authentication middleware error', appError, {
        endpoint: request.nextUrl.pathname,
        method: request.method,
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Authentication error',
          code: 'AUTH_ERROR',
        },
        { status: 500 }
      );
    }
  };
}

// Error handling middleware
export function withErrorHandling() {
  return async (request: NextRequest, response: NextResponse) => {
    try {
      return response;
    } catch (error) {
      const appError = handleError(error);

      await logger.error('Unhandled error in API route', appError, {
        endpoint: request.nextUrl.pathname,
        method: request.method,
        url: request.url,
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
        { status: 500 }
      );
    }
  };
}

// Utility function to get client ID for rate limiting
function getClientId(request: NextRequest): string {
  // Try to get client ID from various sources
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const clientIP = forwardedFor?.split(',')[0] || realIP || 'unknown';

  // Use a combination of IP and User-Agent for better identification
  const userAgent = request.headers.get('user-agent') || 'unknown';

  return `${clientIP}:${userAgent.substring(0, 50)}`;
}

// Utility function to clean up old rate limit entries
function cleanupOldEntries(
  requests: Map<string, { count: number; resetTime: number }>,
  now: number
): void {
  for (const [key, value] of requests.entries()) {
    if (now > value.resetTime) {
      requests.delete(key);
    }
  }
}

// Combined middleware factory for common use cases
export function withApiProtection(
  options: {
    requireAuth?: boolean;
    roles?: string[];
    rateLimit?: {
      windowMs?: number;
      maxRequests?: number;
    };
    validateBody?: z.ZodSchema;
    validateQuery?: z.ZodSchema;
  } = {}
) {
  const middlewares = [];

  // Add rate limiting if specified
  if (options.rateLimit) {
    middlewares.push(withRateLimit(options.rateLimit));
  }

  // Add authentication if required
  if (options.requireAuth !== false) {
    middlewares.push(withAuth({
      requireAuth: options.requireAuth,
      roles: options.roles,
    }));
  }

  // Add body validation if schema provided
  if (options.validateBody) {
    middlewares.push(withValidation(options.validateBody, { location: 'body' }));
  }

  // Add query validation if schema provided
  if (options.validateQuery) {
    middlewares.push(withValidation(options.validateQuery, { location: 'query' }));
  }

  // Add error handling
  middlewares.push(withErrorHandling());

  return middlewares;
}