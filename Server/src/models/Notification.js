import mongoose, { Document, Schema } from 'mongoose';

const NotificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  caseId: { type: Schema.Types.ObjectId, ref: 'Case' },
  type: {
    type: String,
    enum: ['CASE_UPDATE', 'CASE_ASSIGNED', 'CASE_RESOLVED', 'SYSTEM_ALERT', 'EMAIL_VERIFICATION', 'PASSWORD_RESET', 'WELCOME'],
    required: true,
  },
  channel: {
    type: String,
    enum: ['EMAIL', 'WHATSAPP', 'IN_APP', 'SMS'],
    required: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'SENT', 'DELIVERED', 'FAILED', 'READ'],
    default: 'PENDING',
  },
  
  title: { type: String, required: true },
  message: { type: String, required: true },
  metadata: {
    email: {
      subject: String,
      template: String,
      attachments: [{
        filename: String,
        path: String,
      }],
    },
    whatsapp: {
      phoneNumber: String,
      templateName: String,
      templateParams: [Schema.Types.Mixed],
    },
    inApp: {
      actionUrl: String,
      actionText: String,
      icon: String,
    },
  },
  
  sentAt: Date,
  deliveredAt: Date,
  readAt: Date,
  errorMessage: String,
  retryCount: { type: Number, default: 0 },
  maxRetries: { type: Number, default: 3 },
}, {
  timestamps: true,
});

// Indexes
NotificationSchema.index({ userId: 1, status: 1 });
NotificationSchema.index({ caseId: 1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ channel: 1 });
NotificationSchema.index({ createdAt: -1 });
NotificationSchema.index({ status: 1, retryCount: 1 });

export const Notification = mongoose.model('Notification', NotificationSchema);