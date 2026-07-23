import express from 'express';
import { connectDB } from '../server/db.js';
import { ScrapedAd } from '../models/index.js';
import axios from 'axios';

const router = express.Router();

const SOCKET_BASE_URL = process.env.SOCKET_INTERNAL_URL || 'http://localhost:3002';
const SOCKET_SECRET   = process.env.SOCKET_INTERNAL_SECRET || 'trendspy-socket-internal';

async function callScraperOnSocketServer(searchTerm, category, platform) {
  const res = await axios.post(
    `${SOCKET_BASE_URL}/internal/scrape-fb-ads`,
    { searchTerm, category, platform },
    { headers: { 'x-internal-secret': SOCKET_SECRET }, timeout: 90000 }
  );
  return res.data;
}

function capitalize(str) {
  if (!str) return 'Low';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// GET /api/ads
router.get('/', async (req, res) => {
  try {
    await connectDB();

    const category    = req.query.category;
    const city        = req.query.city;
    const creative    = req.query.creative;
    const platform    = req.query.platform;
    const minDuration = parseInt(req.query.minDuration || '0', 10);
    const lastFetch   = req.query.lastFetch;
    const page        = Math.max(1, parseInt(req.query.page  || '1', 10));
    const limit       = Math.min(100, parseInt(req.query.limit || '30', 10));
    const skip        = (page - 1) * limit;

    const filter = { isActive: true };

    if (category && category !== 'All')  filter.category    = category;
    if (city     && city     !== 'All')  filter.city        = city;
    if (creative && creative !== 'All')  filter.creativeType = creative;
    if (platform && platform !== 'all')  filter.platform    = platform;
    if (minDuration > 0)                 filter.daysRunning = { $gte: minDuration };
    if (lastFetch)                       filter.scrapedAt   = { $gt: new Date(lastFetch) };

    const [ads, total] = await Promise.all([
      ScrapedAd.find(filter)
        .sort({ daysRunning: -1, scrapedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ScrapedAd.countDocuments(filter),
    ]);

    const categories = [...new Set(ads.map((a) => a.category).filter(Boolean))];
    let catCompetitors = {};
    if (categories.length > 0) {
      const agg = await ScrapedAd.aggregate([
        {
          $match: {
            isActive: true,
            category: { $in: categories },
            advertiserName: { $nin: ['', null, 'Unknown'] },
          },
        },
        {
          $group: {
            _id:         '$category',
            advertisers: { $addToSet: '$advertiserName' },
          },
        },
      ]);
      for (const row of agg) {
        catCompetitors[row._id] = row.advertisers.length;
      }
    }

    const normalized = ads.map((ad) => ({
      id:          ad._id,
      adId:        ad.adId,
      headline:    ad.headline     || 'Untitled Ad',
      description: ad.description  || '',
      creative:    ad.creativeType || 'image',
      platform:    ad.platform     || 'facebook',
      spend:       capitalize(ad.spendLevel || 'low'),
      duration:    ad.daysRunning  || 0,
      city:        ad.city         || 'Pakistan',
      category:    ad.category     || 'General',
      advertiser:  ad.advertiserName || '',
      imageUrl:    ad.imageUrl      || null,
      directUrl:   ad.directUrl     || (ad.adId ? `https://www.facebook.com/ads/library/?id=${ad.adId}` : null),
      scrapedAt:   ad.scrapedAt,
      competitors: catCompetitors[ad.category] || 0,
    }));

    return res.json({
      success: true,
      data: { ads: normalized, total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('[GET /api/ads]', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch ads' });
  }
});

// POST /api/ads/refresh
router.post('/refresh', async (req, res) => {
  try {
    await connectDB();

    const { searchTerm = 'smart watch Pakistan', category = 'Electronics', platform = 'all' } = req.body;

    console.log(`[POST /api/ads/refresh] Scraping: "${searchTerm}" category="${category}" platform="${platform}"`);

    const result = await callScraperOnSocketServer(searchTerm, category, platform);
    const ads    = result.ads || [];

    let savedNew = 0;
    for (const ad of ads) {
      if (!ad.adId) continue;
      try {
        const existing = await ScrapedAd.findOneAndUpdate(
          { adId: ad.adId },
          {
            $set: {
              advertiserName: ad.advertiserName,
              headline:       ad.headline,
              description:    ad.description || '',
              daysRunning:    ad.daysRunning || 0,
              creativeType:   ad.creativeType || 'image',
              spendLevel:     ad.spendLevel   || 'low',
              imageUrl:       ad.imageUrl     || '',
              videoUrl:       ad.videoUrl     || '',
              platform:       ad.platform     || 'facebook',
              category:       ad.category     || category,
              directUrl:      ad.directUrl    || '',
              isActive:       true,
              scrapedAt:      new Date(),
            },
            $setOnInsert: { firstSeenAt: new Date() },
          },
          { upsert: true, new: false }
        );
        if (!existing) savedNew++;
      } catch (err) {
        console.warn(`[ads/refresh] Failed to save ad ${ad.adId}: ${err.message}`);
      }
    }

    return res.json({
      success:    true,
      totalFound: result.totalFound,
      savedNew,
      ads:        ads.slice(0, 10).map((ad) => ({
        adId:           ad.adId,
        advertiserName: ad.advertiserName,
        headline:       ad.headline,
        daysRunning:    ad.daysRunning,
        spendLevel:     ad.spendLevel,
        creativeType:   ad.creativeType,
        directUrl:      ad.directUrl,
        platform:       ad.platform,
        category:       ad.category,
      })),
    });
  } catch (err) {
    console.error('[POST /api/ads/refresh]', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/ads/refresh (Purge stale ads)
router.delete('/refresh', async (req, res) => {
  try {
    await connectDB();
    const BAD_HEADLINES = ['Active', 'keyword search.', '', null];
    const result = await ScrapedAd.deleteMany({
      $or: [
        { advertiserName: { $in: ['Unknown', '', null] } },
        { headline: { $in: BAD_HEADLINES } },
        { headline: { $regex: /^keyword search/i } },
        { headline: { $regex: /^Active$/i } },
        { headline: { $exists: false } },
      ],
    });
    return res.json({ success: true, deleted: result.deletedCount });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ads/scrape-all
router.post('/scrape-all', async (req, res) => {
  try {
    await axios.post(
      `${SOCKET_BASE_URL}/internal/run-fb-job`,
      {},
      { headers: { 'x-internal-secret': SOCKET_SECRET }, timeout: 5000 }
    );
    return res.json({ success: true, message: 'Scrape job started' });
  } catch (err) {
    console.error('[POST /api/ads/scrape-all]', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
