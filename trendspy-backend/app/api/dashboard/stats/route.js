import { connectDB } from '@/lib/db';
import { ScrapedAd } from '@/models/index';
import { getAdBasedWinners } from '@/services/adWinningService';

const WINDOW_DAYS = 7;

export async function GET() {
  try {
    await connectDB();

    const sevenDaysAgo = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const today        = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow     = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalAds,
      topWinnersRaw,
      trendingCategories,
      cityDemand,
      recentAdsToday,
    ] = await Promise.all([
      ScrapedAd.countDocuments({ scrapedAt: { $gte: sevenDaysAgo } }),

      // Real-time winners from live ad data — same source as Product Hunt page
      getAdBasedWinners(5),

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

    // Total unique products is the number of ad-based winning categories
    const totalProducts = topWinnersRaw.length;

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
        topWinners: topWinnersRaw.map((p) => ({
          id:             p.id       || p.category,
          name:           p.name,
          winScore:       p.winScore,
          category:       p.category,
          advertiserCount: p.advertiserCount,
          totalAds:       p.totalAds,
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
