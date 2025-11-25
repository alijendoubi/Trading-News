import axios from 'axios';
import { logger } from '../config/logger.js';
/**
 * Twelve Data API Client
 * Free tier: 800 API calls/day
 * Provides stocks, forex, crypto, and more
 */
export class TwelveDataClient {
    constructor() {
        this.cache = new Map();
        this.cacheDuration = 60000; // 1 minute cache
        this.apiKey = process.env.TWELVE_DATA_API_KEY || '';
        this.client = axios.create({
            baseURL: 'https://api.twelvedata.com',
            timeout: 10000,
        });
    }
    /**
     * Get real-time quote for a symbol
     */
    async getQuote(symbol) {
        if (!this.apiKey) {
            logger.warn('Twelve Data API key not configured');
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
                    apikey: this.apiKey,
                },
            });
            const data = response.data;
            if (data.code === 400 || !data.symbol) {
                logger.warn(`Invalid symbol or API error for ${symbol}`);
                return null;
            }
            const quote = {
                symbol: data.symbol,
                name: data.name || symbol,
                price: parseFloat(data.close),
                change: parseFloat(data.change) || 0,
                percentChange: parseFloat(data.percent_change) || 0,
                volume: parseInt(data.volume) || 0,
                timestamp: new Date(),
            };
            this.setCache(cacheKey, quote);
            return quote;
        }
        catch (error) {
            logger.error(`Error fetching quote from Twelve Data for ${symbol}:`, error.message);
            return null;
        }
    }
    /**
     * Get multiple quotes at once
     */
    async getQuotes(symbols) {
        if (!this.apiKey)
            return [];
        const cacheKey = `quotes:${symbols.join(',')}`;
        const cached = this.getFromCache(cacheKey);
        if (cached)
            return cached;
        try {
            const response = await this.client.get('/quote', {
                params: {
                    symbol: symbols.join(','),
                    apikey: this.apiKey,
                },
            });
            const quotes = [];
            const data = Array.isArray(response.data) ? response.data : [response.data];
            for (const item of data) {
                if (item.symbol && item.close) {
                    quotes.push({
                        symbol: item.symbol,
                        name: item.name || item.symbol,
                        price: parseFloat(item.close),
                        change: parseFloat(item.change) || 0,
                        percentChange: parseFloat(item.percent_change) || 0,
                        volume: parseInt(item.volume) || 0,
                        timestamp: new Date(),
                    });
                }
            }
            this.setCache(cacheKey, quotes);
            logger.debug(`Fetched ${quotes.length} quotes from Twelve Data`);
            return quotes;
        }
        catch (error) {
            logger.error('Error fetching quotes from Twelve Data:', error.message);
            return [];
        }
    }
    /**
     * Get time series data (historical prices)
     */
    async getTimeSeries(symbol, interval = '1day', outputsize = 30) {
        if (!this.apiKey)
            return [];
        const cacheKey = `timeseries:${symbol}:${interval}:${outputsize}`;
        const cached = this.getFromCache(cacheKey);
        if (cached)
            return cached;
        try {
            const response = await this.client.get('/time_series', {
                params: {
                    symbol,
                    interval,
                    outputsize,
                    apikey: this.apiKey,
                },
            });
            if (!response.data.values) {
                return [];
            }
            const series = response.data.values.map((item) => ({
                datetime: new Date(item.datetime),
                open: parseFloat(item.open),
                high: parseFloat(item.high),
                low: parseFloat(item.low),
                close: parseFloat(item.close),
                volume: parseInt(item.volume) || 0,
            }));
            this.setCache(cacheKey, series);
            return series;
        }
        catch (error) {
            logger.error(`Error fetching time series from Twelve Data for ${symbol}:`, error.message);
            return [];
        }
    }
    /**
     * Get forex pair rate
     */
    async getForexRate(symbol1, symbol2) {
        if (!this.apiKey)
            return null;
        const pair = `${symbol1}/${symbol2}`;
        const cacheKey = `forex:${pair}`;
        const cached = this.getFromCache(cacheKey);
        if (cached)
            return cached;
        try {
            const response = await this.client.get('/exchange_rate', {
                params: {
                    symbol1,
                    symbol2,
                    apikey: this.apiKey,
                },
            });
            const rate = parseFloat(response.data.rate);
            this.setCache(cacheKey, rate);
            return rate;
        }
        catch (error) {
            logger.error(`Error fetching forex rate for ${pair}:`, error.message);
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
export const twelveDataClient = new TwelveDataClient();
//# sourceMappingURL=twelveData.client.js.map