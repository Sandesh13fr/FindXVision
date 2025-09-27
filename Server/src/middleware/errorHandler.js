import { Request, Response, NextFunction } from 'express';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'findxvision-api' },
  transports: [
    // Only log errors to file, no console output
    new winston.transports.File({
      filename: 'logs/error.log'
    })
  ],
});

export const errorHandler = (
  error,
  req,
  res,
  next)=> {
  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userId: req.user?._id,
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (error.name === 'ValidationError') {
    res.status(400).json({
      success,
      message: 'Validation error',
      errors: isDevelopment ? error.message : 'Invalid input data',
    });
    return;
  }

  if (error.name === 'CastError') {
    res.status(400).json({
      success,
      message: 'Invalid ID format',
    });
    return;
  }

  if (error.name === 'MongoError' && (error ).code === 11000) {
    res.status(409).json({
      success,
      message: 'Resource already exists',
    });
    return;
  }

  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      success,
      message: 'Invalid token',
    });
    return;
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      success,
      message: 'Token expired',
    });
    return;
  }

  // Default error response
  res.status(500).json({
    success,
    message: 'Internal server error',
    ...(isDevelopment && { 
      error: error.message,
      stack: error.stack 
    }),
  });
};
