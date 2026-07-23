import express from 'express';
import mongoose from 'mongoose';
import { connectDB } from '../server/db.js';
import { Product, ScrapedAd } from '../models/index.js';
import { isValidCity, isValidCategory } from '../lib/validators.js';
import { calculateConfidenceScore, confidenceLabel } from '../services/productVerificationService.js';
import { getSeasonalScore } from '../services/seasonalFilterService.js';
import { getAdBasedWinners, getAdStats, getCityCoverage, backfillCities, backfillSeasons, getSeasonCoverage, cleanFakeAds } from '../services/adWinningService.js';
import { ensureAdsExist } from '../services/scraperService.js';
import { getProductHistory, getTrendPrediction } from '../services/historyService.js';

const router = express.Router();

const SORT_OPTIONS = {
  winScore: { winScore: -1 },
  trending: { trend: 1, winScore: -1 },
  newest: { createdAt: -1 },
  mostAds: { activeAds: -1 },
};

const PROJECTION = {
  name: 1,
  slug: 1,
  imageUrl: 1,
  winScore: 1,
  priceMin: 1,
  priceMax: 1,
  trend: 1,
  platforms: 1,
  cities: 1,
  category: 1,
  isWinning: 1,
  darazOrders: 1,
  darazRating: 1,
  activeAds: 1,
  tiktokViews: 1,
  olxViews: 1,
  olxListings: 1,
  googleTrendSpike: 1,
  alibabaOrderSurge: 1,
  competitorCount: 1,
  topCompetitors: 1,
  isVerified: 1,
  imageMismatchFlag: 1,
  seasonalWarning: 1,
  createdAt: 1,
};

const PAKISTAN_CITIES = [
  'Karachi','Lahore','Islamabad','Rawalpindi','Faisalabad',
  'Multan','Peshawar','Quetta','Sialkot','Gujranwala',
];

const VALID_SEASONS = new Set(['winter', 'summer', 'ramadan', 'wedding', 'backToSchool', 'general']);

// Cache for winning products
const _cache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function getCacheKey(city, season, limit) {
  return `${city || ''}:${season || ''}:${limit}`;
}

function getSeasonalSource(category) {
  const map = {
    Electronics:  'High demand in Q4 (Nov–Jan)',
    Fashion:      'Peak during Eid & wedding season',
    Beauty:       'Year-round steady demand',
    Home:         'Peak during wedding & moving season',
    Grocery:      'Consistent year-round demand',
    Toys:         'Peak in Eid & school holidays',
    Sports:       'Rising with fitness trends',
    Books:        'Steady with academic calendar',
  };
  return map[category] || 'Standard seasonal demand';
}

// GET /api/products
router.get('/', async (req, res) => {
  try {
    await connectDB();

    const city = req.query.city;
    const category = req.query.category;
    const minScore = parseInt(req.query.minScore || '0', 10);
    const sortBy = req.query.sortBy || 'winScore';
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));

    const filter = {};
    if (city && isValidCity(city)) filter.cities = city;
    if (category && isValidCategory(category)) filter.category = category;
    if (minScore > 0) filter.winScore = { $gte: minScore };

    const sort = SORT_OPTIONS[sortBy] || SORT_OPTIONS.winScore;
    const skip = (page - 1) * limit;

    const [rawProducts, total] = await Promise.all([
      Product.find(filter, PROJECTION).sort(sort).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    const products = rawProducts.map((p) => {
      const score = calculateConfidenceScore(p);
      const label = confidenceLabel(score);

      const { warning: liveWarning } = getSeasonalScore(p.category, p.name);
      const seasonalWarning = p.seasonalWarning || liveWarning || null;

      const verificationNote = p.imageMismatchFlag
        ? 'Image may not match product — verify before sourcing'
        : null;

      return {
        ...p,
        confidence:      label,
        confidenceScore: score,
        isVerified:      p.isVerified ?? score >= (parseInt(process.env.CONFIDENCE_THRESHOLD, 10) || 60),
        verificationNote,
        seasonalWarning,
      };
    });

    return res.json({
      success: true,
      data: {
        products,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Products list error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch products' });
  }
});

// GET /api/products/winning
router.get('/winning', async (req, res) => {
  try {
    await connectDB();

    const bust = req.query.bust === '1';
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 50);
    const rawCity = (req.query.city || '').trim();
    const rawSeason = (req.query.season || '').trim();

    const city = PAKISTAN_CITIES.includes(rawCity) ? rawCity : null;
    const season = VALID_SEASONS.has(rawSeason) ? rawSeason : null;

    const cacheKey = getCacheKey(city, season, limit);
    const cached = _cache.get(cacheKey);

    if (!bust && cached && Date.now() - cached.at < CACHE_TTL) {
      return res.json({ success: true, cached: true, data: cached.payload });
    }

    // Trigger background operations (fire-and-forget)
    ensureAdsExist();
    cleanFakeAds().catch((e) => console.warn('[cleanFakeAds]', e.message));
    backfillCities().catch((e) => console.warn('[backfillCities]', e.message));
    backfillSeasons().catch((e) => console.warn('[backfillSeasons]', e.message));

    const [products, stats, cityCoverage, seasonCoverage] = await Promise.all([
      getAdBasedWinners(50, city, season),
      getAdStats(city, season),
      getCityCoverage(),
      getSeasonCoverage(),
    ]);

    const payload = {
      products:       products.slice(0, limit),
      total:          products.length,
      stats,
      cityCoverage,
      seasonCoverage,
      cityFilter:     city   || null,
      seasonFilter:   season || null,
      source:         'facebook_ads_live',
      windowDays:     7,
      lastUpdated:    new Date().toISOString(),
    };

    _cache.set(cacheKey, { payload, at: Date.now() });

    return res.json({ success: true, cached: false, data: payload });
  } catch (err) {
    console.error('[GET /api/products/winning]', err.message);
    return res.json({
      success: true,
      cached:  false,
      error:   err.message,
      data:    {
        products:       [],
        total:          0,
        stats:          { totalAds: 0, uniqueAdvertisers: 0, categories: 0, maxDaysRunning: 0, lastScraped: null },
        cityCoverage:   {},
        seasonCoverage: {},
        cityFilter:     null,
        seasonFilter:   null,
        source:         'fallback',
        windowDays:     7,
        lastUpdated:    new Date().toISOString(),
      },
    });
  }
});

// GET /api/products/:slug
router.get('/:slug', async (req, res) => {
  try {
    await connectDB();

    const { slug } = req.params;
    if (!slug) {
      return res.status(400).json({ success: false, error: 'Slug is required' });
    }

    const product = await Product.findOne({ slug }).lean();
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    return res.json({ success: true, data: { product } });
  } catch (error) {
    console.error('Product detail error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch product' });
  }
});

// GET /api/products/:slug/history
router.get('/:slug/history', async (req, res) => {
  try {
    await connectDB();
    const days = parseInt(req.query.days || '30', 10);
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({ success: false, error: 'slug is required' });
    }

    const [history, prediction] = await Promise.all([
      getProductHistory(slug, days),
      getTrendPrediction(slug),
    ]);

    return res.json({ success: true, data: { history, prediction, days } });
  } catch (err) {
    console.error('[history route]', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/products/:slug/score
router.get('/:slug/score', async (req, res) => {
  try {
    await connectDB();

    const { slug } = req.params;
    const product = await Product.findOne({ slug }).lean();
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const competitorCount = await ScrapedAd.countDocuments({
      category: product.category,
      scrapedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    const darazRaw  = product.darazOrders || 0;
    const olxRaw    = product.olxViews || 0;
    const tiktokRaw = product.tiktokViews || 0;
    const googleRaw = product.googleTrendSpike || 0;
    const seasonRaw = product.seasonalRelevance || 0;

    const darazScore  = Math.min(Math.round((darazRaw  / 1000) * 100), 100);
    const olxScore    = Math.min(Math.round((olxRaw    / 50000) * 100), 100);
    const tiktokScore = Math.min(Math.round((tiktokRaw / 1000000) * 100), 100);
    const googleScore = Math.min(Math.round((googleRaw / 100) * 100), 100);
    const seasonScore = Math.min(seasonRaw, 100);

    const darazPts  = Math.min((darazRaw  / 1000) * 30, 30);
    const olxPts    = Math.min((olxRaw    / 50000) * 20, 20);
    const tiktokPts = Math.min((tiktokRaw / 1000000) * 20, 20);
    const googlePts = Math.min(googleRaw / 5, 15);
    const seasonPts = (seasonRaw / 100) * 15;
    const totalScore = Math.round(Math.min(darazPts + olxPts + tiktokPts + googlePts + seasonPts, 100));

    const fbAdsRaw   = product.activeAds || 0;
    const alibabaRaw = product.alibabaOrderSurge || 0;

    const breakdown = {
      daraz: {
        label:      'Daraz Sales',
        icon:       'daraz',
        score:      darazScore,
        weight:     30,
        pts:        Math.round(darazPts * 10) / 10,
        rawValue:   darazRaw,
        source:     `${darazRaw.toLocaleString()} orders on Daraz`,
        color:      'orange',
      },
      olx: {
        label:      'OLX Demand',
        icon:       'olx',
        score:      olxScore,
        weight:     20,
        pts:        Math.round(olxPts * 10) / 10,
        rawValue:   olxRaw,
        source:     `${olxRaw.toLocaleString()} views on OLX`,
        color:      'teal',
      },
      tiktok: {
        label:      'TikTok Reach',
        icon:       'tiktok',
        score:      tiktokScore,
        weight:     20,
        pts:        Math.round(tiktokPts * 10) / 10,
        rawValue:   tiktokRaw,
        source:     `${tiktokRaw.toLocaleString()} views on TikTok`,
        color:      'pink',
      },
      google: {
        label:      'Google Trends',
        icon:       'google',
        score:      googleScore,
        weight:     15,
        pts:        Math.round(googlePts * 10) / 10,
        rawValue:   googleRaw,
        source:     `+${googleRaw}% spike in Pakistan searches`,
        color:      'blue',
      },
      seasonal: {
        label:      'Seasonal Fit',
        icon:       'seasonal',
        score:      seasonScore,
        weight:     15,
        pts:        Math.round(seasonPts * 10) / 10,
        rawValue:   seasonRaw,
        source:     getSeasonalSource(product.category),
        color:      'green',
      },
    };

    const extras = {
      facebookAds: {
        label:    'Facebook Ads',
        rawValue: fbAdsRaw,
        source:   `${fbAdsRaw} active FB ads · ${competitorCount} competitors tracked this week`,
        color:    'indigo',
      },
      alibaba: {
        label:    'Alibaba Surge',
        rawValue: alibabaRaw,
        source:   `+${alibabaRaw}% supplier order surge`,
        color:    'yellow',
      },
    };

    let recommendation;
    if (totalScore >= 75)      recommendation = 'Strong winning product — consider sourcing immediately';
    else if (totalScore >= 60) recommendation = 'Promising — monitor closely for 1–2 more weeks';
    else if (totalScore >= 40) recommendation = 'Moderate signals — wait for more data before sourcing';
    else                        recommendation = 'Weak signals — high risk, skip for now';

    return res.json({
      success: true,
      data: {
        productName:     product.name,
        category:        product.category,
        trend:           product.trend,
        priceMin:        product.priceMin,
        priceMax:        product.priceMax,
        totalScore,
        storedScore:     product.winScore,
        isWinning:       totalScore >= 75,
        recommendation,
        breakdown,
        extras,
        competitorCount,
        lastScrapedAt:   product.lastScrapedAt,
      },
    });
  } catch (err) {
    console.error('[GET /api/products/[slug]/score]', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
