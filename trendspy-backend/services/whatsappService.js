import axios from 'axios';

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://huntinggoals.replit.app';

function normalisePhone(phoneNumber) {
  let digits = phoneNumber.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = '92' + digits.slice(1);
  if (!digits.startsWith('92')) digits = '92' + digits;
  return digits + '@c.us';
}

function buildUrl(path) {
  const instanceId = process.env.GREEN_API_INSTANCE_ID;
  const token = process.env.GREEN_API_TOKEN;
  return `https://api.green-api.com/waInstance${instanceId}/${path}/${token}`;
}

function assertCredentials() {
  const instanceId = process.env.GREEN_API_INSTANCE_ID;
  const token = process.env.GREEN_API_TOKEN;
  if (!instanceId || !token) {
    throw new Error(
      'GREEN_API_INSTANCE_ID and GREEN_API_TOKEN are required. Add them in Replit Secrets.'
    );
  }
}

function formatProductMessage(product) {
  const priceRange =
    product.priceMin === product.priceMax
      ? `Rs. ${product.priceMin.toLocaleString('en-PK')}`
      : `Rs. ${product.priceMin.toLocaleString('en-PK')} - Rs. ${product.priceMax.toLocaleString('en-PK')}`;

  const cities = Array.isArray(product.cities)
    ? product.cities.join(', ')
    : product.cities || 'All Cities';

  return (
    `🚀 *Hunting Goals Alert!*\n\n` +
    `*Product:* ${product.name}\n` +
    `*Win Score:* ${product.winScore}/100 ⭐\n` +
    `*City:* ${cities}\n` +
    `*Category:* ${product.category}\n` +
    `*Price:* ${priceRange}\n\n` +
    `View full report: ${FRONTEND_URL}/products/${product.slug}`
  );
}

export async function sendWhatsAppRaw(phoneNumber, message) {
  assertCredentials();

  const chatId = normalisePhone(phoneNumber);
  const url = buildUrl('sendMessage');

  const response = await axios.post(
    url,
    { chatId, message },
    { headers: { 'Content-Type': 'application/json' }, timeout: 12000 }
  );

  console.log(`[WhatsApp] Sent raw message to ${phoneNumber} — idMessage: ${response.data?.idMessage}`);
  return response.data;
}

export async function sendWhatsAppAlert(phoneNumber, product) {
  assertCredentials();

  const chatId = normalisePhone(phoneNumber);
  const message = formatProductMessage(product);
  const url = buildUrl('sendMessage');

  const response = await axios.post(
    url,
    { chatId, message },
    { headers: { 'Content-Type': 'application/json' }, timeout: 12000 }
  );

  console.log(`[WhatsApp] Alert for "${product.name}" → ${phoneNumber} — idMessage: ${response.data?.idMessage}`);
  return response.data;
}

export async function getWhatsAppStatus() {
  assertCredentials();
  const url = buildUrl('getStateInstance');
  const response = await axios.get(url, { timeout: 8000 });
  return response.data;
}
