import { connectDB as serverConnectDB } from '../server/db.js';

export async function connectDB() {
  return serverConnectDB();
}
