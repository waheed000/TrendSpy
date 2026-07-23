import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn('⚠️ MONGODB_URI not set. Using in-memory fallback.');
}

export async function connectDB() {
  try {
    if (!MONGODB_URI) {
      // In-memory fallback for demo
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      
      await mongoose.connect(uri, {
        dbName: 'trendspy',
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 60000,
        connectTimeoutMS: 30000,
        maxPoolSize: 10,
      });
      console.log('✅ In-memory MongoDB connected');
      return;
    }

    const isAtlas = MONGODB_URI.includes('mongodb+srv://');

    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      ...(isAtlas ? {} : { directConnection: true, family: 4 }),
    });
    
    console.log('✅ MongoDB Atlas connected');
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    throw error;
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.disconnect();
  console.log('🛑 MongoDB disconnected');
  process.exit(0);
});
