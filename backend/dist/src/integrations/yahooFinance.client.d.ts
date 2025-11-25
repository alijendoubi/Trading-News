export interface YahooQuote {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    dayHigh: number;
    dayLow: number;
    open: number;
    previousClose: number;
    volume: number;
    marketCap?: number;
    timestamp: Date;
}
/**
 * Yahoo Finance API Client (Unofficial)
 * No API key required - completely free
 * Uses Yahoo Finance's public query endpoints
 */
export declare class YahooFinanceClient {
    private client;
    private cache;
    private cacheDuration;
    constructor();
    /**
     * Get real-time quote for a symbol
     */
    getQuote(symbol: string): Promise<YahooQuote | null>;
    /**
     * Get multiple quotes at once
     */
    getQuotes(symbols: string[]): Promise<YahooQuote[]>;
    /**
     * Get historical chart data
     */
    getChart(symbol: string, interval?: string, range?: string): Promise<any>;
    /**
     * Search for symbols
     */
    search(query: string): Promise<any[]>;
    /**
     * Get trending tickers
     */
    getTrending(region?: string): Promise<any[]>;
    /**
     * Cache helpers
     */
    private getFromCache;
    private setCache;
    clearCache(): void;
}
export declare const yahooFinanceClient: YahooFinanceClient;
//# sourceMappingURL=yahooFinance.client.d.ts.map