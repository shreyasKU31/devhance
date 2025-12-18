/**
 * Custom Error Classes and API Error Handler
 * Provides structured error handling for production.
 */

export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, field = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.field = field;
  }
}

export class AuthError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'AUTH_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.resource = resource;
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT');
  }
}

export class ExternalServiceError extends AppError {
  constructor(service, originalError = null) {
    super(`${service} service error`, 502, 'EXTERNAL_SERVICE_ERROR');
    this.service = service;
    this.originalError = originalError;
  }
}

/**
 * Handles errors and returns a consistent API response.
 * @param {Error} error - The error to handle
 * @returns {{ message: string, status: number, code: string }}
 */
export function handleApiError(error) {
  // Log all errors in production for debugging
  if (process.env.NODE_ENV === 'production') {
    console.error(`[ERROR] ${new Date().toISOString()}`, {
      message: error.message,
      code: error.code || 'UNKNOWN',
      stack: error.stack,
    });
  } else {
    console.error('[DEV ERROR]', error);
  }

  // Operational errors (expected)
  if (error instanceof AppError) {
    return {
      message: error.message,
      status: error.statusCode,
      code: error.code,
    };
  }

  // Prisma errors
  if (error.code === 'P2002') {
    return {
      message: 'A record with this value already exists',
      status: 409,
      code: 'DUPLICATE_ENTRY',
    };
  }

  if (error.code === 'P2025') {
    return {
      message: 'Record not found',
      status: 404,
      code: 'NOT_FOUND',
    };
  }

  // Generic fallback
  return {
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : error.message,
    status: 500,
    code: 'INTERNAL_ERROR',
  };
}

/**
 * Wraps an API handler with error handling.
 * @param {Function} handler - The API route handler
 * @returns {Function} - Wrapped handler
 */
export function withErrorHandler(handler) {
  return async (req, ...args) => {
    try {
      return await handler(req, ...args);
    } catch (error) {
      const { message, status, code } = handleApiError(error);
      return Response.json({ error: message, code }, { status });
    }
  };
}
