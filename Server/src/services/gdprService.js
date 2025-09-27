import { User } from '../models/User.js';
import { Case } from '../models/Case.js';
import { AuditLog } from '../models/AuditLog.js';

export class GDPRService {
  // Export all user data for GDPR compliance
  static async exportUserData(userId){
    try {
      // Get user data
      const user = await User.findById(userId).select('-password');
      if (!user) {
        throw new Error('User not found');
      }

      // Get user's cases
      const cases = await Case.find({
        $or: [
          { createdBy: userId },
          { 'stakeholders.userId': userId },
          { 'assignedOfficers.userId': userId }
        ]
      });

      // Get audit logs
      const auditLogs = await AuditLog.find({ userId }).sort({ timestamp: -1 });

      // Compile export data
      const exportData = {
        personal_information: {
          user_id: user._id,
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
          role: user.role,
          phone_number: user.phoneNumber,
          address: user.address,
          preferences: user.preferences,
          created_at: user.createdAt,
          updated_at: user.updatedAt,
          last_login: user.lastLogin,
        },
        cases: cases.map(caseItem => ({
          case_id: caseItem._id,
          case_number: caseItem.caseNumber,
          role: caseItem.createdBy.toString() === userId ? 'creator' : 
                caseItem.stakeholders?.some(s => s.userId.toString() === userId) ? 'stakeholder' :
                caseItem.assignedOfficers?.some(o => o.userId.toString() === userId) ? 'officer' : 'unknown',
          created_at: caseItem.createdAt,
          updated_at: caseItem.updatedAt,
        })),
        activity_logs: auditLogs.map(log => ({
          action: log.action,
          resource: log.resource,
          timestamp: log.timestamp,
          success: log.success,
          ip_address: log.details.ipAddress,
          user_agent: log.details.userAgent,
        })),
        export_metadata: {
          export_date: new Date().toISOString(),
          export_format: 'JSON',
          data_controller: 'FindXVision',
          retention_period: '7 years from last activity',
        }
      };

      // Log the export request
      await AuditLog.create({
        userId,
        action: 'GDPR_DATA_EXPORT',
        resource: 'USER',
        details: {
          method: 'GET',
          endpoint: '/gdpr/export',
          ipAddress: 'system',
          userAgent: 'system',
        },
        success: true,
      });

      return exportData;
    } catch (error) {
      throw new Error(`Data export failed: ${error.message}`);
    }
  }

  // Delete user data (right to erasure)
  static async deleteUserData(userId, reason){
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const deletedData = {
        user: user.toObject(),
        cases_affected: 0,
        audit_logs_deleted: 0,
      };

      // Anonymize user's cases instead of deleting them (for legal/investigative purposes)
      const userCases = await Case.find({ createdBy: userId });
      for (const caseItem of userCases) {
        caseItem.createdBy = null; // Anonymize creator
        caseItem.reportedBy = {
          ...caseItem.reportedBy,
          name: '[ANONYMIZED]',
          email: '[ANONYMIZED]',
          phoneNumber: '[ANONYMIZED]',
        };
        await caseItem.save();
      }

      // Remove user from stakeholders and assigned officers
      await Case.updateMany(
        { 'stakeholders.userId': userId },
        { $pull: { stakeholders: { userId } } }
      );

      await Case.updateMany(
        { 'assignedOfficers.userId': userId },
        { $pull: { assignedOfficers: { userId } } }
      );

      deletedData.cases_affected = userCases.length;

      // Delete audit logs older than required retention period
      const retentionDate = new Date();
      retentionDate.setFullYear(retentionDate.getFullYear() - 7); // 7 years retention

      const oldAuditLogs = await AuditLog.deleteMany({
        userId,
        timestamp: { $lt: retentionDate }
      });
      deletedData.audit_logs_deleted = oldAuditLogs.deletedCount;

      // Anonymize recent audit logs
      await AuditLog.updateMany(
        { userId, timestamp: { $gte: retentionDate } },
        { userId: null }
      );

      // Log the deletion request before deleting user
      await AuditLog.create({
        userId,
        action: 'GDPR_DATA_DELETION',
        resource: 'USER',
        details: {
          method: 'DELETE',
          endpoint: '/gdpr/delete',
          ipAddress: 'system',
          userAgent: 'system',
          metadata: { reason: reason || 'User requested deletion' },
        },
        success: true,
      });

      // Delete the user account
      await User.findByIdAndDelete(userId);

      return {
        message: 'User data deleted successfully according to GDPR requirements',
        deletedData,
      };
    } catch (error) {
      throw new Error(`Data deletion failed: ${error.message}`);
    }
  }

  // Rectify user data (right to rectification)
  static async rectifyUserData(userId, corrections){
    try {
      const allowedFields = [
        'firstName', 'lastName', 'email', 'phoneNumber', 'address', 'preferences'
      ];

      const updateData = {};
      const updatedFields = [];

      allowedFields.forEach(field => {
        if (corrections[field] !== undefined) {
          updateData[field] = corrections[field];
          updatedFields.push(field);
        }
      });

      if (updatedFields.length === 0) {
        throw new Error('No valid fields to update');
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!user) {
        throw new Error('User not found');
      }

      // Log the rectification
      await AuditLog.create({
        userId,
        action: 'GDPR_DATA_RECTIFICATION',
        resource: 'USER',
        details: {
          method: 'PUT',
          endpoint: '/gdpr/rectify',
          ipAddress: 'system',
          userAgent: 'system',
          metadata: { updatedFields },
        },
        success: true,
      });

      return {
        message: 'User data rectified successfully',
        updatedFields,
      };
    } catch (error) {
      throw new Error(`Data rectification failed: ${error.message}`);
    }
  }

  // Restrict data processing (right to restriction)
  static async restrictUserProcessing(userId, restrict){
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { 
          $set: { 
            isActive: !restrict,
            preferences: {
              ...user.preferences,
              notifications: restrict ? {
                email: false,
                whatsapp: false,
                inApp: false
              } : user.preferences.notifications
            }
          }
        },
        { new: true }
      );

      if (!user) {
        throw new Error('User not found');
      }

      // Log the restriction
      await AuditLog.create({
        userId,
        action: 'GDPR_PROCESSING_RESTRICTION',
        resource: 'USER',
        details: {
          method: 'PUT',
          endpoint: '/gdpr/restrict',
          ipAddress: 'system',
          userAgent: 'system',
          metadata: { restricted: restrict },
        },
        success: true,
      });

      return {
        message: restrict ? 
          'User data processing restricted successfully' : 
          'User data processing restriction removed successfully',
      };
    } catch (error) {
      throw new Error(`Processing restriction failed: ${error.message}`);
    }
  }
}