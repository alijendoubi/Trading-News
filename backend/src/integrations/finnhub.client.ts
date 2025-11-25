import axios, { AxiosInstance } from 'axios';
import { logger } from '../config/logger.js';

export interface FinnhubQuote {
  symbol: string;
  current: number;
  change: number;
  percentChange: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: Date;
}

export interface FinnhubNews {
  category: string;
  datetime: Date;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

export interface FinnhubCompanyNews {
  category: string;
  datetime: Date;
  headline: string;
  image: string;
  source: string;
  summary: string;
  url: string;
}

/**
 * Finnhub API Client
 * Free tier: 60 API calls/minute
 * Provides stocks, forex, crypto, and company news
 */
export class FinnhubClient {
  private client: AxiosInstance;
  private apiKey: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheDuration = 60000; // 1 minute cache

  constructor() {
    this.apiKey = process.env.FINNHUB_API_KEY || '';
    this.client = axios.create({
      baseURL: 'https://finnhub.io/api/v1',
      timeout: 10000,
    });
  }

  /**
   * Get real-time quote
   */
  async getQuote(symbol: string): Promise<FinnhubQuote | null> {
    if (!this.apiKey) {
      logger.warn('Finnhub API key not configured');
      return null;
    }

    const cacheKey = `quote:${symbol}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.get('/quote', {
        params: {
          symbol,
          token: this.apiKey,
        },
      });

      const data = response.data;

      if (!data.c || data.c === 0) {
        logger.warn(`No data returned for ${symbol}`);
        return null;
      }

      const quote: FinnhubQuote = {
        symbol,
        current: data.c,
        change: data.d,
        percentChange: data.dp,
        high: data.h,
        low: data.l,
        open: data.o,
        previousClose: data.pc,
        timestamp: new Date(data.t * 1000),
      };

      this.setCache(cacheKey, quote);
      return quote;
    } catch (error: any) {
      logger.error(`Error fetching quote from Finnhub for ${symbol}:`, error.message);
      return null;
    }
  }

  /**
   * Get market news
   */
  async getMarketNews(category: string = 'general'): Promise<FinnhubNews[]> {
    if (!this.apiKey) return [];

    const cacheKey = `market-news:${category}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.get('/news', {
        params: {
          category,
          token: this.apiKey,
        },
      });

      const news: FinnhubNews[] = response.data.map((item: any) => ({
        category: item.category,
        datetime: new Date(item.datetime * 1000),
        headline: item.headline,
        id: item.id,
        image: item.image,
        related: item.related,
        source: item.source,
        summary: item.summary,
        url: item.url,
      }));

      this.setCache(cacheKey, news);
      logger.debug(`Fetched ${news.length} market news from Finnhub`);
      return news;
    } catch (error: any) {
      logger.error(`Error fetching market news from Finnhub:`, error.message);
      return [];
    }
  }

  /**
   * Get company news
   */
  async getCompanyNews(
    symbol: string,
    from?: string,
    to?: string
  ): Promise<FinnhubCompanyNews[]> {
    if (!this.apiKey) return [];

    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const fromDate = from || lastWeek.toISOString().split('T')[0];
    const toDate = to || today.toISOString().split('T')[0];

    const cacheKey = `company-news:${symbol}:${fromDate}:${toDate}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.get('/company-news', {
        params: {
          symbol,
          from: fromDate,
          to: toDate,
          token: this.apiKey,
        },
      });

      const news: FinnhubCompanyNews[] = response.data.map((item: any) => ({
        category: item.category,
        datetime: new Date(item.datetime * 1000),
        headline: item.headline,
        image: item.image,
        source: item.source,
        summary: item.summary,
        url: item.url,
      }));

      this.setCache(cacheKey, news);
      logger.debug(`Fetched ${news.length} company news for ${symbol} from Finnhub`);
      return news;
    } catch (error: any) {
      logger.error(`Error fetching company news from Finnhub for ${symbol}:`, error.message);
      return [];
    }
  }

  /**
   * Get forex rates
   */
  async getForexRates(base: string = 'USD'): Promise<Record<string, number>> {
    if (!this.apiKey) return {};

    const cacheKey = `forex:${base}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.get('/forex/rates', {
        params: {
          base,
          token: this.apiKey,
        },
      });

      const rates = response.data.quote || {};
      this.setCache(cacheKey, rates);
      return rates;
    } catch (error: any) {
      logger.error(`Error fetching forex rates from Finnhub:`, error.message);
      return {};
    }
  }

  /**
   * Get crypto candles (OHLC data)
   */
  async getCryptoCandles(
    symbol: string,
    resolution: string = 'D',
    from?: number,
    to?: number
  ): Promise<any> {
    if (!this.apiKey) return null;

    const now = Math.floor(Date.now() / 1000);
    const weekAgo = now - 7 * 24 * 60 * 60;

    try {
      const response = await this.client.get('/crypto/candle', {
        params: {
          symbol,
          resolution,
          from: from || weekAgo,
          to: to || now,
          token: this.apiKey,
        },
      });

      return response.data;
    } catch (error: any) {
      logger.error(`Error fetching crypto candles from Finnhub:`, error.message);
      return null;
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

export const finnhubClient = new FinnhubClient();
