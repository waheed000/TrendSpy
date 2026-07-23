import express from 'express';
import { connectDB } from '../server/db.js';
import { getAdBasedWinners } from '../services/adWinningService.js';

const router = express.Router();

// GET /api/export/report
router.get('/report', async (req, res) => {
  try {
    await connectDB();
    const season = req.query.season || 'general';
    const city   = req.query.city   || '';

    const winners = await getAdBasedWinners(50, city, season);

    const header = 'Rank,Product Name,Win Score,Advertisers,Total Ads,Days Running,Season,City\n';
    const rows   = winners.map((p, i) =>
      `${i + 1},"${(p.name || '').replace(/"/g, '""')}",${p.winScore || 0},${p.advertiserCount || 0},${p.totalAds || 0},${p.maxDaysRunning || 0},"${p.season || 'general'}","${city || 'All'}"`
    );
    const csv = header + rows.join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="winning-products-${Date.now()}.csv"`);
    return res.send(csv);
  } catch (err) {
    console.error('[export/report]', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
