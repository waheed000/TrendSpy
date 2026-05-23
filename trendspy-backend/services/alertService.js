import { connectDB } from '@/lib/db';
import { Alert, Product } from '@/models/index';
import { sendEmailAlert } from './emailService.js';
import { sendWhatsAppAlert } from './whatsappService.js';

export async function checkAndTriggerAlerts(product) {
  await connectDB();

  const alerts = await Alert.find({ isActive: true }).populate(
    'userId',
    'email phoneNumber emailNotifications whatsappNotifications'
  );

  const triggered = alerts.filter((alert) => {
    const scoreOk = product.winScore >= alert.minWinScore;
    const cityOk = !alert.city || (Array.isArray(product.cities) && product.cities.includes(alert.city));
    const catOk = !alert.category || product.category === alert.category;
    return scoreOk && cityOk && catOk;
  });

  const results = { whatsapp: 0, email: 0, errors: [] };

  for (const alert of triggered) {
    const user = alert.userId;
    if (!user) continue;

    const sendEmail = alert.channel === 'email' || alert.channel === 'both';
    const sendWhatsApp = alert.channel === 'whatsapp' || alert.channel === 'both';

    if (sendEmail && user.email) {
      try {
        await sendEmailAlert(user.email, product);
        results.email++;
      } catch (err) {
        results.errors.push({ type: 'email', userId: user._id, error: err.message });
        console.error(`[AlertService] Email failed for ${user.email}:`, err.message);
      }
    }

    if (sendWhatsApp && user.phoneNumber) {
      try {
        await sendWhatsAppAlert(user.phoneNumber, product);
        results.whatsapp++;
      } catch (err) {
        results.errors.push({ type: 'whatsapp', userId: user._id, error: err.message });
        console.error(`[AlertService] WhatsApp failed for ${user.phoneNumber}:`, err.message);
      }
    }

    try {
      await Alert.findByIdAndUpdate(alert._id, {
        $set: { lastTriggeredAt: new Date() },
        $inc: { triggerCount: 1 },
      });
    } catch (err) {
      console.error(`[AlertService] Failed to update alert ${alert._id}:`, err.message);
    }
  }

  return { triggered: triggered.length, ...results };
}

export async function checkAllProductsForAlerts() {
  await connectDB();

  const products = await Product.find({ winScore: { $gte: 75 } });
  const totals = { whatsapp: 0, email: 0, errors: [] };

  for (const product of products) {
    try {
      const result = await checkAndTriggerAlerts(product);
      totals.whatsapp += result.whatsapp;
      totals.email += result.email;
      totals.errors.push(...result.errors);
    } catch (err) {
      console.error(`[AlertService] Error checking alerts for product "${product.name}":`, err.message);
    }
  }

  return totals;
}
