import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';


if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

declare global {
  var _mongoConn: typeof mongoose | null;
  var _mongoPromise: Promise<typeof mongoose> | null;
}

globalThis._mongoConn ??= null;
globalThis._mongoPromise ??= null;

async function connectDB() {
  if (globalThis._mongoConn) return globalThis._mongoConn;

  if (!globalThis._mongoPromise) {
    globalThis._mongoPromise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .then((m) => {
        console.log('✅ Connected to MongoDB');
        return m;
      });
  }

  try {
    globalThis._mongoConn = await globalThis._mongoPromise;
  } catch (e) {
    globalThis._mongoPromise = null;
    throw e;
  }

  return globalThis._mongoConn;
}

export default connectDB;