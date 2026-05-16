# TrendSpy

Pakistan's #1 e-commerce product hunting tool for sellers on Daraz, OLX, and TikTok.

## Overview

TrendSpy is a React + Vite single-page application that helps Pakistani e-commerce sellers discover winning products before their competitors. It features AI-powered Win Scores, city-specific demand maps, ad spy tools, seasonal planning, and real-time alerts.

## Tech Stack

- **React 18** with Vite
- **Tailwind CSS** for styling (glassmorphism dark theme)
- **React Router DOM v6** for routing
- **Zustand** for state management
- **@tanstack/react-query** for data fetching
- **Recharts** for line/area/bar charts
- **Leaflet + react-leaflet** for the Pakistan heatmap
- **React Hot Toast** for notifications
- **date-fns** for date formatting
- **React Icons** for icons

## Project Structure

```
src/
├── api/          # Mock API functions (products, trends, alerts/ads)
├── components/   # Reusable UI components
├── pages/        # Page-level components (10 pages)
├── store/        # Zustand global store
├── hooks/        # Custom React hooks
└── utils/        # Helpers (scoreColor, formatPKR, cityList)
```

## Pages

- `/` — Landing page with hero, counters, and how-it-works
- `/login` — Auth page (simulated, no backend)
- `/dashboard` — Top winning products today
- `/products` — Full product list with filters & pagination
- `/city-explorer` — Pakistan map heatmap + city comparison
- `/trends` — Line/area charts for product & category trends
- `/ad-spy` — Facebook ad spy tool
- `/ai-analyst` — AI product analysis with profit calculator
- `/alerts` — Create and manage product alerts
- `/seasonal` — Pakistan seasonal calendar & countdown

## Development

```bash
npm run dev    # Start dev server on port 5000
npm run build  # Build for production
```

## User Preferences

- All mock data uses realistic Pakistani pricing in PKR
- UI is dark-themed with indigo/purple primary and orange accent colors
- No emojis in main UI components (only in seasonal banners and product data)
