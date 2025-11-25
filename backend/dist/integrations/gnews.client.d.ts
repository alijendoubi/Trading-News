export interface GNewsArticle {
    title: string;
    description: string;
    content: string;
    url: string;
    image: string;
    publishedAt: Date;
    source: {
        name: string;
        url: string;
    };
}
/**
 * GNews API Client
 * Free tier: 100 requests/day
 * Provides news articles with search capabilities
 */
export declare class GNewsClient {
    private client;
    private apiKey;
    private cache;
    private cacheDuration;
    constructor();
    /**
     * Get top headlines
     */
    getTopHeadlines(category?: string, lang?: string, max?: number): Promise<GNewsArticle[]>;
    /**
     * Search for news articles
     */
    search(query: string, lang?: string, max?: number, from?: Date, to?: Date): Promise<GNewsArticle[]>;
    /**
     * Cache helpers
     */
    private getFromCache;
    private setCache;
    clearCache(): void;
}
export declare const gNewsClient: GNewsClient;
//# sourceMappingURL=gnews.client.d.ts.map