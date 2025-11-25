# API Integrations Guide

This document lists all the free APIs integrated into the trading platform backend.

## 📊 Market Data APIs

### 1. **Yahoo Finance** (No API Key Required)
- **Cost**: Completely Free
- **Rate Limit**: None officially, but use reasonable caching
- **Features**: Stock quotes, crypto prices, historical data, trending tickers
- **Reliability**: ⭐⭐⭐⭐⭐ (Very reliable, no authentication needed)
- **Setup**: Works out of the box

### 2. **Binance** (No API Key Required)
- **Cost**: Completely Free
- **Rate Limit**: 1200 requests/minute
- **Features**: Real-time crypto prices, 24hr tickers, klines, order book depth
- **Reliability**: ⭐⭐⭐⭐⭐ (Most reliable for crypto)
- **Setup**: Works out of the box
- **Website**: https://api.binance.com

### 3. **CoinGecko** (No API Key Required)
- **Cost**: Completely Free
- **Rate Limit**: 10-50 calls/minute
- **Features**: Crypto prices, market data, trending coins
- **Reliability**: ⭐⭐⭐⭐
- **Setup**: Works out of the box
- **Website**: https://www.coingecko.com/en/api

### 4. **Twelve Data**
- **Cost**: Free tier - 800 API calls/day
- **Rate Limit**: 8 calls/minute
- **Features**: Stocks, forex, crypto quotes, time series data
- **Reliability**: ⭐⭐⭐⭐
- **Setup**: 
  1. Sign up at https://twelvedata.com
  2. Get free API key
  3. Add to `.env.local`: `TWELVE_DATA_API_KEY=your_key`
- **Website**: https://twelvedata.com

### 5. **Finnhub**
- **Cost**: Free tier - 60 API calls/minute
- **Rate Limit**: 60 calls/minute, 30 calls/second
- **Features**: Stock quotes, forex rates, crypto data, company news
- **Reliability**: ⭐⭐⭐⭐
- **Setup**:
  1. Sign up at https://finnhub.io
  2. Get free API key
  3. Add to `.env.local`: `FINNHUB_API_KEY=your_key`
- **Website**: https://finnhub.io

### 6. **Polygon.io**
- **Cost**: Free tier - 5 API calls/minute
- **Rate Limit**: 5 calls/minute
- **Features**: Stock aggregates, previous close, gainers/losers, ticker search
- **Reliability**: ⭐⭐⭐
- **Setup**:
  1. Sign up at https://polygon.io
  2. Get free API key
  3. Add to `.env.local`: `POLYGON_API_KEY=your_key`
- **Website**: https://polygon.io

### 7. **Alpha Vantage**
- **Cost**: Free tier - 5 calls/minute, 500/day
- **Rate Limit**: 5 calls/minute, 500 calls/day
- **Features**: Forex rates, stock data
- **Reliability**: ⭐⭐⭐
- **Setup**:
  1. Sign up at https://www.alphavantage.co
  2. Get free API key
  3. Add to `.env.local`: `ALPHA_VANTAGE_API_KEY=your_key`
- **Website**: https://www.alphavantage.co

### 8. **CryptoCompare**
- **Cost**: Free tier - 100,000 calls/month
- **Rate Limit**: Varies by endpoint
- **Features**: Crypto prices, market data
- **Reliability**: ⭐⭐⭐⭐
- **Setup**:
  1. Sign up at https://www.cryptocompare.com
  2. Get free API key (optional for basic use)
  3. Add to `.env.local`: `CRYPTOCOMPARE_API_KEY=your_key`
- **Website**: https://www.cryptocompare.com/cryptopian/api-keys

## 📰 News APIs

### 9. **RSS Feeds** (No API Key Required)
- **Cost**: Completely Free
- **Rate Limit**: None
- **Sources**: Bloomberg, Reuters, Financial Times
- **Reliability**: ⭐⭐⭐⭐
- **Setup**: Works out of the box

### 10. **NewsAPI.org**
- **Cost**: Free tier - 100 requests/day
- **Rate Limit**: 100 calls/day
- **Features**: News articles with search and filtering
- **Reliability**: ⭐⭐⭐
- **Setup**:
  1. Sign up at https://newsapi.org
  2. Get free API key
  3. Add to `.env.local`: `NEWS_API_KEY=your_key`
- **Website**: https://newsapi.org

### 11. **Currents API**
- **Cost**: Free tier - 600 requests/day
- **Rate Limit**: 600 calls/day
- **Features**: Latest news, search by keywords, multiple categories
- **Reliability**: ⭐⭐⭐⭐
- **Setup**:
  1. Sign up at https://currentsapi.services
  2. Get free API key
  3. Add to `.env.local`: `CURRENTS_API_KEY=your_key`
- **Website**: https://currentsapi.services

### 12. **GNews API**
- **Cost**: Free tier - 100 requests/day
- **Rate Limit**: 100 calls/day
- **Features**: Top headlines, news search with date range
- **Reliability**: ⭐⭐⭐⭐
- **Setup**:
  1. Sign up at https://gnews.io
  2. Get free API key
  3. Add to `.env.local`: `GNEWS_API_KEY=your_key`
- **Website**: https://gnews.io

### 13. **CryptoPanic**
- **Cost**: Free tier available (auth optional for public feed)
- **Rate Limit**: Reasonable limits for free tier
- **Features**: Crypto-focused news aggregation, trending posts, sentiment
- **Reliability**: ⭐⭐⭐⭐
- **Setup**:
  1. Optional: Sign up at https://cryptopanic.com
  2. Optional: Get API key for higher limits
  3. Add to `.env.local` (optional): `CRYPTOPANIC_API_KEY=your_key`
- **Website**: https://cryptopanic.com/developers/api

## 📈 Economic Data APIs

### 14. **FRED (Federal Reserve Economic Data)**
- **Cost**: Completely Free
- **Rate Limit**: None (reasonable use expected)
- **Features**: Comprehensive US economic indicators (GDP, inflation, unemployment, etc.)
- **Reliability**: ⭐⭐⭐⭐⭐
- **Setup**:
  1. Sign up at https://fred.stlouisfed.org
  2. Request API key (instant approval)
  3. Add to `.env.local`: `FRED_API_KEY=your_key`
- **Website**: https://fred.stlouisfed.org/docs/api/

### 15. **World Bank API** (No API Key Required)
- **Cost**: Completely Free
- **Rate Limit**: None
- **Features**: Global economic indicators for all countries
- **Reliability**: ⭐⭐⭐⭐⭐
- **Setup**: Works out of the box
- **Website**: https://datahelpdesk.worldbank.org/knowledgebase/articles/889392

## 🔧 Setup Instructions

### 1. Create Environment File

Create a `.env.local` file in the project root (one level above `/backend`):

```bash
# Required - Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=trading_db
DB_USER=postgres
DB_PASSWORD=your_password

# Required - JWT
JWT_SECRET=your_secret_key_here

# Optional - Market Data APIs (more = better coverage)
TWELVE_DATA_API_KEY=your_key
FINNHUB_API_KEY=your_key
POLYGON_API_KEY=your_key
ALPHA_VANTAGE_API_KEY=your_key
CRYPTOCOMPARE_API_KEY=your_key

# Optional - News APIs (more = more news sources)
NEWS_API_KEY=your_key
CURRENTS_API_KEY=your_key
GNEWS_API_KEY=your_key
CRYPTOPANIC_API_KEY=your_key

# Optional - Economic Data APIs
FRED_API_KEY=your_key

# Note: Several APIs work without keys:
# - Yahoo Finance (stocks, crypto)
# - Binance (crypto)
# - CoinGecko (crypto)
# - World Bank (economic data)
# - RSS Feeds (news)
```

### 2. Priority Setup (Start with these)

**For immediate functionality without API keys:**
- Yahoo Finance ✅ (works immediately)
- Binance ✅ (works immediately)
- CoinGecko ✅ (works immediately)
- World Bank ✅ (works immediately)

**Recommended free API keys to get:**
1. **FRED** - Best US economic data (instant approval)
2. **Twelve Data** - Good stock/forex data (800 calls/day)
3. **Finnhub** - Market news + quotes (60 calls/min)
4. **Currents** - News aggregation (600 calls/day)

### 3. API Key Registration Process

Most APIs follow this process:
1. Visit the website
2. Sign up with email
3. Verify email
4. Generate API key from dashboard
5. Copy key to `.env.local`
6. Restart backend server

## 📊 Data Aggregation Strategy

The platform uses a **fallback chain** approach:

### Stock Quotes
1. Yahoo Finance (free, no key) ➜
2. Twelve Data (if key configured) ➜
3. Finnhub (if key configured) ➜
4. Polygon (if key configured)

### Crypto Quotes
1. Binance (free, no key) ➜
2. CoinGecko (free, no key)

### News
- All sources fetched in parallel
- Deduplicated by title
- Sorted by date
- Sources: RSS feeds, NewsAPI, Currents, GNews, Finnhub, CryptoPanic

### Economic Data
- FRED for US data (if key configured)
- World Bank for global data (always available)

## 🚀 Usage Examples

### Get Stock Quote
```typescript
import { aggregatedDataService } from './services/aggregatedData.service';

const quote = await aggregatedDataService.getStockQuote('AAPL');
console.log(quote);
// { symbol: 'AAPL', price: 178.50, source: 'Yahoo Finance', ... }
```

### Get Crypto Quote
```typescript
const btc = await aggregatedDataService.getCryptoQuote('BTCUSDT');
console.log(btc);
// { symbol: 'BTCUSDT', price: 44250.00, source: 'Binance', ... }
```

### Get Aggregated News
```typescript
const news = await aggregatedDataService.getAggregatedNews(50);
console.log(`Got ${news.length} articles from multiple sources`);
```

### Get Economic Indicators
```typescript
const indicators = await aggregatedDataService.getEconomicIndicators('USA');
console.log(indicators);
// { fred: { GDP: {...}, UNEMPLOYMENT: {...} }, worldBank: { gdp: {...} } }
```

## 🔄 Rate Limiting & Caching

All clients implement intelligent caching:
- **Market data**: 1 minute cache
- **News**: 5 minute cache  
- **Economic data**: 1 hour cache
- **Crypto real-time**: 10 second cache

The aggregation service automatically:
- Falls back to alternative sources if one fails
- Respects rate limits through caching
- Deduplicates results
- Provides best available data

## 🎯 Best Practices

1. **Start without API keys** - Test with Yahoo Finance, Binance, CoinGecko
2. **Add keys gradually** - Start with FRED and Twelve Data
3. **Monitor usage** - Check API dashboards for quota usage
4. **Enable caching** - Reduce redundant API calls
5. **Handle failures gracefully** - The fallback system does this automatically

## 📝 Notes

- All APIs have free tiers suitable for development and small-scale production
- No credit card required for any of these APIs
- Rate limits are per API key, not per IP
- Caching significantly reduces API call volume
- The system works well with just the free (no-key) APIs
