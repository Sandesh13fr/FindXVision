import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Simple logger configuration
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // File transport for errors only
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error'
    }),
    // Console transport for all levels
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Security logger
export const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'security.log')
    })
  ]
});

// Logger utilities
export class LoggerService {
  static logError(error, context) {
    logger.error({
      message: error.message,
      stack: error.stack,
      context
    });
  }

  static logSecurity(event, details) {
    securityLogger.info({
      event,
      details
    });
  }

  static logAPIRequest(req, res, duration) {
    logger.info({
      type: 'API_REQUEST',
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
  }

  static logCaseOperation(operation, resource, userId, details) {
    logger.info({
      type: 'CASE_OPERATION',
      operation,
      resource,
      userId,
      details
    });
  }
}

export default logger;
