import express from 'express';
import { connectDB } from '../server/db.js';
import { Alert } from '../models/index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

const VALID_CITIES = ['Lahore', 'Karachi', 'Islamabad', 'Faisalabad', 'Rawalpindi', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala'];
const VALID_CATEGORIES = ['Fashion', 'Electronics', 'Beauty', 'Home', 'Grocery', 'Toys', 'Sports', 'Books'];
const VALID_CHANNELS = ['email', 'whatsapp', 'both'];

const RATE_LIMIT_MAP = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

function isRateLimited(userId) {
  const now = Date.now();
  const key = userId.toString();
  const entry = RATE_LIMIT_MAP.get(key);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    RATE_LIMIT_MAP.set(key, { count: 1, windowStart: now });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) return true;

  entry.count++;
  return false;
}

// GET /api/alerts
router.get('/', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    const alerts = await Alert.findByUser(req.user._id);
    return res.json({ success: true, data: { alerts } });
  } catch (err) {
    console.error('[GET /api/alerts]', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch alerts' });
  }
});

// POST /api/alerts
router.post('/', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    const { city, category, minWinScore, channel } = req.body;

    if (city && !VALID_CITIES.includes(city)) {
      return res.status(400).json({ success: false, error: `Invalid city. Must be one of: ${VALID_CITIES.join(', ')}` });
    }

    if (category && !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ success: false, error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` });
    }

    if (minWinScore !== undefined && (minWinScore < 0 || minWinScore > 100)) {
      return res.status(400).json({ success: false, error: 'minWinScore must be between 0 and 100' });
    }

    if (channel && !VALID_CHANNELS.includes(channel)) {
      return res.status(400).json({ success: false, error: `Invalid channel. Must be one of: ${VALID_CHANNELS.join(', ')}` });
    }

    if ((channel === 'whatsapp' || channel === 'both') && !req.user.phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'A phone number is required for WhatsApp alerts. Update your profile first.',
      });
    }

    if (isRateLimited(req.user._id)) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded: maximum 5 alerts per hour.',
      });
    }

    const alert = await Alert.create({
      userId: req.user._id,
      city: city || null,
      category: category || null,
      minWinScore: minWinScore ?? 75,
      channel: channel || 'email',
    });

    return res.status(201).json({ success: true, data: { alert } });
  } catch (err) {
    console.error('[POST /api/alerts]', err);
    return res.status(500).json({ success: false, error: 'Failed to create alert' });
  }
});

// PUT /api/alerts/:id (Toggle alert active status)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    await connectDB();

    const { id } = req.params;
    const alert = await Alert.findById(id);

    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }

    if (alert.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this alert' });
    }

    alert.isActive = !alert.isActive;
    await alert.save();

    return res.json({
      success: true,
      data: { alert },
      message: `Alert ${alert.isActive ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (err) {
    console.error('[PUT /api/alerts/:id]', err);
    return res.status(500).json({ success: false, error: 'Failed to update alert' });
  }
});

// DELETE /api/alerts/:id (Delete alert)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await connectDB();

    const { id } = req.params;
    const alert = await Alert.findById(id);

    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }

    if (alert.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this alert' });
    }

    await Alert.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Alert deleted successfully' });
  } catch (err) {
    console.error('[DELETE /api/alerts/:id]', err);
    return res.status(500).json({ success: false, error: 'Failed to delete alert' });
  }
});

export default router;
