import { Product, TrendScore } from '@/models/index';

/**
 * Seed the database with realistic Pakistani e-commerce products.
 * This is a no-op if the products collection already has documents.
 */
export async function seedIfEmpty() {
  const count = await Product.countDocuments();
  if (count > 0) return;

  console.log('🌱 Seeding database with sample products...');

  const products = await Product.insertMany([
    {
      name: 'Electric Heater',
      category: 'Home',
      imageUrl: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400',
      platforms: ['daraz', 'olx'],
      cities: ['Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad'],
      priceMin: 3500,
      priceMax: 8500,
      winScore: 92,
      darazOrders: 14200,
      darazRating: 4.3,
      olxViews: 182000,
      olxListings: 340,
      activeAds: 28,
      tiktokViews: 3200000,
      tiktokHashtagVolume: 840000,
      googleTrendSpike: 78,
      seasonalRelevance: 95,
      trend: 'rising',
      competitorCount: 42,
    },
    {
      name: 'Khaddar Suit',
      category: 'Fashion',
      imageUrl: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400',
      platforms: ['daraz', 'tiktok', 'instagram'],
      cities: ['Karachi', 'Lahore', 'Multan', 'Faisalabad'],
      priceMin: 1200,
      priceMax: 4500,
      winScore: 88,
      darazOrders: 22100,
      darazRating: 4.6,
      olxViews: 94000,
      olxListings: 210,
      activeAds: 54,
      tiktokViews: 8900000,
      tiktokHashtagVolume: 2100000,
      googleTrendSpike: 45,
      seasonalRelevance: 80,
      trend: 'rising',
      competitorCount: 120,
    },
    {
      name: 'Smart Watch Pro',
      category: 'Electronics',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
      platforms: ['daraz', 'tiktok', 'facebook'],
      cities: ['Islamabad', 'Karachi', 'Lahore'],
      priceMin: 2800,
      priceMax: 6500,
      winScore: 85,
      darazOrders: 9800,
      darazRating: 4.1,
      olxViews: 126000,
      olxListings: 180,
      activeAds: 67,
      tiktokViews: 5600000,
      tiktokHashtagVolume: 980000,
      googleTrendSpike: 62,
      seasonalRelevance: 60,
      trend: 'rising',
      competitorCount: 85,
    },
    {
      name: 'Skin Brightening Serum',
      category: 'Beauty',
      imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',
      platforms: ['daraz', 'instagram', 'tiktok'],
      cities: ['Karachi', 'Lahore', 'Islamabad', 'Faisalabad', 'Rawalpindi'],
      priceMin: 800,
      priceMax: 2200,
      winScore: 79,
      darazOrders: 18400,
      darazRating: 4.4,
      olxViews: 48000,
      olxListings: 95,
      activeAds: 112,
      tiktokViews: 12000000,
      tiktokHashtagVolume: 4500000,
      googleTrendSpike: 34,
      seasonalRelevance: 55,
      trend: 'stable',
      competitorCount: 210,
    },
    {
      name: 'Air Fryer',
      category: 'Home',
      imageUrl: 'https://images.unsplash.com/photo-1648510823789-40bcd7a52c36?w=400',
      platforms: ['daraz', 'facebook'],
      cities: ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi'],
      priceMin: 7500,
      priceMax: 18000,
      winScore: 76,
      darazOrders: 7600,
      darazRating: 4.5,
      olxViews: 72000,
      olxListings: 145,
      activeAds: 38,
      tiktokViews: 2800000,
      tiktokHashtagVolume: 680000,
      googleTrendSpike: 28,
      seasonalRelevance: 50,
      trend: 'stable',
      competitorCount: 56,
    },
    {
      name: 'Kids Learning Tablet',
      category: 'Toys',
      imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400',
      platforms: ['daraz', 'facebook', 'olx'],
      cities: ['Karachi', 'Lahore', 'Islamabad', 'Faisalabad', 'Peshawar'],
      priceMin: 3200,
      priceMax: 7800,
      winScore: 72,
      darazOrders: 5400,
      darazRating: 4.2,
      olxViews: 41000,
      olxListings: 88,
      activeAds: 24,
      tiktokViews: 1800000,
      tiktokHashtagVolume: 320000,
      googleTrendSpike: 18,
      seasonalRelevance: 65,
      trend: 'rising',
      competitorCount: 34,
    },
    {
      name: 'Yoga Mat Premium',
      category: 'Sports',
      imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400',
      platforms: ['daraz', 'instagram'],
      cities: ['Islamabad', 'Karachi', 'Lahore'],
      priceMin: 1500,
      priceMax: 4000,
      winScore: 65,
      darazOrders: 4100,
      darazRating: 4.0,
      olxViews: 28000,
      olxListings: 62,
      activeAds: 18,
      tiktokViews: 920000,
      tiktokHashtagVolume: 210000,
      googleTrendSpike: 22,
      seasonalRelevance: 40,
      trend: 'stable',
      competitorCount: 28,
    },
    {
      name: 'Neck Massager',
      category: 'Home',
      imageUrl: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=400',
      platforms: ['daraz', 'tiktok', 'facebook'],
      cities: ['Karachi', 'Lahore', 'Rawalpindi', 'Multan'],
      priceMin: 2200,
      priceMax: 5500,
      winScore: 81,
      darazOrders: 8900,
      darazRating: 4.3,
      olxViews: 63000,
      olxListings: 124,
      activeAds: 45,
      tiktokViews: 4200000,
      tiktokHashtagVolume: 890000,
      googleTrendSpike: 41,
      seasonalRelevance: 45,
      trend: 'rising',
      competitorCount: 67,
    },
  ]);

  // Seed 30 days of trend data for each product
  const now = new Date();
  const trendDocs = [];

  for (const product of products) {
    let baseScore = product.winScore;
    for (let d = 29; d >= 0; d--) {
      const date = new Date(now);
      date.setDate(date.getDate() - d);
      date.setHours(0, 0, 0, 0);

      // Simulate slight daily variation
      const jitter = Math.floor(Math.random() * 10) - 5;
      const dailyScore = Math.min(100, Math.max(0, baseScore + jitter));
      baseScore = dailyScore;

      trendDocs.push({
        productId: product._id,
        productSlug: product.slug,
        date,
        searchVolume: Math.round(dailyScore * 0.9 + Math.random() * 10),
        dailyScore,
        weekOverWeekChange: parseFloat((Math.random() * 20 - 5).toFixed(1)),
        monthOverMonthChange: parseFloat((Math.random() * 30 - 5).toFixed(1)),
      });
    }
  }

  await TrendScore.insertMany(trendDocs);
  console.log(`✅ Seeded ${products.length} products and ${trendDocs.length} trend data points`);
}
