/**
 * Standalone seed runner — uses relative imports so it can be called
 * from server.js (plain Node.js, no Next.js @/ alias resolution).
 */

import mongoose from 'mongoose';
import { connectDB } from './db.js';

// ── Lazy model references (models may already be registered by Next.js) ────────
function getModel(name, schema) {
  return mongoose.models[name] || mongoose.model(name, schema);
}

// ── Minimal schemas needed for seeding ────────────────────────────────────────

const productSchema = new mongoose.Schema({
  name:               { type: String },
  category:           { type: String },
  imageUrl:           { type: String },
  platforms:          [String],
  cities:             [String],
  priceMin:           Number,
  priceMax:           Number,
  googleTrendSpike:   Number,
  darazOrders:        Number,
  darazRating:        Number,
  olxViews:           Number,
  olxListings:        Number,
  activeAds:          Number,
  tiktokViews:        Number,
  tiktokHashtagVolume:Number,
  alibabaOrderSurge:  Number,
  seasonalRelevance:  Number,
  trend:              String,
  competitorCount:    Number,
  winScore:           Number,
  seasonalWarning:    String,
  slug:               String,
  confidence:         String,
  confidenceScore:    Number,
}, { timestamps: true });

productSchema.pre('save', function () {
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
});

const trendScoreSchema = new mongoose.Schema({
  productId:            { type: mongoose.Schema.Types.ObjectId },
  productSlug:          String,
  date:                 Date,
  searchVolume:         Number,
  dailyScore:           Number,
  weekOverWeekChange:   Number,
  monthOverMonthChange: Number,
});

const supplierSchema = new mongoose.Schema({
  name:               String,
  city:               String,
  category:           String,
  phone:              String,
  website:            String,
  address:            String,
  products:           [String],
  rating:             Number,
  verified:           Boolean,
  verificationStatus: String,
  sourceType:         String,
});

const scrapedAdSchema = new mongoose.Schema({
  productId:      { type: mongoose.Schema.Types.ObjectId, default: null },
  productName:    String,
  platform:       { type: String, enum: ['facebook', 'instagram', 'tiktok'] },
  adId:           { type: String, required: true, unique: true },
  headline:       { type: String, default: '' },
  description:    { type: String, default: '' },
  creativeType:   { type: String, enum: ['image', 'video', 'carousel'], default: 'image' },
  imageUrl:       { type: String, default: null },
  videoUrl:       { type: String, default: null },
  advertiserName: { type: String, default: '' },
  advertiserPage: { type: String, default: '' },
  daysRunning:    { type: Number, default: 0 },
  spendLevel:     { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  city:           { type: String, default: null },
  category:       { type: String, default: null },
  scrapedAt:      { type: Date, default: Date.now },
  isActive:       { type: Boolean, default: true },
  directUrl:      { type: String, default: null },
}, { timestamps: true });

// ── Seed functions ─────────────────────────────────────────────────────────────

export async function seedAll() {
  await connectDB();

  const Product    = mongoose.models.Product    || mongoose.model('Product',    productSchema);
  const TrendScore = mongoose.models.TrendScore || mongoose.model('TrendScore', trendScoreSchema);
  const Supplier   = mongoose.models.Supplier   || mongoose.model('Supplier',   supplierSchema);
  const ScrapedAd  = mongoose.models.ScrapedAd  || mongoose.model('ScrapedAd',  scrapedAdSchema);

  await seedProductsIfEmpty(Product, TrendScore);
  await seedSuppliersIfEmpty(Supplier);
  await seedAdsIfEmpty(ScrapedAd);
}

async function seedProductsIfEmpty(Product, TrendScore) {
  const count = await Product.countDocuments();
  if (count > 0) return;

  console.log('[seed] 🌱 Seeding products...');

  const products = await Product.insertMany([
    { name: 'Smart Watch Pro',        category: 'Electronics', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', platforms: ['daraz','tiktok','facebook'], cities: ['Islamabad','Karachi','Lahore','Faisalabad'], priceMin: 2800, priceMax: 6500, googleTrendSpike: 15, darazOrders: 9800, darazRating: 4.1, olxViews: 126000, olxListings: 180, activeAds: 67, tiktokViews: 5600000, tiktokHashtagVolume: 980000, alibabaOrderSurge: 22, seasonalRelevance: 65, trend: 'rising',  competitorCount: 85,  winScore: 78, slug: 'smart-watch-pro',          confidence: 'high', confidenceScore: 90 },
    { name: 'Khaddar Suit',           category: 'Fashion',     imageUrl: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400', platforms: ['daraz','tiktok','instagram'], cities: ['Karachi','Lahore','Multan','Faisalabad'], priceMin: 1200, priceMax: 4500, googleTrendSpike: 12, darazOrders: 22100, darazRating: 4.6, olxViews: 94000, olxListings: 210, activeAds: 54, tiktokViews: 8900000, tiktokHashtagVolume: 2100000, alibabaOrderSurge: 18, seasonalRelevance: 80, trend: 'stable',  competitorCount: 120, winScore: 74, slug: 'khaddar-suit',              confidence: 'high', confidenceScore: 90, seasonalWarning: 'This is a winter product. Best selling window: Nov–Dec–Jan–Feb.' },
    { name: 'Air Fryer',              category: 'Home',        imageUrl: 'https://images.unsplash.com/photo-1648510823789-40bcd7a52c36?w=400', platforms: ['daraz','facebook'], cities: ['Karachi','Lahore','Islamabad','Rawalpindi'], priceMin: 7500, priceMax: 18000, googleTrendSpike: 42, darazOrders: 7600, darazRating: 4.5, olxViews: 72000, olxListings: 145, activeAds: 38, tiktokViews: 2800000, tiktokHashtagVolume: 680000, alibabaOrderSurge: 35, seasonalRelevance: 55, trend: 'rising',  competitorCount: 56,  winScore: 72, slug: 'air-fryer',                  confidence: 'high', confidenceScore: 95 },
    { name: 'Neck Massager',          category: 'Home',        imageUrl: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=400', platforms: ['daraz','tiktok','facebook'], cities: ['Karachi','Lahore','Rawalpindi','Multan'], priceMin: 2200, priceMax: 5500, googleTrendSpike: 8, darazOrders: 8900, darazRating: 4.3, olxViews: 63000, olxListings: 124, activeAds: 45, tiktokViews: 4200000, tiktokHashtagVolume: 890000, alibabaOrderSurge: 14, seasonalRelevance: 50, trend: 'stable',  competitorCount: 67,  winScore: 68, slug: 'neck-massager',             confidence: 'high', confidenceScore: 88 },
    { name: 'Electric Heater',        category: 'Home',        imageUrl: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400', platforms: ['daraz','olx'], cities: ['Lahore','Islamabad','Rawalpindi','Faisalabad'], priceMin: 3500, priceMax: 8500, googleTrendSpike: 5, darazOrders: 4200, darazRating: 4.3, olxViews: 38000, olxListings: 95, activeAds: 8, tiktokViews: 820000, tiktokHashtagVolume: 210000, alibabaOrderSurge: 8, seasonalRelevance: 20, trend: 'falling', competitorCount: 42,  winScore: 28, slug: 'electric-heater',            confidence: 'medium', confidenceScore: 70, seasonalWarning: 'This is a winter product. Best selling window: Nov–Feb.' },
    { name: 'Skin Brightening Serum', category: 'Beauty',      imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400', platforms: ['daraz','instagram','tiktok'], cities: ['Karachi','Lahore','Islamabad','Faisalabad','Rawalpindi'], priceMin: 800, priceMax: 2200, googleTrendSpike: 38, darazOrders: 18400, darazRating: 4.4, olxViews: 48000, olxListings: 95, activeAds: 112, tiktokViews: 12000000, tiktokHashtagVolume: 4500000, alibabaOrderSurge: 45, seasonalRelevance: 60, trend: 'rising',  competitorCount: 210, winScore: 65, slug: 'skin-brightening-serum',    confidence: 'high', confidenceScore: 92 },
    { name: 'Kids Learning Tablet',   category: 'Toys',        imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400', platforms: ['daraz','facebook','olx'], cities: ['Karachi','Lahore','Islamabad','Faisalabad','Peshawar'], priceMin: 3200, priceMax: 7800, googleTrendSpike: 5, darazOrders: 5400, darazRating: 4.2, olxViews: 41000, olxListings: 88, activeAds: 24, tiktokViews: 1800000, tiktokHashtagVolume: 320000, alibabaOrderSurge: 10, seasonalRelevance: 65, trend: 'stable',  competitorCount: 34,  winScore: 48, slug: 'kids-learning-tablet',      confidence: 'medium', confidenceScore: 75 },
    { name: 'Yoga Mat Premium',       category: 'Sports',      imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400', platforms: ['daraz','instagram'], cities: ['Islamabad','Karachi','Lahore'], priceMin: 1500, priceMax: 4000, googleTrendSpike: 4, darazOrders: 4100, darazRating: 4.0, olxViews: 28000, olxListings: 62, activeAds: 18, tiktokViews: 920000, tiktokHashtagVolume: 210000, alibabaOrderSurge: 6, seasonalRelevance: 40, trend: 'stable',  competitorCount: 28,  winScore: 38, slug: 'yoga-mat-premium',           confidence: 'medium', confidenceScore: 72 },
  ]);

  const now = new Date();
  const realGTAvg = { 'Smart Watch Pro': 60, 'Khaddar Suit': 46, 'Air Fryer': 35, 'Neck Massager': 29, 'Electric Heater': 18, 'Skin Brightening Serum': 11, 'Kids Learning Tablet': 6, 'Yoga Mat Premium': 3 };
  const trendDocs = [];
  for (const p of products) {
    const base = realGTAvg[p.name] || 20;
    for (let d = 29; d >= 0; d--) {
      const date = new Date(now); date.setDate(date.getDate() - d); date.setHours(0,0,0,0);
      const score = Math.min(100, Math.max(1, base + Math.floor(Math.random()*12)-6));
      trendDocs.push({ productId: p._id, productSlug: p.slug, date, searchVolume: score, dailyScore: score, weekOverWeekChange: parseFloat((Math.random()*16-5).toFixed(1)), monthOverMonthChange: parseFloat((Math.random()*25-8).toFixed(1)) });
    }
  }
  await TrendScore.insertMany(trendDocs);
  console.log(`[seed] ✅ Seeded ${products.length} products + trend history`);
}

async function seedSuppliersIfEmpty(Supplier) {
  const count = await Supplier.countDocuments();
  if (count > 0) return;

  console.log('[seed] 🌱 Seeding suppliers...');
  await Supplier.insertMany([
    { name: 'Hafeez Centre Electronics',    city: 'Lahore',     category: 'Electronics', phone: '+92-42-3757-0001', website: 'https://hafeezcentre.pk',          address: 'Main Hafeez Centre, Gulberg III, Lahore',        products: ['smart watch','wireless earbuds','mobile accessories'], rating: 4.6, verified: true,  verificationStatus: 'verified', sourceType: 'admin'   },
    { name: 'Karachi Electronics Wholesale',city: 'Karachi',    category: 'Electronics', phone: '+92-21-3241-8800',                                             address: 'Regal Chowk, Saddar, Karachi',                   products: ['smart watch','earbuds','chargers','cables'],            rating: 4.3, verified: true,  verificationStatus: 'verified', sourceType: 'admin'   },
    { name: 'Tech Imports Islamabad',        city: 'Islamabad',  category: 'Electronics', phone: '+92-51-2800-444',                                              address: 'Jinnah Super Market, F-7/2, Islamabad',          products: ['tablets','smart watch','kids tablet','accessories'],    rating: 4.1, verified: false, verificationStatus: 'pending',  sourceType: 'scraper' },
    { name: 'Faisalabad Textile Market',    city: 'Faisalabad', category: 'Fashion',     phone: '+92-41-2630-900',                                              address: 'Chenab Market, D-Ground, Faisalabad',            products: ['khaddar','lawn','fabric','suits'],                      rating: 4.8, verified: true,  verificationStatus: 'verified', sourceType: 'admin'   },
    { name: 'Zainab Market Wholesale',      city: 'Karachi',    category: 'Fashion',     phone: '+92-21-3522-1100',                                             address: 'Zainab Market, Abdullah Haroon Road, Karachi',   products: ['khaddar suits','ready-made','shoes','handbags'],        rating: 4.5, verified: true,  verificationStatus: 'verified', sourceType: 'admin'   },
    { name: 'Liberty Market Suppliers',     city: 'Lahore',     category: 'Fashion',     phone: '+92-42-3576-2200',                                             address: 'Liberty Market, Gulberg III, Lahore',            products: ['shoes','sneakers','handbags','fashion accessories'],    rating: 4.2, verified: false, verificationStatus: 'pending',  sourceType: 'scraper' },
    { name: 'Karachi Cosmetics Wholesale',  city: 'Karachi',    category: 'Beauty',      phone: '+92-21-3230-7700', website: 'https://karachicosmeticsco.pk',   address: 'Bolton Market, Saddar, Karachi',                  products: ['skin serum','face cream','beauty products','skin care'],rating: 4.7, verified: true,  verificationStatus: 'verified', sourceType: 'admin'   },
    { name: 'Lahore Beauty Distributors',   city: 'Lahore',     category: 'Beauty',      phone: '+92-42-3711-5500',                                             address: 'Shah Alam Market, Lahore',                       products: ['skin brightening','serums','face wash','moisturizer'],  rating: 4.4, verified: true,  verificationStatus: 'verified', sourceType: 'admin'   },
    { name: 'Karachi Appliance Wholesale',  city: 'Karachi',    category: 'Home',        phone: '+92-21-3581-4400',                                             address: 'Tariq Road Electronics Market, Karachi',         products: ['air fryer','neck massager','home appliances','heater'], rating: 4.5, verified: true,  verificationStatus: 'verified', sourceType: 'admin'   },
    { name: 'Lahore Gadget Distributors',   city: 'Lahore',     category: 'Home',        phone: '+92-42-3759-8800', website: 'https://lahoregadgets.pk',         address: 'Anarkali Bazaar, Lahore',                        products: ['air fryer','massager','kitchen appliances'],            rating: 4.3, verified: true,  verificationStatus: 'verified', sourceType: 'admin'   },
    { name: 'Sialkot Sports Manufacturers', city: 'Sialkot',    category: 'Sports',      phone: '+92-52-3560-800',  website: 'https://sialkot-sports.pk',        address: 'Shaheenabad, Sialkot',                           products: ['yoga mat','sports equipment','fitness gear','gloves'],  rating: 4.9, verified: true,  verificationStatus: 'verified', sourceType: 'admin'   },
    { name: 'Karachi Toy Wholesale Market', city: 'Karachi',    category: 'Toys',        phone: '+92-21-3272-6600',                                             address: 'Jodia Bazaar, Karachi',                          products: ['kids tablet','learning toys','educational games'],       rating: 4.2, verified: true,  verificationStatus: 'verified', sourceType: 'admin'   },
  ]);
  console.log('[seed] ✅ Seeded suppliers');
}

async function seedAdsIfEmpty(ScrapedAd) {
  const count = await ScrapedAd.countDocuments();
  if (count > 0) return;

  console.log('[seed] 🌱 Seeding Facebook ad data...');

  const now = new Date();
  const ago = (d) => new Date(now.getTime() - d * 86400000);

  await ScrapedAd.insertMany([
    // Electronics
    { adId: 'fb_pk_101001', platform: 'facebook', category: 'Electronics', headline: 'Smart Watch Pro Max — Original Rs 3,499 Free Delivery Pakistan',      description: 'Heart rate, blood oxygen, 7-day battery. Order now on Daraz!',               advertiserName: 'TechZone PK',        creativeType: 'image',    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', directUrl: 'https://www.facebook.com/ads/library/?id=101001', daysRunning: 45, spendLevel: 'high',   city: 'Karachi',    isActive: true, scrapedAt: ago(1) },
    { adId: 'fb_pk_101002', platform: 'facebook', category: 'Electronics', headline: 'Smart Watch Islamabad Buy 1 Get 1 Free — Limited Offer',               description: 'Premium fitness tracker, 50m waterproof. Islamabad same-day delivery.',    advertiserName: 'Gadget Hub ISB',     creativeType: 'video',    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', directUrl: 'https://www.facebook.com/ads/library/?id=101002', daysRunning: 38, spendLevel: 'high',   city: 'Islamabad',  isActive: true, scrapedAt: ago(1) },
    { adId: 'fb_pk_101003', platform: 'facebook', category: 'Electronics', headline: 'Wireless Earbuds ANC — Rs 2,199 Lahore Fast Delivery',                 description: 'Active noise cancellation, 30hr battery. Compatible with all phones.',    advertiserName: 'Sound Lab PK',       creativeType: 'image',    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400', directUrl: 'https://www.facebook.com/ads/library/?id=101003', daysRunning: 32, spendLevel: 'medium', city: 'Lahore',     isActive: true, scrapedAt: ago(2) },
    { adId: 'fb_pk_101004', platform: 'facebook', category: 'Electronics', headline: 'Smart Watch Original COD Available Pakistan — Rs 3,999',               description: 'Blood pressure monitor, sleep tracker. Cash on delivery available.',    advertiserName: 'Digital Mall PK',    creativeType: 'carousel', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', directUrl: 'https://www.facebook.com/ads/library/?id=101004', daysRunning: 60, spendLevel: 'high',   city: 'Faisalabad', isActive: true, scrapedAt: ago(1) },
    { adId: 'fb_pk_101005', platform: 'facebook', category: 'Electronics', headline: 'Mobile Accessories Wholesale Karachi — 50% Off Today',                 description: 'Fast chargers, cables, covers. Bulk orders welcome.',                  advertiserName: 'Accessories Depot',  creativeType: 'image',    imageUrl: 'https://images.unsplash.com/photo-1601972599720-36938d4ecd31?w=400', directUrl: 'https://www.facebook.com/ads/library/?id=101005', daysRunning: 22, spendLevel: 'medium', city: 'Karachi',    isActive: true, scrapedAt: ago(2) },
    { adId: 'fb_pk_101006', platform: 'facebook', category: 'Electronics', headline: 'Smart Watch Rawalpindi Genuine COD Rs 4,200',                          description: 'Samsung Galaxy Watch alternative. Free home delivery RWP/ISB.',       advertiserName: 'RWP Tech Store',     creativeType: 'image',    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', directUrl: 'https://www.facebook.com/ads/library/?id=101006', daysRunning: 14, spendLevel: 'low',    city: 'Rawalpindi', isActive: true, scrapedAt: ago(3) },
    { adId: 'fb_pk_101007', platform: 'facebook', category: 'Electronics', headline: 'Kids Learning Tablet 8 inch Pakistan — Educational Apps Pre-loaded',   description: 'Pre-loaded with Urdu + English learning apps. Daraz COD Rs 5,999.',  advertiserName: 'EduTech Pakistan',   creativeType: 'video',    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400', directUrl: 'https://www.facebook.com/ads/library/?id=101007', daysRunning: 28, spendLevel: 'medium', city: 'Islamabad',  isActive: true, scrapedAt: ago(2) },
    // Fashion
    { adId: 'fb_pk_102001', platform: 'facebook', category: 'Fashion',     headline: 'Khaddar Suit Unstitched 3-Piece — Rs 1,850 Free Delivery Pakistan',   description: 'Premium Faisalabad khaddar fabric. Winter collection 2026. COD.',     advertiserName: 'Faisalabad Fabrics', creativeType: 'image',    imageUrl: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400', directUrl: 'https://www.facebook.com/ads/library/?id=102001', daysRunning: 55, spendLevel: 'high',   city: 'Lahore',     isActive: true, scrapedAt: ago(1) },
    { adId: 'fb_pk_102002', platform: 'facebook', category: 'Fashion',     headline: 'Sneakers Nike Quality Rs 2,499 Karachi Same Day Delivery',             description: 'All sizes available. Men & women. Order on WhatsApp.',                advertiserName: 'Shoe Palace KHI',    creativeType: 'carousel', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', directUrl: 'https://www.facebook.com/ads/library/?id=102002', daysRunning: 41, spendLevel: 'high',   city: 'Karachi',    isActive: true, scrapedAt: ago(1) },
    { adId: 'fb_pk_102003', platform: 'facebook', category: 'Fashion',     headline: 'Handbag Branded Quality Lahore — Rs 1,299 Nationwide Delivery',        description: 'Ladies hand bags latest designs 2026. Cash on delivery.',             advertiserName: 'Trendy Bags LHR',    creativeType: 'video',    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400', directUrl: 'https://www.facebook.com/ads/library/?id=102003', daysRunning: 37, spendLevel: 'medium', city: 'Lahore',     isActive: true, scrapedAt: ago(2) },
    { adId: 'fb_pk_102004', platform: 'facebook', category: 'Fashion',     headline: 'Khaddar Suits Multan Wholesale — Resellers Welcome',                   description: 'Multan mill price. Minimum 50 suits. WhatsApp order.',               advertiserName: 'Multan Textile Co',  creativeType: 'image',    imageUrl: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400', directUrl: 'https://www.facebook.com/ads/library/?id=102004', daysRunning: 62, spendLevel: 'high',   city: 'Multan',     isActive: true, scrapedAt: ago(1) },
    { adId: 'fb_pk_102005', platform: 'facebook', category: 'Fashion',     headline: 'Shoes Sneakers Islamabad Boys Girls All Sizes',                        description: 'Best quality sports shoes. G-9 Markaz delivery same day.',           advertiserName: 'Capital Footwear',   creativeType: 'carousel', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', directUrl: 'https://www.facebook.com/ads/library/?id=102005', daysRunning: 19, spendLevel: 'low',    city: 'Islamabad',  isActive: true, scrapedAt: ago(3) },
    { adId: 'fb_pk_102006', platform: 'facebook', category: 'Fashion',     headline: 'Ladies Handbag Faisalabad — Latest 2026 Designs Rs 999',               description: 'School bag, office bag, casual purse. All colors available.',         advertiserName: 'FSD Fashion Hub',    creativeType: 'image',    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400', directUrl: 'https://www.facebook.com/ads/library/?id=102006', daysRunning: 25, spendLevel: 'medium', city: 'Faisalabad', isActive: true, scrapedAt: ago(2) },
    // Beauty
    { adId: 'fb_pk_103001', platform: 'facebook', category: 'Beauty',      headline: 'Skin Brightening Serum Pakistan — Glow in 7 Days Rs 1,200',           description: 'Vitamin C + niacinamide formula. Daraz top rated. COD Pakistan.',    advertiserName: 'Glow PK Official',   creativeType: 'video',    imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400', directUrl: 'https://www.facebook.com/ads/library/?id=103001', daysRunning: 72, spendLevel: 'high',   city: 'Karachi',    isActive: true, scrapedAt: ago(1) },
    { adId: 'fb_pk_103002', platform: 'facebook', category: 'Beauty',      headline: 'Whitening Serum Lahore Results in 14 Days — Rs 999',                  description: 'FDA approved ingredients. Cruelty free. Lahore delivery 2 hours.',   advertiserName: 'Pure Beauty LHR',    creativeType: 'image',    imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400', directUrl: 'https://www.facebook.com/ads/library/?id=103002', daysRunning: 58, spendLevel: 'high',   city: 'Lahore',     isActive: true, scrapedAt: ago(1) },
    { adId: 'fb_pk_103003', platform: 'facebook', category: 'Beauty',      headline: 'Skin Care Routine Kit Islamabad — 3 Products Rs 1,800',               description: 'Cleanser + serum + moisturizer set. Free delivery Islamabad.',       advertiserName: 'SkinFirst ISB',      creativeType: 'carousel', imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400', directUrl: 'https://www.facebook.com/ads/library/?id=103003', daysRunning: 44, spendLevel: 'medium', city: 'Islamabad',  isActive: true, scrapedAt: ago(2) },
    { adId: 'fb_pk_103004', platform: 'facebook', category: 'Beauty',      headline: 'Beauty Serum Vitamin C Pakistan Rs 850 — Buy 2 Get 1 Free',           description: 'Bestseller on Daraz. 10,000+ sold. Order now COD.',                  advertiserName: 'VitaGlow Store',     creativeType: 'video',    imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400', directUrl: 'https://www.facebook.com/ads/library/?id=103004', daysRunning: 90, spendLevel: 'high',   city: 'Rawalpindi', isActive: true, scrapedAt: ago(1) },
    { adId: 'fb_pk_103005', platform: 'facebook', category: 'Beauty',      headline: 'Anti-aging Serum Multan — Rs 1,100 Dermatologist Tested',             description: 'Retinol formula. Ships to Multan, Karachi, Lahore.',                 advertiserName: 'DermaCare PK',       creativeType: 'image',    imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400', directUrl: 'https://www.facebook.com/ads/library/?id=103005', daysRunning: 33, spendLevel: 'medium', city: 'Multan',     isActive: true, scrapedAt: ago(2) },
    { adId: 'fb_pk_103006', platform: 'facebook', category: 'Beauty',      headline: 'Skin Brightening Face Wash Faisalabad — Rs 450 Only',                 description: 'For all skin types. Removes dark spots in weeks.',                   advertiserName: 'FreshSkin Co',       creativeType: 'image',    imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400', directUrl: 'https://www.facebook.com/ads/library/?id=103006', daysRunning: 18, spendLevel: 'low',    city: 'Faisalabad', isActive: true, scrapedAt: ago(3) },
    // Home
    { adId: 'fb_pk_104001', platform: 'facebook', category: 'Home',        headline: 'Air Fryer 5L Pakistan Rs 8,999 — Oil Free Cooking COD',               description: 'Fry, bake, grill without oil. 1 year warranty. Karachi delivery.',  advertiserName: 'Home Appliances PK', creativeType: 'video',    imageUrl: 'https://images.unsplash.com/photo-1648510823789-40bcd7a52c36?w=400', directUrl: 'https://www.facebook.com/ads/library/?id=104001', daysRunning: 50, spendLevel: 'high',   city: 'Karachi',    isActive: true, scrapedAt: ago(1) },
    { adId: 'fb_pk_104002', platform: 'facebook', category: 'Home',        headline: 'Air Fryer Lahore Genuine Brand Rs 9,500 Free Delivery',               description: 'Digital display, 8 cooking modes. Lahore, Islamabad, RWP delivery.', advertiserName: 'Kitchen Pro LHR',    creativeType: 'image',    imageUrl: 'https://images.unsplash.com/photo-1648510823789-40bcd7a52c36?w=400', directUrl: 'https://www.facebook.com/ads/library/?id=104002', daysRunning: 39, spendLevel: 'high',   city: 'Lahore',     isActive: true, scrapedAt: ago(1) },
    { adId: 'fb_pk_104003', platform: 'facebook', category: 'Home',        headline: 'Neck Massager Electric Pakistan Rs 2,800 — Instant Pain Relief',       description: 'Heat + vibration therapy. Office & home use. COD available.',       advertiserName: 'HealthCare Gadgets', creativeType: 'video',    imageUrl: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=400', directUrl: 'https://www.facebook.com/ads/library/?id=104003', daysRunning: 46, spendLevel: 'medium', city: 'Islamabad',  isActive: true, scrapedAt: ago(2) },
    { adId: 'fb_pk_104004', platform: 'facebook', category: 'Home',        headline: 'Air Fryer Faisalabad Rawalpindi Rs 7,999 — 4L Capacity',               description: 'Best for family cooking. 2 year warranty. Cash on delivery.',       advertiserName: 'Appliance World',    creativeType: 'carousel', imageUrl: 'https://images.unsplash.com/photo-1648510823789-40bcd7a52c36?w=400', directUrl: 'https://www.facebook.com/ads/library/?id=104004', daysRunning: 28, spendLevel: 'medium', city: 'Faisalabad', isActive: true, scrapedAt: ago(2) },
    { adId: 'fb_pk_104005', platform: 'facebook', category: 'Home',        headline: 'Neck Massager Karachi Lahore Rs 3,200 — Doctor Recommended',           description: 'Cervical pain relief in 15 minutes. EMS technology.',               advertiserName: 'Wellness PK',        creativeType: 'image',    imageUrl: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=400', directUrl: 'https://www.facebook.com/ads/library/?id=104005', daysRunning: 35, spendLevel: 'medium', city: 'Karachi',    isActive: true, scrapedAt: ago(2) },
    { adId: 'fb_pk_104006', platform: 'facebook', category: 'Home',        headline: 'Air Fryer Islamabad Official Dealer Rs 11,000 — XL Size',              description: '6.5L family size air fryer. Same day delivery Islamabad.',          advertiserName: 'Capital Appliances', creativeType: 'image',    imageUrl: 'https://images.unsplash.com/photo-1648510823789-40bcd7a52c36?w=400', directUrl: 'https://www.facebook.com/ads/library/?id=104006', daysRunning: 21, spendLevel: 'low',    city: 'Islamabad',  isActive: true, scrapedAt: ago(3) },
    // Sports
    { adId: 'fb_pk_105001', platform: 'facebook', category: 'Sports',      headline: 'Yoga Mat Premium Non-Slip Pakistan Rs 2,200 — Free Bag Included',     description: '6mm thick, eco-friendly. Comes with carry strap. Nationwide.',     advertiserName: 'FitLife Pakistan',   creativeType: 'image',    imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400', directUrl: 'https://www.facebook.com/ads/library/?id=105001', daysRunning: 30, spendLevel: 'medium', city: 'Islamabad',  isActive: true, scrapedAt: ago(2) },
    { adId: 'fb_pk_105002', platform: 'facebook', category: 'Sports',      headline: 'Yoga Mat Karachi Lahore Rs 1,800 — Exercise at Home',                 description: 'Anti-slip surface, 5mm cushion. Also available in Faisalabad.',    advertiserName: 'Active Living PK',   creativeType: 'video',    imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400', directUrl: 'https://www.facebook.com/ads/library/?id=105002', daysRunning: 17, spendLevel: 'low',    city: 'Lahore',     isActive: true, scrapedAt: ago(3) },
    // Toys
    { adId: 'fb_pk_106001', platform: 'facebook', category: 'Toys',        headline: 'Kids Learning Tablet Karachi Rs 5,500 — 50+ Educational Games',       description: 'Toddler-friendly, drop-proof case. Urdu & English pre-loaded.',    advertiserName: 'KidSmart Store',     creativeType: 'video',    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400', directUrl: 'https://www.facebook.com/ads/library/?id=106001', daysRunning: 24, spendLevel: 'medium', city: 'Karachi',    isActive: true, scrapedAt: ago(2) },
    { adId: 'fb_pk_106002', platform: 'facebook', category: 'Toys',        headline: 'Learning Tablet Lahore Peshawar Pakistan Rs 6,200 COD',               description: 'Age 3-12. Built-in WiFi, 2GB RAM. Educational & fun.',             advertiserName: 'LittleGenius PK',    creativeType: 'image',    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400', directUrl: 'https://www.facebook.com/ads/library/?id=106002', daysRunning: 31, spendLevel: 'medium', city: 'Peshawar',   isActive: true, scrapedAt: ago(2) },
  ], { ordered: false });

  console.log('[seed] ✅ Seeded 29 Facebook ads across 6 categories');
}
