/**
 * Facebook Ads Job — runs every 12 hours
 * Executes: Facebook Ad Library scraper.
 * Logs new ads found.
 */

import cron from 'node-cron';
import fbAdsScraper from '../scrapers/fbAdsScraper.js';

const SCHEDULE = '0 */12 * * *'; // Every 12 hours

async function runFbAdsJob() {
  const start = new Date();
  console.log(`[${start.toISOString()}] [FbAdsJob] Scraping Facebook Ad Library…`);

  try {
    const { ads, saved } = await fbAdsScraper();
    console.log(
      `[${new Date().toISOString()}] [FbAdsJob] Done. Ads found: ${ads.length}, Saved: ${saved}`
    );
  } catch (err) {
    console.error(`[${new Date().toISOString()}] [FbAdsJob] FAILED: ${err.message}`);
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`[${new Date().toISOString()}] [FbAdsJob] Cycle complete in ${elapsed}s`);
}

export function startFbAdsJob() {
  console.log(`[FbAdsJob] Scheduled: ${SCHEDULE} (every 12 hours)`);
  cron.schedule(SCHEDULE, runFbAdsJob, { timezone: 'Asia/Karachi' });
}

export { runFbAdsJob };
