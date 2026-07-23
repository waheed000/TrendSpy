import express from 'express';
import { connectDB } from '../server/db.js';
import { authMiddleware } from '../middleware/auth.js';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../services/notificationService.js';

const router = express.Router();

// GET /api/notifications
router.get('/', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    const limit  = Math.min(parseInt(req.query.limit  || '20', 10), 100);
    const offset = Math.max(parseInt(req.query.offset || '0',  10), 0);

    const [notifications, unread] = await Promise.all([
      getNotifications(req.user._id, limit, offset),
      getUnreadCount(req.user._id),
    ]);

    return res.json({ success: true, data: { notifications, unread, limit, offset } });
  } catch (error) {
    console.error('[GET /api/notifications]', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
  }
});

// GET /api/notifications/count
router.get('/count', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    const unread = await getUnreadCount(req.user._id);
    return res.json({ success: true, unread });
  } catch (error) {
    console.error('[GET /api/notifications/count]', error);
    return res.status(500).json({ success: false, error: 'Failed to count notifications' });
  }
});

// PUT /api/notifications
router.put('/', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    const { notificationId } = req.body;

    if (!notificationId) {
      return res.status(400).json({ success: false, error: 'notificationId required' });
    }

    if (notificationId === 'all') {
      await markAllAsRead(req.user._id);
    } else {
      await markAsRead(notificationId, req.user._id);
    }

    const unread = await getUnreadCount(req.user._id);
    return res.json({ success: true, unread });
  } catch (error) {
    console.error('[PUT /api/notifications]', error);
    return res.status(500).json({ success: false, error: 'Failed to update notifications' });
  }
});

// DELETE /api/notifications
router.delete('/', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    const notificationId = req.query.id;

    if (!notificationId) {
      return res.status(400).json({ success: false, error: 'id query param required' });
    }

    await deleteNotification(notificationId, req.user._id);
    return res.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/notifications]', error);
    return res.status(500).json({ success: false, error: 'Failed to delete notification' });
  }
});

export default router;
