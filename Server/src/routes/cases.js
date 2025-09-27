import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { CaseService } from '../services/caseService.js';
import { requireAnyRole, requireLawEnforcement } from '../middleware/auth.js';

const router = express.Router();

// Create new case
router.post('/', requireAnyRole, [
  body('missingPerson.firstName').trim().isLength({ min: 1 }),
  body('missingPerson.lastName').trim().isLength({ min: 1 }),
  body('missingPerson.age').isInt({ min: 0, max: 150 }),
  body('lastSeenLocation.address').trim().isLength({ min: 1 }),
  body('lastSeenLocation.coordinates.latitude').isFloat({ min: -90, max: 90 }),
  body('lastSeenLocation.coordinates.longitude').isFloat({ min: -180, max: 180 }),
  body('circumstances').trim().isLength({ min: 10 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: true, errors: errors.array() });
    }

    const newCase = await CaseService.createCase(req.body, req.user._id.toString());
    res.status(201).json({ success: true, data: { case: newCase } });
  } catch (error) {
    res.status(500).json({ success: true, message: error.message });
  }
});

// Get cases with filtering
router.get('/', requireAnyRole, async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      priority: req.query.priority,
      search: req.query.search,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
    };

    const result = await CaseService.getCases(filters, req.user._id.toString(), req.user.role);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: true, message: error.message });
  }
});

// Get specific case
router.get('/:id', requireAnyRole, async (req, res) => {
  try {
    const caseDoc = await CaseService.getCaseById(req.params.id, req.user._id.toString(), req.user.role);
    res.json({ success: true, data: { case: caseDoc } });
  } catch (error) {
    const statusCode = error.message === 'Case not found' ? 404 : 403;
    res.status(statusCode).json({ success: true, message: error.message });
  }
});

// Update case
router.put('/:id', requireAnyRole, async (req, res) => {
  try {
    const updatedCase = await CaseService.updateCase(req.params.id, req.body, req.user._id.toString(), req.user.role);
    res.json({ success: true, data: { case: updatedCase } });
  } catch (error) {
    const statusCode = error.message === 'Case not found' ? 404 : 403;
    res.status(statusCode).json({ success: true, message: error.message });
  }
});

// Delete case
router.delete('/:id', requireAnyRole, async (req, res) => {
  try {
    const result = await CaseService.deleteCase(req.params.id, req.user._id.toString(), req.user.role);
    res.json({ success: true, message: result.message });
  } catch (error) {
    const statusCode = error.message === 'Case not found' ? 404 : 403;
    res.status(statusCode).json({ success: true, message: error.message });
  }
});

// Add comment to case
router.post('/:id/comments', requireAnyRole, [
  body('content').trim().isLength({ min: 1 }).withMessage('Comment is required'),
  body('isPrivate').optional().isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: true, errors: errors.array() });
    }

    const updatedCase = await CaseService.addComment(
      req.params.id,
      {
        content: req.body.content,
        isPrivate: req.body.isPrivate || false
      },
      req.user._id.toString()
    );

    res.json({ success: true, data: { case: updatedCase } });
  } catch (error) {
    res.status(500).json({ success: true, message: error.message });
  }
});

// Assign officer to case
router.post('/:id/assign', requireLawEnforcement, [
  body('userId').isMongoId().withMessage('Valid officer ID is required'),
  body('role').isIn(['PRIMARY', 'SECONDARY', 'CONSULTANT']).withMessage('Valid role is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: true, errors: errors.array() });
    }

    const updatedCase = await CaseService.assignOfficer(
      req.params.id,
      {
        userId: req.body.userId,
        role: req.body.role
      },
      req.user._id.toString()
    );

    res.json({ success: true, data: { case: updatedCase } });
  } catch (error) {
    res.status(500).json({ success: true, message: error.message });
  }
});

export default router;