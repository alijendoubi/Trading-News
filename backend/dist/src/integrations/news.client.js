import axios from 'axios';
import { logger } from '../config/logger.js';
export class NewsClient {
    constructor() {
        this.cache = new Map();
        this.cacheDuration = 300000; // 5 minutes cache
        // RSS feed sources
        this.rssFeedSources = [
            {
                name: 'Bloomberg Markets',
                url: 'https://feeds.bloomberg.com/markets/news.rss',
                category: 'Markets',
            },
            {
                name: 'Reuters Business',
                url: 'https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best',
                category: 'Business',
            },
            {
                name: 'Financial Times',
                url: 'https://www.ft.com/?format=rss',
                category: 'Finance',
            },
        ];
        this.client = axios.create({
            timeout: 10000,
            headers: {
                'User-Agent': 'Trading-Platform/1.0',
            },
        });
    }
    /**
     * Fetch news from NewsAPI if configured, otherwise use RSS feeds
     */
    async getLatestNews(limit = 20) {
        const cacheKey = `news:latest:${limit}`;
        const cached = this.getFromCache(cacheKey);
        if (cached)
            return cached;
        try {
            // Try NewsAPI first if configured
            if (process.env.NEWS_API_KEY) {
                try {
                    const newsApiArticles = await this.fetchFromNewsAPI(limit);
                    if (newsApiArticles.length > 0) {
                        this.setCache(cacheKey, newsApiArticles);
                        logger.debug(`Fetched ${newsApiArticles.length} articles from NewsAPI`);
                        return newsApiArticles;
                    }
                }
                catch (error) {
                    logger.warn('NewsAPI failed, falling back to RSS:', error);
                }
            }
            // Fallback to RSS feeds
            const newsPromises = this.rssFeedSources.map(source => this.fetchFromRSS(source.url, source.name, source.category).catch(err => {
                logger.warn(`Failed to fetch from ${source.name}:`, err.message);
                return [];
            }));
            const allNews = await Promise.all(newsPromises);
            const flattenedNews = allNews.flat();
            // Sort by date and limit
            const sortedNews = flattenedNews
                .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
                .slice(0, limit);
            this.setCache(cacheKey, sortedNews);
            logger.debug(`Fetched ${sortedNews.length} news articles from RSS`);
            return sortedNews;
        }
        catch (error) {
            logger.error('Error fetching latest news:', error);
            return [];
        }
    }
    /**
     * Fetch news from a specific RSS feed
     */
    async fetchFromRSS(feedUrl, sourceName, category) {
        try {
            const response = await this.client.get(feedUrl);
            const xml = response.data;
            // Simple XML parsing (in production, use a proper XML parser like 'fast-xml-parser')
            const articles = [];
            const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
            for (const match of itemMatches) {
                const itemXml = match[1];
                const title = this.extractXmlTag(itemXml, 'title');
                const link = this.extractXmlTag(itemXml, 'link');
                const pubDate = this.extractXmlTag(itemXml, 'pubDate');
                const description = this.extractXmlTag(itemXml, 'description');
                if (title && link) {
                    articles.push({
                        title: this.cleanText(title),
                        url: link.trim(),
                        source: sourceName,
                        publishedAt: pubDate ? new Date(pubDate) : new Date(),
                        category,
                        description: description ? this.cleanText(description).substring(0, 200) : undefined,
                    });
                }
                if (articles.length >= 10)
                    break; // Limit per source
            }
            return articles;
        }
        catch (error) {
            logger.error(`Error fetching RSS feed from ${sourceName}:`, error);
            return [];
        }
    }
    /**
     * Get news by category
     */
    async getNewsByCategory(category, limit = 20) {
        const allNews = await this.getLatestNews(100);
        return allNews
            .filter(article => article.category.toLowerCase() === category.toLowerCase())
            .slice(0, limit);
    }
    /**
     * Search news by keyword
     */
    async searchNews(query, limit = 20) {
        const allNews = await this.getLatestNews(100);
        const lowerQuery = query.toLowerCase();
        return allNews
            .filter(article => article.title.toLowerCase().includes(lowerQuery) ||
            (article.description && article.description.toLowerCase().includes(lowerQuery)))
            .slice(0, limit);
    }
    /**
     * Fetch news from NewsAPI
     */
    async fetchFromNewsAPI(limit = 20) {
        try {
            const response = await this.client.get('https://newsapi.org/v2/everything', {
                params: {
                    q: 'finance OR stock market OR trading OR forex OR cryptocurrency',
                    language: 'en',
                    sortBy: 'publishedAt',
                    pageSize: limit,
                    apiKey: process.env.NEWS_API_KEY,
                },
            });
            if (!response.data.articles) {
                return [];
            }
            return response.data.articles.map((article) => ({
                title: article.title,
                url: article.url,
                source: article.source.name,
                publishedAt: new Date(article.publishedAt),
                category: 'Finance',
                description: article.description,
            }));
        }
        catch (error) {
            logger.error('Error fetching from NewsAPI:', error);
            throw error;
        }
    }
    /**
     * Get mock financial news (fallback when all sources fail)
     */
    getMockNews() {
        return [
            {
                title: 'Global Markets Rally on Strong Economic Data',
                url: 'https://example.com/news/1',
                source: 'Financial Times',
                publishedAt: new Date(),
                category: 'Markets',
                description: 'Stock markets around the world gained as investors reacted positively to stronger-than-expected economic indicators.',
            },
            {
                title: 'Federal Reserve Signals Potential Rate Cuts',
                url: 'https://example.com/news/2',
                source: 'Reuters',
                publishedAt: new Date(Date.now() - 3600000),
                category: 'Economy',
                description: 'The Federal Reserve hinted at possible interest rate reductions in the coming months amid cooling inflation.',
            },
            {
                title: 'Tech Stocks Lead Market Surge',
                url: 'https://example.com/news/3',
                source: 'Bloomberg',
                publishedAt: new Date(Date.now() - 7200000),
                category: 'Technology',
                description: 'Technology sector stocks posted significant gains as AI investments continue to drive growth.',
            },
        ];
    }
    /**
     * Utility: Extract content from XML tag
     */
    extractXmlTag(xml, tagName) {
        const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
        const match = xml.match(regex);
        return match ? match[1] : '';
    }
    /**
     * Utility: Clean HTML and special characters from text
     */
    cleanText(text) {
        return text
            .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
            .replace(/<[^>]+>/g, '')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/\s+/g, ' ')
            .trim();
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
export const newsClient = new NewsClient();
//# sourceMappingURL=news.client.js.map