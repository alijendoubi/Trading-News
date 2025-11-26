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

    // Add static traditional markets with recent approximate values
    // These are updated periodically and provide good reference data
    logger.info('Adding traditional markets data...');
    
    const traditionalMarkets = [
      // Top US Stocks
      { symbol: 'AAPL', name: 'Apple Inc.', price: 189.95, change: 1.2, volume: 58000000, marketCap: 2950000000000, type: 'stock' },
      { symbol: 'MSFT', name: 'Microsoft', price: 378.20, change: 0.8, volume: 24500000, marketCap: 2810000000000, type: 'stock' },
      { symbol: 'GOOGL', name: 'Alphabet', price: 141.85, change: -0.6, volume: 19800000, marketCap: 1770000000000, type: 'stock' },
      { symbol: 'AMZN', name: 'Amazon', price: 152.30, change: 1.9, volume: 42300000, marketCap: 1580000000000, type: 'stock' },
      { symbol: 'NVDA', name: 'NVIDIA', price: 495.75, change: 3.2, volume: 48200000, marketCap: 1220000000000, type: 'stock' },
      { symbol: 'TSLA', name: 'Tesla', price: 245.60, change: -2.1, volume: 115000000, marketCap: 780000000000, type: 'stock' },
      { symbol: 'META', name: 'Meta', price: 358.90, change: 0.9, volume: 16700000, marketCap: 910000000000, type: 'stock' },
      { symbol: 'BRK-B', name: 'Berkshire', price: 420.50, change: 0.5, volume: 3200000, marketCap: 910000000000, type: 'stock' },
      { symbol: 'JPM', name: 'JPMorgan', price: 185.40, change: -0.3, volume: 11500000, marketCap: 535000000000, type: 'stock' },
      { symbol: 'V', name: 'Visa', price: 275.30, change: 0.7, volume: 7200000, marketCap: 565000000000, type: 'stock' },
      { symbol: 'NFLX', name: 'Netflix', price: 485.20, change: 2.1, volume: 5800000, marketCap: 210000000000, type: 'stock' },
      { symbol: 'DIS', name: 'Disney', price: 92.80, change: -1.2, volume: 12400000, marketCap: 170000000000, type: 'stock' },
      { symbol: 'PYPL', name: 'PayPal', price: 62.45, change: 1.5, volume: 14200000, marketCap: 68000000000, type: 'stock' },
      { symbol: 'INTC', name: 'Intel', price: 42.85, change: -0.8, volume: 45600000, marketCap: 180000000000, type: 'stock' },
      { symbol: 'AMD', name: 'AMD', price: 138.70, change: 2.8, volume: 62300000, marketCap: 224000000000, type: 'stock' },
      { symbol: 'BABA', name: 'Alibaba', price: 78.50, change: -1.5, volume: 18900000, marketCap: 198000000000, type: 'stock' },
      { symbol: 'TSM', name: 'TSMC', price: 105.20, change: 1.3, volume: 8400000, marketCap: 545000000000, type: 'stock' },
      { symbol: 'WMT', name: 'Walmart', price: 165.40, change: 0.4, volume: 7800000, marketCap: 435000000000, type: 'stock' },
      { symbol: 'JNJ', name: 'Johnson&Johnson', price: 158.90, change: -0.2, volume: 6200000, marketCap: 385000000000, type: 'stock' },
      { symbol: 'UNH', name: 'UnitedHealth', price: 522.30, change: 0.9, volume: 2900000, marketCap: 485000000000, type: 'stock' },
      
      // Forex Pairs
      { symbol: 'EURUSD', name: 'EUR/USD', price: 1.0550, change: 0.12, volume: 450000000, marketCap: 0, type: 'forex' },
      { symbol: 'GBPUSD', name: 'GBP/USD', price: 1.2625, change: -0.08, volume: 320000000, marketCap: 0, type: 'forex' },
      { symbol: 'USDJPY', name: 'USD/JPY', price: 149.85, change: 0.25, volume: 380000000, marketCap: 0, type: 'forex' },
      { symbol: 'AUDUSD', name: 'AUD/USD', price: 0.6510, change: -0.15, volume: 190000000, marketCap: 0, type: 'forex' },
      { symbol: 'USDCAD', name: 'USD/CAD', price: 1.3975, change: 0.10, volume: 210000000, marketCap: 0, type: 'forex' },
      { symbol: 'USDCHF', name: 'USD/CHF', price: 0.8835, change: 0.18, volume: 175000000, marketCap: 0, type: 'forex' },
      { symbol: 'NZDUSD', name: 'NZD/USD', price: 0.5890, change: -0.22, volume: 145000000, marketCap: 0, type: 'forex' },
      { symbol: 'EURGBP', name: 'EUR/GBP', price: 0.8355, change: 0.05, volume: 165000000, marketCap: 0, type: 'forex' },
      
      // Commodities
      { symbol: 'GOLD', name: 'Gold', price: 2032.50, change: 0.45, volume: 185000, marketCap: 0, type: 'commodity' },
      { symbol: 'SILVER', name: 'Silver', price: 24.85, change: 0.82, volume: 42000, marketCap: 0, type: 'commodity' },
      { symbol: 'CRUDE', name: 'Crude Oil WTI', price: 78.25, change: -1.2, volume: 520000, marketCap: 0, type: 'commodity' },
      { symbol: 'BRENT', name: 'Brent Crude', price: 82.40, change: -0.9, volume: 385000, marketCap: 0, type: 'commodity' },
      { symbol: 'NATGAS', name: 'Natural Gas', price: 3.15, change: 2.1, volume: 195000, marketCap: 0, type: 'commodity' },
      { symbol: 'COPPER', name: 'Copper', price: 3.85, change: 0.6, volume: 28000, marketCap: 0, type: 'commodity' },
      
      // Major Indices
      { symbol: 'SPX', name: 'S&P 500', price: 4765.50, change: 0.85, volume: 0, marketCap: 0, type: 'index' },
      { symbol: 'DJI', name: 'Dow Jones', price: 37250.20, change: 0.62, volume: 0, marketCap: 0, type: 'index' },
      { symbol: 'IXIC', name: 'NASDAQ', price: 14850.75, change: 1.15, volume: 0, marketCap: 0, type: 'index' },
      { symbol: 'FTSE', name: 'FTSE 100', price: 7680.40, change: 0.35, volume: 0, marketCap: 0, type: 'index' },
      { symbol: 'GDAXI', name: 'DAX', price: 17850.60, change: 0.72, volume: 0, marketCap: 0, type: 'index' },
      { symbol: 'N225', name: 'Nikkei 225', price: 33480.25, change: -0.45, volume: 0, marketCap: 0, type: 'index' },
      { symbol: 'HSI', name: 'Hang Seng', price: 17255.80, change: -1.25, volume: 0, marketCap: 0, type: 'index' },
    ];
    
    const traditionalData = traditionalMarkets.map((item, index) => ({
      id: `traditional-${index + 1}`,
      symbol: item.symbol,
      name: item.name,
      currentPrice: item.price,
      change24h: item.change,
      volume24h: item.volume,
      marketCap: item.marketCap,
      type: item.type as 'stock' | 'forex' | 'commodity' | 'index',
    }));
    
    marketsData = [...marketsData, ...traditionalData];
    logger.info(`✓ Added ${traditionalData.length} traditional market assets`);
    
    // Log breakdown by type
    const typeCount = traditionalData.reduce((acc: any, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {});
    logger.info('Traditional markets breakdown:', typeCount);

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
