---
name: Seed strategy
description: How and where DB seeding runs in this project's custom Next.js server setup
---

# Seed strategy

The backend uses a custom `server.js` (plain Node.js wrapping Next.js). Next.js instrumentation.js has a `process.env.NEXT_RUNTIME === 'nodejs'` guard — this check silently returns false in the custom-server setup, so seed code there never runs.

**Fix:** Created `trendspy-backend/lib/seedAll.js` using **relative imports** (no `@/` aliases), with an explicit `await connectDB()` at the top. Called from `server.js` right after MongoDB is ready, before `app.prepare()`.

**Why:** @/ aliases are resolved by Next.js webpack — unavailable in plain Node.js server.js. Relative imports work in both contexts.

**How to apply:** Any new seed logic goes in `seedAll.js`, not `instrumentation.js` or `lib/seed.js` (which uses @/ aliases). Each seed function checks `countDocuments() > 0` before inserting, so it's idempotent.

**Note:** In-memory MongoDB (dev, no MONGODB_URI) resets on every backend restart, so seeds re-run every restart — this is correct behavior.
