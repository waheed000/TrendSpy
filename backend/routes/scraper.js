import express from 'express';
import axios from 'axios';
import { connectDB } from '../server/db.js';
import { ScrapedAd, Product, Supplier } from '../models/index.js';
import { getScraperStatus } from '../services/scraperService.js';

const router = express.Router();

const SOCKET_BASE = process.env.SOCKET_INTERNAL_URL || 'http://localhost:3002';
const SOCKET_SECRET = process.env.SOCKET_INTERNAL_SECRET || 'trendspy-socket-internal';

const VALID_SCRAPERS = ['facebookAds', 'daraz', 'olx', 'googleTrends', 'news', 'suppliers'];

// GET /api/scraper/health
router.get('/health', async (req, res) => {
  try {
    const status = await getScraperStatus();
    return res.json({ success: true, status });
  } catch (err) {
    console.error('[GET /api/scraper/health]', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/scraper/status
router.get('/status', async (req, res) => {
  try {
    const [schedulerRes, dbCounts] = await Promise.allSettled([
      axios.get(`${SOCKET_BASE}/scheduler/status`, { timeout: 5000 }),
      (async () => {
        await connectDB();
        const [totalAds, totalProducts, totalSuppliers] = await Promise.all([
          ScrapedAd.countDocuments(),
          Product.countDocuments(),
          Supplier.countDocuments(),
        ]);
        return { totalAds, totalProducts, totalSuppliers };
      })(),
    ]);

    const schedulerData =
      schedulerRes.status === 'fulfilled'
        ? schedulerRes.value.data
        : { scheduler: { enabled: false, startedAt: null }, nextRuns: {} };

    const stats =
      dbCounts.status === 'fulfilled'
        ? dbCounts.value
        : { totalAds: 0, totalProducts: 0, totalSuppliers: 0 };

    return res.json({
      success: true,
      scheduler: schedulerData.scheduler || {},
      nextRuns:  schedulerData.nextRuns  || {},
      stats,
      environment: {
        autoScraperEnabled: process.env.AUTO_SCRAPER_ENABLED === 'true',
      },
    });
  } catch (err) {
    return res.status(502).json({ success: false, error: err.message });
  }
});

// POST /api/scraper/trigger
router.post('/trigger', async (req, res) => {
  try {
    const scraper = req.body.scraper || 'facebookAds';

    if (!VALID_SCRAPERS.includes(scraper)) {
      return res.status(400).json({
        success: false,
        error:   `Unknown scraper. Valid options: ${VALID_SCRAPERS.join(', ')}`,
      });
    }

    if (scraper === 'facebookAds') {
      const resData = await axios.post(
        `${SOCKET_BASE}/internal/run-fb-job`,
        {},
        { headers: { 'x-internal-secret': SOCKET_SECRET }, timeout: 10000 }
      );
      return res.json(resData.data);
    }

    return res.json({
      success: true,
      message: `${scraper} scrape queued`,
    });
  } catch (err) {
    console.error('[POST /api/scraper/trigger]', err.message);
    return res.status(502).json({ success: false, error: err.message });
  }
});

export default router;
