import axios from 'axios';
import { logger } from '../config/logger.js';
/**
 * Binance API Client
 * No API key required for public endpoints
 * Completely free real-time crypto data
 */
export class BinanceClient {
    constructor() {
        this.cache = new Map();
        this.cacheDuration = 10000; // 10 seconds cache for real-time data
        this.client = axios.create({
            baseURL: 'https://api.binance.com/api/v3',
            timeout: 10000,
        });
    }
    /**
     * Get 24hr ticker price change statistics
     */
    async get24hrTicker(symbol) {
        const cacheKey = symbol ? `ticker24hr:${symbol}` : 'ticker24hr:all';
        const cached = this.getFromCache(cacheKey);
        if (cached)
            return cached;
        try {
            const response = await this.client.get('/ticker/24hr', {
                params: symbol ? { symbol } : {},
            });
            const data = Array.isArray(response.data) ? response.data : [response.data];
            const tickers = data.map((item) => ({
                symbol: item.symbol,
                price: parseFloat(item.lastPrice),
                priceChange: parseFloat(item.priceChange),
                priceChangePercent: parseFloat(item.priceChangePercent),
                volume: parseFloat(item.volume),
                quoteVolume: parseFloat(item.quoteVolume),
                high: parseFloat(item.highPrice),
                low: parseFloat(item.lowPrice),
                openPrice: parseFloat(item.openPrice),
            }));
            this.setCache(cacheKey, tickers);
            logger.debug(`Fetched ${tickers.length} tickers from Binance`);
            return tickers;
        }
        catch (error) {
            logger.error('Error fetching 24hr ticker from Binance:', error.message);
            return [];
        }
    }
    /**
     * Get current price for symbol(s)
     */
    async getPrice(symbol) {
        const cacheKey = symbol ? `price:${symbol}` : 'price:all';
        const cached = this.getFromCache(cacheKey);
        if (cached)
            return cached;
        try {
            const response = await this.client.get('/ticker/price', {
                params: symbol ? { symbol } : {},
            });
            const data = Array.isArray(response.data) ? response.data : [response.data];
            const prices = {};
            for (const item of data) {
                prices[item.symbol] = parseFloat(item.price);
            }
            this.setCache(cacheKey, prices);
            return prices;
        }
        catch (error) {
            logger.error('Error fetching price from Binance:', error.message);
            return {};
        }
    }
    /**
     * Get kline/candlestick data
     */
    async getKlines(symbol, interval = '1d', limit = 100) {
        const cacheKey = `klines:${symbol}:${interval}:${limit}`;
        const cached = this.getFromCache(cacheKey);
        if (cached)
            return cached;
        try {
            const response = await this.client.get('/klines', {
                params: {
                    symbol,
                    interval,
                    limit,
                },
            });
            const klines = response.data.map((item) => ({
                openTime: new Date(item[0]),
                open: parseFloat(item[1]),
                high: parseFloat(item[2]),
                low: parseFloat(item[3]),
                close: parseFloat(item[4]),
                volume: parseFloat(item[5]),
                closeTime: new Date(item[6]),
            }));
            this.setCache(cacheKey, klines);
            logger.debug(`Fetched ${klines.length} klines for ${symbol} from Binance`);
            return klines;
        }
        catch (error) {
            logger.error(`Error fetching klines from Binance for ${symbol}:`, error.message);
            return [];
        }
    }
    /**
     * Get order book depth
     */
    async getOrderBook(symbol, limit = 100) {
        try {
            const response = await this.client.get('/depth', {
                params: {
                    symbol,
                    limit,
                },
            });
            return {
                lastUpdateId: response.data.lastUpdateId,
                bids: response.data.bids.map((bid) => ({
                    price: parseFloat(bid[0]),
                    quantity: parseFloat(bid[1]),
                })),
                asks: response.data.asks.map((ask) => ({
                    price: parseFloat(ask[0]),
                    quantity: parseFloat(ask[1]),
                })),
            };
        }
        catch (error) {
            logger.error(`Error fetching order book from Binance for ${symbol}:`, error.message);
            return null;
        }
    }
    /**
     * Get exchange info
     */
    async getExchangeInfo() {
        const cacheKey = 'exchange-info';
        const cached = this.getFromCache(cacheKey);
        if (cached)
            return cached;
        try {
            const response = await this.client.get('/exchangeInfo');
            this.setCache(cacheKey, response.data);
            return response.data;
        }
        catch (error) {
            logger.error('Error fetching exchange info from Binance:', error.message);
            return null;
        }
    }
    /**
     * Get top gainers and losers
     */
    async getTopMovers() {
        const allTickers = await this.get24hrTicker();
        // Filter USDT pairs only
        const usdtPairs = allTickers.filter(t => t.symbol.endsWith('USDT'));
        // Sort by price change percent
        const sortedByGain = [...usdtPairs].sort((a, b) => b.priceChangePercent - a.priceChangePercent);
        return {
            gainers: sortedByGain.slice(0, 10),
            losers: sortedByGain.slice(-10).reverse(),
        };
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
export const binanceClient = new BinanceClient();
//# sourceMappingURL=binance.client.js.map