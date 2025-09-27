import express from 'express';
import multer from 'multer';
import path from 'path';
import { requireAnyRole } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || './uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(',');
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

// Upload multiple images for cases
router.post('/case-images', requireAnyRole, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({ success, message: 'No files uploaded' });
    }

    const files = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`,
    }));

    res.json({
      success,
      message: 'Files uploaded successfully',
      data: { files },
    });
  } catch (error) {
    res.status(500).json({ success, message: (error ).message });
  }
});

// Upload profile image
router.post('/profile-image', requireAnyRole, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success, message: 'No file uploaded' });
    }

    const file = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`,
    };

    res.json({
      success,
      message: 'Profile image uploaded successfully',
      data: { file },
    });
  } catch (error) {
    res.status(500).json({ success, message: (error ).message });
  }
});

export default router;
