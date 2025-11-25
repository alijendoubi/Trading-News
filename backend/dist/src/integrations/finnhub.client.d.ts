export interface FinnhubQuote {
    symbol: string;
    current: number;
    change: number;
    percentChange: number;
    high: number;
    low: number;
    open: number;
    previousClose: number;
    timestamp: Date;
}
export interface FinnhubNews {
    category: string;
    datetime: Date;
    headline: string;
    id: number;
    image: string;
    related: string;
    source: string;
    summary: string;
    url: string;
}
export interface FinnhubCompanyNews {
    category: string;
    datetime: Date;
    headline: string;
    image: string;
    source: string;
    summary: string;
    url: string;
}
/**
 * Finnhub API Client
 * Free tier: 60 API calls/minute
 * Provides stocks, forex, crypto, and company news
 */
export declare class FinnhubClient {
    private client;
    private apiKey;
    private cache;
    private cacheDuration;
    constructor();
    /**
     * Get real-time quote
     */
    getQuote(symbol: string): Promise<FinnhubQuote | null>;
    /**
     * Get market news
     */
    getMarketNews(category?: string): Promise<FinnhubNews[]>;
    /**
     * Get company news
     */
    getCompanyNews(symbol: string, from?: string, to?: string): Promise<FinnhubCompanyNews[]>;
    /**
     * Get forex rates
     */
    getForexRates(base?: string): Promise<Record<string, number>>;
    /**
     * Get crypto candles (OHLC data)
     */
    getCryptoCandles(symbol: string, resolution?: string, from?: number, to?: number): Promise<any>;
    /**
     * Cache helpers
     */
    private getFromCache;
    private setCache;
    clearCache(): void;
}
export declare const finnhubClient: FinnhubClient;
//# sourceMappingURL=finnhub.client.d.ts.map