import { Router, Request, Response } from 'express';
import { mockNews } from '../services/mock-data.service.js';
import { HttpResponse } from '../utils/http-response.js';
import { aggregatedDataService } from '../services/aggregatedData.service.js';
import { logger } from '../config/logger.js';

const router = Router();

// Get news from ALL sources (RSS, NewsAPI, Currents, GNews, Finnhub, CryptoPanic)
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(100, parseInt(req.query.pageSize as string) || 20);
    
    // Get aggregated news from all sources
    const allNews = await aggregatedDataService.getAggregatedNews(100);
    
    // Paginate
    const offset = (page - 1) * pageSize;
    const filtered = allNews.slice(offset, offset + pageSize);
    
    HttpResponse.paginated(res, filtered, allNews.length, page, pageSize);
  } catch (error) {
    logger.error('Error fetching news:', error);
    // Fallback to sample news
    const sampleNews = generateSampleNews();
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(100, parseInt(req.query.pageSize as string) || 20);
    const offset = (page - 1) * pageSize;
    const filtered = sampleNews.slice(offset, offset + pageSize);
    HttpResponse.paginated(res, filtered, sampleNews.length, page, pageSize);
  }
});

// Generate sample news when APIs fail
function generateSampleNews() {
  const now = new Date();
  return [
    {
      id: 'news-1',
      title: 'Federal Reserve Holds Interest Rates Steady',
      summary: 'The Federal Reserve maintained its benchmark interest rate, signaling a cautious approach to monetary policy.',
      url: 'https://www.reuters.com/markets/',
      source: 'Reuters',
      publishedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      category: 'Markets',
      imageUrl: null
    },
    {
      id: 'news-2',
      title: 'Bitcoin Surges Past $40,000 Mark',
      summary: 'Bitcoin reached new highs as institutional investors show renewed interest in cryptocurrency markets.',
      url: 'https://www.coindesk.com/',
      source: 'CoinDesk',
      publishedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      category: 'Crypto',
      imageUrl: null
    },
    {
      id: 'news-3',
      title: 'Tech Stocks Rally on Strong Earnings',
      summary: 'Major technology companies reported better-than-expected quarterly earnings, boosting market sentiment.',
      url: 'https://www.bloomberg.com/',
      source: 'Bloomberg',
      publishedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      category: 'Stocks',
      imageUrl: null
    },
    {
      id: 'news-4',
      title: 'Gold Prices Rise Amid Economic Uncertainty',
      summary: 'Gold futures climbed as investors sought safe-haven assets amid ongoing economic concerns.',
      url: 'https://www.marketwatch.com/',
      source: 'MarketWatch',
      publishedAt: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
      category: 'Commodities',
      imageUrl: null
    }
  ];
}

// Get crypto-specific news
router.get('/crypto', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const cryptoNews = await aggregatedDataService.getCryptoNews(limit);
    HttpResponse.success(res, cryptoNews);
  } catch (error) {
    logger.error('Error fetching crypto news:', error);
    HttpResponse.error(res, 'Failed to fetch crypto news', 500);
  }
});

export default router;
