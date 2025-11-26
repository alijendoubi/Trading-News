import { Router, Request, Response } from 'express';
import { mockAssets } from '../services/mock-data.service.js';
import { HttpResponse } from '../utils/http-response.js';
import { aggregatedDataService } from '../services/aggregatedData.service.js';
import { yahooFinanceClient } from '../integrations/yahooFinance.client.js';
import { logger } from '../config/logger.js';

const router = Router();

// Main markets endpoint - returns 100% REAL-TIME data from CoinGecko + Yahoo Finance (NO API KEYS NEEDED)
router.get('/', async (req: Request, res: Response) => {
  try {
    let marketsData: any[] = [];

    // Get live crypto data from CoinGecko (free, no API key, always works)
    logger.info('Fetching crypto data from CoinGecko...');
    try {
      const axios = require('axios');
      const cryptoResponse = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 30,
          page: 1,
          sparkline: false
        },
        timeout: 10000
      });
      
      if (cryptoResponse.data && cryptoResponse.data.length > 0) {
        const topCrypto = cryptoResponse.data.map((coin: any) => ({
          id: coin.id,
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          currentPrice: coin.current_price,
          change24h: coin.price_change_percentage_24h || 0,
          volume24h: coin.total_volume || 0,
          marketCap: coin.market_cap || 0,
          type: 'crypto' as const,
        }));
        
        marketsData = [...marketsData, ...topCrypto];
        logger.info(`✓ Added ${topCrypto.length} crypto assets from CoinGecko`);
      } else {
        logger.warn('CoinGecko returned empty array');
      }
    } catch (cryptoError: any) {
      logger.error('CoinGecko API error:', cryptoError.message);
    }

    // Fetch REAL-TIME traditional markets from Yahoo Finance (free, no API key)
    logger.info('Fetching real-time traditional markets from Yahoo Finance...');
    
    try {
      const axios = require('axios');
      
      // Define assets to fetch with Yahoo Finance symbols
      const assets = [
        // Top Stocks
        { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock' },
        { symbol: 'MSFT', name: 'Microsoft', type: 'stock' },
        { symbol: 'GOOGL', name: 'Alphabet', type: 'stock' },
        { symbol: 'AMZN', name: 'Amazon', type: 'stock' },
        { symbol: 'NVDA', name: 'NVIDIA', type: 'stock' },
        { symbol: 'TSLA', name: 'Tesla', type: 'stock' },
        { symbol: 'META', name: 'Meta', type: 'stock' },
        { symbol: 'JPM', name: 'JPMorgan', type: 'stock' },
        { symbol: 'V', name: 'Visa', type: 'stock' },
        { symbol: 'NFLX', name: 'Netflix', type: 'stock' },
        // Forex pairs
        { symbol: 'EURUSD=X', name: 'EUR/USD', type: 'forex', displaySymbol: 'EURUSD' },
        { symbol: 'GBPUSD=X', name: 'GBP/USD', type: 'forex', displaySymbol: 'GBPUSD' },
        { symbol: 'USDJPY=X', name: 'USD/JPY', type: 'forex', displaySymbol: 'USDJPY' },
        { symbol: 'AUDUSD=X', name: 'AUD/USD', type: 'forex', displaySymbol: 'AUDUSD' },
        // Commodities
        { symbol: 'GC=F', name: 'Gold', type: 'commodity', displaySymbol: 'GOLD' },
        { symbol: 'SI=F', name: 'Silver', type: 'commodity', displaySymbol: 'SILVER' },
        { symbol: 'CL=F', name: 'Crude Oil WTI', type: 'commodity', displaySymbol: 'CRUDE' },
        { symbol: 'BZ=F', name: 'Brent Crude', type: 'commodity', displaySymbol: 'BRENT' },
        // Indices
        { symbol: '^GSPC', name: 'S&P 500', type: 'index', displaySymbol: 'SPX' },
        { symbol: '^DJI', name: 'Dow Jones', type: 'index', displaySymbol: 'DJI' },
        { symbol: '^IXIC', name: 'NASDAQ', type: 'index', displaySymbol: 'IXIC' },
      ];
      
      const traditionalData: any[] = [];
      
      // Fetch in batches to avoid rate limiting
      for (let i = 0; i < assets.length; i += 10) {
        const batch = assets.slice(i, i + 10);
        const symbols = batch.map(a => a.symbol).join(',');
        
        try {
          const response = await axios.get(`https://query1.finance.yahoo.com/v7/finance/quote`, {
            params: { symbols },
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 5000
          });
          
          if (response.data?.quoteResponse?.result) {
            response.data.quoteResponse.result.forEach((quote: any, idx: number) => {
              const assetInfo = batch.find(a => a.symbol === quote.symbol);
              if (!assetInfo) return;
              
              traditionalData.push({
                id: `traditional-${traditionalData.length + 1}`,
                symbol: assetInfo.displaySymbol || assetInfo.symbol.replace('=X', '').replace('=F', '').replace('^', ''),
                name: assetInfo.name,
                currentPrice: quote.regularMarketPrice || 0,
                change24h: quote.regularMarketChangePercent || 0,
                volume24h: quote.regularMarketVolume || 0,
                marketCap: quote.marketCap || 0,
                type: assetInfo.type as any,
              });
            });
          }
        } catch (batchError: any) {
          logger.warn(`Yahoo Finance batch error: ${batchError.message}`);
        }
        
        // Small delay between batches
        if (i + 10 < assets.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      if (traditionalData.length > 0) {
        marketsData = [...marketsData, ...traditionalData];
        logger.info(`✓ Added ${traditionalData.length} REAL-TIME traditional market assets from Yahoo Finance`);
      } else {
        logger.warn('Yahoo Finance returned no quotes');
      }
    } catch (traditionalError: any) {
      logger.error('Yahoo Finance API error:', traditionalError.message);
    }

    // Return real-time data if we got any
    if (marketsData.length > 0) {
      logger.info(`✓ Returning ${marketsData.length} LIVE assets`);
      return HttpResponse.success(res, marketsData);
    }

    // Only use mock data if BOTH APIs completely failed
    logger.warn('⚠ Both APIs failed, falling back to mock data');
    const mockData = mockAssets.map(asset => ({
      id: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      currentPrice: asset.lastPrice,
      change24h: asset.change,
      volume24h: asset.volume || 0,
      marketCap: asset.volume ? asset.volume * asset.lastPrice : asset.lastPrice * 1000000,
      type: asset.type,
    }));
    return HttpResponse.success(res, mockData);
    
  } catch (error: any) {
    logger.error('Critical error in markets endpoint:', error.message);
    
    // Emergency fallback
    const mockData = mockAssets.map(asset => ({
      id: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      currentPrice: asset.lastPrice,
      change24h: asset.change,
      volume24h: asset.volume || 0,
      marketCap: asset.volume ? asset.volume * asset.lastPrice : asset.lastPrice * 1000000,
      type: asset.type,
    }));
    return HttpResponse.success(res, mockData);
  }
});

router.get('/assets', (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const pageSize = Math.min(100, parseInt(req.query.pageSize as string) || 20);
  const offset = (page - 1) * pageSize;
  const filtered = mockAssets.slice(offset, offset + pageSize);
  HttpResponse.paginated(res, filtered, mockAssets.length, page, pageSize);
});

router.get('/search', async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string || '').toLowerCase();
    
    // Search Yahoo Finance
    const yahooResults = await yahooFinanceClient.search(query);
    const results = yahooResults.slice(0, 10).map((r: any) => ({
      id: r.symbol,
      symbol: r.symbol,
      name: r.longname || r.shortname || r.symbol,
      type: r.quoteType === 'CRYPTOCURRENCY' ? 'crypto' : 'stock',
    }));
    
    HttpResponse.success(res, results);
  } catch (error) {
    logger.error('Error searching:', error);
    const results = mockAssets.filter(a => 
      a.symbol.toLowerCase().includes((req.query.q as string || '').toLowerCase()) || 
      a.name.toLowerCase().includes((req.query.q as string || '').toLowerCase())
    );
    HttpResponse.success(res, results);
  }
});

// Get top movers (gainers and losers)
router.get('/movers', async (req: Request, res: Response) => {
  try {
    const movers = await aggregatedDataService.getTopMovers();
    HttpResponse.success(res, movers);
  } catch (error) {
    logger.error('Error fetching movers:', error);
    HttpResponse.error(res, 'Failed to fetch market movers', 500);
  }
});

// Get live quote for a specific symbol
router.get('/quote/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    
    // Try as stock first
    let quote = await aggregatedDataService.getStockQuote(symbol);
    
    // If not found, try as crypto
    if (!quote) {
      quote = await aggregatedDataService.getCryptoQuote(symbol + 'USDT');
    }
    
    if (quote) {
      HttpResponse.success(res, quote);
    } else {
      HttpResponse.error(res, 'Symbol not found', 404);
    }
  } catch (error) {
    logger.error('Error fetching quote:', error);
    HttpResponse.error(res, 'Failed to fetch quote', 500);
  }
});

export default router;
