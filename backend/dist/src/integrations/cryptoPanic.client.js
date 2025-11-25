import axios from 'axios';
import { logger } from '../config/logger.js';
/**
 * CryptoPanic API Client
 * Free tier available (no auth token required for public feed)
 * Provides crypto-focused news aggregation
 */
export class CryptoPanicClient {
    constructor() {
        this.cache = new Map();
        this.cacheDuration = 180000; // 3 minutes cache
        this.apiKey = process.env.CRYPTOPANIC_API_KEY || '';
        this.client = axios.create({
            baseURL: 'https://cryptopanic.com/api/v1',
            timeout: 10000,
        });
    }
    /**
     * Get news posts
     */
    async getPosts(filter, currencies, regions) {
        const cacheKey = `posts:${filter}:${currencies?.join(',')}:${regions?.join(',')}`;
        const cached = this.getFromCache(cacheKey);
        if (cached)
            return cached;
        try {
            const params = {};
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
            const posts = response.data.results.map((item) => ({
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
        }
        catch (error) {
            logger.error('Error fetching posts from CryptoPanic:', error.message);
            return [];
        }
    }
    /**
     * Get trending posts
     */
    async getTrending() {
        return this.getPosts('hot');
    }
    /**
     * Get important news
     */
    async getImportant() {
        return this.getPosts('important');
    }
    /**
     * Get news for specific cryptocurrencies
     */
    async getNewsByCurrency(currencies) {
        return this.getPosts(undefined, currencies);
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
export const cryptoPanicClient = new CryptoPanicClient();
//# sourceMappingURL=cryptoPanic.client.js.map