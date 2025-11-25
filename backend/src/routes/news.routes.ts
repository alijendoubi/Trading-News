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
    // Fallback to mock data
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(100, parseInt(req.query.pageSize as string) || 20);
    const offset = (page - 1) * pageSize;
    const filtered = mockNews.slice(offset, offset + pageSize);
    HttpResponse.paginated(res, filtered, mockNews.length, page, pageSize);
  }
});

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
