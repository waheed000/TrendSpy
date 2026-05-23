/**
 * TikTok Scraper — fits-api (no API key required)
 * Fetches videos from known Pakistani e-commerce/shopping TikTok accounts
 * and extracts product signals to update Product documents.
 */

import { getUserVideos } from 'fits-api';
import { connectDB } from '../lib/db.js';
import { Product } from '../models/index.js';

// Pakistani shopping/e-commerce TikTok accounts to track
const PK_TIKTOK_ACCOUNTS = [
  'daraz.pk',
  'darazofficial',
  'olxpakistan',
  'telemart.pk',
  'homeshopping.pk',
  'shophive',
  'clicky.pk',
];

// Keywords in captions that signal a product mention
const PRODUCT_KEYWORDS = [
  'buy', 'order', 'price', 'sale', 'discount', 'deal', 'shop', 'available',
  'pkr', 'rs.', 'rupees', 'daraz', 'olx', 'delivery', 'cod', 'cash on delivery',
];

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Extract product name hints from a video caption.
 * @param {string} description
 * @returns {string[]}
 */
function extractProductMentions(description) {
  if (!description) return [];
  const lower = description.toLowerCase();
  const hasMention = PRODUCT_KEYWORDS.some((kw) => lower.includes(kw));
  if (!hasMention) return [];

  const hashtagMatches = description.match(/#([a-zA-Z][a-zA-Z0-9_]{2,})/g) || [];
  const ignore = new Set(['darazpakistan', 'olxpakistan', 'pakistanshopping', 'pakistan', 'viral', 'fyp', 'foryou', 'trending']);

  return hashtagMatches
    .map((h) =>
      h.slice(1)
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/_/g, ' ')
        .toLowerCase()
        .trim()
    )
    .filter((name) => name.length > 3 && !ignore.has(name.replace(/\s/g, '')));
}

/**
 * Aggregate stats from a list of video objects.
 */
function aggregateStats(videos) {
  let totalViews = 0;
  let totalLikes = 0;
  const productMentions = [];

  for (const v of videos) {
    totalViews += v.playCount   || v.viewCount   || v.stats?.playCount   || 0;
    totalLikes += v.diggCount  || v.likeCount   || v.stats?.diggCount   || 0;
    const desc = v.desc || v.description || v.title || '';
    productMentions.push(...extractProductMentions(desc));
  }

  return { totalViews, totalLikes, videoCount: videos.length, productMentions };
}

/**
 * Update Product documents with TikTok signals.
 */
async function updateProductSignals(productMentions, viewsToAdd, hashtagVolume) {
  let updated = 0;
  for (const mention of [...new Set(productMentions)]) {
    try {
      const result = await Product.findOneAndUpdate(
        { name: { $regex: mention, $options: 'i' } },
        {
          $inc: { tiktokViews: viewsToAdd, tiktokHashtagVolume: hashtagVolume },
          $set: { lastScrapedAt: new Date() },
          $addToSet: { platforms: 'tiktok' },
        },
        { new: true }
      );
      if (result) {
        result.updateWinScore();
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
 * Main TikTok scraper — uses fits-api getUserVideos.
 */
async function tiktokScraper({ accounts, maxVideos = 10 } = {}) {
  await connectDB();

  const targets = accounts || PK_TIKTOK_ACCOUNTS;
  const signals = [];
  let totalProductsUpdated = 0;

  for (const username of targets) {
    console.log(`[${new Date().toISOString()}] [TikTok] Fetching videos for @${username}`);

    try {
      const videos = await getUserVideos(username, { count: maxVideos });
      const videoList = Array.isArray(videos) ? videos : (videos?.videos || videos?.data || []);

      if (!videoList.length) {
        console.log(`[TikTok] @${username}: no videos returned`);
        continue;
      }

      const stats = aggregateStats(videoList);

      console.log(
        `[TikTok] @${username}: ${stats.videoCount} videos, ` +
        `${stats.totalViews.toLocaleString()} views, ` +
        `${stats.productMentions.length} product mentions`
      );

      signals.push({ account: username, ...stats, scrapedAt: new Date() });

      const updated = await updateProductSignals(
        stats.productMentions,
        stats.totalViews,
        stats.videoCount * 500
      );
      totalProductsUpdated += updated;

      // Polite delay between requests (1–3 seconds)
      await delay(1000 + Math.random() * 2000);
    } catch (err) {
      console.error(`[TikTok] Error fetching @${username}:`, err.message);
      // One account failing does NOT stop the rest
    }
  }

  console.log(`[TikTok] Done. Accounts scraped: ${signals.length}, Products updated: ${totalProductsUpdated}`);
  return { signals, productsUpdated: totalProductsUpdated };
}

export default tiktokScraper;
