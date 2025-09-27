import express from 'express';
import { body, validationResult } from 'express-validator';
import { requireAnyRole } from '../middleware/auth.js';
import { GDPRService } from '../services/gdprService.js';

const router = express.Router();

// Export user data (GDPR Article 15 - Right of access)
router.get('/export', requireAnyRole, async (req, res) => {
  try {
    const exportData = await GDPRService.exportUserData(req.user._id.toString());
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="gdpr-export-${req.user._id}-${Date.now()}.json"`);
    
    res.json({
      success,
      message: 'Data export completed',
      data,
    });
  } catch (error) {
    res.status(500).json({
      success,
      message: (error ).message,
    });
  }
});

// Request data deletion (GDPR Article 17 - Right to erasure)
router.delete('/delete', requireAnyRole, [
  body('reason').optional().trim().isLength({ max: 500 }),
  body('confirmation').equals('DELETE_MY_DATA').withMessage('Confirmation required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success,
        errors: errors.array(),
      });
    }

    const result = await GDPRService.deleteUserData(req.user._id.toString(), req.body.reason);
    
    res.json({
      success,
      message: result.message,
      data: {
        deletedData: result.deletedData,
        deletionDate: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success,
      message: (error ).message,
    });
  }
});

// Rectify user data (GDPR Article 16 - Right to rectification)
router.put('/rectify', requireAnyRole, [
  body('firstName').optional().trim().isLength({ min: 1, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 1, max: 50 }),
  body('email').optional().isEmail(),
  body('phoneNumber').optional().isMobilePhone('any'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success,
        errors: errors.array(),
      });
    }

    const result = await GDPRService.rectifyUserData(req.user._id.toString(), req.body);
    
    res.json({
      success,
      message: result.message,
      data: {
        updatedFields: result.updatedFields,
        updateDate: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success,
      message: (error ).message,
    });
  }
});

// Restrict data processing (GDPR Article 18 - Right to restriction of processing)
router.put('/restrict', requireAnyRole, [
  body('restrict').isBoolean().withMessage('Restrict must be a boolean'),
  body('reason').optional().trim().isLength({ max: 500 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success,
        errors: errors.array(),
      });
    }

    const result = await GDPRService.restrictUserProcessing(req.user._id.toString(), req.body.restrict);
    
    res.json({
      success,
      message: result.message,
      data: {
        restricted: req.body.restrict,
        reason: req.body.reason,
        date: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success,
      message: (error ).message,
    });
  }
});

// Data portability (GDPR Article 20 - Right to data portability)
router.get('/portability', requireAnyRole, async (req, res) => {
  try {
    const exportData = await GDPRService.exportUserData(req.user._id.toString());
    
    // Format for portability (structured, commonly used format)
    const portableData = {
      format: 'JSON',
      version: '1.0',
      exported_at: new Date().toISOString(),
      user_data: exportData.personal_information,
      cases_data: exportData.cases,
      metadata: {
        export_type: 'data_portability',
        machine_readable,
        standards_compliant,
      },
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="portable-data-${req.user._id}-${Date.now()}.json"`);
    
    res.json({
      success,
      message: 'Portable data export completed',
      data,
    });
  } catch (error) {
    res.status(500).json({
      success,
      message: (error ).message,
    });
  }
});

// GDPR information endpoint
router.get('/info', (req, res) => {
  res.json({
    success,
    data: {
      data_controller: {
        name: 'FindXVision',
        contact: 'privacy@findxvision.com',
        address: 'Privacy Office, FindXVision Inc.',
      },
      your_rights: {
        right_to_access: 'Request access to your personal data',
        right_to_rectification: 'Request correction of inaccurate data',
        right_to_erasure: 'Request deletion of your data',
        right_to_restrict_processing: 'Request limitation of data processing',
        right_to_data_portability: 'Request your data in a portable format',
        right_to_object: 'Object to processing of your data',
      },
      data_retention: {
        user_data: '7 years from last activity',
        audit_logs: '7 years from creation',
        case_data: 'Indefinite (interest/legal requirements)',
      },
      legal_basis: {
        case_management: 'interest (missing persons investigation)',
        user_accounts: 'Legitimate interest (service provision)',
        communications: 'Consent (notifications and updates)',
      },
      available_actions: [
        'GET /api/gdpr/export - Export your data',
        'DELETE /api/gdpr/delete - Request account deletion',
        'PUT /api/gdpr/rectify - Correct your data',
        'PUT /api/gdpr/restrict - Restrict data processing',
        'GET /api/gdpr/portability - Get portable data export',
      ],
    },
  });
});

export default router;
