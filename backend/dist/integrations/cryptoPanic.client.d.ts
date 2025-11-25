export interface CryptoPanicPost {
    id: number;
    title: string;
    url: string;
    source: {
        title: string;
        region: string;
    };
    published_at: Date;
    domain: string;
    votes: {
        positive: number;
        negative: number;
        important: number;
    };
    currencies: Array<{
        code: string;
        title: string;
    }>;
}
/**
 * CryptoPanic API Client
 * Free tier available (no auth token required for public feed)
 * Provides crypto-focused news aggregation
 */
export declare class CryptoPanicClient {
    private client;
    private apiKey;
    private cache;
    private cacheDuration;
    constructor();
    /**
     * Get news posts
     */
    getPosts(filter?: 'rising' | 'hot' | 'bullish' | 'bearish' | 'important' | 'saved' | 'lol', currencies?: string[], regions?: string[]): Promise<CryptoPanicPost[]>;
    /**
     * Get trending posts
     */
    getTrending(): Promise<CryptoPanicPost[]>;
    /**
     * Get important news
     */
    getImportant(): Promise<CryptoPanicPost[]>;
    /**
     * Get news for specific cryptocurrencies
     */
    getNewsByCurrency(currencies: string[]): Promise<CryptoPanicPost[]>;
    /**
     * Cache helpers
     */
    private getFromCache;
    private setCache;
    clearCache(): void;
}
export declare const cryptoPanicClient: CryptoPanicClient;
//# sourceMappingURL=cryptoPanic.client.d.ts.map