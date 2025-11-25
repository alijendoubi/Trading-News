import axios from 'axios';
import { logger } from '../config/logger.js';
/**
 * Finnhub API Client
 * Free tier: 60 API calls/minute
 * Provides stocks, forex, crypto, and company news
 */
export class FinnhubClient {
    constructor() {
        this.cache = new Map();
        this.cacheDuration = 60000; // 1 minute cache
        this.apiKey = process.env.FINNHUB_API_KEY || '';
        this.client = axios.create({
            baseURL: 'https://finnhub.io/api/v1',
            timeout: 10000,
        });
    }
    /**
     * Get real-time quote
     */
    async getQuote(symbol) {
        if (!this.apiKey) {
            logger.warn('Finnhub API key not configured');
            return null;
        }
        const cacheKey = `quote:${symbol}`;
        const cached = this.getFromCache(cacheKey);
        if (cached)
            return cached;
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
            const quote = {
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
        }
        catch (error) {
            logger.error(`Error fetching quote from Finnhub for ${symbol}:`, error.message);
            return null;
        }
    }
    /**
     * Get market news
     */
    async getMarketNews(category = 'general') {
        if (!this.apiKey)
            return [];
        const cacheKey = `market-news:${category}`;
        const cached = this.getFromCache(cacheKey);
        if (cached)
            return cached;
        try {
            const response = await this.client.get('/news', {
                params: {
                    category,
                    token: this.apiKey,
                },
            });
            const news = response.data.map((item) => ({
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
        }
        catch (error) {
            logger.error(`Error fetching market news from Finnhub:`, error.message);
            return [];
        }
    }
    /**
     * Get company news
     */
    async getCompanyNews(symbol, from, to) {
        if (!this.apiKey)
            return [];
        const today = new Date();
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const fromDate = from || lastWeek.toISOString().split('T')[0];
        const toDate = to || today.toISOString().split('T')[0];
        const cacheKey = `company-news:${symbol}:${fromDate}:${toDate}`;
        const cached = this.getFromCache(cacheKey);
        if (cached)
            return cached;
        try {
            const response = await this.client.get('/company-news', {
                params: {
                    symbol,
                    from: fromDate,
                    to: toDate,
                    token: this.apiKey,
                },
            });
            const news = response.data.map((item) => ({
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
        }
        catch (error) {
            logger.error(`Error fetching company news from Finnhub for ${symbol}:`, error.message);
            return [];
        }
    }
    /**
     * Get forex rates
     */
    async getForexRates(base = 'USD') {
        if (!this.apiKey)
            return {};
        const cacheKey = `forex:${base}`;
        const cached = this.getFromCache(cacheKey);
        if (cached)
            return cached;
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
        }
        catch (error) {
            logger.error(`Error fetching forex rates from Finnhub:`, error.message);
            return {};
        }
    }
    /**
     * Get crypto candles (OHLC data)
     */
    async getCryptoCandles(symbol, resolution = 'D', from, to) {
        if (!this.apiKey)
            return null;
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
        }
        catch (error) {
            logger.error(`Error fetching crypto candles from Finnhub:`, error.message);
            return null;
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
export const finnhubClient = new FinnhubClient();
//# sourceMappingURL=finnhub.client.js.map