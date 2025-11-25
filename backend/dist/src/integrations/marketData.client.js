import axios from 'axios';
import { logger } from '../config/logger.js';
export class MarketDataClient {
    constructor() {
        this.cache = new Map();
        this.cacheDuration = 60000; // 1 minute cache
        this.coinGeckoClient = axios.create({
            baseURL: 'https://api.coingecko.com/api/v3',
            timeout: 10000,
        });
        this.alphaVantageClient = axios.create({
            baseURL: 'https://www.alphavantage.co',
            timeout: 10000,
        });
        this.cryptoCompareClient = axios.create({
            baseURL: 'https://min-api.cryptocompare.com/data',
            timeout: 10000,
            headers: {
                authorization: process.env.CRYPTOCOMPARE_API_KEY
                    ? `Apikey ${process.env.CRYPTOCOMPARE_API_KEY}`
                    : undefined,
            },
        });
    }
    /**
     * Get cryptocurrency prices from CoinGecko
     */
    async getCryptoPrices(symbols = ['bitcoin', 'ethereum']) {
        const cacheKey = `crypto:${symbols.join(',')}`;
        const cached = this.getFromCache(cacheKey);
        if (cached)
            return cached;
        try {
            const ids = symbols.join(',');
            const response = await this.coinGeckoClient.get('/coins/markets', {
                params: {
                    vs_currency: 'usd',
                    ids,
                    order: 'market_cap_desc',
                    per_page: 100,
                    page: 1,
                    sparkline: false,
                },
            });
            const prices = response.data.map((coin) => ({
                symbol: coin.symbol.toUpperCase(),
                name: coin.name,
                price: coin.current_price,
                change24h: coin.price_change_percentage_24h || 0,
                marketCap: coin.market_cap,
                volume: coin.total_volume,
            }));
            this.setCache(cacheKey, prices);
            logger.debug(`Fetched ${prices.length} crypto prices from CoinGecko`);
            return prices;
        }
        catch (error) {
            logger.error('Error fetching crypto prices from CoinGecko:', error);
            throw new Error('Failed to fetch cryptocurrency prices');
        }
    }
    /**
     * Get single crypto price by ID
     */
    async getCryptoPrice(coinId) {
        const cacheKey = `crypto:single:${coinId}`;
        const cached = this.getFromCache(cacheKey);
        if (cached)
            return cached;
        try {
            const response = await this.coinGeckoClient.get(`/coins/${coinId}`, {
                params: {
                    localization: false,
                    tickers: false,
                    market_data: true,
                    community_data: false,
                    developer_data: false,
                },
            });
            const coin = response.data;
            const price = {
                symbol: coin.symbol.toUpperCase(),
                name: coin.name,
                price: coin.market_data.current_price.usd,
                change24h: coin.market_data.price_change_percentage_24h || 0,
                marketCap: coin.market_data.market_cap.usd,
                volume: coin.market_data.total_volume.usd,
            };
            this.setCache(cacheKey, price);
            return price;
        }
        catch (error) {
            logger.error(`Error fetching crypto price for ${coinId}:`, error);
            return null;
        }
    }
    /**
     * Get multiple crypto prices from Cryptocompare (alternative to CoinGecko)
     */
    async getCryptoPricesFromCryptoCompare(symbols) {
        const cacheKey = `cryptocompare:${symbols.join(',')}`;
        const cached = this.getFromCache(cacheKey);
        if (cached)
            return cached;
        try {
            const response = await this.cryptoCompareClient.get('/pricemultifull', {
                params: {
                    fsyms: symbols.map(s => s.toUpperCase()).join(','),
                    tsyms: 'USD',
                },
            });
            const prices = [];
            const raw = response.data.RAW;
            for (const symbol of symbols) {
                const upperSymbol = symbol.toUpperCase();
                if (raw[upperSymbol] && raw[upperSymbol].USD) {
                    const data = raw[upperSymbol].USD;
                    prices.push({
                        symbol: upperSymbol,
                        name: data.FROMSYMBOL,
                        price: data.PRICE,
                        change24h: data.CHANGEPCT24HOUR,
                        marketCap: data.MKTCAP,
                        volume: data.VOLUME24HOURTO,
                    });
                }
            }
            this.setCache(cacheKey, prices);
            logger.debug(`Fetched ${prices.length} crypto prices from CryptoCompare`);
            return prices;
        }
        catch (error) {
            logger.error('Error fetching from CryptoCompare:', error);
            return [];
        }
    }
    /**
     * Get forex prices using Alpha Vantage (free tier: 5 calls/min, 500/day)
     */
    async getForexPrice(fromCurrency, toCurrency = 'USD') {
        if (!process.env.ALPHA_VANTAGE_API_KEY) {
            logger.warn('Alpha Vantage API key not configured, skipping forex data');
            return null;
        }
        const cacheKey = `forex:${fromCurrency}${toCurrency}`;
        const cached = this.getFromCache(cacheKey);
        if (cached)
            return cached;
        try {
            const response = await this.alphaVantageClient.get('/query', {
                params: {
                    function: 'CURRENCY_EXCHANGE_RATE',
                    from_currency: fromCurrency,
                    to_currency: toCurrency,
                    apikey: process.env.ALPHA_VANTAGE_API_KEY,
                },
            });
            const data = response.data['Realtime Currency Exchange Rate'];
            if (!data) {
                logger.warn('No forex data returned from Alpha Vantage');
                return null;
            }
            const price = {
                symbol: `${fromCurrency}${toCurrency}`,
                price: parseFloat(data['5. Exchange Rate']),
                change: 0, // Alpha Vantage free tier doesn't provide change
                timestamp: new Date(data['6. Last Refreshed']),
            };
            this.setCache(cacheKey, price);
            return price;
        }
        catch (error) {
            logger.error(`Error fetching forex price for ${fromCurrency}/${toCurrency}:`, error);
            return null;
        }
    }
    /**
     * Get trending cryptocurrencies
     */
    async getTrendingCrypto() {
        const cacheKey = 'crypto:trending';
        const cached = this.getFromCache(cacheKey);
        if (cached)
            return cached;
        try {
            const response = await this.coinGeckoClient.get('/search/trending');
            const trending = response.data.coins.slice(0, 10);
            // Fetch detailed data for trending coins
            const ids = trending.map((coin) => coin.item.id).join(',');
            const prices = await this.getCryptoPrices(ids.split(','));
            this.setCache(cacheKey, prices);
            return prices;
        }
        catch (error) {
            logger.error('Error fetching trending crypto:', error);
            return [];
        }
    }
    /**
     * Search for coins
     */
    async searchCoins(query) {
        try {
            const response = await this.coinGeckoClient.get('/search', {
                params: { query },
            });
            return response.data.coins.slice(0, 10).map((coin) => ({
                id: coin.id,
                symbol: coin.symbol,
                name: coin.name,
                thumb: coin.thumb,
            }));
        }
        catch (error) {
            logger.error('Error searching coins:', error);
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
    /**
     * Clear all cache
     */
    clearCache() {
        this.cache.clear();
    }
}
// Singleton instance
export const marketDataClient = new MarketDataClient();
//# sourceMappingURL=marketData.client.js.map