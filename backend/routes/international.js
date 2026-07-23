import express from 'express';
import { connectDB } from '../server/db.js';
import { Product } from '../models/index.js';
import ShopifyProduct from '../models/ShopifyProduct.js';
import GoogleShoppingProduct from '../models/GoogleShoppingProduct.js';
import { getOpportunities } from '../services/opportunityService.js';

const router = express.Router();

// GET /api/international/global
router.get('/global', async (req, res) => {
  try {
    await connectDB();

    const category = req.query.category;
    const sortBy   = req.query.sortBy || 'popularity';
    const page     = Math.max(1,   parseInt(req.query.page  || '1',  10));
    const limit    = Math.min(100, parseInt(req.query.limit || '30', 10));
    const skip     = (page - 1) * limit;

    const filter = {};
    if (category && category !== 'All') filter.category = category;

    const sortMap = {
      price:      { priceUSD: 1 },
      popularity: { reviewCount: -1 },
      rating:     { rating: -1 },
      newest:     { lastSeenAt: -1 },
    };
    const sort = sortMap[sortBy] || sortMap.popularity;

    const [shopifyDocs, googleDocs, shopifyTotal, googleTotal] = await Promise.all([
      ShopifyProduct.find(filter).sort(sort).skip(skip).limit(Math.ceil(limit / 2)).lean(),
      GoogleShoppingProduct.find(filter).sort(sort).skip(skip).limit(Math.floor(limit / 2)).lean(),
      ShopifyProduct.countDocuments(filter),
      GoogleShoppingProduct.countDocuments(filter),
    ]);

    const shopify = shopifyDocs.map((p) => ({
      id:           p._id,
      source:       'shopify',
      name:         p.productTitle,
      priceUSD:     p.priceUSD,
      pricePKR:     p.pricePKR,
      imageUrl:     p.imageUrl,
      storeName:    p.storeName,
      storeUrl:     p.storeUrl,
      productUrl:   p.productUrl,
      rating:       p.rating,
      reviewCount:  p.reviewCount,
      category:     p.category,
      lastSeenAt:   p.lastSeenAt,
    }));

    const google = googleDocs.map((p) => ({
      id:              p._id,
      source:          'google',
      name:            p.productName,
      priceUSD:        p.priceUSD,
      pricePKR:        p.pricePKR,
      imageUrl:        p.imageUrl,
      storeName:       p.storeName,
      storeUrl:        p.storeUrl,
      productUrl:      p.productUrl,
      rating:          p.rating,
      reviewCount:     p.reviewCount,
      shipsToPakistan: p.shipsToPakistan,
      category:        p.category,
      lastSeenAt:      p.lastSeenAt,
    }));

    const total = shopifyTotal + googleTotal;

    return res.json({
      success: true,
      data: {
        products: [...shopify, ...google],
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        sources: { shopify: shopifyTotal, google: googleTotal },
      },
    });
  } catch (err) {
    console.error('[GET /api/international/global]', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch global products' });
  }
});

// GET /api/international/local
router.get('/local', async (req, res) => {
  try {
    await connectDB();

    const city     = req.query.city;
    const category = req.query.category;
    const minScore = parseInt(req.query.minScore || '0', 10);
    const sortBy   = req.query.sortBy || 'winScore';
    const page     = Math.max(1,   parseInt(req.query.page  || '1',  10));
    const limit    = Math.min(100, parseInt(req.query.limit || '20', 10));
    const skip     = (page - 1) * limit;

    const filter = { isActive: true };
    if (city     && city     !== 'All') filter.cities    = city;
    if (category && category !== 'All') filter.category  = category;
    if (minScore > 0)                   filter.winScore   = { $gte: minScore };

    const sortMap = {
      winScore:    { winScore: -1 },
      daraz:       { darazOrders: -1 },
      tiktok:      { tiktokViews: -1 },
      price:       { priceMin: 1 },
      newest:      { createdAt: -1 },
    };
    const sort = sortMap[sortBy] || sortMap.winScore;

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit)
        .select('name category cities priceMin priceMax winScore darazOrders tiktokViews olxViews activeAds googleTrendSpike imageUrl platform')
        .lean(),
      Product.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: {
        products,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('[GET /api/international/local]', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch local products' });
  }
});

// GET /api/international/opportunities
router.get('/opportunities', async (req, res) => {
  try {
    await connectDB();

    const category = req.query.category;
    const limit    = Math.min(50, parseInt(req.query.limit || '20', 10));

    const opportunities = await getOpportunities(limit, category);

    return res.json({
      success: true,
      data: {
        opportunities,
        total: opportunities.length,
      },
    });
  } catch (err) {
    console.error('[GET /api/international/opportunities]', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch opportunities' });
  }
});

export default router;
