# 🚀 Real-Time Market Data Setup

## Get Your FREE Twelve Data API Key (2 minutes)

### Step 1: Sign Up (Free - No Credit Card)
1. Go to: https://twelvedata.com/pricing
2. Click **"Start Free Trial"** under the **Free** plan
3. Sign up with your email
4. Verify your email

### Step 2: Get Your API Key
1. Log into dashboard: https://twelvedata.com/account/api-keys
2. Copy your API key (looks like: `a1b2c3d4e5f6...`)

### Step 3: Add to Your Project
1. Open `/backend/.env`
2. Find line 47: `TWELVE_DATA_API_KEY=`
3. Paste your key: `TWELVE_DATA_API_KEY=your_api_key_here`
4. Save the file

### Step 4: Restart Server
```bash
cd backend
npm run dev
```

## What You Get (FREE tier)

✅ **800 API calls per day**
- 47 traditional markets updated hourly = 1,128 calls/day needed
- **Solution**: Updates every 90 minutes = 752 calls/day ✓

✅ **Real-Time Data**:
- 20 Major Stocks (AAPL, MSFT, GOOGL, AMZN, NVDA, TSLA, META, JPM, V, NFLX...)
- 8 Forex Pairs (EUR/USD, GBP/USD, USD/JPY, AUD/USD...)
- 6 Commodities (Gold, Silver, Crude Oil, Brent, Natural Gas, Copper)
- 7 Major Indices (S&P 500, Dow Jones, NASDAQ, FTSE 100, DAX, Nikkei, Hang Seng)

✅ **Your Complete Markets**:
- 30+ Crypto (Real-time from Binance - FREE, unlimited)
- 47 Traditional Markets (Real-time from Twelve Data - FREE, 800 calls/day)
- **Total: 77+ markets with live prices!**

## Alternative APIs (if you hit limits)

### Already Installed (choose any):
- **Alpha Vantage**: 500 calls/day - https://www.alphavantage.co/support/#api-key
- **Finnhub**: 60 calls/min - https://finnhub.io/register
- **Polygon.io**: 5 calls/min - https://polygon.io/

Add any of these to `.env` and the platform will automatically use them as backups!

## Current Status

**Without API Key:**
- ✅ 30+ Crypto (working - Binance)
- ❌ 47 Traditional Markets (need Twelve Data key)

**With API Key:**
- ✅ 30+ Crypto (working - Binance)
- ✅ 47 Traditional Markets (working - Twelve Data)
- ✅ **ALL 77+ markets LIVE!**

## Need Help?

The backend logs will show exactly what's happening:
```bash
npm run dev
```

Look for:
- `✓ Twelve Data returned X quotes` (success)
- `Twelve Data API key not configured` (add key)
- `Twelve Data API error` (check key is valid)
