import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer = null;

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    
    if (mongoUri && !mongoUri.includes('localhost:27017')) {
      console.log(`Connecting to MongoDB URI: ${mongoUri.split('@')[1] || mongoUri}`);
      await mongoose.connect(mongoUri);
      console.log('MongoDB connected successfully.');
      return;
    }

    // Try connecting to local MongoDB first if specified
    if (mongoUri) {
      try {
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
        console.log('Local MongoDB connected successfully.');
        return;
      } catch (localErr) {
        console.log('Local MongoDB not running. Initializing In-Memory MongoDB for seamless execution...');
      }
    } else {
      console.log('No MONGO_URI provided. Initializing In-Memory MongoDB...');
    }

    // Fallback: In-Memory MongoDB Server
    mongoServer = await MongoMemoryServer.create();
    const memoryUri = mongoServer.getUri();
    await mongoose.connect(memoryUri);
    console.log(`In-Memory MongoDB connected successfully at ${memoryUri}`);
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};

export const closeDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
};
