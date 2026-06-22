import { connectDB }                                                         from '@/lib/db';
import { getAdBasedWinners, getAdStats, getCityCoverage, backfillCities } from '@/services/adWinningService';
import { ensureAdsExist }                                                   from '@/services/scraperService';

const PAKISTAN_CITIES = [
  'Karachi','Lahore','Islamabad','Rawalpindi','Faisalabad',
  'Multan','Peshawar','Quetta','Sialkot','Gujranwala',
];

// City-keyed in-process cache — each city (including '') gets its own slot.
const _cache    = new Map();   // key → { payload, at }
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function getCacheKey(city, limit) {
  return `${city || ''}:${limit}`;
}

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const bust    = searchParams.get('bust') === '1';
    const limit   = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);
    const rawCity = (searchParams.get('city') || '').trim();

    // Validate city — reject unknown values to prevent injection
    const city = PAKISTAN_CITIES.includes(rawCity) ? rawCity : null;

    const cacheKey = getCacheKey(city, limit);
    const cached   = _cache.get(cacheKey);

    if (!bust && cached && Date.now() - cached.at < CACHE_TTL) {
      return Response.json({ success: true, cached: true, data: cached.payload });
    }

    // If DB has no recent ads, trigger a background scrape so the next
    // request (or auto-refresh) finds data. Non-blocking — does not delay this response.
    ensureAdsExist();

    // Retroactively tag city on any ads scraped before city extraction was added.
    // Fire-and-forget — doesn't block the response.
    backfillCities().catch((e) => console.warn('[backfillCities]', e.message));

    const [products, stats, cityCoverage] = await Promise.all([
      getAdBasedWinners(50, city),
      getAdStats(city),
      getCityCoverage(),
    ]);

    const payload = {
      products:    products.slice(0, limit),
      total:       products.length,
      stats,
      cityCoverage,              // { Lahore: 12, Karachi: 8, … } for dropdown badges
      cityFilter:  city,
      source:      'facebook_ads_live',
      windowDays:  7,
      lastUpdated: new Date().toISOString(),
    };

    _cache.set(cacheKey, { payload, at: Date.now() });

    return Response.json({ success: true, cached: false, data: payload });
  } catch (err) {
    console.error('[GET /api/products/winning]', err.message);

    // Last-resort: return empty-but-valid shape so the frontend never white-screens
    return Response.json({
      success: true,
      cached:  false,
      error:   err.message,
      data:    {
        products:    [],
        total:       0,
        stats:       { totalAds: 0, uniqueAdvertisers: 0, categories: 0, maxDaysRunning: 0, lastScraped: null },
        cityCoverage:{},
        cityFilter:  null,
        source:      'fallback',
        windowDays:  7,
        lastUpdated: new Date().toISOString(),
      },
    });
  }
}
