import { connectDB }                                                           from '@/lib/db';
import { getAdBasedWinners, getAdStats, getCityCoverage, backfillCities }  from '@/services/adWinningService';

const PAKISTAN_CITIES = [
  'Karachi','Lahore','Islamabad','Rawalpindi','Faisalabad',
  'Multan','Peshawar','Quetta','Sialkot','Gujranwala',
];

// City-keyed in-process cache — each city (including '') gets its own slot.
const _cache   = new Map();   // key → { payload, at }
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function getCacheKey(city, limit) {
  return `${city || ''}:${limit}`;
}

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const bust  = searchParams.get('bust') === '1';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);
    const rawCity = (searchParams.get('city') || '').trim();

    // Validate city — reject unknown values to prevent injection
    const city = PAKISTAN_CITIES.includes(rawCity) ? rawCity : null;

    const cacheKey = getCacheKey(city, limit);
    const cached   = _cache.get(cacheKey);

    if (!bust && cached && Date.now() - cached.at < CACHE_TTL) {
      return Response.json({ success: true, cached: true, data: cached.payload });
    }

    // Retroactively tag city on any ads scraped before city extraction was added.
    // Fire-and-forget — doesn't block the response.
    backfillCities().catch((e) => console.warn('[backfillCities]', e.message));

    const [products, stats, cityCoverage] = await Promise.all([
      getAdBasedWinners(50, city),
      getAdStats(city),
      getCityCoverage(),
    ]);

    const payload = {
      products:      products.slice(0, limit),
      total:         products.length,
      stats,
      cityCoverage,              // { Lahore: 12, Karachi: 8, … } for dropdown badges
      cityFilter:    city,
      source:        'facebook_ads_live',
      windowDays:    7,
      lastUpdated:   new Date().toISOString(),
    };

    _cache.set(cacheKey, { payload, at: Date.now() });

    return Response.json({ success: true, cached: false, data: payload });
  } catch (err) {
    console.error('[GET /api/products/winning]', err.message);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
