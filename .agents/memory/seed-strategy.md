---
name: Seed strategy
description: How and where database seeding runs; important path/import constraints
---

**Fix:** Created `backend/lib/seedAll.js` using **relative imports** from canonical model files (`../models/Product.js`, `../models/TrendScore.js`, etc.) — no `@/` aliases, no inline schema redefinitions. This ensures the Mongoose model cache always uses full canonical schemas.

Called from `backend/server.js` right after MongoDB is ready, before `app.prepare()`.

**Why:** `@/` aliases only resolve inside Next.js. The seed runs in plain Node.js context via `server.js`, so relative paths are required. Using canonical model imports eliminates schema-mismatch risk from duplicate schema definitions.

**How to apply:** If adding new models to the seed, import from `../models/<Model>.js` rather than defining a new schema inline in `seedAll.js`.

**Note:** `instrumentation.js` has a `NEXT_RUNTIME` check that silently skips in the custom-server setup — this is intentional; seeding happens via `seedAll()` in `server.js` instead.
