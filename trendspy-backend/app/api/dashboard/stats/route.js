import { connectDB } from '@/lib/db';
import { Product, ScrapedAd } from '@/models/index';

const WINDOW_DAYS = 7;

export async function GET() {
  try {
    await connectDB();

    const sevenDaysAgo = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const today        = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow     = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalProducts,
      totalAds,
      topWinners,
      trendingCategories,
      cityDemand,
      recentAdsToday,
    ] = await Promise.all([
      Product.countDocuments(),

      ScrapedAd.countDocuments({ scrapedAt: { $gte: sevenDaysAgo } }),

      Product.find({ winScore: { $gte: 60 } })
        .sort({ winScore: -1 })
        .limit(5)
        .select('name winScore category imageUrl')
        .lean(),

      ScrapedAd.aggregate([
        { $match: { scrapedAt: { $gte: sevenDaysAgo }, category: { $ne: null } } },
        { $group: { _id: '$category', count: { $sum: 1 }, advertisers: { $addToSet: '$advertiserName' } } },
        { $addFields: { advCount: { $size: '$advertisers' } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]),

      ScrapedAd.aggregate([
        { $match: { scrapedAt: { $gte: sevenDaysAgo }, city: { $ne: null, $exists: true } } },
        { $group: { _id: '$city', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]),

      ScrapedAd.countDocuments({ scrapedAt: { $gte: today, $lt: tomorrow } }),
    ]);

    // AlertLog is optional — seeded apps may not have it yet
    let hotAlertsToday = 0;
    try {
      const { AlertLog } = await import('@/models/index');
      hotAlertsToday = await AlertLog.countDocuments({
        sentAt: { $gte: today, $lt: tomorrow },
      });
    } catch {
      // AlertLog model not available — leave as 0
    }

    return Response.json({
      success: true,
      data: {
        totalProducts,
        totalAds,
        hotAlertsToday,
        recentAdsToday,
        topWinners: topWinners.map((p) => ({
          id:       p._id,
          name:     p.name,
          winScore: p.winScore,
          category: p.category,
        })),
        trendingCategories: trendingCategories.map((c) => ({
          name:        c._id || 'Uncategorized',
          count:       c.count,
          advertisers: c.advCount,
        })),
        cityDemand: cityDemand.map((c) => ({
          city:  c._id || 'Unknown',
          count: c.count,
        })),
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('[GET /api/dashboard/stats]', err.message);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
