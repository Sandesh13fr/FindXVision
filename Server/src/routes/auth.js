import express from 'express';
import { body, validationResult } from 'express-validator';
import { AuthService } from '../services/authService.js';
import { AuditLog } from '../models/AuditLog.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const normalizeRoleInput = (role) => {
  if (!role) return undefined;
  const normalized = role.toString().trim().toUpperCase();
  if (['ADMINISTRATOR', 'GENERAL_USER', 'LAW_ENFORCEMENT'].includes(normalized)) {
    return normalized;
  }

  if (normalized === 'ADMIN') return 'ADMINISTRATOR';
  if (normalized === 'USER' || normalized === 'GENERAL') return 'GENERAL_USER';

  return undefined;
};

const validationErrorResponse = (res, errors) => {
  return res.status(400).json({
    success: false,
    message: 'Validation error',
    errors: errors.array(),
  });
};

const auditLogPayload = (req, overrides = {}) => ({
  details: {
    method: req.method,
    endpoint: req.path,
    userAgent: req.get('User-Agent'),
    ipAddress: req.ip || req.connection?.remoteAddress || 'unknown',
    metadata: overrides.metadata,
  },
  ...overrides,
});

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
    body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
    body('role').optional().custom((value) => {
      const mapped = normalizeRoleInput(value);
      if (!mapped) {
        throw new Error('Role must be either ADMIN or USER');
      }
      return true;
    }),
    body('phoneNumber').optional().isMobilePhone('any'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return validationErrorResponse(res, errors);
    }

    try {
      const payload = { ...req.body };
      if (payload.role) {
        payload.role = normalizeRoleInput(payload.role);
      }

      const result = await AuthService.register(payload);

      await AuditLog.create({
        userId: result.user._id,
        action: 'REGISTER',
        resource: 'AUTH',
        success: true,
        ...auditLogPayload(req, {
          metadata: { email: result.user.email, role: result.user.role },
        }),
      });

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      await AuditLog.create({
        action: 'REGISTER_FAILED',
        resource: 'AUTH',
        success: false,
        ...auditLogPayload(req, {
          metadata: { email: req.body.email },
        }),
        errorMessage: error.message,
      }).catch(() => {});

      if (error.message === 'User already exists with this email') {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Registration failed',
      });
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return validationErrorResponse(res, errors);
    }

    try {
      const result = await AuthService.login(req.body);

      await AuditLog.create({
        userId: result.user._id,
        action: 'LOGIN',
        resource: 'AUTH',
        success: true,
        ...auditLogPayload(req),
      });

      return res.json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      await AuditLog.create({
        action: 'LOGIN_FAILED',
        resource: 'AUTH',
        success: false,
        ...auditLogPayload(req, {
          metadata: { email: req.body.email },
        }),
        errorMessage: error.message,
      }).catch(() => {});

      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }
);

router.post(
  '/forgot-password',
  [body('email').isEmail().normalizeEmail().withMessage('Valid email is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return validationErrorResponse(res, errors);
    }

    try {
      const result = await AuthService.requestPasswordReset(req.body.email);
      return res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to process password reset request',
      });
    }
  }
);

router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return validationErrorResponse(res, errors);
    }

    try {
      const result = await AuthService.resetPassword(req.body.token, req.body.password);
      return res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

router.post(
  '/refresh',
  [body('refreshToken').notEmpty().withMessage('Refresh token is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return validationErrorResponse(res, errors);
    }

    try {
      const tokens = await AuthService.refreshToken(req.body.refreshToken);
      return res.json({
        success: true,
        message: 'Tokens refreshed successfully',
        data: { tokens },
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }
);

router.post('/logout', authenticateToken, async (req, res) => {
  try {
    await AuthService.logout(req.user?._id?.toString());
  } catch (error) {
    // Ignore backend logout errors
  }

  return res.json({
    success: true,
    message: 'Logout successful',
  });
});

export default router;
