import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod = null;
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const hasProdUri =
    process.env.MONGODB_URI &&
    !process.env.MONGODB_URI.includes('localhost') &&
    process.env.MONGODB_URI !== 'mongodb://localhost:27017/trendspy';

  if (hasProdUri) {
    if (!cached.promise) {
      const opts = {
        dbName: process.env.DB_NAME || 'trendspy',
        bufferCommands: false,
      };
      cached.promise = mongoose
        .connect(process.env.MONGODB_URI, opts)
        .then((m) => {
          console.log('✅ MongoDB Atlas connected');
          return m;
        })
        .catch((err) => {
          console.error('❌ MongoDB connection error:', err);
          throw err;
        });
    }
    cached.conn = await cached.promise;
    return cached.conn;
  }

  console.log('⚠️ Using in-memory MongoDB (data resets on restart)');

  if (!mongod) {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri, { dbName: 'trendspy' });
    console.log('✅ In-memory MongoDB connected');
  }

  cached.conn = mongoose.connection;
  return cached.conn;
}

export async function disconnectMemoryDB() {
  if (mongod) {
    await mongoose.disconnect();
    await mongod.stop();
    mongod = null;
    console.log('✅ In-memory MongoDB disconnected');
  }
}
