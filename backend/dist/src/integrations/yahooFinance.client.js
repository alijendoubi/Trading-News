import axios from 'axios';
import { logger } from '../config/logger.js';
/**
 * Yahoo Finance API Client (Unofficial)
 * No API key required - completely free
 * Uses Yahoo Finance's public query endpoints
 */
export class YahooFinanceClient {
    constructor() {
        this.cache = new Map();
        this.cacheDuration = 60000; // 1 minute cache
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
    async getQuote(symbol) {
        const cacheKey = `quote:${symbol}`;
        const cached = this.getFromCache(cacheKey);
        if (cached)
            return cached;
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
            const quote = {
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
        }
        catch (error) {
            logger.error(`Error fetching quote from Yahoo Finance for ${symbol}:`, error.message);
            return null;
        }
    }
    /**
     * Get multiple quotes at once
     */
    async getQuotes(symbols) {
        const cacheKey = `quotes:${symbols.join(',')}`;
        const cached = this.getFromCache(cacheKey);
        if (cached)
            return cached;
        try {
            const response = await this.client.get('/v7/finance/quote', {
                params: {
                    symbols: symbols.join(','),
                },
            });
            const results = response.data.quoteResponse?.result || [];
            const quotes = [];
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
        }
        catch (error) {
            logger.error('Error fetching quotes from Yahoo Finance:', error.message);
            return [];
        }
    }
    /**
     * Get historical chart data
     */
    async getChart(symbol, interval = '1d', range = '1mo') {
        const cacheKey = `chart:${symbol}:${interval}:${range}`;
        const cached = this.getFromCache(cacheKey);
        if (cached)
            return cached;
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
        }
        catch (error) {
            logger.error(`Error fetching chart from Yahoo Finance for ${symbol}:`, error.message);
            return null;
        }
    }
    /**
     * Search for symbols
     */
    async search(query) {
        try {
            const response = await this.client.get('/v1/finance/search', {
                params: {
                    q: query,
                    quotesCount: 10,
                    newsCount: 0,
                },
            });
            return response.data.quotes || [];
        }
        catch (error) {
            logger.error('Error searching on Yahoo Finance:', error.message);
            return [];
        }
    }
    /**
     * Get trending tickers
     */
    async getTrending(region = 'US') {
        const cacheKey = `trending:${region}`;
        const cached = this.getFromCache(cacheKey);
        if (cached)
            return cached;
        try {
            const response = await this.client.get('/v1/finance/trending/' + region);
            const trending = response.data.finance?.result?.[0]?.quotes || [];
            this.setCache(cacheKey, trending);
            return trending;
        }
        catch (error) {
            logger.error('Error fetching trending from Yahoo Finance:', error.message);
            return [];
        }
    }
    /**
     * Cache helpers
     */
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
            return cached.data;
        }
        return null;
    }
    setCache(key, data) {
        this.cache.set(key, { data, timestamp: Date.now() });
    }
    clearCache() {
        this.cache.clear();
    }
}
export const yahooFinanceClient = new YahooFinanceClient();
//# sourceMappingURL=yahooFinance.client.js.map