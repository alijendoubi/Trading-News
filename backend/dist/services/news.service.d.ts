export declare class NewsService {
    /**
     * Get latest news articles
     */
    static getNews(limit?: number, offset?: number, category?: string): Promise<any>;
    /**
     * Search news articles
     */
    static searchNews(query: string, limit?: number): Promise<{
        articles: import("../integrations/news.client.js").NewsArticle[];
        total: number;
    }>;
    /**
     * Get news by category
     */
    static getNewsByCategory(category: string, limit?: number): Promise<{
        articles: import("../integrations/news.client.js").NewsArticle[];
        total: number;
    }>;
    /**
     * Sync news from external API to database (for cron job)
     */
    static syncNews(): Promise<void>;
}
//# sourceMappingURL=news.service.d.ts.map