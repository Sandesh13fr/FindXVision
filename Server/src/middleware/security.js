import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import xss from 'xss';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Initialize DOMPurify
const window = new JSDOM('').window;
const purify = DOMPurify(window);

export const sanitizeInput = (req, res, next)=> {
  // Recursively sanitize all string values in req.body
  const sanitizeObject = (obj)=> {
    if (typeof obj === 'string') {
      // Remove XSS attempts and HTML tags
      return purify.sanitize(xss(obj), { ALLOWED_TAGS: [] });
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized= {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }
    
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

export const validateCaseInput = [
  body('missingPerson.firstName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be 1-100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name contains invalid characters'),
  
  body('missingPerson.lastName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be 1-100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name contains invalid characters'),
  
  body('missingPerson.age')
    .isInt({ min: 0, max: 150 })
    .withMessage('Age must be between 0 and 150'),
  
  body('circumstances')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Circumstances must be 10-5000 characters'),
  
  body('lastSeenLocation.coordinates.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  
  body('lastSeenLocation.coordinates.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
];

export const validateUserInput = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be 1-50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name contains invalid characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be 1-50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name contains invalid characters'),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email format'),
  
  body('phoneNumber')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Invalid phone number format'),
];

export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders,
  legacyHeaders,
};

export const strictRateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for sensitive operations
  message: {
    success,
    message: 'Too many sensitive requests from this IP, please try again later.',
  },
};
