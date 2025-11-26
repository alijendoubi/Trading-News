import { Router, Request, Response } from 'express';
import { mockAssets } from '../services/mock-data.service.js';
import { HttpResponse } from '../utils/http-response.js';
import { aggregatedDataService } from '../services/aggregatedData.service.js';
import { yahooFinanceClient } from '../integrations/yahooFinance.client.js';
import { binanceClient } from '../integrations/binance.client.js';
import { logger } from '../config/logger.js';

const router = Router();

// Main markets endpoint - returns LIVE data from Binance and Yahoo Finance
router.get('/', async (req: Request, res: Response) => {
  try {
    let marketsData: any[] = [];

    // Get live crypto data from Binance (always works, no API key)
    logger.info('Fetching crypto data from Binance...');
    try {
      const cryptoTickers = await binanceClient.get24hrTicker();
      logger.info(`Binance returned ${cryptoTickers.length} tickers`);
      
      if (cryptoTickers && cryptoTickers.length > 0) {
        // Get top 30 crypto by volume
        const topCrypto = cryptoTickers
          .filter((t: any) => t.symbol.endsWith('USDT'))
          .sort((a: any, b: any) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
          .slice(0, 30)
          .map((ticker: any) => ({
            id: ticker.symbol,
            symbol: ticker.symbol.replace('USDT', ''),
            name: ticker.symbol.replace('USDT', ''),
            currentPrice: parseFloat(ticker.price),
            change24h: parseFloat(ticker.priceChangePercent),
            volume24h: parseFloat(ticker.volume),
            marketCap: parseFloat(ticker.quoteVolume),
            type: 'crypto' as const,
          }));
        
        marketsData = [...marketsData, ...topCrypto];
        logger.info(`✓ Added ${topCrypto.length} crypto assets from Binance`);
      } else {
        logger.warn('Binance returned empty array');
      }
    } catch (cryptoError: any) {
      logger.error('Binance API error:', cryptoError.message);
    }

    // Get stocks, forex, commodities, and indices from Yahoo Finance
    logger.info('Fetching traditional markets from Yahoo Finance...');
    try {
      const symbols = [
        // Top US Stocks
        'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 
        'BRK-B', 'JPM', 'V', 'NFLX', 'DIS', 'PYPL', 'INTC', 'AMD',
        'BABA', 'TSM', 'WMT', 'JNJ', 'UNH', 'PG', 'MA', 'HD', 'BAC',
        'XOM', 'CVX', 'KO', 'PEP', 'COST', 'AVGO',
        
        // Forex Pairs (Yahoo format: XXX=X)
        'EURUSD=X', 'GBPUSD=X', 'USDJPY=X', 'AUDUSD=X', 'USDCAD=X',
        'USDCHF=X', 'NZDUSD=X', 'EURGBP=X', 'EURJPY=X', 'GBPJPY=X',
        
        // Commodities
        'GC=F',   // Gold Futures
        'SI=F',   // Silver Futures
        'CL=F',   // Crude Oil WTI Futures
        'BZ=F',   // Brent Crude Oil Futures
        'NG=F',   // Natural Gas Futures
        'HG=F',   // Copper Futures
        
        // Major Indices
        '^GSPC',  // S&P 500
        '^DJI',   // Dow Jones
        '^IXIC',  // NASDAQ
        '^FTSE',  // FTSE 100
        '^GDAXI', // DAX
        '^N225',  // Nikkei 225
        '^HSI',   // Hang Seng
      ];
      
      const quotes = await yahooFinanceClient.getQuotes(symbols);
      logger.info(`Yahoo Finance returned ${quotes.length} quotes`);
      
      if (quotes && quotes.length > 0) {
        const processedQuotes = quotes
          .filter((quote: any) => quote.price > 0)
          .map((quote: any) => {
            // Determine type based on symbol
            let type: 'stock' | 'forex' | 'commodity' | 'index' = 'stock';
            let displaySymbol = quote.symbol;
            
            if (quote.symbol.includes('=X')) {
              type = 'forex';
              displaySymbol = quote.symbol.replace('=X', '');
            } else if (quote.symbol.includes('=F')) {
              type = 'commodity';
              // Map futures symbols to readable names
              const commodityMap: Record<string, string> = {
                'GC=F': 'GOLD',
                'SI=F': 'SILVER',
                'CL=F': 'CRUDE',
                'BZ=F': 'BRENT',
                'NG=F': 'NATGAS',
                'HG=F': 'COPPER',
              };
              displaySymbol = commodityMap[quote.symbol] || quote.symbol;
            } else if (quote.symbol.startsWith('^')) {
              type = 'index';
              displaySymbol = quote.symbol.replace('^', '');
            }
            
            return {
              id: quote.symbol,
              symbol: displaySymbol,
              name: displaySymbol,
              currentPrice: quote.price,
              change24h: quote.changePercent,
              volume24h: quote.volume || 0,
              marketCap: quote.marketCap || 0,
              type,
            };
          });
        
        marketsData = [...marketsData, ...processedQuotes];
        
        // Log breakdown by type
        const typeCount = processedQuotes.reduce((acc: any, item) => {
          acc[item.type] = (acc[item.type] || 0) + 1;
          return acc;
        }, {});
        logger.info(`✓ Added ${processedQuotes.length} assets from Yahoo Finance:`, typeCount);
      } else {
        logger.warn('Yahoo Finance returned empty array');
      }
    } catch (yahooError: any) {
      logger.error('Yahoo Finance API error:', yahooError.message);
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
