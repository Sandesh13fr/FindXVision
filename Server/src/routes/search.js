import express from 'express';
import { searchCases, getSearchSuggestions, advancedSearch } from '../services/searchService.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation';
import { body, query } from 'express-validator';

const router = express.Router();

// Search validation rules
const searchValidation = [
  body('query').optional().isString().trim().isLength({ max: 500 }),
  body('status').optional().isArray(),
  body('status.*').optional().isIn(['OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED']),
  body('priority').optional().isArray(),
  body('priority.*').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  body('ageRange.min').optional().isInt({ min: 0, max: 150 }),
  body('ageRange.max').optional().isInt({ min: 0, max: 150 }),
  body('gender').optional().isIn(['MALE', 'FEMALE', 'OTHER']),
  body('dateRange.from').optional().isISO8601(),
  body('dateRange.to').optional().isISO8601(),
  body('location.city').optional().isString().trim().isLength({ max: 100 }),
  body('location.state').optional().isString().trim().isLength({ max: 100 }),
  body('location.radius').optional().isInt({ min: 1, max: 1000 }),
  body('caseType').optional().isString().trim(),
  body('assignedTo').optional().isString().trim(),
  body('tags').optional().isArray(),
  body('tags.*').optional().isString().trim().isLength({ max: 50 }),
  body('page').optional().isInt({ min: 1 }),
  body('limit').optional().isInt({ min: 1, max: 100 }),
  body('sortBy').optional().isIn(['date', 'lastSeen', 'priority', 'name', 'caseNumber']),
  body('sortOrder').optional().isIn(['asc', 'desc']),
];

/**
 * @swagger
 * /api/search/cases:
 *   post:
 *     summary: Search cases with advanced filters
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *                 description: Text search across case fields
 *                 example: "John Doe"
 *               status:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [OPEN, INVESTIGATING, RESOLVED, CLOSED]
 *                 example: ["OPEN", "INVESTIGATING"]
 *               priority:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [LOW, MEDIUM, HIGH, URGENT]
 *                 example: ["HIGH", "URGENT"]
 *               ageRange:
 *                 type: object
 *                 properties:
 *                   min:
 *                     type: integer
 *                     minimum: 0
 *                     maximum: 150
 *                   max:
 *                     type: integer
 *                     minimum: 0
 *                     maximum: 150
 *               gender:
 *                 type: string
 *                 enum: [MALE, FEMALE, OTHER]
 *               dateRange:
 *                 type: object
 *                 properties:
 *                   from:
 *                     type: string
 *                     format: date-time
 *                   to:
 *                     type: string
 *                     format: date-time
 *               location:
 *                 type: object
 *                 properties:
 *                   city:
 *                     type: string
 *                     maxLength: 100
 *                   state:
 *                     type: string
 *                     maxLength: 100
 *                   radius:
 *                     type: integer
 *                     minimum: 1
 *                     maximum: 1000
 *               page:
 *                 type: integer
 *                 minimum: 1
 *                 default: 1
 *               limit:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *                 default: 20
 *               sortBy:
 *                 type: string
 *                 enum: [date, lastSeen, priority, name, caseNumber]
 *               sortOrder:
 *                 type: string
 *                 enum: [asc, desc]
 *                 default: desc
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     cases:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Case'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         hasNext:
 *                           type: boolean
 *                         hasPrev:
 *                           type: boolean
 *       400:
 *         description: Invalid search parameters
 *       401:
 *         description: Unauthorized
 */
router.post('/cases', authenticateToken, searchValidation, validateRequest, searchCases);

/**
 * @swagger
 * /api/search/suggestions:
 *   get:
 *     summary: Get search suggestions
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *         description: Search query for suggestions
 *         example: "john"
 *     responses:
 *       200:
 *         description: Search suggestions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     caseNumbers:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["CASE-2024-001", "CASE-2024-010"]
 *                     persons:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["John Doe", "John Smith"]
 *                     locations:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["New York", "Los Angeles"]
 *       400:
 *         description: Invalid query parameter
 *       401:
 *         description: Unauthorized
 */
router.get('/suggestions', 
  authenticateToken,
  query('query').isString().trim().isLength({ min: 2, max: 100 }),
  validateRequest,
  getSearchSuggestions
);

/**
 * @swagger
 * /api/search/advanced:
 *   post:
 *     summary: Advanced search with aggregation
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filters:
 *                 type: object
 *                 description: Same *               aggregation:
 *                 type: object
 *                 properties:
 *                   groupBy:
 *                     type: string
 *                     description: Field to group results by
 *                     example: "status"
 *                   sortBy:
 *                     type: string
 *                     description: Field to sort by
 *                   sortOrder:
 *                     type: string
 *                     enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Aggregated search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized
 */
router.post('/advanced', 
  authenticateToken,
  requireRole(['LAW_ENFORCEMENT', 'ADMINISTRATOR']),
  advancedSearch
);

export default router;
