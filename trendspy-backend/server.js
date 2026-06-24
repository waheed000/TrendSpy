import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

async function main() {
  const dev = process.env.NODE_ENV !== 'production';

  // ── MongoDB setup ─────────────────────────────────────────────────────────
  // Priority 1: MONGODB_URI secret (Atlas) — data persists across restarts.
  // Priority 2: In-memory fallback — dev only, data lost on restart.
  const atlasUri = process.env.MONGODB_URI;
  const isAtlas  = atlasUri &&
    !atlasUri.includes('localhost') &&
    atlasUri.startsWith('mongodb');

  if (isAtlas) {
    console.log('[server] ✅ Using MongoDB Atlas (persistent storage)');
    // MONGODB_URI is already set — lib/db.js will use it directly.
  } else {
    if (process.env.NODE_ENV === 'production') {
      console.error('[server] ❌ MONGODB_URI not set in production. Set it in Replit Secrets.');
      process.exit(1);
    }
    console.log('[server] No Atlas URI — starting in-memory MongoDB (dev mode, data resets on restart)...');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    process.env.DB_NAME = process.env.DB_NAME || 'trendspy';
    console.log('[server] ✅ In-memory MongoDB ready');

    const stop = async () => { await mongod.stop(); process.exit(0); };
    process.on('SIGTERM', stop);
    process.on('SIGINT',  stop);
  }

  // Seed all collections (products, suppliers, ads) if empty
  try {
    const { seedAll } = await import('./lib/seedAll.js');
    await seedAll();
  } catch (err) {
    console.warn('[server] Seed warning:', err.message);
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
