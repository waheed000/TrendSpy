---
name: AI fallback
description: How the AI analyze endpoint works without GROQ_API_KEY
---

# AI analyze fallback

`trendspy-backend/services/groqService.js` has a `localAnalysis()` function that computes a structured response from product data fields (winScore, trend, priceMin/Max, darazOrders, tiktokViews, etc.) — returning the same shape as the Groq API response.

**When it activates:** `process.env.GROQ_API_KEY` is falsy.

**Why:** Prevents the AI Report page from showing errors to users who haven't set up a Groq key yet. The analysis is computed, not AI-generated, but meaningful.

**How to apply:** To enable real AI, add `GROQ_API_KEY` to Replit Secrets. Free key at https://console.groq.com. Uses model `llama-3.3-70b-versatile`.
