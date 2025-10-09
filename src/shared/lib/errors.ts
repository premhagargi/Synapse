/**
 * @fileoverview Custom error classes and error handling utilities
 */

import { ZodError } from 'zod';

// Base application error class
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, any>;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

// Authentication errors
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', details?: Record<string, any>) {
    super(message, 'AUTHENTICATION_ERROR', 401, details);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied', details?: Record<string, any>) {
    super(message, 'AUTHORIZATION_ERROR', 403, details);
    this.name = 'AuthorizationError';
  }
}

// Validation errors
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }

  static fromZodError(zodError: ZodError): ValidationError {
    const message = 'Validation failed';
    const details = {
      errors: zodError.errors.map(error => ({
        field: error.path.join('.'),
        message: error.message,
        code: error.code,
      })),
    };

    return new ValidationError(message, details);
  }
}

// Document errors
export class DocumentNotFoundError extends AppError {
  constructor(documentId: string) {
    super(`Document with ID ${documentId} not found`, 'DOCUMENT_NOT_FOUND', 404, { documentId });
    this.name = 'DocumentNotFoundError';
  }
}

export class DocumentUploadError extends AppError {
  constructor(message: string = 'Failed to upload document', details?: Record<string, any>) {
    super(message, 'DOCUMENT_UPLOAD_ERROR', 400, details);
    this.name = 'DocumentUploadError';
  }
}

export class DocumentProcessingError extends AppError {
  constructor(message: string = 'Failed to process document', details?: Record<string, any>) {
    super(message, 'DOCUMENT_PROCESSING_ERROR', 500, details);
    this.name = 'DocumentProcessingError';
  }
}

// AI analysis errors
export class AIAnalysisError extends AppError {
  constructor(message: string = 'AI analysis failed', details?: Record<string, any>) {
    super(message, 'AI_ANALYSIS_ERROR', 500, details);
    this.name = 'AIAnalysisError';
  }
}

export class AIRateLimitError extends AppError {
  constructor(message: string = 'AI rate limit exceeded', details?: Record<string, any>) {
    super(message, 'AI_RATE_LIMIT_ERROR', 429, details);
    this.name = 'AIRateLimitError';
  }
}

// Subscription errors
export class SubscriptionError extends AppError {
  constructor(message: string = 'Subscription error', details?: Record<string, any>) {
    super(message, 'SUBSCRIPTION_ERROR', 402, details);
    this.name = 'SubscriptionError';
  }
}

export class PaymentError extends AppError {
  constructor(message: string = 'Payment failed', details?: Record<string, any>) {
    super(message, 'PAYMENT_ERROR', 402, details);
    this.name = 'PaymentError';
  }
}

// Rate limiting errors
export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', details?: Record<string, any>) {
    super(message, 'RATE_LIMIT_ERROR', 429, details);
    this.name = 'RateLimitError';
  }
}

// Firebase errors
export class FirebaseError extends AppError {
  constructor(message: string, firebaseCode?: string, details?: Record<string, any>) {
    super(message, 'FIREBASE_ERROR', 500, { ...details, firebaseCode });
    this.name = 'FirebaseError';
  }
}

// Error handling utilities
export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof ZodError) {
    return ValidationError.fromZodError(error);
  }

  if (error instanceof Error) {
    return new AppError(error.message, 'UNKNOWN_ERROR', 500, { originalError: error.name });
  }

  return new AppError('An unknown error occurred', 'UNKNOWN_ERROR', 500);
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred';
}

export function getErrorStatusCode(error: unknown): number {
  if (error instanceof AppError) {
    return error.statusCode;
  }

  return 500;
}

// Error logging utility
export function logError(error: unknown, context?: Record<string, any>): void {
  const errorObj = handleError(error);

  console.error('Error occurred:', {
    name: errorObj.name,
    message: errorObj.message,
    code: errorObj.code,
    statusCode: errorObj.statusCode,
    details: errorObj.details,
    context,
    stack: errorObj.stack,
  });
}