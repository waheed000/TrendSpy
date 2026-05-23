import axios from 'axios';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5000';

function formatMessage(product) {
  const priceRange =
    product.priceMin === product.priceMax
      ? `Rs. ${product.priceMin.toLocaleString('en-PK')}`
      : `Rs. ${product.priceMin.toLocaleString('en-PK')} - Rs. ${product.priceMax.toLocaleString('en-PK')}`;

  const cities = Array.isArray(product.cities) ? product.cities.join(', ') : product.cities || 'All Cities';

  return (
    `🚀 TRENDSPY ALERT!\n\n` +
    `Product: ${product.name}\n` +
    `Win Score: ${product.winScore}/100 ⭐\n` +
    `City: ${cities}\n` +
    `Category: ${product.category}\n` +
    `Price: ${priceRange}\n\n` +
    `View full report: ${FRONTEND_URL}/products/${product.slug}`
  );
}

export async function sendWhatsAppAlert(phoneNumber, product) {
  const instanceId = process.env.GREEN_API_INSTANCE_ID;
  const token = process.env.GREEN_API_TOKEN;

  if (!instanceId || !token) {
    throw new Error(
      '❌ GREEN_API_INSTANCE_ID and GREEN_API_TOKEN required. Get from https://green-api.com'
    );
  }

  const url = `https://api.green-api.com/waInstance${instanceId}/sendMessage/${token}`;
  const message = formatMessage(product);

  const chatId = phoneNumber.replace(/\D/g, '').replace(/^0/, '92') + '@c.us';

  const response = await axios.post(url, { chatId, message }, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
  });

  console.log(`[WhatsApp] Sent alert for "${product.name}" to ${phoneNumber} — idMessage: ${response.data?.idMessage}`);
  return response.data;
}
