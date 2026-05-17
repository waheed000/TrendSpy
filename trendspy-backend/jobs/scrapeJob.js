/**
 * Scrape Job — runs every 6 hours
 * Executes: Daraz, OLX, and TikTok scrapers sequentially.
 * One failing does NOT stop the others.
 */

import cron from 'node-cron';
import darazScraper from '../scrapers/darazScraper.js';
import olxScraper from '../scrapers/olxScraper.js';
import tiktokScraper from '../scrapers/tiktokScraper.js';

const SCHEDULE = '0 */6 * * *'; // Every 6 hours

async function runScrapeJob() {
  const start = new Date();
  console.log(`[${start.toISOString()}] [ScrapeJob] Starting scrape cycle`);

  const scrapers = [
    { name: 'Daraz',  fn: () => darazScraper() },
    { name: 'OLX',    fn: () => olxScraper() },
    { name: 'TikTok', fn: () => tiktokScraper() },
  ];

  for (const { name, fn } of scrapers) {
    const t = new Date().toISOString();
    try {
      console.log(`[${t}] [ScrapeJob] Running ${name} scraper…`);
      const result = await fn();
      console.log(`[${new Date().toISOString()}] [ScrapeJob] ${name} done:`, JSON.stringify(result));
    } catch (err) {
      console.error(`[${new Date().toISOString()}] [ScrapeJob] ${name} FAILED: ${err.message}`);
    }
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`[${new Date().toISOString()}] [ScrapeJob] Cycle complete in ${elapsed}s`);
}

export function startScrapeJob() {
  console.log(`[ScrapeJob] Scheduled: ${SCHEDULE} (every 6 hours)`);
  cron.schedule(SCHEDULE, runScrapeJob, { timezone: 'Asia/Karachi' });
}

export { runScrapeJob };
