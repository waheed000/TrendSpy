import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from '../server/db.js';
import { Supplier } from '../models/index.js';
import { withAuth, authMiddleware } from '../middleware/auth.js';
import { scrapeSuppliers } from '../scrapers/supplierScraper.js';

const router = express.Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT_PATH = path.resolve(__dirname, '../scripts/runSupplierScraper.js');
const BACKEND_DIR = path.resolve(__dirname, '..');

const CITIES = ['Lahore', 'Karachi', 'Islamabad', 'Faisalabad', 'Rawalpindi', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala'];
const CATEGORIES = ['Electronics', 'Fashion', 'Beauty', 'Home', 'Sports', 'Grocery'];
const VALID_CITIES = [
  'Lahore', 'Karachi', 'Islamabad', 'Faisalabad', 'Rawalpindi',
  'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
];
const VALID_CATEGORIES = [
  'Fashion', 'Electronics', 'Beauty', 'Home',
  'Grocery', 'Toys', 'Sports', 'Books', 'General',
];
const MAJOR_CITIES = ['Lahore', 'Karachi', 'Islamabad'];

function checkAdmin(req) {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) return false;
  return req.headers['x-admin-key'] === adminKey;
}

function sortPriority(s) {
  if (s.verificationStatus === 'verified' || s.verified) return 0;
  if (s.sourceType === 'user' && s.verificationStatus === 'pending')  return 1;
  return 2;
}

// GET /api/suppliers
router.get('/', async (req, res) => {
  try {
    await connectDB();

    const city      = req.query.city;
    const category  = req.query.category;
    const search    = req.query.search;
    const page      = Math.max(1, parseInt(req.query.page  || '1', 10));
    const limit     = Math.min(100, parseInt(req.query.limit || '20', 10));
    const skip      = (page - 1) * limit;
    const isAdmin   = checkAdmin(req);

    const filter = {};
    if (city     && city     !== 'All') filter.city     = city;
    if (category && category !== 'All') filter.category = category;
    if (search) filter.$text = { $search: search };

    if (!isAdmin) filter.verificationStatus = { $ne: 'rejected' };

    const [rawSuppliers, total] = await Promise.all([
      Supplier.find(filter).sort({ verified: -1, rating: -1 }).skip(skip).limit(limit).lean(),
      Supplier.countDocuments(filter),
    ]);

    const suppliers = rawSuppliers
      .sort((a, b) => sortPriority(a) - sortPriority(b) || (b.rating || 0) - (a.rating || 0))
      .map((s) => ({
        ...s,
        badge: s.verificationStatus === 'verified' || s.verified
          ? 'verified'
          : s.sourceType === 'user'
          ? 'community'
          : 'unverified',
      }));

    return res.json({
      success: true,
      data: {
        suppliers,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    console.error('[GET /api/suppliers]', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch suppliers' });
  }
});

// POST /api/suppliers (Admin creation)
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (!checkAdmin(req) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    await connectDB();
    const { name, city, category, phone, email, website, address, products, rating, verified, sourceUrl } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Supplier name is required' });
    }

    const existing = await Supplier.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') }, city });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Supplier already exists' });
    }

    const supplier = await Supplier.create({
      name, city, category, phone, email, website, address,
      products:           products || [],
      rating:             rating   || 0,
      verified:           verified || false,
      sourceUrl,
      sourceType:         'admin',
      verificationStatus: verified ? 'verified' : 'pending',
      addedBy:            req.user._id,
    });

    return res.status(201).json({ success: true, data: { supplier } });
  } catch (err) {
    console.error('[POST /api/suppliers]', err);
    return res.status(500).json({ success: false, error: 'Failed to create supplier' });
  }
});

// POST /api/suppliers/add (User submission)
router.post('/add', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    const { name, city, category, phone, website, address } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ success: false, error: 'Supplier name is required' });
    }
    if (name.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Name must be at least 2 characters' });
    }
    if (city && !VALID_CITIES.includes(city)) {
      return res.status(400).json({ success: false, error: `Invalid city. Choose from: ${VALID_CITIES.join(', ')}` });
    }
    if (category && !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ success: false, error: `Invalid category` });
    }

    const existing = await Supplier.findOne({
      name: { $regex: new RegExp(`^${name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      ...(city ? { city } : {}),
    });

    if (existing) {
      return res.status(409).json({ success: false, error: 'A supplier with this name already exists in the system.' });
    }

    const supplier = await Supplier.create({
      name:               name.trim(),
      city:               city     || null,
      category:           category || 'General',
      phone:              phone    || null,
      website:            website  || null,
      address:            address  || null,
      products:           [],
      rating:             0,
      verified:           false,
      sourceUrl:          'user-submitted',
      sourceType:         'user',
      verificationStatus: 'pending',
      addedBy:            req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your supplier has been submitted and will be reviewed within 24–48 hours.',
      data: {
        supplier: {
          _id:                supplier._id,
          name:               supplier.name,
          city:               supplier.city,
          category:           supplier.category,
          verificationStatus: supplier.verificationStatus,
        },
      },
    });
  } catch (err) {
    console.error('[POST /api/suppliers/add]', err);
    return res.status(500).json({ success: false, error: 'Failed to submit supplier' });
  }
});

// GET /api/suppliers/match
router.get('/match', async (req, res) => {
  try {
    await connectDB();

    const category    = req.query.category    || '';
    const city        = req.query.city        || '';
    const productName = req.query.productName || '';

    const baseQuery = { verificationStatus: { $ne: 'rejected' } };
    if (category) baseQuery.category = category;

    const cityQuery = city && MAJOR_CITIES.includes(city) ? { ...baseQuery, city } : baseQuery;

    let suppliers = await Supplier.find(cityQuery)
      .sort({ verificationStatus: -1, rating: -1 })
      .limit(5)
      .lean();

    let fallbackUsed  = false;
    let fallbackMsg   = null;

    if (suppliers.length === 0 && city) {
      suppliers = await Supplier.find({
        ...baseQuery,
        city: { $in: MAJOR_CITIES },
      })
        .sort({ verificationStatus: -1, rating: -1 })
        .limit(5)
        .lean();
      fallbackUsed = true;
      fallbackMsg  = `No suppliers found in ${city} — showing nearby city suppliers.`;
    }

    if (suppliers.length === 0 && category) {
      suppliers = await Supplier.find({ category })
        .sort({ verificationStatus: -1, rating: -1 })
        .limit(5)
        .lean();
      fallbackUsed = true;
      fallbackMsg  = 'Showing all available suppliers for this category.';
    }

    return res.json({
      success:      true,
      suppliers:    suppliers.map((s) => ({
        _id:                String(s._id),
        name:               s.name,
        city:               s.city,
        category:           s.category,
        phone:              s.phone,
        email:              s.email,
        website:            s.website,
        address:            s.address,
        products:           s.products,
        rating:             s.rating,
        verified:           s.verified,
        verificationStatus: s.verificationStatus,
      })),
      fallbackUsed,
      fallbackMsg,
    });
  } catch (err) {
    console.error('[GET /api/suppliers/match]', err.message);
    return res.status(500).json({ success: false, error: err.message, suppliers: [] });
  }
});

// GET /api/suppliers/scrape (Admin info)
router.get('/scrape', async (req, res) => {
  if (!checkAdmin(req)) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  return res.json({
    success: true,
    info: 'POST to this endpoint to trigger scraping. Full run takes 10–20 minutes and runs in the background.',
    cities: CITIES,
    categories: CATEGORIES,
  });
});

// POST /api/suppliers/scrape (Trigger background scraping)
router.post('/scrape', async (req, res) => {
  if (!checkAdmin(req)) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const cities     = Array.isArray(req.body.cities)     ? req.body.cities     : null;
  const categories = Array.isArray(req.body.categories) ? req.body.categories : null;

  const args = ['--input-type=module', SCRIPT_PATH];
  if (cities)     args.push('--cities',     cities.join(','));
  if (categories) args.push('--categories', categories.join(','));

  const child = spawn(process.execPath, args, {
    cwd: BACKEND_DIR,
    detached: true,
    stdio: 'ignore',
    env: { ...process.env },
  });

  child.unref();
  console.log(`[/api/suppliers/scrape] Spawned scraper PID=${child.pid}`);

  return res.json({
    success: true,
    message: 'Supplier scraping started in the background. Check server logs for progress.',
    pid: child.pid,
    cities:     cities     || CITIES,
    categories: categories || CATEGORIES,
  });
});

// POST /api/suppliers/discover (Inline scraper)
router.post('/discover', authMiddleware, async (req, res) => {
  try {
    if (!checkAdmin(req) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    if (process.env.SUPPLIER_SCRAPER_ENABLED !== 'true') {
      return res.status(503).json({ success: false, error: 'Supplier scraper is disabled. Set SUPPLIER_SCRAPER_ENABLED=true' });
    }

    await connectDB();
    const cities     = req.body.cities     || ['Lahore', 'Karachi', 'Islamabad'];
    const categories = req.body.categories || ['Electronics', 'Fashion', 'Beauty'];

    const { saved, skipped, errors } = await scrapeSuppliers({ cities, categories });

    return res.json({
      success: true,
      data: { saved, skipped, errors: errors.length, errorDetails: errors.slice(0, 5) },
    });
  } catch (err) {
    console.error('[POST /api/suppliers/discover]', err);
    return res.status(500).json({ success: false, error: err.message || 'Supplier discovery failed' });
  }
});

export default router;
