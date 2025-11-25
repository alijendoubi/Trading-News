import { NewsModel } from '../models/news.model.js';
import { newsClient } from '../integrations/news.client.js';
import { logger } from '../config/logger.js';

export class NewsService {
  /**
   * Get latest news articles
   */
  static async getNews(limit = 20, offset = 0, category?: string) {
    try {
      // Get news from external API
      let externalNews;
      if (category) {
        externalNews = await newsClient.getNewsByCategory(category, limit + offset);
      } else {
        externalNews = await newsClient.getLatestNews(limit + offset);
      }

      // If we have external data, use it
      if (externalNews && externalNews.length > 0) {
        return {
          articles: externalNews.slice(offset, offset + limit),
          total: externalNews.length,
        };
      }

      // Fallback to database
      return NewsModel.getRecent(limit, offset);
    } catch (error) {
      logger.error('Error in getNews:', error);
      // Fallback to database or mock data
      try {
        return NewsModel.getRecent(limit, offset);
      } catch (dbError) {
        // Ultimate fallback to mock data
        const mockNews = newsClient.getMockNews();
        return {
          articles: mockNews.slice(offset, offset + limit),
          total: mockNews.length,
        };
      }
    }
  }

  /**
   * Search news articles
   */
  static async searchNews(query: string, limit = 20) {
    try {
      const results = await newsClient.searchNews(query, limit);
      return {
        articles: results,
        total: results.length,
      };
    } catch (error) {
      logger.error('Error in searchNews:', error);
      return { articles: [], total: 0 };
    }
  }

  /**
   * Get news by category
   */
  static async getNewsByCategory(category: string, limit = 20) {
    try {
      const articles = await newsClient.getNewsByCategory(category, limit);
      return {
        articles,
        total: articles.length,
      };
    } catch (error) {
      logger.error('Error in getNewsByCategory:', error);
      return { articles: [], total: 0 };
    }
  }

  /**
   * Sync news from external API to database (for cron job)
   */
  static async syncNews(): Promise<void> {
    try {
      logger.info('Syncing news from external sources');

      const articles = await newsClient.getLatestNews(50);

      if (!articles || articles.length === 0) {
        logger.debug('No news articles to sync');
        return;
      }

      let syncedCount = 0;
      for (const article of articles) {
        try {
          // Check if article already exists
          const existing = await NewsModel.findByUrl(article.url);

          if (!existing) {
            await NewsModel.create({
              title: article.title,
              url: article.url,
              source: article.source,
              published_at: article.publishedAt,
              category: article.category,
              summary: article.description || '',
            });
            syncedCount++;
          }
        } catch (error) {
          logger.warn(`Failed to sync article: ${article.title}`, error);
        }
      }

      logger.info(`Synced ${syncedCount} new news articles`);
    } catch (error) {
      logger.error('Error syncing news:', error);
    }
  }
}
