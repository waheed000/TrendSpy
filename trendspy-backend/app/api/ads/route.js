import { connectDB } from '@/lib/db';
import { ScrapedAd } from '@/models/index';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category    = searchParams.get('category');
    const city        = searchParams.get('city');
    const creative    = searchParams.get('creative');
    const minDuration = parseInt(searchParams.get('minDuration') || '0', 10);
    const lastFetch   = searchParams.get('lastFetch');
    const page        = Math.max(1, parseInt(searchParams.get('page')  || '1', 10));
    const limit       = Math.min(100, parseInt(searchParams.get('limit') || '30', 10));
    const skip        = (page - 1) * limit;

    const filter = { isActive: true };

    if (category && category !== 'All') filter.category = category;
    if (city     && city     !== 'All') filter.city = city;
    if (creative && creative !== 'All') filter.creativeType = creative;
    if (minDuration > 0)               filter.daysRunning = { $gte: minDuration };
    if (lastFetch)                     filter.scrapedAt   = { $gt: new Date(lastFetch) };

    const [ads, total] = await Promise.all([
      ScrapedAd.find(filter)
        .sort({ daysRunning: -1, scrapedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ScrapedAd.countDocuments(filter),
    ]);

    const normalized = ads.map((ad) => ({
      id:           ad._id,
      adId:         ad.adId,
      headline:     ad.headline     || 'Untitled Ad',
      description:  ad.description  || '',
      creative:     ad.creativeType || 'image',
      platform:     ad.platform     || 'facebook',
      spend:        capitalize(ad.spendLevel || 'low'),
      duration:     ad.daysRunning  || 0,
      city:         ad.city         || 'Pakistan',
      category:     ad.category     || 'General',
      advertiser:   ad.advertiserName || '',
      imageUrl:     ad.imageUrl      || null,
      scrapedAt:    ad.scrapedAt,
      competitors:  0,
    }));

    return Response.json({
      success: true,
      data: { ads: normalized, total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('[GET /api/ads]', err);
    return Response.json({ success: false, error: 'Failed to fetch ads' }, { status: 500 });
  }
}

function capitalize(str) {
  if (!str) return 'Low';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
