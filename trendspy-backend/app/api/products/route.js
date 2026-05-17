import { connectDB } from '@/lib/db';
import { Product } from '@/models/index';
import { seedIfEmpty } from '@/lib/seed';
import { isValidCity, isValidCategory } from '@/lib/validators';

const SORT_OPTIONS = {
  winScore: { winScore: -1 },
  trending: { trend: 1, winScore: -1 }, // 'rising' sorts before others alphabetically
  newest: { createdAt: -1 },
  mostAds: { activeAds: -1 },
};

const PROJECTION = {
  name: 1,
  slug: 1,
  imageUrl: 1,
  winScore: 1,
  priceMin: 1,
  priceMax: 1,
  trend: 1,
  platforms: 1,
  cities: 1,
  category: 1,
  isWinning: 1,
  darazOrders: 1,
  activeAds: 1,
  tiktokViews: 1,
  createdAt: 1,
};

export async function GET(request) {
  try {
    await connectDB();
    await seedIfEmpty(); // no-op if products already exist

    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const category = searchParams.get('category');
    const minScore = parseInt(searchParams.get('minScore') || '0', 10);
    const sortBy = searchParams.get('sortBy') || 'winScore';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    // Build filter
    const filter = {};
    if (city && isValidCity(city)) filter.cities = city;
    if (category && isValidCategory(category)) filter.category = category;
    if (minScore > 0) filter.winScore = { $gte: minScore };

    const sort = SORT_OPTIONS[sortBy] || SORT_OPTIONS.winScore;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(filter, PROJECTION).sort(sort).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    return Response.json({
      success: true,
      data: {
        products,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Products list error:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
