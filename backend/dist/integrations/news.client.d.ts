export interface NewsArticle {
    title: string;
    url: string;
    source: string;
    publishedAt: Date;
    category: string;
    description?: string;
}
export declare class NewsClient {
    private client;
    private cache;
    private cacheDuration;
    private rssFeedSources;
    constructor();
    /**
     * Fetch news from NewsAPI if configured, otherwise use RSS feeds
     */
    getLatestNews(limit?: number): Promise<NewsArticle[]>;
    /**
     * Fetch news from a specific RSS feed
     */
    private fetchFromRSS;
    /**
     * Get news by category
     */
    getNewsByCategory(category: string, limit?: number): Promise<NewsArticle[]>;
    /**
     * Search news by keyword
     */
    searchNews(query: string, limit?: number): Promise<NewsArticle[]>;
    /**
     * Fetch news from NewsAPI
     */
    private fetchFromNewsAPI;
    /**
     * Get mock financial news (fallback when all sources fail)
     */
    getMockNews(): NewsArticle[];
    /**
     * Utility: Extract content from XML tag
     */
    private extractXmlTag;
    /**
     * Utility: Clean HTML and special characters from text
     */
    private cleanText;
    /**
     * Cache helpers
     */
    private getFromCache;
    private setCache;
    /**
     * Clear all cache
     */
    clearCache(): void;
}
export declare const newsClient: NewsClient;
//# sourceMappingURL=news.client.d.ts.map