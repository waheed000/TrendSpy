import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!MONGODB_URI || MONGODB_URI.includes('localhost')) {
    console.log('⚠️ No production MongoDB URI, using in-memory database');
    const { connectMemoryDB } = await import('./memoryDb.js');
    cached.conn = await connectMemoryDB();
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      dbName: process.env.DB_NAME || 'trendspy',
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB connected successfully');
        return mongoose;
      })
      .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
