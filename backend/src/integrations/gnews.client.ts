import axios, { AxiosInstance } from 'axios';
import { logger } from '../config/logger.js';

export interface GNewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: Date;
  source: {
    name: string;
    url: string;
  };
}

/**
 * GNews API Client
 * Free tier: 100 requests/day
 * Provides news articles with search capabilities
 */
export class GNewsClient {
  private client: AxiosInstance;
  private apiKey: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheDuration = 300000; // 5 minutes cache

  constructor() {
    this.apiKey = process.env.GNEWS_API_KEY || '';
    this.client = axios.create({
      baseURL: 'https://gnews.io/api/v4',
      timeout: 10000,
    });
  }

  /**
   * Get top headlines
   */
  async getTopHeadlines(
    category?: string,
    lang: string = 'en',
    max: number = 10
  ): Promise<GNewsArticle[]> {
    if (!this.apiKey) {
      logger.warn('GNews API key not configured');
      return [];
    }

    const cacheKey = `headlines:${category}:${lang}:${max}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.get('/top-headlines', {
        params: {
          apikey: this.apiKey,
          category,
          lang,
          max,
        },
      });

      const articles: GNewsArticle[] = response.data.articles.map((item: any) => ({
        title: item.title,
        description: item.description,
        content: item.content,
        url: item.url,
        image: item.image,
        publishedAt: new Date(item.publishedAt),
        source: {
          name: item.source.name,
          url: item.source.url,
        },
      }));

      this.setCache(cacheKey, articles);
      logger.debug(`Fetched ${articles.length} headlines from GNews`);
      return articles;
    } catch (error: any) {
      logger.error('Error fetching headlines from GNews:', error.message);
      return [];
    }
  }

  /**
   * Search for news articles
   */
  async search(
    query: string,
    lang: string = 'en',
    max: number = 10,
    from?: Date,
    to?: Date
  ): Promise<GNewsArticle[]> {
    if (!this.apiKey) return [];

    const cacheKey = `search:${query}:${lang}:${max}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const params: any = {
        apikey: this.apiKey,
        q: query,
        lang,
        max,
      };

      if (from) {
        params.from = from.toISOString();
      }
      if (to) {
        params.to = to.toISOString();
      }

      const response = await this.client.get('/search', { params });

      const articles: GNewsArticle[] = response.data.articles.map((item: any) => ({
        title: item.title,
        description: item.description,
        content: item.content,
        url: item.url,
        image: item.image,
        publishedAt: new Date(item.publishedAt),
        source: {
          name: item.source.name,
          url: item.source.url,
        },
      }));

      this.setCache(cacheKey, articles);
      logger.debug(`Found ${articles.length} articles for "${query}" from GNews`);
      return articles;
    } catch (error: any) {
      logger.error('Error searching news on GNews:', error.message);
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

export const gNewsClient = new GNewsClient();
