# Hunting Goals — Pakistan's #1 Winning Product Hunter

Find winning products **before** your competitors using real Facebook & Instagram ad intelligence.

## Quick Start (3 Steps)

```bash
# 1. Clone
git clone https://github.com/waheed000/TrendSpy.git
cd TrendSpy

# 2. Install dependencies
npm install
cd trendspy-backend && npm install && cd ..

# 3. Run (both frontend + backend)
npm run dev:all
```

Open [http://localhost:5000](http://localhost:5000) — the app is ready with demo data, no sign-up needed.

---

## Features

- 🔥 **Real-time Ad Intelligence** — Facebook & Instagram ad spy tool
- 🏆 **Win Score Engine** — 4+ real ad signals (days running, spend level, city coverage)
- 🤖 **AI Product Analysis** — Profit estimates, ad copy, supplier suggestions
- 📊 **Dashboard** — Top winning products updated daily
- 🗺️ **City Explorer** — Pakistan heatmap + city-by-city demand comparison
- 📈 **Trend Charts** — Line/area charts for products and categories
- 🔔 **Alerts** — Create keyword alerts for products you want to track
- 🗓️ **Seasonal Planner** — Pakistan seasonal calendar with 650+ keywords
- 🔐 **Authentication** — Email registration + JWT sessions

---

## Environment Variables

Copy `.env.example` to `.env.local` for optional features. The app runs fully without them using graceful fallbacks.

| Variable | Purpose | Required |
|---|---|---|
| `JWT_SECRET` | Auth token signing | **Required in production** (tokens break on restart without it) |
| `MONGODB_URI` | Persistent MongoDB (Atlas) | No — uses in-memory fallback |
| `GROQ_API_KEY` | Real AI analysis | No — uses local fallback |
| `FB_SESSION_COOKIE` | Live Facebook ad scraping | No — uses seeded demo data |
| `EMAIL_USER` + `EMAIL_PASS` | Email alerts | No |
| `GREEN_API_INSTANCE_ID` + `GREEN_API_TOKEN` | WhatsApp alerts | No |
| `SOCKET_INTERNAL_SECRET` | Internal service auth | No — auto in dev |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Next.js 14 API routes + Express wrapper |
| Real-time | Socket.io (port 3002) |
| Database | MongoDB (Atlas in prod / in-memory in dev) |
| AI | Groq API (local fallback included) |
| State | Zustand + TanStack Query |
| Maps | Leaflet + react-leaflet |
| Charts | Recharts |

---

## Project Structure

```
TrendSpy/
├── src/                    # React frontend (Vite)
│   ├── api/                # API client functions
│   ├── components/         # Reusable UI components
│   ├── pages/              # 15+ page components
│   ├── store/              # Zustand global store
│   └── hooks/              # Custom React hooks
└── trendspy-backend/       # Next.js + Express backend
    ├── app/api/            # 30+ REST API routes
    ├── models/             # Mongoose models
    ├── services/           # Business logic
    ├── scrapers/           # Facebook/OLX/Daraz scrapers
    ├── jobs/               # Cron jobs
    └── lib/                # DB, seed, utilities
```

---

## API Endpoints

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/health` | GET | — | Health check |
| `/api/products` | GET | — | Product list with filters |
| `/api/products/winning` | GET | — | Win-score ranked products |
| `/api/ads` | GET | — | Ad spy feed |
| `/api/dashboard/stats` | GET | — | Dashboard statistics |
| `/api/auth/register` | POST | — | Create account |
| `/api/auth/login` | POST | — | Login, returns JWT |
| `/api/user/profile` | GET | JWT | User profile |
| `/api/alerts` | GET/POST | JWT | Manage alerts |
| `/api/ai/analyze` | POST | JWT | AI product analysis |
| `/api/notifications` | GET | JWT | In-app notifications |
| `/api/products/:slug/history` | GET | — | Product win-score history |

---

## License

MIT
