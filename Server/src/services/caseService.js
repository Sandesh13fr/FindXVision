import { Case } from '../models/Case.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import mongoose from 'mongoose';

export class CaseService {
  static async createCase(caseData, createdBy){
    const caseDoc = new Case({
      ...caseData,
      createdBy,
      lastUpdatedBy: createdBy,
      activities: [{
        type: 'OTHER',
        description: 'Case created',
        userId: new mongoose.Types.ObjectId(createdBy),
        timestamp: new Date(),
      }],
    });

    const savedCase = await caseDoc.save();
    
    // Populate the created case
    const populatedCase = await Case.findById(savedCase._id)
      .populate('createdBy', 'firstName lastName email role')
      .populate('lastUpdatedBy', 'firstName lastName email');

    // Create notifications for relevant users (law enforcement)
    await this.notifyLawEnforcement(populatedCase);

    return populatedCase;
  }

  static async getCases(filters, userId, userRole){
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100); // Max 100 items per page
    const skip = (page - 1) * limit;

    // Build query based on user role and filters
    let query = {};

    // Role-based access control
    if (userRole === 'GENERAL_USER') {
      query = {
        $or: [
          { createdBy: userId },
          { 'stakeholders.userId': userId },
          { isPublic: true }
        ]
      };
    } else if (userRole === 'LAW_ENFORCEMENT') {
      query = {
        $or: [
          { 'assignedOfficers.userId': userId },
          { createdBy: userId },
          { isPublic: true }
        ]
      };
    }
    // Administrators can see all cases

    // Apply filters
    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.priority) {
      query.priority = filters.priority;
    }

    if (filters.dateFrom || filters.dateTo) {
      query.createdAt = {};
      if (filters.dateFrom) {
        query.createdAt.$gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        query.createdAt.$lte = new Date(filters.dateTo);
      }
    }

    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    if (filters.location) {
      query['lastSeenLocation.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [filters.location.longitude, filters.location.latitude]
          },
          $maxDistance: filters.location.radius * 1000 // Convert km to meters
        }
      };
    }

    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    if (filters.assignedOfficer) {
      query['assignedOfficers.userId'] = filters.assignedOfficer;
    }

    if (filters.createdBy) {
      query.createdBy = filters.createdBy;
    }

    // Build sort options
    const sortOptions = {};
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;
    sortOptions[sortBy] = sortOrder;

    // Execute queries
    const [cases, total] = await Promise.all([
      Case.find(query)
        .populate('createdBy', 'firstName lastName email role')
        .populate('lastUpdatedBy', 'firstName lastName email')
        .populate('assignedOfficers.userId', 'firstName lastName email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Case.countDocuments(query)
    ]);

    return {
      cases,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getCaseById(caseId, userId, userRole){
    const caseDoc = await Case.findById(caseId)
      .populate('createdBy', 'firstName lastName email role')
      .populate('lastUpdatedBy', 'firstName lastName email')
      .populate('assignedOfficers.userId', 'firstName lastName email')
      .populate('stakeholders.userId', 'firstName lastName email')
      .populate('activities.userId', 'firstName lastName email')
      .populate('comments.userId', 'firstName lastName email');

    if (!caseDoc) {
      throw new Error('Case not found');
    }

    // Check access permissions
    if (!this.canAccessCase(caseDoc, userId, userRole)) {
      throw new Error('Access denied to this case');
    }

    return caseDoc;
  }

  static async updateCase(caseId, updateData, userId, userRole){
    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) {
      throw new Error('Case not found');
    }

    // Check access permissions
    if (!this.canModifyCase(caseDoc, userId, userRole)) {
      throw new Error('Access denied to modify this case');
    }

    // Add activity log
    caseDoc.activities.push({
      type: 'OTHER',
      description: 'Case updated',
      userId: new mongoose.Types.ObjectId(userId),
      timestamp: new Date(),
      metadata: { updatedFields: Object.keys(updateData) }
    });

    // Update case
    Object.assign(caseDoc, updateData);
    caseDoc.lastUpdatedBy = userId;
    const updatedCase = await caseDoc.save();

    // Populate the updated case
    const populatedCase = await Case.findById(updatedCase._id)
      .populate('createdBy', 'firstName lastName email role')
      .populate('lastUpdatedBy', 'firstName lastName email')
      .populate('assignedOfficers.userId', 'firstName lastName email');

    return populatedCase;
  }

  static async deleteCase(caseId, userId, userRole){
    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) {
      throw new Error('Case not found');
    }

    // Check access permissions (only law enforcement and admins can delete)
    if (userRole !== 'LAW_ENFORCEMENT' && userRole !== 'ADMINISTRATOR') {
      throw new Error('Access denied to delete this case');
    }

    // Soft delete by setting status to CLOSED
    caseDoc.status = 'CLOSED';
    caseDoc.lastUpdatedBy = userId;
    
    // Add activity log
    caseDoc.activities.push({
      type: 'OTHER',
      description: 'Case closed (deleted)',
      userId: new mongoose.Types.ObjectId(userId),
      timestamp: new Date(),
    });

    const updatedCase = await caseDoc.save();

    // Create notification for stakeholders
    await this.notifyCaseClosed(caseDoc);

    return { message: 'Case closed successfully' };
  }

  static async addComment(caseId, commentData, userId){
    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) {
      throw new Error('Case not found');
    }

    const comment = {
      userId: new mongoose.Types.ObjectId(userId),
      content: commentData.content,
      isPrivate: commentData.isPrivate || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    caseDoc.comments.push(comment);
    caseDoc.lastUpdatedBy = userId;
    
    // Add activity log
    caseDoc.activities.push({
      type: 'NOTE_ADDED',
      description: 'Comment added',
      userId: new mongoose.Types.ObjectId(userId),
      timestamp: new Date(),
    });

    const updatedCase = await caseDoc.save();

    // Populate the updated case
    const populatedCase = await Case.findById(updatedCase._id)
      .populate('comments.userId', 'firstName lastName email');

    // Create notification for stakeholders if comment is not private
    if (!comment.isPrivate) {
      await this.notifyCommentAdded(caseDoc, comment);
    }

    return populatedCase;
  }

  static async assignOfficer(caseId, officerData, assignedByUserId){
    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) {
      throw new Error('Case not found');
    }

    // Check if officer is already assigned
    const existingAssignment = caseDoc.assignedOfficers.find(
      officer => officer.userId.toString() === officerData.userId
    );

    if (existingAssignment) {
      throw new Error('Officer is already assigned to this case');
    }

    caseDoc.assignedOfficers.push({
      userId: new mongoose.Types.ObjectId(officerData.userId),
      assignedAt: new Date(),
      role: officerData.role || 'SECONDARY',
    });

    caseDoc.lastUpdatedBy = assignedByUserId;
    
    // Add activity log
    caseDoc.activities.push({
      type: 'OTHER',
      description: 'Officer assigned',
      userId: new mongoose.Types.ObjectId(assignedByUserId),
      timestamp: new Date(),
      metadata: { assignedOfficer: officerData.userId }
    });

    const updatedCase = await caseDoc.save();

    // Create notification for assigned officer
    await this.notifyOfficerAssigned(caseDoc, officerData.userId);

    // Populate the updated case
    const populatedCase = await Case.findById(updatedCase._id)
      .populate('assignedOfficers.userId', 'firstName lastName email');

    return populatedCase;
  }

  static async removeOfficer(caseId, officerUserId, removedByUserId){
    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) {
      throw new Error('Case not found');
    }

    // Check if officer is assigned
    const officerIndex = caseDoc.assignedOfficers.findIndex(
      officer => officer.userId.toString() === officerUserId
    );

    if (officerIndex === -1) {
      throw new Error('Officer is not assigned to this case');
    }

    caseDoc.assignedOfficers.splice(officerIndex, 1);
    caseDoc.lastUpdatedBy = removedByUserId;
    
    // Add activity log
    caseDoc.activities.push({
      type: 'OTHER',
      description: 'Officer removed',
      userId: new mongoose.Types.ObjectId(removedByUserId),
      timestamp: new Date(),
      metadata: { removedOfficer: officerUserId }
    });

    const updatedCase = await caseDoc.save();

    // Create notification for removed officer
    await this.notifyOfficerRemoved(caseDoc, officerUserId);

    return { message: 'Officer removed successfully' };
  }

  static canAccessCase(caseDoc, userId, userRole){
    // Admins can access all cases
    if (userRole === 'ADMINISTRATOR') return true;

    // Check if user is the creator
    if (caseDoc.createdBy.toString() === userId) return true;

    // Check if user is assigned as an officer
    if (caseDoc.assignedOfficers.some(officer => officer.userId.toString() === userId)) {
      return true;
    }

    // Check if user is a stakeholder
    if (caseDoc.stakeholders.some(stakeholder => stakeholder.userId.toString() === userId)) {
      return true;
    }

    // Public cases can be accessed by anyone
    if (caseDoc.isPublic) return true;

    // Law enforcement can access all cases
    if (userRole === 'LAW_ENFORCEMENT') return true;

    return false;
  }

  static canModifyCase(caseDoc, userId, userRole){
    // Admins can modify all cases
    if (userRole === 'ADMINISTRATOR') return true;

    // Check if user is the creator
    if (caseDoc.createdBy.toString() === userId) return true;

    // Check if user is assigned as a primary officer
    if (caseDoc.assignedOfficers.some(
      officer => officer.userId.toString() === userId && officer.role === 'PRIMARY'
    )) {
      return true;
    }

    // Law enforcement can modify all cases
    if (userRole === 'LAW_ENFORCEMENT') return true;

    return false;
  }

  static async notifyLawEnforcement(caseDoc){
    try {
      // Find all law enforcement users
      const lawEnforcementUsers = await User.find({ role: 'LAW_ENFORCEMENT', isActive: true });

      // Create notifications for each law enforcement user
      const notifications = lawEnforcementUsers.map(user => ({
        userId: user._id,
        caseId: caseDoc._id,
        type: 'CASE_UPDATE',
        channel: 'IN_APP',
        title: 'New Missing Person Case',
        message: `A new case has been created: ${caseDoc.missingPerson.firstName} ${caseDoc.missingPerson.lastName}`,
        status: 'PENDING',
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    } catch (error) {
      console.error('Failed to notify law enforcement:', error);
    }
  }

  static async notifyCaseClosed(caseDoc){
    try {
      // Notify stakeholders
      const stakeholderIds = caseDoc.stakeholders.map(stakeholder => stakeholder.userId);
      const stakeholders = await User.find({
        _id: { $in: stakeholderIds },
        isActive: true
      });

      const notifications = stakeholders.map(user => ({
        userId: user._id,
        caseId: caseDoc._id,
        type: 'CASE_RESOLVED',
        channel: 'IN_APP',
        title: 'Case Closed',
        message: `The case for ${caseDoc.missingPerson.firstName} ${caseDoc.missingPerson.lastName} has been closed`,
        status: 'PENDING',
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    } catch (error) {
      console.error('Failed to notify case closure:', error);
    }
  }

  static async notifyCommentAdded(caseDoc, comment){
    try {
      // Notify stakeholders and assigned officers
      const userIds = [
        ...caseDoc.stakeholders.map(stakeholder => stakeholder.userId),
        ...caseDoc.assignedOfficers.map(officer => officer.userId),
        caseDoc.createdBy
      ];

      // Remove duplicates
      const uniqueUserIds = [...new Set(userIds.map(id => id.toString()))]
        .map(id => new mongoose.Types.ObjectId(id));

      const users = await User.find({
        _id: { $in: uniqueUserIds },
        isActive: true
      });

      const notifications = users.map(user => ({
        userId: user._id,
        caseId: caseDoc._id,
        type: 'CASE_UPDATE',
        channel: 'IN_APP',
        title: 'New Comment Added',
        message: `A new comment was added to the case for ${caseDoc.missingPerson.firstName} ${caseDoc.missingPerson.lastName}`,
        status: 'PENDING',
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    } catch (error) {
      console.error('Failed to notify comment added:', error);
    }
  }

  static async notifyOfficerAssigned(caseDoc, officerUserId){
    try {
      const officer = await User.findById(officerUserId);
      if (!officer || !officer.isActive) return;

      const notification = new Notification({
        userId: officer._id,
        caseId: caseDoc._id,
        type: 'CASE_ASSIGNED',
        channel: 'IN_APP',
        title: 'Case Assignment',
        message: `You have been assigned to the case for ${caseDoc.missingPerson.firstName} ${caseDoc.missingPerson.lastName}`,
        status: 'PENDING',
      });

      await notification.save();
    } catch (error) {
      console.error('Failed to notify officer assignment:', error);
    }
  }

  static async notifyOfficerRemoved(caseDoc, officerUserId){
    try {
      const officer = await User.findById(officerUserId);
      if (!officer || !officer.isActive) return;

      const notification = new Notification({
        userId: officer._id,
        caseId: caseDoc._id,
        type: 'CASE_UPDATE',
        channel: 'IN_APP',
        title: 'Case Assignment Removed',
        message: `You have been removed from the case for ${caseDoc.missingPerson.firstName} ${caseDoc.missingPerson.lastName}`,
        status: 'PENDING',
      });

      await notification.save();
    } catch (error) {
      console.error('Failed to notify officer removal:', error);
    }
  }

  static async searchCases(searchTerm, filters = {}, userId, userRole){
    // Build query based on user role
    let query = {};

    // Role-based access control
    if (userRole === 'GENERAL_USER') {
      query = {
        $or: [
          { createdBy: userId },
          { 'stakeholders.userId': userId },
          { isPublic: true }
        ]
      };
    } else if (userRole === 'LAW_ENFORCEMENT') {
      query = {
        $or: [
          { 'assignedOfficers.userId': userId },
          { createdBy: userId },
          { isPublic: true }
        ]
      };
    }
    // Administrators can see all cases

    // Add search term to query
    if (searchTerm) {
      query.$text = { $search: searchTerm };
    }

    // Apply additional filters
    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.priority) {
      query.priority = filters.priority;
    }

    // Execute search
    const cases = await Case.find(query)
      .populate('createdBy', 'firstName lastName email role')
      .populate('assignedOfficers.userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(20);

    return cases;
  }

  static async getCaseStatistics(userId, userRole){
    let query = {};

    // Role-based access control
    if (userRole === 'GENERAL_USER') {
      query = {
        $or: [
          { createdBy: userId },
          { 'stakeholders.userId': userId },
          { isPublic: true }
        ]
      };
    } else if (userRole === 'LAW_ENFORCEMENT') {
      query = {
        $or: [
          { 'assignedOfficers.userId': userId },
          { createdBy: userId },
          { isPublic: true }
        ]
      };
    }
    // Administrators can see all cases

    const [totalCases, openCases, resolvedCases, closedCases] = await Promise.all([
      Case.countDocuments(query),
      Case.countDocuments({ ...query, status: 'OPEN' }),
      Case.countDocuments({ ...query, status: 'RESOLVED' }),
      Case.countDocuments({ ...query, status: 'CLOSED' })
    ]);

    return {
      total: totalCases,
      open: openCases,
      resolved: resolvedCases,
      closed: closedCases,
    };
  }
}