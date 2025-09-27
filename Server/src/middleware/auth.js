import jwt from 'jsonwebtoken';
import express from 'express';
import { User } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';

// Extract types from express
const { Request, Response, NextFunction } = express;

export const generateTokens = (user) => {
  const payload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  const secret = process.env.JWT_SECRET || 'fallback-secret';
  const refreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
  
  const accessToken = jwt.sign(
    payload,
    secret,
    { expiresIn: process.env.JWT_EXPIRE || '15m' }
  );

  const refreshToken = jwt.sign(
    payload,
    refreshSecret,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );

  return { accessToken, refreshToken };
};

export const verifyToken = (token, isRefreshToken = false) => {
  const secret = isRefreshToken 
    ? process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret'
    : process.env.JWT_SECRET || 'fallback-secret';
    
  return jwt.verify(token, secret);
};

export const authenticateToken = async (
  req,
  res,
  next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token required',
      });
      return;
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Account is deactivated',
      });
      return;
    }

    if (user.isLocked) {
      res.status(401).json({
        success: false,
        message: 'Account is temporarily locked',
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Authentication error',
    });
  }
};

// Optional authentication - for routes that can work with or without auth
export const optionalAuth = async (
  req,
  res,
  next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive && !user.isLocked) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Ignore auth errors for optional auth
    next();
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      // Log unauthorized access attempt
      AuditLog.create({
        userId: req.user._id,
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        resource: 'AUTH',
        details: {
          method: req.method,
          endpoint: req.path,
          userAgent: req.get('User-Agent'),
          ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
          metadata: {
            requiredRoles: roles,
            userRole: req.user.role,
          },
        },
        success: true,
        errorMessage: 'Insufficient permissions',
      }).catch(console.error);

      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
};

export const requireAdmin = requireRole(['ADMINISTRATOR']);
export const requireLawEnforcement = requireRole(['ADMINISTRATOR']);
export const requireAnyRole = requireRole(['GENERAL_USER', 'ADMINISTRATOR']);