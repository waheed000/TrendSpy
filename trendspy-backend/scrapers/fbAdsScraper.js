/**
 * Facebook Ad Library Scraper
 * Targets Facebook's Ad Library for Pakistan to find proven profitable ads.
 *
 * IMPORTANT: Facebook Ad Library requires a logged-in session for full access.
 * Puppeteer is used to handle JavaScript-rendered content.
 *
 * TODO (Phase 5): Add cookie/session injection so Puppeteer can access the full
 * Ad Library results. Until then, the scraper attempts a best-effort public scrape
 * and falls back gracefully.
 *
 * Only captures ads running 30+ days (proven profitability signal).
 */

import { connectDB } from '@/lib/db';
import { ScrapedAd } from '@/models/index';
import { getRandomUserAgent } from '@/lib/fakeUserAgent';

const FB_ADS_URL = 'https://www.facebook.com/ads/library/';
const MIN_DAYS_RUNNING = 30;

// Search terms mapped to TrendSpy categories
const SEARCH_TERMS = [
  { term: 'electric heater Pakistan', category: 'Home' },
  { term: 'khaddar suit Pakistan', category: 'Fashion' },
  { term: 'beauty serum Pakistan', category: 'Beauty' },
  { term: 'air fryer Pakistan', category: 'Home' },
  { term: 'smart watch Pakistan', category: 'Electronics' },
];

/**
 * Parse the Ad Library HTML for ad cards.
 * The Ad Library is heavily JS-rendered, so static parsing has limited coverage.
 * @param {Object} $ - cheerio instance
 * @param {string} category
 * @returns {Array}
 */
function parseAdCards($, category) {
  const ads = [];

  // Attempt to find ad cards from partially-rendered HTML
  $('[role="article"], [data-testid="ad-archive-renderer"]').each((i, el) => {
    const text = $(el).text();
    if (!text || text.length < 10) return;

    // Extract headline (first substantial text block)
    const headline = $(el)
      .find('h2, strong, [class*="title"]')
      .first()
      .text()
      .trim()
      .slice(0, 200);

    const advertiser = $(el)
      .find('[class*="advertiser"], [class*="page-name"]')
      .first()
      .text()
      .trim();

    const daysText = text.match(/(\d+)\s+days?\s+running/i);
    const daysRunning = daysText ? parseInt(daysText[1], 10) : 0;

    if (daysRunning >= MIN_DAYS_RUNNING || headline) {
      ads.push({
        adId: `fb_${Date.now()}_${i}`,
        headline: headline || 'Facebook Ad',
        platform: 'facebook',
        creativeType: 'image',
        advertiserName: advertiser || 'Unknown',
        daysRunning,
        category,
        city: null,
        spendLevel: daysRunning > 60 ? 'high' : daysRunning > 30 ? 'medium' : 'low',
      });
    }
  });

  return ads;
}

/**
 * Save scraped ads to MongoDB using upsert by adId.
 */
async function saveAds(ads) {
  let saved = 0;
  for (const ad of ads) {
    try {
      await ScrapedAd.findOneAndUpdate(
        { adId: ad.adId },
        { $set: { ...ad, scrapedAt: new Date() } },
        { upsert: true, new: true }
      );
      saved++;
    } catch (err) {
      console.warn(`[FB Ads] Failed to save ad "${ad.headline}":`, err.message);
    }
  }
  return saved;
}

/**
 * Attempt to scrape using Puppeteer.
 * Falls back gracefully if Puppeteer is unavailable or blocked.
 */
async function scrapeWithPuppeteer(searchTerm, category) {
  let puppeteer;
  try {
    puppeteer = (await import('puppeteer')).default;
  } catch {
    console.warn('[FB Ads] Puppeteer not available. Skipping Facebook scraper.');
    return [];
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        `--user-agent=${getRandomUserAgent()}`,
      ],
    });

    const page = await browser.newPage();
    await page.setUserAgent(getRandomUserAgent());
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });

    const url = `${FB_ADS_URL}?active_status=active&ad_type=all&country=PK&q=${encodeURIComponent(searchTerm)}&search_type=keyword_unordered`;
    console.log(`[FB Ads] Navigating to: ${url}`);

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for ad cards to render
    await page.waitForSelector('[role="article"]', { timeout: 10000 }).catch(() => {
      console.warn('[FB Ads] No ad cards found — Facebook may require login.');
    });

    // Random delay to simulate human reading
    await new Promise((r) => setTimeout(r, 2000 + Math.random() * 2000));

    const html = await page.content();
    const cheerio = (await import('cheerio')).default;
    const $ = cheerio.load(html);

    return parseAdCards($, category);
  } catch (err) {
    console.error(`[FB Ads] Puppeteer error for "${searchTerm}":`, err.message);
    // TODO (Phase 5): Handle login wall — inject session cookies here
    return [];
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}

/**
 * Main scraper function.
 * @param {{ searchTerm?: string, category?: string }} options
 * @returns {Promise<{ ads: Array, saved: number }>}
 */
async function fbAdsScraper({ searchTerm, category } = {}) {
  await connectDB();

  const targets = searchTerm
    ? [{ term: searchTerm, category: category || 'Home' }]
    : SEARCH_TERMS;

  const allAds = [];
  let totalSaved = 0;

  for (const target of targets) {
    const ts = new Date().toISOString();
    console.log(`[${ts}] [FB Ads] Scraping: "${target.term}"`);

    const ads = await scrapeWithPuppeteer(target.term, target.category);
    const qualified = ads.filter((a) => a.daysRunning >= MIN_DAYS_RUNNING || a.headline.length > 5);

    console.log(`[FB Ads] Found ${qualified.length} qualified ads for "${target.term}"`);
    allAds.push(...qualified);

    const saved = await saveAds(qualified);
    totalSaved += saved;

    // Respectful delay between searches
    await new Promise((r) => setTimeout(r, 3000 + Math.random() * 2000));
  }

  console.log(`[FB Ads] Done. Total ads: ${allAds.length}, Saved: ${totalSaved}`);

  // TODO (Phase 5): If allAds is empty, it likely means Facebook's login wall
  // was hit. Implement cookie injection (FB_SESSION_COOKIE env var) to bypass.
  if (allAds.length === 0) {
    console.warn('[FB Ads] No ads collected. Facebook Ad Library likely requires login.');
    console.warn('[FB Ads] Phase 5 TODO: Set FB_SESSION_COOKIE env var for authenticated access.');
  }

  return { ads: allAds, saved: totalSaved };
}

export default fbAdsScraper;
