import winston from 'winston';
import { AuditLog } from '../models/AuditLog.js';

const logger = winston.createLogger({
  level: 'error', // Only log errors
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'findxvision-api' },
  transports: [
    // Only file logging, no console output
    new winston.transports.File({
      filename: 'logs/requests.log'
    })
  ],
});

export const requestLogger = (req, res, next)=> {
  const start = Date.now();
  
  // Log request
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    userId: req.user?._id,
  });

  // Override res.json to capture response
  const originalJson = res.json;
  res.json = function(obj) {
    const duration = Date.now() - start;
    
    // Log response
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?._id,
    });

    // Create audit log for sensitive operations
    if (shouldAudit(req)) {
      AuditLog.create({
        userId: req.user?._id,
        action: getActionFromRequest(req),
        resource: getResourceFromRequest(req),
        details: {
          method: req.method,
          endpoint: req.path,
          userAgent: req.get('User-Agent'),
          ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
          metadata: {
            statusCode: res.statusCode,
            duration,
            queryParams: req.query,
            pathParams: req.params,
          },
        },
        success: res.statusCode < 400,
        errorMessage: res.statusCode >= 400 ? (obj && obj.message) : undefined,
      }).catch((error) => {
        logger.error('Failed to create audit log', error);
      });
    }

    return originalJson.call(this, obj);
  };

  next();
};

const shouldAudit = (req)=> {
  const auditPaths = [
    '/api/auth/',
    '/api/admin/',
    '/api/cases/',
    '/api/users/',
  ];

  const sensitiveActions = ['POST', 'PUT', 'DELETE'];
  
  return auditPaths.some(path => req.path.startsWith(path)) || 
         sensitiveActions.includes(req.method);
};

const getActionFromRequest = (req)=> {
  const method = req.method;
  const path = req.path;

  if (path.includes('/auth/login')) return 'LOGIN';
  if (path.includes('/auth/logout')) return 'LOGOUT';
  if (path.includes('/auth/register')) return 'REGISTER';
  if (path.includes('/auth/password')) return 'PASSWORD_RESET';
  
  if (path.includes('/cases/')) {
    if (method === 'POST') return 'CREATE_CASE';
    if (method === 'PUT') return 'UPDATE_CASE';
    if (method === 'DELETE') return 'DELETE_CASE';
    if (method === 'GET') return 'VIEW_CASE';
  }

  if (path.includes('/users/')) {
    if (method === 'POST') return 'CREATE_USER';
    if (method === 'PUT') return 'UPDATE_USER';
    if (method === 'DELETE') return 'DELETE_USER';
    if (method === 'GET') return 'VIEW_USER';
  }

  if (path.includes('/admin/')) {
    return `ADMIN_${method}`;
  }

  return `${method}_${path.replace(/\//g, '_').toUpperCase()}`;
};

const getResourceFromRequest = (req) => {
  const path = req.path;

  if (path.includes('/auth/')) return 'AUTH';
  if (path.includes('/cases/')) return 'CASE';
  if (path.includes('/users/')) return 'USER';
  if (path.includes('/admin/')) return 'ADMIN';
  if (path.includes('/notifications/')) return 'NOTIFICATION';

  return 'SYSTEM';
};
