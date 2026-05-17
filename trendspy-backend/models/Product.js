import mongoose from 'mongoose';
import slugify from 'slugify';

const VALID_CATEGORIES = ['Fashion', 'Electronics', 'Beauty', 'Home', 'Grocery', 'Toys', 'Sports', 'Books'];
const VALID_PLATFORMS = ['daraz', 'olx', 'tiktok', 'facebook', 'instagram'];
const VALID_CITIES = ['Lahore', 'Karachi', 'Islamabad', 'Faisalabad', 'Rawalpindi', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala'];

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: VALID_CATEGORIES,
      index: true,
    },
    imageUrl: { type: String, default: null },
    images: [{ type: String }],
    description: { type: String, default: '' },
    platforms: [{ type: String, enum: VALID_PLATFORMS }],
    cities: [{ type: String, enum: VALID_CITIES }],

    // Pricing
    priceMin: { type: Number, min: 0, default: 0 },
    priceMax: { type: Number, min: 0, default: 0 },

    // AI Win Score (0-100); computed from signals below
    winScore: { type: Number, min: 0, max: 100, default: 0, index: true },

    // Daraz signals
    darazOrders: { type: Number, default: 0 },
    darazRating: { type: Number, min: 0, max: 5, default: 0 },

    // OLX signals
    olxViews: { type: Number, default: 0 },
    olxListings: { type: Number, default: 0 },
    activeAds: { type: Number, default: 0 },

    // TikTok / social signals
    tiktokViews: { type: Number, default: 0 },
    tiktokHashtagVolume: { type: Number, default: 0 },

    // External demand signals
    googleTrendSpike: { type: Number, default: 0 }, // % increase
    alibabaOrderSurge: { type: Number, default: 0 }, // % increase

    // Seasonal relevance score (0-100)
    seasonalRelevance: { type: Number, min: 0, max: 100, default: 0 },

    trend: {
      type: String,
      enum: ['rising', 'falling', 'stable'],
      default: 'stable',
      index: true,
    },

    competitorCount: { type: Number, default: 0 },
    lastScrapedAt: { type: Date, default: null },

    // Quick-filter flag: true when winScore >= 75
    isWinning: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Compound and multi-key indexes
productSchema.index({ winScore: -1 });
productSchema.index({ category: 1, winScore: -1 });
productSchema.index({ cities: 1 }); // multikey
productSchema.index({ lastScrapedAt: -1 });

// Auto-generate slug from name before validate
productSchema.pre('validate', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Sync isWinning flag before saving
productSchema.pre('save', function (next) {
  this.isWinning = this.winScore >= 75;
  next();
});

// Instance: recalculate win score from raw signals and save
productSchema.methods.updateWinScore = function () {
  const darazScore = Math.min((this.darazOrders / 1000) * 30, 30);
  const olxScore = Math.min((this.olxViews / 50000) * 20, 20);
  const tiktokScore = Math.min((this.tiktokViews / 1000000) * 20, 20);
  const trendScore = Math.min(this.googleTrendSpike / 5, 15);
  const seasonalScore = (this.seasonalRelevance / 100) * 15;

  this.winScore = Math.round(
    Math.min(darazScore + olxScore + tiktokScore + trendScore + seasonalScore, 100)
  );
  this.isWinning = this.winScore >= 75;
  return this.winScore;
};

// Instance: return formatted price range string (Rs.)
productSchema.methods.getPriceRange = function () {
  const fmt = (n) => `Rs. ${n.toLocaleString('en-PK')}`;
  if (this.priceMin === this.priceMax) return fmt(this.priceMin);
  return `${fmt(this.priceMin)} – ${fmt(this.priceMax)}`;
};

// Static: winners filtered by city, category, minScore
productSchema.statics.findWinners = function (city, category, minScore = 75) {
  const query = { winScore: { $gte: minScore } };
  if (city) query.cities = city;
  if (category) query.category = category;
  return this.find(query).sort({ winScore: -1 });
};

productSchema.statics.findByCity = function (city) {
  return this.find({ cities: city }).sort({ winScore: -1 });
};

productSchema.statics.findByCategory = function (category) {
  return this.find({ category }).sort({ winScore: -1 });
};

productSchema.statics.findRising = function () {
  return this.find({ trend: 'rising' }).sort({ winScore: -1 });
};

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;
