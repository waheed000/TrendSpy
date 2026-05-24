export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initDb } = await import('./lib/initDb.js');
    await initDb();

    const { startAllJobs } = await import('./lib/scheduler.js');
    startAllJobs();
  }
}
