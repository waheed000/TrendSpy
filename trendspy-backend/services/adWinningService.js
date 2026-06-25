/**
 * Ad-Based Winning Product Detection
 *
 * Uses ONLY real scraped Facebook Ad Library data.
 * Groups ads by category → clusters by advertiser → scores by:
 *   - Advertiser diversity  (40 pts)  — many sellers = hot product
 *   - Volume                (30 pts)  — total ads in window
 *   - Longevity             (20 pts)  — 30+ days running = proven winner
 *   - Spend level           (10 pts)  — high spend = profitable product
 *
 * Supports optional city filter — only ads with that city tag are counted.
 * Uses MongoDB aggregation — never loads all docs into memory.
 */

import { connectDB }   from '../lib/db.js';
import { ScrapedAd }   from '../models/index.js';
import { extractCity } from '../lib/extractCity.js';

const WINDOW_DAYS = 7;

// ── Noise phrases stripped before keyword extraction ─────────────────────────
const NOISE_RE = /limited\s*time|flash\s*sale|sale|offer|buy\s*now|shop\s*now|free\s*shipping|order\s*now|discount|off|get\s*yours|hurry|don['']t\s*miss|check\s*out|click\s*here|learn\s*more|whatsapp|whats\s*app|cod\s*available|cash\s*on\s*delivery|nationwide\s*delivery|same\s*day|home\s*delivery|\d+%|rs\.?\s*\d+|pkr\s*\d+|pk|pakistan/gi;

// Single words that are too generic to form a meaningful product name
const GENERIC_WORDS = new Set([
  // English marketing filler
  'love','our','you','know','non','stop','get','new','best','top','the','for',
  'and','with','your','this','that','more','all','now','buy','fast','good',
  'great','big','just','only','very','much','also','some','come','want','need',
  'give','take','make','like','look','see','use','can','has','had','not','but',
  'are','was','were','will','have','been','its','any','one','two','how','why',
  'who','day','time','way','may','per','yet','via','get','free','cod','home',
  'order','shop','price','brand','original','quality','latest','new','sale',
  'collection','made','style','designs','design','color','colors','size','sizes',
  'stock','available','delivery','shipping','nationwide','introducing','meet',
  'smart','smartness','amazing','awesome','perfect','ideal','ultimate','premium',
  // Roman Urdu common words
  'nayi','wali','purani','jadoo','karo','hai','mein','kar','kal','aaj',
  'sirf','abhi','hain','nahi','bhi','toh','se','ki','ka','ko','ne','par',
  'agar','phir','kuch','yeh','woh','aur','lekin','kyun','jab','sab',
]);

/** Strip noise, collapse whitespace, take first N words. */
function cleanHeadline(headline, words = 6) {
  if (!headline) return '';
  return headline
    .replace(NOISE_RE, ' ')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, words)
    .join(' ')
    .toLowerCase();
}

// ── Base match filter ─────────────────────────────────────────────────────────

function baseMatch(since, city) {
  const m = {
    scrapedAt:  { $gte: since },
    isActive:   true,
    category:   { $ne: null, $exists: true },
    headline:   { $ne: null, $exists: true },
  };
  // When city is provided, filter to ads that mention that city.
  // Ads where city is null are national-scope (not excluded from "All Cities").
  if (city) m.city = city;
  return m;
}

// ── Stage 1: per-category aggregation ────────────────────────────────────────

async function getCategorySignals(since, city) {
  return ScrapedAd.aggregate([
    { $match: baseMatch(since, city) },
    {
      $group: {
        _id:              '$category',
        uniqueAdv:        { $addToSet: '$advertiserName' },
        totalAds:         { $sum: 1 },
        maxDays:          { $max: '$daysRunning' },
        avgDays:          { $avg: '$daysRunning' },
        spendSum:         { $sum: { $cond: [{ $eq: ['$spendLevel', 'high'] }, 1, 0] } },
        headlines:        { $push: '$headline' },
        platforms:        { $addToSet: '$platform' },
        sampleDirectUrls: { $push: '$directUrl' },
      },
    },
    {
      $addFields: { advCount: { $size: '$uniqueAdv' } },
    },
    { $sort: { advCount: -1, totalAds: -1 } },
    { $limit: 30 },
  ]);
}

// ── Stage 2: top advertisers per category ─────────────────────────────────────

async function getTopAdvertisers(category, since, city, limit = 3) {
  const m = { ...baseMatch(since, city), category };
  return ScrapedAd.aggregate([
    { $match: m },
    {
      $group: {
        _id:       '$advertiserName',
        adCount:   { $sum: 1 },
        maxDays:   { $max: '$daysRunning' },
        spendSum:  { $sum: { $cond: [{ $eq: ['$spendLevel', 'high'] }, 1, 0] } },
        headlines: { $push: '$headline' },
        directUrl: { $first: '$directUrl' },
      },
    },
    { $sort: { adCount: -1, maxDays: -1 } },
    { $limit: limit },
  ]);
}

// ── Scoring ────────────────────────────────────────────────────────────────────

function scoreCategory({ advCount, totalAds, maxDays, spendSum }) {
  let s = 0;
  s += Math.min(40, advCount * 8);             // advertiser diversity (max 40)
  s += Math.min(30, Math.round(totalAds / 2)); // volume (max 30)
  s += maxDays >= 30 ? 20 : maxDays >= 14 ? 10 : maxDays >= 7 ? 5 : 0; // longevity (max 20)
  s += Math.min(10, spendSum * 2);             // high-spend signal (max 10)
  return Math.min(100, s);
}

/**
 * Extract the most frequent meaningful 2-gram from ad headlines.
 * Filters out generic marketing words and Roman Urdu filler.
 * Falls back to the category name when no good bigram is found.
 */
function extractTopKeyword(headlines, category) {
  const freq = {};
  for (const h of headlines) {
    const words = cleanHeadline(h, 8)
      .split(' ')
      .filter((w) => w.length > 2 && !GENERIC_WORDS.has(w));
    for (let i = 0; i < words.length - 1; i++) {
      // Only count bigrams where BOTH words are product-relevant
      if (GENERIC_WORDS.has(words[i]) || GENERIC_WORDS.has(words[i + 1])) continue;
      const bigram = `${words[i]} ${words[i + 1]}`;
      freq[bigram] = (freq[bigram] || 0) + 1;
    }
  }

  // Require the bigram to appear in at least 2 ads to be considered real signal
  const candidates = Object.entries(freq)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1]);

  if (candidates.length > 0) {
    return candidates[0][0].replace(/\b\w/g, (c) => c.toUpperCase());
  }

  // Fall back to best single word (ignoring generics)
  const wordFreq = {};
  for (const h of headlines) {
    const words = cleanHeadline(h, 8)
      .split(' ')
      .filter((w) => w.length > 3 && !GENERIC_WORDS.has(w));
    for (const w of words) wordFreq[w] = (wordFreq[w] || 0) + 1;
  }
  const topWord = Object.entries(wordFreq)
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])[0];

  if (topWord) return topWord[0].replace(/\b\w/g, (c) => c.toUpperCase());

  // Final fallback: use the category name itself
  return category || 'Trending Products';
}

// ── Backfill city field on existing ads ──────────────────────────────────────

let _backfillDone = false;

/**
 * One-time in-process backfill.
 * Reads all ads where city is null, extracts city from text fields,
 * and bulk-writes the matches back. No-ops if already done this process.
 */
export async function backfillCities() {
  if (_backfillDone) return;
  _backfillDone = true;           // prevent concurrent runs

  await connectDB();

  const ads = await ScrapedAd.find(
    { city: null },
    { _id: 1, headline: 1, description: 1, advertiserName: 1 }
  ).lean();

  if (ads.length === 0) return;

  const ops = [];
  let tagged = 0;

  for (const ad of ads) {
    const city = extractCity(ad.headline, ad.description, ad.advertiserName);
    if (city) {
      ops.push({ updateOne: { filter: { _id: ad._id }, update: { $set: { city } } } });
      tagged++;
    }
  }

  if (ops.length > 0) {
    await ScrapedAd.bulkWrite(ops, { ordered: false });
    console.log(`[adWinningService] Backfilled city field on ${tagged}/${ads.length} ads`);
  } else {
    console.log(`[adWinningService] City backfill: no city mentions found in ${ads.length} ads (all national-scope)`);
  }
}

// ── City coverage breakdown ───────────────────────────────────────────────────

/**
 * Returns how many ads per city are in the DB for the current window.
 * Used by the frontend to show which cities have data and disable empty ones.
 */
export async function getCityCoverage() {
  await connectDB();
  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const rows = await ScrapedAd.aggregate([
    { $match: { scrapedAt: { $gte: since }, isActive: true, city: { $ne: null } } },
    { $group: { _id: '$city', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  return Object.fromEntries(rows.map((r) => [r._id, r.count]));
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Return winning "product clusters" derived from real Facebook Ad Library data.
 * @param {number}      limit  Max results (default 20)
 * @param {string|null} city   Optional city filter (e.g. "Lahore")
 * @returns {Promise<Array>}
 */
export async function getAdBasedWinners(limit = 20, city = null) {
  await connectDB();

  const since      = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const categories = await getCategorySignals(since, city);

  if (categories.length === 0) return [];

  const results = await Promise.all(
    categories.map(async (cat) => {
      const topAdvs = await getTopAdvertisers(cat._id, since, city, 3);

      const winScore    = scoreCategory(cat);
      const productName = extractTopKeyword(cat.headlines || [], cat._id);
      const sampleUrl   = (cat.sampleDirectUrls || []).find(Boolean) || null;

      const topAdvertisers = topAdvs.map((a) => ({
        name:        a._id || 'Unknown',
        adCount:     a.adCount,
        maxDays:     Math.round(a.maxDays || 0),
        isHighSpend: a.spendSum > 0,
        sampleUrl:   a.directUrl || null,
        topKeyword:  extractTopKeyword(a.headlines || [], cat._id),
      }));

      return {
        id:              cat._id,
        category:        cat._id,
        name:            productName,
        winScore,
        advertiserCount: cat.advCount,
        totalAds:        cat.totalAds,
        maxDaysRunning:  Math.round(cat.maxDays || 0),
        avgDaysRunning:  Math.round(cat.avgDays || 0),
        highSpendAds:    cat.spendSum,
        platforms:       cat.platforms || ['facebook'],
        topAdvertisers,
        sampleUrl,
        source:          'facebook_ads',
        windowDays:      WINDOW_DAYS,
        isProvenWinner:  (cat.maxDays || 0) >= 30,
        cityFilter:      city || null,
      };
    })
  );

  return results.sort((a, b) => b.winScore - a.winScore).slice(0, limit);
}

/**
 * Summary stats for the UI banner.
 * When city is provided, stats reflect only that city's ads.
 * @param {string|null} city
 */
export async function getAdStats(city = null) {
  await connectDB();
  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const match = city
    ? { scrapedAt: { $gte: since }, isActive: true, city }
    : { scrapedAt: { $gte: since }, isActive: true };

  const [row] = await ScrapedAd.aggregate([
    { $match: match },
    {
      $group: {
        _id:          null,
        totalAds:     { $sum: 1 },
        uniqueAdvs:   { $addToSet: '$advertiserName' },
        categories:   { $addToSet: '$category' },
        maxDays:      { $max: '$daysRunning' },
        lastScraped:  { $max: '$scrapedAt' },
      },
    },
  ]);

  if (!row) return { totalAds: 0, uniqueAdvertisers: 0, categories: 0, maxDaysRunning: 0, lastScraped: null };
  return {
    totalAds:          row.totalAds,
    uniqueAdvertisers: row.uniqueAdvs.length,
    categories:        row.categories.filter(Boolean).length,
    maxDaysRunning:    row.maxDays,
    lastScraped:       row.lastScraped,
  };
}
