/**
 * Score Job — runs every 1 hour
 * Recalculates Win Scores for all products.
 * Logs count of winning products (winScore >= 75).
 */

import cron from 'node-cron';
import { updateAllWinScores } from '../services/winScoreService.js';

const SCHEDULE = '0 * * * *'; // Every hour

async function runScoreJob() {
  const start = new Date();
  console.log(`[${start.toISOString()}] [ScoreJob] Recalculating Win Scores…`);

  try {
    const { processed, updated, winners } = await updateAllWinScores();
    console.log(
      `[${new Date().toISOString()}] [ScoreJob] Done. Processed: ${processed}, Updated: ${updated}`
    );
    console.log(`[ScoreJob] Found ${winners} products with winScore >= 75`);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] [ScoreJob] FAILED: ${err.message}`);
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`[${new Date().toISOString()}] [ScoreJob] Cycle complete in ${elapsed}s`);
}

export function startScoreJob() {
  console.log(`[ScoreJob] Scheduled: ${SCHEDULE} (every 1 hour)`);
  cron.schedule(SCHEDULE, runScoreJob, { timezone: 'Asia/Karachi' });
}

export { runScoreJob };
