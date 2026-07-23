---
title: Hunting Goals Backend
emoji: 🎯
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 5000
pinned: false
---

# Hunting Goals Backend API

## Environment Variables

Copy `.env.example` to `.env` and fill in:

- `MONGODB_URI` — MongoDB Atlas connection string
- `JWT_SECRET` — JWT secret key
- `GROQ_API_KEY` — Groq API key (optional)
- `FB_SESSION_COOKIE` — Facebook session cookie (optional)
- `EMAIL_USER` + `EMAIL_PASS` — Gmail credentials (optional)
- `GREEN_API_INSTANCE_ID` + `GREEN_API_TOKEN` — Green API credentials (optional)
- `ADMIN_API_KEY` — Admin API key (optional)
- `ALERTS_ENABLED` — Set to "true" to enable alerts

## API Endpoints

- `GET /api/health` — Health check
- `GET /api/products` — Get all products
- `GET /api/products/winning` — Get winning products
- `GET /api/ads` — Get scraped ads
- `POST /api/auth/register` — Register user
- `POST /api/auth/login` — Login user

## Deployment

This backend is deployed on Hugging Face Spaces using Docker SDK.

## License

MIT
