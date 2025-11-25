import axios, { AxiosInstance } from 'axios';
import { logger } from '../config/logger.js';

export interface CryptoPanicPost {
  id: number;
  title: string;
  url: string;
  source: {
    title: string;
    region: string;
  };
  published_at: Date;
  domain: string;
  votes: {
    positive: number;
    negative: number;
    important: number;
  };
  currencies: Array<{
    code: string;
    title: string;
  }>;
}

/**
 * CryptoPanic API Client
 * Free tier available (no auth token required for public feed)
 * Provides crypto-focused news aggregation
 */
export class CryptoPanicClient {
  private client: AxiosInstance;
  private apiKey: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheDuration = 180000; // 3 minutes cache

  constructor() {
    this.apiKey = process.env.CRYPTOPANIC_API_KEY || '';
    this.client = axios.create({
      baseURL: 'https://cryptopanic.com/api/v1',
      timeout: 10000,
    });
  }

  /**
   * Get news posts
   */
  async getPosts(
    filter?: 'rising' | 'hot' | 'bullish' | 'bearish' | 'important' | 'saved' | 'lol',
    currencies?: string[],
    regions?: string[]
  ): Promise<CryptoPanicPost[]> {
    const cacheKey = `posts:${filter}:${currencies?.join(',')}:${regions?.join(',')}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const params: any = {};
      
      // Auth token is optional for public feed
      if (this.apiKey) {
        params.auth_token = this.apiKey;
      }
      
      if (filter) {
        params.filter = filter;
      }
      if (currencies && currencies.length > 0) {
        params.currencies = currencies.join(',');
      }
      if (regions && regions.length > 0) {
        params.regions = regions.join(',');
      }

      const response = await this.client.get('/posts/', { params });

      if (!response.data.results) {
        return [];
      }

      const posts: CryptoPanicPost[] = response.data.results.map((item: any) => ({
        id: item.id,
        title: item.title,
        url: item.url,
        source: {
          title: item.source.title,
          region: item.source.region,
        },
        published_at: new Date(item.published_at),
        domain: item.domain,
        votes: {
          positive: item.votes.positive,
          negative: item.votes.negative,
          important: item.votes.important,
        },
        currencies: item.currencies || [],
      }));

      this.setCache(cacheKey, posts);
      logger.debug(`Fetched ${posts.length} posts from CryptoPanic`);
      return posts;
    } catch (error: any) {
      logger.error('Error fetching posts from CryptoPanic:', error.message);
      return [];
    }
  }

  /**
   * Get trending posts
   */
  async getTrending(): Promise<CryptoPanicPost[]> {
    return this.getPosts('hot');
  }

  /**
   * Get important news
   */
  async getImportant(): Promise<CryptoPanicPost[]> {
    return this.getPosts('important');
  }

  /**
   * Get news for specific cryptocurrencies
   */
  async getNewsByCurrency(currencies: string[]): Promise<CryptoPanicPost[]> {
    return this.getPosts(undefined, currencies);
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

export const cryptoPanicClient = new CryptoPanicClient();
