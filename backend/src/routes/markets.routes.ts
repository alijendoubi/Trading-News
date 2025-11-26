import { Router, Request, Response } from 'express';
import { mockAssets } from '../services/mock-data.service.js';
import { HttpResponse } from '../utils/http-response.js';
import { aggregatedDataService } from '../services/aggregatedData.service.js';
import { yahooFinanceClient } from '../integrations/yahooFinance.client.js';
import { binanceClient } from '../integrations/binance.client.js';
import { twelveDataClient } from '../integrations/twelvedata.client.js';
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

    // Fetch REAL-TIME traditional markets from Twelve Data API
    logger.info('Fetching real-time traditional markets from Twelve Data...');
    
    try {
      // Define all symbols to fetch
      const stockSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'BRK.B', 'JPM', 'V', 'NFLX', 'DIS', 'PYPL', 'INTC', 'AMD', 'BABA', 'TSM', 'WMT', 'JNJ', 'UNH'];
      const forexSymbols = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'USD/CHF', 'NZD/USD', 'EUR/GBP'];
      const commoditySymbols = ['XAU/USD', 'XAG/USD', 'WTI/USD', 'BRENT/USD', 'NG/USD', 'HG/USD']; // Gold, Silver, Crude, Brent, NatGas, Copper
      const indexSymbols = ['SPX', 'DJI', 'IXIC', 'FTSE', 'DAX', 'N225', 'HSI'];
      
      // Fetch all symbols in batches (Twelve Data supports 50 symbols per request)
      const allSymbols = [...stockSymbols, ...forexSymbols, ...commoditySymbols, ...indexSymbols];
      const quotes = await twelveDataClient.getQuotes(allSymbols);
      
      logger.info(`✓ Twelve Data returned ${quotes.length} quotes`);
      
      if (quotes.length > 0) {
        // Map Twelve Data quotes to our format
        const traditionalData = quotes.map((quote, index) => {
          // Determine asset type
          let type: 'stock' | 'forex' | 'commodity' | 'index' = 'stock';
          if (forexSymbols.includes(quote.symbol)) type = 'forex';
          else if (commoditySymbols.includes(quote.symbol)) type = 'commodity';
          else if (indexSymbols.includes(quote.symbol)) type = 'index';
          
          // Calculate market cap for stocks (rough estimate: price * volume * 1000)
          const marketCap = type === 'stock' && quote.volume > 0 
            ? quote.price * quote.volume * 1000 
            : 0;
          
          return {
            id: `traditional-${index + 1}`,
            symbol: quote.symbol.replace('/', ''),
            name: quote.name,
            currentPrice: quote.price,
            change24h: quote.percentChange,
            volume24h: quote.volume,
            marketCap,
            type,
          };
        });
        
        marketsData = [...marketsData, ...traditionalData];
        logger.info(`✓ Added ${traditionalData.length} REAL-TIME traditional market assets`);
        
        // Log breakdown by type
        const typeCount = traditionalData.reduce((acc: any, item) => {
          acc[item.type] = (acc[item.type] || 0) + 1;
          return acc;
        }, {});
        logger.info('Traditional markets breakdown:', typeCount);
      } else {
        logger.warn('Twelve Data returned no quotes');
      }
    } catch (traditionalError: any) {
      logger.error('Twelve Data API error:', traditionalError.message);
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
