# 🚀 Quick Start Guide

Get the Trading Intelligence Platform running in under 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Git installed

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Start Backend

```bash
cd backend
npm run dev
```

✅ Backend should now be running at **http://localhost:3001**

Test it:
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-24T..."
}
```

## Step 3: Start Frontend

Open a **new terminal** window:

```bash
cd frontend
npm run dev
```

✅ Frontend should now be running at **http://localhost:3000**

## Step 4: Access the Platform

Open your browser and go to: **http://localhost:3000**

### Try These Features:

1. **View Market Data**
   - Go to http://localhost:3000/markets
   - See live cryptocurrency prices (auto-refreshes every 30s)

2. **Check Economic Calendar**
   - Go to http://localhost:3000/calendar
   - View upcoming economic events

3. **Read Financial News**
   - Go to http://localhost:3000/news
   - Browse latest financial news

4. **Create an Account**
   - Click "Login" → "create a new account"
   - Register with any email and password (min 8 chars)

5. **Use Authenticated Features** (after login)
   - **Watchlist**: Add assets and track their prices
   - **Alerts**: Set price alerts (above/below)

## API Endpoints

All available at **http://localhost:3001/api**

### Test Without Authentication:

```bash
# Get markets
curl http://localhost:3001/api/markets

# Get economic events
curl http://localhost:3001/api/events

# Get news
curl http://localhost:3001/api/news
```

### Test With Authentication:

```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login (save the accessToken)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get your watchlist (use your token)
curl http://localhost:3001/api/watchlists \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🎯 What's Running?

### Backend (Port 3001)
- ✅ 17 API endpoints
- ✅ JWT authentication
- ✅ 4 cron jobs syncing data:
  - Market data: Every 1 minute
  - Economic events: Every 6 hours
  - News: Every 30 minutes
  - Price alerts: Every 5 minutes

### Frontend (Port 3000)
- ✅ 8 pages (Home, Markets, Calendar, News, Watchlist, Alerts, Login, Register)
- ✅ Real-time polling updates
- ✅ Protected routes for authenticated features

## 🔑 API Keys (Optional)

The platform works without API keys using mock data. To enable real external data:

1. Get free API keys (no credit card required):
   - NewsAPI: https://newsapi.org/register
   - Alpha Vantage: https://www.alphavantage.co/support/#api-key
   - FMP: https://financialmodelingprep.com/developer/docs/

2. Update `.env.local` in the project root:
   ```bash
   NEWS_API_KEY=your_key_here
   ALPHA_VANTAGE_API_KEY=your_key_here
   FMP_API_KEY=your_key_here
   ```

3. Restart the backend:
   ```bash
   cd backend
   npm run dev
   ```

## 🐛 Troubleshooting

### Backend won't start (port 3001 in use)
```bash
# Find and kill the process
lsof -ti:3001 | xargs kill -9

# Then restart
npm run dev
```

### Frontend won't start (port 3000 in use)
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9

# Then restart
npm run dev
```

### Database connection errors
**This is normal!** The platform runs in mock mode without a database. Everything still works perfectly for development.

### "Module not found" errors
```bash
# Reinstall dependencies
npm install

# Then try again
npm run dev
```

## 📚 More Information

- **Full Documentation**: See `README_COMPLETE.md`
- **API Reference**: See `API_DOCUMENTATION.md`
- **Project Summary**: See `PROJECT_COMPLETE.md`

## ✨ You're All Set!

The platform is now fully functional. Explore all the features:

1. ✅ Real-time market data
2. ✅ Economic calendar
3. ✅ Financial news
4. ✅ User authentication
5. ✅ Personal watchlists
6. ✅ Price alerts

**Enjoy your Trading Intelligence Platform!** 🎉
