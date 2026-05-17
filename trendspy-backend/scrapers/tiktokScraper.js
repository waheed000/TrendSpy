/**
 * TikTok Scraper
 * Uses RapidAPI TikTok endpoint to extract trending product signals for Pakistan.
 * Updates Product.tiktokViews and Product.tiktokHashtagVolume in MongoDB.
 *
 * Requires: TIKTOK_RAPIDAPI_KEY environment variable
 */

import { connectDB } from '../lib/db.js';
import { Product } from '../models/index.js';
import { fetchTrendingByHashtag, fetchTrendingFeed } from '../lib/tiktokApi.js';

// Pakistani shopping hashtags to track
const PAKISTAN_HASHTAGS = [
  'pakistanshopping',
  'darazpakistan',
  'lahoreshopping',
  'karachishopping',
];

// Keywords in captions that signal a product mention
const PRODUCT_MENTION_KEYWORDS = [
  'buy', 'order', 'price', 'sale', 'discount', 'deal', 'shop', 'available',
  'pkr', 'rs.', 'rupees', 'daraz', 'olx', 'delivery', 'cash on delivery', 'cod',
];

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Extract potential product mentions from a TikTok video caption.
 * Returns an array of normalized product name strings.
 * @param {string} description
 * @returns {string[]}
 */
function extractProductMentions(description) {
  if (!description) return [];

  const lower = description.toLowerCase();
  const hasMention = PRODUCT_MENTION_KEYWORDS.some((kw) => lower.includes(kw));
  if (!hasMention) return [];

  // Extract hashtag-style product names (e.g. #airfryer → "air fryer")
  const hashtagMatches = description.match(/#([a-zA-Z][a-zA-Z0-9_]{2,})/g) || [];
  return hashtagMatches
    .map((h) =>
      h.slice(1)
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/_/g, ' ')
        .toLowerCase()
        .trim()
    )
    .filter((name) => name.length > 3 && !PAKISTAN_HASHTAGS.includes(name.replace(/\s/g, '')));
}

/**
 * Aggregate video stats per hashtag.
 * @param {Array} videos
 * @returns {{ totalViews: number, totalLikes: number, videoCount: number, productMentions: string[] }}
 */
function aggregateHashtagStats(videos) {
  const productMentions = [];
  let totalViews = 0;
  let totalLikes = 0;

  for (const v of videos) {
    totalViews += v.viewCount || 0;
    totalLikes += v.likeCount || 0;
    const mentions = extractProductMentions(v.description);
    productMentions.push(...mentions);
  }

  return { totalViews, totalLikes, videoCount: videos.length, productMentions };
}

/**
 * Update Product documents with TikTok signals.
 * Matches by product name substring (case-insensitive).
 * @param {string[]} productMentions
 * @param {number} viewsToAdd
 * @param {number} hashtagVolume
 * @returns {Promise<number>} Number of products updated
 */
async function updateProductSignals(productMentions, viewsToAdd, hashtagVolume) {
  let updated = 0;

  for (const mention of [...new Set(productMentions)]) {
    try {
      const result = await Product.findOneAndUpdate(
        { name: { $regex: mention, $options: 'i' } },
        {
          $inc: {
            tiktokViews: viewsToAdd,
            tiktokHashtagVolume: hashtagVolume,
          },
          $set: { lastScrapedAt: new Date() },
          $addToSet: { platforms: 'tiktok' },
        },
        { new: true }
      );

      if (result) {
        await result.updateWinScore();
        await result.save();
        updated++;
      }
    } catch (err) {
      console.warn(`[TikTok] Failed to update product "${mention}":`, err.message);
    }
  }

  return updated;
}

/**
 * Main scraper function.
 * @param {{ hashtags?: string[], region?: string }} options
 * @returns {Promise<{ signals: Array, productsUpdated: number }>}
 */
async function tiktokScraper({ hashtags, region = 'PK' } = {}) {
  await connectDB();

  const targetHashtags = hashtags || PAKISTAN_HASHTAGS;
  const signals = [];
  let totalProductsUpdated = 0;

  // Scrape each hashtag
  for (const hashtag of targetHashtags) {
    const ts = new Date().toISOString();
    console.log(`[${ts}] [TikTok] Scraping hashtag: #${hashtag}`);

    try {
      const videos = await fetchTrendingByHashtag(hashtag, 10);
      const stats = aggregateHashtagStats(videos);

      console.log(
        `[TikTok] #${hashtag}: ${stats.videoCount} videos, ${stats.totalViews.toLocaleString()} total views, ${stats.productMentions.length} product mentions`
      );

      signals.push({
        hashtag,
        ...stats,
        scrapedAt: new Date(),
      });

      const updated = await updateProductSignals(
        stats.productMentions,
        stats.totalViews,
        stats.videoCount * 1000 // approximate hashtag volume from video count
      );
      totalProductsUpdated += updated;

      // Respectful delay between API calls
      await delay(1500 + Math.random() * 1000);
    } catch (err) {
      console.error(`[TikTok] Error scraping #${hashtag}:`, err.message);
      // One hashtag failing does NOT stop the others
    }
  }

  // Also fetch Pakistan trending feed for broader signals
  const ts = new Date().toISOString();
  console.log(`[${ts}] [TikTok] Fetching trending feed for region: ${region}`);

  try {
    const feedVideos = await fetchTrendingFeed(region, 20);
    const feedStats = aggregateHashtagStats(feedVideos);

    console.log(
      `[TikTok] Feed: ${feedStats.videoCount} trending videos, ${feedStats.productMentions.length} product mentions`
    );

    signals.push({
      hashtag: `trending_feed_${region}`,
      ...feedStats,
      scrapedAt: new Date(),
    });

    const updated = await updateProductSignals(
      feedStats.productMentions,
      feedStats.totalViews,
      0
    );
    totalProductsUpdated += updated;
  } catch (err) {
    console.error(`[TikTok] Error fetching trending feed:`, err.message);
  }

  console.log(`[TikTok] Done. Signals collected: ${signals.length}, Products updated: ${totalProductsUpdated}`);
  return { signals, productsUpdated: totalProductsUpdated };
}

export default tiktokScraper;
