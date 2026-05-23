import cron from 'node-cron';
import { checkAllProductsForAlerts } from '@/services/alertService';

export function startAlertJob() {
  cron.schedule('*/30 * * * *', async () => {
    console.log(`[${new Date().toISOString()}] [AlertJob] Running alert check…`);
    try {
      const result = await checkAllProductsForAlerts();
      console.log(
        `[AlertJob] Completed. Sent ${result.whatsapp} WhatsApp, ${result.email} Email messages.` +
        (result.errors.length ? ` Errors: ${result.errors.length}` : '')
      );
    } catch (err) {
      console.error('[AlertJob] Fatal error:', err.message);
    }
  });

  console.log('[AlertJob] Scheduled: */30 * * * * (every 30 minutes)');
}
