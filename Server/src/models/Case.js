import mongoose, { Document, Schema } from 'mongoose';

const PhysicalDescriptionSchema = new Schema({
  height: Number,
  weight: Number,
  eyeColor: String,
  hairColor: String,
  complexion: String,
  distinguishingMarks: String,
  clothing: String,
});

const CoordinatesSchema = new Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
});

const LocationSchema = new Schema({
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  coordinates: CoordinatesSchema,
  locationDescription: String,
});

const ImageSchema = new Schema({
  url: { type: String, required: true },
  filename: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  description: String,
  isProfileImage: { type: Boolean, default: false },
});

const ContactSchema = new Schema({
  name: { type: String, required: true },
  relationship: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: String,
  isPrimary: { type: Boolean, default: false },
});

const StakeholderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: {
    type: String,
    enum: ['FAMILY', 'FRIEND', 'LAW_ENFORCEMENT', 'VOLUNTEER', 'OTHER'],
    required: true,
  },
  notifications: {
    email: { type: Boolean, default: true },
    whatsapp: { type: Boolean, default: false },
    inApp: { type: Boolean, default: true },
  },
  addedAt: { type: Date, default: Date.now },
});

const OfficerSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assignedAt: { type: Date, default: Date.now },
  role: {
    type: String,
    enum: ['PRIMARY', 'SECONDARY', 'CONSULTANT'],
    default: 'SECONDARY',
  },
});

const ActivitySchema = new Schema({
  type: {
    type: String,
    enum: ['STATUS_CHANGE', 'NOTE_ADDED', 'IMAGE_UPLOADED', 'CONTACT_ADDED', 'LOCATION_UPDATE', 'SIGHTING_REPORTED', 'OTHER'],
    required: true,
  },
  description: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
  metadata: Schema.Types.Mixed,
});

const CommentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  isPrivate: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
});

const ExternalReferenceSchema = new Schema({
  system: { type: String, required: true },
  referenceId: { type: String, required: true },
  url: String,
});

const CaseSchema = new Schema({
  caseNumber: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['OPEN', 'RESOLVED', 'CLOSED', 'INVESTIGATING'],
    default: 'OPEN',
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM',
  },
  
  missingPerson: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    age: { type: Number, required: true },
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'],
      required: true,
    },
    dateOfBirth: Date,
    physicalDescription: PhysicalDescriptionSchema,
    medicalConditions: String,
    medications: String,
    allergies: String,
    hobbies: String,
    habits: String,
    frequentPlaces: String,
    recentChanges: String,
  },
  
  lastSeenLocation: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    coordinates: CoordinatesSchema,
    locationDescription: String,
  },
  lastSeenDate: Date,
  
  circumstances: String,
  clothingDescription: String,
  images: [ImageSchema],
  
  reportedBy: ContactSchema,
  emergencyContacts: [ContactSchema],
  stakeholders: [StakeholderSchema],
  
  assignedOfficers: [OfficerSchema],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  lastUpdatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  
  activities: [ActivitySchema],
  comments: [CommentSchema],
  
  externalReferences: [ExternalReferenceSchema],
  
  socialMedia: [{
    platform: String,
    username: String
  }],
  
  tags: [String],
  isPublic: { type: Boolean, default: false },
  publicDescription: String,
  
}, {
  timestamps: true,
});

// Indexes for performance
CaseSchema.index({ caseNumber: 1 });
CaseSchema.index({ status: 1 });
CaseSchema.index({ priority: 1 });
CaseSchema.index({ 'missingPerson.firstName': 1, 'missingPerson.lastName': 1 });
CaseSchema.index({ 'lastSeenLocation.coordinates': '2dsphere' });
CaseSchema.index({ createdAt: -1 });
CaseSchema.index({ createdBy: 1 });

export const Case = mongoose.model('Case', CaseSchema);