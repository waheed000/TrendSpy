/**
 * Next.js Instrumentation Hook
 * Called once when the server starts (both dev and prod).
 * Used to initialize cron jobs via the scheduler.
 *
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run on the Node.js server runtime, not edge
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startAllJobs } = await import('./lib/scheduler.js');
    startAllJobs();
  }
}
