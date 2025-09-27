import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const AddressSchema = new Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  zipCode: { type: String, required: true },
});

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    minlength: 8,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['GENERAL_USER', 'LAW_ENFORCEMENT', 'ADMINISTRATOR'],
    default: 'GENERAL_USER',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: Date,
  profileImage: String,
  phoneNumber: String,
  address: AddressSchema,
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: false },
      inApp: { type: Boolean, default: true },
    },
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'UTC' },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
  },
  oauth: {
    google: {
      id: String,
      email: String,
    },
    microsoft: {
      id: String,
      email: String,
    },
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for checking if account is locked
UserSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil.getTime() > Date.now());
});

UserSchema.virtual('roleKey').get(function() {
  if (this.role === 'ADMINISTRATOR') return 'ADMIN';
  if (this.role === 'GENERAL_USER') return 'USER';
  return this.role;
});

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  if (this.password) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword){
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to increment login attempts
UserSchema.methods.incrementLoginAttempts = async function(){
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Index for performance
// Note: email uniqueness is handled by unique: true in schema definition
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ createdAt: -1 });

export const User = mongoose.model('User', UserSchema);