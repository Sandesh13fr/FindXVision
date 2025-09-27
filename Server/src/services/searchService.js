import { Case } from '../models/Case.js';
import { User } from '../models/User.js';
import { catchAsync } from '../middleware/errorMiddleware.js';
import { recordCaseOperation } from '../middleware/metricsMiddleware.js';
import { LoggerService } from '../utils/logger.js';

export class SearchService {
  static buildSearchQuery(filters) {
    const query = {};
    const searchConditions = [];

    // Text search across multiple fields
    if (filters.query) {
      const textQuery = {
        $or: [
          { title: { $regex: filters.query, $options: 'i' } },
          { description: { $regex: filters.query, $options: 'i' } },
          { caseNumber: { $regex: filters.query, $options: 'i' } },
          { 'missingPerson.firstName': { $regex: filters.query, $options: 'i' } },
          { 'missingPerson.lastName': { $regex: filters.query, $options: 'i' } },
          { circumstances: { $regex: filters.query, $options: 'i' } },
        ],
      };
      searchConditions.push(textQuery);
    }

    // Status filter
    if (filters.status && filters.status.length > 0) {
      query.status = { $in: filters.status };
    }

    // Priority filter
    if (filters.priority && filters.priority.length > 0) {
      query.priority = { $in: filters.priority };
    }

    // Age range filter
    if (filters.ageRange) {
      const ageFilter = {};
      if (filters.ageRange.min !== undefined) {
        ageFilter.$gte = filters.ageRange.min;
      }
      if (filters.ageRange.max !== undefined) {
        ageFilter.$lte = filters.ageRange.max;
      }
      if (Object.keys(ageFilter).length > 0) {
        query['missingPerson.age'] = ageFilter;
      }
    }

    // Gender filter
    if (filters.gender) {
      query['missingPerson.gender'] = filters.gender;
    }

    // Date range filter
    if (filters.dateRange) {
      const dateFilter = {};
      if (filters.dateRange.from) {
        dateFilter.$gte = new Date(filters.dateRange.from);
      }
      if (filters.dateRange.to) {
        dateFilter.$lte = new Date(filters.dateRange.to);
      }
      if (Object.keys(dateFilter).length > 0) {
        query.lastSeenDate = dateFilter;
      }
    }

    // Location filter
    if (filters.location) {
      if (filters.location.city) {
        query['lastSeenLocation.city'] = { $regex: filters.location.city, $options: 'i' };
      }
      if (filters.location.state) {
        query['lastSeenLocation.state'] = { $regex: filters.location.state, $options: 'i' };
      }
      // Radius search would require geospatial indexing
      if (filters.location.radius && filters.location.city) {
        // This is a simplified version - in production, you'd use $geoNear
        // query['lastSeenLocation.coordinates'] = {
        //   $near: {
        //     $geometry: { type: "Point", coordinates: [lng, lat] },
        //     $maxDistance: filters.location.radius * 1609.34 // Convert miles to meters
        //   }
        // };
      }
    }

    // Case type filter
    if (filters.caseType) {
      query.caseType = filters.caseType;
    }

    // Assigned to filter
    if (filters.assignedTo) {
      query.assignedTo = { $regex: filters.assignedTo, $options: 'i' };
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    // Combine text search with other conditions
    if (searchConditions.length > 0) {
      if (Object.keys(query).length > 0) {
        return { $and: [{ $or: searchConditions }, query] };
      } else {
        return { $or: searchConditions };
      }
    }

    return query;
  }

  static getSortOptions(sortBy, sortOrder = 'desc') {
    const sortOptions = {};
    
    switch (sortBy) {
      case 'date':
        sortOptions.createdAt = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'lastSeen':
        sortOptions.lastSeenDate = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'priority':
        // Custom priority ordering: URGENT > HIGH > MEDIUM > LOW
        sortOptions.priority = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'name':
        sortOptions['missingPerson.lastName'] = sortOrder === 'asc' ? 1 : -1;
        sortOptions['missingPerson.firstName'] = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'caseNumber':
        sortOptions.caseNumber = sortOrder === 'asc' ? 1 : -1;
        break;
      default:
        // Default sort by creation date (newest first)
        sortOptions.createdAt = -1;
    }

    return sortOptions;
  }

  static async searchCases(filters, userId) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100); // Max 100 results per page
    const skip = (page - 1) * limit;

    const searchQuery = this.buildSearchQuery(filters);
    const sortOptions = this.getSortOptions(filters.sortBy, filters.sortOrder);

    // Log search operation
    LoggerService.logCaseOperation('search', 'cases', userId, {
      filters,
      query: searchQuery,
    });

    const [cases, total] = await Promise.all([
      Case.find(searchQuery)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'email role')
        .populate('assignedTo', 'email firstName lastName')
        .lean(),
      Case.countDocuments(searchQuery),
    ]);

    return {
      cases,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
      query: searchQuery, // For debugging
    };
  }

  static async getSearchSuggestions(query, userId) {
    if (!query || query.length < 2) {
      return [];
    }

    const suggestions = await Promise.all([
      // Case numbers
      Case.find({
        caseNumber: { $regex: query, $options: 'i' },
      })
        .select('caseNumber')
        .limit(5)
        .lean(),

      // Missing person names
      Case.find({
        $or: [
          { 'missingPerson.firstName': { $regex: query, $options: 'i' } },
          { 'missingPerson.lastName': { $regex: query, $options: 'i' } },
        ],
      })
        .select('missingPerson.firstName missingPerson.lastName')
        .limit(10)
        .lean(),

      // Locations
      Case.find({
        $or: [
          { 'lastSeenLocation.city': { $regex: query, $options: 'i' } },
          { 'lastSeenLocation.state': { $regex: query, $options: 'i' } },
        ],
      })
        .select('lastSeenLocation.city lastSeenLocation.state')
        .limit(5)
        .lean(),
    ]);

    // Flatten and deduplicate results
    const flattened = [].concat(...suggestions);
    const unique = [...new Map(flattened.map(item => [JSON.stringify(item), item])).values()];
    
    return unique.slice(0, 20); // Return max 20 suggestions
  }

  static async advancedSearch(filters, userId, userRole) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const skip = (page - 1) * limit;

    // Build query with role-based access control
    const baseQuery = this.buildSearchQuery(filters);
    let accessQuery = {};

    if (userRole === 'GENERAL_USER') {
      accessQuery = {
        $or: [
          { createdBy: userId },
          { 'stakeholders.userId': userId },
          { isPublic: true }
        ]
      };
    } else if (userRole === 'LAW_ENFORCEMENT') {
      accessQuery = {
        $or: [
          { 'assignedOfficers.userId': userId },
          { createdBy: userId },
          { isPublic: true }
        ]
      };
    }
    // Admins can see all cases

    // Combine base query with access control
    const finalQuery = Object.keys(accessQuery).length > 0 
      ? { $and: [baseQuery, accessQuery] }
      : baseQuery;

    const sortOptions = this.getSortOptions(filters.sortBy, filters.sortOrder);

    const [cases, total] = await Promise.all([
      Case.find(finalQuery)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'firstName lastName email role')
        .populate('assignedOfficers.userId', 'firstName lastName email')
        .populate('stakeholders.userId', 'firstName lastName email')
        .lean(),
      Case.countDocuments(finalQuery),
    ]);

    // Add computed fields
    const enrichedCases = cases.map(caseItem => ({
      ...caseItem,
      fullName: `${caseItem.missingPerson.firstName} ${caseItem.missingPerson.lastName}`,
      location: `${caseItem.lastSeenLocation.city}, ${caseItem.lastSeenLocation.state}`,
    }));

    return {
      cases: enrichedCases,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }
}

// Controller functions
export const searchCases = catchAsync(async (req, res) => {
  const { success } = req.locals || { success: true };
  const userId = req.user ? req.user._id : null;
  
  const result = await SearchService.searchCases(req.body, userId);
  
  res.json({
    success,
    data: result,
  });
});

export const getSearchSuggestions = catchAsync(async (req, res) => {
  const { success } = req.locals || { success: true };
  const userId = req.user ? req.user._id : null;
  
  const suggestions = await SearchService.getSearchSuggestions(req.query.query, userId);
  
  res.json({
    success,
    data: { suggestions },
  });
});

export const advancedSearch = catchAsync(async (req, res) => {
  const { success } = req.locals || { success: true };
  const userId = req.user ? req.user._id : null;
  const userRole = req.user ? req.user.role : null;
  
  const result = await SearchService.advancedSearch(req.body, userId, userRole);
  
  res.json({
    success,
    data: result,
  });
});