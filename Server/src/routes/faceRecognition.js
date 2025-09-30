import express from 'express';
import multer from 'multer';
import { faceRecognitionService } from '../services/faceRecognitionService.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

router.get('/status', authenticateToken, requireRole(['ADMINISTRATOR']), async (req, res, next) => {
  try {
    const status = await faceRecognitionService.ping();
    res.json({ success: true, status });
  } catch (error) {
    next(error);
  }
});

router.get('/detections', authenticateToken, requireRole(['ADMINISTRATOR']), async (req, res, next) => {
  try {
    const payload = await faceRecognitionService.listDetections(req.query);
    res.json({ success: true, ...payload });
  } catch (error) {
    next(error);
  }
});

router.post('/image', authenticateToken, requireRole(['ADMINISTRATOR']), upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'File is required' });
      return;
    }

    const { lat, lon, accuracy } = req.body;
    const captureTime = req.body.captureTime;

    const result = await faceRecognitionService.processImage(req.file, {
      captureTime,
      location: (lat && lon) ? { lat: Number(lat), lon: Number(lon), accuracy: accuracy ? Number(accuracy) : undefined } : undefined,
      metadata: { uploadedBy: req.user._id },
      notifyTo: req.user?.phoneNumber,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/video', authenticateToken, requireRole(['ADMINISTRATOR']), upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'File is required' });
      return;
    }

    const result = await faceRecognitionService.processVideo(req.file, {
      metadata: { uploadedBy: req.user._id },
      notifyTo: req.user?.phoneNumber,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/frame', authenticateToken, requireRole(['ADMINISTRATOR']), async (req, res, next) => {
  try {
  const { frame, lat, lon, accuracy, timestamp, thumbnail, frameNumber } = req.body;
    if (!frame) {
      res.status(400).json({ success: false, message: 'Frame data required' });
      return;
    }

    const result = await faceRecognitionService.processFrame({
  frame,
      thumbnail,
  frameNumber,
      captureTime: timestamp,
      location: (lat && lon) ? { lat: Number(lat), lon: Number(lon), accuracy: accuracy ? Number(accuracy) : undefined } : undefined,
      metadata: { capturedBy: req.user._id },
      notifyTo: req.user?.phoneNumber,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
