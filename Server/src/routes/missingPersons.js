import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { body, validationResult } from 'express-validator';
import MissingPerson from '../models/MissingPerson.js';
import { authenticateToken as authMiddleware, optionalAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const originalName = file.originalname;
    const ext = path.extname(originalName);
    const { name, adhaarNumber } = req.body;
    cb(null, `${name}_${adhaarNumber}_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
}).single('image');

// Validation middleware
const validateMissingPerson = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().withMessage('Must be a valid email'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  body('adhaarNumber').isLength({ min: 12, max: 12 }).isNumeric().withMessage('Adhaar number must be 12 digits'),
  body('dateMissing').isISO8601().withMessage('Invalid date format'),
  body('address').trim().isLength({ min: 5 }).withMessage('Address must be at least 5 characters'),
  body('phoneNumber').optional().isLength({ min: 10, max: 10 }).isNumeric().withMessage('Phone number must be 10 digits'),
  body('height').optional().isNumeric().withMessage('Height must be a number'),
  body('lastSeenNotes').optional().isString().isLength({ min: 3 }).withMessage('Last seen notes must be at least 3 characters'),
  body('lastSeenAt').optional().isISO8601().withMessage('Last seen timestamp must be valid'),
];

// ROUTE 1: Add missing person
router.post('/addperson', upload, authMiddleware, validateMissingPerson, async (req, res)=> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlink(req.file.path, () => {});
      }
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const cleanupUploadedFile = () => {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlink(req.file.path, () => {});
      }
    };

    const {
      name,
      email,
      gender,
      identification,
      nationality,
      height,
      dateMissing,
      address,
      adhaarNumber,
      phoneNumber,
      lastSeenNotes,
      lastSeenAt,
      age,
    } = req.body;

    let parsedLastSeenLocation = null;
    if (req.body.lastSeenLocation) {
      try {
        const location = typeof req.body.lastSeenLocation === 'string'
          ? JSON.parse(req.body.lastSeenLocation)
          : req.body.lastSeenLocation;

        if (
          location &&
          typeof location.latitude === 'number' &&
          typeof location.longitude === 'number'
        ) {
          parsedLastSeenLocation = {
            latitude: location.latitude,
            longitude: location.longitude,
            address: location.address || address,
          };
        } else {
          cleanupUploadedFile();
          return res.status(400).json({
            success: false,
            message: 'Invalid last seen location coordinates',
          });
        }
      } catch (parseError) {
        cleanupUploadedFile();
        return res.status(400).json({
          success: false,
          message: 'Failed to parse last seen location data',
        });
      }
    }

    if (!parsedLastSeenLocation) {
      cleanupUploadedFile();
      return res.status(400).json({
        success: false,
        message: 'Last seen location is required',
      });
    }

    // Check if person already exists
    const existingPerson = await MissingPerson.findOne({ adhaarNumber });
    if (existingPerson) {
      cleanupUploadedFile();
      return res.status(409).json({
        success: false,
        message: 'Person with this Adhaar number already exists'
      });
    }

    let imageData = {};
    if (req.file) {
      imageData = {
        data: fs.readFileSync(req.file.path),
        contentType: req.file.mimetype
      };
      // Clean up uploaded file
      cleanupUploadedFile();
    }

    const newPerson = new MissingPerson({
      name,
      email,
      gender,
      identification,
      nationality,
      height: height ? parseFloat(height) : undefined,
      dateMissing: new Date(dateMissing),
      address,
      adhaarNumber,
  phoneNumber: phoneNumber ? phoneNumber.toString() : undefined,
      image: Object.keys(imageData).length > 0 ? imageData : undefined,
      reportedBy: req.user._id,
      age: age ? parseInt(age, 10) : undefined,
      lastSeenNotes,
      lastSeenAt: lastSeenAt ? new Date(lastSeenAt) : new Date(dateMissing),
      lastSeenLocation: parsedLastSeenLocation,
      approvalStatus: 'pending',
      status: 'active',
    });

    const savedPerson = await newPerson.save();

    res.status(201).json({
      success: true,
      message: 'Missing person registered successfully',
      data: savedPerson
    });

  } catch (error) {
    console.error('Error adding missing person:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, () => {});
    }
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Person with this Adhaar number already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error occurred while registering missing person'
    });
  }
});

// ROUTE 2: Record a new sighting for an approved missing person
router.post(
  '/:id/sightings',
  authMiddleware,
  [
    body('location.latitude').isFloat({ min: -90, max: 90 }).withMessage('Latitude is required'),
    body('location.longitude').isFloat({ min: -180, max: 180 }).withMessage('Longitude is required'),
    body('location.address').optional().isString().isLength({ min: 3 }).withMessage('Address must be descriptive'),
    body('notes').optional().isString().isLength({ min: 3, max: 500 }).withMessage('Notes must be between 3 and 500 characters'),
    body('observedAt').optional().isISO8601().withMessage('observedAt must be a valid ISO date'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const { location, notes, observedAt } = req.body;

      const person = await MissingPerson.findById(id)
        .populate('reportedBy', 'firstName lastName email')
        .populate('sightings.reportedBy', 'firstName lastName email');

      if (!person) {
        return res.status(404).json({
          success: false,
          message: 'Missing person not found',
        });
      }

      if (person.approvalStatus !== 'approved') {
        return res.status(400).json({
          success: false,
          message: 'Sightings can only be recorded for approved reports',
        });
      }

      const locationPayload = {
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
        address: location.address,
      };

      const sighting = {
        reportedBy: req.user._id,
        notes,
        location: locationPayload,
        createdAt: observedAt ? new Date(observedAt) : new Date(),
      };

      person.sightings.push(sighting);
      person.lastSeenLocation = locationPayload;
      person.lastSeenAt = observedAt ? new Date(observedAt) : new Date();
      if (notes) {
        person.lastSeenNotes = notes;
      }

      await person.save();
      await person.populate('sightings.reportedBy', 'firstName lastName email');

      const recordedSighting = person.sightings[person.sightings.length - 1];

      res.status(201).json({
        success: true,
        message: 'Sighting recorded successfully',
        data: {
          sighting: recordedSighting,
          person,
        },
      });
    } catch (error) {
      console.error('Error recording sighting:', error);
      res.status(500).json({
        success: false,
        message: 'Server error occurred while recording sighting',
      });
    }
  }
);

// ROUTE 2: Approve pending report (admin only)
router.patch('/:id/approve', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const person = await MissingPerson.findById(id);

    if (!person) {
      return res.status(404).json({
        success: false,
        message: 'Missing person report not found',
      });
    }

    if (person.approvalStatus === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Report has already been approved',
      });
    }

    person.approvalStatus = 'approved';
    person.approvedAt = new Date();
    person.approvedBy = req.user._id;
    person.status = 'active';
    await person.save();

    res.json({
      success: true,
      message: 'Missing person report approved',
      data: person,
    });
  } catch (error) {
    console.error('Error approving missing person:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while approving report',
    });
  }
});

// ROUTE 2: Get all missing persons
router.get('/getallpersons', optionalAuth, async (req, res)=> {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || "active";
    const approvalStatusQuery = req.query.approvalStatus;
    const search = req.query.search;

    const query = { status };

    if (!req.user || req.user.role !== 'ADMINISTRATOR') {
      query.approvalStatus = 'approved';
    } else if (approvalStatusQuery && approvalStatusQuery !== 'all') {
      query.approvalStatus = approvalStatusQuery;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { adhaarNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await MissingPerson.countDocuments(query);
    const missingPersons = await MissingPerson.find(query)
      .sort({ dateMissing: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('reportedBy', 'firstName lastName email')
      .populate('sightings.reportedBy', 'firstName lastName email');

    res.status(200).json({
  success: true,
      data: missingPersons,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    console.error('Error fetching missing persons:', error);
    res.status(500).json({
      success: true,
      message: 'Server error occurred while fetching missing persons'
    });
  }
});

// ROUTE 3: Delete missing person
router.delete('/deleteperson/:adhaarNumber', authMiddleware, async (req, res)=> {
  try {
    const { adhaarNumber } = req.params;

    const person = await MissingPerson.findOne({ adhaarNumber });
    if (!person) {
      return res.status(404).json({
        success: true,
        message: 'Person not found'
      });
    }

    // Check if user has permission to delete
    if (req.user.role !== 'ADMINISTRATOR' && req.user.role !== 'LAW_ENFORCEMENT') {
      return res.status(403).json({
        success: true,
        message: 'Permission denied'
      });
    }

    await MissingPerson.deleteOne({ adhaarNumber });
    
    res.status(200).json({
      success: true,
      message: 'Person deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting missing person:', error);
    res.status(500).json({
      success: true,
      message: 'Server error occurred while deleting missing person'
    });
  }
});

// ROUTE 4: Mark missing person as found (admin only - discards data)
router.patch('/:id/mark-found', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const person = await MissingPerson.findById(id);

    if (!person) {
      return res.status(404).json({
        success: false,
        message: 'Person not found',
      });
    }

    await person.deleteOne();

    res.json({
      success: true,
      message: 'Missing person marked as found and data removed',
    });
  } catch (error) {
    console.error('Error marking missing person as found:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while marking as found',
    });
  }
});

// ROUTE 5: Get missing person by Adhaar number
router.get('/getperson/:adhaarNumber', optionalAuth, async (req, res)=> {
  try {
    const { adhaarNumber } = req.params;

    const person = await MissingPerson.findOne({ adhaarNumber });
    if (!person) {
      return res.status(404).json({
        success: true,
        message: 'Person not found'
      });
    }

    res.status(200).json({
      success: true,
      data: person
    });

  } catch (error) {
    console.error('Error fetching missing person:', error);
    res.status(500).json({
      success: true,
      message: 'Server error occurred while fetching missing person'
    });
  }
});

export default router;