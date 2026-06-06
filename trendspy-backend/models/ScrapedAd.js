import mongoose from 'mongoose';

const scrapedAdSchema = new mongoose.Schema(
  {
    // Linked product (optional — only set after product matching)
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    productName: {
      type: String,
      trim: true,
      index: true,
    },
    platform: {
      type: String,
      enum: ['facebook', 'instagram', 'tiktok'],
      required: [true, 'Platform is required'],
    },
    // Platform-specific unique ad identifier
    adId: {
      type: String,
      required: [true, 'Ad ID is required'],
      unique: true,
    },
    headline: { type: String, default: '' },
    description: { type: String, default: '' },
    creativeType: {
      type: String,
      enum: ['image', 'video', 'carousel'],
      default: 'image',
    },
    imageUrl: { type: String, default: null },
    videoUrl: { type: String, default: null },
    advertiserName: { type: String, default: '' },
    advertiserPage: { type: String, default: '' },
    // How many days this ad has been running — longer = more profitable signal
    daysRunning: { type: Number, default: 0 },
    spendLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low',
    },
    city: { type: String, default: null, index: true },
    category: { type: String, default: null },
    scrapedAt: { type: Date, default: Date.now, index: true },
    isActive: { type: Boolean, default: true },
    // Direct link to the ad in Facebook Ads Library
    directUrl: { type: String, default: null },
  },
  { timestamps: true }
);

// Compound and single-field indexes
scrapedAdSchema.index({ platform: 1, productName: 1 });
// Ads running >30 days = proven winner signal
scrapedAdSchema.index({ daysRunning: -1 });
// City-based filtering (used by adWinningService city filter)
scrapedAdSchema.index({ city: 1, category: 1, scrapedAt: -1 });

const ScrapedAd =
  mongoose.models.ScrapedAd || mongoose.model('ScrapedAd', scrapedAdSchema);
export default ScrapedAd;
