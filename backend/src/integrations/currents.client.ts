import axios, { AxiosInstance } from 'axios';
import { logger } from '../config/logger.js';

export interface CurrentsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  author: string;
  image: string;
  language: string;
  category: string[];
  published: Date;
}

/**
 * Currents API Client
 * Free tier: 600 requests/day
 * Provides news articles from multiple sources
 */
export class CurrentsClient {
  private client: AxiosInstance;
  private apiKey: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheDuration = 300000; // 5 minutes cache

  constructor() {
    this.apiKey = process.env.CURRENTS_API_KEY || '';
    this.client = axios.create({
      baseURL: 'https://api.currentsapi.services/v1',
      timeout: 10000,
    });
  }

  /**
   * Get latest news
   */
  async getLatestNews(
    category?: string,
    language: string = 'en',
    limit: number = 20
  ): Promise<CurrentsArticle[]> {
    if (!this.apiKey) {
      logger.warn('Currents API key not configured');
      return [];
    }

    const cacheKey = `latest:${category}:${language}:${limit}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.get('/latest-news', {
        params: {
          apiKey: this.apiKey,
          category,
          language,
          limit,
        },
      });

      if (response.data.status !== 'ok') {
        logger.warn('Currents API returned non-ok status');
        return [];
      }

      const articles: CurrentsArticle[] = response.data.news.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        url: item.url,
        author: item.author,
        image: item.image,
        language: item.language,
        category: item.category,
        published: new Date(item.published),
      }));

      this.setCache(cacheKey, articles);
      logger.debug(`Fetched ${articles.length} articles from Currents API`);
      return articles;
    } catch (error: any) {
      logger.error('Error fetching news from Currents API:', error.message);
      return [];
    }
  }

  /**
   * Search news by keywords
   */
  async searchNews(
    keywords: string,
    language: string = 'en',
    limit: number = 20
  ): Promise<CurrentsArticle[]> {
    if (!this.apiKey) return [];

    const cacheKey = `search:${keywords}:${language}:${limit}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.get('/search', {
        params: {
          apiKey: this.apiKey,
          keywords,
          language,
          limit,
        },
      });

      if (response.data.status !== 'ok') {
        return [];
      }

      const articles: CurrentsArticle[] = response.data.news.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        url: item.url,
        author: item.author,
        image: item.image,
        language: item.language,
        category: item.category,
        published: new Date(item.published),
      }));

      this.setCache(cacheKey, articles);
      logger.debug(`Found ${articles.length} articles for "${keywords}" from Currents API`);
      return articles;
    } catch (error: any) {
      logger.error('Error searching news on Currents API:', error.message);
      return [];
    }
  }

  /**
   * Cache helpers
   */
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const currentsClient = new CurrentsClient();
