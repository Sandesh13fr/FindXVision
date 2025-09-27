import express from 'express';
import { logger, LoggerService } from '../utils/logger.js';

// Extract types from express
const { Request, Response, NextFunction } = express;

// Custom error classes
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.isOperational = true;
    this.code = 'VALIDATION_ERROR';
  }
}

export class AuthenticationError extends Error {
  constructor(message = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;
    this.isOperational = true;
    this.code = 'AUTHENTICATION_ERROR';
  }
}

export class AuthorizationError extends Error {
  constructor(message = 'Access denied') {
    super(message);
    this.name = 'AuthorizationError';
    this.statusCode = 403;
    this.isOperational = true;
    this.code = 'AUTHORIZATION_ERROR';
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
    this.isOperational = true;
    this.code = 'NOT_FOUND_ERROR';
  }
}

export class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
    this.isOperational = true;
    this.code = 'CONFLICT_ERROR';
  }
}

export class DatabaseError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DatabaseError';
    this.statusCode = 500;
    this.isOperational = false;
    this.code = 'DATABASE_ERROR';
  }
}

export class ExternalServiceError extends Error {
  constructor(message, service) {
    super(message);
    this.name = 'ExternalServiceError';
    this.statusCode = 502;
    this.isOperational = true;
    this.code = 'EXTERNAL_SERVICE_ERROR';
  }
}

export class RateLimitError extends Error {
  constructor(message = 'Too many requests') {
    super(message);
    this.name = 'RateLimitError';
    this.statusCode = 429;
    this.isOperational = true;
    this.code = 'RATE_LIMIT_ERROR';
  }
}

// Error reporting service
export class ErrorReportingService {
  static async reportError(error, context) {
    try {
      // Log to our internal logger
      LoggerService.logError(error, context);

      // Send to external error tracking service (e.g., Sentry)
      if (process.env.SENTRY_DSN) {
        // In production, you would integrate with Sentry here
        // Sentry.captureException(error, { extra: context });
      }

      // For critical errors, send alerts
      if (this.isCriticalError(error)) {
        await this.sendCriticalErrorAlert(error, context);
      }

      // Update error metrics
      this.updateErrorMetrics(error);
    } catch (reportingError) {
      logger.error('Failed to report error:', reportingError);
    }
  }

  static isCriticalError(error) {
    const criticalErrors = [
      'DatabaseError',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'OutOfMemoryError'
    ];

    return criticalErrors.some(criticalError => 
      error.name === criticalError || 
      error.message.includes(criticalError)
    );
  }

  static async sendCriticalErrorAlert(error, context) {
    // In production, integrate with alerting systems like PagerDuty, Slack, etc.
    logger.error('CRITICAL ERROR ALERT', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context,
      timestamp: new Date().toISOString(),
      severity: 'CRITICAL'
    });
  }

  static updateErrorMetrics(error) {
    // Update Prometheus metrics if available
    try {
      // This would increment error counters
      // errorCounter.labels(error.name).inc();
    } catch (metricsError) {
      logger.error('Failed to update error metrics:', metricsError);
    }
  }
}

// Global error handler middleware
export const globalErrorHandler = (
  error,
  req,
  res,
  next) => {
  // Set default error properties
  error.statusCode = error.statusCode || 500;
  error.isOperational = error.isOperational ?? false;

  // Log the error with context
  const errorContext = {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    body: req.body,
    params: req.params,
    query: req.query,
    headers: req.headers
  };

  // Report the error
  ErrorReportingService.reportError(error, errorContext);

  // Handle different environments
  if (process.env.NODE_ENV === 'production') {
    sendProductionError(error, res);
  } else {
    sendDevelopmentError(error, res);
  }
};

// Development error response
const sendDevelopmentError = (error, res) => {
  res.status(error.statusCode || 500).json({
    status: 'error',
    error: {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack,
      isOperational: error.isOperational
    },
    timestamp: new Date().toISOString()
  });
};

// Production error response
const sendProductionError = (error, res) => {
  // Only send operational errors to client
  if (error.isOperational) {
    res.status(error.statusCode || 500).json({
      status: 'error',
      error: {
        message: error.message,
        code: error.code
      },
      timestamp: new Date().toISOString()
    });
  } else {
    // Send generic error message for programming errors
    res.status(500).json({
      status: 'error',
      error: {
        message: 'Something went wrong!',
        code: 'INTERNAL_SERVER_ERROR'
      },
      timestamp: new Date().toISOString()
    });
  }
};

// Async error wrapper
export const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler
export const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.originalUrl} not found`);
  next(error);
};

// Validation error formatter
export const formatValidationError = (errors) => {
  return errors.map(error => {
    if (error.path) {
      return `${error.path}: ${error.message}`;
    }
    return error.message;
  }).join(', ');
};

// MongoDB error handler
export const handleMongoError = (error) => {
  if (error.code === 11000) {
    // Duplicate key error
    try {
      const keys = Object.keys(error.keyValue || {});
      if (keys.length > 0 && error.keyValue) {
        const field = keys[0];
        const keyValue = error.keyValue;
        const value = keyValue[field] || 'unknown';
        return new ConflictError(`${field} '${value}' already exists`);
      }
    } catch {
      // Fallback if keyValue parsing fails
    }
    return new ConflictError('Duplicate key error');
  }

  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map((err) => err.message);
    return new ValidationError(errors.join(', '));
  }

  if (error.name === 'CastError') {
    return new ValidationError(`Invalid ${error.path}: ${error.value}`);
  }

  return new DatabaseError(error.message);
};

// JWT error handler
export const handleJWTError = (error) => {
  if (error.name === 'JsonWebTokenError') {
    return new AuthenticationError('Invalid token');
  }

  if (error.name === 'TokenExpiredError') {
    return new AuthenticationError('Token expired');
  }

  return new AuthenticationError('Authentication failed');
};

export default {
  globalErrorHandler,
  notFoundHandler,
  catchAsync,
  ErrorReportingService,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  ExternalServiceError,
  RateLimitError
};