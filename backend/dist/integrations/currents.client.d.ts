export interface CurrentsArticle {
    id: string;
    title: string;
    description: string;
    url: string;
    author: string;
    image: string;
    language: string;
    category: string[];
    published: Date;
}
/**
 * Currents API Client
 * Free tier: 600 requests/day
 * Provides news articles from multiple sources
 */
export declare class CurrentsClient {
    private client;
    private apiKey;
    private cache;
    private cacheDuration;
    constructor();
    /**
     * Get latest news
     */
    getLatestNews(category?: string, language?: string, limit?: number): Promise<CurrentsArticle[]>;
    /**
     * Search news by keywords
     */
    searchNews(keywords: string, language?: string, limit?: number): Promise<CurrentsArticle[]>;
    /**
     * Cache helpers
     */
    private getFromCache;
    private setCache;
    clearCache(): void;
}
export declare const currentsClient: CurrentsClient;
//# sourceMappingURL=currents.client.d.ts.map