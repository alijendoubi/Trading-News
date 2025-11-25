#!/bin/bash

# Trading Platform API Keys Setup Script
# This script helps you configure free external API keys

echo "🚀 Trading Platform - API Keys Setup"
echo "======================================"
echo ""
echo "This script will help you configure FREE API keys for enhanced features."
echo "All services have free tiers and require NO credit card!"
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "✅ Found existing .env.local file"
    echo ""
else
    echo "📝 Creating .env.local from template..."
    cp .env.example .env.local
    echo "✅ Created .env.local"
    echo ""
fi

echo "📋 API Keys to Configure:"
echo ""
echo "1️⃣  NewsAPI (100 requests/day - FREE)"
echo "   Sign up: https://newsapi.org/register"
echo "   What you get: 80,000+ news sources, search, filtering"
echo ""
echo "2️⃣  Alpha Vantage (500 requests/day - FREE)"
echo "   Sign up: https://www.alphavantage.co/support/#api-key"
echo "   What you get: Forex rates, stock data, technical indicators"
echo ""
echo "3️⃣  Cryptocompare (100,000 calls/month - FREE)"
echo "   Sign up: https://www.cryptocompare.com/cryptopian/api-keys"
echo "   What you get: Detailed crypto data, historical prices, social stats"
echo ""
echo "4️⃣  Financial Modeling Prep (250 requests/day - FREE)"
echo "   Sign up: https://financialmodelingprep.com/developer/docs/"
echo "   What you get: Real economic calendar, earnings, IPOs"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 QUICK START OPTIONS:"
echo ""
echo "A) Configure API keys now (recommended)"
echo "B) Skip and use free alternatives (works great!)"
echo "C) Open sign-up links in browser and I'll wait"
echo ""
read -p "Choose option (A/B/C): " choice

case $choice in
    [Aa])
        echo ""
        echo "📝 Let's configure your API keys..."
        echo ""
        
        # NewsAPI
        echo "1️⃣  NewsAPI Key"
        echo "   If you don't have one, press Enter to skip"
        read -p "   Enter your NewsAPI key: " news_api_key
        if [ ! -z "$news_api_key" ]; then
            # Update .env.local
            if grep -q "NEWS_API_KEY=" .env.local; then
                sed -i '' "s/NEWS_API_KEY=.*/NEWS_API_KEY=$news_api_key/" .env.local
            else
                echo "NEWS_API_KEY=$news_api_key" >> .env.local
            fi
            echo "   ✅ NewsAPI key saved!"
        else
            echo "   ⏭  Skipped - will use RSS feeds"
        fi
        echo ""
        
        # Alpha Vantage
        echo "2️⃣  Alpha Vantage Key"
        echo "   If you don't have one, press Enter to skip"
        read -p "   Enter your Alpha Vantage key: " alpha_key
        if [ ! -z "$alpha_key" ]; then
            if grep -q "ALPHA_VANTAGE_API_KEY=" .env.local; then
                sed -i '' "s/ALPHA_VANTAGE_API_KEY=.*/ALPHA_VANTAGE_API_KEY=$alpha_key/" .env.local
            else
                echo "ALPHA_VANTAGE_API_KEY=$alpha_key" >> .env.local
            fi
            echo "   ✅ Alpha Vantage key saved!"
        else
            echo "   ⏭  Skipped - forex data unavailable"
        fi
        echo ""
        
        # Cryptocompare
        echo "3️⃣  Cryptocompare Key (optional)"
        echo "   If you don't have one, press Enter to skip"
        read -p "   Enter your Cryptocompare key: " crypto_key
        if [ ! -z "$crypto_key" ]; then
            if grep -q "CRYPTOCOMPARE_API_KEY=" .env.local; then
                sed -i '' "s/CRYPTOCOMPARE_API_KEY=.*/CRYPTOCOMPARE_API_KEY=$crypto_key/" .env.local
            else
                echo "CRYPTOCOMPARE_API_KEY=$crypto_key" >> .env.local
            fi
            echo "   ✅ Cryptocompare key saved!"
        else
            echo "   ⏭  Skipped - will use CoinGecko only"
        fi
        echo ""
        
        # FMP
        echo "4️⃣  Financial Modeling Prep Key (optional)"
        echo "   If you don't have one, press Enter to skip"
        read -p "   Enter your FMP key: " fmp_key
        if [ ! -z "$fmp_key" ]; then
            if grep -q "FMP_API_KEY=" .env.local; then
                sed -i '' "s/FMP_API_KEY=.*/FMP_API_KEY=$fmp_key/" .env.local
            else
                echo "FMP_API_KEY=$fmp_key" >> .env.local
            fi
            echo "   ✅ FMP key saved!"
        else
            echo "   ⏭  Skipped - will use mock economic data"
        fi
        echo ""
        ;;
        
    [Bb])
        echo ""
        echo "✅ No problem! The platform works great without API keys:"
        echo "   • CoinGecko for crypto prices (free, no key needed)"
        echo "   • RSS feeds for news (free, no key needed)"
        echo "   • Mock economic data (realistic events)"
        echo ""
        echo "You can add API keys later by running this script again."
        echo ""
        ;;
        
    [Cc])
        echo ""
        echo "🌐 Opening sign-up pages in your browser..."
        echo ""
        
        # Open URLs in browser
        open "https://newsapi.org/register" 2>/dev/null || echo "NewsAPI: https://newsapi.org/register"
        sleep 2
        open "https://www.alphavantage.co/support/#api-key" 2>/dev/null || echo "Alpha Vantage: https://www.alphavantage.co/support/#api-key"
        sleep 2
        open "https://www.cryptocompare.com/cryptopian/api-keys" 2>/dev/null || echo "Cryptocompare: https://www.cryptocompare.com/cryptopian/api-keys"
        sleep 2
        open "https://financialmodelingprep.com/developer/docs/" 2>/dev/null || echo "FMP: https://financialmodelingprep.com/developer/docs/"
        
        echo ""
        echo "✅ Sign-up pages opened!"
        echo ""
        echo "📝 After signing up, run this script again and choose option A"
        echo "   to enter your API keys."
        echo ""
        ;;
        
    *)
        echo ""
        echo "Invalid option. Run the script again."
        exit 1
        ;;
esac

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 Setup Complete!"
echo ""
echo "📊 Current Configuration:"
echo ""

# Show what's configured
if grep -q "NEWS_API_KEY=.\+" .env.local; then
    echo "✅ NewsAPI: Configured"
else
    echo "⏭  NewsAPI: Using RSS feeds"
fi

if grep -q "ALPHA_VANTAGE_API_KEY=.\+" .env.local; then
    echo "✅ Alpha Vantage: Configured"
else
    echo "⏭  Alpha Vantage: Forex unavailable"
fi

if grep -q "CRYPTOCOMPARE_API_KEY=.\+" .env.local; then
    echo "✅ Cryptocompare: Configured"
else
    echo "⏭  Cryptocompare: Using CoinGecko only"
fi

if grep -q "FMP_API_KEY=.\+" .env.local; then
    echo "✅ FMP: Configured"
else
    echo "⏭  FMP: Using mock economic data"
fi

echo ""
echo "🚀 Next Steps:"
echo ""
echo "1. Start the backend:"
echo "   cd backend && npm run dev"
echo ""
echo "2. Check the logs to see which APIs are working:"
echo "   tail -f backend/logs/combined.log"
echo ""
echo "3. Test the APIs:"
echo "   curl http://localhost:5000/api/markets/assets"
echo "   curl http://localhost:5000/api/news"
echo ""
echo "📖 For more details, see: API_INTEGRATION_GUIDE.md"
echo ""
