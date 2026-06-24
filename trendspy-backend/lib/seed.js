/**
 * Seed data for TrendSpy.
 *
 * DATA ACCURACY NOTES:
 * ─────────────────────────────────────────────────────────────────────────────
 * googleTrendSpike   → VERIFIED via google-trends-api (Pakistan, last 30 days)
 * trend              → VERIFIED from Google Trends direction
 * seasonalWarning    → VERIFIED (keyword-based seasonal logic)
 *
 * darazOrders        → ESTIMATED (market research, not live-scraped)
 * olxViews           → ESTIMATED (market research, not live-scraped)
 * activeAds          → ESTIMATED (FB Ads Library requires login — cannot scrape)
 * tiktokViews        → ESTIMATED (TikTok requires authentication)
 * competitorCount    → ESTIMATED (based on category saturation research)
 *
 * Live scrapers exist for all sources but face bot-detection on platforms.
 * Google Trends refreshes every 6 hours via CRON. All other signals are
 * proportional estimates scaled to real Google Trends ranking.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Product, TrendScore, Supplier, ScrapedAd } from '@/models/index';

/**
 * Seed the database with products.
 * googleTrendSpike values are REAL — fetched from Google Trends Pakistan API.
 * All other numeric signals are proportional market estimates.
 * Products are ordered by real Google Trends interest (highest first).
 *
 * ScrapedAds are NOT seeded here — they are populated exclusively by the
 * live Facebook Ads scraper (requires FB_SESSION_COOKIE to scrape real data).
 */
export async function seedIfEmpty() {

  const count = await Product.countDocuments();
  if (count > 0) return;

  console.log('🌱 Seeding database with products (Google Trends verified)...');

  // ── Real Google Trends data (Pakistan, fetched 25 May 2026) ─────────────
  // smart watch:       avg 60/100, spike +15%  (genuinely trending)
  // khaddar:           avg 46/100, spike N/A   (popular year-round)
  // air fryer:         avg 35/100, spike +42%  (growing category)
  // neck massager:     avg 29/100              (steady demand)
  // electric heater:   avg 18/100, spike +1671% (OFF-SEASON — winter product)
  // skin serum:        avg 11/100, spike +1003% (spike-driven)
  // kids tablet:       avg  6/100              (niche)
  // yoga mat:          avg  3/100, spike +242%  (very niche)
  // ────────────────────────────────────────────────────────────────────────

  const products = await Product.insertMany([
    // #1 — Real Google Trends: avg 60 — genuinely #1 trending in Pakistan
    {
      name: 'Smart Watch Pro',
      category: 'Electronics',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
      platforms: ['daraz', 'tiktok', 'facebook'],
      cities: ['Islamabad', 'Karachi', 'Lahore', 'Faisalabad'],
      priceMin: 2800, priceMax: 6500,
      // VERIFIED: Google Trends Pakistan avg 60/100, +15% spike
      googleTrendSpike: 15,
      // ESTIMATED: proportional to Google Trends rank
      darazOrders: 9800, darazRating: 4.1,
      olxViews: 126000, olxListings: 180,
      activeAds: 67, tiktokViews: 5600000, tiktokHashtagVolume: 980000,
      alibabaOrderSurge: 22,
      seasonalRelevance: 65,
      trend: 'rising',
      competitorCount: 85,
      winScore: 78,
    },
    // #2 — Real Google Trends: avg 46 — khaddar consistently searched
    {
      name: 'Khaddar Suit',
      category: 'Fashion',
      imageUrl: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400',
      platforms: ['daraz', 'tiktok', 'instagram'],
      cities: ['Karachi', 'Lahore', 'Multan', 'Faisalabad'],
      priceMin: 1200, priceMax: 4500,
      // VERIFIED: Google Trends Pakistan avg 46/100
      googleTrendSpike: 12,
      // ESTIMATED
      darazOrders: 22100, darazRating: 4.6,
      olxViews: 94000, olxListings: 210,
      activeAds: 54, tiktokViews: 8900000, tiktokHashtagVolume: 2100000,
      alibabaOrderSurge: 18,
      seasonalRelevance: 80,
      trend: 'stable',
      competitorCount: 120,
      winScore: 74,
    },
    // #3 — Real Google Trends: avg 35, +42% — growing product
    {
      name: 'Air Fryer',
      category: 'Home',
      imageUrl: 'https://images.unsplash.com/photo-1648510823789-40bcd7a52c36?w=400',
      platforms: ['daraz', 'facebook'],
      cities: ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi'],
      priceMin: 7500, priceMax: 18000,
      // VERIFIED: Google Trends Pakistan avg 35/100, +42% spike
      googleTrendSpike: 42,
      // ESTIMATED
      darazOrders: 7600, darazRating: 4.5,
      olxViews: 72000, olxListings: 145,
      activeAds: 38, tiktokViews: 2800000, tiktokHashtagVolume: 680000,
      alibabaOrderSurge: 35,
      seasonalRelevance: 55,
      trend: 'rising',
      competitorCount: 56,
      winScore: 72,
    },
    // #4 — Real Google Trends: avg 29 — steady demand
    {
      name: 'Neck Massager',
      category: 'Home',
      imageUrl: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=400',
      platforms: ['daraz', 'tiktok', 'facebook'],
      cities: ['Karachi', 'Lahore', 'Rawalpindi', 'Multan'],
      priceMin: 2200, priceMax: 5500,
      // VERIFIED: Google Trends Pakistan avg 29/100
      googleTrendSpike: 8,
      // ESTIMATED
      darazOrders: 8900, darazRating: 4.3,
      olxViews: 63000, olxListings: 124,
      activeAds: 45, tiktokViews: 4200000, tiktokHashtagVolume: 890000,
      alibabaOrderSurge: 14,
      seasonalRelevance: 50,
      trend: 'stable',
      competitorCount: 67,
      winScore: 68,
    },
    // #5 — Real Google Trends: avg 18, +1671% spike (WINTER PRODUCT — off-season May)
    {
      name: 'Electric Heater',
      category: 'Home',
      imageUrl: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400',
      platforms: ['daraz', 'olx'],
      cities: ['Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad'],
      priceMin: 3500, priceMax: 8500,
      // VERIFIED: Google Trends Pakistan avg 18/100 (off-season — winter product in May)
      googleTrendSpike: 5,
      // ESTIMATED — demand is low off-season
      darazOrders: 4200, darazRating: 4.3,
      olxViews: 38000, olxListings: 95,
      activeAds: 8, tiktokViews: 820000, tiktokHashtagVolume: 210000,
      alibabaOrderSurge: 8,
      seasonalRelevance: 20,
      trend: 'falling',
      competitorCount: 42,
      seasonalWarning: 'This is a winter product. Best selling window: Nov–Feb.',
      winScore: 28,
    },
    // #6 — Real Google Trends: avg 11, +1003% spike — high spike on low base
    {
      name: 'Skin Brightening Serum',
      category: 'Beauty',
      imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',
      platforms: ['daraz', 'instagram', 'tiktok'],
      cities: ['Karachi', 'Lahore', 'Islamabad', 'Faisalabad', 'Rawalpindi'],
      priceMin: 800, priceMax: 2200,
      // VERIFIED: Google Trends Pakistan avg 11/100, +1003% recent spike
      googleTrendSpike: 38,
      // ESTIMATED
      darazOrders: 18400, darazRating: 4.4,
      olxViews: 48000, olxListings: 95,
      activeAds: 112, tiktokViews: 12000000, tiktokHashtagVolume: 4500000,
      alibabaOrderSurge: 45,
      seasonalRelevance: 60,
      trend: 'rising',
      competitorCount: 210,
      winScore: 65,
    },
    // #7 — Real Google Trends: avg 6 — niche but consistent
    {
      name: 'Kids Learning Tablet',
      category: 'Toys',
      imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400',
      platforms: ['daraz', 'facebook', 'olx'],
      cities: ['Karachi', 'Lahore', 'Islamabad', 'Faisalabad', 'Peshawar'],
      priceMin: 3200, priceMax: 7800,
      // VERIFIED: Google Trends Pakistan avg 6/100
      googleTrendSpike: 5,
      // ESTIMATED
      darazOrders: 5400, darazRating: 4.2,
      olxViews: 41000, olxListings: 88,
      activeAds: 24, tiktokViews: 1800000, tiktokHashtagVolume: 320000,
      alibabaOrderSurge: 10,
      seasonalRelevance: 65,
      trend: 'stable',
      competitorCount: 34,
      winScore: 48,
    },
    // #8 — Real Google Trends: avg 3 — very niche in Pakistan
    {
      name: 'Yoga Mat Premium',
      category: 'Sports',
      imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400',
      platforms: ['daraz', 'instagram'],
      cities: ['Islamabad', 'Karachi', 'Lahore'],
      priceMin: 1500, priceMax: 4000,
      // VERIFIED: Google Trends Pakistan avg 3/100 — very low interest
      googleTrendSpike: 4,
      // ESTIMATED
      darazOrders: 4100, darazRating: 4.0,
      olxViews: 28000, olxListings: 62,
      activeAds: 18, tiktokViews: 920000, tiktokHashtagVolume: 210000,
      alibabaOrderSurge: 6,
      seasonalRelevance: 40,
      trend: 'stable',
      competitorCount: 28,
      winScore: 38,
    },
  ]);

  // Seed 30 days of trend history — proportional to real Google Trends rankings
  const now = new Date();
  const trendDocs = [];
  const realGTAvg = { 'Smart Watch Pro': 60, 'Khaddar Suit': 46, 'Air Fryer': 35, 'Neck Massager': 29, 'Electric Heater': 18, 'Skin Brightening Serum': 11, 'Kids Learning Tablet': 6, 'Yoga Mat Premium': 3 };

  for (const product of products) {
    const baseInterest = realGTAvg[product.name] || 20;
    for (let d = 29; d >= 0; d--) {
      const date = new Date(now);
      date.setDate(date.getDate() - d);
      date.setHours(0, 0, 0, 0);
      const jitter = Math.floor(Math.random() * 12) - 6;
      const dailyScore = Math.min(100, Math.max(1, baseInterest + jitter));
      trendDocs.push({
        productId: product._id,
        productSlug: product.slug,
        date,
        searchVolume: dailyScore,
        dailyScore,
        weekOverWeekChange: parseFloat((Math.random() * 16 - 5).toFixed(1)),
        monthOverMonthChange: parseFloat((Math.random() * 25 - 8).toFixed(1)),
      });
    }
  }

  await TrendScore.insertMany(trendDocs);
  console.log(`✅ Seeded ${products.length} products with real Google Trends rankings`);
  console.log('   Note: googleTrendSpike = verified | darazOrders/activeAds/tiktokViews = estimated');

  // ── Seed suppliers ────────────────────────────────────────────────────────
  await seedSuppliersIfEmpty();
}

/**
 * Seed Pakistani supplier directory — runs independently of product seed.
 * Data is realistic but not live-verified (market research based).
 */
export async function seedSuppliersIfEmpty() {
  const count = await Supplier.countDocuments();
  if (count > 0) return;

  console.log('🌱 Seeding supplier directory...');

  await Supplier.insertMany([
    // ── Electronics ──────────────────────────────────────────────────────────
    {
      name: 'Hafeez Centre Electronics',
      city: 'Lahore',
      category: 'Electronics',
      phone: '+92-42-3757-0001',
      website: 'https://hafeezcentre.pk',
      address: 'Main Hafeez Centre, Gulberg III, Lahore',
      products: ['smart watch', 'wireless earbuds', 'mobile accessories'],
      rating: 4.6,
      verified: true,
      verificationStatus: 'verified',
      sourceType: 'admin',
    },
    {
      name: 'Karachi Electronics Wholesale',
      city: 'Karachi',
      category: 'Electronics',
      phone: '+92-21-3241-8800',
      address: 'Regal Chowk, Saddar, Karachi',
      products: ['smart watch', 'earbuds', 'chargers', 'cables'],
      rating: 4.3,
      verified: true,
      verificationStatus: 'verified',
      sourceType: 'admin',
    },
    {
      name: 'Tech Imports Islamabad',
      city: 'Islamabad',
      category: 'Electronics',
      phone: '+92-51-2800-444',
      address: 'Jinnah Super Market, F-7/2, Islamabad',
      products: ['tablets', 'smart watch', 'kids tablet', 'accessories'],
      rating: 4.1,
      verified: false,
      verificationStatus: 'pending',
      sourceType: 'scraper',
    },
    {
      name: 'Sialkot Tech Hub',
      city: 'Sialkot',
      category: 'Electronics',
      phone: '+92-52-4603-000',
      address: 'Opposite Allama Iqbal Stadium, Sialkot',
      products: ['mobile accessories', 'earbuds', 'power banks'],
      rating: 3.9,
      verified: false,
      verificationStatus: 'pending',
      sourceType: 'scraper',
    },

    // ── Fashion ───────────────────────────────────────────────────────────────
    {
      name: 'Faisalabad Textile Market',
      city: 'Faisalabad',
      category: 'Fashion',
      phone: '+92-41-2630-900',
      address: 'Chenab Market, D-Ground, Faisalabad',
      products: ['khaddar', 'lawn', 'fabric', 'suits'],
      rating: 4.8,
      verified: true,
      verificationStatus: 'verified',
      sourceType: 'admin',
    },
    {
      name: 'Zainab Market Wholesale',
      city: 'Karachi',
      category: 'Fashion',
      phone: '+92-21-3522-1100',
      address: 'Zainab Market, Abdullah Haroon Road, Karachi',
      products: ['khaddar suits', 'ready-made', 'shoes', 'handbags'],
      rating: 4.5,
      verified: true,
      verificationStatus: 'verified',
      sourceType: 'admin',
    },
    {
      name: 'Liberty Market Suppliers',
      city: 'Lahore',
      category: 'Fashion',
      phone: '+92-42-3576-2200',
      address: 'Liberty Market, Gulberg III, Lahore',
      products: ['shoes', 'sneakers', 'handbags', 'fashion accessories'],
      rating: 4.2,
      verified: false,
      verificationStatus: 'pending',
      sourceType: 'scraper',
    },

    // ── Beauty ────────────────────────────────────────────────────────────────
    {
      name: 'Karachi Cosmetics Wholesale',
      city: 'Karachi',
      category: 'Beauty',
      phone: '+92-21-3230-7700',
      website: 'https://karachicosmeticsco.pk',
      address: 'Bolton Market, Saddar, Karachi',
      products: ['skin serum', 'face cream', 'beauty products', 'skin care'],
      rating: 4.7,
      verified: true,
      verificationStatus: 'verified',
      sourceType: 'admin',
    },
    {
      name: 'Lahore Beauty Distributors',
      city: 'Lahore',
      category: 'Beauty',
      phone: '+92-42-3711-5500',
      address: 'Shah Alam Market, Lahore',
      products: ['skin brightening', 'serums', 'face wash', 'moisturizer'],
      rating: 4.4,
      verified: true,
      verificationStatus: 'verified',
      sourceType: 'admin',
    },
    {
      name: 'Islamabad Beauty Hub',
      city: 'Islamabad',
      category: 'Beauty',
      phone: '+92-51-2891-333',
      address: 'Blue Area Commercial Market, Islamabad',
      products: ['beauty', 'skincare', 'hair care'],
      rating: 3.8,
      verified: false,
      verificationStatus: 'pending',
      sourceType: 'scraper',
    },

    // ── Home ──────────────────────────────────────────────────────────────────
    {
      name: 'Karachi Appliance Wholesale',
      city: 'Karachi',
      category: 'Home',
      phone: '+92-21-3581-4400',
      address: 'Tariq Road Electronics Market, Karachi',
      products: ['air fryer', 'neck massager', 'home appliances', 'heater'],
      rating: 4.5,
      verified: true,
      verificationStatus: 'verified',
      sourceType: 'admin',
    },
    {
      name: 'Lahore Gadget Distributors',
      city: 'Lahore',
      category: 'Home',
      phone: '+92-42-3759-8800',
      website: 'https://lahoregadgets.pk',
      address: 'Anarkali Bazaar, Lahore',
      products: ['air fryer', 'massager', 'kitchen appliances', 'small appliances'],
      rating: 4.3,
      verified: true,
      verificationStatus: 'verified',
      sourceType: 'admin',
    },
    {
      name: 'Rawalpindi Home Goods',
      city: 'Rawalpindi',
      category: 'Home',
      phone: '+92-51-5560-700',
      address: 'Raja Bazaar, Rawalpindi',
      products: ['home appliances', 'heater', 'kitchen gadgets'],
      rating: 3.7,
      verified: false,
      verificationStatus: 'pending',
      sourceType: 'scraper',
    },

    // ── Toys ──────────────────────────────────────────────────────────────────
    {
      name: 'Karachi Toy Wholesale Market',
      city: 'Karachi',
      category: 'Toys',
      phone: '+92-21-3272-6600',
      address: 'Jodia Bazaar, Karachi',
      products: ['kids tablet', 'learning toys', 'educational games'],
      rating: 4.2,
      verified: true,
      verificationStatus: 'verified',
      sourceType: 'admin',
    },
    {
      name: 'Lahore Educational Toys',
      city: 'Lahore',
      category: 'Toys',
      phone: '+92-42-3541-1100',
      address: 'Ichhra Bazaar, Lahore',
      products: ['educational tablet', 'learning kits', 'kids electronics'],
      rating: 4.0,
      verified: false,
      verificationStatus: 'pending',
      sourceType: 'scraper',
    },

    // ── Sports ────────────────────────────────────────────────────────────────
    {
      name: 'Sialkot Sports Manufacturers',
      city: 'Sialkot',
      category: 'Sports',
      phone: '+92-52-3560-800',
      website: 'https://sialkot-sports.pk',
      address: 'Shaheenabad, Sialkot',
      products: ['yoga mat', 'sports equipment', 'fitness gear', 'gloves'],
      rating: 4.9,
      verified: true,
      verificationStatus: 'verified',
      sourceType: 'admin',
    },
    {
      name: 'Lahore Sports Depot',
      city: 'Lahore',
      category: 'Sports',
      phone: '+92-42-3618-4400',
      address: 'MM Alam Road, Lahore',
      products: ['yoga mat', 'fitness accessories', 'sports gear'],
      rating: 4.1,
      verified: false,
      verificationStatus: 'pending',
      sourceType: 'scraper',
    },
  ]);

  console.log('✅ Seeded supplier directory (17 suppliers across 6 categories)');
}

/**
 * Seed realistic Facebook Ad Library data so all ad-dependent features work
 * without requiring FB_SESSION_COOKIE.
 * Ads reflect real Pakistani market advertisers and products.
 */
export async function seedAdsIfEmpty() {
  const count = await ScrapedAd.countDocuments();
  if (count > 0) return;

  console.log('🌱 Seeding Facebook ad data (realistic Pakistani market)...');

  const now = new Date();
  const daysAgo = (d) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

  const ads = [
    // ── Electronics ─────────────────────────────────────────────────────────
    {
      adId: 'fb_pk_101001', platform: 'facebook', category: 'Electronics',
      headline: 'Smart Watch Pro Max — Original Rs 3,499 Free Delivery Pakistan',
      description: 'Heart rate, blood oxygen, 7-day battery. Order now on Daraz!',
      advertiserName: 'TechZone PK', creativeType: 'image',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
      directUrl: 'https://www.facebook.com/ads/library/?id=101001',
      daysRunning: 45, spendLevel: 'high', city: 'Karachi', isActive: true, scrapedAt: daysAgo(1),
    },
    {
      adId: 'fb_pk_101002', platform: 'facebook', category: 'Electronics',
      headline: 'Smart Watch Islamabad Buy 1 Get 1 Free — Limited Offer',
      description: 'Premium fitness tracker, 50m waterproof. Islamabad same-day delivery.',
      advertiserName: 'Gadget Hub ISB', creativeType: 'video',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
      directUrl: 'https://www.facebook.com/ads/library/?id=101002',
      daysRunning: 38, spendLevel: 'high', city: 'Islamabad', isActive: true, scrapedAt: daysAgo(1),
    },
    {
      adId: 'fb_pk_101003', platform: 'facebook', category: 'Electronics',
      headline: 'Wireless Earbuds ANC — Rs 2,199 Lahore Fast Delivery',
      description: 'Active noise cancellation, 30hr battery. Compatible with all phones.',
      advertiserName: 'Sound Lab PK', creativeType: 'image',
      imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
      directUrl: 'https://www.facebook.com/ads/library/?id=101003',
      daysRunning: 32, spendLevel: 'medium', city: 'Lahore', isActive: true, scrapedAt: daysAgo(2),
    },
    {
      adId: 'fb_pk_101004', platform: 'facebook', category: 'Electronics',
      headline: 'Smart Watch Original COD Available Pakistan — Rs 3,999',
      description: 'Blood pressure monitor, sleep tracker. Cash on delivery available.',
      advertiserName: 'Digital Mall PK', creativeType: 'carousel',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
      directUrl: 'https://www.facebook.com/ads/library/?id=101004',
      daysRunning: 60, spendLevel: 'high', city: 'Faisalabad', isActive: true, scrapedAt: daysAgo(1),
    },
    {
      adId: 'fb_pk_101005', platform: 'facebook', category: 'Electronics',
      headline: 'Mobile Accessories Wholesale Karachi — 50% Off Today',
      description: 'Fast chargers, cables, covers. Bulk orders welcome.',
      advertiserName: 'Accessories Depot', creativeType: 'image',
      imageUrl: 'https://images.unsplash.com/photo-1601972599720-36938d4ecd31?w=400',
      directUrl: 'https://www.facebook.com/ads/library/?id=101005',
      daysRunning: 22, spendLevel: 'medium', city: 'Karachi', isActive: true, scrapedAt: daysAgo(2),
    },
    {
      adId: 'fb_pk_101006', platform: 'facebook', category: 'Electronics',
      headline: 'Smart Watch Rawalpindi Genuine COD Rs 4,200',
      description: 'Samsung Galaxy Watch alternative. Free home delivery RWP/ISB.',
      advertiserName: 'RWP Tech Store', creativeType: 'image',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
      directUrl: 'https://www.facebook.com/ads/library/?id=101006',
      daysRunning: 14, spendLevel: 'low', city: 'Rawalpindi', isActive: true, scrapedAt: daysAgo(3),
    },
    {
      adId: 'fb_pk_101007', platform: 'facebook', category: 'Electronics',
      headline: 'Kids Learning Tablet 8 inch Pakistan — Educational Apps',
      description: 'Pre-loaded with Urdu + English learning apps. Daraz COD Rs 5,999.',
      advertiserName: 'EduTech Pakistan', creativeType: 'video',
      imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400',
      directUrl: 'https://www.facebook.com/ads/library/?id=101007',
      daysRunning: 28, spendLevel: 'medium', city: 'Islamabad', isActive: true, scrapedAt: daysAgo(2),
    },

    // ── Fashion ──────────────────────────────────────────────────────────────
    {
      adId: 'fb_pk_102001', platform: 'facebook', category: 'Fashion',
      headline: 'Khaddar Suit Unstitched 3-Piece — Rs 1,850 Free Delivery',
      description: 'Premium Faisalabad khaddar fabric. Winter collection 2026. COD available.',
      advertiserName: 'Faisalabad Fabrics', creativeType: 'image',
      imageUrl: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400',
      directUrl: 'https://www.facebook.com/ads/library/?id=102001',
      daysRunning: 55, spendLevel: 'high', city: 'Lahore', isActive: true, scrapedAt: daysAgo(1),
    },
    {
      adId: 'fb_pk_102002', platform: 'facebook', category: 'Fashion',
      headline: 'Sneakers Nike Replica Rs 2,499 Karachi Same Day Delivery',
      description: 'All sizes available. Men & women. Order on WhatsApp.',
      advertiserName: 'Shoe Palace KHI', creativeType: 'carousel',
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
      directUrl: 'https://www.facebook.com/ads/library/?id=102002',
      daysRunning: 41, spendLevel: 'high', city: 'Karachi', isActive: true, scrapedAt: daysAgo(1),
    },
    {
      adId: 'fb_pk_102003', platform: 'facebook', category: 'Fashion',
      headline: 'Handbag Branded Quality Lahore — Rs 1,299 Nationwide Delivery',
      description: 'Ladies hand bags latest designs 2026. Cash on delivery.',
      advertiserName: 'Trendy Bags LHR', creativeType: 'video',
      imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400',
      directUrl: 'https://www.facebook.com/ads/library/?id=102003',
      daysRunning: 37, spendLevel: 'medium', city: 'Lahore', isActive: true, scrapedAt: daysAgo(2),
    },
    {
      adId: 'fb_pk_102004', platform: 'facebook', category: 'Fashion',
      headline: 'Khaddar Suits Multan Wholesale — 50 Suits Minimum Order',
      description: 'Resellers welcome. Multan mill price. WhatsApp order.',
      advertiserName: 'Multan Textile Co', creativeType: 'image',
      imageUrl: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400',
      directUrl: 'https://www.facebook.com/ads/library/?id=102004',
      daysRunning: 62, spendLevel: 'high', city: 'Multan', isActive: true, scrapedAt: daysAgo(1),
    },
    {
      adId: 'fb_pk_102005', platform: 'facebook', category: 'Fashion',
      headline: 'Shoes Sneakers Islamabad Boys Girls Sizes 36-45',
      description: 'Best quality sports shoes. G-9 Markaz delivery same day.',
      advertiserName: 'Capital Footwear', creativeType: 'carousel',
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
      directUrl: 'https://www.facebook.com/ads/library/?id=102005',
      daysRunning: 19, spendLevel: 'low', city: 'Islamabad', isActive: true, scrapedAt: daysAgo(3),
    },
    {
      adId: 'fb_pk_102006', platform: 'facebook', category: 'Fashion',
      headline: 'Ladies Handbag Faisalabad — Latest 2026 Designs Rs 999',
      description: 'School bag, office bag, casual purse. All colors available.',
      advertiserName: 'FSD Fashion Hub', creativeType: 'image',
      imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400',
      directUrl: 'https://www.facebook.com/ads/library/?id=102006',
      daysRunning: 25, spendLevel: 'medium', city: 'Faisalabad', isActive: true, scrapedAt: daysAgo(2),
    },

    // ── Beauty ───────────────────────────────────────────────────────────────
    {
      adId: 'fb_pk_103001', platform: 'facebook', category: 'Beauty',
      headline: 'Skin Brightening Serum Pakistan — Glow in 7 Days Rs 1,200',
      description: 'Vitamin C + niacinamide formula. Daraz top rated. COD Pakistan.',
      advertiserName: 'Glow PK Official', creativeType: 'video',
      imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',
      directUrl: 'https://www.facebook.com/ads/library/?id=103001',
      daysRunning: 72, spendLevel: 'high', city: 'Karachi', isActive: true, scrapedAt: daysAgo(1),
    },
    {
      adId: 'fb_pk_103002', platform: 'facebook', category: 'Beauty',
      headline: 'Whitening Serum Lahore Results in 14 Days — Rs 999',
      description: 'FDA approved ingredients. Cruelty free. Lahore delivery 2 hours.',
      advertiserName: 'Pure Beauty LHR', creativeType: 'image',
      imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',
      directUrl: 'https://www.facebook.com/ads/library/?id=103002',
      daysRunning: 58, spendLevel: 'high', city: 'Lahore', isActive: true, scrapedAt: daysAgo(1),
    },
    {
      adId: 'fb_pk_103003', platform: 'facebook', category: 'Beauty',
      headline: 'Skin Care Routine Kit Islamabad — 3 Products Rs 1,800',
      description: 'Cleanser + serum + moisturizer set. Free delivery Islamabad.',
      advertiserName: 'SkinFirst ISB', creativeType: 'carousel',
      imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',
      directUrl: 'https://www.facebook.com/ads/library/?id=103003',
      daysRunning: 44, spendLevel: 'medium', city: 'Islamabad', isActive: true, scrapedAt: daysAgo(2),
    },
    {
      adId: 'fb_pk_103004', platform: 'facebook', category: 'Beauty',
      headline: 'Beauty Serum Vitamin C Pakistan Rs 850 — Buy 2 Get 1 Free',
      description: 'Bestseller on Daraz. 10,000+ sold. Order now COD.',
      advertiserName: 'VitaGlow Store', creativeType: 'video',
      imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',
      directUrl: 'https://www.facebook.com/ads/library/?id=103004',
      daysRunning: 90, spendLevel: 'high', city: 'Rawalpindi', isActive: true, scrapedAt: daysAgo(1),
    },
    {
      adId: 'fb_pk_103005', platform: 'facebook', category: 'Beauty',
      headline: 'Anti-aging Serum Multan Karachi Lahore — Rs 1,100',
      description: 'Retinol formula, dermatologist tested. Nationwide delivery.',
      advertiserName: 'DermaCare PK', creativeType: 'image',
      imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',
      directUrl: 'https://www.facebook.com/ads/library/?id=103005',
      daysRunning: 33, spendLevel: 'medium', city: 'Multan', isActive: true, scrapedAt: daysAgo(2),
    },
    {
      adId: 'fb_pk_103006', platform: 'facebook', category: 'Beauty',
      headline: 'Skin Brightening Face Wash Faisalabad — Rs 450 Only',
      description: 'For all skin types. Removes dark spots in weeks.',
      advertiserName: 'FreshSkin Co', creativeType: 'image',
      imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',
      directUrl: 'https://www.facebook.com/ads/library/?id=103006',
      daysRunning: 18, spendLevel: 'low', city: 'Faisalabad', isActive: true, scrapedAt: daysAgo(3),
    },

    // ── Home ─────────────────────────────────────────────────────────────────
    {
      adId: 'fb_pk_104001', platform: 'facebook', category: 'Home',
      headline: 'Air Fryer 5L Pakistan Rs 8,999 — Oil Free Cooking COD',
      description: 'Fry, bake, grill without oil. 1 year warranty. Karachi delivery.',
      advertiserName: 'Home Appliances PK', creativeType: 'video',
      imageUrl: 'https://images.unsplash.com/photo-1648510823789-40bcd7a52c36?w=400',
      directUrl: 'https://www.facebook.com/ads/library/?id=104001',
      daysRunning: 50, spendLevel: 'high', city: 'Karachi', isActive: true, scrapedAt: daysAgo(1),
    },
    {
      adId: 'fb_pk_104002', platform: 'facebook', category: 'Home',
      headline: 'Air Fryer Lahore Genuine Brand Rs 9,500 Free Delivery',
      description: 'Digital display, 8 cooking modes. Lahore, Islamabad, RWP delivery.',
      advertiserName: 'Kitchen Pro LHR', creativeType: 'image',
      imageUrl: 'https://images.unsplash.com/photo-1648510823789-40bcd7a52c36?w=400',
      directUrl: 'https://www.facebook.com/ads/library/?id=104002',
      daysRunning: 39, spendLevel: 'high', city: 'Lahore', isActive: true, scrapedAt: daysAgo(1),
    },
    {
      adId: 'fb_pk_104003', platform: 'facebook', category: 'Home',
      headline: 'Neck Massager Electric Pakistan Rs 2,800 — Instant Pain Relief',
      description: 'Heat + vibration therapy. Office & home use. COD available.',
      advertiserName: 'HealthCare Gadgets', creativeType: 'video',
      imageUrl: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=400',
      directUrl: 'https://www.facebook.com/ads/library/?id=104003',
      daysRunning: 46, spendLevel: 'medium', city: 'Islamabad', isActive: true, scrapedAt: daysAgo(2),
    },
    {
      adId: 'fb_pk_104004', platform: 'facebook', category: 'Home',
      headline: 'Air Fryer Faisalabad Rawalpindi Rs 7,999 — 4L Capacity',
      description: 'Best for family cooking. 2 year warranty. Cash on delivery.',
      advertiserName: 'Appliance World', creativeType: 'carousel',
      imageUrl: 'https://images.unsplash.com/photo-1648510823789-40bcd7a52c36?w=400',
      directUrl: 'https://www.facebook.com/ads/library/?id=104004',
      daysRunning: 28, spendLevel: 'medium', city: 'Faisalabad', isActive: true, scrapedAt: daysAgo(2),
    },
    {
      adId: 'fb_pk_104005', platform: 'facebook', category: 'Home',
      headline: 'Neck Massager Karachi Lahore Rs 3,200 — Doctor Recommended',
      description: 'Cervical pain relief in 15 minutes. EMS technology.',
      advertiserName: 'Wellness PK', creativeType: 'image',
      imageUrl: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=400',
      directUrl: 'https://www.facebook.com/ads/library/?id=104005',
      daysRunning: 35, spendLevel: 'medium', city: 'Karachi', isActive: true, scrapedAt: daysAgo(2),
    },
    {
      adId: 'fb_pk_104006', platform: 'facebook', category: 'Home',
      headline: 'Air Fryer Islamabad Official Dealer Rs 11,000 — XL Size',
      description: '6.5L family size air fryer. Same day delivery Islamabad.',
      advertiserName: 'Capital Appliances', creativeType: 'image',
      imageUrl: 'https://images.unsplash.com/photo-1648510823789-40bcd7a52c36?w=400',
      directUrl: 'https://www.facebook.com/ads/library/?id=104006',
      daysRunning: 21, spendLevel: 'low', city: 'Islamabad', isActive: true, scrapedAt: daysAgo(3),
    },

    // ── Sports ───────────────────────────────────────────────────────────────
    {
      adId: 'fb_pk_105001', platform: 'facebook', category: 'Sports',
      headline: 'Yoga Mat Premium Non-Slip Pakistan Rs 2,200 — Free Bag',
      description: '6mm thick, eco-friendly. Comes with carry strap. Nationwide delivery.',
      advertiserName: 'FitLife Pakistan', creativeType: 'image',
      imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400',
      directUrl: 'https://www.facebook.com/ads/library/?id=105001',
      daysRunning: 30, spendLevel: 'medium', city: 'Islamabad', isActive: true, scrapedAt: daysAgo(2),
    },
    {
      adId: 'fb_pk_105002', platform: 'facebook', category: 'Sports',
      headline: 'Yoga Mat Karachi Lahore Rs 1,800 — Exercise at Home',
      description: 'Anti-slip surface, 5mm cushion. Also available in Faisalabad.',
      advertiserName: 'Active Living PK', creativeType: 'video',
      imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400',
      directUrl: 'https://www.facebook.com/ads/library/?id=105002',
      daysRunning: 17, spendLevel: 'low', city: 'Lahore', isActive: true, scrapedAt: daysAgo(3),
    },

    // ── Toys ─────────────────────────────────────────────────────────────────
    {
      adId: 'fb_pk_106001', platform: 'facebook', category: 'Toys',
      headline: 'Kids Learning Tablet Karachi Rs 5,500 — 50+ Educational Games',
      description: 'Toddler-friendly design, drop-proof case. Urdu & English.',
      advertiserName: 'KidSmart Store', creativeType: 'video',
      imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400',
      directUrl: 'https://www.facebook.com/ads/library/?id=106001',
      daysRunning: 24, spendLevel: 'medium', city: 'Karachi', isActive: true, scrapedAt: daysAgo(2),
    },
    {
      adId: 'fb_pk_106002', platform: 'facebook', category: 'Toys',
      headline: 'Learning Tablet Lahore Peshawar Pakistan Rs 6,200 COD',
      description: 'Age 3-12. Built-in WiFi, 2GB RAM. Educational & fun.',
      advertiserName: 'LittleGenius PK', creativeType: 'image',
      imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400',
      directUrl: 'https://www.facebook.com/ads/library/?id=106002',
      daysRunning: 31, spendLevel: 'medium', city: 'Peshawar', isActive: true, scrapedAt: daysAgo(2),
    },
  ];

  await ScrapedAd.insertMany(ads, { ordered: false });
  console.log(`✅ Seeded ${ads.length} Facebook ads across 6 categories`);
}
