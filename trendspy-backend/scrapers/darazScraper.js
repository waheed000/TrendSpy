/**
 * Daraz.pk Scraper
 * Targets best-sellers and category search results on Daraz Pakistan.
 * Uses cheerio + axios with rotating user agents and respectful delays.
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { connectDB } from '@/lib/db';
import { Product } from '@/models/index';
import { getRandomUserAgent } from '@/lib/fakeUserAgent';

const BASE_URL = 'https://www.daraz.pk';
const REQUEST_DELAY_MS = 1500; // 1.5 seconds between requests

const CATEGORY_URLS = [
  { category: 'Electronics', path: '/consumer-electronics/' },
  { category: 'Fashion',     path: '/womens-western-wear/' },
  { category: 'Beauty',      path: '/beauty-health/' },
  { category: 'Home',        path: '/home-appliances/' },
  { category: 'Sports',      path: '/sports/' },
  { category: 'Toys',        path: '/toys-games/' },
];

/** Wait for ms milliseconds */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Build a headers object with a random user agent */
function buildHeaders() {
  return {
    'User-Agent': getRandomUserAgent(),
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
  };
}

/**
 * Parse product listings from a Daraz category/search page HTML.
 * @param {string} html
 * @param {string} category
 * @returns {Array}
 */
function parseListings(html, category) {
  const $ = cheerio.load(html);
  const products = [];

  // Daraz renders product cards with data attributes in script tags (JSON)
  // We attempt to extract from both rendered HTML and embedded JSON.

  // Attempt 1: JSON data embedded in <script type="application/ld+json">
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).html());
      if (json['@type'] === 'Product') {
        const offer = json.offers || {};
        products.push({
          name: json.name?.trim(),
          priceMin: parseFloat(offer.lowPrice || offer.price || 0),
          priceMax: parseFloat(offer.highPrice || offer.price || 0),
          imageUrl: json.image?.[0] || json.image || null,
          darazRating: parseFloat(json.aggregateRating?.ratingValue || 0),
          category,
          platforms: ['daraz'],
        });
      }
    } catch {}
  });

  // Attempt 2: Rendered product card HTML selectors
  if (products.length === 0) {
    $('[data-qa-locator="product-item"], .c1_t2i').each((_, el) => {
      const name = $(el).find('[class*="title"], .c16H9d').first().text().trim();
      const priceText = $(el).find('[class*="price"], .c13VH6').first().text().replace(/[^0-9.]/g, '');
      const imgEl = $(el).find('img[src]').first();
      if (name && priceText) {
        products.push({
          name,
          priceMin: parseFloat(priceText) || 0,
          priceMax: parseFloat(priceText) || 0,
          imageUrl: imgEl.attr('src') || null,
          category,
          platforms: ['daraz'],
        });
      }
    });
  }

  return products;
}

/**
 * Upsert scraped products into MongoDB.
 * @param {Array} products
 */
async function saveProducts(products) {
  let saved = 0;
  let failed = 0;

  for (const p of products) {
    if (!p.name || p.name.length < 3) continue;
    try {
      await Product.findOneAndUpdate(
        { name: p.name, category: p.category },
        {
          $set: {
            ...p,
            lastScrapedAt: new Date(),
          },
          $setOnInsert: { winScore: 0 },
        },
        { upsert: true, new: true }
      );
      saved++;
    } catch (err) {
      failed++;
      console.warn(`[Daraz] Failed to save "${p.name}":`, err.message);
    }
  }

  return { saved, failed };
}

/**
 * Main scraper function.
 * @param {{ category?: string }} options
 * @returns {Promise<{ products: Array, saved: number, failed: number }>}
 */
async function darazScraper({ category } = {}) {
  await connectDB();

  const targets = category
    ? CATEGORY_URLS.filter((c) => c.category === category)
    : CATEGORY_URLS;

  const allProducts = [];
  let totalSaved = 0;
  let totalFailed = 0;

  for (const target of targets) {
    const url = `${BASE_URL}${target.path}`;
    const ts = new Date().toISOString();
    console.log(`[${ts}] [Daraz] Scraping ${target.category}: ${url}`);

    try {
      const response = await axios.get(url, {
        headers: buildHeaders(),
        timeout: 15000,
        maxRedirects: 5,
      });

      const products = parseListings(response.data, target.category);
      console.log(`[Daraz] Found ${products.length} products in ${target.category}`);

      allProducts.push(...products);

      const { saved, failed } = await saveProducts(products);
      totalSaved += saved;
      totalFailed += failed;

      await delay(REQUEST_DELAY_MS + Math.random() * 500);
    } catch (err) {
      console.error(`[Daraz] Error scraping ${target.category}:`, err.message);
      // Do not throw – continue with next category
    }
  }

  console.log(`[Daraz] Done. Saved: ${totalSaved}, Failed: ${totalFailed}, Total found: ${allProducts.length}`);
  return { products: allProducts, saved: totalSaved, failed: totalFailed };
}

export default darazScraper;
