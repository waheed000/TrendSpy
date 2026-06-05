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
 * Uses MongoDB aggregation — never loads all docs into memory.
 */

import { connectDB }   from '../lib/db.js';
import { ScrapedAd }   from '../models/index.js';

const WINDOW_DAYS = 7;

// ── Noise phrases stripped before keyword extraction ─────────────────────────
const NOISE_RE = /limited\s*time|flash\s*sale|sale|offer|buy\s*now|shop\s*now|free\s*shipping|order\s*now|discount|off|get\s*yours|hurry|don['']t\s*miss|check\s*out|click\s*here|learn\s*more|\d+%|rs\.?\s*\d+|pkr\s*\d+|pk|pakistan/gi;

/** Strip noise, collapse whitespace, take first N words. */
function cleanHeadline(headline, words = 4) {
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

/** Map spendLevel strings to numeric weight (model stores lowercase). */
function spendWeight(level) {
  const map = { high: 3, 'very high': 4, medium: 1, low: 0 };
  return map[(level || '').toLowerCase()] || 0;
}

// ── Stage 1: per-category aggregation ────────────────────────────────────────

async function getCategorySignals(since) {
  return ScrapedAd.aggregate([
    {
      $match: {
        scrapedAt:  { $gte: since },
        isActive:   true,
        category:   { $ne: null, $ne: '' },
        headline:   { $ne: null, $ne: '' },
      },
    },
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

async function getTopAdvertisers(category, since, limit = 3) {
  return ScrapedAd.aggregate([
    {
      $match: {
        scrapedAt: { $gte: since },
        isActive:  true,
        category,
      },
    },
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
  s += Math.min(40, advCount * 8);           // advertiser diversity (max 40)
  s += Math.min(30, Math.round(totalAds / 2)); // volume (max 30)
  s += maxDays >= 30 ? 20 : maxDays >= 14 ? 10 : maxDays >= 7 ? 5 : 0; // longevity (max 20)
  s += Math.min(10, spendSum * 2);           // high-spend signal (max 10)
  return Math.min(100, s);
}

/** Extract the most frequent 2-gram keyword from an array of headlines. */
function extractTopKeyword(headlines, category) {
  const freq = {};
  for (const h of headlines) {
    const words = cleanHeadline(h, 6).split(' ').filter((w) => w.length > 2);
    for (let i = 0; i < words.length - 1; i++) {
      const bigram = `${words[i]} ${words[i + 1]}`;
      freq[bigram] = (freq[bigram] || 0) + 1;
    }
  }
  const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
  return top
    ? top[0].replace(/\b\w/g, (c) => c.toUpperCase())
    : category;
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Return winning "product clusters" derived from real Facebook Ad Library data.
 * @param {number} limit  Max results (default 20)
 * @returns {Promise<Array>}
 */
export async function getAdBasedWinners(limit = 20) {
  await connectDB();

  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const categories = await getCategorySignals(since);

  if (categories.length === 0) return [];

  const results = await Promise.all(
    categories.map(async (cat) => {
      const topAdvs = await getTopAdvertisers(cat._id, since, 3);

      const winScore    = scoreCategory(cat);
      const productName = extractTopKeyword(cat.headlines || [], cat._id);
      const sampleUrl   = (cat.sampleDirectUrls || []).find(Boolean) || null;

      const topAdvertisers = topAdvs.map((a) => ({
        name:      a._id || 'Unknown',
        adCount:   a.adCount,
        maxDays:   Math.round(a.maxDays || 0),
        isHighSpend: a.spendSum > 0,
        sampleUrl: a.directUrl || null,
        topKeyword: extractTopKeyword(a.headlines || [], cat._id),
      }));

      return {
        id:              cat._id,                    // category used as stable key
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
      };
    })
  );

  return results.sort((a, b) => b.winScore - a.winScore).slice(0, limit);
}

/**
 * Summary stats for the UI banner.
 */
export async function getAdStats() {
  await connectDB();
  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const [row] = await ScrapedAd.aggregate([
    { $match: { scrapedAt: { $gte: since }, isActive: true } },
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
  if (!row) return { totalAds: 0, uniqueAdvertisers: 0, categories: 0, lastScraped: null };
  return {
    totalAds:          row.totalAds,
    uniqueAdvertisers: row.uniqueAdvs.length,
    categories:        row.categories.filter(Boolean).length,
    maxDaysRunning:    row.maxDays,
    lastScraped:       row.lastScraped,
  };
}
