import mongoose from 'mongoose';

const { Schema } = mongoose;

const LocationSchema = new Schema({
  lat: { type: Number },
  lon: { type: Number },
  accuracy: { type: Number },
}, { _id: false });

const FaceDetectionSchema = new Schema({
  personName: { type: String, required: true },
  confidence: { type: Number, required: true },
  source: { type: String, enum: ['image', 'video', 'live'], default: 'image' },
  frame: { type: Number },
  captureTime: { type: Date, default: Date.now },
  thumbnail: { type: String }, // base64 data URL from face service
  mediaUrl: { type: String },
  location: { type: LocationSchema },
  metadata: { type: Map, of: Schema.Types.Mixed },
}, {
  timestamps: true,
});

FaceDetectionSchema.index({ captureTime: -1 });
FaceDetectionSchema.index({ personName: 1, captureTime: -1 });

export const FaceDetection = mongoose.model('FaceDetection', FaceDetectionSchema);
