/**
 * Facebook Ad Library Scraper — improved version.
 *
 * Strategy:
 *   1. Try the unofficial JSON API endpoint (works without login for basic queries).
 *   2. Fall back to Puppeteer with stealth headers if the JSON API is blocked.
 *
 * Both paths return the same normalised ad shape with a `directUrl` field
 * so users can verify every ad themselves.
 *
 * Returns empty array (never crashes) if Facebook blocks all requests.
 */

import axios from 'axios';
import { connectDB } from '../lib/db.js';
import { ScrapedAd } from '../models/index.js';
import { getRandomUserAgent } from '../lib/fakeUserAgent.js';

const FB_ADS_BASE = 'https://www.facebook.com/ads/library/';
const FB_ADS_ASYNC = 'https://www.facebook.com/ads/library/async/search_ads/';
const MIN_DAYS_RUNNING = 30;

const SEARCH_TERMS = [
  { term: 'electric heater Pakistan', category: 'Home' },
  { term: 'khaddar suit Pakistan',    category: 'Fashion' },
  { term: 'beauty serum Pakistan',    category: 'Beauty' },
  { term: 'air fryer Pakistan',       category: 'Home' },
  { term: 'smart watch Pakistan',     category: 'Electronics' },
  { term: 'mobile cover Pakistan',    category: 'Electronics' },
  { term: 'hijab Pakistan',           category: 'Fashion' },
  { term: 'skin whitening Pakistan',  category: 'Beauty' },
];

/**
 * Random delay between min and max milliseconds.
 */
function delay(minMs = 2000, maxMs = 5000) {
  return new Promise((r) => setTimeout(r, minMs + Math.random() * (maxMs - minMs)));
}

/**
 * Build axios headers that mimic a real browser.
 */
function browserHeaders(referer = FB_ADS_BASE) {
  return {
    'User-Agent':      getRandomUserAgent(),
    'Accept':          'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'en-US,en;q=0.9,ur;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer':         referer,
    'X-Requested-With': 'XMLHttpRequest',
    'Sec-Fetch-Dest':  'empty',
    'Sec-Fetch-Mode':  'cors',
    'Sec-Fetch-Site':  'same-origin',
    'Connection':      'keep-alive',
  };
}

/**
 * Determine spend level from days running.
 */
function spendLevel(daysRunning) {
  if (daysRunning > 90) return 'high';
  if (daysRunning > 30) return 'medium';
  return 'low';
}

/**
 * Parse daysRunning from a Facebook "started running" date string.
 * Facebook returns strings like "Started running on 1 January 2025".
 */
function parseDaysRunning(dateStr) {
  if (!dateStr) return 0;
  try {
    const match = dateStr.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
    if (!match) return 0;
    const parsed = new Date(`${match[2]} ${match[1]}, ${match[3]}`);
    if (isNaN(parsed)) return 0;
    return Math.floor((Date.now() - parsed.getTime()) / 86400000);
  } catch {
    return 0;
  }
}

/**
 * Normalise a raw ad object from the JSON API into the canonical shape.
 */
function normaliseJsonAd(raw, category) {
  const adId = String(raw.adArchiveID || raw.ad_archive_id || raw.id || '');
  if (!adId) return null;

  const daysRunning = parseDaysRunning(raw.startDate || raw.start_date || raw.ad_delivery_start_time);

  const snapshot   = raw.snapshot || raw.creative || {};
  const headline   = snapshot.title || snapshot.body?.text || raw.ad_creative_bodies?.[0] || '';
  const description = snapshot.caption || snapshot.link_description || raw.ad_creative_link_descriptions?.[0] || '';
  const imageUrl   = snapshot.images?.[0]?.original_image_url || snapshot.image_url || raw.ad_creative_link_image_hashes?.[0] || '';
  const videoUrl   = snapshot.videos?.[0]?.video_hd_url || snapshot.video_url || '';
  const creativeType = videoUrl ? 'video' : (snapshot.images?.length > 1 ? 'carousel' : 'image');
  const advertiserName = raw.pageName || raw.page_name || raw.advertiserName || 'Unknown';
  const platform   = (raw.publisherPlatforms || raw.publisher_platforms || ['facebook']).includes('instagram')
    ? 'instagram'
    : 'facebook';

  return {
    adId,
    directUrl:      `https://www.facebook.com/ads/library/?id=${adId}`,
    advertiserName,
    headline:       headline.slice(0, 300),
    description:    description.slice(0, 500),
    daysRunning,
    creativeType,
    imageUrl,
    videoUrl,
    spendLevel:     spendLevel(daysRunning),
    platform,
    category,
    city:           null,
    scrapedAt:      new Date(),
  };
}

/**
 * Attempt 1: Facebook's unofficial async/search_ads JSON endpoint.
 * This endpoint is used by the Ad Library page itself and sometimes
 * responds without full authentication for basic keyword searches.
 */
async function tryJsonApi(searchTerm, category) {
  const params = new URLSearchParams({
    q:              searchTerm,
    count:          '30',
    active_status:  'active',
    ad_type:        'all',
    media_type:     'all',
    search_type:    'keyword_unordered',
    source:         'nav-header',
  });
  params.append('countries[0]', 'PK');

  const url = `${FB_ADS_ASYNC}?${params.toString()}`;

  try {
    const res = await axios.get(url, {
      headers:        browserHeaders(FB_ADS_BASE),
      timeout:        20000,
      responseType:   'text',
      validateStatus: () => true,
    });

    if (res.status !== 200) {
      console.log(`[FB Ads JSON] HTTP ${res.status} for "${searchTerm}" — skipping`);
      return [];
    }

    // Facebook prepends "for (;;);" to JSON responses as CSRF protection
    let text = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
    text = text.replace(/^for\s*\(;;\s*\);/, '').trim();

    if (!text.startsWith('{') && !text.startsWith('[')) {
      console.log(`[FB Ads JSON] Non-JSON response for "${searchTerm}" — likely login wall`);
      return [];
    }

    const json = JSON.parse(text);

    // The response can be nested in different ways
    const rawAds = json.payload?.results
      || json.data?.ad_archive_main_table_data
      || json.results
      || [];

    if (!Array.isArray(rawAds) || rawAds.length === 0) {
      console.log(`[FB Ads JSON] No ads in response for "${searchTerm}"`);
      return [];
    }

    const ads = rawAds
      .map((r) => normaliseJsonAd(r, category))
      .filter(Boolean)
      .filter((a) => a.daysRunning >= MIN_DAYS_RUNNING || a.headline.length > 3);

    console.log(`[FB Ads JSON] Parsed ${ads.length} ads for "${searchTerm}"`);
    return ads;
  } catch (err) {
    console.log(`[FB Ads JSON] Request failed for "${searchTerm}": ${err.message}`);
    return [];
  }
}

/**
 * Attempt 2: Puppeteer — renders the Ad Library page and scrapes the DOM.
 * Uses improved selectors and stealth-mode launch flags.
 */
async function tryPuppeteer(searchTerm, category) {
  let puppeteer;
  try {
    puppeteer = (await import('puppeteer')).default;
  } catch {
    console.warn('[FB Ads Puppeteer] Puppeteer not available.');
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
        '--disable-blink-features=AutomationControlled',
        '--disable-infobars',
        '--window-size=1366,768',
        '--lang=en-US,en',
      ],
    });

    const page = await browser.newPage();

    // Stealth: override navigator.webdriver
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    });

    await page.setUserAgent(getRandomUserAgent());
    await page.setViewport({ width: 1366, height: 768 });
    await page.setExtraHTTPHeaders({
      'Accept-Language':           'en-US,en;q=0.9',
      'Accept':                    'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Upgrade-Insecure-Requests': '1',
    });

    const url = `${FB_ADS_BASE}?active_status=active&ad_type=all&country=PK&q=${encodeURIComponent(searchTerm)}&search_type=keyword_unordered`;
    console.log(`[FB Ads Puppeteer] Navigating: "${searchTerm}"`);

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 40000 });

    // Wait for ad cards or the login prompt
    await Promise.race([
      page.waitForSelector('[data-testid="ad-archive-renderer"]', { timeout: 12000 }),
      page.waitForSelector('[aria-label="Ad Library"]',           { timeout: 12000 }),
      page.waitForSelector('[role="article"]',                    { timeout: 12000 }),
    ]).catch(() => {});

    // Simulate human reading time
    await delay(1500, 3000);

    // Extract ad data directly from the page's JavaScript state if possible
    const adsFromState = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[type="application/json"]'));
      for (const script of scripts) {
        try {
          const json = JSON.parse(script.textContent);
          const results = json?.require?.flatMap?.((r) => r ?? []) ?? [];
          const ads = [];
          JSON.stringify(results, (key, value) => {
            if (key === 'adArchiveID' || key === 'ad_archive_id') ads.push(value);
            return value;
          });
          if (ads.length) return ads;
        } catch { }
      }
      return [];
    });

    // Scrape visible DOM ad cards
    const domAds = await page.evaluate((minDays) => {
      const cards = document.querySelectorAll(
        '[data-testid="ad-archive-renderer"], [role="article"], [class*="x1n2onr6"]'
      );
      const results = [];

      cards.forEach((card, i) => {
        const allText = card.innerText || '';
        if (allText.length < 10) return;

        // Headline — first strong or heading text
        const headlineEl = card.querySelector('h2, strong, [class*="_5s6c"], [class*="title"]');
        const headline = (headlineEl?.innerText || allText.split('\n')[0] || '').trim().slice(0, 300);

        // Advertiser name
        const advertiserEl = card.querySelector(
          'a[href*="/pages/"], [class*="x1heor9g"] a, [class*="advertiser"]'
        );
        const advertiserName = (advertiserEl?.innerText || '').trim() || 'Unknown';

        // Days running from text
        const daysMatch = allText.match(/(\d+)\s+days?\s+(?:running|ago)/i);
        const startMatch = allText.match(/Started running on (.+?)(?:\n|$)/i);
        let daysRunning = daysMatch ? parseInt(daysMatch[1], 10) : 0;
        if (!daysRunning && startMatch) {
          try {
            const d = new Date(startMatch[1]);
            if (!isNaN(d)) daysRunning = Math.floor((Date.now() - d.getTime()) / 86400000);
          } catch { }
        }

        // Image
        const imgEl = card.querySelector('img[src*="fbcdn"]');
        const imageUrl = imgEl?.src || '';

        // Video
        const videoEl = card.querySelector('video[src], source[src]');
        const videoUrl = videoEl?.src || '';

        const creativeType = videoUrl ? 'video' : (imageUrl ? 'image' : 'text');

        // Ad ID from a link if present
        const adLink = card.querySelector('a[href*="ads/library"]');
        const idMatch = adLink?.href?.match(/id=(\d+)/);
        const adId = idMatch ? idMatch[1] : `dom_${Date.now()}_${i}`;

        if (headline || daysRunning >= minDays) {
          results.push({
            adId,
            directUrl:     `https://www.facebook.com/ads/library/?id=${adId}`,
            advertiserName,
            headline,
            description:   '',
            daysRunning,
            creativeType,
            imageUrl,
            videoUrl,
            platform:      'facebook',
          });
        }
      });

      return results;
    }, MIN_DAYS_RUNNING);

    const ads = domAds.map((a) => ({
      ...a,
      spendLevel: spendLevel(a.daysRunning),
      category,
      city: null,
      scrapedAt: new Date(),
    }));

    console.log(`[FB Ads Puppeteer] Extracted ${ads.length} ads for "${searchTerm}"`);
    return ads;
  } catch (err) {
    console.error(`[FB Ads Puppeteer] Error for "${searchTerm}": ${err.message}`);
    return [];
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}

/**
 * Save scraped ads to MongoDB (upsert by adId).
 * Returns count of newly inserted documents.
 */
async function saveAds(ads) {
  let savedNew = 0;
  for (const ad of ads) {
    try {
      const result = await ScrapedAd.findOneAndUpdate(
        { adId: ad.adId },
        {
          $set:         { ...ad, scrapedAt: new Date() },
          $setOnInsert: { firstSeenAt: new Date() },
        },
        { upsert: true, new: false }
      );
      if (!result) savedNew++; // null means document was inserted (not found before)
    } catch (err) {
      console.warn(`[FB Ads] Failed to save ad "${ad.adId}": ${err.message}`);
    }
  }
  return savedNew;
}

/**
 * Main scraper.
 * @param {{ searchTerm?: string, category?: string }} options
 * @returns {Promise<{ success: boolean, ads: Array, totalFound: number, savedNew: number }>}
 */
async function fbAdsScraper({ searchTerm, category } = {}) {
  await connectDB();

  const targets = searchTerm
    ? [{ term: searchTerm, category: category || 'General' }]
    : SEARCH_TERMS;

  const allAds   = [];
  let totalSaved = 0;

  for (const target of targets) {
    console.log(`[FB Ads] Processing: "${target.term}"`);

    // Try JSON API first (faster, lower footprint)
    let ads = await tryJsonApi(target.term, target.category);

    // Fall back to Puppeteer if JSON API returned nothing
    if (ads.length === 0) {
      await delay(1000, 2000);
      ads = await tryPuppeteer(target.term, target.category);
    }

    const qualified = ads.filter(
      (a) => a.daysRunning >= MIN_DAYS_RUNNING || (a.headline && a.headline.length > 3)
    );

    console.log(`[FB Ads] Qualified: ${qualified.length} ads for "${target.term}"`);
    allAds.push(...qualified);

    if (qualified.length > 0) {
      const savedNew = await saveAds(qualified);
      totalSaved += savedNew;
    }

    // Respectful delay between search terms
    await delay(2000, 5000);
  }

  if (allAds.length === 0) {
    console.warn('[FB Ads] No ads collected — Facebook Ad Library likely requires an authenticated session.');
    console.warn('[FB Ads] Set FB_SESSION_COOKIE env var with a valid Facebook session cookie to enable full access.');
  } else {
    console.log(`[FB Ads] Done. totalFound=${allAds.length} savedNew=${totalSaved}`);
  }

  return {
    success:    true,
    ads:        allAds,
    totalFound: allAds.length,
    savedNew:   totalSaved,
  };
}

/**
 * Count unique competitor advertisers for a product by searching
 * the FB Ad Library JSON API for its key terms.
 *
 * @param {string} productName
 * @param {string} [city]
 * @returns {Promise<{ count: number, advertisers: string[] }>}
 */
export async function countCompetitors(productName, city) {
  const searchTerms = productName.split(/\s+/).slice(0, 3).join(' ');
  const query = city ? `${searchTerms} ${city}` : `${searchTerms} Pakistan`;

  const ads = await tryJsonApi(query, 'General');
  const advertisers = [...new Set(ads.map((a) => a.advertiserName).filter(Boolean))];

  return {
    count:       advertisers.length,
    advertisers: advertisers.slice(0, 10),
  };
}

export default fbAdsScraper;
