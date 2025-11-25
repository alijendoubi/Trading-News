# 🔑 API Keys Quick Reference

## 🚀 One-Command Setup

```bash
./setup-api-keys.sh
```

Choose option **C** to open all sign-up pages, then option **A** to configure.

## 📋 Sign-Up Links (All FREE, No Credit Card)

### 1️⃣ NewsAPI
- **Link**: https://newsapi.org/register
- **Time**: 30 seconds
- **Benefits**: 80,000+ news sources
- **Free Tier**: 100 requests/day

### 2️⃣ Alpha Vantage  
- **Link**: https://www.alphavantage.co/support/#api-key
- **Time**: 30 seconds
- **Benefits**: Forex & stock data
- **Free Tier**: 500 requests/day

### 3️⃣ Cryptocompare
- **Link**: https://www.cryptocompare.com/cryptopian/api-keys
- **Time**: 1 minute
- **Benefits**: Detailed crypto data
- **Free Tier**: 100,000 calls/month

### 4️⃣ Financial Modeling Prep
- **Link**: https://financialmodelingprep.com/developer/docs/
- **Time**: 1 minute  
- **Benefits**: Real economic calendar
- **Free Tier**: 250 requests/day

## ⚡ Manual Setup (if you prefer)

```bash
# 1. Copy template
cp .env.example .env.local

# 2. Edit file
nano .env.local

# 3. Add your keys:
NEWS_API_KEY=your_newsapi_key
ALPHA_VANTAGE_API_KEY=your_alphavantage_key
CRYPTOCOMPARE_API_KEY=your_cryptocompare_key
FMP_API_KEY=your_fmp_key

# 4. Save and start server
cd backend && npm run dev
```

## 🎯 What Each Key Enables

| API | Without Key | With Key |
|-----|-------------|----------|
| **NewsAPI** | RSS feeds (3 sources) | 80,000+ sources |
| **Alpha Vantage** | ❌ No forex | ✅ Real-time forex |
| **Cryptocompare** | CoinGecko only | Backup + more data |
| **FMP** | Mock events | Real economic calendar |

## ✅ Current Status Check

```bash
# Check which keys are configured
grep "_API_KEY" .env.local | grep -v "^#" | grep -v "=$"
```

## 🧪 Test Your APIs

```bash
# After starting the server (npm run dev in backend/):

# Test markets (works with/without keys)
curl http://localhost:5000/api/markets/assets

# Test news (better with NewsAPI key)
curl http://localhost:5000/api/news

# Test economic events
curl http://localhost:5000/api/events
```

## 🔄 Update Keys Later

Just run the setup script again:
```bash
./setup-api-keys.sh
```

Or edit `.env.local` directly:
```bash
nano .env.local
# Then restart the server
```

## 💡 Pro Tips

1. **Start without keys** - Everything works!
2. **Add NewsAPI first** - Biggest impact
3. **Add others gradually** - No rush
4. **Keys are optional** - Never required

## 🆘 Troubleshooting

### "Script not executable"
```bash
chmod +x setup-api-keys.sh
```

### "Can't find .env.local"
```bash
cp .env.example .env.local
```

### "API not working"
1. Check key is in `.env.local`
2. Restart backend server
3. Check logs: `tail -f backend/logs/combined.log`

## 📊 Rate Limits Summary

| Service | Calls/Day | Calls/Minute |
|---------|-----------|--------------|
| CoinGecko | Unlimited | 50 |
| NewsAPI | 100 | N/A |
| Alpha Vantage | 500 | 5 |
| Cryptocompare | ~3,300 | N/A |
| FMP | 250 | N/A |

**Our caching ensures you stay well within limits!**

## 🎓 More Info

- Full guide: `API_INTEGRATION_GUIDE.md`
- Backend docs: `BACKEND_COMPLETE.md`
- Project README: `README.md`

---

**Total time to set up all 4 APIs: ~3 minutes** ⏱️  
**Total cost: $0.00** 💰  
**Credit card required: NO** ✅
