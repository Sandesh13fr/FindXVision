import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import winston from 'winston';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import connectDB from './database/connection.js';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

// Basic middleware and error handling
import { globalErrorHandler, notFoundHandler } from './middleware/errorMiddleware.js';

// Route imports - Core MVP routes only
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import caseRoutes from './routes/cases.js';
import missingPersonRoutes from './routes/missingPersons.js';

// Middleware imports
import { requestLogger } from './middleware/requestLogger.js';
import { authenticateToken } from './middleware/auth.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize MongoDB connection
connectDB();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize Express app
const app = express();

// Trust proxy for accurate IP detection (needed for rate limiting)
app.set('trust proxy', 1);

const parseOrigins = (originsString = '') => {
  return originsString
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const defaultAllowedOrigins = ['http://localhost:3000', 'http://localhost:5173'];
const configuredOrigins = parseOrigins(process.env.CORS_ORIGIN);
const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...configuredOrigins]));

// Logger configuration - minimal for development
const logger = winston.createLogger({
  level: 'error', // Only log errors to reduce noise
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'findxvision-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' })
  ],
});

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
}));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ message: 'FindXVision API', status: 'OK' });
});

app.get('/favicon.ico', (req, res) => res.sendStatus(204));

// Core API routes for MVP
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/cases', authenticateToken, caseRoutes);
app.use('/api/missingpeople', missingPersonRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handling middleware (must be last)
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

// Graceful shutdown
process.on('SIGTERM', async () => {
  await mongoose.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await mongoose.disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
});

export { logger };
export default app;