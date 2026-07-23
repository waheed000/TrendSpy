# Hunting Goals — Project Context Document

## 🎯 Project Overview

**Hunting Goals** is an AI-powered winning product finder for Pakistani e-commerce sellers. It scrapes real Facebook & Instagram ads, calculates a Win Score, and provides AI-generated profit estimates, ad copy, and supplier recommendations — all in one platform.

**Live URLs:**
- Frontend: https://huntinggoals.netlify.app
- Backend: https://waheed777-hunting-goals-backend.hf.space

**Repository:** https://github.com/waheed000/TrendSpy (private)

---

## 📂 Complete Folder Structure
Hunting-Goals/
├── backend/
│ ├── server/
│ │ ├── index.js # Main Express app (merged with Socket.io)
│ │ └── db.js # MongoDB connection (Atlas + in-memory fallback)
│ ├── routes/
│ │ ├── auth.js # Register, Login, Google OAuth, Reset Password
│ │ ├── products.js # Products, winning products, history, score
│ │ ├── ads.js # Facebook/Instagram ads
│ │ ├── alerts.js # User alerts (WhatsApp/Email)
│ │ ├── ai.js # AI analysis (Groq)
│ │ ├── notifications.js # In-app notifications
│ │ ├── user.js # Profile, onboarding, change password
│ │ ├── dashboard.js # Dashboard stats
│ │ ├── scraper.js # Scraper status & triggers
│ │ ├── export.js # CSV export
│ │ ├── stats.js # System stats
│ │ ├── tiktok.js # TikTok API
│ │ ├── international.js # Shopify/Google Shopping
│ │ └── suppliers.js # Supplier management
│ ├── models/
│ │ ├── User.js
│ │ ├── Product.js
│ │ ├── Alert.js
│ │ ├── AlertLog.js
│ │ ├── ScrapedAd.js
│ │ ├── Supplier.js
│ │ ├── SeasonalEvent.js
│ │ ├── ShopifyProduct.js
│ │ ├── GoogleShoppingProduct.js
│ │ ├── ProductHistory.js
│ │ └── InAppNotification.js
│ ├── middleware/
│ │ ├── auth.js # JWT authentication
│ │ ├── logger.js # Request logging
│ │ └── rateLimit.js # Rate limiting
│ ├── services/
│ │ ├── winScoreService.js # Win Score calculation
│ │ ├── adWinningService.js # Ad-based winning products
│ │ ├── groqService.js # Groq AI integration
│ │ ├── whatsappService.js # WhatsApp alerts (Green API)
│ │ ├── emailService.js # Email alerts (Gmail)
│ │ ├── alertService.js # Alert triggering
│ │ ├── notificationService.js # In-app notifications
│ │ ├── seasonalService.js # Seasonal intelligence
│ │ ├── historyService.js # Product history
│ │ └── otpService.js # OTP for password reset
│ ├── scrapers/
│ │ ├── fbAdsScraper.js # Facebook/Instagram ads
│ │ ├── darazScraper.js
│ │ ├── olxScraper.js
│ │ ├── googleTrendsScraper.js
│ │ ├── tiktokScraper.js
│ │ ├── realSupplierScraper.js
│ │ └── shopifyProductScraper.js
│ ├── jobs/
│ │ ├── alertJob.js # 30-min alert check
│ │ ├── scrapeJob.js # 6-hour scrapers
│ │ ├── scoreJob.js # 1-hour Win Score update
│ │ ├── fbAdsJob.js # 12-hour FB ads
│ │ ├── tiktokJob.js # 24-hour TikTok
│ │ └── dailyDigestJob.js # Daily email digest
│ ├── lib/
│ │ ├── scheduler.js # Cron job scheduler
│ │ └── socketEmitter.js # Socket.io events
│ ├── data/
│ │ └── seasonalKeywords.js # 650+ seasonal keywords
│ ├── Dockerfile # HF Space deployment
│ ├── package.json
│ └── .env.example
│
├── frontend/
│ ├── src/
│ │ ├── api/
│ │ │ ├── products.js # Product API calls
│ │ │ ├── trends.js # Trend API calls
│ │ │ └── alerts.js # Alert API calls
│ │ ├── components/
│ │ │ ├── Navbar.jsx
│ │ │ ├── Sidebar.jsx
│ │ │ ├── ProductCard.jsx
│ │ │ ├── WinScoreBadge.jsx
│ │ │ ├── TrendChart.jsx
│ │ │ ├── HeatMap.jsx
│ │ │ ├── AIReportModal.jsx
│ │ │ ├── AlertBell.jsx
│ │ │ ├── FilterBar.jsx
│ │ │ ├── SeasonalBanner.jsx
│ │ │ ├── ScoreBreakdown.jsx
│ │ │ ├── AdWinnerCard.jsx
│ │ │ ├── Footer.jsx
│ │ │ └── ThemeToggle.jsx
│ │ ├── pages/
│ │ │ ├── Landing.jsx # Homepage
│ │ │ ├── Login.jsx # Login page
│ │ │ ├── Dashboard.jsx # Main dashboard
│ │ │ ├── ProductHunt.jsx # Winning products
│ │ │ ├── AdSpy.jsx # Facebook/Instagram ads
│ │ │ ├── Profile.jsx # User profile + alerts
│ │ │ ├── PrivacyPolicy.jsx
│ │ │ ├── TermsOfService.jsx
│ │ │ ├── About.jsx
│ │ │ ├── Contact.jsx
│ │ │ └── FAQ.jsx
│ │ ├── store/
│ │ │ └── useStore.js # Zustand state management
│ │ ├── hooks/
│ │ │ ├── useProducts.js
│ │ │ ├── useTrends.js
│ │ │ └── useSocket.js # Socket.io client
│ │ ├── utils/
│ │ │ ├── scoreColor.js
│ │ │ ├── formatPKR.js
│ │ │ └── cityList.js
│ │ ├── App.jsx
│ │ └── main.jsx
│ ├── public/
│ ├── netlify.toml # Netlify redirects
│ ├── package.json
│ ├── vite.config.js
│ ├── tailwind.config.js
│ └── .env.example
│
├── .gitignore
└── README.md

---

## 🔧 Current Issues to Fix

### Issue 1: 504 Gateway Timeout on Register
- **Error:** `504` on `/api/auth/register`
- **File:** `backend/routes/auth.js`
- **Cause:** OTP email service or database timeout

### Issue 2: Frontend API Calls Wrong URL
- **Error:** Frontend calling `huntinggoals.netlify.app/api/...` instead of backend
- **File:** `frontend/netlify.toml`, `frontend/.env.production`
- **Fix:** Add `/api/*` redirect to HF Space backend

### Issue 3: CORS Blocking Frontend
- **Error:** CORS errors in browser console
- **File:** `backend/server/index.js`
- **Fix:** Add `FRONTEND_URL=https://huntinggoals.netlify.app` to HF secrets

### Issue 4: Socket.io Not Connected
- **Error:** Real-time alerts not working
- **File:** `frontend/src/hooks/useSocket.js`
- **Fix:** Use `VITE_API_URL` for socket connection

### Issue 5: Environment Variables Not Set
- **Files:** `frontend/.env.production`, Netlify dashboard, HF Space secrets
- **Fix:** Set `VITE_API_URL` and `FRONTEND_URL`

---

## 🔑 Environment Variables Needed

### Frontend (`frontend/.env.production`)
```env
VITE_API_URL=https://waheed777-hunting-goals-backend.hf.space
VITE_SOCKET_URL=https://waheed777-hunting-goals-backend.hf.space
```

### Backend (HF Space Secrets)
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
GROQ_API_KEY=...
FB_SESSION_COOKIE=...
EMAIL_USER=...
EMAIL_PASS=...
GREEN_API_INSTANCE_ID=...
GREEN_API_TOKEN=...
ADMIN_API_KEY=...
ALERTS_ENABLED=true
FRONTEND_URL=https://huntinggoals.netlify.app
```

### Netlify Environment Variables
```env
VITE_API_URL=https://waheed777-hunting-goals-backend.hf.space
VITE_SOCKET_URL=https://waheed777-hunting-goals-backend.hf.space
```

## 🚀 Deployment Details

**Backend (Hugging Face Spaces)**
- Space: waheed777/hunting-goals-backend
- Dockerfile: Uses node:20-bookworm-slim with system Chromium
- Port: 5000 (exposed)
- Entry Point: node server/index.js (merged API + Socket.io)

**Frontend (Netlify)**
- Site: huntinggoals.netlify.app
- Build Command: npm run build
- Publish Directory: dist
- Base Directory: frontend/
