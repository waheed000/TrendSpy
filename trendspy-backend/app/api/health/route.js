import { connectDB } from '@/lib/db';

export async function GET() {
  try {
    await connectDB();
    return Response.json({
      status: 'ok',
      message: 'MongoDB connected successfully',
      timestamp: new Date().toISOString(),
      database: process.env.DB_NAME,
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return Response.json(
      {
        status: 'error',
        message: 'Database connection failed',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
