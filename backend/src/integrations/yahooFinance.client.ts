import axios, { AxiosInstance } from 'axios';
import { logger } from '../config/logger.js';

export interface YahooQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  open: number;
  previousClose: number;
  volume: number;
  marketCap?: number;
  timestamp: Date;
}

/**
 * Yahoo Finance API Client (Unofficial)
 * No API key required - completely free
 * Uses Yahoo Finance's public query endpoints
 */
export class YahooFinanceClient {
  private client: AxiosInstance;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheDuration = 60000; // 1 minute cache

  constructor() {
    this.client = axios.create({
      baseURL: 'https://query1.finance.yahoo.com',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });
  }

  /**
   * Get real-time quote for a symbol
   */
  async getQuote(symbol: string): Promise<YahooQuote | null> {
    const cacheKey = `quote:${symbol}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.get('/v7/finance/quote', {
        params: {
          symbols: symbol,
        },
      });

      const result = response.data.quoteResponse?.result?.[0];
      
      if (!result) {
        logger.warn(`No data returned for ${symbol} from Yahoo Finance`);
        return null;
      }

      const quote: YahooQuote = {
        symbol: result.symbol,
        price: result.regularMarketPrice || 0,
        change: result.regularMarketChange || 0,
        changePercent: result.regularMarketChangePercent || 0,
        dayHigh: result.regularMarketDayHigh || 0,
        dayLow: result.regularMarketDayLow || 0,
        open: result.regularMarketOpen || 0,
        previousClose: result.regularMarketPreviousClose || 0,
        volume: result.regularMarketVolume || 0,
        marketCap: result.marketCap,
        timestamp: new Date(result.regularMarketTime * 1000),
      };

      this.setCache(cacheKey, quote);
      return quote;
    } catch (error: any) {
      logger.error(`Error fetching quote from Yahoo Finance for ${symbol}:`, error.message);
      return null;
    }
  }

  /**
   * Get multiple quotes at once
   */
  async getQuotes(symbols: string[]): Promise<YahooQuote[]> {
    const cacheKey = `quotes:${symbols.join(',')}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.get('/v7/finance/quote', {
        params: {
          symbols: symbols.join(','),
        },
      });

      const results = response.data.quoteResponse?.result || [];
      const quotes: YahooQuote[] = [];

      for (const result of results) {
        if (result.regularMarketPrice) {
          quotes.push({
            symbol: result.symbol,
            price: result.regularMarketPrice,
            change: result.regularMarketChange || 0,
            changePercent: result.regularMarketChangePercent || 0,
            dayHigh: result.regularMarketDayHigh || 0,
            dayLow: result.regularMarketDayLow || 0,
            open: result.regularMarketOpen || 0,
            previousClose: result.regularMarketPreviousClose || 0,
            volume: result.regularMarketVolume || 0,
            marketCap: result.marketCap,
            timestamp: new Date(result.regularMarketTime * 1000),
          });
        }
      }

      this.setCache(cacheKey, quotes);
      logger.debug(`Fetched ${quotes.length} quotes from Yahoo Finance`);
      return quotes;
    } catch (error: any) {
      logger.error('Error fetching quotes from Yahoo Finance:', error.message);
      return [];
    }
  }

  /**
   * Get historical chart data
   */
  async getChart(
    symbol: string,
    interval: string = '1d',
    range: string = '1mo'
  ): Promise<any> {
    const cacheKey = `chart:${symbol}:${interval}:${range}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.get(`/v8/finance/chart/${symbol}`, {
        params: {
          interval,
          range,
        },
      });

      const data = response.data.chart?.result?.[0];
      this.setCache(cacheKey, data);
      return data;
    } catch (error: any) {
      logger.error(`Error fetching chart from Yahoo Finance for ${symbol}:`, error.message);
      return null;
    }
  }

  /**
   * Search for symbols
   */
  async search(query: string): Promise<any[]> {
    try {
      const response = await this.client.get('/v1/finance/search', {
        params: {
          q: query,
          quotesCount: 10,
          newsCount: 0,
        },
      });

      return response.data.quotes || [];
    } catch (error: any) {
      logger.error('Error searching on Yahoo Finance:', error.message);
      return [];
    }
  }

  /**
   * Get trending tickers
   */
  async getTrending(region: string = 'US'): Promise<any[]> {
    const cacheKey = `trending:${region}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.get('/v1/finance/trending/' + region);
      const trending = response.data.finance?.result?.[0]?.quotes || [];
      
      this.setCache(cacheKey, trending);
      return trending;
    } catch (error: any) {
      logger.error('Error fetching trending from Yahoo Finance:', error.message);
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

export const yahooFinanceClient = new YahooFinanceClient();
