import mongoose, { Document, Schema } from 'mongoose';

const locationSchema = new Schema({
  latitude: { type: Number },
  longitude: { type: Number },
  address: { type: String, trim: true },
}, { _id: false });

const sightingSchema = new Schema({
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String, trim: true },
  location: locationSchema,
  createdAt: { type: Date, default: Date.now },
}, { _id: true });

const missingPersonSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'other']
  },
  identification: {
    type: String,
    trim: true
  },
  nationality: {
    type: String,
    trim: true,
    default: 'Indian'
  },
  height: {
    type: Number,
    min: 0
  },
  dateMissing: {
    type: Date,
    required: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  adhaarNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d{12}$/.test(v);
      },
      message: 'Adhaar number must be 12 digits'
    }
  },
  phoneNumber: {
    type: String,
    validate: {
      validator: function(v) {
        return v ? /^\d{10}$/.test(v.toString()) : true;
      },
      message: 'Phone number must be 10 digits'
    }
  },
  image: {
    data: Buffer,
    contentType: String
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['active', 'found', 'closed'],
    default: 'active'
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved'],
    default: 'pending'
  },
  approvedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastSeenAt: Date,
  lastSeenNotes: {
    type: String,
    trim: true
  },
  lastSeenLocation: locationSchema,
  // Additional optional fields
  age: {
    type: Number,
    min: 0,
    max: 150
  },
  weight: {
    type: Number,
    min: 0
  },
  eyeColor: {
    type: String,
    trim: true
  },
  hairColor: {
    type: String,
    trim: true
  },
  complexion: {
    type: String,
    trim: true
  },
  identifyingMarks: {
    type: String,
    trim: true
  },
  circumstances: {
    type: String,
    trim: true
  },
  clothingDescription: {
    type: String,
    trim: true
  },
  medicalConditions: {
    type: String,
    trim: true
  },
  medications: {
    type: String,
    trim: true
  },
  allergies: {
    type: String,
    trim: true
  },
  hobbies: {
    type: String,
    trim: true
  },
  habits: {
    type: String,
    trim: true
  },
  frequentPlaces: {
    type: String,
    trim: true
  },
  recentChanges: {
    type: String,
    trim: true
  },
  emergencyContacts: [{
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^\d{10}$/.test(v.toString());
        },
        message: 'Phone number must be 10 digits'
      }
    }
  }],
  socialMedia: [{
    platform: String,
    username: String
  }],
  sightings: [sightingSchema]
}, {
  timestamps: true
});

// Create indexes for better performance
missingPersonSchema.index({ adhaarNumber: 1 });
missingPersonSchema.index({ status: 1 });
missingPersonSchema.index({ approvalStatus: 1 });
missingPersonSchema.index({ dateMissing: -1 });
missingPersonSchema.index({ name: 'text', address: 'text' });

const MissingPerson = mongoose.model('MissingPerson', missingPersonSchema);

export default MissingPerson;