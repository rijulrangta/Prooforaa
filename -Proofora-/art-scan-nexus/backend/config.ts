// backend/config.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();  // Load environment variables

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not set');
    }
    
    mongoose.set('bufferCommands', false);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully!');
    return true;
  } catch (err: any) {
    console.error('Error connecting to MongoDB:', err.message || err);
    console.error('Please check:');
    console.error('1. MONGO_URI is set correctly in your .env file');
    console.error('2. MongoDB Atlas cluster is running and accessible');
    console.error('3. Your IP is whitelisted in MongoDB Atlas');
    console.error('4. Network connection is working');
    
    // Don't exit - let the server start but warn that DB operations will fail
    console.warn('⚠️  Server will start but database operations will fail until MongoDB is connected');
    return false;
  }
};

export default connectDB;