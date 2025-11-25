import axios, { AxiosInstance } from 'axios';
import { logger } from '../config/logger.js';

export interface PolygonTicker {
  ticker: string;
  name: string;
  market: string;
  locale: string;
  type: string;
  active: boolean;
  currency_name: string;
}

export interface PolygonQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: Date;
}

export interface PolygonAggregate {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  volumeWeighted: number;
}

/**
 * Polygon.io API Client
 * Free tier: 5 API calls/minute
 * Provides comprehensive stock market data
 */
export class PolygonClient {
  private client: AxiosInstance;
  private apiKey: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheDuration = 60000; // 1 minute cache

  constructor() {
    this.apiKey = process.env.POLYGON_API_KEY || '';
    this.client = axios.create({
      baseURL: 'https://api.polygon.io',
      timeout: 10000,
    });
  }

  /**
   * Get previous day's OHLC for a ticker
   */
  async getPreviousClose(ticker: string): Promise<PolygonQuote | null> {
    if (!this.apiKey) {
      logger.warn('Polygon API key not configured');
      return null;
    }

    const cacheKey = `prev-close:${ticker}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.get(`/v2/aggs/ticker/${ticker}/prev`, {
        params: {
          apiKey: this.apiKey,
        },
      });

      if (!response.data.results || response.data.results.length === 0) {
        return null;
      }

      const result = response.data.results[0];
      const quote: PolygonQuote = {
        symbol: ticker,
        price: result.c,
        change: result.c - result.o,
        changePercent: ((result.c - result.o) / result.o) * 100,
        volume: result.v,
        timestamp: new Date(result.t),
      };

      this.setCache(cacheKey, quote);
      return quote;
    } catch (error: any) {
      logger.error(`Error fetching previous close from Polygon for ${ticker}:`, error.message);
      return null;
    }
  }

  /**
   * Get aggregates (bars) for a ticker
   */
  async getAggregates(
    ticker: string,
    multiplier: number = 1,
    timespan: string = 'day',
    from: string,
    to: string
  ): Promise<PolygonAggregate[]> {
    if (!this.apiKey) return [];

    const cacheKey = `aggregates:${ticker}:${multiplier}:${timespan}:${from}:${to}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.get(
        `/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${from}/${to}`,
        {
          params: {
            apiKey: this.apiKey,
          },
        }
      );

      if (!response.data.results) {
        return [];
      }

      const aggregates: PolygonAggregate[] = response.data.results.map((item: any) => ({
        timestamp: new Date(item.t),
        open: item.o,
        high: item.h,
        low: item.l,
        close: item.c,
        volume: item.v,
        volumeWeighted: item.vw,
      }));

      this.setCache(cacheKey, aggregates);
      logger.debug(`Fetched ${aggregates.length} aggregates for ${ticker} from Polygon`);
      return aggregates;
    } catch (error: any) {
      logger.error(`Error fetching aggregates from Polygon for ${ticker}:`, error.message);
      return [];
    }
  }

  /**
   * Get snapshot of all tickers
   */
  async getTickersSnapshot(): Promise<any[]> {
    if (!this.apiKey) return [];

    const cacheKey = 'snapshot:all';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.get('/v2/snapshot/locale/us/markets/stocks/tickers', {
        params: {
          apiKey: this.apiKey,
        },
      });

      const tickers = response.data.tickers || [];
      this.setCache(cacheKey, tickers);
      return tickers;
    } catch (error: any) {
      logger.error('Error fetching tickers snapshot from Polygon:', error.message);
      return [];
    }
  }

  /**
   * Get gainers/losers
   */
  async getGainersLosers(direction: 'gainers' | 'losers' = 'gainers'): Promise<any[]> {
    if (!this.apiKey) return [];

    const cacheKey = `snapshot:${direction}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.get(
        `/v2/snapshot/locale/us/markets/stocks/${direction}`,
        {
          params: {
            apiKey: this.apiKey,
          },
        }
      );

      const tickers = response.data.tickers || [];
      this.setCache(cacheKey, tickers);
      return tickers;
    } catch (error: any) {
      logger.error(`Error fetching ${direction} from Polygon:`, error.message);
      return [];
    }
  }

  /**
   * Search for ticker symbols
   */
  async searchTickers(search: string, limit: number = 10): Promise<PolygonTicker[]> {
    if (!this.apiKey) return [];

    try {
      const response = await this.client.get('/v3/reference/tickers', {
        params: {
          search,
          limit,
          apiKey: this.apiKey,
        },
      });

      return response.data.results || [];
    } catch (error: any) {
      logger.error('Error searching tickers on Polygon:', error.message);
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

export const polygonClient = new PolygonClient();
