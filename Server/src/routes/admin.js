import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { requireAdmin, requireLawEnforcement } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { Case } from '../models/Case.js';
import { AuditLog } from '../models/AuditLog.js';
import { Notification } from '../models/Notification.js';

const router = express.Router();

// Get system statistics
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalCases,
      openCases,
      resolvedCases,
      recentActivity
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Case.countDocuments(),
      Case.countDocuments({ status: 'OPEN' }),
      Case.countDocuments({ status: 'RESOLVED' }),
      AuditLog.find().sort({ timestamp: -1 }).limit(10).populate('userId', 'firstName lastName email')
    ]);

    const stats = {
      users: { total, active: activeUsers },
      cases: { total, open, resolved: resolvedCases },
      recentActivity,
    };

    res.json({ success, data: stats });
  } catch (error) {
    res.status(500).json({ success, message: (error ).message });
  }
});

// Get all users with pagination
router.get('/users', requireAdmin, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('role').optional().isIn(['GENERAL_USER', 'LAW_ENFORCEMENT', 'ADMINISTRATOR']),
  query('status').optional().isIn(['active', 'inactive']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    const page = parseInt(req.query.page ) || 1;
    const limit = Math.min(parseInt(req.query.limit ) || 20, 100);
    const skip = (page - 1) * limit;

    const query= {};
    if (req.query.role) query.role = req.query.role;
    if (req.query.status === 'active') query.isActive = true;
    if (req.query.status === 'inactive') query.isActive = false;

    const [users, total] = await Promise.all([
      User.find(query)
  .select('-password -resetPasswordToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query)
    ]);

    res.json({
      success,
      data: {
        users,
        pagination: { page, totalPages: Math.ceil(total / limit), total, limit },
      },
    });
  } catch (error) {
    res.status(500).json({ success, message: (error ).message });
  }
});

// Update user
router.put('/users/:id', requireAdmin, [
  body('role').optional().isIn(['GENERAL_USER', 'LAW_ENFORCEMENT', 'ADMINISTRATOR']),
  body('isActive').optional().isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    const allowedFields = ['role', 'isActive'];
    const updateData= {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
  ).select('-password -resetPasswordToken');

    if (!user) {
      return res.status(404).json({ success, message: 'User not found' });
    }

    res.json({ success, data: { user } });
  } catch (error) {
    res.status(500).json({ success, message: (error ).message });
  }
});

// Get audit logs
router.get('/audit-logs', requireAdmin, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('userId').optional().isMongoId(),
  query('resource').optional().isIn(['USER', 'CASE', 'NOTIFICATION', 'ADMIN', 'AUTH', 'SYSTEM']),
  query('action').optional().isString(),
], async (req, res) => {
  try {
    const page = parseInt(req.query.page ) || 1;
    const limit = Math.min(parseInt(req.query.limit ) || 50, 100);
    const skip = (page - 1) * limit;

    const query= {};
    if (req.query.userId) query.userId = req.query.userId;
    if (req.query.resource) query.resource = req.query.resource;
    if (req.query.action) query.action = { $regex: req.query.action, $options: 'i' };

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('userId', 'firstName lastName email')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit),
      AuditLog.countDocuments(query)
    ]);

    res.json({
      success,
      data: {
        logs,
        pagination: { page, totalPages: Math.ceil(total / limit), total, limit },
      },
    });
  } catch (error) {
    res.status(500).json({ success, message: (error ).message });
  }
});

export default router;
