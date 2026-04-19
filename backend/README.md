# Fintrack Backend

Backend API for the Fintrack AI stock suggestion and portfolio intelligence app.

## Run Locally

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

API base URL:

```text
http://localhost:4000/api
```

## Required From You

1. Gemini API key for live AI suggestions.
2. Database choice for production: MongoDB, PostgreSQL, or Firebase.
3. Auth method preference: email/password, Google login, or both.
4. Whether portfolio holdings are manually entered only, or imported from CSV later.
5. Stock market data provider later: mock data now, then Alpha Vantage, Finnhub, Yahoo Finance proxy, NSE data provider, or broker-neutral paid feed.

## Current Status

- Uses mock in-memory data.
- Does not place buy/sell orders.
- Provides suggestions, alerts, watchlist, stock insights, and portfolio analysis only.
- Gemini route falls back to mock AI insights when `GEMINI_API_KEY` is missing.

## API Routes

```text
GET    /api/health

POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/portfolio/summary
GET    /api/portfolio/holdings
POST   /api/portfolio/holdings
PATCH  /api/portfolio/holdings/:id
DELETE /api/portfolio/holdings/:id
GET    /api/portfolio/allocation

GET    /api/watchlist
POST   /api/watchlist
DELETE /api/watchlist/:id

GET    /api/alerts
POST   /api/alerts
PATCH  /api/alerts/:id/status

GET    /api/suggestions
GET    /api/suggestions/:symbol

GET    /api/stocks/search?q=TCS
GET    /api/stocks/:symbol

POST   /api/ai/insights
```

## Mock Login

```json
{
  "email": "deepak@fintrack.app",
  "password": "mockpass"
}
```
