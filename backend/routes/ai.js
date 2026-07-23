import express from 'express';
import { connectDB } from '../server/db.js';
import { Product } from '../models/index.js';
import { authMiddleware } from '../middleware/auth.js';
import { generateAdCopy, analyzeProduct, generateAdGuide } from '../services/groqService.js';

const router = express.Router();

const RATE_LIMIT_MAP = new Map();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_HOUR = 10;

function isRateLimited(userId) {
  const key = userId.toString();
  const now = Date.now();
  const entry = RATE_LIMIT_MAP.get(key);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    RATE_LIMIT_MAP.set(key, { count: 1, windowStart: now });
    return false;
  }
  if (entry.count >= MAX_PER_HOUR) return true;
  entry.count++;
  return false;
}

// POST /api/ai/adcopy
router.post('/adcopy', authMiddleware, async (req, res) => {
  try {
    const { productName, category, targetAudience } = req.body;

    if (!productName || !category) {
      return res.status(400).json({ success: false, error: 'productName and category are required' });
    }

    const adCopy = await generateAdCopy(productName, category, targetAudience);

    return res.json({
      success: true,
      data: {
        productName,
        category,
        ...adCopy,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('[POST /api/ai/adcopy]', err);
    const status = err.message?.includes('GROQ_API_KEY') ? 503 : 500;
    return res.status(status).json({ success: false, error: err.message });
  }
});

// POST /api/ai/analyze
router.post('/analyze', authMiddleware, async (req, res) => {
  try {
    if (isRateLimited(req.user._id)) {
      return res.status(429).json({ success: false, error: 'Rate limit: max 10 AI analyses per hour.' });
    }

    const { productName, productId } = req.body;

    if (!productName && !productId) {
      return res.status(400).json({ success: false, error: 'productName or productId is required' });
    }

    await connectDB();

    let product = null;
    let name = productName;

    if (productId) {
      product = await Product.findById(productId).lean();
      if (!product) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }
      name = product.name;
    }

    const productData = product || {};
    const city        = productData.cities?.[0] || req.body.city || null;

    const [analysis, adGuideResult] = await Promise.all([
      analyzeProduct(name, productData),
      generateAdGuide(name, productData, city),
    ]);

    return res.json({
      success: true,
      data: {
        productName: name,
        analysis:    { ...analysis, adGuide: adGuideResult.guide, adGuideSource: adGuideResult.source },
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('[POST /api/ai/analyze]', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
