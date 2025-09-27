import express from 'express';
import { body, validationResult } from 'express-validator';
import { requireAnyRole } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { UserService } from '../services/userService.js';

const router = express.Router();

// Get current user profile
router.get('/profile', requireAnyRole, async (req, res) => {
  try {
    const user = await UserService.getUserProfile(req.user._id.toString());
    res.json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update user profile
router.put('/profile', requireAnyRole, [
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('phoneNumber').optional().isMobilePhone('any'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const user = await UserService.updateUserProfile(req.user._id.toString(), req.body);
    res.json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user statistics
router.get('/stats', requireAnyRole, async (req, res) => {
  try {
    const stats = await UserService.getUserStats(req.user._id.toString());
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user cases
router.get('/cases', requireAnyRole, async (req, res) => {
  try {
    const cases = await UserService.getUserCases(req.user._id.toString(), req.query);
    res.json({ success: true, data: { cases } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
