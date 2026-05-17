/**
 * Win Score Calculation Engine
 * Computes a 0-100 Win Score for each product based on weighted market signals.
 *
 * | Signal               | Weight | Source field              |
 * |----------------------|--------|---------------------------|
 * | Daraz sales velocity | 20     | darazOrders               |
 * | Google Trends spike  | 15     | googleTrendSpike (%)       |
 * | Facebook active ads  | 20     | activeAds                 |
 * | Social engagement    | 15     | tiktokViews               |
 * | OLX marketplace      | 10     | olxViews + olxListings    |
 * | Alibaba order surge  | 10     | alibabaOrderSurge (%)     |
 * | Seasonal relevance   | 10     | seasonalRelevance (0-100) |
 */

import { connectDB } from '../lib/db.js';
import { Product } from '../models/index.js';
import { getSeasonalRelevance } from './seasonalService.js';

// Score weight table (must sum to 100)
const WEIGHTS = {
  darazSalesVelocity: 20,
  googleTrendsSpike:  15,
  facebookActiveAds:  20,
  socialEngagement:   15,
  olxMarketplace:     10,
  alibabaOrderSurge:  10,
  seasonalRelevance:  10,
};

// Normalization caps — values above these are treated as 100
const CAPS = {
  darazOrders:       5000,   // orders; 5k+ = max score
  googleTrendSpike:  150,    // % increase; 150%+ = max
  activeAds:         50,     // ads; 50+ = max
  tiktokViews:       5000000,// 5M views = max
  olxViews:          100000, // 100k views = max
  olxListings:       500,    // 500 listings = max
  alibabaOrderSurge: 100,    // % surge; 100%+ = max
};

/**
 * Normalize a raw value to a 0–100 scale, capped at `cap`.
 * @param {number} value
 * @param {number} cap
 * @returns {number}
 */
function normalize(value, cap) {
  if (!value || value <= 0) return 0;
  return Math.min((value / cap) * 100, 100);
}

/**
 * Calculate the Win Score for a single product object.
 * Does NOT persist — caller is responsible for saving.
 * @param {Object} product - Mongoose document or plain object with signal fields
 * @returns {number} Win Score 0–100
 */
export function calculateWinScore(product) {
  // If no data signals at all, return a base score
  const hasData =
    product.darazOrders > 0 ||
    product.googleTrendSpike > 0 ||
    product.activeAds > 0 ||
    product.tiktokViews > 0 ||
    product.olxViews > 0 ||
    product.alibabaOrderSurge > 0;

  if (!hasData) return 30;

  // Retrieve seasonal relevance (uses stored value if present, else compute live)
  const seasonal =
    product.seasonalRelevance > 0
      ? product.seasonalRelevance
      : getSeasonalRelevance(product.category);

  // Normalize each signal to 0-100
  const darazScore    = normalize(product.darazOrders, CAPS.darazOrders);
  const trendsScore   = normalize(product.googleTrendSpike, CAPS.googleTrendSpike);
  const adsScore      = normalize(product.activeAds, CAPS.activeAds);
  const tiktokScore   = normalize(product.tiktokViews, CAPS.tiktokViews);
  const olxScore      = normalize(
    (product.olxViews || 0) + (product.olxListings || 0) * 100,
    CAPS.olxViews
  );
  const alibabaScore  = normalize(product.alibabaOrderSurge, CAPS.alibabaOrderSurge);
  const seasonScore   = Math.min(seasonal, 100);

  const raw =
    darazScore   * (WEIGHTS.darazSalesVelocity / 100) +
    trendsScore  * (WEIGHTS.googleTrendsSpike  / 100) +
    adsScore     * (WEIGHTS.facebookActiveAds  / 100) +
    tiktokScore  * (WEIGHTS.socialEngagement   / 100) +
    olxScore     * (WEIGHTS.olxMarketplace     / 100) +
    alibabaScore * (WEIGHTS.alibabaOrderSurge  / 100) +
    seasonScore  * (WEIGHTS.seasonalRelevance  / 100);

  return Math.min(Math.round(raw), 100);
}

/**
 * Recalculate and persist Win Scores for all products.
 * Processes in batches to avoid overwhelming MongoDB.
 * @param {{ batchSize?: number }} options
 * @returns {Promise<{ processed: number, updated: number, winners: number }>}
 */
export async function updateAllWinScores({ batchSize = 100 } = {}) {
  await connectDB();

  let processed = 0;
  let updated = 0;
  let winners = 0;
  let skip = 0;

  console.log(`[${new Date().toISOString()}] [WinScore] Starting full score update…`);

  while (true) {
    const batch = await Product.find({})
      .select('name category darazOrders googleTrendSpike activeAds tiktokViews olxViews olxListings alibabaOrderSurge seasonalRelevance winScore')
      .skip(skip)
      .limit(batchSize)
      .lean();

    if (batch.length === 0) break;

    const bulkOps = batch.map((product) => {
      const score = calculateWinScore(product);
      const isWinning = score >= 75;
      if (isWinning) winners++;
      return {
        updateOne: {
          filter: { _id: product._id },
          update: { $set: { winScore: score, isWinning } },
        },
      };
    });

    await Product.bulkWrite(bulkOps);

    processed += batch.length;
    updated += bulkOps.length;
    skip += batchSize;

    console.log(`[WinScore] Processed ${processed} products so far…`);
  }

  console.log(
    `[${new Date().toISOString()}] [WinScore] Done. Processed: ${processed}, Updated: ${updated}, Winners (≥75): ${winners}`
  );

  return { processed, updated, winners };
}

/**
 * Fetch winning products filtered by optional city, category, and minimum score.
 * @param {{ city?: string, category?: string, minScore?: number }} options
 * @returns {Promise<Array>}
 */
export async function getWinningProducts({ city, category, minScore = 75 } = {}) {
  await connectDB();

  const query = { winScore: { $gte: minScore } };
  if (city) query.cities = city;
  if (category) query.category = category;

  return Product.find(query)
    .sort({ winScore: -1 })
    .select('name slug category winScore cities platforms priceMin priceMax trend imageUrl')
    .lean();
}

export default { calculateWinScore, updateAllWinScores, getWinningProducts };
