import axios from 'axios';
import { logger } from '../config/logger.js';
/**
 * GNews API Client
 * Free tier: 100 requests/day
 * Provides news articles with search capabilities
 */
export class GNewsClient {
    constructor() {
        this.cache = new Map();
        this.cacheDuration = 300000; // 5 minutes cache
        this.apiKey = process.env.GNEWS_API_KEY || '';
        this.client = axios.create({
            baseURL: 'https://gnews.io/api/v4',
            timeout: 10000,
        });
    }
    /**
     * Get top headlines
     */
    async getTopHeadlines(category, lang = 'en', max = 10) {
        if (!this.apiKey) {
            logger.warn('GNews API key not configured');
            return [];
        }
        const cacheKey = `headlines:${category}:${lang}:${max}`;
        const cached = this.getFromCache(cacheKey);
        if (cached)
            return cached;
        try {
            const response = await this.client.get('/top-headlines', {
                params: {
                    apikey: this.apiKey,
                    category,
                    lang,
                    max,
                },
            });
            const articles = response.data.articles.map((item) => ({
                title: item.title,
                description: item.description,
                content: item.content,
                url: item.url,
                image: item.image,
                publishedAt: new Date(item.publishedAt),
                source: {
                    name: item.source.name,
                    url: item.source.url,
                },
            }));
            this.setCache(cacheKey, articles);
            logger.debug(`Fetched ${articles.length} headlines from GNews`);
            return articles;
        }
        catch (error) {
            logger.error('Error fetching headlines from GNews:', error.message);
            return [];
        }
    }
    /**
     * Search for news articles
     */
    async search(query, lang = 'en', max = 10, from, to) {
        if (!this.apiKey)
            return [];
        const cacheKey = `search:${query}:${lang}:${max}`;
        const cached = this.getFromCache(cacheKey);
        if (cached)
            return cached;
        try {
            const params = {
                apikey: this.apiKey,
                q: query,
                lang,
                max,
            };
            if (from) {
                params.from = from.toISOString();
            }
            if (to) {
                params.to = to.toISOString();
            }
            const response = await this.client.get('/search', { params });
            const articles = response.data.articles.map((item) => ({
                title: item.title,
                description: item.description,
                content: item.content,
                url: item.url,
                image: item.image,
                publishedAt: new Date(item.publishedAt),
                source: {
                    name: item.source.name,
                    url: item.source.url,
                },
            }));
            this.setCache(cacheKey, articles);
            logger.debug(`Found ${articles.length} articles for "${query}" from GNews`);
            return articles;
        }
        catch (error) {
            logger.error('Error searching news on GNews:', error.message);
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
export const gNewsClient = new GNewsClient();
//# sourceMappingURL=gnews.client.js.map