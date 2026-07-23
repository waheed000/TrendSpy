import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getTrendingVideos, searchVideos, fetchAccessToken, getTokenStatus } from '../services/tiktokOfficialService.js';

const router = express.Router();

// In-memory rate limiter: userId → { count, windowStart }
const rateLimits = new Map();
const WINDOW_MS  = 60 * 60 * 1000; // 1 hour
const MAX_REQ    = 50;

function checkRateLimit(userId) {
  const now    = Date.now();
  const record = rateLimits.get(userId);

  if (!record || now - record.windowStart > WINDOW_MS) {
    rateLimits.set(userId, { count: 1, windowStart: now });
    return { allowed: true, remaining: MAX_REQ - 1 };
  }

  if (record.count >= MAX_REQ) {
    const resetIn = Math.ceil((record.windowStart + WINDOW_MS - now) / 1000);
    return { allowed: false, remaining: 0, resetIn };
  }

  record.count++;
  return { allowed: true, remaining: MAX_REQ - record.count };
}

function isAdmin(req) {
  const key = req.headers['x-admin-key'];
  return key && key === process.env.ADMIN_API_KEY;
}

// GET /api/tiktok/trending
router.get('/trending', authMiddleware, async (req, res) => {
  const rl = checkRateLimit(String(req.user._id));
  if (!rl.allowed) {
    res.setHeader('X-RateLimit-Remaining', '0');
    return res.status(429).json({ success: false, error: `Rate limit exceeded. Try again in ${rl.resetIn}s.` });
  }

  const category = req.query.category || undefined;
  const limit    = Math.min(parseInt(req.query.limit || '20', 10), 50);

  try {
    const videos = await getTrendingVideos({ category, limit });

    res.setHeader('X-RateLimit-Remaining', String(rl.remaining));
    return res.json({
      success: true,
      count:   videos.length,
      category: category || 'all',
      videos,
      sandbox: process.env.TIKTOK_SANDBOX_MODE !== 'false',
      rateLimit: { remaining: rl.remaining, windowHours: 1 },
    });
  } catch (err) {
    console.error('[GET /api/tiktok/trending]', err.message);

    if (err.message.includes('CLIENT_KEY') || err.message.includes('token')) {
      return res.status(503).json({
        success: false,
        error: 'TikTok API not configured. Set TIKTOK_CLIENT_KEY and TIKTOK_CLIENT_SECRET in secrets.',
      });
    }

    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/tiktok/search
router.post('/search', authMiddleware, async (req, res) => {
  const { query, hashtag, limit = 20 } = req.body;

  if (!query && !hashtag) {
    return res.status(400).json({ success: false, error: 'Provide at least one of: query, hashtag' });
  }

  const clampedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 50);

  try {
    const videos = await searchVideos({ query, hashtag, limit: clampedLimit });

    const totalViews    = videos.reduce((s, v) => s + (v.viewCount    || 0), 0);
    const totalLikes    = videos.reduce((s, v) => s + (v.likeCount    || 0), 0);
    const totalShares   = videos.reduce((s, v) => s + (v.shareCount   || 0), 0);
    const totalComments = videos.reduce((s, v) => s + (v.commentCount || 0), 0);
    const avgViews      = videos.length ? Math.round(totalViews / videos.length) : 0;

    const relatedHashtags = [
      ...new Set(videos.flatMap((v) => v.hashtags || []))
    ]
      .filter((h) => h && h.length > 2)
      .slice(0, 20);

    return res.json({
      success: true,
      query:   query || null,
      hashtag: hashtag || null,
      count:   videos.length,
      metrics: { totalViews, totalLikes, totalShares, totalComments, avgViews },
      relatedHashtags,
      videos,
      sandbox: process.env.TIKTOK_SANDBOX_MODE !== 'false',
    });
  } catch (err) {
    console.error('[POST /api/tiktok/search]', err.message);

    if (err.message.includes('CLIENT_KEY') || err.message.includes('token')) {
      return res.status(503).json({
        success: false,
        error: 'TikTok API not configured. Set TIKTOK_CLIENT_KEY and TIKTOK_CLIENT_SECRET in secrets.',
      });
    }

    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/tiktok/auth — token status (admin only)
router.get('/auth', async (req, res) => {
  if (!isAdmin(req)) {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }

  const status = getTokenStatus();
  return res.json({ success: true, ...status });
});

// POST /api/tiktok/auth — force token refresh (admin only)
router.post('/auth', async (req, res) => {
  if (!isAdmin(req)) {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }

  try {
    const { expiresIn } = await fetchAccessToken();
    return res.json({
      success:      true,
      message:      'Access token refreshed successfully.',
      expiresIn,
      sandboxMode:  process.env.TIKTOK_SANDBOX_MODE !== 'false',
    });
  } catch (err) {
    console.error('[POST /api/tiktok/auth]', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
