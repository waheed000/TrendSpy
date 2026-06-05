import { connectDB }                       from '@/lib/db';
import { getAdBasedWinners, getAdStats }  from '@/services/adWinningService';

// Simple in-process cache (Next.js restarts clear it — fine for dev)
let _cache = null;
let _cacheAt = 0;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const bust  = searchParams.get('bust') === '1';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);

    // Serve from cache unless busted or expired
    if (!bust && _cache && Date.now() - _cacheAt < CACHE_TTL) {
      return Response.json({
        success: true,
        cached:  true,
        data:    { ..._cache, products: _cache.products.slice(0, limit) },
      });
    }

    const [products, stats] = await Promise.all([
      getAdBasedWinners(50),   // fetch max, slice for response
      getAdStats(),
    ]);

    const payload = {
      products,
      total:        products.length,
      stats,
      source:       'facebook_ads_live',
      windowDays:   7,
      lastUpdated:  new Date().toISOString(),
    };

    _cache   = payload;
    _cacheAt = Date.now();

    return Response.json({
      success: true,
      cached:  false,
      data:    { ...payload, products: products.slice(0, limit) },
    });
  } catch (err) {
    console.error('[GET /api/products/winning]', err.message);
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
