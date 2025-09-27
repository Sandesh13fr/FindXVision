import mongoose, { Document, Schema } from 'mongoose';

const AuditLogSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  resource: {
    type: String,
    enum: ['USER', 'CASE', 'NOTIFICATION', 'ADMIN', 'AUTH', 'SYSTEM'],
    required: true,
  },
  resourceId: Schema.Types.ObjectId,
  details: {
    method: { type: String, required: true },
    endpoint: { type: String, required: true },
    userAgent: String,
    ipAddress: { type: String, required: true },
    changes: {
      before: Schema.Types.Mixed,
      after: Schema.Types.Mixed,
    },
    metadata: Schema.Types.Mixed,
  },
  timestamp: { type: Date, default: Date.now },
  success: { type: Boolean, required: true },
  errorMessage: String,
}, {
  timestamps: true, // We use our own timestamp field
});

// Indexes for performance
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ resource: 1, resourceId: 1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ success: 1 });

export const AuditLog = mongoose.model('AuditLog', AuditLogSchema);