/**
 * Facebook Ads Job — runs every 12 hours
 * Executes the Facebook Ad Library scraper and emits a socket event
 * when new ads are found.
 */

import cron from 'node-cron';
import fbAdsScraper from '../scrapers/fbAdsScraper.js';
import { emitNewAdsDetected } from '../lib/socketEmitter.js';

const SCHEDULE = '0 */12 * * *'; // Every 12 hours

async function runFbAdsJob() {
  const start = new Date();
  console.log(`[${start.toISOString()}] [FbAdsJob] Scraping Facebook Ad Library…`);

  try {
    const { ads, totalFound, savedNew } = await fbAdsScraper();

    console.log(
      `[${new Date().toISOString()}] [FbAdsJob] Done. totalFound=${totalFound} savedNew=${savedNew}`
    );

    if (savedNew > 0) {
      const categories = [...new Set(ads.map((a) => a.category).filter(Boolean))];
      emitNewAdsDetected({ count: savedNew, categories, totalFound }).catch(() => {});
    }
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
