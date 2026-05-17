import { connectDB } from '@/lib/db';
import { TrendScore, Product } from '@/models/index';
import { isValidCity } from '@/lib/validators';

const VALID_DAYS = [30, 60, 90];

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { productId } = params;
    if (!productId) {
      return Response.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const rawDays = parseInt(searchParams.get('days') || '30', 10);
    const days = VALID_DAYS.includes(rawDays) ? rawDays : 30;
    const city = searchParams.get('city');

    // Validate city if provided
    if (city && !isValidCity(city)) {
      return Response.json(
        { success: false, error: `Invalid city. Must be one of Pakistan's 10 major cities.` },
        { status: 400 }
      );
    }

    // Verify product exists
    const product = await Product.findById(productId).select('name slug').lean();
    if (!product) {
      return Response.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const trends = await TrendScore.getTrends(productId, days, city || null);

    const chartData = trends.map((t) => ({
      date: t.date.toISOString().split('T')[0],
      searchVolume: t.searchVolume,
      dailyScore: t.dailyScore,
      weekOverWeekChange: t.weekOverWeekChange,
    }));

    return Response.json({
      success: true,
      data: {
        product: { id: product._id, name: product.name, slug: product.slug },
        days,
        city: city || null,
        trends: chartData,
      },
    });
  } catch (error) {
    console.error('Trends error:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch trend data' },
      { status: 500 }
    );
  }
}
