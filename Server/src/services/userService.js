import { User } from '../models/User.js';
import { Case } from '../models/Case.js';

export class UserService {
  static async getUserProfile(userId){
  const user = await User.findById(userId).select('-password -resetPasswordToken');
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  static async updateUserProfile(userId, updateData){
    // Remove sensitive fields that shouldn't be updated via this method
    const allowedFields = [
      'firstName', 'lastName', 'phoneNumber', 'address', 'preferences', 'profileImage'
    ];
    
    const sanitizedData = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        sanitizedData[field] = updateData[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: sanitizedData },
      { new: true, runValidators: true }
  ).select('-password -resetPasswordToken');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  static async getUserCases(userId, filters = {}){
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    let query = {};

    // Role-based access control
    if (user.role === 'GENERAL_USER') {
      // General users can only see cases or cases they created/are stakeholders in
      query = {
        $or: [
          { createdBy: userId },
          { 'stakeholders.userId': userId },
          { isPublic: true }
        ]
      };
    } else if (user.role === 'LAW_ENFORCEMENT') {
      // Law enforcement can see all cases they're assigned to or cases
      query = {
        $or: [
          { 'assignedOfficers.userId': userId },
          { createdBy: userId },
          { isPublic: true }
        ]
      };
    }
    // Administrators can see all cases (no additional restrictions)

    // Apply additional filters
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.priority) {
      query.priority = filters.priority;
    }
    if (filters.dateFrom) {
      query.createdAt = { $gte: new Date(filters.dateFrom) };
    }
    if (filters.dateTo) {
      query.createdAt = { ...query.createdAt, $lte: new Date(filters.dateTo) };
    }

    const cases = await Case.find(query)
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedOfficers.userId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    return cases;
  }

  static async deactivateUser(userId){
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      throw new Error('User not found');
    }

    return { message: 'User account deactivated successfully' };
  }

  static async reactivateUser(userId){
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        isActive: true,
        loginAttempts: 0,
        $unset: { lockUntil: 1 }
      },
      { new: true }
    );

    if (!user) {
      throw new Error('User not found');
    }

    return { message: 'User account reactivated successfully' };
  }

  static async getUserStats(userId){
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    let stats = {};

    if (user.role === 'GENERAL_USER') {
      const createdCases = await Case.countDocuments({ createdBy: userId });
      const stakeholderCases = await Case.countDocuments({ 'stakeholders.userId': userId });
      
      stats = {
        createdCases,
        stakeholderCases,
        totalInvolvedCases: createdCases + stakeholderCases,
      };
    } else if (user.role === 'LAW_ENFORCEMENT') {
      const assignedCases = await Case.countDocuments({ 'assignedOfficers.userId': userId });
      const activeCases = await Case.countDocuments({ 
        'assignedOfficers.userId': userId,
        status: { $in: ['OPEN', 'INVESTIGATING'] }
      });
      const resolvedCases = await Case.countDocuments({ 
        'assignedOfficers.userId': userId,
        status: 'RESOLVED'
      });

      stats = {
        assignedCases,
        activeCases,
        resolvedCases,
      };
    } else if (user.role === 'ADMINISTRATOR') {
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ isActive: true });
      const totalCases = await Case.countDocuments();
      const openCases = await Case.countDocuments({ status: 'OPEN' });
      const resolvedCases = await Case.countDocuments({ status: 'RESOLVED' });

      stats = {
        totalUsers,
        activeUsers,
        totalCases,
        openCases,
        resolvedCases,
      };
    }

    return stats;
  }
}
