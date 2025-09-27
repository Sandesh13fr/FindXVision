import mongoose from 'mongoose';

const connectDB = async ()=> {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/findxvision';
    
    mongoose.set('strictQuery', false);
    
    // Set connection timeout and retry options
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
    };
    
    const conn = await mongoose.connect(mongoUri, options);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events (only log errors)
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });
    
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    
    // For development, continue without database
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  Continuing without database connection in development mode');
      console.log('📝 Note: Some features requiring database will not work');
      return;
    }
    
    process.exit(1);
  }
};

export default connectDB;
