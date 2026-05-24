import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

async function main() {
  const dev = process.env.NODE_ENV !== 'production';

  // Start in-memory MongoDB BEFORE Next.js loads (keeps it out of webpack)
  const hasProdUri =
    process.env.MONGODB_URI &&
    !process.env.MONGODB_URI.includes('localhost') &&
    process.env.MONGODB_URI !== 'mongodb://localhost:27017/trendspy';

  if (!hasProdUri) {
    console.log('[server] No production MONGODB_URI — starting in-memory MongoDB...');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    process.env.DB_NAME = process.env.DB_NAME || 'trendspy';
    console.log('[server] ✅ In-memory MongoDB ready');

    const stop = async () => {
      await mongod.stop();
      process.exit(0);
    };
    process.on('SIGTERM', stop);
    process.on('SIGINT', stop);
  }

  const app = next({ dev, dir: new URL('.', import.meta.url).pathname });
  const handle = app.getRequestHandler();

  await app.prepare();

  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3001, '0.0.0.0', () => {
    console.log('[server] ✅ Next.js running on http://localhost:3001');
  });
}

main().catch((err) => {
  console.error('[server] Fatal error:', err);
  process.exit(1);
});
