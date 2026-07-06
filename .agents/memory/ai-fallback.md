---
name: AI fallback
description: Groq AI integration has a local fallback when API key is absent
---

`backend/services/groqService.js` has a `localAnalysis()` function that computes a structured response from product data fields (winScore, trend, priceMin/Max, darazOrders, tiktokViews, etc.) — returning the same shape as the Groq API response.

**Why:** Keeps the AI Analyst endpoint always functional for demos and dev without requiring a Groq key. Add `GROQ_API_KEY` to Replit Secrets to enable real LLM responses.

**How to apply:** No code change needed to enable real AI — just add the secret. The service auto-detects the key.
