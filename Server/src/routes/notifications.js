import express from 'express';
import { body, validationResult } from 'express-validator';
import { requireAnyRole } from '../middleware/auth.js';
import { whatsappService } from '../services/whatsappService.js';
import { sendEmail } from '../services/emailService';
import { Notification } from '../models/Notification';

const router = express.Router();

// Send WhatsApp notification
router.post('/whatsapp', requireAnyRole, [
  body('phoneNumber').isMobilePhone('any').withMessage('Valid phone number is required'),
  body('message').trim().isLength({ min: 1 }).withMessage('Message is required'),
  body('caseId').optional().isMongoId(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    const { phoneNumber, message, caseId } = req.body;

    // Create notification record
    const notification = new Notification({
      userId: req.user._id,
      caseId,
      type: 'CASE_UPDATE',
      channel: 'WHATSAPP',
      title: 'WhatsApp Notification',
      message,
      metadata: {
        whatsapp: {
          phoneNumber,
        },
      },
    });

    const success = await whatsappService.sendMessage({ to, message });

    if (success) {
      notification.status = 'SENT';
      notification.sentAt = new Date();
    } else {
      notification.status = 'FAILED';
      notification.errorMessage = 'Failed to send WhatsApp message';
    }

    await notification.save();

    res.json({
      success,
      message: success ? 'WhatsApp message sent successfully' : 'Failed to send WhatsApp message',
      data: { notificationId: notification._id },
    });
  } catch (error) {
    res.status(500).json({ success, message: (error ).message });
  }
});

// Send email notification
router.post('/email', requireAnyRole, [
  body('to').isEmail().withMessage('Valid email is required'),
  body('subject').trim().isLength({ min: 1 }).withMessage('Subject is required'),
  body('message').trim().isLength({ min: 1 }).withMessage('Message is required'),
  body('caseId').optional().isMongoId(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    const { to, subject, message, caseId } = req.body;

    // Create notification record
    const notification = new Notification({
      userId: req.user._id,
      caseId,
      type: 'CASE_UPDATE',
      channel: 'EMAIL',
      title,
      message,
      metadata: {
        email: {
          subject,
          template: 'case-update',
        },
      },
    });

    try {
      await sendEmail({
        to,
        subject,
        template: 'case-update',
        data: {
          firstName: 'User',
          message,
          caseUrl: caseId ? `${process.env.FRONTEND_URL}/cases/${caseId}` : '',
        },
      });

      notification.status = 'SENT';
      notification.sentAt = new Date();
    } catch (emailError) {
      notification.status = 'FAILED';
      notification.errorMessage = (emailError ).message;
    }

    await notification.save();

    res.json({
      success: notification.status === 'SENT',
      message: notification.status === 'SENT' ? 'Email sent successfully' : 'Failed to send email',
      data: { notificationId: notification._id },
    });
  } catch (error) {
    res.status(500).json({ success, message: (error ).message });
  }
});

// Get user notifications
router.get('/', requireAnyRole, async (req, res) => {
  try {
    const page = parseInt(req.query.page ) || 1;
    const limit = Math.min(parseInt(req.query.limit ) || 20, 100);
    const skip = (page - 1) * limit;

    const query = { userId: req.user._id };

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .populate('caseId', 'caseNumber missingPerson.firstName missingPerson.lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(query),
    ]);

    res.json({
      success,
      data: {
        notifications,
        pagination: {
          page,
          totalPages: Math.ceil(total / limit),
          total,
          limit,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success, message: (error ).message });
  }
});

// Mark notification as read
router.put('/:id/read', requireAnyRole, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status: 'READ', readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success, message: 'Notification not found' });
    }

    res.json({
      success,
      message: 'Notification marked ',
      data: { notification },
    });
  } catch (error) {
    res.status(500).json({ success, message: (error ).message });
  }
});

// WhatsApp webhook verification and message handling
router.get('/whatsapp/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const result = whatsappService.verifyWebhook(mode , token , challenge );
  
  if (result) {
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Forbidden');
  }
});

router.post('/whatsapp/webhook', async (req, res) => {
  try {
    await whatsappService.handleWebhookEvent(req.body);
    res.status(200).send('OK');
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
