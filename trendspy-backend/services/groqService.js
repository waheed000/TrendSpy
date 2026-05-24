/**
 * Groq AI Service
 * Uses llama-3.3-70b-versatile (free tier) for product analysis and ad copy.
 */

import Groq from 'groq-sdk';
import { connectDB } from '../lib/db.js';
import Supplier from '../models/Supplier.js';
import { calculateOpportunityScore } from './opportunityService.js';

/**
 * Query DB for suppliers relevant to a product category + city.
 */
export async function getSuppliersForProduct(productName, category, city = null) {
  try {
    await connectDB();
    const filter = {};
    if (category && category !== 'General') filter.category = category;
    if (city) filter.city = city;
    const suppliers = await Supplier.find(filter)
      .sort({ verified: -1, rating: -1 })
      .limit(3)
      .select('name city phone website rating verified')
      .lean();
    return suppliers.map((s) => ({
      name: s.name, city: s.city, phone: s.phone || null,
      website: s.website || null, rating: s.rating || 0, verified: s.verified || false,
    }));
  } catch { return []; }
}

function getClient() {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    throw new Error('❌ GROQ_API_KEY missing. Get it from https://console.groq.com');
  }
  return new Groq({ apiKey: key });
}

/**
 * Send a prompt to Groq and parse the JSON response.
 * @param {string} systemPrompt
 * @param {string} userPrompt
 * @returns {Promise<Object>}
 */
async function callGroq(systemPrompt, userPrompt) {
  const groq = getClient();
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userPrompt   },
    ],
    temperature: 0.7,
    max_tokens: 1024,
    response_format: { type: 'json_object' },
  });
  const raw = completion.choices[0]?.message?.content || '{}';
  return JSON.parse(raw);
}

/**
 * Analyze a product and return profit analysis, ad copy, competitor alert and market potential.
 * @param {string} productName
 * @param {Object} productData - Optional fields: category, winScore, priceMin, priceMax, cities, darazOrders, tiktokViews, activeAds
 * @returns {Promise<Object>}
 */
export async function analyzeProduct(productName, productData = {}) {
  const systemPrompt = `You are a Pakistan e-commerce expert helping sellers on Daraz, OLX, and TikTok Shop.
You analyze products and give practical advice in the context of the Pakistani market (PKR currency, cities like Lahore/Karachi/Islamabad).
Always respond with valid JSON matching the exact schema requested.`;

  const context = productData
    ? `
Category: ${productData.category || 'Unknown'}
Current Win Score: ${productData.winScore || 'N/A'}/100
Price Range: Rs. ${productData.priceMin || '?'} - Rs. ${productData.priceMax || '?'}
Active Cities: ${(productData.cities || []).join(', ') || 'Unknown'}
Daraz Orders: ${productData.darazOrders || 0}
TikTok Views: ${productData.tiktokViews || 0}
Active Facebook Ads: ${productData.activeAds || 0}
`.trim()
    : '';

  const userPrompt = `Analyze this product for Pakistani e-commerce sellers:

Product: ${productName}
${context}

Return a JSON object with this exact structure:
{
  "profitAnalysis": {
    "buyPrice": "estimated buy price from Alibaba or wholesale in PKR",
    "sellPrice": "recommended selling price in PKR",
    "profitMargin": "estimated profit margin as a percentage string e.g. '35%'",
    "recommendedPlatform": "best platform to sell on: Daraz, OLX, TikTok, or Shopify"
  },
  "adCopy": {
    "english": "compelling Facebook/Instagram ad copy in English (2-3 sentences)",
    "urdu": "Roman Urdu TikTok ad copy (2-3 sentences)"
  },
  "competitorAlert": "brief sentence about competitor count and market saturation warning",
  "marketPotential": "High, Medium, or Low — followed by one sentence explanation"
}`;

  const aiResult = await callGroq(systemPrompt, userPrompt);

  // Enrich with real DB suppliers + international opportunity data (fail silently)
  const [suppliers, opportunity] = await Promise.all([
    getSuppliersForProduct(productName, productData.category || null, productData.cities?.[0] || null),
    calculateOpportunityScore(productName).catch(() => null),
  ]);

  const international = opportunity
    ? {
        globalStores:       opportunity.globalStores,
        avgGlobalPrice:     `$${opportunity.avgPriceUSD}`,
        avgGlobalPricePKR:  opportunity.avgPricePKR,
        shippingToPakistan: '15–20 days (Alibaba), 5–7 days (Shopify)',
        opportunityScore:   opportunity.score,
        opportunityGap:     opportunity.gap,
        shopifyStoreCount:  opportunity.shopifyCount,
        localAvailability:  opportunity.localProducts,
      }
    : null;

  return { ...aiResult, suppliers, international };
}

/**
 * Generate ad copy in English and Roman Urdu for a product.
 * @param {string} productName
 * @param {string} category
 * @param {string} targetAudience
 * @returns {Promise<{ english: string, urdu: string }>}
 */
export async function generateAdCopy(productName, category, targetAudience = 'general Pakistani shoppers') {
  const systemPrompt = `You are a creative digital marketing expert for Pakistani e-commerce brands.
Write punchy, conversion-focused ad copy. Always respond with valid JSON.`;

  const userPrompt = `Write ad copy for this product:

Product: ${productName}
Category: ${category}
Target Audience: ${targetAudience}

Return JSON with this exact structure:
{
  "english": "Facebook/Instagram ad copy in English (3-4 sentences, include a call-to-action)",
  "urdu": "Roman Urdu TikTok caption (3-4 sentences, casual tone, include emojis, Pakistani slang welcome)",
  "hashtags": ["list", "of", "5", "relevant", "hashtags"]
}`;

  return callGroq(systemPrompt, userPrompt);
}

/**
 * Get seasonal product recommendations for an upcoming Pakistani season.
 * @param {string} currentSeason - e.g. "Ramadan", "Eid ul Fitr", "Winter"
 * @returns {Promise<Object>}
 */
export async function getSeasonalRecommendation(currentSeason) {
  const systemPrompt = `You are a Pakistan market trend analyst.
Give actionable product stocking advice for Pakistani e-commerce sellers.
Always respond with valid JSON.`;

  const userPrompt = `It's currently the "${currentSeason}" season in Pakistan.

Return JSON with this structure:
{
  "season": "${currentSeason}",
  "topProducts": [
    { "name": "product name", "category": "category", "reason": "why it sells well now", "expectedDemand": "High/Medium/Low" }
  ],
  "stockAdvice": "brief paragraph on what to stock and when to order from Alibaba",
  "pricingTip": "specific pricing strategy for this season in the Pakistani market"
}

Include 5 specific product recommendations.`;

  return callGroq(systemPrompt, userPrompt);
}

/**
 * Generate a short one-line AI insight for a high-value alert (winScore >= 85).
 * @param {string} productName
 * @param {number} winScore
 * @param {string} category
 * @returns {Promise<string>}
 */
export async function getAlertInsight(productName, winScore, category) {
  try {
    const groq = getClient();
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a Pakistani e-commerce analyst. Write one punchy sentence (max 15 words) explaining why this product is trending. No JSON needed.',
        },
        {
          role: 'user',
          content: `Product: ${productName}, Category: ${category}, Win Score: ${winScore}/100`,
        },
      ],
      temperature: 0.8,
      max_tokens: 60,
    });
    return completion.choices[0]?.message?.content?.trim() || '';
  } catch {
    return '';
  }
}

export default { analyzeProduct, generateAdCopy, getSeasonalRecommendation, getAlertInsight };
